import { cn } from "@/lib/utils";

/** Section label rendered as a heading (h2) so page sections are landmarks. */
export function SectionMarker({
  number,
  label,
  className,
}: {
  number?: string;
  label: string;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-xs font-medium uppercase tracking-[0.08em] text-ink-50",
        className,
      )}
    >
      {number ? `${number} · ` : ""}
      {label}
    </h2>
  );
}
