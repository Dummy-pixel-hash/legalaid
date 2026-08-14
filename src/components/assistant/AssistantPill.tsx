"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircleQuestion, RotateCcw, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";
import { useCase } from "@/lib/store/case-store";
import { AssistantChat } from "./AssistantChat";
import { useAssistantChat } from "./useAssistantChat";
import { GRAIN } from "@/lib/visual";
import type { AssistantPage } from "@/lib/assistant-context";

/**
 * The case-aware assistant launcher: a pill that expands into a floating
 * window and collapses back when clicked away (or Esc / the close button).
 *
 * The conversation is PERSISTED per case in the case store, so it survives
 * navigation between case pages and reloads. Context is page-adaptive: the
 * current page selects the suggestion chips and (on the document page) includes
 * the live letter draft so the assistant can answer about it.
 */
export function AssistantPill({ caseId }: { caseId: string }) {
	const { t, lang } = useI18n();
	const { record, analysis } = useCase(caseId, lang);
	const pathname = usePathname();
	const [open, setOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const pillButtonRef = useRef<HTMLButtonElement>(null);
	const prevOpenRef = useRef(open);

	// Page-adaptive context: which step is the user on?
	const page: AssistantPage = pathname?.endsWith("/document")
		? "document"
		: pathname?.endsWith("/evidence")
			? "evidence"
			: pathname?.endsWith("/next-steps")
				? "steps"
				: "analysis";
	const isDocPage = page === "document";
	const draft = isDocPage && analysis ? analysis.document : undefined;
	const chips =
		page === "document"
			? [t("assistantChipDocStrong"), t("assistantChipDocMissing")]
			: page === "evidence"
				? [t("assistantChipEvidenceWhy"), t("assistantChipEvidenceMost")]
				: page === "steps"
					? [t("assistantChipStepsFirst"), t("assistantChipStepsWait")]
					: [
							t("assistantChipLaw"),
							t("assistantChipMissing"),
							t("assistantChipHindi"),
							t("assistantChipFirst"),
						];

	const chat = useAssistantChat({ caseId, page, document: draft });

	// Click-away collapses the window; Esc closes it too. The page stays
	// interactive while the window is open.
	useEffect(() => {
		if (!open) return;
		const onPointerDown = (e: PointerEvent) => {
			if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("pointerdown", onPointerDown);
		window.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("pointerdown", onPointerDown);
			window.removeEventListener("keydown", onKey);
		};
	}, [open]);

	// Focus the composer when the window opens; return focus to the pill on
	// close (skip the initial mount so page load doesn't steal focus).
	useEffect(() => {
		if (prevOpenRef.current === open) return;
		prevOpenRef.current = open;
		if (open) {
			document.getElementById("assistant-pill-input")?.focus();
		} else {
			pillButtonRef.current?.focus();
		}
	}, [open]);

	// Only offer the assistant once this case has a real analysis to be aware of.
	if (!record?.baseAnalysis || !analysis) return null;

	const heading = t("assistantHeading");

	if (!open) {
		return (
			<button
				ref={pillButtonRef}
				type="button"
				onClick={() => setOpen(true)}
				className="fixed right-4 bottom-5 z-50 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-background shadow-md transition-all duration-200 ease-out hover:scale-[1.03] hover:bg-ink/90 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong sm:right-6 sm:bottom-6"
				aria-label={t("assistantPill")}
			>
				<MessageCircleQuestion className="h-4 w-4" aria-hidden />
				<span className="hidden sm:inline">{t("assistantPill")}</span>
			</button>
		);
	}

	return (
		<>
			{/* Heavy blur + grain backdrop: the page behind the AI window is
			    veiled and blurred; clicking it collapses the window. */}
			<div
				aria-hidden
				onClick={() => setOpen(false)}
				className="fixed inset-0 z-40 bg-background/60 motion-safe:animate-in motion-safe:fade-in-0 backdrop-blur-xl motion-safe:duration-300 motion-safe:ease-out"
			/>
			<div
				aria-hidden
				className="pointer-events-none fixed inset-0 z-40 opacity-[0.05] mix-blend-multiply"
				style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }}
			/>
			<div
				ref={panelRef}
				className="fixed right-4 bottom-5 z-50 flex max-h-[min(72vh,34rem)] min-h-[26rem] w-[min(24rem,calc(100vw-2rem))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 flex-col overflow-hidden rounded-[10px] border border-line bg-surface shadow-lg motion-safe:duration-200 motion-safe:ease-out sm:right-6 sm:bottom-6"
				role="dialog"
				aria-label={heading}
			>
			<div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
				<div className="flex min-w-0 items-center gap-2">
					<MessageCircleQuestion
						className="h-4 w-4 shrink-0 text-accent-strong"
						aria-hidden
					/>
					<h2 className="truncate text-sm font-semibold text-ink">{heading}</h2>
				</div>
				<div className="flex shrink-0 items-center gap-1">
					{chat.thread.length > 0 && (
						<Button
							type="button"
							variant="ghost"
							size="icon-sm"
							onClick={chat.clear}
							title={t("assistantClear")}
							aria-label={t("assistantClear")}
						>
							<RotateCcw className="h-4 w-4" aria-hidden />
						</Button>
					)}
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						onClick={() => setOpen(false)}
						title={t("assistantClose")}
						aria-label={t("assistantClose")}
					>
						<X className="h-4 w-4" aria-hidden />
					</Button>
				</div>
			</div>
			<AssistantChat
				chips={chips}
				messages={chat.thread}
				streamingText={chat.streamingText}
				busy={chat.busy}
				error={chat.error}
				input={chat.input}
				onInput={chat.setInput}
				onSend={chat.send}
				voice
				language={lang}
			/>
		</div>
		</>
	);
}
