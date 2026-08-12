"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en } from "./en";
import { hi } from "./hi";
import type { Dictionary, TranslationKey } from "./types";
import type { Language } from "@/lib/types/domain";

const STORAGE_KEY = "laid.lang";

const dictionaries: Record<Language, Dictionary> = { en, hi };

type Interpolations = Record<string, string | number>;

function interpolate(template: string, vars?: Interpolations): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /** Translate a UI key, with optional {placeholder} interpolation. */
  t: (key: TranslationKey, vars?: Interpolations) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    const url = new URL(window.location.href);
    const param = url.searchParams.get("lang");
    if (param === "hi" || param === "en") return param;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "hi" || stored === "en") return stored;
    if (navigator.language?.toLowerCase().startsWith("hi")) return "hi";
  } catch {
    // ignore — default to English
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(detectInitialLanguage);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable — session only
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.style.setProperty(
      "--font-body",
      lang === "hi" ? "var(--font-ui-hi)" : "var(--font-ui)",
    );
  }, [lang]);

  const t = useCallback(
    (key: TranslationKey, vars?: Interpolations) => {
      const dict = dictionaries[lang] ?? en;
      const template = dict[key] ?? en[key] ?? String(key);
      return interpolate(template, vars);
    },
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, t }),
    [lang, setLang, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}
