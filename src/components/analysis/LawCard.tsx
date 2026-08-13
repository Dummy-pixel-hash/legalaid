"use client";

import { ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { LawReference } from "@/lib/types/domain";
import { localize } from "@/lib/types/domain";
import { SourceTag } from "./SourceTag";

export function LawCard({ law }: { law: LawReference }) {
  const { t, lang } = useI18n();
  return (
    <li>
      <details className="group/law">
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-doc text-[16px] text-accent-strong">
                {law.act} {law.section}
              </p>
              <h4 className="mt-0.5 text-[13px] font-medium text-ink-70">
                {localize(law.title, lang)}
              </h4>
            </div>
            <span className="flex items-center gap-2">
              <SourceTag source={law.source} />
              <ChevronRight
                className="h-4 w-4 shrink-0 text-ink-30 transition-transform group-open/law:rotate-90"
                aria-hidden
              />
            </span>
          </div>

          <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-70">
            {localize(law.plainExplanation, lang)}
          </p>
        </summary>

        <div className="mt-2.5">
          <p className="text-xs leading-relaxed text-ink-50">
            <span className="font-semibold text-ink-70">
              {t("whyAppliesLabel")}:
            </span>{" "}
            {localize(law.whyApplies, lang)}
          </p>

          <p className="mt-1.5 text-xs text-ink-50">
            {t("sourceLabel")}: {law.source.name} {law.source.ref}
            {law.source.note ? ` · ${law.source.note}` : ""}
          </p>
        </div>
      </details>
    </li>
  );
}
