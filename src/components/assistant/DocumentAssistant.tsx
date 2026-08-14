"use client";

import { useCallback, useState } from "react";
import { Check, Loader2, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useCase } from "@/lib/store/case-store";
import { getProvider } from "@/lib/providers";
import { CaseAssistant } from "./CaseAssistant";
import type { DocumentData } from "@/lib/types/domain";

/**
 * The document page's assistant layer: preset + free-form revision actions
 * (the AI-collaborative editing loop — propose → apply/discard → keep editing)
 * plus the contextual Q&A about the letter.
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
	};

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

				{proposal && (
					<div className="mt-4 rounded-md border border-accent-strong/30 bg-accent/20 p-4">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<p className="text-sm font-semibold text-ink">
								{t("reviseProposalTitle")}
							</p>
						</div>
						<p className="mt-1 text-xs text-ink-70">
							{t("reviseProposalNote")}
						</p>
						<div className="mt-3 rounded-md border border-line bg-background p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-ink">
								{proposal.subject}
							</p>
							{proposal.sections.slice(0, 2).map((s, i) => (
								<p key={i} className="mt-2 text-xs leading-relaxed text-ink-70">
									<span className="font-semibold text-ink">{s.heading}: </span>
									{s.body.length > 140 ? `${s.body.slice(0, 140)}…` : s.body}
								</p>
							))}
						</div>
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

			<div className="border-t border-line p-0">
				<CaseAssistant
					caseId={caseId}
					page="document"
					document={doc}
					heading={t("assistantDocHeading")}
					chips={[t("assistantChipDocStrong"), t("assistantChipDocMissing")]}
					className="border-0 rounded-none"
				/>
			</div>
		</section>
	);
}
