"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
	Check,
	Copy,
	Eye,
	FileDown,
	Loader2,
	PencilLine,
	RefreshCw,
	Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { getProvider } from "@/lib/providers";
import { useCase } from "@/lib/store/case-store";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingAnalysis } from "@/components/analysis/LoadingAnalysis";
import { DevelopmentProviderNotice } from "@/components/analysis/DevelopmentProviderNotice";
import { DocumentSheet } from "@/components/document/DocumentSheet";
import { DocumentAssistant } from "@/components/assistant/DocumentAssistant";
import type { DocumentData } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

export default function DocumentPage({
	params,
}: {
	params: Promise<{ caseId: string }>;
}) {
	const { caseId } = use(params);
	return <DocumentClient caseId={caseId} />;
}

function DocumentClient({ caseId }: { caseId: string }) {
	const { t, lang } = useI18n();
	const router = useRouter();
	const { record, analysis, updateDocument, ensureDocumentDraft } = useCase(
		caseId,
		lang,
	);
	const [editing, setEditing] = useState(true);
	const [savedFlash, setSavedFlash] = useState(false);
	const [copiedFlash, setCopiedFlash] = useState(false);
	const [regenerating, setRegenerating] = useState(false);
	const [regenError, setRegenError] = useState(false);
	const [appliedPulse, setAppliedPulse] = useState(false);

	if (!record) return null;
	if (record.status === "analyzing") {
		return (
			<div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
				<LoadingAnalysis stage={record.stage} progress={record.pct} />
			</div>
		);
	}
	if (record.status === "error")
		return <ErrorState onRetry={() => router.refresh()} />;
	if (!analysis) return <EmptyState />;
	// The document ships with the analysis now (4th section); per-language
	// edits/regenerated drafts (overrides.document[lang]) always win over the
	// active language's base draft, so toggling never leaks a letter across.
	const draftReady = Boolean(record.documentDrafts?.[lang]);
	const genericCase = analysis.domain === "other";
	const doc = {
		...analysis.document,
		...(record.overrides.document?.[lang] ?? {}),
	};
	const langName = t(lang === "hi" ? "languageHi" : "languageEn");

	const handleChange = (patch: Partial<DocumentData>) => {
		updateDocument(caseId, lang, patch);
	};

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
				doc.legalReferences.length
					? `${t("legalReferencesLabel")}: ${doc.legalReferences.join("; ")}`
					: "",
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

	// Regenerate the letter through the provider seam (grounded in the current
	// analysis). The fresh draft replaces the previous draft entirely — edits
	// are not carried over, so a stale/partial draft can't clobber the new one.
	const handleRegen = async () => {
		if (regenerating || !record || !analysis) return;
		setRegenerating(true);
		setRegenError(false);
		try {
			const fresh = await getProvider().generateDocument({
				analysis,
				intake: record.intake,
				lang,
				edits: {},
			});
			updateDocument(caseId, lang, fresh);
		} catch (err) {
			console.error("Document regeneration failed", err);
			setRegenError(true);
		} finally {
			setRegenerating(false);
		}
	};

	return (
		<div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_200px] lg:gap-8">
				<aside className="print-hide order-first lg:order-none lg:col-start-2 lg:row-start-1">
					<div className="rounded-md border border-line bg-surface p-2 shadow-sm lg:sticky lg:top-16 lg:flex lg:flex-col lg:gap-1">
						<div className="flex flex-wrap items-center gap-1 lg:flex-col lg:items-stretch">
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
							<Button
								variant="ghost"
								size="sm"
								onClick={() => void handleRegen()}
								disabled={regenerating}
							>
								{regenerating ? (
									<Loader2 className="h-4 w-4 animate-spin" aria-hidden />
								) : (
									<RefreshCw className="h-4 w-4" aria-hidden />
								)}
								{regenerating ? t("documentRegenerating") : t("documentRegen")}
							</Button>
						</div>
						{regenError && (
							<p className="mt-1 text-[11px] font-medium text-status-danger">
								{t("documentRegenError")}
							</p>
						)}
						<div className="mt-1 flex flex-wrap items-center gap-1 border-t border-line pt-2 lg:flex-col lg:items-stretch lg:gap-1">
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
							<Button
								variant="seal"
								size="sm"
								onClick={handlePdf}
								className="lg:w-full lg:justify-center"
							>
								<FileDown className="h-4 w-4" aria-hidden />
								{t("downloadPdf")}
							</Button>
						</div>
					</div>
					<p className="mt-2 px-1 text-[11px] text-ink-50">{t("printHint")}</p>
				</aside>
				<div className="min-w-0 lg:col-start-1 lg:row-start-1">
					<div className="mb-5 print-hide">
						<DevelopmentProviderNotice />
					</div>
					<header className="mb-[18px] print-hide">
						<h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
							{t("documentTitle")}
						</h1>
						<p className="mt-2 text-ink-70">{t("documentSubtitle")}</p>
					</header>
					{draftReady || genericCase ? (
						<div
							className={cn(
								"mt-[22px]",
								!editing && "pointer-events-none select-none",
								appliedPulse &&
									"rounded-md ring-2 ring-accent-strong/50 transition-all",
							)}
						>
							<DocumentSheet
								doc={doc}
								editing={editing}
								onChange={handleChange}
							/>
						</div>
					) : (
						<div className="mx-auto mt-[22px] flex w-full max-w-[760px] flex-col items-center justify-center gap-3 rounded-md border border-line bg-surface px-8 py-16 text-center shadow-sm print-hide">
							<Loader2
								className="h-5 w-5 animate-spin text-accent-strong"
								aria-hidden
							/>
							<p className="text-sm text-ink-70" role="status">
								{t("documentPreparing", { lang: langName })}
							</p>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => void ensureDocumentDraft(caseId, lang)}
							>
								{t("retry")}
							</Button>
						</div>
					)}
					{draftReady || genericCase ? (
						<div className="mt-6 print-hide">
							<DocumentAssistant
								caseId={caseId}
								doc={doc}
								onApplied={() => {
									setAppliedPulse(true);
									window.setTimeout(() => setAppliedPulse(false), 1400);
								}}
							/>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
