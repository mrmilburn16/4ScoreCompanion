import { NextResponse } from "next/server";

import { saveIncomingFile } from "@/lib/storage/file-store";
import { validateBatch, validateSingleFile } from "@/lib/validation/files";
import type { UploadRejection, UploadResponse } from "@/types/file";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const incoming = data.getAll("files");
    const files = incoming.filter((entry): entry is File => entry instanceof File);

    const batchError = validateBatch(files.length);
    if (batchError) {
      return NextResponse.json({ error: batchError }, { status: 400 });
    }

    const uploaded: UploadResponse["uploaded"] = [];
    const rejected: UploadRejection[] = [];

    for (const file of files) {
      const fileError = validateSingleFile(file);
      if (fileError) {
        rejected.push({ name: file.name, error: fileError });
        continue;
      }

      const saved = await saveIncomingFile(file);
      uploaded.push(saved);
    }

    const status = uploaded.length > 0 ? 200 : 400;
    return NextResponse.json<UploadResponse>(
      {
        uploaded,
        rejected,
      },
      { status },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Upload failed unexpectedly.",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
