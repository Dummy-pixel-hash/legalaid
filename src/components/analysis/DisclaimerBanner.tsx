"use client";

import { ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function DisclaimerBanner({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <p
      className={`flex items-start gap-2.5 text-xs leading-relaxed text-ink-70 ${className ?? ""}`}
    >
      <ShieldCheck
        className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong"
        aria-hidden
      />
      <span>
        <span className="font-semibold text-ink">
          {t("disclaimerHeading")}:{" "}
        </span>
        {text ?? t("homeDisclaimerNote")}
      </span>
    </p>
  );
}
