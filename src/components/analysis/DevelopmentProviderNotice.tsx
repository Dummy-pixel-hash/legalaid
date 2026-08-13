"use client";

import { FlaskConical } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { getProvider } from "@/lib/providers";

/**
 * Honest development-provider notice (spec §27, §15).
 * Renders nothing when the active provider is the trained model; shows a
 * distinct dashed-bordered block when output comes from the dev/demo provider.
 */
export function DevelopmentProviderNotice() {
  const { t } = useI18n();
  const provider = getProvider();
  if (!provider.isDevelopment) return null;

  return (
    <div className="rounded-lg border-2 border-dashed border-line bg-background px-4 py-3">
      <p className="flex items-start gap-2.5 text-xs leading-relaxed text-ink-70">
        <FlaskConical
          className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong"
          aria-hidden
        />
        <span>
          <span className="font-semibold text-ink">{t("devProviderBadge")}: </span>
          {t("devProviderNotice")}
        </span>
      </p>
    </div>
  );
}
