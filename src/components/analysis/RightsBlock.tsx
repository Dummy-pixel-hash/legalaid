"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { CaseAnalysis } from "@/lib/types/domain";
import { SectionMarker } from "@/components/shared/SectionMarker";

export function RightsBlock({ analysis }: { analysis: CaseAnalysis }) {
  const { t } = useI18n();
  if (analysis.rights.length === 0) return null;
  return (
    <section>
      <SectionMarker
        label={t("rightsHeading")}
        className="font-doc text-[13px] font-semibold tracking-[0.02em] text-accent-strong"
      />
      <p className="mt-1 text-sm text-ink-50">{t("rightsHint")}</p>
      <ul className="mt-5 space-y-6">
        {analysis.rights.map((right) => (
          <li key={right.id}>
            <h3 className="text-[16px] font-semibold leading-snug text-ink">
              {right.title}
            </h3>
            <p className="mt-1 text-[14.5px] leading-relaxed text-ink-70">
              {right.plain}
            </p>
            {right.linkedLaws.length > 0 && (
              <p className="mt-2 text-xs text-accent-strong">
                {right.linkedLaws.map((id) => {
                  const law = analysis.laws.find((l) => l.id === id);
                  return law ? (
                    <span key={id} className="mr-3 inline-block">
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
