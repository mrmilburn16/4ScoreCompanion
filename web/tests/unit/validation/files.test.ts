import {
  formatBytes,
  getExtension,
  isSupportedExtension,
  validateBatch,
  validateSingleFile,
} from "../../../src/lib/validation/files";

describe("file validation", () => {
  it("extracts lower-case extension", () => {
    expect(getExtension("Moonlight.PDF")).toBe("pdf");
  });

  it("accepts supported extension", () => {
    expect(isSupportedExtension("4ss")).toBe(true);
    expect(isSupportedExtension("png")).toBe(false);
  });

  it("validates file batches", () => {
    expect(validateBatch(1)).toBeNull();
    expect(validateBatch(0)).toContain("at least one");
    expect(validateBatch(22)).toContain("up to");
  });

  it("rejects unsupported files", () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    expect(validateSingleFile(file)).toContain("Unsupported format");
  });

  it("formats byte counts correctly", () => {
    expect(formatBytes(1)).toBe("1 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1024 * 1024 * 8)).toBe("8.0 MB");
  });
});
