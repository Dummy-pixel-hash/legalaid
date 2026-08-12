"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { CaseAnalysis } from "@/lib/types/domain";
import { SectionMarker } from "@/components/shared/SectionMarker";

export function RightsBlock({ analysis }: { analysis: CaseAnalysis }) {
  const { t } = useI18n();
  if (analysis.rights.length === 0) return null;
  return (
    <section>
      <SectionMarker number="03" label={t("rightsHeading")} />
      <p className="mt-1 text-sm text-ink-50">{t("rightsHint")}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {analysis.rights.map((right) => (
          <li
            key={right.id}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <h3 className="text-sm font-semibold text-ink">{right.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-70">
              {right.plain}
            </p>
            {right.linkedLaws.length > 0 && (
              <p className="mt-2 text-[11px] text-ink-50">
                {right.linkedLaws.map((id) => {
                  const law = analysis.laws.find((l) => l.id === id);
                  return law ? (
                    <span key={id} className="mr-2 inline-block">
                      {law.act} {law.section}
                    </span>
                  ) : null;
                })}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
