"use client";

import { Bell, Search, PanelLeftClose, ChevronDown, Settings, LogOut, User, Moon, Sun, BookOpen, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation, Language } from "@/context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function Header() {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const { t, language, setLanguage } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    if (resolvedTheme === "light") setTheme("dark");
    else if (resolvedTheme === "dark") setTheme("eye-care");
    else setTheme("light");
  };

  return (
    <header className="h-16 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="outline" size="icon" className="h-8 w-8 hidden md:flex border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800">
          <PanelLeftClose className="h-4 w-4 text-slate-600 dark:text-slate-400" />
        </Button>
        
        <div className="max-w-xl w-full relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <button
            onClick={() => document.getElementById('command-palette-trigger')?.click()}
            className="w-full pl-9 pr-16 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/50 h-9 rounded-md text-sm text-muted-foreground text-left transition-all duration-200 hover:bg-white dark:hover:bg-slate-900 hover:shadow-md hover:ring-2 hover:ring-indigo-500/20"
          >
            {t("header.search")}
          </button>
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none hidden md:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode Toggle */}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={toggleDarkMode}
        >
          {resolvedTheme === "dark" ? <Moon className="h-4 w-4" /> : resolvedTheme === "eye-care" ? <BookOpen className="h-4 w-4 text-amber-600" /> : <Sun className="h-4 w-4 text-amber-400" />}
        </Button>

        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="h-8 w-16 md:w-auto rounded-md border border-input bg-background px-2 text-xs focus:ring-0 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="vi">🇻🇳 VI</option>
          <option value="en">🇬🇧 EN</option>
          <option value="it">🇮🇹 IT</option>
        </select>

        <Button variant="outline" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-pink-500 rounded-full animate-pulse"></span>
        </Button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium leading-none">{user?.name || "User"}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{t("header.teacher")}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground hidden md:block transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-popover rounded-xl shadow-lg border p-1.5 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-3 py-2 border-b mb-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <Settings className="w-4 h-4" />
                {t("sidebar.settings")}
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <User className="w-4 h-4" />
                {t("header.profile")}
              </Link>
              <div className="border-t mt-1 pt-1">
                <button
                  onClick={() => { setShowDropdown(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t("header.logout")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

