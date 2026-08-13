/**
 * Shared document builder for the mock content providers.
 * Every domain's legal-notice draft is assembled here so the document can be
 * regenerated per language (and per intake) through a single code path —
 * the same content the analysis builders embed and generateDocument rebuilds.
 */

import type {
  DocumentData,
  DocumentSection,
  DocumentType,
  Domain,
  IntakeData,
  Language,
} from "@/lib/types/domain";
import { formatMoney, summarize, todayLabel } from "./shared";

const FROM_PLACEHOLDER: Record<Language, string> = {
  en: "[Your name and address]",
  hi: "[आपका नाम और पता]",
};
const ROLE_PLACEHOLDER: Record<Language, string> = {
  en: "[Your address and contact]",
  hi: "[आपका पता और संपर्क]",
};

function buildDocument(opts: {
  intake: IntakeData;
  lang: Language;
  type?: DocumentType;
  title: string;
  toParty: string;
  subject: string;
  sections: DocumentSection[];
  legalReferences: string[];
  remedy: string;
}): DocumentData {
  const { lang } = opts;
  return {
    type: opts.type ?? "legal-notice",
    title: opts.title,
    date: todayLabel(lang),
    fromParty: FROM_PLACEHOLDER[lang],
    toParty: opts.toParty,
    subject: opts.subject,
    sections: opts.sections,
    legalReferences: opts.legalReferences,
    remedy: opts.remedy,
    signature: { name: "[Your name]", role: ROLE_PLACEHOLDER[lang] },
    language: lang,
  };
}

// ── Consumer ───────────────────────────────────────────────────────────────
export function buildConsumerDocument(
  intake: IntakeData,
  lang: Language,
): DocumentData {
  const hi = lang === "hi";
  const amt = formatMoney(intake.amount);
  const money = amt || "₹18,500";
  const partyClause = intake.otherParty
    ? hi
      ? ` आपने ${intake.otherParty} का नाम लिया है।`
      : ` You named ${intake.otherParty} as the party.`
    : "";

  return buildDocument({
    intake,
    lang,
    type: "legal-notice",
    title: hi
      ? "वारंटी में खराब उत्पाद के लिए कानूनी नोटिस — बदलने/रिफ़ंड की माँग"
      : "LEGAL NOTICE FOR DEFECTIVE PRODUCT WITHIN WARRANTY — REPLACEMENT/REFUND",
    toParty:
      intake.otherParty ||
      (hi ? "[विक्रेता/निर्माता का नाम और पता]" : "[Seller/Manufacturer name and address]"),
    subject: hi
      ? `विषय: ${money} में खरीदे गए उत्पाद की मरम्मत/बदलने या रिफ़ंड की माँग`
      : `SUBJECT: DEMAND FOR REPAIR/REPLACEMENT OR REFUND OF THE PRODUCT PURCHASED FOR ${money}`,
    sections: [
      {
        heading: hi ? "तथ्य" : "FACTS",
        body: hi
          ? `${summarize(intake.description)}${partyClause} उत्पाद वारंटी अवधि में खराब हो गया और मरम्मत/बदलने/रिफ़ंड के अनुरोध के बावजूद कोई समाधान नहीं मिला।`
          : `${summarize(intake.description)}${partyClause} The product failed within the warranty period and, despite requests, no repair/replacement/refund was provided.`,
      },
      {
        heading: hi ? "दोष" : "THE DEFECT",
        body: hi
          ? "उत्पाद ने बताई गई गुणवत्ता/मानक पूरे नहीं किए। दोष के रिकॉर्ड (सर्विस रिपोर्ट, फोटो) संलग्न हैं।"
          : "The product failed to meet the promised quality/standard. Records of the defect (service reports, photographs) are enclosed.",
      },
      {
        heading: hi ? "कानूनी संदर्भ" : "LEGAL REFERENCE",
        body: hi
          ? "उपभोक्ता संरक्षण अधिनियम, 2019 (धारा 2(7), 2(42), 35, 39); उपभोक्ता संरक्षण (ई-कॉमर्स) नियम, 2020।"
          : "Consumer Protection Act, 2019 (Sections 2(7), 2(42), 35, 39); Consumer Protection (E-Commerce) Rules, 2020.",
      },
      {
        heading: hi ? "माँग" : "DEMAND",
        body: hi
          ? `इस नोटिस की प्राप्ति के 15 दिनों के भीतर उत्पाद बदलने या ${money} रिफ़ंड करें। विफलता पर उपभोक्ता आयोग में शिकायत दर्ज की जाएगी।`
          : `Within 15 days of receipt, replace the product or refund ${money}. Failing this, a consumer complaint will be filed before the District Commission.`,
      },
    ],
    legalReferences: [
      "Consumer Protection Act, 2019 — §§2(7), 2(10), 2(42), 35, 39",
      "Consumer Protection (E-Commerce) Rules, 2020 — Rules 4, 6",
    ],
    remedy: hi
      ? `उत्पाद का बदलना, या ${money} की राशि का रिफ़ंड, और हुए नुकसान का मुआवज़ा।`
      : `Replacement of the product, or a refund of ${money}, plus compensation for the loss caused.`,
  });
}

// ── Tenant ────────────────────────────────────────────────────────────────
export function buildTenantDocument(
  intake: IntakeData,
  lang: Language,
): DocumentData {
  const hi = lang === "hi";
  const amt = formatMoney(intake.amount);
  const money = amt || "₹30,000";
  const partyClause = intake.otherParty
    ? hi
      ? ` मकान मालिक के रूप में ${intake.otherParty} का नाम लिया गया है।`
      : ` ${intake.otherParty} is named as the landlord.`
    : "";

  return buildDocument({
    intake,
    lang,
    type: "legal-notice",
    title: hi
      ? "सिक्योरिटी डिपॉज़िट की वापसी के लिए कानूनी नोटिस"
      : "LEGAL NOTICE FOR REFUND OF SECURITY DEPOSIT",
    toParty:
      intake.otherParty ||
      (hi ? "[मकान मालिक का नाम और पता]" : "[Landlord name and address]"),
    subject: hi
      ? `विषय: ${money} सिक्योरिटी डिपॉज़िट की वापसी की माँग`
      : `SUBJECT: DEMAND FOR REFUND OF SECURITY DEPOSIT OF ${money}`,
    sections: [
      {
        heading: hi ? "किरायेदारी" : "TENANCY",
        body: hi
          ? `${summarize(intake.description)}${partyClause} किरायेदारी उचित सूचना के बाद समाप्त हुई।`
          : `${summarize(intake.description)}${partyClause} The tenancy ended after proper notice.`,
      },
      {
        heading: hi ? "डिपॉज़िट" : "THE DEPOSIT",
        body: hi
          ? `${money} की सिक्योरिटी राशि जमा की गई। फ्लैट उसी हालत में लौटाया गया; कोई आइटमाइज़्ड कटौती नहीं दी गई।`
          : `A security deposit of ${money} was paid. The flat was handed back in the same condition; no itemized deductions were provided.`,
      },
      {
        heading: hi ? "कानूनी संदर्भ" : "LEGAL REFERENCE",
        body: hi
          ? "संपत्ति अंतरण अधिनियम, 1882 (§§105, 106, 108, 111); भारतीय अनुबंध अधिनियम, 1872 (§73)। राज्य के किराया कानून लागू हो सकते हैं।"
          : "Transfer of Property Act, 1882 (§§105, 106, 108, 111); Indian Contract Act, 1872 (§73). State rent law may also apply.",
      },
      {
        heading: hi ? "माँग" : "DEMAND",
        body: hi
          ? `इस नोटिस की प्राप्ति के 15 दिनों के भीतर ${money} लौटाएँ और किसी कटौती का आइटमाइज़्ड हिसाब दें। विफलता पर उचित कानूनी कार्यवाही की जाएगी।`
          : `Within 15 days of receipt, refund ${money} and provide an itemized account of any deductions. Failing this, appropriate legal proceedings will follow.`,
      },
    ],
    legalReferences: [
      "Transfer of Property Act, 1882 — §§105, 106, 108, 111",
      "Indian Contract Act, 1872 — §73",
      "State rent law (verify with legal aid)",
    ],
    remedy: hi ? `${money} सिक्योरिटी डिपॉज़िट की वापसी।` : `Refund of the security deposit of ${money}.`,
  });
}

// ── Labour ────────────────────────────────────────────────────────────────
export function buildLabourDocument(
  intake: IntakeData,
  lang: Language,
): DocumentData {
  const hi = lang === "hi";
  const amt = formatMoney(intake.amount);
  const money = amt || "₹25,000";
  const partyClause = intake.otherParty
    ? hi
      ? ` नियोक्ता के रूप में ${intake.otherParty} का नाम लिया गया है।`
      : ` ${intake.otherParty} is named as the employer.`
    : "";

  return buildDocument({
    intake,
    lang,
    type: "legal-notice",
    title: hi
      ? "अवैतनिक वेतन के भुगतान के लिए कानूनी नोटिस"
      : "LEGAL NOTICE FOR PAYMENT OF UNPAID WAGES",
    toParty:
      intake.otherParty ||
      (hi ? "[नियोक्ता का नाम और पता]" : "[Employer name and address]"),
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
    remedy: hi ? `${money} अवैतनिक वेतन का भुगतान।` : `Payment of unpaid wages of ${money}.`,
  });
}

// ── Generic / other ───────────────────────────────────────────────────────
export function buildGenericDocument(
  intake: IntakeData,
  lang: Language,
): DocumentData {
  const hi = lang === "hi";
  return buildDocument({
    intake,
    lang,
    type: "other",
    title: hi ? "दस्तावेज़" : "DOCUMENT",
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
  });
}

/** Dispatch document construction by domain. */
export function buildDocumentForDomain(
  domain: Domain | "other",
  intake: IntakeData,
  lang: Language,
): DocumentData {
  switch (domain) {
    case "consumer":
      return buildConsumerDocument(intake, lang);
    case "tenant":
      return buildTenantDocument(intake, lang);
    case "labour":
      return buildLabourDocument(intake, lang);
    default:
      return buildGenericDocument(intake, lang);
  }
}
