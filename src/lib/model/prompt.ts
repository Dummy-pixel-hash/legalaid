/**
 * Builds the analysis prompts for the model backend.
 * Law citations are constrained to the provided registry sources (PRODUCT.md §7:
 * never invent a legal section).
 *
 * The analysis is split into 4 independent sections so the model backend's
 * parallel slots can generate them concurrently (each section gets its own
 * grammar-constrained JSON Schema). The `document` section carries the
 * first-draft legal document, so the hot path never needs a second model call.
 */

import type { IntakeData, Language } from "@/lib/types/domain";
import type { LegalSource } from "@/lib/legal/sources";
import type { ChatMessage } from "./chat";

function intakeContext(intake: IntakeData, lang: Language): string {
  const lines: string[] = [`Description: ${intake.description.trim()}`];
  if (intake.amount !== undefined && intake.amount > 0)
    lines.push(`Amount involved: ₹${intake.amount}`);
  if (intake.otherParty) lines.push(`Other party: ${intake.otherParty}`);
  if (intake.state) lines.push(`State: ${intake.state}`);
  if (intake.dates?.length)
    lines.push(`Dates: ${intake.dates.map((d) => d.date).join(", ")}`);
  void lang;
  return lines.join("\n");
}

function sourcesContext(sources: LegalSource[], lang: Language): string {
  return JSON.stringify(
    sources.map((s) => ({
      id: s.id,
      act: s.act,
      section: s.section,
      title: s.title[lang],
      plain: s.plain[lang],
      verified: s.source.verified,
    })),
    null,
    2,
  );
}

const SYSTEM = (lang: Language) => `You are LegalAId's legal analysis engine. You help a person in India facing a legal problem for the first time understand what may be happening, what their rights are, and what to do next.

Respond entirely in this language: ${lang === "hi" ? "Hindi (or natural Hinglish)" : "English"}.

RULES — follow strictly:
1. Write in PLAIN language a first-time litigant can read. No legal jargon without explaining it.
2. Be honest about uncertainty. Never present a guess as established law. Mark confidence honestly.
3. LAW CITATIONS: You may reference ONLY the law sources provided, by their exact "id". NEVER invent or import any act/section not in the provided list. A source marked "verified":false is guidance (state-specific or model/advisory law) — present it as "may apply — check with an expert / your state may differ", never as established law.
4. Confidence kinds (issue.kind): "fact" = what the user stated or is established; "possible-issue" = a plausible issue, not a ruling; "legal-info" = general cited law; "ai-interpretation" = your own reading.
5. Evidence items: set status to "need-to-find" (the user sets the real status later). Keep 4-7 focused items tied to this situation.
6. The document is a first-draft legal notice/complaint in the user's language. Use the user's own facts. Put each chosen law as "Act, section" text in legalReferences (e.g. "Transfer of Property Act, 1882 — §105").
7. Keep it concise and actionable: 3-5 issues, 2-4 rights, 2-4 uncertainties, 4-5 next steps, 3-4 document sections.
8. "lawIds" entries: "id" MUST be one of the provided source ids; "whyApplies" explains, in the user's language, why that law may apply to THIS situation.
9. For rights.linkedLaws use only provided source ids.

Respond with ONLY a single valid JSON object — no markdown fences, no extra text, no reasoning in the response.`;

/** Field descriptions mirror the wording of the original single SCHEMA. */
const CORE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    caseSummary: {
      type: "string",
      description: "a 1-3 sentence plain restatement of what the user told you",
    },
    issues: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", description: "short-slug" },
          label: { type: "string", description: "short title" },
          kind: {
            type: "string",
            enum: ["fact", "possible-issue", "legal-info", "ai-interpretation"],
            description:
              'fact = what the user stated or is established; possible-issue = a plausible issue, not a ruling; legal-info = general cited law; ai-interpretation = your own reading',
          },
          detail: {
            type: "string",
            description: "2-3 sentences, plain, tied to their facts",
          },
        },
        required: ["id", "label", "kind", "detail"],
      },
    },
    rights: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", description: "short-slug" },
          title: { type: "string", description: "short title" },
          plain: { type: "string", description: "1-2 sentences plain" },
          linkedLaws: {
            type: "array",
            items: { type: "string" },
            description: "use only provided source ids",
          },
        },
        required: ["id", "title", "plain", "linkedLaws"],
      },
    },
    lawIds: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: {
            type: "string",
            description: "one of the provided source ids",
          },
          whyApplies: {
            type: "string",
            description: "1-2 sentences why it applies to this situation",
          },
        },
        required: ["id", "whyApplies"],
      },
    },
  },
  required: ["caseSummary", "issues", "rights", "lawIds"],
};

const RISK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    uncertainty: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", description: "short-slug" },
          plain: { type: "string", description: "what is uncertain" },
          changesAnswer: {
            type: "string",
            description: "what would change the answer",
          },
          resolve: { type: "string", description: "how to find out" },
        },
        required: ["id", "plain", "changesAnswer", "resolve"],
      },
    },
    evidence: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", description: "short-slug" },
          label: {
            type: "object",
            additionalProperties: false,
            properties: {
              en: { type: "string", description: "evidence name in English" },
              hi: { type: "string", description: "evidence name in Hindi (or natural Hinglish)" },
            },
            required: ["en", "hi"],
            description: "evidence name in BOTH English and Hindi",
          },
          why: {
            type: "object",
            additionalProperties: false,
            properties: {
              en: { type: "string", description: "why it matters, in English" },
              hi: { type: "string", description: "why it matters, in Hindi (or natural Hinglish)" },
            },
            required: ["en", "hi"],
            description: "why it matters, in BOTH English and Hindi",
          },
          status: {
            type: "string",
            enum: ["need-to-find", "have", "dont-have", "unset"],
            description: "need-to-find by default; the user sets the real status later",
          },
          note: { type: "string", description: "" },
        },
        required: ["id", "label", "why", "status", "note"],
      },
    },
  },
  required: ["uncertainty", "evidence"],
};

const STEPS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    nextSteps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", description: "short-slug" },
          order: { type: "integer", description: "1" },
          title: { type: "string", description: "short title" },
          plain: { type: "string", description: "what to do" },
          why: { type: "string", description: "why this step" },
          effort: {
            type: "string",
            enum: ["quick", "moderate", "long"],
            description: "quick|moderate|long",
          },
          urgent: { type: "boolean", description: "false" },
        },
        required: ["id", "order", "title", "plain", "why", "effort", "urgent"],
      },
    },
  },
  required: ["nextSteps"],
};

const DOC_SYSTEM = (lang: Language) => `You are LegalAId's legal document engine. You draft a first-draft legal notice/complaint in plain, formal language for a first-time litigant in India.

Respond entirely in this language: ${lang === "hi" ? "Hindi (or natural Hinglish)" : "English"}.

RULES — follow strictly:
1. Use the user's OWN facts from their description. Do not invent facts.
2. LAW REFERENCES: You may cite ONLY the law sources provided, by their exact "Act, section" text. NEVER invent or import any act/section not in the provided list.
3. Sections should be clearly headed and concise (3-4 sections).
4. "fromParty" is the user's placeholder "[Your name and address]"; "toParty" is the other party named by the user, or a placeholder.
5. The remedy is what the user is asking for (refund, replacement, payment, etc.).

Respond with ONLY a single valid JSON object — no markdown fences, no extra text, no reasoning in the response.`;

const DOC_SCHEMA = `{
  "type": "legal-notice|consumer-complaint|labour-complaint|other",
  "title": "DOCUMENT TITLE",
  "subject": "SUBJECT LINE",
  "fromParty": "[Your name and address]",
  "toParty": "the other party or [their name and address]",
  "sections": [{ "heading": "SECTION HEADING", "body": "paragraph using their facts" }],
  "legalReferences": ["Act, section text"],
  "remedy": "the remedy being asked for",
  "signature": { "name": "[Your name]", "role": "[Your address and contact]" }
}`;

/** The document draft, wrapped under a single "document" key. */
const DOC_SECTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    document: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: {
          type: "string",
          enum: ["legal-notice", "consumer-complaint", "labour-complaint", "other"],
          description: "legal-notice|consumer-complaint|labour-complaint|other",
        },
        title: { type: "string", description: "DOCUMENT TITLE" },
        subject: { type: "string", description: "SUBJECT LINE" },
        fromParty: { type: "string", description: "[Your name and address]" },
        toParty: {
          type: "string",
          description: "the other party or [their name and address]",
        },
        sections: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              heading: { type: "string", description: "SECTION HEADING" },
              body: {
                type: "string",
                description: "paragraph using their facts",
              },
            },
            required: ["heading", "body"],
          },
        },
        legalReferences: {
          type: "array",
          items: { type: "string" },
          description: "Act, section text",
        },
        remedy: { type: "string", description: "the remedy being asked for" },
        signature: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string", description: "[Your name]" },
            role: { type: "string", description: "[Your address and contact]" },
          },
          required: ["name", "role"],
        },
      },
      required: [
        "type",
        "title",
        "subject",
        "fromParty",
        "toParty",
        "sections",
        "legalReferences",
        "remedy",
        "signature",
      ],
    },
  },
  required: ["document"],
};

export type AnalysisSection = "core" | "risk" | "steps" | "document";

export interface SectionSpec {
  section: AnalysisSection;
  messages: ChatMessage[];
  schema: object; // JSON Schema for grammar-constrained output
  name: string; // json_schema "name"
  maxTokens: number;
}

/** Build the user-turn for one section: intake, optional sources, output keys. */
function sectionUser(opts: {
  intake: IntakeData;
  lang: Language;
  keys: string;
  sources?: LegalSource[];
  extra?: string;
}): string {
  const parts = [`USER'S SITUATION:\n${intakeContext(opts.intake, opts.lang)}`];
  if (opts.sources && opts.sources.length > 0) {
    parts.push(
      `LAW SOURCES AVAILABLE (use ONLY these ids):\n${sourcesContext(opts.sources, opts.lang)}`,
    );
  }
  if (opts.extra) parts.push(opts.extra);
  parts.push(
    `OUTPUT — respond with ONLY a single valid JSON object containing exactly these keys: ${opts.keys}. No markdown fences, no extra text, no reasoning.`,
  );
  return parts.join("\n\n");
}

/**
 * The analysis sections that run first, in parallel: core (summary, issues,
 * rights, law choices), risk (uncertainty + bilingual evidence checklist) and
 * steps. The document is built separately, after these settle, so the letter
 * can be grounded in the completed analysis (see buildDocumentSection).
 */
export function buildSectionPrompts(opts: {
  intake: IntakeData;
  lang: Language;
  lawSources: LegalSource[];
}): SectionSpec[] {
  const { intake, lang, lawSources } = opts;
  return [
    {
      section: "core",
      name: "core",
      maxTokens: 2048,
      schema: CORE_SCHEMA,
      messages: [
        { role: "system", content: SYSTEM(lang) },
        {
          role: "user",
          content: sectionUser({
            intake,
            lang,
            keys: '"caseSummary", "issues", "rights", "lawIds"',
            sources: lawSources,
          }),
        },
      ],
    },
    {
      section: "risk",
      name: "risk",
      maxTokens: 1024,
      schema: RISK_SCHEMA,
      messages: [
        { role: "system", content: SYSTEM(lang) },
        {
          role: "user",
          content: sectionUser({
            intake,
            lang,
            keys: '"uncertainty", "evidence"',
            extra:
              "EVIDENCE CHECKLIST: this list is the case's canonical evidence checklist, shown in both languages — for EVERY evidence item write the \"label\" and \"why\" text in BOTH English and Hindi (label.en + label.hi, why.en + why.hi). Keep 4-7 focused items with stable short ids.",
          }),
        },
      ],
    },
    {
      section: "steps",
      name: "steps",
      maxTokens: 768,
      schema: STEPS_SCHEMA,
      messages: [
        { role: "system", content: SYSTEM(lang) },
        {
          role: "user",
          content: sectionUser({
            intake,
            lang,
            keys: '"nextSteps"',
          }),
        },
      ],
    },
  ];
}

/**
 * The document section — built AFTER core/risk/steps complete, so the draft
 * letter takes the full analysis (summary, issues, rights, chosen laws,
 * uncertainties, evidence, next steps) into account, not just the intake.
 */
export function buildDocumentSection(opts: {
  intake: IntakeData;
  lang: Language;
  lawSources: LegalSource[];
  context: Record<string, unknown>;
}): SectionSpec {
  const { intake, lang, lawSources, context } = opts;
  const contextJson = JSON.stringify(context, null, 1);
  return {
    section: "document",
    name: "document",
    maxTokens: 1024,
    schema: DOC_SECTION_SCHEMA,
    messages: [
      { role: "system", content: DOC_SYSTEM(lang) },
      {
        role: "user",
        content: sectionUser({
          intake,
          lang,
          keys: '"document"',
          sources: lawSources,
          extra:
            "ANALYSIS FINDINGS (use these to ground the document — reference the identified issues, the chosen laws, the amounts and the requested remedy):\n" +
            contextJson,
        }),
      },
    ],
  };
}

export function buildDocumentPrompt(opts: {
  intake: IntakeData;
  lang: Language;
  lawSources: LegalSource[];
}): ChatMessage[] {
  const { intake, lang, lawSources } = opts;
  return [
    { role: "system", content: DOC_SYSTEM(lang) },
    {
      role: "user",
      content: `USER'S SITUATION:\n${intakeContext(intake, lang)}\n\nLAW SOURCES AVAILABLE (use ONLY these):\n${sourcesContext(
        lawSources,
        lang,
      )}\n\nOUTPUT EXACTLY THIS JSON SHAPE:\n${DOC_SCHEMA}\n\nRespond with ONLY the JSON object.`,
    },
  ];
}
