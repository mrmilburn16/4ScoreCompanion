"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { FileLibraryTable } from "@/components/file-library-table";
import { FilePickerButton } from "@/components/file-picker-button";
import { ImportGuideSheet } from "@/components/import-guide-sheet";
import { UploadDropzone } from "@/components/upload-dropzone";
import { UploadQueue, type UploadQueueItem } from "@/components/upload-queue";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { ToastStack, type ToastItem, type ToastTone } from "@/components/ui/toast-stack";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useIOSDetection } from "@/hooks/use-ios-detection";
import { shareStoredFile } from "@/lib/ios/share";
import type { StoredFileRecord } from "@/types/file";

function buildDownloadUrl(id: string) {
  return `/api/files/${id}/download`;
}

function fingerprint(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function buildQueueItem(file: File): UploadQueueItem {
  return {
    id: typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    file,
    status: "queued",
  };
}

export default function Home() {
  const [files, setFiles] = useState<StoredFileRecord[]>([]);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<"all" | "pdf" | "4sc" | "4ss">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "size">("newest");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [guideOpen, setGuideOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});
  const [activeUploadController, setActiveUploadController] = useState<AbortController | null>(null);
  const { isIOS, isTouchDevice } = useIOSDetection();
  const { isUploading, lastError, uploadFiles } = useFileUpload();

  const setBusy = useCallback((key: string, busy: boolean) => {
    setActionBusy((previous) => ({
      ...previous,
      [key]: busy,
    }));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (tone: ToastTone, message: string) => {
      const id = typeof crypto !== "undefined" ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      setToasts((previous) => [...previous, { id, tone, message }]);
      window.setTimeout(() => dismissToast(id), 5000);
    },
    [dismissToast],
  );

  const visibleFiles = useMemo(() => {
    const searchValue = searchQuery.trim().toLowerCase();
    const filtered = files.filter((file) => {
      const typeMatch = fileTypeFilter === "all" ? true : file.extension === fileTypeFilter;
      const searchMatch = searchValue
        ? file.originalName.toLowerCase().includes(searchValue)
        : true;
      return typeMatch && searchMatch;
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === "newest") {
        return new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime();
      }

      if (sortBy === "oldest") {
        return new Date(left.uploadedAt).getTime() - new Date(right.uploadedAt).getTime();
      }

      if (sortBy === "name") {
        return left.originalName.localeCompare(right.originalName);
      }

      return right.size - left.size;
    });
  }, [fileTypeFilter, files, searchQuery, sortBy]);

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
      notify("error", error instanceof Error ? error.message : "Could not load your library.");
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  const onFilesSelected = useCallback(
    (selectedFiles: File[]) => {
      if (selectedFiles.length === 0) {
        return;
      }

      const seen = new Set(queue.map((item) => fingerprint(item.file)));
      const additions = selectedFiles
        .filter((item) => !seen.has(fingerprint(item)))
        .map(buildQueueItem);

      if (additions.length === 0) {
        notify("warning", "Those files are already in your upload queue.");
        return;
      }

      setQueue((previous) => [...previous, ...additions]);
      notify(
        "success",
        `Added ${additions.length} file${additions.length === 1 ? "" : "s"} to queue.`,
      );
    },
    [notify, queue],
  );

  const onUploadQueued = useCallback(async () => {
    if (isUploading) {
      return;
    }

    const queuedItems = queue.filter((item) => item.status === "queued");
    if (queuedItems.length === 0) {
      notify("warning", "No queued files to upload.");
      return;
    }

    const queuedIds = new Set(queuedItems.map((item) => item.id));
    setQueue((previous) =>
      previous.map((item) =>
        queuedIds.has(item.id)
          ? {
              ...item,
              status: "uploading",
              message: "Uploading…",
            }
          : item,
      ),
    );

    const controller = new AbortController();
    setActiveUploadController(controller);

    try {
      const result = await uploadFiles(
        queuedItems.map((item) => item.file),
        controller.signal,
      );

      if (result.uploaded.length > 0) {
        await loadFiles();
      }

      const rejectedPool = [...result.rejected];
      const hasAnyUploaded = result.uploaded.length > 0;

      setQueue((previous) =>
        previous.map((item) => {
          if (!queuedIds.has(item.id)) {
            return item;
          }

          const rejectedIndex = rejectedPool.findIndex(
            (rejected) => rejected.name === item.file.name,
          );
          if (rejectedIndex >= 0) {
            const [rejection] = rejectedPool.splice(rejectedIndex, 1);
            return {
              ...item,
              status: "failed",
              message: rejection.error,
            };
          }

          if (hasAnyUploaded) {
            return {
              ...item,
              status: "uploaded",
              message: "Uploaded successfully.",
            };
          }

          return {
            ...item,
            status: "failed",
            message: "Upload failed unexpectedly.",
          };
        }),
      );

      if (result.uploaded.length > 0 && result.rejected.length === 0) {
        notify(
          "success",
          `Uploaded ${result.uploaded.length} file${result.uploaded.length === 1 ? "" : "s"} successfully.`,
        );
        return;
      }

      if (result.uploaded.length > 0 && result.rejected.length > 0) {
        notify(
          "warning",
          `Uploaded ${result.uploaded.length} file(s), but ${result.rejected.length} file(s) were rejected.`,
        );
        return;
      }

      notify("error", result.rejected[0]?.error ?? "Upload failed for all queued files.");
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setQueue((previous) =>
          previous.map((item) =>
            queuedIds.has(item.id) && item.status === "uploading"
              ? { ...item, status: "cancelled", message: "Upload cancelled." }
              : item,
          ),
        );
        notify("warning", "Upload cancelled.");
      } else {
        const message = error instanceof Error ? error.message : "Upload failed.";
        setQueue((previous) =>
          previous.map((item) =>
            queuedIds.has(item.id) && item.status === "uploading"
              ? { ...item, status: "failed", message }
              : item,
          ),
        );
        notify("error", message);
      }
    } finally {
      setActiveUploadController(null);
    }
  }, [isUploading, loadFiles, notify, queue, uploadFiles]);

  const onCancelUpload = useCallback(() => {
    activeUploadController?.abort();
  }, [activeUploadController]);

  const onRetryFailed = useCallback(() => {
    setQueue((previous) =>
      previous.map((item) =>
        item.status === "failed" || item.status === "cancelled"
          ? { ...item, status: "queued", message: undefined }
          : item,
      ),
    );
  }, []);

  const onClearCompleted = useCallback(() => {
    setQueue((previous) => previous.filter((item) => item.status !== "uploaded"));
  }, []);

  const onRemoveQueueItem = useCallback((id: string) => {
    setQueue((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const onDownload = useCallback((file: StoredFileRecord) => {
    setBusy(`download-${file.id}`, true);
    const link = document.createElement("a");
    link.href = buildDownloadUrl(file.id);
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setBusy(`download-${file.id}`, false);
    notify("success", `Downloaded "${file.originalName}".`);
  }, [notify, setBusy]);

  const onShare = useCallback(async (file: StoredFileRecord) => {
    setBusy(`share-${file.id}`, true);
    const outcome = await shareStoredFile(file);
    setBusy(`share-${file.id}`, false);

    if (outcome.shared) {
      notify("success", `Share sheet opened for "${file.originalName}".`);
      return;
    }

    notify(
      "warning",
      outcome.reason ??
        "Sharing is unavailable in this browser. Use Download, then choose forScore in iOS share options.",
    );
  }, [notify, setBusy]);

  const onCopyLink = useCallback(async (file: StoredFileRecord) => {
    setBusy(`copy-${file.id}`, true);
    try {
      const url = `${window.location.origin}${buildDownloadUrl(file.id)}`;
      await navigator.clipboard.writeText(url);
      notify("success", "Download link copied.");
    } catch {
      notify("error", "Could not copy link in this browser.");
    } finally {
      setBusy(`copy-${file.id}`, false);
    }
  }, [notify, setBusy]);

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
      notify("success", `Removed "${file.originalName}".`);
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setBusy(`delete-${file.id}`, false);
    }
  }, [loadFiles, notify, setBusy]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-[#09090c] dark:text-zinc-100">
      <ToastStack items={toasts} onDismiss={dismissToast} />
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

        {lastError && (
          <aside className="rounded-2xl border border-rose-300 bg-rose-100/80 px-4 py-3 text-sm font-medium text-rose-900 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-100">
            {lastError}
          </aside>
        )}

        <UploadDropzone onFilesSelected={onFilesSelected} disabled={false} isUploading={isUploading} />

        <UploadQueue
          items={queue}
          onUploadQueued={onUploadQueued}
          onRetryFailed={onRetryFailed}
          onClearCompleted={onClearCompleted}
          onRemoveItem={onRemoveQueueItem}
          onCancelUpload={onCancelUpload}
          isUploading={isUploading}
        />

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
          <div className="grid gap-3 rounded-2xl border border-zinc-200/70 bg-white/80 p-3 dark:border-zinc-800 dark:bg-zinc-950/70 md:grid-cols-[1fr_auto_auto]">
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-300">
              Search files
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by file name"
                className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-300">
              Type
              <select
                value={fileTypeFilter}
                onChange={(event) =>
                  setFileTypeFilter(event.target.value as "all" | "pdf" | "4sc" | "4ss")
                }
                className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="all">All</option>
                <option value="pdf">PDF</option>
                <option value="4sc">4SC</option>
                <option value="4ss">4SS</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-300">
              Sort
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as "newest" | "oldest" | "name" | "size")
                }
                className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-800 outline-none ring-sky-300 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">File name (A–Z)</option>
                <option value="size">Largest file</option>
              </select>
            </label>
          </div>
          <FileLibraryTable
            files={visibleFiles}
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
