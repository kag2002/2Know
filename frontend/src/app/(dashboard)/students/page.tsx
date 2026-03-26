"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Plus, MoreVertical, GraduationCap, BarChart3, Mail, Trash2, Edit2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const allStudents = [
  { id: "1", name: "Nguyễn Thị Mai", studentId: "HS001", email: "mai.nt@school.edu.vn", class: "12A1 - Toán", avgScore: 9.2, tests: 12, status: "excellent" },
  { id: "2", name: "Trần Văn Hoàng", studentId: "HS002", email: "hoang.tv@school.edu.vn", class: "12A1 - Toán", avgScore: 8.7, tests: 11, status: "good" },
  { id: "3", name: "Lê Thị Hương", studentId: "HS003", email: "huong.lt@school.edu.vn", class: "10A5 - Văn", avgScore: 8.1, tests: 10, status: "good" },
  { id: "4", name: "Phạm Đức Anh", studentId: "HS004", email: "anh.pd@school.edu.vn", class: "12A1 - Toán", avgScore: 7.5, tests: 9, status: "average" },
  { id: "5", name: "Võ Minh Tuấn", studentId: "HS005", email: "tuan.vm@school.edu.vn", class: "11B2 - Lý", avgScore: 7.0, tests: 8, status: "average" },
  { id: "6", name: "Đặng Thị Lan", studentId: "HS006", email: "lan.dt@school.edu.vn", class: "10A5 - Văn", avgScore: 6.3, tests: 7, status: "warning" },
  { id: "7", name: "Bùi Quốc Khánh", studentId: "HS007", email: "khanh.bq@school.edu.vn", class: "IELTS 7.0+", avgScore: 5.8, tests: 5, status: "danger" },
  { id: "8", name: "Hoàng Thị Yến", studentId: "HS008", email: "yen.ht@school.edu.vn", class: "11B2 - Lý", avgScore: 5.2, tests: 4, status: "danger" },
  { id: "9", name: "Trịnh Minh Đức", studentId: "HS009", email: "duc.tm@school.edu.vn", class: "12A1 - Toán", avgScore: 8.9, tests: 12, status: "excellent" },
  { id: "10", name: "Ngô Thị Hồng", studentId: "HS010", email: "hong.nt@school.edu.vn", class: "IELTS 7.0+", avgScore: 7.8, tests: 6, status: "good" },
];

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  const filtered = allStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.studentId.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === "all" || s.class === filterClass;
    return matchSearch && matchClass;
  });

  const classes = [...new Set(allStudents.map(s => s.class))];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-600 bg-emerald-50";
    if (score >= 6.5) return "text-amber-600 bg-amber-50";
    return "text-rose-600 bg-rose-50";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent": return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-semibold">Xuất sắc</span>;
      case "good": return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-semibold">Tốt</span>;
      case "average": return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-semibold">Trung bình</span>;
      case "warning": return <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-[10px] font-semibold">Cần chú ý</span>;
      case "danger": return <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-semibold">Yếu</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Học sinh</h1>
          <p className="text-muted-foreground mt-1">Tổng hợp hồ sơ, điểm số và phân loại năng lực học tập của toàn bộ học sinh.</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => toast.info("Tính năng thêm học sinh đang phát triển!")}>
          <Plus className="w-4 h-4" /> Thêm học sinh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng học sinh", value: allStudents.length, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Điểm TB toàn trường", value: (allStudents.reduce((a, s) => a + s.avgScore, 0) / allStudents.length).toFixed(1), icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "HS xuất sắc", value: allStudents.filter(s => s.status === "excellent").length, icon: GraduationCap, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Cần hỗ trợ", value: allStudents.filter(s => s.status === "danger").length, icon: Users, color: "text-rose-500", bg: "bg-rose-50" },
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

      {/* Student Table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-lg">Danh sách học sinh</CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                placeholder="Tìm tên hoặc mã HS..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 w-full rounded-md border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors px-3"
              />
            </div>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="h-9 px-3 rounded-md border bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả lớp</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-semibold w-8">#</th>
                  <th className="pb-3 font-semibold">Họ và Tên</th>
                  <th className="pb-3 font-semibold">Mã HS</th>
                  <th className="pb-3 font-semibold">Lớp</th>
                  <th className="pb-3 font-semibold text-center">Điểm TB</th>
                  <th className="pb-3 font-semibold text-center">Bài thi</th>
                  <th className="pb-3 font-semibold text-center">Xếp loại</th>
                  <th className="pb-3 font-semibold w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, i) => (
                  <tr key={student.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors group">
                    <td className="py-3.5 text-slate-400">{i + 1}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                          {student.name.split(' ').pop()?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{student.name}</p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-xs text-slate-500">{student.studentId}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">{student.class}</span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-7 rounded-md font-bold text-xs ${getScoreColor(student.avgScore)}`}>
                        {student.avgScore}
                      </span>
                    </td>
                    <td className="py-3.5 text-center text-slate-600">{student.tests}</td>
                    <td className="py-3.5 text-center">{getStatusBadge(student.status)}</td>
                    <td className="py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => toast.info(`Mở hồ sơ ${student.name}`)}>
                            <GraduationCap className="w-4 h-4 text-slate-400" /> Xem hồ sơ
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Mail className="w-4 h-4 text-slate-400" /> Gửi tin nhắn
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit2 className="w-4 h-4 text-slate-400" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-rose-600">
                            <Trash2 className="w-4 h-4" /> Xóa học sinh
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Không tìm thấy học sinh nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
