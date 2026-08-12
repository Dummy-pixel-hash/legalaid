"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Eye,
  FileDown,
  PencilLine,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useCase } from "@/lib/store/case-store";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingAnalysis } from "@/components/analysis/LoadingAnalysis";
import { DocumentSheet } from "@/components/document/DocumentSheet";
import { cn } from "@/lib/utils";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  return <DocumentClient caseId={caseId} />;
}

function DocumentClient({ caseId }: { caseId: string }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { record, analysis, updateDocument } = useCase(caseId, lang);
  const [editing, setEditing] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);
  const [copiedFlash, setCopiedFlash] = useState(false);

  if (!record) return null;
  if (record.status === "analyzing") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <LoadingAnalysis stage={record.stage} progress={record.pct} />
      </div>
    );
  }
  if (record.status === "error") return <ErrorState onRetry={() => router.refresh()} />;
  if (!analysis) return <EmptyState />;

  const doc = analysis.document;

  const handleSave = () => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  };

  const handleCopy = async () => {
    try {
      const text = [
        doc.title,
        "",
        doc.fromParty,
        doc.toParty,
        doc.subject,
        "",
        ...doc.sections.flatMap((s) => [s.heading.toUpperCase(), s.body, ""]),
        doc.legalReferences.length ? `${t("legalReferencesLabel")}: ${doc.legalReferences.join("; ")}` : "",
        `${t("remedyLabel")}: ${doc.remedy}`,
      ]
        .filter(Boolean)
        .join("\n");
      await navigator.clipboard.writeText(text);
      setCopiedFlash(true);
      window.setTimeout(() => setCopiedFlash(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  const handlePdf = () => {
    // The print stylesheet renders only the document sheet.
    window.setTimeout(() => window.print(), 50);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="print-hide">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-ink-50">
          05 · {t("stepDocument")}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {t("documentTitle")}
        </h1>
        <p className="mt-2 text-ink-70">{t("documentSubtitle")}</p>
      </div>

      {/* Toolbar */}
      <div className="print-hide sticky top-14 z-30 mt-6 rounded-md border border-line bg-surface p-2 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant={editing ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setEditing(true)}
            >
              <PencilLine className="h-4 w-4" aria-hidden />
              {t("edit")}
            </Button>
            <Button
              variant={!editing ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setEditing(false)}
            >
              <Eye className="h-4 w-4" aria-hidden />
              {t("preview")}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copiedFlash ? (
                <Check className="h-4 w-4 text-status-success" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" aria-hidden />
              )}
              {copiedFlash ? t("copied") : t("copyText")}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" aria-hidden />
              {savedFlash ? t("saved") : t("save")}
            </Button>
            <Button variant="seal" size="sm" onClick={handlePdf}>
              <FileDown className="h-4 w-4" aria-hidden />
              {t("downloadPdf")}
            </Button>
          </div>
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-ink-50">{t("printHint")}</p>
      </div>

      <div className={cn("mt-8", !editing && "pointer-events-none select-none")}>
        <DocumentSheet
          doc={doc}
          editing={editing}
          onChange={(patch) => updateDocument(caseId, patch)}
        />
      </div>
    </div>
  );
}
