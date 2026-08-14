import type { ReactNode } from "react";
import { CaseStepper } from "@/components/shell/CaseStepper";
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
      {children}
      <AssistantPill caseId={caseId} />
    </>
  );
}
