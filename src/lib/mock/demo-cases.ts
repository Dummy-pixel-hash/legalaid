/**
 * Demo cases — realistic bilingual walkthroughs (see MOCK_DATA.md).
 * These are built through the same content builders as user intakes.
 */

import type { CaseAnalysis, Domain, IntakeData, Language } from "@/lib/types/domain";
import { buildConsumerAnalysis } from "@/lib/providers/content/consumer";
import { buildLabourAnalysis } from "@/lib/providers/content/labour";
import { buildTenantAnalysis } from "@/lib/providers/content/tenant";

export interface DemoCase {
  id: string;
  domain: Domain;
  intake: IntakeData;
  analysis: (lang: Language) => CaseAnalysis;
}

function makeDemo(
  id: string,
  domain: Domain,
  intake: IntakeData,
  build: (
    ctx: { intake: IntakeData; lang: Language; id: string },
  ) => CaseAnalysis,
): DemoCase {
  return {
    id,
    domain,
    intake,
    analysis: (lang) => build({ intake, lang, id }),
  };
}

export const DEMO_CASES: Record<string, DemoCase> = {
  "demo-consumer": makeDemo(
    "demo-consumer",
    "consumer",
    {
      description:
        "I bought a refrigerator online from a big marketplace for ₹18,500 last year. It has a 1-year warranty. The compressor stopped working twice — the second time it was completely spoiled and it ruined my stored food. The seller says the brand must handle it, and the brand says my warranty is over because they count from the manufacturing date. Nobody will repair or replace it.",
      domain: "consumer",
      amount: 18500,
      state: "Jaipur, Rajasthan",
      otherParty: "the online seller and the brand",
      dates: [{ label: "Purchased", date: "June last year" }],
    },
    buildConsumerAnalysis,
  ),
  "demo-labour": makeDemo(
    "demo-labour",
    "labour",
    {
      description:
        "I work as a warehouse loader in Faridabad for ₹16,000 a month. My employer has not paid my salary for the last 3 months — about ₹48,000. When I asked, they said business is slow. Now they are pressuring me to 'resign voluntarily'. I have no appointment letter. I have my ID card, attendance records on WhatsApp, and my old salary slips.",
      domain: "labour",
      amount: 48000,
      state: "Faridabad, Haryana",
      otherParty: "my employer",
      dates: [{ label: "Wages unpaid since", date: "about 3 months ago" }],
    },
    buildLabourAnalysis,
  ),
  "demo-tenant": makeDemo(
    "demo-tenant",
    "tenant",
    {
      description:
        "I rented a flat in Bengaluru for ₹15,000 a month and paid a ₹30,000 security deposit. I stayed 14 months and moved out after giving notice. The flat was in the same condition — I have photos. My landlord refuses to return my deposit, saying 'there were repairs'. There is no written agreement, but I have rent receipts and our WhatsApp messages about the deposit and the move-out.",
      domain: "tenant",
      amount: 30000,
      state: "Bengaluru, Karnataka",
      otherParty: "my landlord",
      dates: [{ label: "Moved out", date: "after 14 months" }],
    },
    buildTenantAnalysis,
  ),
};

export function isDemoId(id: string): boolean {
  return id in DEMO_CASES;
}

export function getDemoIntake(id: string): IntakeData | undefined {
  return DEMO_CASES[id]?.intake;
}

/** Example chips shown on the home page and intake — real scenarios from the demo cases. */
export const EXAMPLE_SCENARIOS: {
  key: string;
  labelEn: string;
  labelHi: string;
  en: string;
  hi: string;
  demo?: string;
}[] = [
  {
    key: "deposit",
    labelEn: "Landlord won't return my deposit",
    labelHi: "मकान मालिक डिपॉज़िट नहीं लौटा रहा",
    en: "My landlord hasn't returned my ₹30,000 security deposit even though I moved out and there was no damage.",
    hi: "मेरे मकान मालिक ने मेरी ₹30,000 की सिक्योरिटी डिपॉज़िट नहीं लौटाई, जबकि मैंने फ्लैट खाली कर दिया और कोई नुकसान नहीं था।",
    demo: "demo-tenant",
  },
  {
    key: "salary",
    labelEn: "3 months' salary unpaid",
    labelHi: "3 महीने का वेतन नहीं मिला",
    en: "My employer hasn't paid my salary for 3 months — about ₹48,000 — and is pressuring me to resign.",
    hi: "मेरे नियोक्ता ने 3 महीने का मेरा वेतन — लगभग ₹48,000 — नहीं दिया और इस्तीफ़ा देने का दबाव बना रहे हैं।",
    demo: "demo-labour",
  },
  {
    key: "refrigerator",
    labelEn: "Broken fridge, no warranty help",
    labelHi: "खराब फ्रिज, वारंटी में मदद नहीं",
    en: "My refrigerator broke twice within its 1-year warranty and the seller and brand both refuse to replace it.",
    hi: "मेरा फ्रिज 1 साल की वारंटी में दो बार खराब हुआ और विक्रेता व ब्रांड दोनों बदलने से इनकार कर रहे हैं।",
    demo: "demo-consumer",
  },
];
