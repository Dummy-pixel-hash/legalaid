"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { CaseAnalysis } from "@/lib/types/domain";
import { SectionMarker } from "@/components/shared/SectionMarker";
import { ConfidenceBadge } from "./ConfidenceBadge";

export function IssuesBlock({ analysis }: { analysis: CaseAnalysis }) {
  const { t } = useI18n();
  if (analysis.issues.length === 0) return null;
  return (
    <section>
      <SectionMarker number="02" label={t("possibleIssuesHeading")} />
      <p className="mt-1 text-sm text-ink-50">{t("possibleIssuesHint")}</p>
      <ul className="mt-4 space-y-3">
        {analysis.issues.map((issue) => (
          <li
            key={issue.id}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink">{issue.label}</h3>
              <ConfidenceBadge kind={issue.kind} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-70">
              {issue.detail}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
