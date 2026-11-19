import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { getMatterById, releaseMatter } from "@/lib/demo-matters";

type Props = {
  params: Promise<{ id: string }>;
};

/**
 * Hands a matter back to the unclaimed pool so another attorney can select
 * that client with "Assign to Me" (`/api/matters/[id]/assign`). Only the
 * attorney currently assigned to it can release it — nobody can pull a
 * matter away from a colleague.
 */
export async function POST(request: NextRequest, { params }: Props) {
  const { id: matterId } = await params;
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.user.role !== "attorney") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const matter = await getMatterById(matterId);
  if (!matter) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (matter.attorney !== session.user.name) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await releaseMatter(matterId);
  return NextResponse.json({ matter: updated }, { status: 200 });
}
