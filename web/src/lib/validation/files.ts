import { z } from "zod";

import type { SupportedExtension } from "@/types/file";

export const ALLOWED_EXTENSIONS: SupportedExtension[] = ["pdf", "4sc", "4ss"];
export const MAX_FILE_SIZE_BYTES = 40 * 1024 * 1024;
export const MAX_FILE_COUNT = 20;

const uploadBatchSchema = z.object({
  fileCount: z
    .number()
    .min(1, "Choose at least one file.")
    .max(MAX_FILE_COUNT, `You can upload up to ${MAX_FILE_COUNT} files at once.`),
});

export function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isSupportedExtension(extension: string): extension is SupportedExtension {
  return ALLOWED_EXTENSIONS.includes(extension as SupportedExtension);
}

export function validateBatch(fileCount: number): string | null {
  const result = uploadBatchSchema.safeParse({ fileCount });
  if (!result.success) {
    return result.error.issues[0]?.message ?? "Invalid file selection.";
  }

  return null;
}

export function validateSingleFile(file: File): string | null {
  const extension = getExtension(file.name);
  if (!isSupportedExtension(extension)) {
    return `Unsupported format for "${file.name}". Accepted formats: ${ALLOWED_EXTENSIONS.map((item) => item.toUpperCase()).join(", ")}.`;
  }

  if (file.size <= 0) {
    return `"${file.name}" appears to be empty.`;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `"${file.name}" exceeds the ${formatBytes(MAX_FILE_SIZE_BYTES)} limit.`;
  }

  return null;
}

export function formatBytes(value: number): string {
  if (!Number.isFinite(value) || value < 0) {
    return "0 B";
  }

  if (value < 1024) {
    return `${value} B`;
  }

  const units = ["KB", "MB", "GB"];
  let size = value / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}
