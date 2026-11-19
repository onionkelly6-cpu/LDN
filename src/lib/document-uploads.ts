import {
  addDocument,
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  type DemoDocument,
  type DemoDocumentVisibility,
} from "@/lib/demo-documents";
import { isFileStorageConfigured, saveDocumentFile } from "@/lib/storage/blob";

/**
 * Upload rules shared by every route that accepts files — the per-matter
 * Documents tab (`/api/matters/[id]/documents`) and opening a new case with
 * files attached (`/api/matters`). Kept in one place so the two can't drift
 * on which types/sizes are allowed.
 */
export const MAX_FILES_PER_REQUEST = 5;

export function sanitizeFilename(name: string): string {
  const trimmed = name.trim().slice(0, 150);
  return trimmed.replace(/[^\w.\- ()&]/g, "_") || "document";
}

export function parseVisibility(raw: FormDataEntryValue | null): DemoDocumentVisibility {
  return raw === "client" ? "client" : "internal";
}

/** Returns a user-facing error for the first invalid file, or null if all pass. */
export function validateUploads(files: File[]): string | null {
  if (files.length > MAX_FILES_PER_REQUEST) {
    return `Attach at most ${MAX_FILES_PER_REQUEST} files at a time`;
  }

  for (const file of files) {
    if (!ALLOWED_UPLOAD_MIME_TYPES[file.type]) {
      return `"${file.name}": only PDF and Word documents (.pdf, .doc, .docx) are accepted`;
    }
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return `"${file.name}" exceeds the 4 MB upload limit`;
    }
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_UPLOAD_SIZE_BYTES) {
    return "Files together exceed 4 MB — upload them one at a time instead";
  }

  return null;
}

/**
 * Saves each file to private Blob storage when it's connected and records
 * its metadata; without storage, records metadata-only placeholders (the
 * pre-storage behavior). Shared by attorney/client uploads on a matter and
 * by opening a new case with files attached.
 */
export async function storeUploadedDocuments(params: {
  matterId: string;
  files: File[];
  visibility: DemoDocumentVisibility;
  uploadedBy: string;
}): Promise<DemoDocument[]> {
  const useBlob = isFileStorageConfigured();

  return Promise.all(
    params.files.map(async (file) => {
      const filename = sanitizeFilename(file.name);
      const blobPathname = useBlob
        ? await saveDocumentFile({ matterId: params.matterId, filename, file })
        : undefined;

      return addDocument({
        matterId: params.matterId,
        filename,
        mimeType: file.type,
        visibility: params.visibility,
        sizeBytes: file.size,
        uploadedBy: params.uploadedBy,
        blobPathname,
      });
    })
  );
}

/** Non-empty `File` entries for `field` — an untouched file input posts one empty File. */
export function getUploadedFiles(formData: FormData, field: string): File[] {
  return formData
    .getAll(field)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0 && entry.name !== "");
}
