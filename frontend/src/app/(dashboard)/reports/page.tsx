"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, BarChart3, TrendingUp, Users, ArrowRight, Loader2, FileText, Download } from "lucide-react";
import Link from "next/link";
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
}

export default function ReportsPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, quizzesData] = await Promise.all([
          apiFetch("/stats/dashboard"),
          apiFetch("/quizzes")
        ]);
        setStats(statsData);
        setQuizzes(quizzesData);
      } catch (err) {
        console.error("Failed to load reports data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("2know_token");
      const res = await fetch("http://localhost:8080/api/stats/export", {
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
      toast.success("Xuất dữ liệu CSV thành công!");
    } catch (err: any) {
      toast.error("Lỗi khi xuất CSV: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-[60vh] text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p>{t("reports.loading")}</p>
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

      <div className="bg-background border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-sm shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={t("reports.searchPlaceholder")} 
              className="pl-9 h-10 w-full bg-background"
            />
          </div>
          <Button variant="outline" className="gap-2 bg-background shrink-0">
            <Filter className="w-4 h-4" /> {t("reports.filterReport")}
          </Button>
        </div>

        <div className="divide-y">
          {quizzes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {t("reports.noReports")}
            </div>
          ) : (
            quizzes.map(quiz => (
              <div key={quiz.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-muted transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-card-foreground text-lg">{quiz.title}</h3>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${quiz.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-muted-foreground'}`}>
                      {quiz.status === 'published' ? t('reports.statusOngoing') : t('reports.statusDraftLabel')}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    <span>Ngày tạo: {new Date(quiz.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="flex gap-8 sm:gap-12 text-center shrink-0">
                  <div className="flex flex-col opacity-50">
                    <span className="text-xl font-bold text-card-foreground">---</span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("reports.submissions")}</span>
                  </div>
                  <div className="flex flex-col opacity-50">
                    <span className="text-xl font-bold text-emerald-600">---</span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t("reports.avgScore")}</span>
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                  <Link href={`/quizzes/${quiz.id}`}>
                    <Button variant="outline" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                      {t("reports.viewDetail")} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
