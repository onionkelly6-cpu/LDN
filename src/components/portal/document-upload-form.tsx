"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mirrors MAX_UPLOAD_SIZE_BYTES on the server (Vercel rejects request
// bodies over 4.5 MB), checked here too so an oversized file gets a clear
// message instead of a generic upload failure.
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_FILES = 5;

type Props = {
  matterId: string;
  // Attorneys choose internal vs client-visible; a client's own uploads
  // are always shared with their attorney (enforced server-side too).
  canChooseVisibility?: boolean;
};

export function DocumentUploadForm({ matterId, canChooseVisibility = true }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const files = formData
      .getAll("file")
      .filter((entry): entry is File => entry instanceof File && entry.name !== "");
    const visibility = formData.get("visibility");

    if (files.length === 0) {
      setStatus("error");
      setError("Choose at least one file to upload.");
      return;
    }
    if (files.length > MAX_FILES) {
      setStatus("error");
      setError(`Choose at most ${MAX_FILES} files at a time.`);
      return;
    }
    const oversized = files.find((file) => file.size > MAX_FILE_BYTES);
    if (oversized) {
      setStatus("error");
      setError(`"${oversized.name}" is over the 4 MB limit.`);
      return;
    }

    setStatus("uploading");
    setError(null);

    // One request per file keeps each request under the 4.5 MB body limit.
    let uploaded = 0;
    try {
      for (const file of files) {
        setProgress(`Uploading ${uploaded + 1} of ${files.length}…`);
        const body = new FormData();
        body.append("file", file);
        if (typeof visibility === "string") body.append("visibility", visibility);

        const res = await fetch(`/api/matters/${matterId}/documents`, { method: "POST", body });
        if (!res.ok) {
          const resBody = await res.json().catch(() => ({}));
          throw new Error(`"${file.name}": ${resBody.error ?? "upload failed"}`);
        }
        uploaded += 1;
      }

      form.reset();
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProgress(null);
      if (uploaded > 0) router.refresh();
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-sm border border-dashed border-border p-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div className="flex-1">
        <label htmlFor="file" className="block text-sm font-medium">
          Upload documents
        </label>
        <input
          id="file"
          name="file"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="mt-2 w-full text-sm text-muted-foreground file:mr-3 file:rounded-sm file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-sm file:text-foreground hover:file:border-primary"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          PDF or Word documents, up to 4 MB each, 5 at a time.
          {!canChooseVisibility && " Shared with your solicitor."}
        </p>
      </div>

      {canChooseVisibility && (
        <div>
          <label htmlFor="visibility" className="block text-sm font-medium">
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            defaultValue="internal"
            className="mt-2 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground sm:w-auto"
          >
            <option value="internal">Internal only</option>
            <option value="client">Client-visible</option>
          </select>
        </div>
      )}

      <Button type="submit" variant="primary" disabled={status === "uploading"}>
        <UploadCloud className="mr-1.5 h-4 w-4" aria-hidden />
        {status === "uploading" ? progress ?? "Uploading…" : "Upload"}
      </Button>

      {status === "error" && (
        <p role="alert" className="w-full text-sm text-destructive sm:w-auto">
          {error}
        </p>
      )}
    </form>
  );
}
