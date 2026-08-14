"use client";

import { useCallback, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { useCase } from "@/lib/store/case-store";
import { getProvider } from "@/lib/providers";
import {
	buildAssistantContext,
	type AssistantPage,
} from "@/lib/assistant-context";
import type { AssistantMessage } from "@/lib/providers/legal-analysis";
import type { DocumentData } from "@/lib/types/domain";

/** A chat turn rendered in the assistant window. */
export interface ChatTurn {
	role: "user" | "assistant";
	content: string;
}

/** Only the latest turns are replayed to the model per question. */
const MAX_HISTORY = 8;

/**
 * Case-aware assistant chat logic, backed by the PERSISTENT per-case thread in
 * the case store (localStorage) — the conversation survives navigation between
 * case pages and page reloads. The in-flight answer streams in component state
 * and is committed to the store only when complete.
 */
export function useAssistantChat(opts: {
	caseId: string;
	page: AssistantPage;
	document?: DocumentData;
}) {
	const { caseId, page, document } = opts;
	const { lang } = useI18n();
	const { record, analysis, appendAssistantMessage, clearAssistantThread } =
		useCase(caseId, lang);
	const [streamingText, setStreamingText] = useState("");
	const [error, setError] = useState(false);
	const [input, setInput] = useState("");
	const [busy, setBusy] = useState(false);
	const busyRef = useRef(false); // synchronous double-submit guard (async-only)

	const thread: ChatTurn[] = record?.assistantThread ?? [];

	const send = useCallback(
		async (raw: string) => {
			const q = raw.trim();
			if (!q || busyRef.current || !record || !analysis) return;
			setError(false);
			const history: AssistantMessage[] = record.assistantThread
				.slice(-MAX_HISTORY)
				.map((m) => ({ role: m.role, content: m.content }));
			appendAssistantMessage(caseId, { role: "user", content: q });
			setInput("");
			setStreamingText("");
			busyRef.current = true;
			setBusy(true);
			try {
				const answer = await getProvider().askAssistant(
					{
						context: buildAssistantContext(record, analysis, lang, document),
						question: q,
						history,
						lang,
						page,
					},
					(delta) => setStreamingText((prev) => prev + delta),
				);
				appendAssistantMessage(caseId, { role: "assistant", content: answer });
			} catch {
				setError(true);
			} finally {
				busyRef.current = false;
				setBusy(false);
				setStreamingText("");
			}
		},
		[caseId, page, document, lang, record, analysis, appendAssistantMessage],
	);

	const clear = useCallback(() => {
		clearAssistantThread(caseId);
		setError(false);
		setInput("");
	}, [caseId, clearAssistantThread]);

	return {
		thread,
		streamingText,
		error,
		input,
		setInput,
		send,
		clear,
		busy,
		ready: Boolean(record?.baseAnalysis),
	};
}
