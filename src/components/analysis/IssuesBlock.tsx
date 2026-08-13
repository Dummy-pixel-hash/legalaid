"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { CaseAnalysis } from "@/lib/types/domain";
import { localize } from "@/lib/types/domain";
import { SectionMarker } from "@/components/shared/SectionMarker";
import { ConfidenceBadge } from "./ConfidenceBadge";

export function IssuesBlock({ analysis }: { analysis: CaseAnalysis }) {
  const { t, lang } = useI18n();
  if (analysis.issues.length === 0) return null;
  return (
    <section>
      <SectionMarker
        label={t("possibleIssuesHeading")}
        className="font-doc text-[13px] font-semibold tracking-[0.02em] text-accent-strong"
      />
      <p className="mt-1 text-sm text-ink-50">{t("possibleIssuesHint")}</p>
      <ul className="mt-5 space-y-6">
        {analysis.issues.map((issue) => (
          <li key={issue.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-[16px] font-semibold leading-snug text-ink">
                {localize(issue.label, lang)}
              </h3>
              <ConfidenceBadge kind={issue.kind} />
            </div>
            <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-70">
              {localize(issue.detail, lang)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
