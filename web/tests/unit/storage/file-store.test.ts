import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  deleteStoredFile,
  ensureStorage,
  getStoredFileById,
  listStoredFiles,
  resolveStoredFilePath,
  saveIncomingFile,
} from "../../../src/lib/storage/file-store";

describe("file store", () => {
  const tempRoot = path.join(os.tmpdir(), `forscore-companion-test-${Date.now()}`);

  beforeAll(async () => {
    process.env.FILE_STORE_ROOT = tempRoot;
    await ensureStorage();
  });

  afterAll(async () => {
    await fs.rm(tempRoot, { recursive: true, force: true });
    delete process.env.FILE_STORE_ROOT;
  });

  it("saves, lists, retrieves and deletes files", async () => {
    const file = new File([new Uint8Array([1, 2, 3, 4])], "etude.pdf", {
      type: "application/pdf",
    });

    const saved = await saveIncomingFile(file);
    expect(saved.extension).toBe("pdf");
    expect(saved.id).toBeTruthy();

    const listed = await listStoredFiles();
    expect(listed.some((entry) => entry.id === saved.id)).toBe(true);

    const byId = await getStoredFileById(saved.id);
    expect(byId?.originalName).toBe("etude.pdf");

    const absolutePath = resolveStoredFilePath(saved.storedName);
    const stat = await fs.stat(absolutePath);
    expect(stat.size).toBe(4);

    const deleted = await deleteStoredFile(saved.id);
    expect(deleted).toBe(true);
  });
});
