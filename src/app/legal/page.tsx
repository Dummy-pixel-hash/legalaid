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

      <div className="mt-8 space-y-6">
        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <BookOpenCheck className="h-4.5 w-4.5 text-accent-strong" aria-hidden />
            {t("whatWeAreHeading")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-70">
            {t("whatWeAre")}
          </p>
        </section>

        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <ShieldAlert className="h-4.5 w-4.5 text-status-caution" aria-hidden />
            {t("whatWeAreNotHeading")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-70">
            {t("whatWeAreNot")}
          </p>
        </section>

        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <BadgeCheck className="h-4.5 w-4.5 text-status-success" aria-hidden />
            {t("sourcesHeading")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-70">
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

        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <Phone className="h-4.5 w-4.5 text-accent-strong" aria-hidden />
            {t("helpHeading")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-70">
            {t("helpBody")}
          </p>
        </section>

        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <Lock className="h-4.5 w-4.5 text-accent-strong" aria-hidden />
            {t("privacyNoteHeading")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-70">
            {t("privacyNoteBody")}
          </p>
        </section>

        <DisclaimerBanner />
      </div>
    </div>
  );
}
