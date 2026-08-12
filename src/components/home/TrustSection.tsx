"use client";

import { BadgeCheck, ShieldAlert, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

/**
 * Trust strip rendered as a hairline ledger — three statements, one panel.
 * Reads like a notice, not a SaaS card grid.
 */
export function TrustSection() {
  const { t } = useI18n();

  const rows = [
    {
      icon: BadgeCheck,
      iconClass: "text-status-success",
      title: t("homeVerifiedNote"),
      body: t("homeVerifiedBody"),
    },
    {
      icon: ShieldAlert,
      iconClass: "text-status-demo",
      title: t("homeDemoNote"),
      body: t("homeDemoBody"),
    },
    {
      icon: Lock,
      iconClass: "text-accent-strong",
      title: t("homePrivacyNote"),
      body: t("homePrivacyBody"),
    },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-50">
          {t("homeTrustHeading")}
        </p>
        <p className="mt-2 text-ink-70">{t("homeTrustHint")}</p>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-surface">
        {rows.map((row, i) => {
          const Icon = row.icon;
          return (
            <div
              key={i}
              className={
                "flex gap-4 p-5 " + (i < rows.length - 1 ? "border-b border-line" : "")
              }
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-muted">
                <Icon className={"h-4.5 w-4.5 " + row.iconClass} aria-hidden />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-ink">{row.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-70">
                  {row.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 max-w-2xl rounded-lg border border-line bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-70">
        {t("homeDisclaimerNote")}
      </p>
    </section>
  );
}
