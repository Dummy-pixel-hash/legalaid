"use client";

import { BadgeCheck, ShieldAlert, ShieldCheck, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function TrustSection() {
  const { t } = useI18n();

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-50">
          04 · {t("homeTrustHeading")}
        </p>
        <p className="mt-2 text-ink-70">{t("homeTrustHint")}</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-5">
          <BadgeCheck className="h-5 w-5 text-status-success" aria-hidden />
          <h3 className="mt-3 text-sm font-semibold text-ink">
            {t("homeVerifiedNote")}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-70">
            {t("homeTrustHint")}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-5">
          <ShieldAlert className="h-5 w-5 text-status-demo" aria-hidden />
          <h3 className="mt-3 text-sm font-semibold text-ink">
            {t("homeDemoNote")}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-70">
            {t("homeDemoNote")} — {t("demoTag")}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface p-5">
          <Lock className="h-5 w-5 text-accent-strong" aria-hidden />
          <h3 className="mt-3 text-sm font-semibold text-ink">
            {t("homePrivacyNote")}
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-70">
            {t("homePrivacyNote")}
          </p>
        </div>
      </div>
      <p className="mt-6 max-w-2xl rounded-lg border border-line bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-70">
        {t("homeDisclaimerNote")}
      </p>
    </section>
  );
}
