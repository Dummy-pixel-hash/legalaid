"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { CaseAnalysis } from "@/lib/types/domain";
import { localize } from "@/lib/types/domain";
import { SectionMarker } from "@/components/shared/SectionMarker";

export function UncertaintyBlock({ analysis }: { analysis: CaseAnalysis }) {
  const { t, lang } = useI18n();
  if (analysis.uncertainty.length === 0) return null;
  return (
    <section>
      <SectionMarker
        label={t("uncertaintyHeading")}
        className="font-doc text-[13px] font-semibold tracking-[0.02em] text-accent-strong"
      />
      <p className="mt-1 text-sm text-ink-50">{t("uncertaintyHint")}</p>
      <ul className="mt-5 space-y-6">
        {analysis.uncertainty.map((u) => (
          <li key={u.id}>
            <h3 className="text-[15.5px] font-semibold leading-snug text-ink">
              {localize(u.plain, lang)}
            </h3>
            <dl className="mt-2 space-y-1.5 text-[13.5px] leading-relaxed text-ink-70">
              <div>
                <dt className="inline font-semibold text-ink-50">
                  {t("changesAnswerLabel")}:
                </dt>{" "}
                <dd className="inline">{localize(u.changesAnswer, lang)}</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-ink-50">
                  {t("resolveLabel")}:
                </dt>{" "}
                <dd className="inline">{localize(u.resolve, lang)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
