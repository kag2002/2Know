"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "eye-care" | "system";
type ResolvedTheme = "light" | "dark" | "eye-care";

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: ResolvedTheme;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("2know-theme") as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (t: Theme, systemIsDark: boolean) => {
      root.classList.remove("dark", "eye-care");
      if (t === "eye-care") {
        root.classList.add("eye-care");
        setResolvedTheme("eye-care");
      } else if (t === "dark" || (t === "system" && systemIsDark)) {
        root.classList.add("dark");
        setResolvedTheme("dark");
      } else {
        setResolvedTheme("light");
      }
    };

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    applyTheme(theme, mq.matches);

    const handler = (e: MediaQueryListEvent) => applyTheme(theme, e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("2know-theme", t);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
