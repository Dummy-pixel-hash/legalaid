/**
 * Generic fallback — used when no domain can be detected.
 * Deliberately minimal: no invented laws, one clear question instead of a guess.
 */

import type { CaseAnalysis, IntakeData, Language } from "@/lib/types/domain";
import { buildGenericDocument } from "./document";
import { disclaimerFor, factLines, summarize } from "./shared";

export function buildGenericAnalysis(ctx: {
  intake: IntakeData;
  lang: Language;
  id: string;
}): CaseAnalysis {
  const { intake, lang, id } = ctx;

  return {
    id,
    language: lang,
    domain: "other",
    caseSummary: {
      en: `You told us: ${summarize(intake.description)}`,
      hi: `आपने बताया: ${summarize(intake.description)}`,
    },
    facts: factLines(intake),
    issues: [
      {
        id: "domain-unknown",
        label: {
          en: "We can't yet tell which area of law this belongs to",
          hi: "हम पक्के तौर पर नहीं बता पा रहे कि यह किस क्षेत्र का मामला है",
        },
        kind: "ai-interpretation" as const,
        detail: {
          en: "This is our limitation, not your fault. Please pick the area below that sounds closest, and we'll analyse it properly.",
          hi: "यह हमारी सीमा है, आपकी गलती नहीं। कृपया नीचे से वह क्षेत्र चुनें जो सबसे करीब लगे, और हम उसी के अनुसार विश्लेषण करेंगे।",
        },
      },
    ],
    rights: [],
    laws: [],
    uncertainty: [
      {
        id: "domain",
        plain: {
          en: "Whether your situation relates to consumer, labour/employment, or tenancy law is the main unknown.",
          hi: "आपकी स्थिति उपभोक्ता, श्रम/रोज़गार या किरायेदारी में से किससे जुड़ी है — यही मुख्य अनिश्चितता है।",
        },
        changesAnswer: {
          en: "The right laws and steps depend on the correct area.",
          hi: "सही क्षेत्र चुनने पर ही सटीक कानून और कदम मिल सकते हैं।",
        },
        resolve: {
          en: "Choose the closest area below, or ask a legal aid clinic.",
          hi: "नीचे से सबसे नज़दीकी क्षेत्र चुनें, या किसी विधिक सहायता क्लिनिक से पूछें।",
        },
      },
    ],
    evidence: [
      {
        id: "messages",
        label: { en: "Messages/emails (screenshots)", hi: "संदेश/ईमेल (स्क्रीनशॉट)" },
        why: { en: "Conversation records help in any case.", hi: "किसी भी मामले में बातचीत का रिकॉर्ड काम आता है।" },
        status: "unset" as const,
      },
      {
        id: "payments",
        label: { en: "Payment/transaction proofs", hi: "भुगतान/लेन-देन के सबूत" },
        why: { en: "Prove amounts and dates.", hi: "राशि और तारीख़ें साबित करते हैं।" },
        status: "unset" as const,
      },
      {
        id: "documents",
        label: { en: "Any written documents", hi: "कोई भी लिखित दस्तावेज़" },
        why: { en: "Agreements, receipts, letters — keep them all.", hi: "समझौते, रसीदें, पत्र — सब रखें।" },
        status: "unset" as const,
      },
    ],
    nextSteps: [
      {
        id: "preserve",
        order: 1,
        title: { en: "Preserve whatever proof you have", hi: "जो भी सबूत हैं, सुरक्षित रखें" },
        plain: { en: "Back up messages, receipts, and photos.", hi: "संदेश, रसीदें, फोटो — सबकी प्रतियाँ बना लें।" },
        why: { en: "Evidence disappears with time.", hi: "सबूत समय के साथ गायब हो जाते हैं।" },
        effort: "quick" as const,
        urgent: true,
      },
      {
        id: "choose",
        order: 2,
        title: { en: "Choose your area", hi: "अपना क्षेत्र चुनें" },
        plain: { en: "Consumer, labour, or tenancy — whichever sounds closest.", hi: "उपभोक्ता, श्रम या किरायेदारी — जो सबसे करीब लगे।" },
        why: { en: "So we can give you accurate legal information.", hi: "इसी से हम सटीक कानूनी जानकारी दे पाएँगे।" },
        effort: "quick" as const,
      },
      {
        id: "legal-aid",
        order: 3,
        title: { en: "Get legal aid", hi: "विधिक सहायता लें" },
        plain: { en: "The State Legal Services Authority (15100) offers free help.", hi: "राज्य विधिक सेवा प्राधिकरण (15100) मुफ़्त मदद देता है।" },
        why: { en: "Expert guidance is the safest route.", hi: "विशेषज्ञ मार्गदर्शन सबसे सुरक्षित रास्ता है।" },
        effort: "moderate" as const,
      },
    ],
    document: buildGenericDocument(intake, lang),
    disclaimer: disclaimerFor(lang),
    generatedAt: new Date().toISOString(),
  };
}
