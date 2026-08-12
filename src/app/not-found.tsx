"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-50">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">{t("notFoundTitle")}</h1>
      <p className="mt-2 text-sm text-ink-70">{t("notFoundBody")}</p>
      <Button asChild className="mt-6">
        <Link href="/">
          {t("goHome")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </Button>
    </div>
  );
}
