"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { EvidenceStatus } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

const OPTIONS: { value: EvidenceStatus; labelKey: "have" | "dontHave" | "needToFind" }[] = [
  { value: "have", labelKey: "have" },
  { value: "dont-have", labelKey: "dontHave" },
  { value: "need-to-find", labelKey: "needToFind" },
];

export function EvidenceStatusControl({
  value,
  onChange,
}: {
  value: EvidenceStatus;
  onChange: (status: EvidenceStatus) => void;
}) {
  const { t } = useI18n();
  return (
    <div
      role="radiogroup"
      aria-label="Evidence status"
      className="inline-flex flex-wrap gap-1 rounded-md border border-line bg-background p-0.5"
    >
      {OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-sm px-2.5 py-1.5 text-xs font-medium transition-colors",
              selected
                ? opt.value === "have"
                  ? "bg-status-success-bg text-status-success"
                  : opt.value === "dont-have"
                    ? "bg-status-danger-bg text-status-danger"
                    : "bg-status-caution-bg text-status-caution"
                : "text-ink-50 hover:bg-surface-muted hover:text-ink",
            )}
          >
            {t(opt.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
