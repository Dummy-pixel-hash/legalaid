"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

export function ErrorState({
  onRetry,
  onFallback,
}: {
  onRetry: () => void;
  onFallback?: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-status-danger" aria-hidden />
      <h2 className="mt-4 text-lg font-semibold text-ink">{t("errorTitle")}</h2>
      <p className="mt-2 text-sm text-ink-70">{t("errorBody")}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button onClick={onRetry}>{t("retry")}</Button>
        {onFallback && (
          <Button variant="secondary" onClick={onFallback}>
            {t("showGeneralGuidance")}
          </Button>
        )}
      </div>
    </div>
  );
}
