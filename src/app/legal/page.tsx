"use client";

import { BadgeCheck, BookOpenCheck, Lock, Phone, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { DisclaimerBanner } from "@/components/analysis/DisclaimerBanner";

export default function LegalInfoPage() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        {t("legalTitle")}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-ink-70">
        {t("legalIntro")}
      </p>

      <div className="mt-8 divide-y divide-line">
        <section className="py-7">
          <h2 className="font-doc text-[13px] font-semibold tracking-[0.02em] text-accent-strong">
            <span className="inline-flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-accent-strong" aria-hidden />
              {t("whatWeAreHeading")}
            </span>
          </h2>
          <p className="mt-2.5 max-w-[62ch] text-sm leading-relaxed text-ink-70">
            {t("whatWeAre")}
          </p>
        </section>

        <section className="py-7">
          <h2 className="font-doc text-[13px] font-semibold tracking-[0.02em] text-accent-strong">
            <span className="inline-flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-seal" aria-hidden />
              {t("whatWeAreNotHeading")}
            </span>
          </h2>
          <p className="mt-2.5 max-w-[62ch] text-sm leading-relaxed text-ink-70">
            {t("whatWeAreNot")}
          </p>
        </section>

        <section className="py-7">
          <h2 className="font-doc text-[13px] font-semibold tracking-[0.02em] text-accent-strong">
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-accent-strong" aria-hidden />
              {t("sourcesHeading")}
            </span>
          </h2>
          <p className="mt-2.5 max-w-[62ch] text-sm leading-relaxed text-ink-70">
            {t("sourcesBody")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-status-neutral-bg px-2 py-0.5 text-[11px] font-medium text-status-neutral">
              <BadgeCheck className="h-3 w-3" aria-hidden /> {t("verifiedTag")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-status-demo-bg px-2 py-0.5 text-[11px] font-medium text-status-demo">
              <ShieldAlert className="h-3 w-3" aria-hidden /> {t("demoTag")}
            </span>
          </div>
        </section>

        <section className="py-7">
          <h2 className="font-doc text-[13px] font-semibold tracking-[0.02em] text-accent-strong">
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4 text-accent-strong" aria-hidden />
              {t("helpHeading")}
            </span>
          </h2>
          <p className="mt-2.5 max-w-[62ch] text-sm leading-relaxed text-ink-70">
            {t("helpBody")}
          </p>
        </section>

        <section className="py-7">
          <h2 className="font-doc text-[13px] font-semibold tracking-[0.02em] text-accent-strong">
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-accent-strong" aria-hidden />
              {t("privacyNoteHeading")}
            </span>
          </h2>
          <p className="mt-2.5 max-w-[62ch] text-sm leading-relaxed text-ink-70">
            {t("privacyNoteBody")}
          </p>
        </section>
      </div>

      <div className="mt-8">
        <DisclaimerBanner />
      </div>
    </div>
  );
}
