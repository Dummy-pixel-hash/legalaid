import { en } from "./en";

/** The set of every UI string, derived from the English dictionary. */
export type TranslationKey = keyof typeof en;

export type Dictionary = Record<TranslationKey, string>;

export type { en };
