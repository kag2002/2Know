"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";


export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem 
      disableTransitionOnChange
      themes={["light", "dark", "eye-care"]}
    >
      {children}
    </NextThemesProvider>
  );
}

export const useTheme = () => {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  return { 
    theme: theme as any, 
    setTheme, 
    resolvedTheme: (resolvedTheme || "light") as any 
  };
};
