/**
 * Consumer domain — mock analysis content (en + hi).
 * Built from the verified source registry; user facts injected where relevant.
 */

import { getLocalSource } from "@/lib/providers/legal-source";
import type {
  CaseAnalysis,
  IntakeData,
  Language,
  LawReference,
} from "@/lib/types/domain";
import { buildConsumerDocument } from "./document";
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

export function buildConsumerAnalysis(ctx: {
  intake: IntakeData;
  lang: Language;
  id: string;
}): CaseAnalysis {
  const { intake, lang, id } = ctx;
  const hi = lang === "hi";
  const amt = formatMoney(intake.amount);
  const amtClause = amt ? (hi ? ` आपने लगभग ${amt} की खरीदारी का उल्लेख किया है।` : ` You mentioned a purchase of about ${amt}.`) : "";
  const partyClause = intake.otherParty
    ? hi
      ? ` आपने ${intake.otherParty} का नाम लिया है।`
      : ` You named ${intake.otherParty} as the party.`
    : "";

  const issues = [
    {
      id: "defect-warranty",
      label: hi
        ? "वारंटी में खराब उत्पाद, मरम्मत/बदलने से इनकार"
        : "Defective product within warranty, refusal to repair or replace",
      kind: "possible-issue" as const,
      detail: hi
        ? `उत्पाद वारंटी अवधि में खराब हुआ और विक्रेता/निर्माता मरम्मत या बदलने से इनकार कर रहे हैं।${amtClause}${partyClause}`
        : `The product failed within the warranty period and the seller/manufacturer is refusing to repair or replace it.${amtClause}${partyClause}`,
    },
    {
      id: "misleading-warranty",
      label: hi
        ? "भ्रामक वारंटी शर्तें (निर्माण तिथि से गिनना)"
        : "Misleading warranty terms (counted from manufacture date)",
      kind: "ai-interpretation" as const,
      detail: hi
        ? "वारंटी को निर्माण तिथि से गिनना, जबकि खरीदार ने बाद में खरीदा, भ्रामक हो सकता है। यह हमारी व्याख्या है — अंतिम राय आयोग की होगी।"
        : "Counting the warranty from the manufacture date, when the buyer purchased later, may be misleading. This is our interpretation — a commission would decide.",
    },
    {
      id: "food-loss",
      label: hi
        ? "खराब होने से हुआ खाने/सामान का नुकसान"
        : "Loss of stored food/goods due to the defect",
      kind: "possible-issue" as const,
      detail: hi
        ? "खराबी से हुआ नुकसान मुआवज़े का आधार बन सकता है, लेकिन इसे साबित करना ज़रूरी है। राशि छोटी होने पर यह आयोग के विवेक पर निर्भर करेगा।"
        : "Loss caused by the defect can support a compensation claim, but it must be proved. If the amount is small, it is at the commission's discretion.",
    },
  ];

  const rights = [
    {
      id: "right-repair",
      title: hi ? "मरम्मत, बदलने या रिफ़ंड का अधिकार" : "Right to repair, replacement, or refund",
      plain: hi
        ? "दोष के आधार पर आप उत्पाद की मरम्मत, बदलने या कीमत वापस माँग सकते हैं।"
        : "Depending on the defect, you may ask for repair, replacement, or a refund of the price.",
      linkedLaws: ["cpa-2019-s39"],
    },
    {
      id: "right-complaint",
      title: hi ? "जिला उपभोक्ता आयोग में शिकायत का अधिकार" : "Right to file before the District Commission",
      plain: hi
        ? "आप अपने निवास, कार्य या विक्रेता के स्थान पर जिला उपभोक्ता आयोग में शिकायत दर्ज कर सकते हैं — बिना वकील के भी।"
        : "You can file a complaint at the District Consumer Commission where you live, work, or the seller operates — without a lawyer.",
      linkedLaws: ["cpa-2019-s35"],
    },
    {
      id: "right-unfair",
      title: hi ? "अनुचित व्यवहार के विरुद्ध अधिकार" : "Protection against unfair trade practice",
      plain: hi
        ? "झूठे वादे या भ्रामक वारंटी अनुचित व्यापार व्यवहार हो सकते हैं, जिनके ख़िलाफ़ शिकायत की जा सकती है।"
        : "False promises or misleading warranty terms can amount to an unfair trade practice you can complain about.",
      linkedLaws: ["cpa-2019-s2-42"],
    },
  ];

  const whyApplies: Record<string, { en: string; hi: string }> = {
    "cpa-2019-s2-7": {
      en: "You bought the product for a price, so you are a consumer under this Act — including the online purchase.",
      hi: "आपने कीमत देकर उत्पाद खरीदा है, इसलिए इस अधिनियम के अंतर्गत आप उपभोक्ता हैं — ऑनलाइन खरीदारी भी शामिल है।",
    },
    "cpa-2019-s2-10": {
      en: "A failing compressor within warranty is a defect in the product's promised quality.",
      hi: "वारंटी में कंप्रेसर का खराब होना उत्पाद की बताई गई गुणवत्ता में दोष है।",
    },
    "cpa-2019-s2-42": {
      en: "Refusing to honour the stated warranty period may be an unfair trade practice.",
      hi: "बताई गई वारंटी अवधि का पालन करने से इनकार करना अनुचित व्यापार व्यवहार हो सकता है।",
    },
    "cpa-2019-s35": {
      en: "A consumer complaint about a defective product is filed here; jurisdiction is where you live or work, or where the seller operates.",
      hi: "खराब उत्पाद की उपभोक्ता शिकायत यहीं दर्ज होती है; अधिकार-क्षेत्र आपके निवास, कार्य या विक्रेता के स्थान पर होता है।",
    },
    "cpa-2019-s39": {
      en: "Repair, replacement, refund, and compensation are the reliefs this section lets the commission order.",
      hi: "मरम्मत, बदलना, रिफ़ंड और मुआवज़ा — ये वे राहतें हैं जो यह धारा आयोग को आदेश करने देती है।",
    },
    "ecom-rules-2020-r6": {
      en: "Since you bought through a marketplace, the seller's duties — including warranty and refund obligations — remain enforceable against the seller.",
      hi: "चूँकि आपने मार्केटप्लेस से खरीदा है, विक्रेता के कर्तव्य — वारंटी और रिफ़ंड दायित्वों सहित — विक्रेता के विरुद्ध लागू किए जा सकते हैं।",
    },
  };

  const laws = [
    "cpa-2019-s2-7",
    "cpa-2019-s2-10",
    "cpa-2019-s2-42",
    "cpa-2019-s35",
    "cpa-2019-s39",
    "ecom-rules-2020-r6",
  ].map((id) => law(id, lang, whyApplies[id]));

  const uncertainty = [
    {
      id: "marketplace-liability",
      plain: hi
        ? "मार्केटप्लेस की ज़िम्मेदारी इस बात पर निर्भर करती है कि वह सिर्फ़ मंच है या स्वयं विक्रेता भी।"
        : "Whether the marketplace is liable depends on whether it is only a platform or also the seller.",
      changesAnswer: hi
        ? "अगर मार्केटप्लेस स्वयं विक्रेता नहीं है, तो मुख्य दावा विक्रेता/निर्माता के विरुद्ध होगा।"
        : "If the marketplace is not the seller, the main claim lies against the seller/manufacturer.",
      resolve: hi
        ? "ऑर्डर की रसीद में 'विक्रेता' का नाम देखें; किसी विधिक सहायता क्लिनिक से पुष्टि करें।"
        : "Check the 'sold by' name on your order receipt; confirm with a legal aid clinic.",
    },
    {
      id: "warranty-period",
      plain: hi
        ? "वारंटी की शुरुआत (खरीद बनाम निर्माण तिथि) विवाद का केंद्र है।"
        : "When the warranty starts (purchase vs. manufacture date) is the central dispute.",
      changesAnswer: hi
        ? "अगर आयोग माने कि वारंटी खरीद से गिनी जाएगी, तो दावा वारंटी के भीतर है।"
        : "If the commission reads the warranty from purchase, the claim is within warranty.",
      resolve: hi
        ? "वारंटी कार्ड, रसीद और बिक्री विज्ञापन की प्रतियाँ रखें।"
        : "Keep the warranty card, receipt, and the product listing/ads.",
    },
    {
      id: "food-loss",
      plain: hi
        ? "खराब खाने का नुकसान वसूलना हमेशा संभव नहीं होता।"
        : "Recovering the value of spoiled food is not always possible.",
      changesAnswer: hi
        ? "सबूत (फोटो, रसीदें) और राशि के आधार पर आयोग मुआवज़ा दे सकता है या नहीं।"
        : "Depending on proof (photos, bills) and the amount, the commission may or may not award it.",
      resolve: hi
        ? "नुकसान के फोटो और खरीद रसीदें तुरंत सुरक्षित करें।"
        : "Immediately preserve photos of the loss and purchase bills.",
    },
  ];

  const evidence = [
    {
      id: "invoice",
      label: { en: "Order receipt / invoice", hi: "ऑर्डर रसीद / इन्वॉइस" },
      why: { en: "Proves the purchase date, price, and seller.", hi: "खरीद की तारीख़, कीमत और विक्रेता का नाम साबित करती है।" },
    },
    {
      id: "warranty",
      label: { en: "Warranty card / policy", hi: "वारंटी कार्ड / शर्तें" },
      why: { en: "Shows the warranty period and its terms.", hi: "वारंटी अवधि और उसकी शर्तें दिखाता है।" },
    },
    {
      id: "service-reports",
      label: { en: "Service visit reports / technician notes", hi: "सर्विस विज़िट रिपोर्ट / तकनीशियन नोट्स" },
      why: { en: "Record the defect and attempts to fix it.", hi: "दोष का रिकॉर्ड और उसे ठीक करने की कोशिशें साबित करते हैं।" },
    },
    {
      id: "complaints",
      label: { en: "Written complaints to seller/brand", hi: "विक्रेता/ब्रांड को लिखी शिकायतें" },
      why: { en: "Dated record that you asked for help and were refused.", hi: "तारीख़ के साथ दिखाता है कि आपने मदद माँगी और जवाब नहीं मिला।" },
    },
    {
      id: "photos",
      label: { en: "Photos/videos of the defect", hi: "दोष के फोटो/वीडियो" },
      why: { en: "Visual proof of the defect — take these now.", hi: "खराबी का दृश्य सबूत — समय पर लें, सबसे ज़रूरी।" },
    },
    {
      id: "bank-statement",
      label: { en: "Bank/UPI statement", hi: "बैंक/UPI स्टेटमेंट" },
      why: { en: "Proves the payment.", hi: "₹18,500 का भुगतान साबित करता है।" },
    },
  ].map((e) => ({
    ...e,
    status: "unset" as const,
  }));

  const steps = [
    {
      id: "gather",
      order: 1,
      title: hi ? "इन्वॉइस और सर्विस रिपोर्ट जुटाएँ" : "Gather the invoice and service reports",
      plain: hi
        ? "खरीद और दोष का सबूत इकट्ठा करें। स्क्रीनशॉट भी चलते हैं।"
        : "Collect proof of purchase and of the defect. Screenshots count.",
      why: hi
        ? "सबूत के बिना कोई भी दावा कमज़ोर होता है।"
        : "Without proof, any claim is weak.",
      effort: "quick" as const,
      urgent: true,
    },
    {
      id: "demand",
      order: 2,
      title: hi ? "विक्रेता और ब्रांड को लिखित माँग भेजें" : "Send a written demand to seller and brand",
      plain: hi
        ? "ईमेल + लिखित पत्र: मरम्मत/बदलने/रिफ़ंड के लिए 15 दिन दें।"
        : "Email + letter: give 15 days for repair/replacement/refund.",
      why: hi
        ? "लिखित माँग अक्सर समस्या सुलझा देती है और रिकॉर्ड बनाती है।"
        : "A written demand often resolves it and creates a record.",
      effort: "quick" as const,
      urgent: true,
    },
    {
      id: "nch",
      order: 3,
      title: hi ? "राष्ट्रीय उपभोक्ता हेल्पलाइन (1915) पर शिकायत" : "Complain to the National Consumer Helpline (1915)",
      plain: hi
        ? "मुफ़्त पहला कदम — कंपनियाँ हेल्पलाइन शिकायतों का जवाब देती हैं।"
        : "A free first step — companies often respond to helpline complaints.",
      why: hi ? "तेज़, मुफ़्त, और कई बार पर्याप्त।" : "Fast, free, and often enough.",
      effort: "quick" as const,
    },
    {
      id: "commission",
      order: 4,
      title: hi ? "जिला उपभोक्ता आयोग में शिकायत" : "File a complaint with the District Commission",
      plain: hi
        ? "हल न होने पर आयोग में शिकायत — छोटी फीस, बिना वकील संभव।"
        : "If unresolved, file before the District Commission — small fee, possible without a lawyer.",
      why: hi
        ? "यह आयोग मरम्मत/रिफ़ंड/मुआवज़े का आदेश दे सकता है।"
        : "The commission can order repair/refund/compensation.",
      effort: "moderate" as const,
    },
    {
      id: "legal-aid",
      order: 5,
      title: hi ? "ज़रूरत पड़े तो विधिक सहायता लें" : "Get legal aid if needed",
      plain: hi
        ? "राज्य विधिक सेवा प्राधिकरण (15100) से मुफ़्त मदद मिल सकती है।"
        : "The State Legal Services Authority (15100) can help for free.",
      why: hi ? "विशेषज्ञ मार्गदर्शन से फ़ाइलिंग आसान होती है।" : "Expert guidance makes filing easier.",
      effort: "moderate" as const,
    },
  ];

  const document = buildConsumerDocument(intake, lang);

  return {
    id,
    language: lang,
    domain: "consumer",
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
