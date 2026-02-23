"use client";

import { ChangeEvent, DragEvent, useId, useRef, useState } from "react";

import { ALLOWED_EXTENSIONS, MAX_FILE_COUNT, MAX_FILE_SIZE_BYTES, formatBytes } from "@/lib/validation/files";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type UploadDropzoneProps = {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  isUploading?: boolean;
};

function toFileList(files: FileList | null) {
  return files ? Array.from(files) : [];
}

export function UploadDropzone({ onFilesSelected, disabled, isUploading }: UploadDropzoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickFiles = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFilesSelected(toFileList(event.target.files));
    event.target.value = "";
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) {
      return;
    }

    const files = toFileList(event.dataTransfer.files);
    onFilesSelected(files);
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/70 p-6 shadow-xl shadow-zinc-300/20 backdrop-blur md:p-8 dark:border-zinc-800 dark:bg-zinc-950/70 dark:shadow-black/20",
        isDragging &&
          "border-sky-400 bg-gradient-to-br from-sky-100/70 via-blue-100/40 to-indigo-100/40 dark:from-sky-900/35 dark:via-blue-900/20 dark:to-indigo-900/25",
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      aria-label="Upload files by drag and drop or file picker"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.18),transparent_52%)]" />

      <div className="relative flex flex-col items-start gap-4">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white md:text-2xl">
            Drop sheet files here
          </h2>
          <p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-300 md:text-base">
            Upload your scores in one step, then send them into forScore from your iPhone or iPad.
            Supported formats: {ALLOWED_EXTENSIONS.map((item) => item.toUpperCase()).join(", ")}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={pickFiles} disabled={disabled || isUploading}>
            {isUploading ? "Uploading…" : "Choose Files"}
          </Button>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Up to {MAX_FILE_COUNT} files · {formatBytes(MAX_FILE_SIZE_BYTES)} each
          </span>
        </div>

        <label htmlFor={inputId} className="sr-only">
          Upload sheet files
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept=".pdf,.4sc,.4ss,application/pdf"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>
    </section>
  );
}
