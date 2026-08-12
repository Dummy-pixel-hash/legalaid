"use client";

import Link from "next/link";
import { Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function AppFooter() {
  const { t, lang } = useI18n();

  return (
    <footer className="print-hide mt-auto border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 text-xs text-ink-50 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className="leading-relaxed">{t("homeDisclaimerNote")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link
              href="/legal"
              className="font-medium text-accent-strong hover:underline"
            >
              {t("legalInfo")}
            </Link>
            <p className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" aria-hidden />
              <span>
                {lang === "hi" ? "विधिक सहायता हेल्पलाइन" : "Legal aid helpline"}:{" "}
                <span className="font-semibold text-ink">15100</span>
              </span>
            </p>
          </div>
        </div>
        <p className="mt-6 text-[11px] text-ink-30">
          © {new Date().getFullYear()} LegalAId · {t("headerSub")}
        </p>
      </div>
    </footer>
  );
}
