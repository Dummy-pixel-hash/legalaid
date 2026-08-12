/**
 * Labour domain — mock analysis content (en + hi).
 */

import { LEGAL_SOURCES } from "@/lib/legal/sources";
import type {
  CaseAnalysis,
  IntakeData,
  Language,
  LawReference,
} from "@/lib/types/domain";
import {
  disclaimerFor,
  factLines,
  formatMoney,
  summarize,
  todayLabel,
} from "./shared";

function law(
  id: string,
  lang: Language,
  whyApplies: { en: string; hi: string },
): LawReference {
  const src = LEGAL_SOURCES.find((s) => s.id === id);
  if (!src) throw new Error(`Unknown legal source: ${id}`);
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
      label: hi ? "कई महीनों से वेतन का भुगतान नहीं" : "Wages unpaid for months",
      kind: "possible-issue" as const,
      detail: hi
        ? `काम के बदले वेतन समय पर और पूरा मिलना कानूनी अधिकार है।${amtClause}${partyClause}`
        : `Receiving wages on time and in full for work done is a legal right.${amtClause}${partyClause}`,
    },
    {
      id: "pressure-resign",
      label: hi
        ? "बकाया चुकाए बिना इस्तीफ़ा देने का दबाव"
        : "Pressure to resign without paying dues",
      kind: "ai-interpretation" as const,
      detail: hi
        ? "बकाया वेतन से बचने के लिए इस्तीफ़े का दबाव ज़बरदस्ती समाप्ति के समान हो सकता है — यह हमारी व्याख्या है; यह तथ्यों पर निर्भर करेगा।"
        : "Pressuring you to resign to avoid dues may amount to forced termination — this is our interpretation; it depends on the facts.",
    },
    {
      id: "no-appointment-letter",
      label: hi
        ? "कोई लिखित नियुक्ति पत्र नहीं"
        : "No written appointment letter",
      kind: "fact" as const,
      detail: hi
        ? "लिखित पत्र न होने से सबूत कमज़ोर होता है, पर वेतन का अधिकार खत्म नहीं होता।"
        : "A missing letter weakens proof, but does not remove the right to wages.",
    },
  ];

  const rights = [
    {
      id: "right-wages",
      title: hi ? "समय पर पूरा वेतन पाने का अधिकार" : "Right to full wages on time",
      plain: hi
        ? "मासिक वेतन अगले महीने की 7 तारीख़ से पहले, बिना अनुचित कटौती के मिलना चाहिए।"
        : "Monthly wages must be paid before the 7th of the following month, without improper deductions.",
      linkedLaws: ["cow-2019-s17", "pwa-1936-s5"],
    },
    {
      id: "right-minimum-wage",
      title: hi ? "न्यूनतम मज़दूरी का अधिकार" : "Right to at least the minimum wage",
      plain: hi
        ? "राज्य के अधिसूचित न्यूनतम वेतन से कम नहीं मिल सकता।"
        : "You cannot be paid less than the state's notified minimum wage.",
      linkedLaws: ["mwa-1948-s12"],
    },
    {
      id: "right-recovery",
      title: hi ? "बकाया वसूलने का अधिकार" : "Right to recover what is owed",
      plain: hi
        ? "बिना वेतन वसूलने के लिए तेज़, सरल रास्ते मौजूद हैं — पूरे मुकदमे की ज़रूरत नहीं।"
        : "There are faster, simpler routes to recover unpaid wages — no need for a full lawsuit.",
      linkedLaws: ["ida-1947-s33c2"],
    },
    {
      id: "right-retrenchment",
      title: hi ? "गलत छंटनी से सुरक्षा (यदि लागू)" : "Protection against wrongful retrenchment (if applicable)",
      plain: hi
        ? "एक वर्ष से अधिक सेवा के बाद छंटनी के लिए सूचना और मुआवज़ा अनिवार्य है।"
        : "After a year of continuous service, retrenchment requires notice and compensation.",
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
  ].map((id) => law(id, lang, whyApplies[id]));

  const uncertainty = [
    {
      id: "code-vs-act",
      plain: hi
        ? "आपके राज्य में Code on Wages लागू है या पुराना अधिनियम — इससे कानूनी संदर्भ बदलता है, अधिकार नहीं।"
        : "Whether your state runs the Code on Wages or the older Act changes the citation, not the right.",
      changesAnswer: hi
        ? "किसी एक कानून के अंतर्गत शिकायत करनी होगी; दोनों का उद्देश्य एक है।"
        : "The claim goes under one law or the other; both protect the same right.",
      resolve: hi
        ? "श्रम आयुक्त कार्यालय या विधिक सहायता क्लिनिक बता सकता है।"
        : "The Labour Commissioner's office or a legal aid clinic can tell you.",
    },
    {
      id: "employment-status",
      plain: hi
        ? "आपका रोज़गार 'अनुसूचित' श्रेणी में आता है या नहीं, यह न्यूनतम मज़दूरी के दावे को प्रभावित करता है।"
        : "Whether your employment is in a 'scheduled' category affects a minimum-wage claim.",
      changesAnswer: hi
        ? "अगर श्रेणी में आता है, तो न्यूनतम मज़दूरी का दावा भी जुड़ सकता है।"
        : "If scheduled, a minimum-wage claim can also be added.",
      resolve: hi
        ? "हरियाणा/अपने राज्य की न्यूनतम मज़दूरी अधिसूचना जाँचें।"
        : "Check the minimum-wage notification of your state.",
    },
    {
      id: "constructive-termination",
      plain: hi
        ? "इस्तीफ़े का दबाव 'जबरन समाप्ति' माना जाता है या नहीं, तथ्यों पर निर्भर करता है।"
        : "Whether the resignation pressure counts as forced termination is fact-heavy.",
      changesAnswer: hi
        ? "अगर माना जाए, तो छंटनी की सुरक्षाएँ भी लागू हो सकती हैं।"
        : "If it counts, retrenchment protections may also apply.",
      resolve: hi
        ? "दबाव के सबूत (संदेश, गवाह) सुरक्षित रखें।"
        : "Preserve evidence of the pressure (messages, witnesses).",
    },
  ];

  const evidence = [
    {
      id: "bank-statement",
      label: hi ? "बैंक स्टेटमेंट (वेतन जमा)" : "Bank statement (salary credits)",
      why: hi
        ? "रोज़गार और वेतन रुकने की तारीख़ साबित करता है।"
        : "Proves the employment and when payments stopped.",
    },
    {
      id: "whatsapp",
      label: hi ? "व्हाट्सएप हाज़िरी/रोस्टर संदेश" : "WhatsApp attendance/roster messages",
      why: hi ? "काम करने के सबूत — तुरंत स्क्रीनशॉट लें।" : "Proof of work — screenshot these now.",
    },
    {
      id: "id-card",
      label: hi ? "पहचान पत्र / बैज" : "ID card / work badge",
      why: hi ? "रोज़गार की पहचान।" : "Identifies the employment.",
    },
    {
      id: "pay-slips",
      label: hi ? "पिछले महीनों की सैलरी स्लिप" : "Pay slips for paid months",
      why: hi ? "वेतन दर और पैटर्न दिखाती हैं।" : "Show the wage rate and pattern.",
    },
    {
      id: "appointment",
      label: hi ? "कोई भी नियुक्ति/ऑफ़र पत्र" : "Any appointment/offer letter",
      why: hi ? "न होने पर भी कोशिश करें — हो सकता है कोई प्रति मिले।" : "Even if missing, look for a copy.",
    },
    {
      id: "work-photos",
      label: hi ? "कार्य स्थल के फोटो + सहकर्मियों के संपर्क" : "Work-site photos + colleagues' contacts",
      why: hi ? "रोज़गार की पुष्टि के लिए गवाह।" : "Witnesses to corroborate the employment.",
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
      title: hi ? "अभी सब कुछ सुरक्षित करें" : "Preserve everything now",
      plain: hi
        ? "व्हाट्सएप, बैंक स्टेटमेंट, स्लिप — सबके स्क्रीनशॉट/प्रति बना लें।"
        : "Screenshot/back up WhatsApp, bank statements, and slips.",
      why: hi ? "सबूत समय के साथ गायब हो जाते हैं।" : "Evidence disappears with time.",
      effort: "quick" as const,
      urgent: true,
    },
    {
      id: "demand",
      order: 2,
      title: hi ? "लिखित माँग भेजें" : "Send a written demand",
      plain: hi
        ? `${money} के भुगतान के लिए ईमेल + व्हाट्सएप + हस्ताक्षरित पत्र, 15 दिन की समय-सीमा के साथ।`
        : `Email + WhatsApp + signed letter demanding ${money}, with a 15-day deadline.`,
      why: hi
        ? "लिखित माँग रिकॉर्ड बनाती है और अक्सर भुगतान खोल देती है।"
        : "A written demand creates a record and often unlocks payment.",
      effort: "quick" as const,
      urgent: true,
    },
    {
      id: "commissioner",
      order: 3,
      title: hi ? "श्रम आयुक्त के पास शिकायत" : "Report to the Labour Commissioner",
      plain: hi
        ? "मुफ़्त समाधान प्रक्रिया — नियोक्ता आम तौर पर जवाब देते हैं।"
        : "A free conciliation route — employers usually respond.",
      why: hi ? "बिना वकील, तेज़ पहला कदम।" : "A fast first step without a lawyer.",
      effort: "moderate" as const,
    },
    {
      id: "recovery",
      order: 4,
      title: hi ? "वसूली का कानूनी रास्ता" : "Legal recovery route",
      plain: hi
        ? "लागू होने वाले कानून के अनुसार वेतन प्राधिकारी या औद्योगिक विवाद अधिनियम §33C(2) के अंतर्गत दावा।"
        : "A claim before the wage authority or under ID Act §33C(2), per the applicable law.",
      why: hi ? "पूरे मुकदमे से तेज़ और सरल।" : "Faster and simpler than a full suit.",
      effort: "moderate" as const,
    },
    {
      id: "retrenchment",
      order: 5,
      title: hi ? "गलत तरीके से निकाला जाए तो चुनौती दें" : "If dismissed improperly, challenge it",
      plain: hi
        ? "बिना सूचना/मुआवज़े की छंटनी अमान्य हो सकती है (केवल एक वर्ष से अधिक सेवा पर)।"
        : "Dismissal without notice/compensation can be invalid (only with a year+ of service).",
      why: hi ? "यह कदम केवल नौकरी से निकाले जाने पर।" : "Only relevant if you are dismissed.",
      effort: "long" as const,
    },
    {
      id: "legal-aid",
      order: 6,
      title: hi ? "विधिक सहायता लें" : "Get legal aid",
      plain: hi
        ? "राज्य विधिक सेवा प्राधिकरण (15100) मुफ़्त मदद देता है।"
        : "The State Legal Services Authority (15100) offers free help.",
      why: hi ? "मुफ़्त विशेषज्ञ सहायता।" : "Free expert assistance.",
      effort: "moderate" as const,
    },
  ];

  const document = {
    type: "legal-notice" as const,
    title: hi
      ? "अवैतनिक वेतन के भुगतान के लिए कानूनी नोटिस"
      : "LEGAL NOTICE FOR PAYMENT OF UNPAID WAGES",
    date: todayLabel(lang),
    fromParty: hi ? "[आपका नाम और पता]" : "[Your name and address]",
    toParty: intake.otherParty || (hi ? "[नियोक्ता का नाम और पता]" : "[Employer name and address]"),
    subject: hi
      ? `विषय: ${money} अवैतनिक वेतन के भुगतान की माँग`
      : `SUBJECT: DEMAND FOR PAYMENT OF UNPAID WAGES OF ${money}`,
    sections: [
      {
        heading: hi ? "रोज़गार" : "EMPLOYMENT",
        body: hi
          ? `${summarize(intake.description)}${partyClause} मैंने काम किया और काम के बदले वेतन देय हुआ।`
          : `${summarize(intake.description)}${partyClause} I performed work for which wages became due.`,
      },
      {
        heading: hi ? "अवैतनिक वेतन" : "UNPAID WAGES",
        body: hi
          ? `पिछले महीनों का वेतन, कुल ${money}, समय पर भुगतान नहीं किया गया।`
          : `Wages for the last months, totalling ${money}, have not been paid on time.`,
      },
      {
        heading: hi ? "कानूनी संदर्भ" : "LEGAL REFERENCE",
        body: hi
          ? "Code on Wages, 2019 (§17–18); Payment of Wages Act, 1936 (§5); Industrial Disputes Act, 1947 (§33C(2)); Minimum Wages Act, 1948 (§12)।"
          : "Code on Wages, 2019 (§§17–18); Payment of Wages Act, 1936 (§5); Industrial Disputes Act, 1947 (§33C(2)); Minimum Wages Act, 1948 (§12).",
      },
      {
        heading: hi ? "माँग" : "DEMAND",
        body: hi
          ? `इस नोटिस की प्राप्ति के 15 दिनों के भीतर ${money} का भुगतान करें। विफलता पर श्रम आयुक्त/उपयुक्त प्राधिकारी के समक्ष कार्यवाही की जाएगी।`
          : `Within 15 days of receipt, pay the sum of ${money}. Failing this, proceedings will be initiated before the Labour Commissioner / appropriate authority.`,
      },
    ],
    legalReferences: [
      "Code on Wages, 2019 — §§17, 18",
      "Payment of Wages Act, 1936 — §5 (where applicable)",
      "Industrial Disputes Act, 1947 — §33C(2)",
      "Minimum Wages Act, 1948 — §12",
    ],
    remedy: hi
      ? `${money} अवैतनिक वेतन का भुगतान।`
      : `Payment of unpaid wages of ${money}.`,
    signature: { name: "[Your name]", role: hi ? "[आपका पता और संपर्क]" : "[Your address and contact]" },
    language: lang,
  };

  return {
    id,
    language: lang,
    domain: "labour",
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
