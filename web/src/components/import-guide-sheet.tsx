"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type ImportGuideSheetProps = {
  open: boolean;
  onClose: () => void;
  isIOS: boolean;
};

const STEPS = [
  "Tap Download or Share for the score you want.",
  "Open the iOS share sheet (square-with-arrow icon).",
  "Choose forScore from the app list.",
  "If forScore is hidden, tap More → Edit and add it to Favorites.",
  "Confirm import in forScore.",
];

export function ImportGuideSheet({ open, onClose, isIOS }: ImportGuideSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-3 opacity-100 transition-all md:items-center"
      role="dialog"
      aria-modal="true"
      aria-hidden={false}
      onMouseDown={onClose}
    >
      <section
        className="w-full max-w-2xl translate-y-0 rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-950"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="mb-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-600 dark:text-sky-300">
            Import guide
          </p>
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Send to forScore</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {isIOS
              ? "You're on an iOS device — this should be a quick share flow."
              : "Open this app on your iPhone or iPad for the smoothest forScore import flow."}
          </p>
        </header>

        <ol className="space-y-3">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-start gap-3 rounded-2xl bg-zinc-50 p-3 dark:bg-zinc-900/70">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
                {index + 1}
              </span>
              <p className="text-sm text-zinc-700 dark:text-zinc-200">{step}</p>
            </li>
          ))}
        </ol>

        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Got it
          </Button>
        </div>
      </section>
    </div>
  );
}
