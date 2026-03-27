"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Plus, MoreVertical, GraduationCap, BarChart3, Mail, Trash2, Edit2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/context/LanguageContext";

interface StudentMetrics {
  id: string;
  name: string;
  studentId: string;
  email: string;
  class: string;
  avgScore: number;
  tests: number;
  status: string;
}

export default function StudentsPage() {
  const { t } = useTranslation();
  const [allStudents, setAllStudents] = useState<StudentMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await apiFetch("/students");
        setAllStudents(data || []);
      } catch (err: any) {
        toast.error("Không thể tải danh sách học sinh: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  const filtered = allStudents.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.studentId.toLowerCase().includes(search.toLowerCase());
    const matchClass = filterClass === "all" || s.class === filterClass;
    return matchSearch && matchClass;
  });

  const classes = [...new Set(allStudents.map(s => s.class))];

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (score >= 6.5) return "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400";
    return "text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent": return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-[10px] font-semibold">{t("students.statusExcellent")}</span>;
      case "good": return <span className="px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-[10px] font-semibold">{t("students.statusGood")}</span>;
      case "average": return <span className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full text-[10px] font-semibold">{t("students.statusAverage")}</span>;
      case "warning": return <span className="px-2 py-0.5 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-[10px] font-semibold">{t("students.statusWarning")}</span>;
      case "danger": return <span className="px-2 py-0.5 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-full text-[10px] font-semibold">{t("students.statusDanger")}</span>;
      default: return null;
    }
  };

  const handleAddStudent = async () => {
    const name = prompt("Nhập họ tên học sinh:");
    if (!name) return;
    const email = prompt("Nhập email học sinh:");
    if (!email) return;
    try {
      const newStudent = await apiFetch("/students", {
        method: "POST",
        body: JSON.stringify({ name, email, student_id: `HS${Date.now()}`, class: "Chưa phân lớp" }),
      });
      setAllStudents(prev => [...prev, newStudent]);
      toast.success(`Đã thêm học sinh "${name}" thành công!`);
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("students.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("students.subtitle")}</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleAddStudent}>
          <Plus className="w-4 h-4" /> {t("students.addNew")}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("students.total"), value: allStudents.length, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: t("students.avgSchoolScore"), value: allStudents.length ? (allStudents.reduce((a, s) => a + s.avgScore, 0) / allStudents.length).toFixed(1) : "0", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: t("students.excellentCount"), value: allStudents.filter(s => s.status === "excellent").length, icon: GraduationCap, color: "text-amber-500", bg: "bg-amber-50" },
          { label: t("students.needSupport"), value: allStudents.filter(s => s.status === "danger" || s.status === "warning").length, icon: Users, color: "text-rose-500", bg: "bg-rose-50" },
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
                className="pl-9 h-9 w-full rounded-md border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-background transition-colors px-3"
              />
            </div>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="h-9 px-3 rounded-md border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <tr className="border-b text-left text-muted-foreground">
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
                  <tr key={student.id} className="border-b last:border-0 hover:bg-muted transition-colors group">
                    <td className="py-3.5 text-slate-400">{i + 1}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
                          {student.name.split(' ').pop()?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">{student.name}</p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-xs text-muted-foreground">{student.studentId}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-1 bg-slate-100 text-muted-foreground rounded text-xs font-medium">{student.class}</span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center w-10 h-7 rounded-md font-bold text-xs ${getScoreColor(student.avgScore)}`}>
                        {student.avgScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3.5 text-center text-muted-foreground">{student.tests}</td>
                    <td className="py-3.5 text-center">{getStatusBadge(student.status)}</td>
                    <td className="py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => window.location.href = `/students/${student.id}`}>
                            <GraduationCap className="w-4 h-4 text-slate-400" /> Xem hồ sơ
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => apiFetch(`/students/${student.id}`, { method: 'DELETE' }).then(() => setAllStudents(prev => prev.filter(x => x.id !== student.id))).catch(e => toast.error('Lỗi khi xóa'))}>
                            <Trash2 className="w-4 h-4 text-rose-500" /> <span className="text-rose-600">Xóa học sinh</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Không có học sinh nào.
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
