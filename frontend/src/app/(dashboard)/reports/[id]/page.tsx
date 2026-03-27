"use client";

import { use, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, TrendingUp, Award, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useTranslation } from "@/context/LanguageContext";

interface ResultItem {
  id: string;
  student_name: string;
  student_email: string;
  score: number;
  total_correct: number;
  total_questions: number;
  time_taken_seconds: number;
  tab_switch_count: number;
  created_at: string;
}

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/quizzes/${id}/results`);
        setResults(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [id]);

  const totalSubmissions = results.length;
  const avgScore = totalSubmissions > 0 ? (results.reduce((sum, r) => sum + r.score, 0) / totalSubmissions) : 0;
  const maxScore = totalSubmissions > 0 ? Math.max(...results.map(r => r.score)) : 0;
  const totalViolations = results.reduce((sum, r) => sum + (r.tab_switch_count || 0), 0);

  // Build score distribution from real data
  const ranges = ["0-10%","10-20%","20-30%","30-40%","40-50%","50-60%","60-70%","70-80%","80-90%","90-100%"];
  const colors = ["#ef4444","#ef4444","#f97316","#f97316","#eab308","#eab308","#22c55e","#22c55e","#10b981","#10b981"];
  const scoreDistribution = ranges.map((range, i) => {
    const low = i * 10;
    const high = (i + 1) * 10;
    const count = results.filter(r => {
      const pct = (r.score / 10) * 100;
      return pct >= low && (i === 9 ? pct <= high : pct < high);
    }).length;
    return { range, count, color: colors[i] };
  });

  // Top students sorted by score
  const topStudents = [...results]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(r => ({
      name: r.student_name || r.student_email || "Guest",
      score: r.score,
      time: `${Math.floor(r.time_taken_seconds / 60)}:${String(r.time_taken_seconds % 60).padStart(2, "0")}`,
      violations: r.tab_switch_count || 0,
    }));

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">{error}</h2>
        <Link href="/reports"><Button variant="outline">← Quay lại</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/reports">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("reportDetail.title") !== "reportDetail.title" ? t("reportDetail.title") : "Chi tiết Báo cáo"}
          </h1>
          <p className="text-muted-foreground mt-1">Mã đề: {id} • {totalSubmissions} bài nộp</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng bài nộp", value: String(totalSubmissions), icon: Users, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/30" },
          { label: "Điểm trung bình", value: avgScore.toFixed(1), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
          { label: "Điểm cao nhất", value: maxScore.toFixed(1), icon: Award, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/30" },
          { label: "Vi phạm tab", value: String(totalViolations), icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/30" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Phân bố điểm số</CardTitle>
            <p className="text-sm text-muted-foreground">Biểu đồ phân phối điểm của toàn bộ học sinh</p>
          </CardHeader>
          <CardContent>
            {totalSubmissions === 0 ? (
              <p className="text-center text-muted-foreground py-12">Chưa có bài nộp nào.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistribution} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                    formatter={(value) => [`${value} học sinh`, "Số lượng"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Bảng xếp hạng TOP 5</CardTitle>
            <p className="text-sm text-muted-foreground">Học sinh có điểm số cao nhất</p>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Chưa có dữ liệu.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-semibold">#</th>
                      <th className="pb-3 font-semibold">Họ và Tên</th>
                      <th className="pb-3 font-semibold text-center">Điểm</th>
                      <th className="pb-3 font-semibold text-center">Thời gian</th>
                      <th className="pb-3 font-semibold text-center">Vi phạm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStudents.map((s, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted transition-colors">
                        <td className="py-3">
                          {i < 3 ? (
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ${
                              i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : "bg-amber-700"
                            }`}>{i + 1}</span>
                          ) : (
                            <span className="text-muted-foreground pl-2">{i + 1}</span>
                          )}
                        </td>
                        <td className="py-3 font-medium text-card-foreground">{s.name}</td>
                        <td className="py-3 text-center">
                          <span className={`font-bold ${s.score >= 8 ? "text-emerald-600" : s.score >= 5 ? "text-amber-600" : "text-rose-600"}`}>
                            {s.score.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 text-center text-muted-foreground">{s.time}</td>
                        <td className="py-3 text-center">
                          {s.violations > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-semibold">
                              <AlertTriangle className="w-3 h-3" /> {s.violations}
                            </span>
                          ) : (
                            <span className="text-emerald-500 text-xs font-medium">Không</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
