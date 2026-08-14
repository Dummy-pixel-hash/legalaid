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
const COOKIE_KEY = "laid.lang";

/** Read the language cookie — the single server/client-consistent source. */
function readCookieLang(): Language | null {
  if (typeof document === "undefined") return null;
  const pair = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_KEY}=`));
  const value = pair?.split("=")[1];
  return value === "hi" || value === "en" ? value : null;
}

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

function detectInitialLanguage(initialLang?: Language): Language {
  // Server-computed cookie value passed from the RSC layout: both server and
  // client resolve to the same string, so hydration never diverges.
  if (initialLang) return initialLang;
  if (typeof window === "undefined") return "en";
  try {
    const cookie = readCookieLang();
    if (cookie) return cookie;
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

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: ReactNode;
  /** Server-computed language (from the laid.lang cookie) so SSR matches hydration. */
  initialLang?: Language;
}) {
  const [lang, setLangState] = useState<Language>(() =>
    detectInitialLanguage(initialLang),
  );

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
      // Mirror into a cookie so the server renders the same language on the
      // next request — no flash, no hydration mismatch.
      document.cookie = `${COOKIE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`;
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

  // First visit without a cookie yet: the server rendered English (no cookie
  // to read). Apply any stored/param/locale preference post-hydration — after
  // this the cookie exists and SSR renders the chosen language directly.
  useEffect(() => {
    if (readCookieLang()) return;
    const detected = detectInitialLanguage();
    if (detected !== lang) setLang(detected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
