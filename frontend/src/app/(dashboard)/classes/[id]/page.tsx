"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, BarChart3, Mail, Search, MoreVertical, TrendingUp, Award, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/context/LanguageContext";
import { toast } from "sonner";

interface Student {
  id: string;
  full_name: string;
  email: string;
  student_id: string; // SBD
}

interface ClassData {
  id: string;
  name: string;
  subject: string;
  grade: string;
  school_year: string;
  description: string;
  students: Student[];
}

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTranslation();
  const { id } = use(params);
  
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);

  // Invite Student State
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ full_name: "", email: "", student_id: "" });
  const [isInviting, setIsInviting] = useState(false);

  // Edit Class State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const data = await apiFetch(`/classes/${id}`);
        // Ensure students array exists
        if (!data.students) data.students = [];
        setClassData(data);
      } catch (err) {
        console.error("Failed to load class data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassData();
  }, [id]);

  const handleInviteStudent = async () => {
    if (!newStudent.full_name || !newStudent.student_id) {
      toast.warning(t("students.alertNameEmail"));
      return;
    }
    setIsInviting(true);
    try {
      const created = await apiFetch("/students", {
        method: "POST",
        body: JSON.stringify({
          full_name: newStudent.full_name,
          email: newStudent.email,
          student_id: newStudent.student_id,
          class_id: id
        })
      });
      if (classData) setClassData({ ...classData, students: [created, ...classData.students] });
      setIsInviteDialogOpen(false);
      setNewStudent({ full_name: "", email: "", student_id: "" });
      toast.success(t("classDetail.inviteSuccess") || "Đã thêm học sinh vào lớp");
    } catch {
      toast.error(t("classDetail.inviteError") || "Lỗi khi thêm học sinh");
    } finally {
      setIsInviting(false);
    }
  };

  const handleEditClass = async () => {
    if (!editingClass || !editingClass.name) {
      toast.warning("Tên lớp không được để trống!");
      return;
    }
    try {
      await apiFetch(`/classes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editingClass.name,
          grade: editingClass.grade,
          subject: editingClass.subject,
          school_year: editingClass.school_year
        })
      });
      setClassData({ ...classData, ...editingClass });
      setIsEditDialogOpen(false);
      toast.success(t("classes.updateSuccess"));
    } catch {
      toast.error(t("classes.updateError"));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-card-foreground">{t("classDetail.notFound")}</h2>
        <Link href="/classes">
          <Button variant="outline" className="mt-4">{t("classDetail.backToList")}</Button>
        </Link>
      </div>
    );
  }

  const { name, subject, grade, school_year, students } = classData;

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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{name}</h1>
          <p className="text-muted-foreground mt-1">{subject || t("classDetail.noSubject")} • {grade || t("classDetail.noGrade")} • {t("classDetail.schoolYear")} {school_year || "---"}</p>
        </div>
        <Button variant="outline" className="gap-2 bg-background" onClick={() => {
          setEditingClass({ name, subject, grade, school_year });
          setIsEditDialogOpen(true);
        }}>
          Chỉnh sửa thông tin
        </Button>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsInviteDialogOpen(true)}>
          <Plus className="w-4 h-4" /> Thêm học sinh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("classDetail.headcount"), value: students.length, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: t("classDetail.classAvg"), value: "---", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: t("classDetail.excellent"), value: "---", icon: Award, color: "text-amber-500", bg: "bg-amber-50" },
          { label: t("classDetail.needHelp"), value: "---", icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-50" },
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

      {/* Student Roster */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t("classDetail.roster")}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{t("classDetail.rosterDesc")}</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder={t("classDetail.searchStudent")}
              className="pl-9 h-9 w-full rounded-md border bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-background transition-colors px-3"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-semibold w-8">#</th>
                  <th className="pb-3 font-semibold">{t("classDetail.colSBD")}</th>
                  <th className="pb-3 font-semibold">{t("classDetail.colName")}</th>
                  <th className="pb-3 font-semibold">{t("classDetail.colEmail")}</th>
                  <th className="pb-3 font-semibold text-center">{t("classDetail.colAvg")}</th>
                  <th className="pb-3 font-semibold text-center">{t("classDetail.colStatus")}</th>
                  <th className="pb-3 font-semibold w-10"></th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr key={student.id} className="border-b last:border-0 hover:bg-muted transition-colors">
                    <td className="py-3.5 text-slate-400">{i + 1}</td>
                    <td className="py-3.5 font-medium text-indigo-600">{student.student_id}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {student.full_name.split(' ').pop()?.[0] || "?"}
                        </div>
                        <span className="font-medium text-card-foreground">{student.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-muted-foreground">{student.email || "---"}</td>
                    <td className="py-3.5 text-center text-slate-400">---</td>
                    <td className="py-3.5 text-center">
                       <span className="px-2 py-0.5 bg-slate-100 text-muted-foreground rounded-full text-[10px] font-semibold uppercase">{t("classDetail.statusActive")}</span>
                    </td>
                    <td className="py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted text-slate-400">
                          <MoreVertical className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.location.href = `/students/${student.id}`}>{t("classDetail.viewProfile")}</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600" onClick={async () => {
                            if (!confirm(t("classDetail.confirmDeleteStudent"))) return;
                            try {
                              await apiFetch(`/students/${student.id}`, { method: 'DELETE' });
                              setClassData({ ...classData, students: classData.students.filter(s => s.id !== student.id) });
                              toast.success(t("classDetail.deleteStudentSuccess"));
                            } catch { toast.error(t("classDetail.deleteStudentError")) }
                          }}>{t("classDetail.removeFromClass")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                
                {students.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      {t("classDetail.noStudents")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invite Student Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm học sinh mới</DialogTitle>
            <DialogDescription>Học sinh sẽ được thêm trực tiếp vào danh sách lớp {classData.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sbd">Mã học sinh (SBD) <span className="text-rose-500">*</span></Label>
              <Input 
                id="sbd" 
                placeholder="VD: HS001" 
                value={newStudent.student_id} 
                onChange={(e) => setNewStudent({...newStudent, student_id: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullname">Họ và Tên <span className="text-rose-500">*</span></Label>
              <Input 
                id="fullname" 
                placeholder="VD: Nguyễn Văn A" 
                value={newStudent.full_name} 
                onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email liên hệ (Tùy chọn)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="VD: hs001@school.edu.vn" 
                value={newStudent.email} 
                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleInviteStudent} disabled={isInviting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isInviting ? "Đang thêm..." : "Xác nhận thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("classes.editInfo")}</DialogTitle>
            <DialogDescription>{t("classes.createDesc")}</DialogDescription>
          </DialogHeader>
          {editingClass && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Tên lớp học <span className="text-rose-500">*</span></Label>
                <Input 
                  id="edit-name" 
                  value={editingClass.name} 
                  onChange={(e) => setEditingClass({...editingClass, name: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-grade">Khối / Năm học</Label>
                <Input 
                  id="edit-grade" 
                  value={editingClass.grade} 
                  onChange={(e) => setEditingClass({...editingClass, grade: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subject">Môn học phụ trách</Label>
                <Input 
                  id="edit-subject" 
                  value={editingClass.subject} 
                  onChange={(e) => setEditingClass({...editingClass, subject: e.target.value})} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleEditClass} className="bg-indigo-600 hover:bg-indigo-700 text-white">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
