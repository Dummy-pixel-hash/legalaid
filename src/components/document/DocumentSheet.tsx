"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { DocumentData } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

function Field({
  label,
  children,
  className,
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-50">
          {label}
        </p>
      )}
      {children}
    </div>
  );
}

function EditableText({
  value,
  onChange,
  multiline,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const base = cn(
    "w-full rounded-sm bg-transparent p-0.5 text-[14.5px] leading-[1.55] text-ink outline-none transition-colors focus:bg-accent/60 focus:outline-1 focus:outline-accent-strong",
    className,
  );
  if (multiline) {
    return (
      <textarea
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(base, "min-h-[80px] resize-y")}
      />
    );
  }
  return (
    <input
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={base}
    />
  );
}

export function DocumentSheet({
  doc,
  editing,
  onChange,
}: {
  doc: DocumentData;
  editing: boolean;
  onChange: (patch: Partial<DocumentData>) => void;
}) {
  const { t, lang } = useI18n();
  const serif =
    lang === "hi" ? "font-doc-hi" : "font-doc";

  return (
    <div
      className={cn(
        "doc-sheet mx-auto w-full max-w-[760px] rounded-md border border-line p-8 shadow-sm sm:p-12",
        serif,
      )}
    >
      <div className="border-b-2 border-ink pb-4">
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-ink-50">
          {lang === "hi" ? "कानूनी दस्तावेज़" : "LEGAL AID DOCUMENT"}
        </p>
      </div>

      <h1 className="mt-6 text-center text-[16px] font-semibold uppercase tracking-[0.04em] text-ink">
        {editing ? (
          <EditableText
            ariaLabel={t("documentTitle")}
            value={doc.title}
            onChange={(v) => onChange({ title: v })}
            className="text-center text-[16px] font-semibold uppercase tracking-[0.04em]"
          />
        ) : (
          doc.title
        )}
      </h1>

      <p className="mt-4 text-right text-[13px] text-ink-70">
        <span className="font-semibold">{t("dateLabel")}: </span>
        {doc.date}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label={t("fromParty")}>
          {editing ? (
            <EditableText
              multiline
              ariaLabel={t("fromParty")}
              value={doc.fromParty}
              onChange={(v) => onChange({ fromParty: v })}
            />
          ) : (
            <p className="whitespace-pre-line">{doc.fromParty}</p>
          )}
        </Field>
        <Field label={t("toParty")}>
          {editing ? (
            <EditableText
              multiline
              ariaLabel={t("toParty")}
              value={doc.toParty}
              onChange={(v) => onChange({ toParty: v })}
            />
          ) : (
            <p className="whitespace-pre-line">{doc.toParty}</p>
          )}
        </Field>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <Field label={t("subjectLabel")}>
          {editing ? (
            <EditableText
              ariaLabel={t("subjectLabel")}
              value={doc.subject}
              onChange={(v) => onChange({ subject: v })}
              className="font-semibold"
            />
          ) : (
            <p className="font-semibold">{doc.subject}</p>
          )}
        </Field>
      </div>

      <div className="mt-5 space-y-4">
        {doc.sections.map((section, i) => (
          <div key={i}>
            {editing ? (
              <EditableText
                ariaLabel={`${t("subjectLabel")} ${i + 1}`}
                value={section.heading}
                onChange={(v) => {
                  const sections = doc.sections.map((s, j) =>
                    j === i ? { ...s, heading: v } : s,
                  );
                  onChange({ sections });
                }}
                className="text-[11px] font-semibold uppercase tracking-[0.12em]"
              />
            ) : (
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink">
                {section.heading}
              </p>
            )}
            {editing ? (
              <EditableText
                multiline
                ariaLabel={`${section.heading} body`}
                value={section.body}
                onChange={(v) => {
                  const sections = doc.sections.map((s, j) =>
                    j === i ? { ...s, body: v } : s,
                  );
                  onChange({ sections });
                }}
                className="mt-1"
              />
            ) : (
              <p className="mt-1 whitespace-pre-line">{section.body}</p>
            )}
          </div>
        ))}
      </div>

      {doc.legalReferences.length > 0 && (
        <div className="mt-6 border-t border-line pt-4">
          <Field label={t("legalReferencesLabel")}>
            <ul className="mt-1 space-y-1">
              {doc.legalReferences.map((ref) => (
                <li key={ref} className="text-[13px] leading-relaxed">
                  • {ref}
                </li>
              ))}
            </ul>
          </Field>
        </div>
      )}

      <div className="mt-5">
        <Field label={t("remedyLabel")}>
          {editing ? (
            <EditableText
              multiline
              ariaLabel={t("remedyLabel")}
              value={doc.remedy}
              onChange={(v) => onChange({ remedy: v })}
            />
          ) : (
            <p className="whitespace-pre-line">{doc.remedy}</p>
          )}
        </Field>
      </div>

      <div className="mt-10 flex justify-end">
        <div className="w-64 text-center">
          <div className="border-t border-ink pt-2">
            <p className="text-[14px] font-semibold">{doc.signature.name}</p>
            <p className="text-[12px] text-ink-70">{doc.signature.role}</p>
          </div>
        </div>
      </div>

      <p className="mt-8 border-t border-line pt-3 text-center text-[10px] uppercase tracking-[0.08em] text-ink-50">
        {t("documentFooterDisclaimer")} · LegalAId · 15100
      </p>
    </div>
  );
}
