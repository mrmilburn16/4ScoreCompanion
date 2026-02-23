import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { getExtension, isSupportedExtension } from "@/lib/validation/files";
import type { StoreIndex } from "@/lib/storage/types";
import type { StoredFileRecord } from "@/types/file";

const EMPTY_INDEX: StoreIndex = { files: [] };

function getStoreRoot() {
  return process.env.FILE_STORE_ROOT
    ? path.resolve(process.env.FILE_STORE_ROOT)
    : path.join(process.cwd(), "data");
}

function getUploadsDir() {
  return path.join(getStoreRoot(), "uploads");
}

function getIndexFilePath() {
  return path.join(getStoreRoot(), "index.json");
}

function sanitizeFileNameSegment(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

async function readIndex(): Promise<StoreIndex> {
  const indexPath = getIndexFilePath();
  try {
    const raw = await fs.readFile(indexPath, "utf8");
    const parsed = JSON.parse(raw) as StoreIndex;
    if (!Array.isArray(parsed.files)) {
      return EMPTY_INDEX;
    }
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return EMPTY_INDEX;
    }

    throw error;
  }
}

async function writeIndex(index: StoreIndex) {
  await ensureStorage();
  await fs.writeFile(getIndexFilePath(), JSON.stringify(index, null, 2), "utf8");
}

export async function ensureStorage() {
  await fs.mkdir(getUploadsDir(), { recursive: true });
}

function buildStoredName(originalName: string) {
  const extension = getExtension(originalName);
  const baseName = originalName.slice(0, Math.max(0, originalName.length - extension.length - 1));
  const sanitizedBase = sanitizeFileNameSegment(baseName) || "score";
  const suffix = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  return extension ? `${sanitizedBase}-${suffix}.${extension}` : `${sanitizedBase}-${suffix}`;
}

export async function saveIncomingFile(file: File): Promise<StoredFileRecord> {
  const extension = getExtension(file.name);
  if (!isSupportedExtension(extension)) {
    throw new Error(`Unsupported file extension: ${extension || "unknown"}`);
  }

  await ensureStorage();
  const storedName = buildStoredName(file.name);
  const id = randomUUID();
  const targetPath = path.join(getUploadsDir(), storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(targetPath, buffer);

  const record: StoredFileRecord = {
    id,
    originalName: file.name,
    storedName,
    extension,
    contentType: file.type || "application/octet-stream",
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };

  const current = await readIndex();
  current.files.push(record);
  await writeIndex(current);

  return record;
}

export async function listStoredFiles(): Promise<StoredFileRecord[]> {
  const current = await readIndex();
  return [...current.files].sort(
    (left, right) => new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime(),
  );
}

export async function getStoredFileById(id: string): Promise<StoredFileRecord | null> {
  const current = await readIndex();
  return current.files.find((file) => file.id === id) ?? null;
}

export async function deleteStoredFile(id: string): Promise<boolean> {
  const current = await readIndex();
  const target = current.files.find((file) => file.id === id);
  if (!target) {
    return false;
  }

  current.files = current.files.filter((file) => file.id !== id);
  await writeIndex(current);

  const absolutePath = path.join(getUploadsDir(), target.storedName);
  try {
    await fs.unlink(absolutePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return true;
}

export function resolveStoredFilePath(storedName: string) {
  return path.join(getUploadsDir(), storedName);
}
