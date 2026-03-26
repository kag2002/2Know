"use client";

import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, TrendingUp, Award, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";
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

// Mock data
const scoreDistribution = [
  { range: "0-10%", count: 2, color: "#ef4444" },
  { range: "10-20%", count: 3, color: "#ef4444" },
  { range: "20-30%", count: 4, color: "#f97316" },
  { range: "30-40%", count: 6, color: "#f97316" },
  { range: "40-50%", count: 8, color: "#eab308" },
  { range: "50-60%", count: 12, color: "#eab308" },
  { range: "60-70%", count: 15, color: "#22c55e" },
  { range: "70-80%", count: 18, color: "#22c55e" },
  { range: "80-90%", count: 10, color: "#10b981" },
  { range: "90-100%", count: 5, color: "#10b981" },
];

const questionPerformance = Array.from({ length: 20 }, (_, i) => ({
  name: `Q${i + 1}`,
  correct: Math.floor(Math.random() * 60) + 30,
  incorrect: 0,
})).map(q => ({ ...q, incorrect: 100 - q.correct }));

const topStudents = [
  { name: "Nguyễn Thị Mai", score: 9.6, time: "32:15", violations: 0 },
  { name: "Trần Văn Hoàng", score: 9.2, time: "38:40", violations: 0 },
  { name: "Lê Thị Hương", score: 8.8, time: "41:05", violations: 1 },
  { name: "Phạm Đức Anh", score: 8.4, time: "35:22", violations: 0 },
  { name: "Võ Minh Tuấn", score: 8.0, time: "44:10", violations: 2 },
];

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Kiểm tra Toán Học giữa kỳ 2
          </h1>
          <p className="text-muted-foreground mt-1">Báo cáo chi tiết • Mã: {id}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng bài nộp", value: "83", icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Điểm trung bình", value: "7.4", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Điểm cao nhất", value: "9.6", icon: Award, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Vi phạm tab", value: "12", icon: ShieldAlert, color: "text-rose-500", bg: "bg-rose-50" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
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
          </CardContent>
        </Card>

        {/* Question Performance */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Hiệu suất từng câu hỏi</CardTitle>
            <p className="text-sm text-muted-foreground">Tỷ lệ % trả lời đúng cho mỗi câu hỏi</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={questionPerformance} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }}
                  formatter={(value, name) => [
                    `${value}%`,
                    name === "correct" ? "Đúng" : "Sai",
                  ]}
                />
                <Bar dataKey="correct" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} name="correct" />
                <Bar dataKey="incorrect" stackId="a" fill="#fca5a5" radius={[4, 4, 0, 0]} name="incorrect" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Students Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Bảng xếp hạng TOP 5</CardTitle>
          <p className="text-sm text-muted-foreground">Học sinh có điểm số cao nhất trong bài kiểm tra</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-semibold">#</th>
                  <th className="pb-3 font-semibold">Họ và Tên</th>
                  <th className="pb-3 font-semibold text-center">Điểm</th>
                  <th className="pb-3 font-semibold text-center">Thời gian</th>
                  <th className="pb-3 font-semibold text-center">Vi phạm</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((s, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3">
                      {i < 3 ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white ${
                          i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : "bg-amber-700"
                        }`}>{i + 1}</span>
                      ) : (
                        <span className="text-slate-400 pl-2">{i + 1}</span>
                      )}
                    </td>
                    <td className="py-3 font-medium text-slate-800">{s.name}</td>
                    <td className="py-3 text-center">
                      <span className={`font-bold ${s.score >= 8 ? "text-emerald-600" : s.score >= 5 ? "text-amber-600" : "text-rose-600"}`}>
                        {s.score}
                      </span>
                    </td>
                    <td className="py-3 text-center text-slate-500">{s.time}</td>
                    <td className="py-3 text-center">
                      {s.violations > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold">
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
        </CardContent>
      </Card>
    </div>
  );
}
