"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const NEW_CLIENT = "new";
const MAX_TOTAL_FILE_BYTES = 4 * 1024 * 1024;

const inputClass = "mt-2 w-full rounded-sm border border-border bg-background px-4 py-2.5";

type ClientOption = { id: string; name: string; email: string };
type PracticeAreaOption = { slug: string; name: string };

type Props = {
  clients: ClientOption[];
  practiceAreas: PracticeAreaOption[];
};

export function OpenMatterForm({ clients, practiceAreas }: Props) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id ?? NEW_CLIENT);
  const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const isNewClient = clientId === NEW_CLIENT;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    // Everything goes up in one request here, and Vercel rejects bodies
    // over 4.5 MB — so cap the total, matching the server's check.
    const totalBytes = formData
      .getAll("files")
      .reduce((sum, entry) => sum + (entry instanceof File ? entry.size : 0), 0);
    if (totalBytes > MAX_TOTAL_FILE_BYTES) {
      setStatus("error");
      setMessage("Attached files together exceed 4 MB. Attach fewer here and add the rest from the case's Documents tab.");
      return;
    }

    setStatus("submitting");
    setMessage(null);

    try {
      const res = await fetch("/api/matters", { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? "Could not open this case");
      }

      const toPool = formData.get("assignment") === "pool";
      const fileCount = Array.isArray(body.documents) ? body.documents.length : 0;
      form.reset();
      setClientId(clients[0]?.id ?? NEW_CLIENT);
      setStatus("success");
      setMessage(
        `Case ${body.matter?.caseNumber ?? ""} opened` +
          (fileCount > 0 ? ` with ${fileCount} document${fileCount === 1 ? "" : "s"}` : "") +
          (toPool ? " and posted to Available Clients." : " and added to your docket.")
      );
      router.refresh();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not open this case");
    }
  }

  return (
    <Card>
      <h2 className="font-display text-xl">Open a Case</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Assign a new case to a client and attach their documents. Keep it on
        your own docket, or post it to Available Clients for another
        solicitor to take on.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="open-matter-client" className="block text-sm font-medium">
            Client
          </label>
          <select
            id="open-matter-client"
            name="clientId"
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            className={inputClass}
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.email})
              </option>
            ))}
            <option value={NEW_CLIENT}>+ New client…</option>
          </select>
        </div>

        <div>
          <label htmlFor="open-matter-area" className="block text-sm font-medium">
            Practice area
          </label>
          <select
            id="open-matter-area"
            name="practiceArea"
            required
            defaultValue={practiceAreas[0]?.slug}
            className={inputClass}
          >
            {practiceAreas.map((area) => (
              <option key={area.slug} value={area.slug}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        {isNewClient && (
          <>
            <div>
              <label htmlFor="open-matter-new-name" className="block text-sm font-medium">
                New client name
              </label>
              <input
                id="open-matter-new-name"
                name="newClientName"
                type="text"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="open-matter-new-email" className="block text-sm font-medium">
                New client email
              </label>
              <input
                id="open-matter-new-email"
                name="newClientEmail"
                type="email"
                required
                className={inputClass}
              />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label htmlFor="open-matter-title" className="block text-sm font-medium">
            Case title
          </label>
          <input
            id="open-matter-title"
            name="title"
            type="text"
            required
            maxLength={200}
            placeholder="e.g. Estate Administration — Late Mr J. Smith"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="open-matter-files" className="block text-sm font-medium">
            Documents <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <input
            id="open-matter-files"
            name="files"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="mt-2 w-full text-sm text-muted-foreground file:mr-3 file:rounded-sm file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-sm file:text-foreground hover:file:border-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            PDF or Word, up to 5 files and 4 MB in total. Add more later from
            the case&apos;s Documents tab.
          </p>
        </div>

        <div>
          <label htmlFor="open-matter-visibility" className="block text-sm font-medium">
            Document visibility
          </label>
          <select
            id="open-matter-visibility"
            name="visibility"
            defaultValue="client"
            className={inputClass}
          >
            <option value="client">Client-visible</option>
            <option value="internal">Internal only</option>
          </select>
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium">Who handles this case?</legend>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="assignment" value="me" defaultChecked />
              Assign to me
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="assignment" value="pool" />
              Post to Available Clients for another solicitor
            </label>
          </div>
        </fieldset>

        <div className="sm:col-span-2">
          <Button type="submit" variant="primary" disabled={status === "submitting"}>
            <FolderPlus className="mr-1.5 h-4 w-4" aria-hidden />
            {status === "submitting" ? "Opening…" : "Open Case"}
          </Button>
          {status === "error" && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {message}
            </p>
          )}
          {status === "success" && (
            <p role="status" className="mt-2 text-sm text-primary">
              {message}
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
