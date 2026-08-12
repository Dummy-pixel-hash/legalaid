/**
 * Generic fallback — used when no domain can be detected.
 * Deliberately minimal: no invented laws, one clear question instead of a guess.
 */

import type { CaseAnalysis, IntakeData, Language } from "@/lib/types/domain";
import { disclaimerFor, factLines, summarize, todayLabel } from "./shared";

export function buildGenericAnalysis(ctx: {
  intake: IntakeData;
  lang: Language;
  id: string;
}): CaseAnalysis {
  const { intake, lang, id } = ctx;
  const hi = lang === "hi";

  return {
    id,
    language: lang,
    domain: "other",
    caseSummary: hi
      ? `आपने बताया: ${summarize(intake.description)}`
      : `You told us: ${summarize(intake.description)}`,
    facts: factLines(intake, lang),
    issues: [
      {
        id: "domain-unknown",
        label: hi
          ? "हम पक्के तौर पर नहीं बता पा रहे कि यह किस क्षेत्र का मामला है"
          : "We can't yet tell which area of law this belongs to",
        kind: "ai-interpretation" as const,
        detail: hi
          ? "यह हमारी सीमा है, आपकी गलती नहीं। कृपया नीचे से वह क्षेत्र चुनें जो सबसे करीब लगे, और हम उसी के अनुसार विश्लेषण करेंगे।"
          : "This is our limitation, not your fault. Please pick the area below that sounds closest, and we'll analyse it properly.",
      },
    ],
    rights: [],
    laws: [],
    uncertainty: [
      {
        id: "domain",
        plain: hi
          ? "आपकी स्थिति उपभोक्ता, श्रम/रोज़गार या किरायेदारी में से किससे जुड़ी है — यही मुख्य अनिश्चितता है।"
          : "Whether your situation relates to consumer, labour/employment, or tenancy law is the main unknown.",
        changesAnswer: hi
          ? "सही क्षेत्र चुनने पर ही सटीक कानून और कदम मिल सकते हैं।"
          : "The right laws and steps depend on the correct area.",
        resolve: hi
          ? "नीचे से सबसे नज़दीकी क्षेत्र चुनें, या किसी विधिक सहायता क्लिनिक से पूछें।"
          : "Choose the closest area below, or ask a legal aid clinic.",
      },
    ],
    evidence: [
      {
        id: "messages",
        label: hi ? "संदेश/ईमेल (स्क्रीनशॉट)" : "Messages/emails (screenshots)",
        why: hi ? "किसी भी मामले में बातचीत का रिकॉर्ड काम आता है।" : "Conversation records help in any case.",
        status: "unset" as const,
      },
      {
        id: "payments",
        label: hi ? "भुगतान/लेन-देन के सबूत" : "Payment/transaction proofs",
        why: hi ? "राशि और तारीख़ें साबित करते हैं।" : "Prove amounts and dates.",
        status: "unset" as const,
      },
      {
        id: "documents",
        label: hi ? "कोई भी लिखित दस्तावेज़" : "Any written documents",
        why: hi ? "समझौते, रसीदें, पत्र — सब रखें।" : "Agreements, receipts, letters — keep them all.",
        status: "unset" as const,
      },
    ],
    nextSteps: [
      {
        id: "preserve",
        order: 1,
        title: hi ? "जो भी सबूत हैं, सुरक्षित रखें" : "Preserve whatever proof you have",
        plain: hi
          ? "संदेश, रसीदें, फोटो — सबकी प्रतियाँ बना लें।"
          : "Back up messages, receipts, and photos.",
        why: hi ? "सबूत समय के साथ गायब हो जाते हैं।" : "Evidence disappears with time.",
        effort: "quick" as const,
        urgent: true,
      },
      {
        id: "choose",
        order: 2,
        title: hi ? "अपना क्षेत्र चुनें" : "Choose your area",
        plain: hi
          ? "उपभोक्ता, श्रम या किरायेदारी — जो सबसे करीब लगे।"
          : "Consumer, labour, or tenancy — whichever sounds closest.",
        why: hi ? "इसी से हम सटीक कानूनी जानकारी दे पाएँगे।" : "So we can give you accurate legal information.",
        effort: "quick" as const,
      },
      {
        id: "legal-aid",
        order: 3,
        title: hi ? "विधिक सहायता लें" : "Get legal aid",
        plain: hi
          ? "राज्य विधिक सेवा प्राधिकरण (15100) मुफ़्त मदद देता है।"
          : "The State Legal Services Authority (15100) offers free help.",
        why: hi ? "विशेषज्ञ मार्गदर्शन सबसे सुरक्षित रास्ता है।" : "Expert guidance is the safest route.",
        effort: "moderate" as const,
      },
    ],
    document: {
      type: "other" as const,
      title: hi ? "दस्तावेज़" : "DOCUMENT",
      date: todayLabel(lang),
      fromParty: "[Your name and address]",
      toParty: hi ? "[दूसरे पक्ष का नाम और पता]" : "[Other party name and address]",
      subject: hi
        ? "विषय: मामले के समाधान के लिए अनुरोध"
        : "SUBJECT: REQUEST FOR RESOLUTION",
      sections: [
        {
          heading: hi ? "पृष्ठभूमि" : "BACKGROUND",
          body: hi
            ? `${summarize(intake.description)} हम इस मामले को सौहार्दपूर्ण ढंग से सुलझाना चाहते हैं।`
            : `${summarize(intake.description)} We wish to resolve this matter amicably.`,
        },
        {
          heading: hi ? "अनुरोध" : "REQUEST",
          body: hi
            ? "कृपया 15 दिनों के भीतर उपर्युक्त मामले का समाधान करें।"
            : "Please resolve the above matter within 15 days.",
        },
      ],
      legalReferences: [],
      remedy: hi ? "मामले का समाधान / उचित राहत।" : "Resolution of the matter / appropriate relief.",
      signature: { name: "[Your name]", role: "[Your address and contact]" },
      language: lang,
    },
    disclaimer: disclaimerFor(lang),
    generatedAt: new Date().toISOString(),
  };
}
