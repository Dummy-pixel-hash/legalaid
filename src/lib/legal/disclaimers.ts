/**
 * LegalAId — disclaimers.
 * Shown on every analysis page and every generated document, in the active language.
 */

export const DISCLAIMER_EN =
  "LegalAId provides general legal information to help you understand your situation. It is not legal advice, and it is not a substitute for a qualified lawyer or legal aid provider. Laws vary by state and change over time. Nothing here creates a lawyer–client relationship. For specific help, contact the State Legal Services Authority (helpline 15100) or a lawyer.";

export const DISCLAIMER_HI =
  "LegalAId आपकी स्थिति को समझने में मदद करने के लिए सामान्य कानूनी जानकारी देता है। यह कानूनी सलाह नहीं है और किसी योग्य वकील या विधिक सहायता प्रदाता का विकल्प नहीं है। कानून राज्य के अनुसार बदलते हैं और समय के साथ बदलते रहते हैं। यहाँ कुछ भी वकील-ग्राहक संबंध नहीं बनाता है। विशिष्ट सहायता के लिए, राज्य विधिक सेवा प्राधिकरण (हेल्पलाइन 15100) या किसी वकील से संपर्क करें।";

export const DISCLAIMERS: Record<"en" | "hi", string> = {
  en: DISCLAIMER_EN,
  hi: DISCLAIMER_HI,
};
