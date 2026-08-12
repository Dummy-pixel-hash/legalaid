import type { ReactNode } from "react";
import { CaseStepper } from "@/components/shell/CaseStepper";

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
    </>
  );
}
