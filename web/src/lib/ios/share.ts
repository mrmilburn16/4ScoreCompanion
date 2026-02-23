import type { StoredFileRecord } from "@/types/file";

type ShareOutcome = {
  shared: boolean;
  reason?: string;
};

export function canUseNativeShare() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return typeof navigator.share === "function" && typeof window !== "undefined";
}

export function isIOSLikeDevice(userAgent: string) {
  return /iPad|iPhone|iPod/i.test(userAgent);
}

export async function shareStoredFile(record: StoredFileRecord): Promise<ShareOutcome> {
  if (!canUseNativeShare()) {
    return { shared: false, reason: "Native share is unavailable in this browser." };
  }

  try {
    const response = await fetch(`/api/files/${record.id}/download`, { method: "GET" });
    if (!response.ok) {
      return { shared: false, reason: "Could not fetch the file for sharing." };
    }

    const blob = await response.blob();
    const fileToShare = new File([blob], record.originalName, {
      type: record.contentType || blob.type || "application/octet-stream",
    });

    if (
      typeof navigator.canShare === "function" &&
      !navigator.canShare({ files: [fileToShare] })
    ) {
      return { shared: false, reason: "This browser cannot share files directly." };
    }

    await navigator.share({
      title: record.originalName,
      text: "Import this file into forScore from the share sheet.",
      files: [fileToShare],
    });

    return { shared: true };
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return { shared: false, reason: "Share flow was cancelled." };
    }

    return {
      shared: false,
      reason: error instanceof Error ? error.message : "Share failed unexpectedly.",
    };
  }
}
