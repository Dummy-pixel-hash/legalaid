"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Scale } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const inCase = pathname?.startsWith("/case/") ?? false;

  return (
    <header className="print-hide sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-background">
            <Scale className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight text-ink">
            LegalAId
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-3" aria-label="Primary">
          {inCase && (
            <Link
              href="/intake"
              className="hidden rounded-md px-2.5 py-1.5 text-sm font-medium text-ink-70 transition-colors hover:bg-surface-muted hover:text-ink sm:block"
            >
              {t("newSituation")}
            </Link>
          )}
          <Link
            href="/legal"
            className="hidden rounded-md px-2.5 py-1.5 text-sm font-medium text-ink-70 transition-colors hover:bg-surface-muted hover:text-ink sm:block"
          >
            {t("legalInfo")}
          </Link>
          <LanguageSwitcher className={cn(inCase && "max-sm:hidden")} />
        </nav>
      </div>
    </header>
  );
}
