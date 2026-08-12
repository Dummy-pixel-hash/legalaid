"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { EvidenceItem, EvidenceStatus } from "@/lib/types/domain";
import { EvidenceStatusControl } from "./EvidenceStatusControl";

export function EvidenceRow({
  item,
  onStatus,
  onNote,
}: {
  item: EvidenceItem;
  onStatus: (status: EvidenceStatus) => void;
  onNote: (note: string) => void;
}) {
  const { t } = useI18n();
  return (
    <li
      className={
        "rounded-lg border bg-surface p-4 transition-colors " +
        (item.status === "have"
          ? "border-status-success/40"
          : item.status === "need-to-find"
            ? "border-status-caution/40"
            : "border-line")
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{item.label}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-70">
            <span className="font-medium text-ink-50">{t("evidenceWhyLabel")}: </span>
            {item.why}
          </p>
        </div>
        <EvidenceStatusControl
          value={item.status}
          onChange={(s) => onStatus(s)}
        />
      </div>
      {item.status !== "unset" && (
        <input
          type="text"
          value={item.note ?? ""}
          onChange={(e) => onNote(e.target.value)}
          placeholder={t("notePlaceholder")}
          className="mt-3 w-full rounded-md border border-line bg-background px-3 py-2 text-xs text-ink placeholder:text-ink-30 focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent-strong/20"
        />
      )}
    </li>
  );
}
