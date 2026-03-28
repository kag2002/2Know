"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

const routeLabels: Record<string, string> = {
  overview: "sidebar.overview",
  quizzes: "sidebar.quizzes",
  grading: "sidebar.grading",
  rubrics: "sidebar.rubrics",
  omr: "sidebar.omr",
  students: "sidebar.students",
  classes: "sidebar.classes",
  "question-bank": "sidebar.questionBank",
  sharing: "sidebar.sharing",
  tags: "sidebar.tags",
  notes: "sidebar.notes",
  settings: "sidebar.settings",
  reports: "sidebar.reports",
  create: "create",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const { t } = useTranslation();
  
  const segments = pathname.split("/").filter(Boolean);

  // Don't show breadcrumb on root/overview
  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const tKey = routeLabels[seg];
    const label = tKey ? t(tKey) : decodeURIComponent(seg);
    const isLast = i === segments.length - 1;

    return { href, label, isLast, segment: seg };
  });

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground px-1 py-2" aria-label="Breadcrumb">
      <Link
        href="/overview"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
