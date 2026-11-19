import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  createClient,
  getClientByEmail,
  getClientById,
  type DemoClient,
} from "@/lib/demo-clients";
import { createMatter } from "@/lib/demo-matters";
import { addDocument } from "@/lib/demo-documents";
import { practiceAreas } from "@/lib/content/practice-areas";
import { generateCaseNumber } from "@/lib/case-numbers";
import {
  getUploadedFiles,
  parseVisibility,
  sanitizeFilename,
  validateUploads,
} from "@/lib/document-uploads";

const NEW_CLIENT = "new";

const openMatterSchema = z
  .object({
    clientId: z.string().trim().min(1, "Choose a client"),
    newClientName: z.string().trim().max(120, "Client name is too long").optional(),
    newClientEmail: z.string().trim().max(254, "Client email is too long").optional(),
    title: z.string().trim().min(1, "Case title is required").max(200),
    practiceArea: z.string().trim().min(1, "Choose a practice area"),
    assignment: z.enum(["me", "pool"]),
  })
  .superRefine((data, ctx) => {
    if (data.clientId !== NEW_CLIENT) return;
    if (!data.newClientName) {
      ctx.addIssue({ code: "custom", path: ["newClientName"], message: "New client name is required" });
    }
    if (!z.string().email().safeParse(data.newClientEmail).success) {
      ctx.addIssue({ code: "custom", path: ["newClientEmail"], message: "Enter a valid client email" });
    }
  });

function formString(formData: FormData, field: string): string | undefined {
  const value = formData.get(field);
  return typeof value === "string" ? value : undefined;
}

/**
 * An attorney opens a case for a client directly from `/firm/matters` —
 * either an existing client record or a new one — optionally attaching
 * documents in the same step. The case is either assigned to the opening
 * attorney, or posted to the unclaimed pool ("Available Clients") so a
 * different attorney can select that client with "Assign to Me". Same
 * attorney-only gate as Lead → Convert to Matter; granting the client a
 * portal login is still the separate step at `/firm/clients`.
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.user.role !== "attorney") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form submission" }, { status: 400 });
  }

  const parsed = openMatterSchema.safeParse({
    clientId: formString(formData, "clientId"),
    newClientName: formString(formData, "newClientName"),
    newClientEmail: formString(formData, "newClientEmail"),
    title: formString(formData, "title"),
    practiceArea: formString(formData, "practiceArea"),
    assignment: formString(formData, "assignment"),
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const areaMeta = practiceAreas.find((area) => area.slug === parsed.data.practiceArea);
  if (!areaMeta) {
    return NextResponse.json({ error: "Unknown practice area" }, { status: 400 });
  }

  // Validate every attachment before writing anything, so a bad file never
  // leaves behind a half-opened case with no documents.
  const files = getUploadedFiles(formData, "files");
  const uploadError = validateUploads(files);
  if (uploadError) {
    return NextResponse.json({ error: uploadError }, { status: 400 });
  }

  let client: DemoClient | undefined;
  if (parsed.data.clientId === NEW_CLIENT) {
    const email = parsed.data.newClientEmail ?? "";
    // `createClient` quietly reuses a record with the same email — fine for
    // a returning lead, but here the attorney typed a specific new person,
    // so attaching the case to someone else's record would be the wrong file.
    const existing = await getClientByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: `${existing.name} already has this email. Select them from the client list instead.` },
        { status: 409 }
      );
    }
    client = await createClient({ name: parsed.data.newClientName ?? "", email });
  } else {
    client = await getClientById(parsed.data.clientId);
  }
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const attorneyName = session.user.name ?? "Unknown";
  const matter = await createMatter({
    caseNumber: generateCaseNumber(areaMeta.code),
    title: parsed.data.title,
    practiceArea: areaMeta.name,
    clientId: client.id,
    attorney: parsed.data.assignment === "me" ? attorneyName : null,
  });

  const visibility = parseVisibility(formData.get("visibility"));
  const documents = await Promise.all(
    files.map((file) =>
      addDocument({
        matterId: matter.id,
        filename: sanitizeFilename(file.name),
        mimeType: file.type,
        visibility,
        sizeBytes: file.size,
        uploadedBy: attorneyName,
      })
    )
  );

  return NextResponse.json({ matter, documents }, { status: 201 });
}
