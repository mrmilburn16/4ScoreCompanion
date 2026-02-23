"use client";

import { useCallback, useState } from "react";

import type { UploadResponse } from "@/types/file";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: File[], signal?: AbortSignal): Promise<UploadResponse> => {
      setIsUploading(true);
      setLastError(null);

      try {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
          signal,
        });

        const payload = (await response.json()) as UploadResponse & { error?: string };
        if (!response.ok && payload.uploaded === undefined) {
          throw new Error(payload.error ?? "Upload failed.");
        }

        return {
          uploaded: payload.uploaded ?? [],
          rejected: payload.rejected ?? [],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed.";
        setLastError(message);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return {
    isUploading,
    lastError,
    uploadFiles,
  };
}
