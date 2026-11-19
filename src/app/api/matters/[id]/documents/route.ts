import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getMatterById } from "@/lib/demo-matters";
import { getClientByEmail } from "@/lib/demo-clients";
import {
  getUploadedFiles,
  parseVisibility,
  storeUploadedDocuments,
  validateUploads,
} from "@/lib/document-uploads";

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Props) {
  const { id: matterId } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const matter = await getMatterById(matterId);
  if (!matter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Same two parties as the message thread: the assigned attorney, or the
  // client who owns this matter. Staff/admin have no access to case data.
  const role = session.user.role;
  const isAssignedAttorney = role === "attorney" && matter.attorney === session.user.name;
  const owningClient =
    role === "client" && session.user.email ? await getClientByEmail(session.user.email) : undefined;
  const isOwningClient = owningClient?.id === matter.clientId;

  if (!isAssignedAttorney && !isOwningClient) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const files = getUploadedFiles(formData, "file");

  if (files.length === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const uploadError = validateUploads(files);
  if (uploadError) {
    return NextResponse.json({ error: uploadError }, { status: 400 });
  }

  // A client's upload is always shared with their attorney — "internal"
  // would hide it from the client themselves, and only the attorney gets
  // to decide what stays firm-internal.
  const visibility = isAssignedAttorney ? parseVisibility(formData.get("visibility")) : "client";

  const documents = await storeUploadedDocuments({
    matterId,
    files,
    visibility,
    uploadedBy: session.user.name ?? (isAssignedAttorney ? "Unknown" : "Client"),
  });

  // The storage pathname stays server-side; the browser only ever needs
  // the document id (downloads go through /api/documents/[id]/download).
  const publicDocuments = documents.map(({ blobPathname: _blobPathname, ...doc }) => doc);
  return NextResponse.json({ documents: publicDocuments }, { status: 201 });
}
