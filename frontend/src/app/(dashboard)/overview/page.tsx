"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, CheckSquare, BarChart, Settings2, TrendingUp, TrendingDown, Clock, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { vi, enUS, it } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), { ssr: false, loading: () => <Skeleton className="w-full h-full rounded-full opacity-20" /> });
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });

function getGreeting(t: (key: string) => string) {
  const h = new Date().getHours();
  if (h < 12) return t("overview.greetingMorning");
  if (h < 18) return t("overview.greetingAfternoon");
  return t("overview.greetingEvening");
}

import { AnimatedNumber } from "@/components/ui/animated-number";

import { useTranslation } from "@/context/LanguageContext";
import { apiFetch } from "@/lib/api";

interface ActivityItem {
  name: string;
  action: string;
  time: string;
  date: string;
  status: string;
  statusColor: string;
  dateIso?: string;
}

interface ScoreDist {
  excellent: number;
  good: number;
  average: number;
  poor: number;
}

interface DashboardStats {
  total_quizzes: number;
  total_submissions: number;
  avg_score: number;
  total_questions: number;
  recent_activity?: ActivityItem[];
  score_distribution?: ScoreDist;
}

export default function OverviewPage() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  const isMountedRef = useRef(true);

  const getDateLocale = useCallback(() => {
    switch(language) {
      case 'en': return enUS;
      case 'it': return it;
      default: return vi;
    }
  }, [language]);

  const loadDashboardData = useCallback(async () => {
    try {
      const data = await apiFetch("/stats/dashboard");
      if (isMountedRef.current) {
        setStats(data);
        setMounted(true);
      }
    } catch {
      // Handle gracefully
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadDashboardData();
    return () => { isMountedRef.current = false; };
  }, [loadDashboardData]);

  const statCards = useMemo(() => [
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
  ], [stats, t]);

  const pieData = useMemo(() => [
    { name: t("overview.excellent"), value: stats?.score_distribution?.excellent || 0, color: "#34d399" },
    { name: t("overview.good"), value: stats?.score_distribution?.good || 0, color: "#60a5fa" },
    { name: t("overview.average"), value: stats?.score_distribution?.average || 0, color: "#fbbf24" },
    { name: t("overview.poor"), value: stats?.score_distribution?.poor || 0, color: "#f43f5e" },
  ], [stats, t]);
  const totalGraded = useMemo(() => pieData.reduce((acc, curr) => acc + curr.value, 0), [pieData]);

  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  if (!stats) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-96 rounded-xl" />
          <Skeleton className="col-span-3 h-96 rounded-xl" />
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-muted px-2.5 py-0.5 rounded-full text-xs font-medium text-muted-foreground">
              {getGreeting(t)}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">
            {t("overview.welcome")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("overview.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-background" onClick={loadDashboardData}>
            <Settings2 className="w-4 h-4" /> {t("overview.reload") || "Tải lại"}
          </Button>
          <Link href="/quizzes/create">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4" /> {t("overview.createNew")}
            </Button>
          </Link>
        </div>
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
              {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                stats.recent_activity.map((item, i) => (
                  <div key={i} className="flex flex-col p-3 rounded-lg border text-sm hover:bg-muted/80 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium group-hover:text-indigo-600 transition-colors">
                        <strong>{item.name}</strong> {item.action}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${item.statusColor} shrink-0 ml-2`}>{item.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {item.dateIso ? formatDistanceToNow(new Date(item.dateIso), { addSuffix: true, locale: getDateLocale() }) : `${item.time} ${item.date}`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground border rounded-lg bg-card">
                  {t("overview.noActivity")}
                </div>
              )}
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
          <CardContent className="flex flex-col items-center justify-center p-6 h-full min-h-[300px]">
              {totalGraded > 0 ? (
                <div className="w-full h-56 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                        className="outline-none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '14px', fontWeight: 500 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Central Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-foreground">{totalGraded}</span>
                    <span className="text-xs text-muted-foreground">{t("overview.graded")}</span>
                  </div>
                </div>
              ) : (
                <div className="h-56 flex flex-col items-center justify-center">
                  <span className="text-sm font-medium text-muted-foreground">{t("overview.noGraded")}</span>
                </div>
              )}
              
              <div className="flex gap-4 mt-6 flex-wrap justify-center">
                {pieData.map((item, i) => {
                  const pct = totalGraded > 0 ? Math.round((item.value / totalGraded) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-semibold text-muted-foreground">{item.name} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
