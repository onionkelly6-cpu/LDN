import {
  ALLOWED_UPLOAD_MIME_TYPES,
  MAX_UPLOAD_SIZE_BYTES,
  type DemoDocumentVisibility,
} from "@/lib/demo-documents";

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
      return `"${file.name}" exceeds the 10 MB upload limit`;
    }
  }

  return null;
}

/** Non-empty `File` entries for `field` — an untouched file input posts one empty File. */
export function getUploadedFiles(formData: FormData, field: string): File[] {
  return formData
    .getAll(field)
    .filter((entry): entry is File => entry instanceof File && entry.size > 0 && entry.name !== "");
}
