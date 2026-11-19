import { get, put } from "@vercel/blob";

/**
 * Real file storage for uploaded case documents: a *private* Vercel Blob
 * store. Private blobs have no public URL — the only way to read one is a
 * server-side `get()` with the store's token — so files are always served
 * through `/api/documents/[id]/download`, which checks the signed link,
 * the session, and matter ownership before streaming anything.
 *
 * Connecting a Blob store to the Vercel project sets `BLOB_READ_WRITE_TOKEN`
 * (or `BLOB_STORE_ID` for OIDC auth). Until one is connected, uploads fall
 * back to metadata-only placeholders, exactly as before real storage existed.
 */
export function isFileStorageConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

export async function saveDocumentFile(params: {
  matterId: string;
  filename: string;
  file: File;
}): Promise<string> {
  const blob = await put(
    `matters/${params.matterId}/${params.filename}`,
    Buffer.from(await params.file.arrayBuffer()),
    {
      access: "private",
      addRandomSuffix: true,
      contentType: params.file.type,
    }
  );
  return blob.pathname;
}

export async function readDocumentFile(
  pathname: string
): Promise<{ stream: ReadableStream<Uint8Array>; size: number } | null> {
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200) return null;
  return { stream: result.stream, size: result.blob.size };
}
