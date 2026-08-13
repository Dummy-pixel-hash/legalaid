/**
 * Labour domain — mock analysis content (en + hi).
 */

import { getLocalSource } from "@/lib/providers/legal-source";
import type {
  CaseAnalysis,
  IntakeData,
  Language,
  LawReference,
} from "@/lib/types/domain";
import { buildLabourDocument } from "./document";
import { disclaimerFor, factLines, formatMoney, summarize } from "./shared";

function law(
  id: string,
  whyApplies: { en: string; hi: string },
): LawReference {
  const src = getLocalSource(id);
  return {
    id,
    act: src.act,
    section: src.section,
    title: src.title,
    plainExplanation: src.plain,
    whyApplies,
    source: src.source,
  };
}

export function buildLabourAnalysis(ctx: {
  intake: IntakeData;
  lang: Language;
  id: string;
}): CaseAnalysis {
  const { intake, lang, id } = ctx;
  const hi = lang === "hi";
  const amt = formatMoney(intake.amount);
  const amtClause = amt
    ? hi
      ? ` बकाया राशि लगभग ${amt} बताई गई है।`
      : ` The unpaid amount is stated as about ${amt}.`
    : "";
  const partyClause = intake.otherParty
    ? hi
      ? ` नियोक्ता के रूप में ${intake.otherParty} का नाम लिया गया है।`
      : ` ${intake.otherParty} is named as the employer.`
    : "";

  const issues = [
    {
      id: "unpaid-wages",
      label: { en: "Wages unpaid for months", hi: "कई महीनों से वेतन का भुगतान नहीं" },
      kind: "possible-issue" as const,
      detail: {
        en: `Receiving wages on time and in full for work done is a legal right.${amtClause}${partyClause}`,
        hi: `काम के बदले वेतन समय पर और पूरा मिलना कानूनी अधिकार है।${amtClause}${partyClause}`,
      },
    },
    {
      id: "pressure-resign",
      label: { en: "Pressure to resign without paying dues", hi: "बकाया चुकाए बिना इस्तीफ़ा देने का दबाव" },
      kind: "ai-interpretation" as const,
      detail: {
        en: "Pressuring you to resign to avoid dues may amount to forced termination — this is our interpretation; it depends on the facts.",
        hi: "बकाया वेतन से बचने के लिए इस्तीफ़े का दबाव ज़बरदस्ती समाप्ति के समान हो सकता है — यह हमारी व्याख्या है; यह तथ्यों पर निर्भर करेगा।",
      },
    },
    {
      id: "no-appointment-letter",
      label: { en: "No written appointment letter", hi: "कोई लिखित नियुक्ति पत्र नहीं" },
      kind: "fact" as const,
      detail: {
        en: "A missing letter weakens proof, but does not remove the right to wages.",
        hi: "लिखित पत्र न होने से सबूत कमज़ोर होता है, पर वेतन का अधिकार खत्म नहीं होता।",
      },
    },
  ];

  const rights = [
    {
      id: "right-wages",
      title: { en: "Right to full wages on time", hi: "समय पर पूरा वेतन पाने का अधिकार" },
      plain: {
        en: "Monthly wages must be paid before the 7th of the following month, without improper deductions.",
        hi: "मासिक वेतन अगले महीने की 7 तारीख़ से पहले, बिना अनुचित कटौती के मिलना चाहिए।",
      },
      linkedLaws: ["cow-2019-s17", "pwa-1936-s5"],
    },
    {
      id: "right-minimum-wage",
      title: { en: "Right to at least the minimum wage", hi: "न्यूनतम मज़दूरी का अधिकार" },
      plain: {
        en: "You cannot be paid less than the state's notified minimum wage.",
        hi: "राज्य के अधिसूचित न्यूनतम वेतन से कम नहीं मिल सकता।",
      },
      linkedLaws: ["mwa-1948-s12"],
    },
    {
      id: "right-recovery",
      title: { en: "Right to recover what is owed", hi: "बकाया वसूलने का अधिकार" },
      plain: {
        en: "There are faster, simpler routes to recover unpaid wages — no need for a full lawsuit.",
        hi: "बिना वेतन वसूलने के लिए तेज़, सरल रास्ते मौजूद हैं — पूरे मुकदमे की ज़रूरत नहीं।",
      },
      linkedLaws: ["ida-1947-s33c2"],
    },
    {
      id: "right-retrenchment",
      title: { en: "Protection against wrongful retrenchment (if applicable)", hi: "गलत छंटनी से सुरक्षा (यदि लागू)" },
      plain: {
        en: "After a year of continuous service, retrenchment requires notice and compensation.",
        hi: "एक वर्ष से अधिक सेवा के बाद छंटनी के लिए सूचना और मुआवज़ा अनिवार्य है।",
      },
      linkedLaws: ["ida-1947-s25f"],
    },
  ];

  const whyApplies: Record<string, { en: string; hi: string }> = {
    "cow-2019-s17": {
      en: "Monthly wages are payable before the 7th of the following month; several months of non-payment is a direct violation.",
      hi: "मासिक वेतन अगले महीने की 7 तारीख़ से पहले देय है; कई महीनों से न देना सीधा उल्लंघन है।",
    },
    "pwa-1936-s5": {
      en: "Where your state has not yet operationalized the Code on Wages, this older Act sets the same payment deadline.",
      hi: "जहाँ राज्य ने अभी संहिता लागू नहीं की, वहाँ यह पुराना अधिनियम वही भुगतान समय-सीमा तय करता है।",
    },
    "mwa-1948-s12": {
      en: "If your work is in a scheduled employment (common for factory/warehouse work), the notified minimum wage applies to you.",
      hi: "अगर आपका काम अनुसूचित रोज़गार में आता है (फैक्ट्री/गोदाम का काम आम तौर पर), तो अधिसूचित न्यूनतम मज़दूरी आप पर लागू होती है।",
    },
    "ida-1947-s33c2": {
      en: "Unpaid wages are 'money due' that a worker can recover in this simpler proceeding.",
      hi: "बिना वेतन 'देय राशि' है जिसे कर्मचारी इस सरल प्रक्रिया में वसूल सकता है।",
    },
    "ida-1947-s25f": {
      en: "Only relevant if you are dismissed: after continuous service of a year, dismissal without notice/pay and compensation is invalid.",
      hi: "केवल नौकरी से निकाले जाने पर प्रासंगिक: एक वर्ष की सेवा के बाद बिना सूचना/वेतन और मुआवज़े की छंटनी अमान्य है।",
    },
    "pga-1972-s4": {
      en: "Gratuity requires five years of continuous service — so with shorter service, this Act does NOT apply to you.",
      hi: "ग्रेच्युटी के लिए पाँच वर्ष की निरंतर सेवा चाहिए — इसलिए कम सेवा पर यह अधिनियम आप पर लागू नहीं होता।",
    },
  };

  const laws = [
    "cow-2019-s17",
    "pwa-1936-s5",
    "mwa-1948-s12",
    "ida-1947-s33c2",
    "ida-1947-s25f",
    "pga-1972-s4",
  ].map((id) => law(id, whyApplies[id]));

  const uncertainty = [
    {
      id: "code-vs-act",
      plain: {
        en: "Whether your state runs the Code on Wages or the older Act changes the citation, not the right.",
        hi: "आपके राज्य में Code on Wages लागू है या पुराना अधिनियम — इससे कानूनी संदर्भ बदलता है, अधिकार नहीं।",
      },
      changesAnswer: {
        en: "The claim goes under one law or the other; both protect the same right.",
        hi: "किसी एक कानून के अंतर्गत शिकायत करनी होगी; दोनों का उद्देश्य एक है।",
      },
      resolve: {
        en: "The Labour Commissioner's office or a legal aid clinic can tell you.",
        hi: "श्रम आयुक्त कार्यालय या विधिक सहायता क्लिनिक बता सकता है।",
      },
    },
    {
      id: "employment-status",
      plain: {
        en: "Whether your employment is in a 'scheduled' category affects a minimum-wage claim.",
        hi: "आपका रोज़गार 'अनुसूचित' श्रेणी में आता है या नहीं, यह न्यूनतम मज़दूरी के दावे को प्रभावित करता है।",
      },
      changesAnswer: {
        en: "If scheduled, a minimum-wage claim can also be added.",
        hi: "अगर श्रेणी में आता है, तो न्यूनतम मज़दूरी का दावा भी जुड़ सकता है।",
      },
      resolve: {
        en: "Check the minimum-wage notification of your state.",
        hi: "हरियाणा/अपने राज्य की न्यूनतम मज़दूरी अधिसूचना जाँचें।",
      },
    },
    {
      id: "constructive-termination",
      plain: {
        en: "Whether the resignation pressure counts as forced termination is fact-heavy.",
        hi: "इस्तीफ़े का दबाव 'जबरन समाप्ति' माना जाता है या नहीं, तथ्यों पर निर्भर करता है।",
      },
      changesAnswer: {
        en: "If it counts, retrenchment protections may also apply.",
        hi: "अगर माना जाए, तो छंटनी की सुरक्षाएँ भी लागू हो सकती हैं।",
      },
      resolve: {
        en: "Preserve evidence of the pressure (messages, witnesses).",
        hi: "दबाव के सबूत (संदेश, गवाह) सुरक्षित रखें।",
      },
    },
  ];

  const evidence = [
    {
      id: "bank-statement",
      label: { en: "Bank statement (salary credits)", hi: "बैंक स्टेटमेंट (वेतन जमा)" },
      why: { en: "Proves the employment and when payments stopped.", hi: "रोज़गार और वेतन रुकने की तारीख़ साबित करता है।" },
    },
    {
      id: "whatsapp",
      label: { en: "WhatsApp attendance/roster messages", hi: "व्हाट्सएप हाज़िरी/रोस्टर संदेश" },
      why: { en: "Proof of work — screenshot these now.", hi: "काम करने के सबूत — तुरंत स्क्रीनशॉट लें।" },
    },
    {
      id: "id-card",
      label: { en: "ID card / work badge", hi: "पहचान पत्र / बैज" },
      why: { en: "Identifies the employment.", hi: "रोज़गार की पहचान।" },
    },
    {
      id: "pay-slips",
      label: { en: "Pay slips for paid months", hi: "पिछले महीनों की सैलरी स्लिप" },
      why: { en: "Show the wage rate and pattern.", hi: "वेतन दर और पैटर्न दिखाती हैं।" },
    },
    {
      id: "appointment",
      label: { en: "Any appointment/offer letter", hi: "कोई भी नियुक्ति/ऑफ़र पत्र" },
      why: { en: "Even if missing, look for a copy.", hi: "न होने पर भी कोशिश करें — हो सकता है कोई प्रति मिले।" },
    },
    {
      id: "work-photos",
      label: { en: "Work-site photos + colleagues' contacts", hi: "कार्य स्थल के फोटो + सहकर्मियों के संपर्क" },
      why: { en: "Witnesses to corroborate the employment.", hi: "रोज़गार की पुष्टि के लिए गवाह।" },
    },
  ].map((e) => ({
    ...e,
    status: "unset" as const,
  }));

  const money = amt || "₹48,000";

  const steps = [
    {
      id: "preserve",
      order: 1,
      title: { en: "Preserve everything now", hi: "अभी सब कुछ सुरक्षित करें" },
      plain: {
        en: "Screenshot/back up WhatsApp, bank statements, and slips.",
        hi: "व्हाट्सएप, बैंक स्टेटमेंट, स्लिप — सबके स्क्रीनशॉट/प्रति बना लें।",
      },
      why: { en: "Evidence disappears with time.", hi: "सबूत समय के साथ गायब हो जाते हैं।" },
      effort: "quick" as const,
      urgent: true,
    },
    {
      id: "demand",
      order: 2,
      title: { en: "Send a written demand", hi: "लिखित माँग भेजें" },
      plain: {
        en: `Email + WhatsApp + signed letter demanding ${money}, with a 15-day deadline.`,
        hi: `${money} के भुगतान के लिए ईमेल + व्हाट्सएप + हस्ताक्षरित पत्र, 15 दिन की समय-सीमा के साथ।`,
      },
      why: { en: "A written demand creates a record and often unlocks payment.", hi: "लिखित माँग रिकॉर्ड बनाती है और अक्सर भुगतान खोल देती है।" },
      effort: "quick" as const,
      urgent: true,
    },
    {
      id: "commissioner",
      order: 3,
      title: { en: "Report to the Labour Commissioner", hi: "श्रम आयुक्त के पास शिकायत" },
      plain: {
        en: "A free conciliation route — employers usually respond.",
        hi: "मुफ़्त समाधान प्रक्रिया — नियोक्ता आम तौर पर जवाब देते हैं।",
      },
      why: { en: "A fast first step without a lawyer.", hi: "बिना वकील, तेज़ पहला कदम।" },
      effort: "moderate" as const,
    },
    {
      id: "recovery",
      order: 4,
      title: { en: "Legal recovery route", hi: "वसूली का कानूनी रास्ता" },
      plain: {
        en: "A claim before the wage authority or under ID Act §33C(2), per the applicable law.",
        hi: "लागू होने वाले कानून के अनुसार वेतन प्राधिकारी या औद्योगिक विवाद अधिनियम §33C(2) के अंतर्गत दावा।",
      },
      why: { en: "Faster and simpler than a full suit.", hi: "पूरे मुकदमे से तेज़ और सरल।" },
      effort: "moderate" as const,
    },
    {
      id: "retrenchment",
      order: 5,
      title: { en: "If dismissed improperly, challenge it", hi: "गलत तरीके से निकाला जाए तो चुनौती दें" },
      plain: {
        en: "Dismissal without notice/compensation can be invalid (only with a year+ of service).",
        hi: "बिना सूचना/मुआवज़े की छंटनी अमान्य हो सकती है (केवल एक वर्ष से अधिक सेवा पर)।",
      },
      why: { en: "Only relevant if you are dismissed.", hi: "यह कदम केवल नौकरी से निकाले जाने पर।" },
      effort: "long" as const,
    },
    {
      id: "legal-aid",
      order: 6,
      title: { en: "Get legal aid", hi: "विधिक सहायता लें" },
      plain: {
        en: "The State Legal Services Authority (15100) offers free help.",
        hi: "राज्य विधिक सेवा प्राधिकरण (15100) मुफ़्त मदद देता है।",
      },
      why: { en: "Free expert assistance.", hi: "मुफ़्त विशेषज्ञ सहायता।" },
      effort: "moderate" as const,
    },
  ];

  const document = buildLabourDocument(intake, lang);

  return {
    id,
    language: lang,
    domain: "labour",
    caseSummary: {
      en: `You told us: ${summarize(intake.description)}`,
      hi: `आपने बताया: ${summarize(intake.description)}`,
    },
    facts: factLines(intake),
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
