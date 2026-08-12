import { BadgeCheck, BookOpenCheck, Lock, Phone, ShieldAlert } from "lucide-react";
import { DisclaimerBanner } from "@/components/analysis/DisclaimerBanner";

export default function LegalInfoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Legal info
      </h1>
      <p className="mt-3 text-base leading-relaxed text-ink-70">
        LegalAId is a free tool that helps you understand a legal problem in
        plain language. It is not a lawyer, and it does not give legal advice.
      </p>

      <div className="mt-8 space-y-6">
        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <BookOpenCheck className="h-4.5 w-4.5 text-accent-strong" aria-hidden />
            What LegalAId is
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-70">
            A guided explainer that restates your situation, points to the laws
            and sections that may apply (with plain-language explanations),
            helps you gather evidence, suggests next steps, and drafts a
            document you can edit.
          </p>
        </section>

        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <ShieldAlert className="h-4.5 w-4.5 text-status-caution" aria-hidden />
            What LegalAId is not
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-70">
            Not a substitute for qualified legal advice. Not a prediction of
            case outcomes. Not a court filing service. Nothing on this site
            creates a lawyer–client relationship.
          </p>
        </section>

        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <BadgeCheck className="h-4.5 w-4.5 text-status-success" aria-hidden />
            Where the legal information comes from
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-70">
            Every citation is drawn from a versioned registry of legal sources.
            Verified entries are real Act/Code sections (e.g. Consumer
            Protection Act, 2019 §35). Where the law is uncertain,
            state-specific, or advisory, we mark it as{" "}
            <span className="font-medium text-status-demo">
              “Demo — verify with an expert”
            </span>{" "}
            and never present it as established law.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-status-neutral-bg px-2 py-0.5 text-[11px] font-medium text-status-neutral">
              <BadgeCheck className="h-3 w-3" aria-hidden /> Verified
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-status-demo-bg px-2 py-0.5 text-[11px] font-medium text-status-demo">
              <ShieldAlert className="h-3 w-3" aria-hidden /> Demo — verify with an expert
            </span>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <Phone className="h-4.5 w-4.5 text-accent-strong" aria-hidden />
            Getting real help
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-70">
            For free legal aid, contact the State Legal Services Authority
            helpline: <span className="font-semibold text-ink">15100</span>.
            Legal aid clinics and universities also provide free assistance.
          </p>
        </section>

        <section className="rounded-lg border border-line bg-surface p-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
            <Lock className="h-4.5 w-4.5 text-accent-strong" aria-hidden />
            Privacy
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-70">
            The MVP runs entirely on your device — your situation is never sent
            to a server. In future versions, when AI processing moves to a
            server, we will update this page first.
          </p>
        </section>

        <DisclaimerBanner />
      </div>
    </div>
  );
}
