"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Case pages derive their content from localStorage (via CaseProvider), which
 * only exists on the client. Without a gate, a full page load renders an empty
 * main on the server (no record yet) while the client immediately shows the
 * loader or the analysis — a hydration mismatch. Render one deterministic
 * placeholder on both sides until hydration completes, then reveal the real
 * content.
 */
export function CaseHydrationGate({ children }: { children: ReactNode }) {
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => setHydrated(true), []);

	if (!hydrated) {
		return <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6" />;
	}

	return <>{children}</>;
}
