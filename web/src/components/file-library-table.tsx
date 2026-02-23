"use client";

import { formatBytes } from "@/lib/validation/files";
import type { StoredFileRecord } from "@/types/file";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { FileCard } from "@/components/file-card";

type FileLibraryTableProps = {
  files: StoredFileRecord[];
  onDownload: (file: StoredFileRecord) => void;
  onShare: (file: StoredFileRecord) => void;
  onCopyLink: (file: StoredFileRecord) => void;
  onDelete: (file: StoredFileRecord) => void;
  actionBusy: Record<string, boolean>;
  isLoading: boolean;
};

export function FileLibraryTable({
  files,
  onDownload,
  onShare,
  onCopyLink,
  onDelete,
  actionBusy,
  isLoading,
}: FileLibraryTableProps) {
  if (isLoading) {
    return (
      <section className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-950/70">
        <p className="text-sm text-zinc-500 dark:text-zinc-300">Loading your library…</p>
      </section>
    );
  }

  if (files.length === 0) {
    return (
      <section className="rounded-3xl border border-dashed border-zinc-300 bg-white/70 p-10 text-center dark:border-zinc-700 dark:bg-zinc-950/70">
        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">No files yet</h3>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-300">
          Upload your first PDF or forScore package to build your import queue.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="grid gap-4 md:hidden">
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            onDownload={onDownload}
            onShare={onShare}
            onCopyLink={onCopyLink}
            onDelete={onDelete}
            actionBusy={actionBusy}
          />
        ))}
      </section>

      <section className="hidden overflow-hidden rounded-3xl border border-zinc-200 bg-white/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/70 md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900/80">
            <tr>
              <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200">File</th>
              <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200">Type</th>
              <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200">Size</th>
              <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200">Uploaded</th>
              <th className="px-4 py-3 font-semibold text-zinc-700 dark:text-zinc-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-t border-zinc-100 dark:border-zinc-800">
                <td className="max-w-[420px] px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  <p className="truncate">{file.originalName}</p>
                </td>
                <td className="px-4 py-3">
                  <Pill>{file.extension.toUpperCase()}</Pill>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{formatBytes(file.size)}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                  {new Date(file.uploadedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
