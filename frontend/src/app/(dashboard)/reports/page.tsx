"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const AreaChart = dynamic(() => import("recharts").then((mod) => mod.AreaChart), { ssr: false, loading: () => <Skeleton className="w-full h-full rounded-xl opacity-20" /> });
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((mod) => mod.CartesianGrid), { ssr: false });
const RechartsTooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((mod) => mod.ResponsiveContainer), { ssr: false });
import { Search, Filter, BarChart3, TrendingUp, Users, ArrowRight, Loader2, FileText, Download } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "@/context/LanguageContext";

interface DashboardStats {
  total_quizzes: number;
  total_submissions: number;
  avg_score: number;
}

interface Quiz {
  id: string;
  title: string;
  status: string;
  created_at: string;
  submissions: number;
  avg_score: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

function ReportsContent() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 300);
  const [loading, setLoading] = useState(true);

  // PERFORMANCE: Freeze Array logic via useMemo block to stop cascading un-debounced rendering
  const filteredQuizzes = useMemo(() => {
    if (!debouncedSearch) return quizzes;
    const lowerSearch = debouncedSearch.toLowerCase();
    return quizzes.filter(q => q.title.toLowerCase().includes(lowerSearch));
  }, [quizzes, debouncedSearch]);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [statsData, quizzesData] = await Promise.all([
          apiFetch("/stats/dashboard"),
          apiFetch("/quizzes")
        ]);
        if (isMounted) {
          setStats(statsData);
          setQuizzes(quizzesData);
        }
      } catch (err) {
        console.error("Failed to load reports data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("2know_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/export`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "2know_report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(t("dashboard.reports.exportSuccess"));
    } catch (err: any) {
      toast.error(t("dashboard.reports.exportError") + " " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("reports.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("reports.subtitle")}
          </p>
        </div>
        <Button onClick={handleExportCSV} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Download className="w-4 h-4" /> {t("reports.exportCSV")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">{t("reports.totalQuizzes")}</CardTitle>
            <FileText className="w-5 h-5 text-indigo-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{stats?.total_quizzes || 0}</div>
            <p className="text-xs text-indigo-200 mt-1">{t("reports.ready")}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("reports.systemSubmissions")}</CardTitle>
            <Users className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-card-foreground">{stats?.total_submissions || 0}</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> {t("reports.stableGrowth")}</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("reports.systemAvgScore")}</CardTitle>
            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center font-bold text-xs">P</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-card-foreground">{stats?.avg_score?.toFixed(1) || "0.0"}</div>
            <p className="text-xs text-slate-400 mt-1">{t("reports.basedOnAll")}</p>
          </CardContent>
        </Card>
      </div>

      {quizzes.length > 0 && (
        <Card className="border-none shadow-sm bg-background mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t("dashboard.reports.trendTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...quizzes].reverse()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="title" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="avg_score" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 10]} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 500, color: '#4f46e5' }}
                  formatter={(value: any) => [`${Number(value).toFixed(1)} ${t("dashboard.reports.scorePoint")}`, t("dashboard.reports.average")]}
                  labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="avg_score" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/50 flex flex-col sm:flex-row gap-4 justify-between items-center backdrop-blur-sm">
          <div className="relative w-full max-w-sm shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={t("reports.searchPlaceholder")} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 w-full bg-background/80 focus:bg-background transition-colors"
            />
          </div>
          <Button variant="outline" className="gap-2 bg-background/80 shrink-0">
            <Filter className="w-4 h-4" /> {t("reports.filterReport")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6 bg-slate-50/50 dark:bg-slate-900/20">
          {filteredQuizzes.length === 0 ? (
            <div className="col-span-full p-16 text-center text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/30">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">{t("reports.noReports")}</h3>
              <p className="text-sm mt-1">{t("dashboard.reports.emptyState")}</p>
            </div>
          ) : (
            filteredQuizzes.map(quiz => (
              <Card key={quiz.id} className="group overflow-hidden border bg-background hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col">
                <div className="p-6 flex flex-col h-full relative">
                  {/* Decorative Background Glow */}
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
                  
                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <div className="space-y-1.5 pr-4">
                      <h3 className="font-bold text-card-foreground text-xl leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Khởi tạo: {new Date(quiz.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm ${quiz.status === 'published' ? 'bg-emerald-500 text-white dark:bg-emerald-600' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {quiz.status === 'published' ? 'Đang mở' : 'Bản nháp'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-slate-800 dark:text-slate-200 leading-none mb-1">{quiz.submissions || 0}</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Lượt nộp</span>
                    </div>
                    <div className="flex flex-col border-l-2 pl-4 border-slate-200 dark:border-slate-800">
                      <span className="text-3xl font-black text-emerald-500 leading-none mb-1">{quiz.avg_score ? quiz.avg_score.toFixed(1) : "0.0"}</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Điểm TB</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-2 relative z-10">
                    <Link href={`/reports/${quiz.id}`} className="block w-full">
                      <Button variant="ghost" className="w-full text-indigo-600 hover:bg-indigo-600 hover:text-white bg-indigo-50/50 dark:bg-indigo-500/10 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-indigo-500/25 h-11">
                        Phân tích chuyên sâu <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center flex-col items-center h-[60vh] text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" /></div>}>
      <ReportsContent />
    </Suspense>
  );
}
