"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { vi } from "@/locales/vi";
import { en } from "@/locales/en";

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

  useEffect(() => {
    const savedLang = localStorage.getItem("quizlm_lang") as Language;
    if (savedLang && ["vi", "en"].includes(savedLang)) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("quizlm_lang", lang);
  };

  const t = (key: keyof Translations): string => {
    return dictionaries[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
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
