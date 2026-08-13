/**
 * Shared helpers for mock analysis content.
 */

import type { BilingualText, Domain, IntakeData, Language } from "@/lib/types/domain";
import { DISCLAIMERS } from "@/lib/legal/disclaimers";

export const DOMAIN_KEYWORDS: Record<Domain, { en: string[]; hi: string[] }> = {
  consumer: {
    en: [
      "bought", "purchased", "ordered", "order", "refund", "product", "warranty",
      "delivery", "delivered", "online", "shop", "store", "company", "seller",
      "defective", "damaged", "broken", "refuse to replace", "defect", "quality",
    ],
    hi: [
      "खरीदा", "खरीद", "ऑर्डर", "रिफ़ंड", "उत्पाद", "वारंटी", "डिलीवरी",
      "ऑनलाइन", "दुकान", "विक्रेता", "खराब", "टूटा", "गुणवत्ता", "बदलने",
    ],
  },
  labour: {
    en: [
      "salary", "wages", "wage", "employer", "job", "fired", "retrenchment",
      "resign", "resignation", "pf", "provident", "esi", "overtime", "notice period",
      "unpaid", "pay", "labour", "worker", "employee", "office", "company", "factory",
    ],
    hi: [
      "वेतन", "सैलरी", "नौकरी", "नियोक्ता", "मालिक", "इस्तीफ़ा", "निकाला",
      "छंटनी", "पीएफ", "प्रोविडेंट", "मज़दूरी", "कर्मचारी", "फैक्ट्री", "काम",
    ],
  },
  tenant: {
    en: [
      "landlord", "rent", "deposit", "evict", "eviction", "vacate", "flat",
      "apartment", "tenant", "rented", "tenancy", "notice", "security deposit", "owner",
    ],
    hi: [
      "मकान", "मकान मालिक", "किराया", "डिपॉज़िट", "सिक्योरिटी", "बेदखली",
      "खाली", "फ्लैट", "किरायेदार", "मालिक", "सूचना",
    ],
  },
};

export function detectDomain(text: string): Domain | undefined {
  const lower = text.toLowerCase();
  const scores = (Object.keys(DOMAIN_KEYWORDS) as Domain[]).map((d) => {
    const kw = DOMAIN_KEYWORDS[d];
    const hits =
      kw.en.filter((k) => lower.includes(k.toLowerCase())).length +
      kw.hi.filter((k) => lower.includes(k)).length;
    return { d, hits };
  });
  const best = scores.sort((a, b) => b.hits - a.hits)[0];
  return best && best.hits > 0 ? best.d : undefined;
}

export function formatMoney(amount: number | undefined): string {
  if (amount === undefined || Number.isNaN(amount)) return "";
  return `₹${amount.toLocaleString("en-IN")}`;
}

const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_HI = [
  "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
  "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर",
];

export function todayLabel(lang: Language): string {
  const d = new Date();
  const months = lang === "hi" ? MONTHS_HI : MONTHS_EN;
  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return lang === "hi" ? `${day} ${month} ${year}` : `${day} ${month} ${year}`;
}

export function disclaimerFor(lang: Language): string {
  return DISCLAIMERS[lang];
}

/** Trim a long description to a readable summary. */
export function summarize(description: string, max = 420): string {
  const clean = description.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

export function factLines(intake: IntakeData): BilingualText[] {
  const facts: BilingualText[] = [];
  const amt = formatMoney(intake.amount);
  if (amt) {
    facts.push({
      en: `Amount involved: approximately ${amt}`,
      hi: `शामिल राशि: लगभग ${amt}`,
    });
  }
  if (intake.state) {
    facts.push({
      en: `Location: ${intake.state}`,
      hi: `स्थान: ${intake.state}`,
    });
  }
  if (intake.otherParty) {
    facts.push({
      en: `Other party: ${intake.otherParty}`,
      hi: `दूसरा पक्ष: ${intake.otherParty}`,
    });
  }
  if (intake.dates && intake.dates.length > 0) {
    const dates = intake.dates
      .map((d) => (d.date ? `${d.label}: ${d.date}` : d.label))
      .join(", ");
    facts.push({
      en: `Key dates: ${dates}`,
      hi: `महत्वपूर्ण तारीख़ें: ${dates}`,
    });
  }
  return facts;
}

export function emptyFactsHint(lang: Language): string {
  return lang === "hi"
    ? "हमने आपके बताए अनुसार आपकी स्थिति को नीचे दोहराया है। अगर कुछ गलत है, तो 'मेरी स्थिति संपादित करें' दबाएँ।"
    : "We restated your situation below exactly as you told us. If anything is wrong, use 'Edit my situation'.";
}
