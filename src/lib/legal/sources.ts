/**
 * LegalAId — versioned legal-source registry.
 * The single source of truth for every citation in the product.
 *
 * STRICT RULE (PRODUCT.md §7, ARCHITECTURE.md §7):
 *  - `verified: true` ONLY for real, confirmed Act/Code + section.
 *  - `verified: false` for demo/placeholder/state-specific/uncertain references;
 *    the UI renders these with the "Demo — verify with an expert" tag.
 * Never silently set verified: true. Never invent a section.
 */

import type { SourceRef } from "@/lib/types/domain";

export const LEGAL_SOURCES_VERSION = "2025.1";

export interface LegalSource {
  id: string;
  act: string;
  section: string;
  title: { en: string; hi: string };
  /** Plain-language explanation of what the section means. */
  plain: { en: string; hi: string };
  source: SourceRef;
}

export const LEGAL_SOURCES: LegalSource[] = [
  // ── Consumer Protection Act, 2019 ────────────────────────────────
  {
    id: "cpa-2019-s2-7",
    act: "Consumer Protection Act, 2019",
    section: "§2(7)",
    title: { en: "Who counts as a 'consumer'", hi: "कौन 'उपभोक्ता' माना जाता है" },
    plain: {
      en: "A person who buys goods or uses a service for a price — including online purchases — is a consumer. It includes anyone who uses the goods with the buyer's approval.",
      hi: "जो व्यक्ति किसी चीज़ को कीमत देकर खरीदता है या सेवा लेता है — ऑनलाइन खरीदारी भी — वह उपभोक्ता है। इसमें खरीदार की सहमति से चीज़ का उपयोग करने वाले भी शामिल हैं।",
    },
    source: { name: "Consumer Protection Act, 2019", type: "act", ref: "§2(7)", verified: true, note: "Central Act; check for amendments" },
  },
  {
    id: "cpa-2019-s2-10",
    act: "Consumer Protection Act, 2019",
    section: "§2(10)",
    title: { en: "What counts as a 'defect'", hi: "क्या 'दोष' माना जाता है" },
    plain: {
      en: "A defect is any fault or imperfection in the quality, quantity, or standard of goods that the manufacturer or seller promised or is required to meet.",
      hi: "दोष वह कमी या खराबी है जो चीज़ की गुणवत्ता, मात्रा या मानक में हो और जिसे निर्माता या विक्रेता ने वादा किया था या पूरा करने के लिए बाध्य था।",
    },
    source: { name: "Consumer Protection Act, 2019", type: "act", ref: "§2(10)", verified: true },
  },
  {
    id: "cpa-2019-s2-42",
    act: "Consumer Protection Act, 2019",
    section: "§2(42)",
    title: { en: "Unfair trade practice", hi: "अनुचित व्यापार व्यवहार" },
    plain: {
      en: "A practice is unfair if it misleads consumers — for example, false promises about a product, misleading warranties, or refusing to honour stated terms.",
      hi: "ऐसा व्यवहार अनुचित है जो उपभोक्ताओं को गुमराह करता है — जैसे उत्पाद के बारे में झूठे वादे, भ्रामक वारंटी, या बताई गई शर्तों का पालन करने से इनकार।",
    },
    source: { name: "Consumer Protection Act, 2019", type: "act", ref: "§2(42)", verified: true },
  },
  {
    id: "cpa-2019-s35",
    act: "Consumer Protection Act, 2019",
    section: "§35",
    title: { en: "Filing a complaint with the District Commission", hi: "जिला आयोग में शिकायत दर्ज करना" },
    plain: {
      en: "A consumer can file a complaint with the District Consumer Commission — where they live or work, or where the seller operates. Filing is designed to be possible without a lawyer, with a small fee.",
      hi: "उपभोक्ता जिला उपभोक्ता आयोग में शिकायत दर्ज कर सकता है — जहाँ वह रहता/काम करता है, या जहाँ विक्रेता काम करता है। शिकायत दर्ज करना बिना वकील के, छोटी फीस पर संभव बनाया गया है।",
    },
    source: { name: "Consumer Protection Act, 2019", type: "act", ref: "§35", verified: true },
  },
  {
    id: "cpa-2019-s39",
    act: "Consumer Protection Act, 2019",
    section: "§39",
    title: { en: "Reliefs the Commission may order", hi: "आयोग के आदेश के रूप में मिलने वाली राहत" },
    plain: {
      en: "The Commission can order repair, replacement, refund of the price, compensation for loss, and costs — depending on what the complaint proves.",
      hi: "आयोग मरम्मत, बदलना, कीमत वापस करना, नुकसान की भरपाई और खर्च — शिकायत के सबूत के अनुसार — आदेश दे सकता है।",
    },
    source: { name: "Consumer Protection Act, 2019", type: "act", ref: "§39", verified: true },
  },
  {
    id: "cpa-2019-s72",
    act: "Consumer Protection Act, 2019",
    section: "§72",
    title: { en: "Penalty for false or misleading advertisements", hi: "झूठे या भ्रामक विज्ञापन पर दंड" },
    plain: {
      en: "Publishing a false or misleading advertisement that harms consumers can attract a penalty. This is relevant when a product's promises turned out to be untrue.",
      hi: "ऐसा विज्ञापन छापना जो झूठा या भ्रामक हो और उपभोक्ताओं को नुकसान पहुँचाए, दंड का आधार बन सकता है। यह तब प्रासंगिक है जब उत्पाद के वादे झूठे निकलें।",
    },
    source: { name: "Consumer Protection Act, 2019", type: "act", ref: "§72", verified: true },
  },
  {
    id: "ecom-rules-2020-r4",
    act: "Consumer Protection (E-Commerce) Rules, 2020",
    section: "Rule 4",
    title: { en: "Duties of e-commerce entities", hi: "ई-कॉमर्स संस्थाओं के कर्तव्य" },
    plain: {
      en: "Online marketplaces must be transparent about sellers, prices, and refund policies, and must not mislead consumers about the goods they list.",
      hi: "ऑनलाइन मार्केटप्लेस को विक्रेताओं, कीमतों और रिफ़ंड नीतियों के बारे में पारदर्शी रहना चाहिए और सूचीबद्ध चीज़ों के बारे में उपभोक्ताओं को गुमराह नहीं करना चाहिए।",
    },
    source: { name: "Consumer Protection (E-Commerce) Rules, 2020", type: "rule", ref: "Rule 4", verified: true, note: "As amended from time to time; verify current text" },
  },
  {
    id: "ecom-rules-2020-r6",
    act: "Consumer Protection (E-Commerce) Rules, 2020",
    section: "Rule 6",
    title: { en: "Duties of sellers on a marketplace", hi: "मार्केटप्लेस पर विक्रेताओं के कर्तव्य" },
    plain: {
      en: "Sellers who sell through a marketplace remain responsible for the goods they sell, including warranties and refunds. The buyer can hold the seller to its promises.",
      hi: "मार्केटप्लेस के ज़रिए बेचने वाले विक्रेता अपने माल के लिए ज़िम्मेदार रहते हैं — वारंटी और रिफ़ंड सहित। खरीदार विक्रेता को उसके वादों पर बाँध सकता है।",
    },
    source: { name: "Consumer Protection (E-Commerce) Rules, 2020", type: "rule", ref: "Rule 6", verified: true, note: "As amended from time to time; verify current text" },
  },

  // ── Transfer of Property Act, 1882 ──────────────────────────────
  {
    id: "tpa-1882-s105",
    act: "Transfer of Property Act, 1882",
    section: "§105",
    title: { en: "What a lease is", hi: "लीज़ क्या है" },
    plain: {
      en: "A lease is created when the owner transfers the right to use property for a time in exchange for rent — with or without a written document.",
      hi: "लीज़ तब बनती है जब मालिक किराए के बदले, समय के लिए संपत्ति का उपयोग करने का अधिकार देता है — लिखित दस्तावेज़ के साथ या बिना।",
    },
    source: { name: "Transfer of Property Act, 1882", type: "act", ref: "§105", verified: true },
  },
  {
    id: "tpa-1882-s106",
    act: "Transfer of Property Act, 1882",
    section: "§106",
    title: { en: "Duration of a lease and how it ends", hi: "लीज़ की अवधि और उसका अंत" },
    plain: {
      en: "The Act sets rules for how long a lease runs and how much notice is needed to end it — for month-to-month tenancies, typically 15 days' notice.",
      hi: "यह धारा बताती है कि लीज़ कितने समय चलती है और उसे समाप्त करने के लिए कितनी सूचना चाहिए — मासिक किरायेदारी में आम तौर पर 15 दिन की सूचना।",
    },
    source: { name: "Transfer of Property Act, 1882", type: "act", ref: "§106", verified: true, note: "State rent acts may modify notice requirements" },
  },
  {
    id: "tpa-1882-s108",
    act: "Transfer of Property Act, 1882",
    section: "§108",
    title: { en: "Rights and duties of landlord and tenant", hi: "मकान मालिक और किरायेदार के अधिकार-कर्तव्य" },
    plain: {
      en: "This section sets the duties of both sides — the tenant must pay rent and keep the property in reasonable condition; on the tenancy ending, the tenant returns possession and the landlord accounts for any security deposit fairly.",
      hi: "यह धारा दोनों पक्षों के कर्तव्य तय करती है — किरायेदार को किराया देना और संपत्ति की उचित देखभाल करनी चाहिए; किरायेदारी समाप्त होने पर किरायेदार संपत्ति लौटाता है और मकान मालिक सिक्योरिटी डिपॉज़िट का उचित हिसाब करता है।",
    },
    source: { name: "Transfer of Property Act, 1882", type: "act", ref: "§108", verified: true },
  },
  {
    id: "tpa-1882-s111",
    act: "Transfer of Property Act, 1882",
    section: "§111",
    title: { en: "How a lease comes to an end", hi: "लीज़ कैसे समाप्त होती है" },
    plain: {
      en: "A lease ends by expiry of its term, by notice, or by agreement. After it ends, the tenant must hand over possession, and money held as security should be returned unless properly deducted.",
      hi: "लीज़ अवधि पूरी होने, सूचना, या सहमति से समाप्त होती है। समाप्ति के बाद किरायेदार संपत्ति लौटाता है, और सिक्योरिटी के रूप में रखा पैसा वापस किया जाना चाहिए — जब तक उचित कटौती न की गई हो।",
    },
    source: { name: "Transfer of Property Act, 1882", type: "act", ref: "§111", verified: true },
  },
  {
    id: "ica-1872-s73",
    act: "Indian Contract Act, 1872",
    section: "§73",
    title: { en: "Compensation for loss caused by breach", hi: "अनुबंध भंग से हुए नुकसान की भरपाई" },
    plain: {
      en: "A party who breaks a contract must compensate the other for the loss that naturally followed — relevant when a landlord refuses to return money that is owed under the arrangement.",
      hi: "जो पक्ष अनुबंध तोड़ता है उसे दूसरे पक्ष के स्वाभाविक नुकसान की भरपाई करनी होती है — यह तब प्रासंगिक है जब मकान मालिक व्यवस्था के तहत देय पैसा लौटाने से इनकार करे।",
    },
    source: { name: "Indian Contract Act, 1872", type: "act", ref: "§73", verified: true },
  },
  {
    id: "mta-2021-deposit",
    act: "Model Tenancy Act, 2021",
    section: "Deposit provisions",
    title: { en: "Security deposit refund (model law)", hi: "सिक्योरिटी डिपॉज़िट वापसी (मॉडल कानून)" },
    plain: {
      en: "The Model Tenancy Act proposes clear rules on security deposits (usually capped at two months' rent for residential tenancies) and timely refund. It is a model law — it only applies if your state has adopted it.",
      hi: "मॉडल टेनेंसी अधिनियम सिक्योरिटी डिपॉज़िट (आम तौर पर दो महीने के किराए तक सीमित) और समय पर वापसी के स्पष्ट नियम सुझाता है। यह एक मॉडल कानून है — यह केवल तब लागू होता है जब आपके राज्य ने इसे अपनाया हो।",
    },
    source: { name: "Model Tenancy Act, 2021", type: "act", ref: "Deposit provisions", verified: false, note: "Model/advisory law — not binding unless adopted by your state" },
  },
  {
    id: "state-rent-act",
    act: "State Rent Control Act (your state)",
    section: "Varies by state",
    title: { en: "State tenancy protections", hi: "राज्य की किराया सुरक्षाएँ" },
    plain: {
      en: "Most states have their own rent-control law (for example, the Karnataka Rent Act, 1999, the Delhi Rent Act, 1995, the Maharashtra Rent Control Act, 1999). Deposit rules and protections vary. The right act depends on where the property is.",
      hi: "अधिकांश राज्यों का अपना किराया नियंत्रण कानून है (जैसे कर्नाटक किराया अधिनियम 1999, दिल्ली किराया अधिनियम 1995, महाराष्ट्र किराया नियंत्रण अधिनियम 1999)। डिपॉज़िट नियम और सुरक्षाएँ अलग-अलग हैं। सही कानून संपत्ति के स्थान पर निर्भर करता है।",
    },
    source: { name: "Your state's Rent Control Act", type: "state-law", ref: "Varies", verified: false, note: "State-specific — confirm with the State Legal Services Authority" },
  },

  // ── Wages & labour ──────────────────────────────────────────────
  {
    id: "cow-2019-s17",
    act: "Code on Wages, 2019",
    section: "§17",
    title: { en: "Time limit for paying wages", hi: "वेतन भुगतान की समय-सीमा" },
    plain: {
      en: "Wages for a monthly pay period must be paid before the 7th day of the following month. Late or skipped payment is a violation.",
      hi: "मासिक वेतन अवधि का वेतन अगले महीने की 7 तारीख़ से पहले दिया जाना चाहिए। देर से या न दिया गया भुगतान उल्लंघन है।",
    },
    source: { name: "Code on Wages, 2019", type: "code", ref: "§17", verified: true, note: "Consolidated law; state rules vary — older wage acts may still apply where not yet operationalized" },
  },
  {
    id: "cow-2019-s18",
    act: "Code on Wages, 2019",
    section: "§18",
    title: { en: "Payment of full wages", hi: "पूरा वेतन देना" },
    plain: {
      en: "Wages must be paid in full — an employer cannot deduct from wages except for reasons the law allows.",
      hi: "वेतन पूरा दिया जाना चाहिए — नियोक्ता केवल उन्हीं कारणों से कटौती कर सकता है जो कानून अनुमति देता है।",
    },
    source: { name: "Code on Wages, 2019", type: "code", ref: "§18", verified: true, note: "See §17 note on state operationalization" },
  },
  {
    id: "pwa-1936-s4",
    act: "Payment of Wages Act, 1936",
    section: "§4",
    title: { en: "Fixation of wage periods", hi: "वेतन अवधि का निर्धारण" },
    plain: {
      en: "Employers must fix wage periods — usually monthly — so wages are due at predictable times.",
      hi: "नियोक्ताओं को वेतन अवधि तय करनी चाहिए — आम तौर पर मासिक — ताकि वेतन समय पर देय हो।",
    },
    source: { name: "Payment of Wages Act, 1936", type: "act", ref: "§4", verified: true, note: "Superseded in states where the Code on Wages is operationalized" },
  },
  {
    id: "pwa-1936-s5",
    act: "Payment of Wages Act, 1936",
    section: "§5",
    title: { en: "When wages must be paid", hi: "वेतन कब देना चाहिए" },
    plain: {
      en: "Wages must be paid before the 7th day of the following month when the wage period is a month, with no deductions except those the Act allows.",
      hi: "मासिक अवधि होने पर वेतन अगले महीने की 7 तारीख़ से पहले देना होता है, और अधिनियम द्वारा अनुमत कटौतियों के अलावा कोई कटौती नहीं की जा सकती।",
    },
    source: { name: "Payment of Wages Act, 1936", type: "act", ref: "§5", verified: true, note: "Superseded in states where the Code on Wages is operationalized" },
  },
  {
    id: "mwa-1948-s12",
    act: "Minimum Wages Act, 1948",
    section: "§12",
    title: { en: "Payment of minimum rates of wages", hi: "न्यूनतम मज़दूरी का भुगतान" },
    plain: {
      en: "Workers in scheduled employments must be paid at least the minimum wage notified for their state and category of work, regardless of any contract saying otherwise.",
      hi: "अनुसूचित रोज़गारों में काम करने वालों को उनके राज्य और काम की श्रेणी के लिए अधिसूचित न्यूनतम मज़दूरी से कम नहीं दी जा सकती — चाहे अनुबंध कुछ भी कहे।",
    },
    source: { name: "Minimum Wages Act, 1948", type: "act", ref: "§12", verified: true, note: "Check your state's scheduled-employment notification" },
  },
  {
    id: "ida-1947-s33c2",
    act: "Industrial Disputes Act, 1947",
    section: "§33C(2)",
    title: { en: "Recovery of money due from an employer", hi: "नियोक्ता से देय राशि की वसूली" },
    plain: {
      en: "A worker can apply to recover money the employer owes — like unpaid wages — in a proceeding that is faster and simpler than a full civil suit.",
      hi: "एक कर्मचारी नियोक्ता से देय राशि — जैसे बिना वेतन — वसूलने के लिए आवेदन कर सकता है, जो पूर्ण सिविल मुकदमे से तेज़ और सरल है।",
    },
    source: { name: "Industrial Disputes Act, 1947", type: "act", ref: "§33C(2)", verified: true },
  },
  {
    id: "ida-1947-s25f",
    act: "Industrial Disputes Act, 1947",
    section: "§25F",
    title: { en: "Conditions before retrenchment", hi: "छंटनी से पहले की शर्तें" },
    plain: {
      en: "A worker employed continuously for at least one year cannot be retrenched without one month's notice (or pay in lieu), and compensation equal to 15 days' pay per completed year of service.",
      hi: "कम से कम एक वर्ष से लगातार काम कर रहे कर्मचारी को एक महीने की सूचना (या उसके बदले वेतन) और प्रत्येक पूर्ण वर्ष की सेवा के लिए 15 दिन के वेतन के बराबर मुआवज़े के बिना नहीं निकाला जा सकता।",
    },
    source: { name: "Industrial Disputes Act, 1947", type: "act", ref: "§25F", verified: true, note: "Applies to 'workmen' as defined; procedures and thresholds vary" },
  },
  {
    id: "epf-1952-s7a",
    act: "Employees' Provident Funds Act, 1952",
    section: "§7A",
    title: { en: "Determination of dues from an employer", hi: "नियोक्ता से देय राशि का निर्धारण" },
    plain: {
      en: "Where provident fund coverage applies, the PF authority can determine and recover dues — including the employer's unpaid contributions and the employee's share that was deducted but not deposited.",
      hi: "जहाँ प्रोविडेंट फंड लागू होता है, PF प्राधिकरण देय राशि — नियोक्ता का अवैतनिक अंशदान और कटौती करके जमा न की गई कर्मचारी की हिस्सेदारी — निर्धारित और वसूल सकता है।",
    },
    source: { name: "Employees' Provident Funds Act, 1952", type: "act", ref: "§7A", verified: true, note: "Applies if the establishment is covered by the Act" },
  },
  {
    id: "pga-1972-s4",
    act: "Payment of Gratuity Act, 1972",
    section: "§4",
    title: { en: "Gratuity on completion of service", hi: "सेवा पूरी होने पर ग्रेच्युटी" },
    plain: {
      en: "Gratuity is payable when a worker completes five years of continuous service (with exceptions). Shorter service generally does not attract gratuity.",
      hi: "ग्रेच्युटी तब देय होती है जब कर्मचारी पाँच वर्ष की निरंतर सेवा पूरी करता है (कुछ अपवादों के साथ)। कम सेवा पर आम तौर पर ग्रेच्युटी नहीं मिलती।",
    },
    source: { name: "Payment of Gratuity Act, 1972", type: "act", ref: "§4", verified: true, note: "Five-year threshold — not applicable to shorter service" },
  },
];
