"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { FileLibraryTable } from "@/components/file-library-table";
import { FilePickerButton } from "@/components/file-picker-button";
import { ImportGuideSheet } from "@/components/import-guide-sheet";
import { UploadDropzone } from "@/components/upload-dropzone";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useIOSDetection } from "@/hooks/use-ios-detection";
import { shareStoredFile } from "@/lib/ios/share";
import type { StoredFileRecord } from "@/types/file";

type Banner = {
  tone: "success" | "warning" | "error";
  message: string;
};

function buildDownloadUrl(id: string) {
  return `/api/files/${id}/download`;
}

export default function Home() {
  const [files, setFiles] = useState<StoredFileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});
  const { isIOS, isTouchDevice } = useIOSDetection();
  const { isUploading, lastError, uploadFiles } = useFileUpload();

  const bannerClassName = useMemo(() => {
    if (!banner) {
      return "";
    }

    if (banner.tone === "success") {
      return "border-emerald-300 bg-emerald-100/80 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100";
    }

    if (banner.tone === "warning") {
      return "border-amber-300 bg-amber-100/80 text-amber-900 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-100";
    }

    return "border-rose-300 bg-rose-100/80 text-rose-900 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-100";
  }, [banner]);

  const setBusy = (key: string, busy: boolean) => {
    setActionBusy((previous) => ({
      ...previous,
      [key]: busy,
    }));
  };

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/files");
      const payload = (await response.json()) as { files?: StoredFileRecord[]; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to load files.");
      }

      setFiles(payload.files ?? []);
    } catch (error) {
      setBanner({
        tone: "error",
        message: error instanceof Error ? error.message : "Could not load your library.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const onFilesSelected = useCallback(
    async (selectedFiles: File[]) => {
      if (selectedFiles.length === 0) {
        return;
      }

      try {
        const result = await uploadFiles(selectedFiles);
        await loadFiles();

        if (result.uploaded.length > 0 && result.rejected.length === 0) {
          setBanner({
            tone: "success",
            message: `Uploaded ${result.uploaded.length} file${result.uploaded.length === 1 ? "" : "s"} successfully.`,
          });
          return;
        }

        if (result.uploaded.length > 0 && result.rejected.length > 0) {
          setBanner({
            tone: "warning",
            message: `Uploaded ${result.uploaded.length} file(s), but ${result.rejected.length} file(s) were rejected.`,
          });
          return;
        }

        if (result.rejected.length > 0) {
          setBanner({
            tone: "error",
            message: result.rejected[0]?.error ?? "All selected files were rejected.",
          });
        }
      } catch (error) {
        setBanner({
          tone: "error",
          message: error instanceof Error ? error.message : "Upload failed.",
        });
      }
    },
    [loadFiles, uploadFiles],
  );

  const onDownload = useCallback((file: StoredFileRecord) => {
    setBusy(`download-${file.id}`, true);
    const link = document.createElement("a");
    link.href = buildDownloadUrl(file.id);
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setBusy(`download-${file.id}`, false);
    setBanner({
      tone: "success",
      message: `Downloaded "${file.originalName}".`,
    });
  }, []);

  const onShare = useCallback(async (file: StoredFileRecord) => {
    setBusy(`share-${file.id}`, true);
    const outcome = await shareStoredFile(file);
    setBusy(`share-${file.id}`, false);

    if (outcome.shared) {
      setBanner({
        tone: "success",
        message: `Share sheet opened for "${file.originalName}".`,
      });
      return;
    }

    setBanner({
      tone: "warning",
      message:
        outcome.reason ??
        "Sharing is unavailable in this browser. Use Download, then choose forScore in iOS share options.",
    });
  }, []);

  const onCopyLink = useCallback(async (file: StoredFileRecord) => {
    setBusy(`copy-${file.id}`, true);
    try {
      const url = `${window.location.origin}${buildDownloadUrl(file.id)}`;
      await navigator.clipboard.writeText(url);
      setBanner({
        tone: "success",
        message: "Download link copied.",
      });
    } catch {
      setBanner({
        tone: "error",
        message: "Could not copy link in this browser.",
      });
    } finally {
      setBusy(`copy-${file.id}`, false);
    }
  }, []);

  const onDelete = useCallback(async (file: StoredFileRecord) => {
    const confirmed = window.confirm(`Remove "${file.originalName}" from this library?`);
    if (!confirmed) {
      return;
    }

    setBusy(`delete-${file.id}`, true);
    try {
      const response = await fetch(`/api/files/${file.id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Delete failed.");
      }
      await loadFiles();
      setBanner({
        tone: "success",
        message: `Removed "${file.originalName}".`,
      });
    } catch (error) {
      setBanner({
        tone: "error",
        message: error instanceof Error ? error.message : "Delete failed.",
      });
    } finally {
      setBusy(`delete-${file.id}`, false);
    }
  }, [loadFiles]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#09090c] dark:text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6 md:py-10">
        <header className="relative overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-xl shadow-zinc-300/20 dark:border-zinc-800 dark:bg-zinc-950/70 dark:shadow-black/20 md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.2),transparent_52%)]" />
          <div className="relative space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Pill className="border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
                forScore Companion
              </Pill>
              <Pill>Port 3002</Pill>
              <Pill>{isIOS ? "iOS Detected" : "Desktop / Non‑iOS"}</Pill>
            </div>
            <h1 className="max-w-4xl text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">
              Upload scores fast. Import into forScore with confidence.
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300 md:text-base">
              Drag in your PDFs or forScore bundles (4SC / 4SS), manage everything in one clean
              library, then share into forScore on iPad or iPhone.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setGuideOpen(true)}>How to import into forScore</Button>
              <FilePickerButton onFilesSelected={onFilesSelected} disabled={isUploading} />
            </div>
          </div>
        </header>

        {banner && (
          <aside className={`rounded-2xl border px-4 py-3 text-sm font-medium ${bannerClassName}`}>
            {banner.message}
          </aside>
        )}

        {lastError && !banner && (
          <aside className="rounded-2xl border border-rose-300 bg-rose-100/80 px-4 py-3 text-sm font-medium text-rose-900 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-100">
            {lastError}
          </aside>
        )}

        <UploadDropzone onFilesSelected={onFilesSelected} disabled={false} isUploading={isUploading} />

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold md:text-2xl">Your imported files</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => void loadFiles()} disabled={isLoading}>
                Refresh
              </Button>
              <Button variant="secondary" onClick={() => setGuideOpen(true)}>
                Open import checklist
              </Button>
            </div>
          </div>
          <FileLibraryTable
            files={files}
            onDownload={onDownload}
            onShare={onShare}
            onCopyLink={onCopyLink}
            onDelete={onDelete}
            actionBusy={actionBusy}
            isLoading={isLoading}
          />
        </section>

        <footer className="rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-300">
          <p>
            Tip: {isTouchDevice ? "Tap Share and choose forScore." : "Open this page on iOS for the best one-tap handoff into forScore."}
          </p>
        </footer>
      </div>

      <ImportGuideSheet open={guideOpen} onClose={() => setGuideOpen(false)} isIOS={isIOS} />
    </div>
  );
}
