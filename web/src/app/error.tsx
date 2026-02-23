"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("route-error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <section className="w-full max-w-xl space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-300">
          Something went wrong
        </p>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
          We hit an unexpected error.
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Please try again. If this keeps happening, refresh the page and retry your upload.
        </p>
        <details className="rounded-xl bg-zinc-100 p-3 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          <summary className="cursor-pointer font-semibold">Error details</summary>
          <pre className="mt-2 whitespace-pre-wrap">{error.message}</pre>
        </details>
        <div className="flex flex-wrap gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </div>
      </section>
    </div>
  );
}
