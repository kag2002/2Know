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
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

import { useTranslation } from "@/context/LanguageContext";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  
  const [user, setUser] = useState<{full_name?: string; email?: string} | null>(null);

  const sidebarLinks = [
    { icon: LayoutDashboard, tKey: "sidebar.overview", href: "/overview" },
    { icon: FileText, tKey: "sidebar.quizzes", href: "/quizzes" },
    { icon: CheckCircle, tKey: "sidebar.grading", href: "/grading", badge: 135 },
    { icon: Library, tKey: "sidebar.rubrics", href: "/rubrics" },
    { icon: FileText, tKey: "sidebar.omr", href: "/omr" },
    { icon: Users, tKey: "sidebar.students", href: "/students" },
    { icon: GraduationCap, tKey: "sidebar.classes", href: "/classes" },
    { icon: Library, tKey: "sidebar.questionBank", href: "/question-bank" },
    { icon: Share2, tKey: "sidebar.sharing", href: "/sharing" },
    { icon: Tags, tKey: "sidebar.tags", href: "/tags" },
    { icon: StickyNote, tKey: "sidebar.notes", href: "/notes" },
    { icon: Settings, tKey: "sidebar.settings", href: "/settings" },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("2know_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    document.cookie = "2know_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem("2know_token");
    localStorage.removeItem("2know_user");
    router.push("/login");
  };

  return (
    <aside className="w-64 border-r bg-background min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            Q
          </div>
          2Know
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-0.5"
                )}
              >
                <link.icon className="w-5 h-5" />
                {t(link.tKey)}
                {link.badge && (
                  <span className={cn(
                    "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
                    isActive ? "bg-primary-foreground/20" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                  )}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t mt-auto">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t("sidebar.aiQuota")}</span>
            <span className="font-semibold">100%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 w-full rounded-full"></div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="text-pink-500 line-through">⚡ {t("sidebar.unlimited")}</span>
          </div>
        </div>

        <div
          className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-semibold uppercase">
            {user?.full_name ? user.full_name[0] : "U"}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium leading-none truncate">{user?.full_name || "User"}</span>
            <span className="text-xs text-muted-foreground mt-1 truncate">{user?.email}</span>
          </div>
          <button onClick={handleLogout} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
