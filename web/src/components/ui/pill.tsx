import { cn } from "@/lib/utils";

type PillProps = {
  children: React.ReactNode;
  className?: string;
};

export function Pill({ children, className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-zinc-200/80 bg-white/80 px-2.5 py-1 text-xs font-semibold text-zinc-700 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200",
        className,
      )}
    >
      {children}
    </span>
  );
}
