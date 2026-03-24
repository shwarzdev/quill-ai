import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

type Params = { params: { id: string } };

async function getAuthedDoc(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Unauthorized", status: 401 };

  const userId = (session.user as any).id;
  const doc = await db.document.findUnique({ where: { id } });

  if (!doc) return { error: "Not found", status: 404 };
  if (doc.userId !== userId) return { error: "Forbidden", status: 403 };

  return { doc, userId };
}

export async function GET(_req: Request, { params }: Params) {
  const result = await getAuthedDoc(params.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ document: result.doc });
}

export async function PATCH(req: Request, { params }: Params) {
  const result = await getAuthedDoc(params.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  const body = await req.json();
  const { title, content } = body;

  const updated = await db.document.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
    },
  });

  return NextResponse.json({ document: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const result = await getAuthedDoc(params.id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  await db.document.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
