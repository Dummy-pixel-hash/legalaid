/**
 * Speech-to-text route: forwards a client-recorded audio clip to Groq's
 * Whisper large-v3 transcription API and returns the transcript text.
 *
 * The Groq key stays on the server — the client only ever sees the resulting
 * text (or an error). Whisper large-v3 is multilingual; the client sends its
 * UI language as an ISO-639-1 hint so accuracy is better for the app's
 * English + Hindi users.
 *
 * Env (server-side only):
 *   GROQ_API_KEY — Groq console API key.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_MODEL = "whisper-large-v3";
const API_KEY = process.env.GROQ_API_KEY;

/** Groq caps file uploads at 25 MB; allow a little slack for multipart overhead. */
const MAX_UPLOAD_BYTES = 26 * 1024 * 1024;

/** ISO-639-1 language hints we accept — only the app's supported UI languages. */
const LANGUAGE_HINTS = new Set(["en", "hi"]);

export async function POST(req: Request) {
	if (!API_KEY) {
		return NextResponse.json(
			{ error: "speech-to-text is not configured" },
			{ status: 503 },
		);
	}

	// Coarse body-size cap before any parsing (mirrors /api/analyze).
	const contentLength = Number(req.headers.get("content-length") ?? 0);
	if (contentLength > MAX_UPLOAD_BYTES) {
		return NextResponse.json({ error: "audio too large" }, { status: 413 });
	}

	let form: FormData;
	try {
		form = await req.formData();
	} catch {
		return NextResponse.json({ error: "invalid upload" }, { status: 400 });
	}

	const file = form.get("file");
	if (!(file instanceof File)) {
		return NextResponse.json({ error: "missing audio file" }, { status: 400 });
	}
	if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
		return NextResponse.json(
			{ error: "audio file is empty or too large" },
			{ status: 413 },
		);
	}

	const rawLang = form.get("language");
	const language =
		typeof rawLang === "string" && LANGUAGE_HINTS.has(rawLang)
			? rawLang
			: undefined;

	const upstream = new FormData();
	upstream.append("file", file, file.name || "recording.webm");
	upstream.append("model", GROQ_MODEL);
	upstream.append("response_format", "json");
	upstream.append("temperature", "0");
	if (language) upstream.append("language", language);

	let res: Response;
	try {
		res = await fetch(GROQ_ENDPOINT, {
			method: "POST",
			headers: { Authorization: `Bearer ${API_KEY}` },
			body: upstream,
			signal: AbortSignal.timeout(90_000),
		});
	} catch (err) {
		console.error("groq transcription request failed", err);
		return NextResponse.json(
			{ error: "transcription service unreachable" },
			{ status: 502 },
		);
	}

	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		console.error(`groq transcription failed: ${res.status} ${detail}`);
		// 401/403 mean a bad key, not a bad request — never echo upstream details.
		if (res.status === 401 || res.status === 403) {
			return NextResponse.json(
				{ error: "speech-to-text auth error" },
				{ status: 502 },
			);
		}
		if (res.status === 429) {
			return NextResponse.json(
				{ error: "speech-to-text is busy, try again shortly" },
				{ status: 429 },
			);
		}
		return NextResponse.json(
			{ error: "transcription failed" },
			{ status: 502 },
		);
	}

	const body = (await res.json()) as { text?: unknown };
	const text = typeof body.text === "string" ? body.text.trim() : "";
	if (!text) {
		return NextResponse.json({ error: "no speech detected" }, { status: 422 });
	}
	return NextResponse.json({ text });
}
