"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-950">
        <div className="flex min-h-screen items-center justify-center p-4">
          <section className="w-full max-w-xl space-y-4 rounded-3xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-100 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-300">
              Global app error
            </p>
            <h1 className="text-2xl font-black">The app encountered a critical failure.</h1>
            <p className="text-sm text-zinc-300">
              Please retry and, if needed, restart the dev server.
            </p>
            <pre className="overflow-auto rounded-xl bg-zinc-950 p-3 text-xs text-zinc-300">
              {error.message}
            </pre>
            <Button onClick={reset}>Retry app</Button>
          </section>
        </div>
      </body>
    </html>
  );
}
