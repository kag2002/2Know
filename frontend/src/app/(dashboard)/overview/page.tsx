"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, CheckSquare, BarChart, Settings2, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "☀️ Chào buổi sáng";
  if (h < 18) return "🌤️ Chào buổi chiều";
  return "🌙 Chào buổi tối";
}

function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  
  useEffect(() => {
    const numMatch = value.match(/[\d,.]+/);
    if (!numMatch) { setDisplay(value); return; }
    
    const target = parseFloat(numMatch[0].replace(",", "."));
    const duration = 1200;
    const start = performance.now();
    
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(target * eased * 10) / 10;
      
      if (target % 1 !== 0) {
        setDisplay(current.toFixed(1).replace(".", ","));
      } else {
        setDisplay(Math.round(current).toString());
      }
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  return <>{display}{suffix}</>;
}

import { useTranslation } from "@/context/LanguageContext";
import { apiFetch } from "@/lib/api";

interface DashboardStats {
  total_quizzes: number;
  total_submissions: number;
  avg_score: number;
  total_questions: number;
}

export default function OverviewPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setMounted(true);
    apiFetch("/stats/dashboard")
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  const statCards = [
    {
      value: String(stats?.total_quizzes ?? "—"), label: t("overview.stat.active"), desc: t("overview.stat.quizzes"),
      icon: Layers, iconColor: "text-indigo-500", badgeColor: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
      badge: t("overview.badge.stable"), change: null, changeLabel: t("overview.badge.noChange"),
    },
    {
      value: String(stats?.total_submissions ?? "—"), label: t("overview.stat.last7days"), desc: t("overview.stat.submissions"),
      icon: CheckSquare, iconColor: "text-rose-500", badgeColor: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
      badge: t("overview.badge.decreased"), change: null, changeLabel: t("overview.badge.noChange"),
    },
    {
      value: stats?.avg_score != null ? stats.avg_score.toFixed(1).replace(".", ",") : "—", label: t("overview.stat.avgScore"), desc: t("overview.stat.global"),
      icon: BarChart, iconColor: "text-emerald-500", badgeColor: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      badge: t("overview.badge.increased"), change: null, changeLabel: t("overview.badge.noChange"), suffix: "%",
    },
    {
      value: String(stats?.total_questions ?? "—"), label: t("sidebar.grading"), desc: t("overview.badge.essayQueue"),
      icon: null, iconColor: "text-orange-500", badgeColor: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
      badge: t("overview.badge.needsAttention"), change: null, changeLabel: t("overview.badge.noChange"),
    },
  ];

  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-muted px-2.5 py-0.5 rounded-full text-xs font-medium text-muted-foreground">
              {getGreeting()}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">
            {t("overview.welcome")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("overview.subtitle")}
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-background">
          <Settings2 className="w-4 h-4" /> {t("overview.reload")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card 
            key={i} 
            className={`shadow-sm border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${
              mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
            }`}
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both", animationDuration: "500ms" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">{dateStr}</CardTitle>
              <span className="text-xs text-muted-foreground">{timeStr}</span>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-card-foreground">
                <AnimatedNumber value={card.value} suffix={card.suffix || ""} />
                {card.suffix || ""}
              </div>
              <p className={`text-xs font-medium mt-1 ${
                card.change && card.change > 0 ? "text-emerald-500" :
                card.change && card.change < 0 ? "text-rose-500" :
                "text-muted-foreground"
              }`}>
                {card.change && card.change > 0 && <TrendingUp className="inline w-3 h-3 mr-1" />}
                {card.change && card.change < 0 && <TrendingDown className="inline w-3 h-3 mr-1" />}
                {card.changeLabel}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {card.icon ? (
                    <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-500"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  )}
                  <span className="font-medium">{card.label}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${card.badgeColor}`}>{card.badge}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Activity Feed and Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className={`col-span-4 shadow-sm border-border ${mounted ? "animate-in fade-in duration-500" : "opacity-0"}`} style={{ animationDelay: "500ms", animationFillMode: "both" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("overview.activityStream")}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{t("overview.activityDesc")}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-emerald-600 outline-emerald-200 bg-emerald-50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {t("overview.live")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Lê Uy Đức", action: t("overview.stream.action1"), time: "17:36", status: t("overview.stream.status1"), statusColor: "text-pink-500 bg-pink-50 dark:bg-pink-900/30 dark:text-pink-400" },
                { name: "Nguyễn Thị Mai", action: t("overview.stream.action2"), time: "16:20", status: t("overview.stream.status2"), statusColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
                { name: "Trần Văn Hoàng", action: t("overview.stream.action3"), time: "15:45", status: t("overview.stream.status3"), statusColor: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
                { name: t("overview.stream.name4"), action: t("overview.stream.action4"), time: "14:10", status: t("overview.stream.status2"), statusColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col p-3 rounded-lg border text-sm hover:bg-muted/80 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium group-hover:text-indigo-600 transition-colors">
                      <strong>{item.name}</strong> {item.action}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${item.statusColor} shrink-0 ml-2`}>{item.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                    <span>{item.time} {dateStr}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className={`col-span-3 shadow-sm border-border ${mounted ? "animate-in fade-in duration-500" : "opacity-0"}`} style={{ animationDelay: "600ms", animationFillMode: "both" }}>
           <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("overview.scoreDistribution")}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{t("overview.scoreDesc")}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
              {/* Doughnut Chart */}
              <div className="w-48 h-48 rounded-full border-[16px] border-emerald-400 border-t-amber-400 border-r-rose-500 border-b-blue-400 flex items-center justify-center relative shadow-inner">
                <div className="text-center">
                  <div className="text-3xl font-bold">108</div>
                  <div className="text-xs text-muted-foreground">{t("overview.graded")}</div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                {[
                  { label: t("overview.excellent"), color: "bg-emerald-400", pct: "42%" },
                  { label: t("overview.good"), color: "bg-blue-400", pct: "28%" },
                  { label: t("overview.average"), color: "bg-amber-400", pct: "20%" },
                  { label: t("overview.poor"), color: "bg-rose-500", pct: "10%" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-xs">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                    <span className="text-muted-foreground">{item.label} ({item.pct})</span>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
