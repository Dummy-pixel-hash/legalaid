"use client";

import { ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { LawReference } from "@/lib/types/domain";
import { SourceTag } from "./SourceTag";

export function LawCard({ law }: { law: LawReference }) {
  const { t } = useI18n();
  return (
    <li className="rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.06em] text-ink-50">
            {law.act}
          </p>
          <h4 className="mt-1 text-base font-semibold text-ink">
            {law.section} — {law.title}
          </h4>
        </div>
        <SourceTag source={law.source} />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-70">
        {law.plainExplanation}
      </p>

      <div className="mt-3 rounded-md border border-line bg-background px-3 py-2.5">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-70">
          <ChevronRight
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-strong"
            aria-hidden
          />
          <span>
            <span className="font-semibold text-ink">
              {t("whyAppliesLabel")}:
            </span>{" "}
            {law.whyApplies}
          </span>
        </p>
      </div>

      <p className="mt-2.5 text-[11px] text-ink-50">
        {t("sourceLabel")}: {law.source.name} {law.source.ref}
        {law.source.note ? ` · ${law.source.note}` : ""}
      </p>
    </li>
  );
}
