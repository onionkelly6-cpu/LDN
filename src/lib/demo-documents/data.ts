import { redis } from "@/lib/redis";
import { bumpMatterVersion } from "@/lib/demo-matters";

/**
 * DEMO-ONLY document metadata, backed by Upstash Redis instead of an
 * in-memory array. The four seed documents reference real files committed
 * under `data/demo-documents/` (read-only static assets are fine to ship
 * inside the deployed bundle, even on Vercel). Uploaded files go to a
 * private Vercel Blob store (`src/lib/storage/blob.ts`) and are recorded
 * here with their `blobPathname`; if no store is connected yet, an upload
 * is metadata only (`isPlaceholder`) and downloads serve generated
 * placeholder content, since serverless functions have no writable disk.
 */
export type DemoDocumentVisibility = "internal" | "client";

// Upload is scoped to PDF and Word documents only, per the intake
// requirement — images/other types can still be seeded as demo data but
// aren't accepted through the upload endpoint.
export const ALLOWED_UPLOAD_MIME_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};

// Vercel Functions reject request bodies over 4.5 MB before they reach the
// route, so uploads are capped just under that — per file *and* per request.
export const MAX_UPLOAD_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

export interface DemoDocument {
  id: string;
  matterId: string;
  filename: string;
  // Only meaningful when `isPlaceholder` is false: the filename under
  // `data/demo-documents/` this seed document's real bytes live at.
  storedAs: string;
  mimeType: string;
  visibility: DemoDocumentVisibility;
  sizeLabel: string;
  uploadedBy: string;
  uploadedAt: string;
  // true for anything uploaded while no file storage was connected — no
  // real file was ever written, downloads serve generated placeholder
  // content instead.
  isPlaceholder: boolean;
  // Set when the real file bytes live in the private Vercel Blob store
  // (`src/lib/storage/blob.ts`); the download route streams from here.
  blobPathname?: string;
}

const DOCUMENT_KEY = (id: string) => `document:${id}`;
const MATTER_INDEX_KEY = (matterId: string) => `documents:by-matter:${matterId}`;
const ALL_INDEX_KEY = "documents:ids";

const seedDocuments: DemoDocument[] = [
  {
    id: "doc-1",
    matterId: "1",
    filename: "Client Care Letter.docx",
    storedAs: "engagement-letter.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    visibility: "client",
    sizeLabel: "2.3 KB",
    uploadedBy: "Eleanor Hartwell",
    uploadedAt: "Jul 2, 2026",
    isPlaceholder: false,
  },
  {
    id: "doc-2",
    matterId: "1",
    filename: "Solicitor File Note.pdf",
    storedAs: "case-notes.pdf",
    mimeType: "application/pdf",
    visibility: "internal",
    sizeLabel: "1.0 KB",
    uploadedBy: "Eleanor Hartwell",
    uploadedAt: "Jul 15, 2026",
    isPlaceholder: false,
  },
  {
    id: "doc-3",
    matterId: "3",
    filename: "Property Valuation Photo.png",
    storedAs: "property-photo.png",
    mimeType: "image/png",
    visibility: "client",
    sizeLabel: "1.6 KB",
    uploadedBy: "Eleanor Hartwell",
    uploadedAt: "Jul 10, 2026",
    isPlaceholder: false,
  },
  {
    id: "doc-4",
    matterId: "4",
    filename: "Mediation Position Statement.pdf",
    storedAs: "case-notes.pdf",
    mimeType: "application/pdf",
    visibility: "internal",
    sizeLabel: "1.0 KB",
    uploadedBy: "Eleanor Hartwell",
    uploadedAt: "Jul 18, 2026",
    isPlaceholder: false,
  },
];

async function ensureSeeded(): Promise<void> {
  const count = await redis.scard(ALL_INDEX_KEY);
  if (count > 0) return;

  await Promise.all(seedDocuments.map((doc) => redis.set(DOCUMENT_KEY(doc.id), doc)));
  await redis.sadd(ALL_INDEX_KEY, seedDocuments[0].id, ...seedDocuments.slice(1).map((d) => d.id));

  const idsByMatter = new Map<string, string[]>();
  for (const doc of seedDocuments) {
    const ids = idsByMatter.get(doc.matterId) ?? [];
    ids.push(doc.id);
    idsByMatter.set(doc.matterId, ids);
  }
  await Promise.all(
    Array.from(idsByMatter.entries()).map(([matterId, ids]) =>
      redis.sadd(MATTER_INDEX_KEY(matterId), ids[0], ...ids.slice(1))
    )
  );
}

export async function getDocumentsForMatter(matterId: string): Promise<DemoDocument[]> {
  await ensureSeeded();
  const ids = await redis.smembers(MATTER_INDEX_KEY(matterId));
  if (ids.length === 0) return [];
  const docs = await Promise.all(ids.map((id) => redis.get<DemoDocument>(DOCUMENT_KEY(id))));
  return docs.filter((doc): doc is DemoDocument => doc !== null);
}

export async function getDocumentById(id: string): Promise<DemoDocument | undefined> {
  await ensureSeeded();
  const doc = await redis.get<DemoDocument>(DOCUMENT_KEY(id));
  return doc ?? undefined;
}

function formatSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Records a newly uploaded document. With `blobPathname` the real file is
 * already in private Blob storage; without it (no store connected) this is
 * metadata only and downloads serve a generated placeholder. Also bumps
 * the matter's version counter so `LiveMatterUpdates` polling picks up the
 * change on the other side (see `bumpMatterVersion` in demo-matters.ts).
 */
export async function addDocument(params: {
  matterId: string;
  filename: string;
  mimeType: string;
  visibility: DemoDocumentVisibility;
  sizeBytes: number;
  uploadedBy: string;
  blobPathname?: string;
}): Promise<DemoDocument> {
  const doc: DemoDocument = {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    matterId: params.matterId,
    filename: params.filename,
    storedAs: "",
    mimeType: params.mimeType,
    visibility: params.visibility,
    sizeLabel: formatSizeLabel(params.sizeBytes),
    uploadedBy: params.uploadedBy,
    uploadedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    isPlaceholder: !params.blobPathname,
    ...(params.blobPathname ? { blobPathname: params.blobPathname } : {}),
  };

  await redis.set(DOCUMENT_KEY(doc.id), doc);
  await redis.sadd(ALL_INDEX_KEY, doc.id);
  await redis.sadd(MATTER_INDEX_KEY(doc.matterId), doc.id);
  await bumpMatterVersion(doc.matterId);

  return doc;
}
