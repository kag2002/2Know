"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import vi from "@/locales/vi.json";
import en from "@/locales/en.json";

type Language = "vi" | "en";
type Translations = typeof vi;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const dictionaries = {
  vi,
  en,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("2know_lang") as Language;
    if (savedLang && ["vi", "en"].includes(savedLang)) {
      setLanguageState(savedLang);
    }
    setMounted(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("2know_lang", lang);
  }, []);

  const t = useCallback((key: keyof Translations): string => {
    return (dictionaries[language] as any)[key] || key;
  }, [language]);

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, setLanguage, t]);

  return (
    <I18nContext.Provider value={contextValue}>
      {mounted ? children : <div className="min-h-screen bg-slate-50 dark:bg-slate-950" />}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
