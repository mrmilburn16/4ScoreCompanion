import { NextResponse } from "next/server";

import { deleteStoredFile, getStoredFileById } from "@/lib/storage/file-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const target = await getStoredFileById(id);

  if (!target) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  return NextResponse.json({ file: target });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const deleted = await deleteStoredFile(id);

  if (!deleted) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
