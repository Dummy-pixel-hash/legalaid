"use client";

import { BadgeCheck, ShieldAlert, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

/**
 * Trust strip rendered as a hairline ledger — three statements, one panel.
 * Reads like a notice, not a SaaS card grid.
 */
export function TrustSection() {
  const { t, lang } = useI18n();
  const serif = lang === "hi" ? "font-doc-hi" : "font-doc";

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
        <section className="t2-sec mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 sm:pb-28">
          <div className="max-w-2xl">
            <h2 className={`${serif} text-[13px] font-semibold tracking-[0.02em] text-accent-strong`}>
              {t("homeTrustHeading")}
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-ink-70">
              {t("homeTrustHint")}
            </p>
          </div>

          <div className="mt-7">
            {rows.map((row, i) => {
              const Icon = row.icon;
              return (
                <div
                  key={i}
                  className={
                    "flex gap-4 py-[23px] " +
                    (i < rows.length - 1 ? "border-b border-line" : "")
                  }
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-muted">
                    <Icon className={"h-4 w-4 " + row.iconClass} aria-hidden />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold text-ink">{row.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-70">
                      {row.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
  );
}
