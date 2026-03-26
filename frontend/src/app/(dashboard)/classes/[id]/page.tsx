"use client";

import { use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, BarChart3, Mail, Search, MoreVertical, TrendingUp, Award } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockStudents = [
  { id: "1", name: "Nguyễn Thị Mai", email: "mai.nt@school.edu.vn", avgScore: 9.2, testsCompleted: 8, status: "active" },
  { id: "2", name: "Trần Văn Hoàng", email: "hoang.tv@school.edu.vn", avgScore: 8.7, testsCompleted: 7, status: "active" },
  { id: "3", name: "Lê Thị Hương", email: "huong.lt@school.edu.vn", avgScore: 8.1, testsCompleted: 8, status: "active" },
  { id: "4", name: "Phạm Đức Anh", email: "anh.pd@school.edu.vn", avgScore: 7.5, testsCompleted: 6, status: "active" },
  { id: "5", name: "Võ Minh Tuấn", email: "tuan.vm@school.edu.vn", avgScore: 7.0, testsCompleted: 8, status: "warning" },
  { id: "6", name: "Đặng Thị Lan", email: "lan.dt@school.edu.vn", avgScore: 6.3, testsCompleted: 5, status: "warning" },
  { id: "7", name: "Bùi Quốc Khánh", email: "khanh.bq@school.edu.vn", avgScore: 5.8, testsCompleted: 4, status: "danger" },
  { id: "8", name: "Hoàng Thị Yến", email: "yen.ht@school.edu.vn", avgScore: 5.2, testsCompleted: 3, status: "danger" },
];

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const classInfo = {
    name: "12A1 - Toán Học - Cô Lan",
    subject: "Toán học",
    grade: "Lớp 12",
    year: "2025-2026",
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-600";
    if (score >= 6.5) return "text-amber-600";
    return "text-rose-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold uppercase">Tốt</span>;
      case "warning": return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-semibold uppercase">Cần chú ý</span>;
      case "danger": return <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-semibold uppercase">Yếu</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/classes">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{classInfo.name}</h1>
          <p className="text-muted-foreground mt-1">{classInfo.subject} • {classInfo.grade} • Năm học {classInfo.year}</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Mail className="w-4 h-4" /> Mời học sinh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Sĩ số", value: mockStudents.length, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Điểm TB lớp", value: (mockStudents.reduce((a, s) => a + s.avgScore, 0) / mockStudents.length).toFixed(1), icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "HS xuất sắc", value: mockStudents.filter(s => s.avgScore >= 8).length, icon: Award, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "HS cần hỗ trợ", value: mockStudents.filter(s => s.status === "danger").length, icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-50" },
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

      {/* Student Roster */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Danh sách học sinh</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Quản lý và theo dõi kết quả học tập của từng học sinh</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Tìm học sinh..."
              className="pl-9 h-9 w-full rounded-md border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors px-3"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-semibold w-8">#</th>
                  <th className="pb-3 font-semibold">Họ và Tên</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold text-center">Điểm TB</th>
                  <th className="pb-3 font-semibold text-center">Bài đã làm</th>
                  <th className="pb-3 font-semibold text-center">Trạng thái</th>
                  <th className="pb-3 font-semibold w-10"></th>
                </tr>
              </thead>
              <tbody>
                {mockStudents.map((student, i) => (
                  <tr key={student.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 text-slate-400">{i + 1}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold uppercase">
                          {student.name.split(' ').pop()?.[0]}
                        </div>
                        <span className="font-medium text-slate-800">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-500">{student.email}</td>
                    <td className="py-3.5 text-center">
                      <span className={`font-bold ${getScoreColor(student.avgScore)}`}>
                        {student.avgScore}
                      </span>
                    </td>
                    <td className="py-3.5 text-center text-slate-600">{student.testsCompleted}/8</td>
                    <td className="py-3.5 text-center">{getStatusBadge(student.status)}</td>
                    <td className="py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Xem hồ sơ chi tiết</DropdownMenuItem>
                          <DropdownMenuItem>Gửi tin nhắn</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600">Xóa khỏi lớp</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
