"use client";

import { formatBytes } from "@/lib/validation/files";
import type { StoredFileRecord } from "@/types/file";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";

type FileCardProps = {
  file: StoredFileRecord;
  onDownload: (file: StoredFileRecord) => void;
  onShare: (file: StoredFileRecord) => void;
  onCopyLink: (file: StoredFileRecord) => void;
  onDelete: (file: StoredFileRecord) => void;
  actionBusy: Record<string, boolean>;
};

export function FileCard({
  file,
  onDownload,
  onShare,
  onCopyLink,
  onDelete,
  actionBusy,
}: FileCardProps) {
  return (
    <article className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="space-y-1">
        <h4 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {file.originalName}
        </h4>
        <div className="flex flex-wrap gap-2">
          <Pill>{file.extension.toUpperCase()}</Pill>
          <Pill>{formatBytes(file.size)}</Pill>
          <Pill>{new Date(file.uploadedAt).toLocaleString()}</Pill>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDownload(file)}
          disabled={actionBusy[`download-${file.id}`]}
        >
          Download
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onShare(file)}
          disabled={actionBusy[`share-${file.id}`]}
        >
          Share
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCopyLink(file)}
          disabled={actionBusy[`copy-${file.id}`]}
        >
          Copy Link
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(file)}
          disabled={actionBusy[`delete-${file.id}`]}
        >
          Remove
        </Button>
      </div>
    </article>
  );
}
