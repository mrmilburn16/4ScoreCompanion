"use client";

import { formatBytes } from "@/lib/validation/files";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";

export type QueueStatus = "queued" | "uploading" | "uploaded" | "failed" | "cancelled";

export type UploadQueueItem = {
  id: string;
  file: File;
  status: QueueStatus;
  message?: string;
};

type UploadQueueProps = {
  items: UploadQueueItem[];
  onUploadQueued: () => void;
  onRetryFailed: () => void;
  onClearCompleted: () => void;
  onRemoveItem: (id: string) => void;
  onCancelUpload: () => void;
  isUploading: boolean;
};

const statusStyles: Record<QueueStatus, string> = {
  queued: "border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100",
  uploading:
    "border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-800 dark:bg-sky-900/45 dark:text-sky-100",
  uploaded:
    "border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/45 dark:text-emerald-100",
  failed: "border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-900/45 dark:text-rose-100",
  cancelled:
    "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-900/45 dark:text-amber-100",
};

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function UploadQueue({
  items,
  onUploadQueued,
  onRetryFailed,
  onClearCompleted,
  onRemoveItem,
  onCancelUpload,
  isUploading,
}: UploadQueueProps) {
  const queuedCount = items.filter((item) => item.status === "queued").length;
  const failedCount = items.filter((item) => item.status === "failed" || item.status === "cancelled").length;
  const completedCount = items.filter((item) => item.status === "uploaded").length;

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 rounded-3xl border border-zinc-200/70 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/75 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Upload queue</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-300">
            {queuedCount} queued · {completedCount} uploaded · {failedCount} failed/cancelled
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onUploadQueued} disabled={queuedCount === 0 || isUploading}>
            Upload queued files
          </Button>
          <Button size="sm" variant="ghost" onClick={onRetryFailed} disabled={failedCount === 0 || isUploading}>
            Retry failed
          </Button>
          <Button size="sm" variant="ghost" onClick={onClearCompleted} disabled={completedCount === 0 || isUploading}>
            Clear completed
          </Button>
          <Button size="sm" variant="danger" onClick={onCancelUpload} disabled={!isUploading}>
            Cancel upload
          </Button>
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{item.file.name}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Pill>{formatBytes(item.file.size)}</Pill>
                <Pill className={statusStyles[item.status]}>{sentenceCase(item.status)}</Pill>
              </div>
              {item.message && <p className="text-xs text-zinc-500 dark:text-zinc-300">{item.message}</p>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveItem(item.id)}
              disabled={item.status === "uploading"}
              aria-label={`Remove ${item.file.name} from queue`}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
