"use client";

import { BadgeCheck, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import type { SourceRef } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

export function SourceTag({
  source,
  className,
}: {
  source: SourceRef;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
        source.verified
          ? "bg-status-neutral-bg text-status-neutral"
          : "bg-status-demo-bg text-status-demo",
        className,
      )}
      title={source.note}
    >
      {source.verified ? (
        <BadgeCheck className="h-3 w-3" aria-hidden />
      ) : (
        <ShieldAlert className="h-3 w-3" aria-hidden />
      )}
      {source.verified ? t("verifiedTag") : t("demoTag")}
    </span>
  );
}
