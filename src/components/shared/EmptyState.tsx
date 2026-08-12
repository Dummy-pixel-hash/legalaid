"use client";

import { FileQuestion } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

export function EmptyState() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <FileQuestion className="h-10 w-10 text-ink-30" aria-hidden />
      <h2 className="mt-4 text-lg font-semibold text-ink">{t("noCaseTitle")}</h2>
      <p className="mt-2 text-sm text-ink-70">{t("noCaseBody")}</p>
      <Button
        className="mt-6"
        onClick={() => router.push("/intake")}
      >
        {t("startNewSituation")}
      </Button>
    </div>
  );
}
