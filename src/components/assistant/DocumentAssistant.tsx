"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Loader2, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useCase } from "@/lib/store/case-store";
import { getProvider } from "@/lib/providers";
import type { DocumentData } from "@/lib/types/domain";

/**
 * The document page's assistant layer: preset + free-form revision actions
 * (the AI-collaborative editing loop — propose → apply/discard → keep editing).
 * Q&A about the case lives in the floating assistant pill (persistent thread),
 * which includes the live draft as context on this page.
 */
export function DocumentAssistant({
	caseId,
	doc,
}: {
	caseId: string;
	doc: DocumentData;
}) {
	const { t, lang } = useI18n();
	const { record, analysis, updateDocument } = useCase(caseId, lang);
	const [instruction, setInstruction] = useState("");
	const [revising, setRevising] = useState(false);
	const [revisionError, setRevisionError] = useState(false);
	const [proposal, setProposal] = useState<DocumentData | null>(null);
	const [appliedFlash, setAppliedFlash] = useState(false);

	// Diff the proposal against the current draft so the user sees exactly
	// what will change before applying (and knows when nothing would).
	const changeSummary = useMemo(() => {
		if (!proposal) return [];
		const out: string[] = [];
		if (proposal.title !== doc.title) out.push(t("documentTitle"));
		if (proposal.subject !== doc.subject) out.push(t("subjectLabel"));
		if (proposal.fromParty !== doc.fromParty) out.push(t("fromParty"));
		if (proposal.toParty !== doc.toParty) out.push(t("toParty"));
		if (proposal.remedy !== doc.remedy) out.push(t("remedyLabel"));
		const n = Math.max(doc.sections.length, proposal.sections.length);
		for (let i = 0; i < n; i++) {
			const a = doc.sections[i];
			const b = proposal.sections[i];
			if (!a || !b || a.heading !== b.heading || a.body !== b.body) {
				out.push(`${t("sectionLabel")} ${i + 1}`);
			}
		}
		return out;
	}, [proposal, doc, t]);

	const revise = useCallback(
		async (instr: string) => {
			const i = instr.trim();
			if (!i || revising || !record || !analysis) return;
			setRevising(true);
			setRevisionError(false);
			try {
				const next = await getProvider().reviseDocument({
					analysis,
					intake: record.intake,
					lang,
					currentDraft: doc,
					instruction: i,
				});
				setProposal(next);
				setInstruction("");
			} catch {
				setRevisionError(true);
			} finally {
				setRevising(false);
			}
		},
		[revising, record, analysis, lang, doc],
	);

	const applyProposal = () => {
		if (!proposal) return;
		// Edits-wins model: the proposal replaces the draft; the user can keep
		// editing right after (per-language overrides unchanged for other lang).
		updateDocument(caseId, lang, proposal);
		setProposal(null);
		setAppliedFlash(true);
		window.setTimeout(() => setAppliedFlash(false), 2000);
	};

	if (!record || !analysis) return null; // the page only renders this when ready

	const unavailable = analysis.domain === "other";

	const translateTarget = lang === "hi" ? "English" : "Hindi";
	const presets = [
		t("reviseActionFirmer"),
		t("reviseActionFormal"),
		t("reviseActionTranslate", { target: translateTarget }),
		t("reviseActionCondense"),
	];

	return (
		<section
			className="overflow-hidden rounded-lg border border-line bg-surface"
			aria-label={t("reviseTitle")}
		>
			<div className="border-b border-line px-4 py-3 sm:px-5">
				<div className="flex items-center gap-2">
					<Wand2 className="h-4 w-4 shrink-0 text-accent-strong" aria-hidden />
					<h2 className="text-sm font-semibold text-ink">{t("reviseTitle")}</h2>
				</div>
				<p className="mt-1 text-xs leading-relaxed text-ink-50">
					{t("assistantSubtitle")}
				</p>
			</div>

			{unavailable ? (
				<div className="px-4 py-3 sm:px-5">
					<p
						className="rounded-md border border-line bg-surface-muted px-3 py-2 text-xs leading-relaxed text-ink-70"
						role="status"
					>
						{t("reviseUnavailable")}
					</p>
				</div>
			) : (
				<div className="px-4 py-3 sm:px-5">
					<ul className="flex flex-wrap gap-2">
						{presets.map((label) => (
							<li key={label}>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => void revise(label)}
									disabled={revising}
								>
									{label}
								</Button>
							</li>
						))}
					</ul>

					{revising && (
						<p
							className="mt-2 flex items-center gap-1.5 text-xs font-medium text-ink-70"
							role="status"
						>
							<Loader2
								className="h-3.5 w-3.5 animate-spin text-accent-strong"
								aria-hidden
							/>
							{t("reviseWorking")}
						</p>
					)}

					<form
						className="mt-3 flex items-end gap-2"
						onSubmit={(e) => {
							e.preventDefault();
							void revise(instruction);
						}}
					>
						<label htmlFor="assistant-revise-input" className="sr-only">
							{t("revisePlaceholder")}
						</label>
						<textarea
							id="assistant-revise-input"
							value={instruction}
							onChange={(e) => setInstruction(e.target.value)}
							placeholder={t("revisePlaceholder")}
							rows={1}
							disabled={revising}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									void revise(instruction);
								}
							}}
							className="min-h-10 flex-1 resize-none rounded-md border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-ink-50 focus:border-accent-strong focus:outline-none focus:ring-2 focus:ring-accent-strong/20 disabled:opacity-50"
						/>
						<Button
							type="submit"
							size="sm"
							disabled={!instruction.trim() || revising}
						>
							{revising ? (
								<Loader2 className="h-4 w-4 animate-spin" aria-hidden />
							) : (
								<Wand2 className="h-4 w-4" aria-hidden />
							)}
							{revising ? t("reviseWorking") : t("assistantSend")}
						</Button>
					</form>

					{revisionError && (
						<p
							className="mt-2 text-xs font-medium text-status-danger"
							role="alert"
						>
							{t("reviseError")}
						</p>
					)}

					{appliedFlash && !proposal && (
						<p
							className="mt-4 flex items-center gap-1.5 text-xs font-medium text-status-success"
							role="status"
						>
							<Check className="h-3.5 w-3.5" aria-hidden />
							{t("reviseApplied")}
						</p>
					)}

					{proposal && (
						<div className="mt-4 rounded-md border border-accent-strong/30 bg-accent/20 p-4">
							<p className="text-sm font-semibold text-ink">
								{t("reviseProposalTitle")}
							</p>
							<p className="mt-1 text-xs text-ink-70">
								{t("reviseProposalNote")}
							</p>

							{changeSummary.length > 0 ? (
								<div className="mt-3 rounded-md border border-line bg-background p-3">
									<p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-50">
										{t("reviseChanged")}
									</p>
									<ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
										{changeSummary.map((c) => (
											<li
												key={c}
												className="flex items-center gap-1.5 text-xs font-medium text-ink-70"
											>
												<Check
													className="h-3 w-3 shrink-0 text-status-success"
													aria-hidden
												/>
												{c}
											</li>
										))}
									</ul>
									{proposal.subject && (
										<p className="mt-2 truncate text-xs font-semibold uppercase tracking-wide text-ink">
											{proposal.subject}
										</p>
									)}
								</div>
							) : (
								<p
									className="mt-3 rounded-md border border-line bg-background px-3 py-2 text-xs font-medium text-ink-70"
									role="status"
								>
									{t("reviseNoChanges")}
								</p>
							)}

							<div className="mt-3 flex flex-wrap gap-2">
								<Button size="sm" onClick={applyProposal}>
									<Check className="h-4 w-4" aria-hidden />
									{t("reviseApply")}
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => setProposal(null)}
								>
									<X className="h-4 w-4" aria-hidden />
									{t("reviseDiscard")}
								</Button>
							</div>
						</div>
					)}
				</div>
			)}
		</section>
	);
}
