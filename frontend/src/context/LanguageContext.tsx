"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import viDict from "@/locales/vi.json";
import enDict from "@/locales/en.json";
import itDict from "@/locales/it.json";

export type Language = "vi" | "en" | "it";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const dictionaries: Record<Language, Record<string, string>> = {
  vi: viDict,
  en: enDict,
  it: itDict,
};

const LanguageContext = createContext<LanguageContextType>({
  language: "vi",
  setLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");

  useEffect(() => {
    const stored = localStorage.getItem("2know-lang") as Language | null;
    if (stored && ["vi", "en", "it"].includes(stored)) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("2know-lang", lang);
  };

  const t = (key: string): string => {
    const dict = dictionaries[language];
    return dict[key] || dictionaries["vi"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);
