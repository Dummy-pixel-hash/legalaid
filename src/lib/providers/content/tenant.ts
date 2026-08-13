/**
 * Tenant domain — mock analysis content (en + hi).
 */

import { getLocalSource } from "@/lib/providers/legal-source";
import type {
  CaseAnalysis,
  IntakeData,
  Language,
  LawReference,
} from "@/lib/types/domain";
import { buildTenantDocument } from "./document";
import { disclaimerFor, factLines, formatMoney, summarize } from "./shared";

function law(
  id: string,
  lang: Language,
  whyApplies: { en: string; hi: string },
): LawReference {
  const src = getLocalSource(id);
  return {
    id,
    act: src.act,
    section: src.section,
    title: src.title[lang],
    plainExplanation: src.plain[lang],
    whyApplies: whyApplies[lang],
    source: src.source,
  };
}

export function buildTenantAnalysis(ctx: {
  intake: IntakeData;
  lang: Language;
  id: string;
}): CaseAnalysis {
  const { intake, lang, id } = ctx;
  const hi = lang === "hi";
  const amt = formatMoney(intake.amount);
  const amtClause = amt
    ? hi
      ? ` सिक्योरिटी राशि ${amt} बताई गई है।`
      : ` The security amount is stated as ${amt}.`
    : "";
  const partyClause = intake.otherParty
    ? hi
      ? ` मकान मालिक के रूप में ${intake.otherParty} का नाम लिया गया है।`
      : ` ${intake.otherParty} is named as the landlord.`
    : "";

  const issues = [
    {
      id: "deposit-withheld",
      label: hi
        ? "बिना आइटमाइज़्ड दावे के सिक्योरिटी डिपॉज़िट रोकना"
        : "Security deposit withheld without itemized claim",
      kind: "possible-issue" as const,
      detail: hi
        ? `किरायेदारी समाप्त होने पर डिपॉज़िट लौटाना होता है, सिवाय सिद्ध और उचित कटौतियों के।${amtClause}${partyClause}`
        : `On the tenancy ending, the deposit must be returned except for proven, proper deductions.${amtClause}${partyClause}`,
    },
    {
      id: "no-agreement",
      label: hi ? "कोई लिखित समझौता नहीं" : "No written agreement",
      kind: "fact" as const,
      detail: hi
        ? "लिखित समझौते का न होना अधिकार खत्म नहीं करता — पर सबूत कमज़ोर करता है।"
        : "A missing written agreement does not remove rights — but it weakens proof.",
    },
    {
      id: "repairs-claim",
      label: hi
        ? "बिना सबूत 'मरम्मत' का दावा"
        : "'Repairs' claimed without proof",
      kind: "possible-issue" as const,
      detail: hi
        ? "कटौतियाँ वास्तविक और आइटमाइज़्ड होनी चाहिए — सिर्फ़ कहने से नहीं।"
        : "Deductions must be real and itemized — not just asserted.",
    },
  ];

  const rights = [
    {
      id: "right-deposit",
      title: hi ? "डिपॉज़िट वापस पाने का अधिकार" : "Right to refund of the deposit",
      plain: hi
        ? "किरायेदारी समाप्त होने पर डिपॉज़िट वापस मिलना चाहिए, सिवाय सिद्ध कटौतियों के।"
        : "The deposit should be returned when the tenancy ends, minus proven deductions.",
      linkedLaws: ["tpa-1882-s108", "tpa-1882-s111", "ica-1872-s73"],
    },
    {
      id: "right-notice",
      title: hi ? "उचित समाप्ति और सूचना का अधिकार" : "Right to proper termination and notice",
      plain: hi
        ? "लीज़ की समाप्ति नियमों और सूचना के अनुसार होनी चाहिए।"
        : "The lease must end according to the rules and notice period.",
      linkedLaws: ["tpa-1882-s106"],
    },
    {
      id: "right-state-law",
      title: hi ? "राज्य के किराया कानून की सुरक्षा" : "Protections under your state's rent law",
      plain: hi
        ? "आपके राज्य के किराया नियंत्रण कानून अतिरिक्त सुरक्षा दे सकते हैं — राज्य के अनुसार अलग।"
        : "Your state's rent-control law may offer additional protections — it varies by state.",
      linkedLaws: ["state-rent-act"],
    },
  ];

  const whyApplies: Record<string, { en: string; hi: string }> = {
    "tpa-1882-s105": {
      en: "Renting a flat for monthly rent creates a lease, even without a written document.",
      hi: "मासिक किराए पर फ्लैट लेना लीज़ बनाता है — लिखित दस्तावेज़ के बिना भी।",
    },
    "tpa-1882-s106": {
      en: "The lease's duration and the notice needed to end it are set here — important since you moved out after notice.",
      hi: "लीज़ की अवधि और उसे समाप्त करने की सूचना यहीं तय होती है — क्योंकि आपने सूचना देकर फ्लैट खाली किया।",
    },
    "tpa-1882-s108": {
      en: "Both sides' duties on termination are here — the landlord must account fairly for any security deposit after you hand back possession.",
      hi: "समाप्ति पर दोनों पक्षों के कर्तव्य यहाँ हैं — संपत्ति लौटाने पर मकान मालिक को सिक्योरिटी डिपॉज़िट का उचित हिसाब करना होता है।",
    },
    "tpa-1882-s111": {
      en: "Once the lease ends (by notice/agreement), holding the deposit without a valid reason becomes a question of liability.",
      hi: "लीज़ समाप्त होने पर (सूचना/सहमति से) बिना वैध कारण डिपॉज़िट रोकना दायित्व का सवाल बन जाता है।",
    },
    "ica-1872-s73": {
      en: "If withholding the deposit is a breach of the arrangement, compensation for the resulting loss can be claimed.",
      hi: "अगर डिपॉज़िट रोकना व्यवस्था का उल्लंघन है, तो हुए नुकसान की भरपाई माँगी जा सकती है।",
    },
    "mta-2021-deposit": {
      en: "The Model Tenancy Act proposes clear deposit rules — but only applies where your state adopted it. Flagged as demo guidance.",
      hi: "मॉडल टेनेंसी अधिनियम स्पष्ट डिपॉज़िट नियम सुझाता है — पर केवल वहीं लागू होता है जहाँ राज्य ने अपनाया हो। डेमो मार्गदर्शन के रूप में चिह्नित।",
    },
    "state-rent-act": {
      en: "Your state's rent law may add deposit protections — it varies by state, so this is flagged as guidance to verify.",
      hi: "आपके राज्य का किराया कानून अतिरिक्त डिपॉज़िट सुरक्षा दे सकता है — राज्य के अनुसार बदलता है, इसलिए पुष्टि के लिए चिह्नित।",
    },
  };

  const laws = [
    "tpa-1882-s105",
    "tpa-1882-s106",
    "tpa-1882-s108",
    "tpa-1882-s111",
    "ica-1872-s73",
    "mta-2021-deposit",
    "state-rent-act",
  ].map((id) => law(id, lang, whyApplies[id]));

  const uncertainty = [
    {
      id: "consumer-route",
      plain: hi
        ? "किरायेदार-मकान मालिक डिपॉज़िट दावे को उपभोक्ता आयोग 'सेवा' माने या नहीं — विभिन्न राज्यों में भिन्न है।"
        : "Whether a consumer forum treats a landlord–tenant deposit claim as a 'service' differs across states.",
      changesAnswer: hi
        ? "अगर माना जाए, तो उपभोक्ता आयोग भी एक रास्ता बन सकता है।"
        : "If accepted, the consumer forum could also be an option.",
      resolve: hi
        ? "पहले विधिक सहायता क्लिनिक से पूछें कि आपके राज्य में क्या चलता है।"
        : "Ask a legal aid clinic what works in your state first.",
    },
    {
      id: "repairs-proof",
      plain: hi
        ? "मकान मालिक 'मरम्मत' का दावा करता है — क्या वह उसे साबित कर सकता है, यही मुद्दा है।"
        : "The landlord claims 'repairs' — whether they can prove it is the question.",
      changesAnswer: hi
        ? "सिद्ध मरम्मत की राशि ही कटौती योग्य हो सकती है।"
        : "Only proven repair costs may be deductible.",
      resolve: hi
        ? "आइटमाइज़्ड हिसाब और रसीदें माँगें; अपने फोटो रखें।"
        : "Ask for an itemized bill; keep your photos.",
    },
    {
      id: "state-law",
      plain: hi
        ? "कौन-सा राज्य कानून लागू होता है, संपत्ति के स्थान और किराए पर निर्भर करता है।"
        : "Which state law applies depends on the property's location and rent.",
      changesAnswer: hi
        ? "अलग-अलग राज्यों में डिपॉज़िट नियम अलग-अलग होते हैं।"
        : "Deposit rules differ between states.",
      resolve: hi
        ? "राज्य विधिक सेवा प्राधिकरण से पुष्टि करें।"
        : "Confirm with the State Legal Services Authority.",
    },
  ];

  const evidence = [
    {
      id: "receipts",
      label: { en: "Rent receipts", hi: "किराए की रसीदें" },
      why: { en: "Prove the tenancy and the deposit.", hi: "किरायेदारी और डिपॉज़िट साबित करती हैं।" },
    },
    {
      id: "whatsapp",
      label: { en: "WhatsApp messages (deposit, move-out)", hi: "व्हाट्सएप संदेश (डिपॉज़िट, खाली करना)" },
      why: { en: "Record of terms and notice — screenshot now.", hi: "शर्तों और सूचना का रिकॉर्ड — स्क्रीनशॉट लें।" },
    },
    {
      id: "transfers",
      label: { en: "Bank/UPI transfers of the deposit", hi: "डिपॉज़िट के बैंक/UPI ट्रांसफर" },
      why: { en: "Prove the deposit amount and date.", hi: "डिपॉज़िट की राशि और तारीख़ साबित करते हैं।" },
    },
    {
      id: "moveout-photos",
      label: { en: "Move-out photos of the flat's condition", hi: "खाली करते समय फ्लैट की स्थिति के फोटो" },
      why: { en: "The strongest proof that there was no damage.", hi: "'कोई नुकसान नहीं' साबित करने के लिए सबसे ज़रूरी।" },
    },
    {
      id: "agreement",
      label: { en: "Any written agreement", hi: "कोई लिखित समझौता" },
      why: { en: "Look even if missing — a draft or email works.", hi: "न होने पर भी ढूँढ़ें — मसौदा या ईमेल भी चलेगा।" },
    },
    {
      id: "notices",
      label: { en: "Any notices received", hi: "मिली हुई कोई सूचना" },
      why: { en: "Records of the landlord's claims.", hi: "मकान मालिक के दावों का रिकॉर्ड।" },
    },
  ].map((e) => ({
    ...e,
    status: "unset" as const,
  }));

  const money = amt || "₹30,000";

  const steps = [
    {
      id: "demand",
      order: 1,
      title: hi ? "लिखित माँग भेजें" : "Send a written demand",
      plain: hi
        ? `ईमेल + व्हाट्सएप में ${money} की वापसी की तारीख़बद्ध माँग, 15 दिन की समय-सीमा के साथ।`
        : `A dated email + WhatsApp demand for the refund of ${money}, with a 15-day deadline.`,
      why: hi
        ? "साफ़ लिखित माँग अक्सर डिपॉज़िट विवाद सुलझा देती है और रिकॉर्ड बनाती है।"
        : "A clean written demand usually resolves deposit disputes and creates the record.",
      effort: "quick" as const,
      urgent: true,
    },
    {
      id: "itemized",
      order: 2,
      title: hi ? "कटौतियों का आइटमाइज़्ड हिसाब माँगें" : "Ask for an itemized list of deductions",
      plain: hi
        ? "हर कटौती के लिए रसीद/सबूत माँगें; बिना सबूत की कटौती पर सवाल उठाएँ।"
        : "Demand receipts/proof for every deduction; dispute anything unsubstantiated.",
      why: hi ? "केवल सिद्ध कटौतियाँ ही वैध होती हैं।" : "Only proven deductions are valid.",
      effort: "quick" as const,
    },
    {
      id: "notice",
      order: 3,
      title: hi ? "औपचारिक कानूनी नोटिस भेजें" : "Send a formal legal notice",
      plain: hi
        ? "अनदेखा करने पर डॉक्यूमेंट बिल्डर से नोटिस तैयार कर भेजें।"
        : "If ignored, draft and send the notice from the document builder.",
      why: hi ? "औपचारिक नोटिस अक्सर समाधान का अंतिम मौक़ा होता है।" : "A formal notice is often the final nudge.",
      effort: "moderate" as const,
    },
    {
      id: "forum",
      order: 4,
      title: hi ? "कानूनी रास्ते पर विचार करें" : "Consider the legal route",
      plain: hi
        ? "राज्य के नियमों के अनुसार उपयुक्त प्राधिकारी — पहले विधिक सहायता से पूछें।"
        : "The appropriate authority per your state — ask legal aid first.",
      why: hi ? "राज्य के अनुसार रास्ता अलग होता है।" : "The route varies by state.",
      effort: "long" as const,
    },
    {
      id: "legal-aid",
      order: 5,
      title: hi ? "विधिक सहायता लें" : "Get legal aid",
      plain: hi
        ? "राज्य विधिक सेवा प्राधिकरण (15100) मुफ़्त मदद देता है।"
        : "The State Legal Services Authority (15100) offers free help.",
      why: hi ? "सही रास्ते के लिए विशेषज्ञ सलाह।" : "Expert advice on the right route.",
      effort: "moderate" as const,
    },
  ];

  const document = buildTenantDocument(intake, lang);

  return {
    id,
    language: lang,
    domain: "tenant",
    caseSummary: hi
      ? `आपने बताया: ${summarize(intake.description)}`
      : `You told us: ${summarize(intake.description)}`,
    facts: factLines(intake, lang),
    issues,
    rights,
    laws,
    uncertainty,
    evidence,
    nextSteps: steps,
    document,
    disclaimer: disclaimerFor(lang),
    generatedAt: new Date().toISOString(),
  };
}
