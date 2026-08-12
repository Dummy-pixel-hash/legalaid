import { cn } from "@/lib/utils";

/** Numbered small-caps section marker — the design's organizing rhythm. */
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
    <p
      className={cn(
        "text-xs font-medium uppercase tracking-[0.08em] text-ink-50",
        className,
      )}
    >
      {number ? `${number} · ` : ""}
      {label}
    </p>
  );
}
