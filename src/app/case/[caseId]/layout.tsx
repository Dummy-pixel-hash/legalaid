import type { ReactNode } from "react";
import { CaseStepper } from "@/components/shell/CaseStepper";
import { CaseHydrationGate } from "@/components/shell/CaseHydrationGate";
import { AssistantPill } from "@/components/assistant/AssistantPill";

export default async function CaseLayout({
	children,
	params,
}: {
	children: ReactNode;
	params: Promise<{ caseId: string }>;
}) {
	const { caseId } = await params;
	return (
		<>
			<CaseStepper caseId={caseId} />
			{/* Case content (children + assistant) reads localStorage — gate it
			    past hydration so the server render matches the client's. */}
			<CaseHydrationGate>
				{children}
				<AssistantPill caseId={caseId} />
			</CaseHydrationGate>
		</>
	);
}
