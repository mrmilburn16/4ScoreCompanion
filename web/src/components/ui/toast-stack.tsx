"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "warning" | "error";

export type ToastItem = {
  id: string;
  tone: ToastTone;
  message: string;
};

type ToastStackProps = {
  items: ToastItem[];
  onDismiss: (id: string) => void;
};

const toneClasses: Record<ToastTone, string> = {
  success:
    "border-emerald-300 bg-emerald-100/95 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-100",
  warning:
    "border-amber-300 bg-amber-100/95 text-amber-900 dark:border-amber-700 dark:bg-amber-900/80 dark:text-amber-100",
  error:
    "border-rose-300 bg-rose-100/95 text-rose-900 dark:border-rose-700 dark:bg-rose-900/80 dark:text-rose-100",
};

export function ToastStack({ items, onDismiss }: ToastStackProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-3 top-3 z-[60] flex w-full max-w-sm flex-col gap-2 md:right-6 md:top-6">
      {items.map((item) => (
        <section
          key={item.id}
          className={cn(
            "pointer-events-auto flex items-start gap-2 rounded-2xl border px-3 py-2 text-sm shadow-xl backdrop-blur",
            toneClasses[item.tone],
          )}
          role="status"
          aria-live="polite"
        >
          <p className="flex-1 font-medium">{item.message}</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => onDismiss(item.id)}
            aria-label="Dismiss notification"
          >
            Dismiss
          </Button>
        </section>
      ))}
    </div>
  );
}
