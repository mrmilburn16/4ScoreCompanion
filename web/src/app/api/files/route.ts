import { NextResponse } from "next/server";

import { listStoredFiles } from "@/lib/storage/file-store";

export async function GET() {
  try {
    const files = await listStoredFiles();
    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Could not read your library.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
