import { promises as fs } from "node:fs";

import { NextResponse } from "next/server";

import { getStoredFileById, resolveStoredFilePath } from "@/lib/storage/file-store";

function encodeContentDisposition(fileName: string) {
  return `attachment; filename="${fileName.replace(/"/g, "")}"`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const target = await getStoredFileById(id);
  if (!target) {
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  }

  const absolutePath = resolveStoredFilePath(target.storedName);
  try {
    const data = await fs.readFile(absolutePath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": target.contentType || "application/octet-stream",
        "Content-Disposition": encodeContentDisposition(target.originalName),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ error: "Stored file is missing." }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: "Could not download file.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
