import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { addDocument } from "@/lib/demo-documents";
import { getMatterById } from "@/lib/demo-matters";
import {
  getUploadedFiles,
  parseVisibility,
  sanitizeFilename,
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

  // Sharing a resource on a matter is the assigned attorney's action only —
  // not staff/admin, and not a client uploading to their own case.
  if (session.user.role !== "attorney" || matter.attorney !== session.user.name) {
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

  const visibility = parseVisibility(formData.get("visibility"));

  // No file bytes are stored anywhere — see the module comment in
  // demo-documents/data.ts. Downloads of these documents will serve
  // generated placeholder content instead of the real upload.
  const documents = await Promise.all(
    files.map((file) =>
      addDocument({
        matterId,
        filename: sanitizeFilename(file.name),
        mimeType: file.type,
        visibility,
        sizeBytes: file.size,
        uploadedBy: session.user.name ?? "Unknown",
      })
    )
  );

  return NextResponse.json({ documents }, { status: 201 });
}
