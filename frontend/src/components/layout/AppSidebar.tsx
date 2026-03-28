"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  LogOut,
  ChevronDown,
  BarChart3,
  ScanLine,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

import { useTranslation } from "@/context/LanguageContext";

interface SidebarLink {
  icon: any;
  tKey: string;
  href: string;
  badge?: number | null;
}

interface SidebarGroup {
  tKey: string;
  links: SidebarLink[];
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  
  const [user, setUser] = useState<{full_name?: string; email?: string} | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const topLinks: SidebarLink[] = [
    { icon: LayoutDashboard, tKey: "sidebar.overview", href: "/overview" },
  ];

  const groups: SidebarGroup[] = [
    {
      tKey: "sidebar.group.assessment",
      links: [
        { icon: FileText, tKey: "sidebar.quizzes", href: "/quizzes" },
        { icon: CheckCircle, tKey: "sidebar.grading", href: "/grading", badge: pendingCount },
        { icon: ScanLine, tKey: "sidebar.omr", href: "/omr" },
        { icon: BookOpen, tKey: "sidebar.questionBank", href: "/question-bank" },
        { icon: Library, tKey: "sidebar.rubrics", href: "/rubrics" },
      ],
    },
    {
      tKey: "sidebar.group.manage",
      links: [
        { icon: Users, tKey: "sidebar.students", href: "/students" },
        { icon: GraduationCap, tKey: "sidebar.classes", href: "/classes" },
        { icon: Share2, tKey: "sidebar.sharing", href: "/sharing" },
        { icon: BarChart3, tKey: "sidebar.reports", href: "/reports" },
      ],
    },
    {
      tKey: "sidebar.group.notebook",
      links: [
        { icon: StickyNote, tKey: "sidebar.notes", href: "/notes" },
        { icon: Tags, tKey: "sidebar.tags", href: "/tags" },
      ],
    },
  ];

  const bottomLinks: SidebarLink[] = [
    { icon: Settings, tKey: "sidebar.settings", href: "/settings" },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("2know_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch (e) {}
    }
    // Fetch live grading badge count
    apiFetch("/grading/pending")
      .then((data) => {
        if (Array.isArray(data)) setPendingCount(data.length);
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    document.cookie = "2know_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("2know_token");
    localStorage.removeItem("2know_user");
    router.push("/login");
  };

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Check if any link in a group is active
  const isGroupActive = (group: SidebarGroup) => {
    return group.links.some(link => pathname === link.href || pathname.startsWith(`${link.href}/`));
  };

  const renderLink = (link: SidebarLink) => {
    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
    return (
      <Link
        key={link.href}
        href={link.href}
        title={t(link.tKey)}
        className={cn(
          "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group z-10",
          isActive 
            ? "text-primary-foreground" 
            : "text-muted-foreground hover:text-foreground hover:translate-x-0.5"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active-pill"
            className="absolute inset-0 bg-primary shadow-sm shadow-primary/20 rounded-lg -z-10"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}
        <div className="relative z-10 flex items-center gap-3 w-full pointer-events-none">
          <link.icon className="w-4.5 h-4.5" />
          <span className="truncate">{t(link.tKey)}</span>
          {link.badge != null && link.badge > 0 && (
            <span className={cn(
              "ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors pointer-events-auto min-w-[20px] text-center",
              isActive ? "bg-primary-foreground/20 text-white" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
            )}>
              {link.badge}
            </span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-64 border-r bg-background min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm shadow-sm">
            Q
          </div>
          2Know
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        <nav className="px-3 space-y-0.5">
          {/* Top-level links (Dashboard) */}
          {topLinks.map(renderLink)}

          {/* Grouped Navigation */}
          {groups.map((group) => {
            const isCollapsed = collapsedGroups[group.tKey] ?? false;
            const groupActive = isGroupActive(group);

            return (
              <div key={group.tKey} className="pt-3">
                <button
                  onClick={() => toggleGroup(group.tKey)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-md",
                    groupActive
                      ? "text-primary/80"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                  )}
                >
                  <span>{t(group.tKey)}</span>
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform duration-200",
                    isCollapsed && "-rotate-90"
                  )} />
                </button>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-0.5 mt-1">
                        {group.links.map(renderLink)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Bottom links (Settings) */}
          <div className="pt-3 border-t border-border/50 mt-3">
            {bottomLinks.map(renderLink)}
          </div>
        </nav>
      </div>

      <div className="p-4 border-t mt-auto">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("sidebar.aiQuota")}</span>
            <span className="font-semibold">100%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 w-full rounded-full"></div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-pink-500 line-through">⚡ {t("sidebar.unlimited")}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-default">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white flex items-center justify-center font-semibold text-sm uppercase shadow-sm">
            {user?.full_name ? user.full_name[0] : "U"}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium leading-none truncate">{user?.full_name || "User"}</span>
            <span className="text-[11px] text-muted-foreground mt-1 truncate">{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="p-1.5 hover:bg-accent rounded-md text-muted-foreground transition-colors" title={t("header.logout")}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
