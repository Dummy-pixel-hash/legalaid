"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

/**
 * Record-to-text mic button. Records audio with the browser MediaRecorder,
 * uploads it to /api/transcribe (Groq Whisper large-v3, server-side), and
 * hands the transcript to the caller via onTranscribed.
 *
 * Multilingual: passes the current UI language as an ISO-639-1 hint so Whisper
 * transcribes English or Hindi speech more accurately.
 */

const MAX_RECORDING_MS = 60_000; // auto-stop long recordings

type Status = "idle" | "recording" | "transcribing" | "error";

interface VoiceInputProps {
	/** Receives the transcribed text; the caller decides where it goes. */
	onTranscribed: (text: string) => void;
	/** ISO-639-1 hint, e.g. the current UI language. */
	language?: "en" | "hi";
	disabled?: boolean;
	/** Icon-only variant for cramped composers (aria-label/title still carry the state). */
	iconOnly?: boolean;
	className?: string;
}

export function VoiceInput({
	onTranscribed,
	language,
	disabled,
	iconOnly,
	className,
}: VoiceInputProps) {
	const { t } = useI18n();
	const [status, setStatus] = useState<Status>("idle");
	const [error, setError] = useState<string | null>(null);
	const recorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const tracksRef = useRef<MediaStreamTrack[]>([]);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const cleanup = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		if (recorderRef.current && recorderRef.current.state !== "inactive") {
			recorderRef.current.stop();
		}
		for (const track of tracksRef.current) track.stop();
		tracksRef.current = [];
	}, []);

	useEffect(() => cleanup, [cleanup]);

	const fail = useCallback((msg: string) => {
		setError(msg);
		setStatus("error");
	}, []);

	const stop = useCallback(() => {
		const recorder = recorderRef.current;
		cleanup();
		if (!recorder) {
			setStatus("idle");
			return;
		}
		// dataavailable chunks were collected while recording; onstop uploads them.
	}, [cleanup]);

	const upload = useCallback(async () => {
		const blob = new Blob(chunksRef.current, {
			type: chunksRef.current[0]?.type || "audio/webm",
		});
		chunksRef.current = [];
		if (blob.size === 0) {
			fail(t("voiceEmpty"));
			return;
		}
		setStatus("transcribing");
		const form = new FormData();
		form.append("file", blob, "recording.webm");
		if (language) form.append("language", language);
		try {
			const res = await fetch("/api/transcribe", {
				method: "POST",
				body: form,
			});
			const body = (await res.json().catch(() => ({}))) as {
				text?: string;
				error?: string;
			};
			if (!res.ok) {
				fail(body.error ? t("voiceError") : t("voiceError"));
				return;
			}
			const text = (body.text ?? "").trim();
			if (!text) {
				fail(t("voiceEmpty"));
				return;
			}
			setError(null);
			setStatus("idle");
			onTranscribed(text);
		} catch {
			fail(t("voiceError"));
		}
	}, [fail, language, onTranscribed, t]);

	const start = useCallback(async () => {
		setError(null);
		if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
			fail(t("voiceUnsupported"));
			return;
		}
		let stream: MediaStream;
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		} catch {
			fail(t("voicePermission"));
			return;
		}
		tracksRef.current = stream.getTracks();

		const preferred = window.MediaRecorder.isTypeSupported(
			"audio/webm;codecs=opus",
		)
			? "audio/webm;codecs=opus"
			: window.MediaRecorder.isTypeSupported("audio/webm")
				? "audio/webm"
				: "";
		let recorder: MediaRecorder;
		try {
			recorder = preferred
				? new MediaRecorder(stream, { mimeType: preferred })
				: new MediaRecorder(stream);
		} catch {
			cleanup();
			fail(t("voiceUnsupported"));
			return;
		}
		recorderRef.current = recorder;
		chunksRef.current = [];
		recorder.addEventListener("dataavailable", (e) => {
			if (e.data.size > 0) chunksRef.current.push(e.data);
		});
		recorder.addEventListener("stop", () => void upload());
		recorder.start();
		setStatus("recording");
		// Auto-stop: never leave a recording running indefinitely.
		timerRef.current = setTimeout(() => stop(), MAX_RECORDING_MS);
	}, [cleanup, fail, stop, t, upload]);

	const onClick = () => {
		if (status === "recording") stop();
		else if (status === "transcribing" || disabled) return;
		else void start();
	};

	const busy = status === "transcribing";
	const label =
		status === "recording"
			? t("voiceRecording")
			: status === "transcribing"
				? t("voiceTranscribing")
				: t("voiceLabel");

	return (
		<span className={className}>
			<Button
				type="button"
				variant={status === "recording" ? "destructive" : "outline"}
				size="sm"
				onClick={onClick}
				disabled={busy || disabled}
				aria-label={label}
				title={label}
				aria-live="polite"
			>
				{status === "transcribing" ? (
					<Loader2 className="animate-spin" aria-hidden />
				) : status === "recording" ? (
					<Square className="fill-current" aria-hidden />
				) : (
					<Mic aria-hidden />
				)}
				{!iconOnly && (
					<span className="hidden sm:inline">
						{status === "recording" ? t("voiceRecording") : t("voiceLabel")}
					</span>
				)}
			</Button>
			{error && status === "error" && (
				<span
					className="mt-1.5 block max-w-[24rem] text-xs text-destructive"
					role="alert"
				>
					{error}
				</span>
			)}
		</span>
	);
}
