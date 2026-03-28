"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  CheckCircle,
  Users,
  GraduationCap,
  Share2,
  Tags,
  StickyNote,
  Library,
  Settings,
  Search,
  ScanLine,
  BookOpen,
  BarChart3,
  Plus,
  ArrowRight,
  Command,
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: any;
  href?: string;
  action?: () => void;
  group: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { t } = useTranslation();

  const items: CommandItem[] = [
    // Navigation
    { id: "nav-overview", label: t("sidebar.overview"), icon: LayoutDashboard, href: "/overview", group: "navigation" },
    { id: "nav-quizzes", label: t("sidebar.quizzes"), icon: FileText, href: "/quizzes", group: "navigation" },
    { id: "nav-grading", label: t("sidebar.grading"), icon: CheckCircle, href: "/grading", group: "navigation" },
    { id: "nav-qbank", label: t("sidebar.questionBank"), icon: BookOpen, href: "/question-bank", group: "navigation" },
    { id: "nav-rubrics", label: t("sidebar.rubrics"), icon: Library, href: "/rubrics", group: "navigation" },
    { id: "nav-omr", label: t("sidebar.omr"), icon: ScanLine, href: "/omr", group: "navigation" },
    { id: "nav-students", label: t("sidebar.students"), icon: Users, href: "/students", group: "navigation" },
    { id: "nav-classes", label: t("sidebar.classes"), icon: GraduationCap, href: "/classes", group: "navigation" },
    { id: "nav-sharing", label: t("sidebar.sharing"), icon: Share2, href: "/sharing", group: "navigation" },
    { id: "nav-reports", label: t("sidebar.reports"), icon: BarChart3, href: "/reports", group: "navigation" },
    { id: "nav-notes", label: t("sidebar.notes"), icon: StickyNote, href: "/notes", group: "navigation" },
    { id: "nav-tags", label: t("sidebar.tags"), icon: Tags, href: "/tags", group: "navigation" },
    { id: "nav-settings", label: t("sidebar.settings"), icon: Settings, href: "/settings", group: "navigation" },
    // Quick Actions
    { id: "act-quiz", label: t("overview.action.createQuiz"), description: "/quizzes/create", icon: Plus, href: "/quizzes/create", group: "actions" },
    { id: "act-qbank", label: t("overview.action.addQuestion"), description: "/question-bank/create", icon: Plus, href: "/question-bank/create", group: "actions" },
    { id: "act-note", label: t("notes.create"), description: "/notes", icon: Plus, href: "/notes", group: "actions" },
  ];

  const filtered = query.trim()
    ? items.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  const groupedItems = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const flatFiltered = Object.values(groupedItems).flat();

  const executeItem = useCallback((item: CommandItem) => {
    setIsOpen(false);
    setQuery("");
    if (item.href) router.push(item.href);
    else if (item.action) item.action();
  }, [router]);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, flatFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatFiltered[selectedIndex]) executeItem(flatFiltered[selectedIndex]);
    }
  };

  // Scroll selected into view
  useEffect(() => {
    const activeEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    activeEl?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const groupLabels: Record<string, string> = {
    navigation: "Điều hướng",
    actions: "Hành động nhanh",
  };

  return (
    <>
      {/* Trigger for Header search bar */}
      <button
        onClick={() => setIsOpen(true)}
        className="hidden"
        id="command-palette-trigger"
      />

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
              onClick={() => setIsOpen(false)}
            />
            {/* Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101] rounded-xl bg-popover border shadow-2xl overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 border-b">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Tìm kiếm trang, tính năng..."
                  className="flex-1 h-12 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[320px] overflow-y-auto p-2">
                {flatFiltered.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Không tìm thấy kết quả cho &quot;{query}&quot;
                  </div>
                )}
                {Object.entries(groupedItems).map(([group, groupItems]) => (
                  <div key={group}>
                    <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      {groupLabels[group] || group}
                    </div>
                    {groupItems.map((item) => {
                      const globalIdx = flatFiltered.indexOf(item);
                      const isSelected = globalIdx === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          data-index={globalIdx}
                          onClick={() => executeItem(item)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <item.icon className="w-4 h-4 shrink-0 opacity-60" />
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {isSelected && (
                            <ArrowRight className="w-3.5 h-3.5 text-primary/60 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-2 border-t bg-muted/50 flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><kbd className="rounded border bg-background px-1 py-0.5 font-mono">↑↓</kbd> di chuyển</span>
                  <span className="flex items-center gap-1"><kbd className="rounded border bg-background px-1 py-0.5 font-mono">↵</kbd> chọn</span>
                </div>
                <div className="flex items-center gap-1">
                  <Command className="w-3 h-3" /> <span>K để mở</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
