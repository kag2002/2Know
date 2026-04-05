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
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Files, Presentation, Link as LinkIcon, ScatterChart as ScatterChartIcon } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';

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
  const confirm = useConfirm();

  // Invite Student State
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ full_name: "", email: "", student_id: "" });
  const [isInviting, setIsInviting] = useState(false);

  // Edit Class State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);

  // Materials State
  const [materials, setMaterials] = useState<any[]>([]);
  const [isMaterialDialogOpen, setIsMaterialDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: "", description: "", link_url: "", type: "document" });
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);

  // Gradebook State
  // Gradebook & Analytics State
  const [gradebook, setGradebook] = useState<{ quizzes: any[], results: any[] } | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const [data, matsData, gbData, analyticsData] = await Promise.all([
           apiFetch(`/classes/${id}`),
           apiFetch(`/classes/${id}/materials`),
           apiFetch(`/classes/${id}/gradebook`),
           apiFetch(`/classes/${id}/analytics`)
        ]).catch(() => [null, [], null, null]);
        
        if (data && !data.students) data.students = [];
        if (data) setClassData(data);
        if (matsData) setMaterials(matsData);
        if (gbData) setGradebook(gbData);
        if (analyticsData) setAnalytics(analyticsData);
        if (gbData) setGradebook(gbData);
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
      toast.warning(t("classDetail.alertClassNameEmpty"));
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

  const handleAddMaterial = async () => {
    if (!newMaterial.title) {
      toast.warning(t("classDetail.alertMaterialEmpty"));
      return;
    }
    setIsAddingMaterial(true);
    try {
      const created = await apiFetch(`/classes/${id}/materials`, {
        method: "POST",
        body: JSON.stringify(newMaterial)
      });
      setMaterials([created, ...materials]);
      setIsMaterialDialogOpen(false);
      setNewMaterial({ title: "", description: "", link_url: "", type: "document" });
      toast.success(t("classDetail.materialAddSuccess"));
    } catch {
      toast.error(t("classDetail.materialAddError"));
    } finally {
      setIsAddingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (matId: string) => {
     const ok = await confirm({
       title: t("classDetail.delMaterialTitle"),
       description: t("classDetail.delMaterialDesc"),
       confirmLabel: t("common.delete"),
       variant: "warning"
     });
     if (!ok) return;
     try {
        await apiFetch(`/classes/${id}/materials/${matId}`, { method: 'DELETE' });
        setMaterials(materials.filter(m => m.id !== matId));
        toast.success(t("classDetail.materialDelSuccess"));
     } catch {
        toast.error(t("classDetail.materialDelError"));
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
          {t("classDetail.editBtn")}
        </Button>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsInviteDialogOpen(true)}>
          <Plus className="w-4 h-4" /> {t("classDetail.addStudentBtn")}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("classDetail.headcount"), value: students.length, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: t("classDetail.classAvg"), value: analytics?.avg_score ? analytics.avg_score.toFixed(2) : "---", icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: t("classDetail.excellent"), value: analytics?.students ? analytics.students.filter((s: any) => s.avg_score >= 8.0).length : "---", icon: Award, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: t("classDetail.needHelp"), value: analytics?.students ? analytics.students.filter((s: any) => s.avg_score > 0 && s.avg_score < 5.0).length : "---", icon: TrendingUp, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[650px] mb-6 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
          <TabsTrigger value="students" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"> {t("classDetail.tabStudents")}</TabsTrigger>
          <TabsTrigger value="grades" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"> {t("classDetail.tabGrades")}</TabsTrigger>
          <TabsTrigger value="materials" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400"> {t("classDetail.tabMaterials")}</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400">
            <ScatterChartIcon className="w-4 h-4 mr-2" /> Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-0 outline-none">
          <Card className="shadow-sm border-0 ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-white dark:bg-card">
              <div>
                <CardTitle className="text-lg font-bold">{t("classDetail.roster")}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">{t("classDetail.rosterDesc")}</p>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  placeholder={t("classDetail.searchStudent")}
                  className="pl-9 h-10 w-full rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all px-3"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y bg-slate-50/50 dark:bg-slate-900/20 text-left text-slate-500">
                      <th className="py-3 px-6 font-semibold w-12 text-center">#</th>
                      <th className="py-3 px-4 font-semibold">{t("classDetail.colSBD")}</th>
                      <th className="py-3 px-4 font-semibold">{t("classDetail.colName")}</th>
                      <th className="py-3 px-4 font-semibold">{t("classDetail.colEmail")}</th>
                      <th className="py-3 px-4 font-semibold text-center">{t("classDetail.colAvg")}</th>
                      <th className="py-3 px-4 font-semibold text-center">{t("classDetail.colStatus")}</th>
                      <th className="py-3 px-4 font-semibold w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, i) => {
                      let totalScore = 0;
                      let quizTaken = 0;
                      let violationCount = 0;

                      if (gradebook) {
                        gradebook.results.forEach(res => {
                          if (res.student_id === student.id) {
                            totalScore += res.score;
                            quizTaken++;
                            if (res.status === 'cheating_flagged') {
                              violationCount++;
                            }
                          }
                        });
                      }

                      const avg = quizTaken > 0 ? (totalScore / quizTaken).toFixed(1) : "---";
                      const isActive = violationCount === 0;

                      return (
                      <tr key={student.id} className="border-b last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 text-center text-slate-400 font-medium">{i + 1}</td>
                        <td className="py-4 px-4 font-bold text-indigo-600 dark:text-indigo-400">{student.student_id}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 flex items-center justify-center text-sm font-bold uppercase shrink-0 ring-2 ring-white dark:ring-slate-950 shadow-sm">
                              {student.full_name.split(' ').pop()?.[0] || "?"}
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">{student.full_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-500">{student.email || "---"}</td>
                        <td className="py-4 px-4 text-center">
                           <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold leading-none ${avg === "---" ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : Number(avg) >= 8 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : Number(avg) < 5 ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                              {avg}
                           </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                           {isActive ? (
                             <span className="inline-flex px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ring-emerald-600/20 inset-ring">{t("classDetail.statusActive")}</span>
                           ) : (
                             <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ring-rose-600/20 inset-ring cursor-help" title={t("classDetail.violationHint", { count: violationCount })}>
                                {t("classDetail.statusViolation")}
                             </span>
                           )}
                        </td>
                        <td className="py-4 px-4 text-center text-slate-400">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                              <DropdownMenuItem className="cursor-pointer font-medium" onClick={() => window.location.href = `/students/${student.id}`}>{t("classDetail.viewProfile")}</DropdownMenuItem>
                              <DropdownMenuItem className="text-rose-600 focus:text-rose-700 cursor-pointer font-medium" onClick={async () => {
                                const ok = await confirm({
                                  title: t("classDetail.deleteStudentTitle"),
                                  description: t("classDetail.deleteStudentDesc", { name: student.full_name }),
                                  confirmLabel: t("classDetail.deleteStudentBtn"),
                                  variant: "danger"
                                });
                                if (!ok) return;
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
                    )})}
                    
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <Users className="w-12 h-12 mb-3 text-slate-200 dark:text-slate-700" />
                            <p className="font-medium text-slate-500">{t("classDetail.noStudents")}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="mt-0 outline-none">
          <Card className="shadow-sm border-0 ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-2xl overflow-hidden min-h-[400px]">
             <CardHeader className="bg-white dark:bg-card">
                <CardTitle className="text-lg font-bold">{t("classDetail.gradebookTitle")}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  {t("classDetail.gradebookDesc")}
                </p>
             </CardHeader>
             <CardContent className="p-0">
                {!gradebook || !gradebook.quizzes || gradebook.quizzes.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 m-6 rounded-xl bg-slate-50/50 dark:bg-slate-900/20 gap-3">
                     <BarChart3 className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                     <div className="text-center">
                        <p className="text-slate-600 dark:text-slate-400 font-semibold">{t("classDetail.gradebookEmpty")}</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">{t("classDetail.gradebookAutoHint")}</p>
                     </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto overflow-y-auto max-h-[600px] border-t border-slate-200 dark:border-slate-800">
                    <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50/80 dark:bg-slate-900/40 text-left border-b border-slate-200 dark:border-slate-800">
                            <th className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 sticky left-0 top-0 bg-slate-50 dark:bg-slate-900 z-20 w-48 shadow-[1px_0_0_0_#e2e8f0] dark:shadow-[1px_0_0_0_#1e293b]">{t("classDetail.colStudent")}</th>
                            {gradebook.quizzes.map(q => (
                                <th key={q.id} className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-400 min-w-[120px] text-center border-l dark:border-slate-800 border-slate-200 sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                                  {q.title}
                                </th>
                            ))}
                            <th className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400 text-center border-l border-slate-200 dark:border-slate-800 min-w-[100px] sticky top-0 right-0 bg-indigo-50/50 dark:bg-indigo-900/20 z-20 shadow-[-1px_0_0_0_#e2e8f0] dark:shadow-[-1px_0_0_0_#312e81]">{t("classDetail.colAvgScore")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classData?.students.map(student => {
                              let totalScore = 0;
                              let quizTaken = 0;
                              const scoreMap: Record<string, number> = {};
                              const violationMap: Record<string, boolean> = {};
                              if (gradebook) {
                                gradebook.results.forEach(res => {
                                  if (res.student_id === student.id) {
                                    scoreMap[res.quiz_id] = res.score;
                                    if (res.status === 'cheating_flagged') {
                                        violationMap[res.quiz_id] = true;
                                    }
                                  }
                                });
                              }

                              gradebook.quizzes.forEach(q => {
                                const sc = scoreMap[q.id];
                                if (sc !== undefined) {
                                  totalScore += sc;
                                  quizTaken++;
                                }
                              });
                              const avg = quizTaken > 0 ? (totalScore / quizTaken).toFixed(1) : "---";

                              return (
                                <tr key={student.id} className="border-b last:border-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-3 sticky left-0 bg-white dark:bg-card group-hover:bg-slate-50/60 dark:group-hover:bg-slate-800/30 z-10 shadow-[1px_0_0_0_#f1f5f9] dark:shadow-[1px_0_0_0_#1e293b]">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                                          {student.full_name.split(' ').pop()?.[0]}
                                      </div>
                                      <span className="truncate max-w-[140px]">{student.full_name}</span>
                                    </td>
                                    {gradebook.quizzes.map(q => {
                                      const score = scoreMap[q.id];
                                      const hasViolation = violationMap[q.id];
                                      return (
                                          <td key={q.id} className="py-3 px-4 text-center border-l border-slate-100 dark:border-slate-800">
                                            {score !== undefined ? (
                                                <div className="flex flex-col items-center justify-center gap-0.5">
                                                  <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-sm font-extrabold tracking-tight ${score >= 8 ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20' : score < 5 ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-400/20' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-400/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/30'}`}>
                                                    {score.toFixed(1)}
                                                  </span>
                                                  {hasViolation && <span className="text-[9px] uppercase font-bold text-rose-500 tracking-wider">{t("classDetail.warningLabel")}</span>}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 dark:text-slate-600 text-[11px] font-bold uppercase tracking-wider">—</span>
                                            )}
                                          </td>
                                      )
                                    })}
                                    <td className="py-3 px-4 text-center border-l border-slate-100 dark:border-slate-800 font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/10 sticky right-0 z-10 shadow-[-1px_0_0_0_#e0e7ff] dark:shadow-[-1px_0_0_0_#312e81]">
                                      {avg}
                                    </td>
                                </tr>
                              )
                          })}
                        </tbody>
                    </table>
                  </div>
                )}
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-0 outline-none">
          <Card className="shadow-sm border-0 ring-1 ring-slate-200/50 dark:ring-slate-800/50 rounded-2xl overflow-hidden min-h-[400px]">
             <CardHeader className="flex flex-row justify-between items-center bg-white dark:bg-card">
                <div>
                  <CardTitle className="text-lg font-bold">{t("classDetail.materialsTitle")}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">{t("classDetail.materialsDesc")}</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold shadow-sm rounded-xl" onClick={() => setIsMaterialDialogOpen(true)}>
                   <Plus className="w-4 h-4" /> {t("classDetail.addMaterialBtn")}
                </Button>
             </CardHeader>
             <CardContent className="p-6">
                {materials.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-48 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20 gap-3">
                     <Files className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                     <p className="text-slate-500 font-semibold">{t("classDetail.materialsEmpty")}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {materials.map(mat => (
                        <div key={mat.id} className="group relative p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors bg-white dark:bg-card shadow-sm hover:shadow-md">
                           <div className="flex justify-between items-start mb-2">
                              {mat.type === 'video' ? <Presentation className="w-8 h-8 text-rose-500 bg-rose-50 p-1.5 rounded-lg" /> : <Files className="w-8 h-8 text-indigo-500 bg-indigo-50 p-1.5 rounded-lg" />}
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteMaterial(mat.id)}>
                                 <MoreVertical className="w-4 h-4" />
                              </Button>
                           </div>
                           <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate mt-3">{mat.title}</h3>
                           <p className="text-sm text-slate-500 line-clamp-2 mt-1 min-h-[40px]">{mat.description || t("classDetail.noDescription")}</p>
                           {mat.link_url && (
                             <a href={mat.link_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold mt-4 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-full">
                                <LinkIcon className="w-3 h-3" /> {t("classDetail.openLink")} 
                             </a>
                           )}
                        </div>
                     ))}
                  </div>
                )}
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0 outline-none space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-background">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Tổng Sinh Viên</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">{analytics?.total_students || 0}</h3>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Tỉ Lệ Đạt ({">="} 5.0)</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">{analytics?.pass_rate ? analytics.pass_rate.toFixed(1) : 0}%</h3>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Lượt Nộp Bài</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">{analytics?.total_submissions || 0}</h3>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Điểm Trung Bình</p>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">{analytics?.avg_score ? analytics.avg_score.toFixed(2) : '0.0'}</h3>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg">Phân Bố Kết Quả Học Tập (Nỗ Lực vs Kết Quả)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                {analytics?.students && analytics.students.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                      <XAxis 
                        type="number" 
                        dataKey="attempts" 
                        name="Số Lượt Nộp" 
                        label={{ value: "Số lượt nộp bài", position: "bottom", offset: 0 }}
                        tick={{fontSize: 12}}
                        allowDecimals={false}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="avg_score" 
                        name="Điểm Trung Bình" 
                        domain={[0, 10]}
                        label={{ value: "Điểm TB", angle: -90, position: "left", offset: 0 }}
                        tick={{fontSize: 12}}
                      />
                      <ZAxis type="number" range={[100, 100]} />
                      <RechartsTooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white dark:bg-slate-900 border shadow-lg rounded-lg p-3 text-sm">
                                <p className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">{data.student_name} ({data.student_id})</p>
                                <p className="text-slate-600 dark:text-slate-300">Điểm TB: <span className="font-medium">{data.avg_score.toFixed(1)}</span></p>
                                <p className="text-slate-600 dark:text-slate-300">Số bài đã nộp: <span className="font-medium">{data.attempts}</span></p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter data={analytics.students} name="Sinh viên">
                        {analytics.students.map((entry: any, index: number) => {
                          let color = "#ef4444"; 
                          if (entry.avg_score >= 8.0) {
                            color = "#10b981"; 
                          } else if (entry.avg_score >= 5.0 && entry.attempts >= 3) {
                            color = "#3b82f6"; 
                          } else if (entry.avg_score >= 5.0) {
                            color = "#f59e0b"; 
                          }
                          return <Cell key={`cell-${index}`} fill={color} opacity={0.8} />;
                        })}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <BarChart3 className="w-10 h-10 mb-4 opacity-50" />
                    <p>Chưa có đủ dữ liệu bài thi để hiển thị biểu đồ</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Student Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("classDetail.inviteDialogTitle")}</DialogTitle>
            <DialogDescription>{t("classDetail.inviteDialogDesc", { name: classData.name })}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sbd">{t("classDetail.labelSBD")} <span className="text-rose-500">*</span></Label>
              <Input 
                id="sbd" 
                placeholder="VD: HS001" 
                value={newStudent.student_id} 
                onChange={(e) => setNewStudent({...newStudent, student_id: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fullname">{t("classDetail.labelFullName")} <span className="text-rose-500">*</span></Label>
              <Input 
                id="fullname" 
                placeholder="VD: Nguyễn Văn A" 
                value={newStudent.full_name} 
                onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t("classDetail.labelEmail")}</Label>
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
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleInviteStudent} disabled={isInviting} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isInviting ? t("classDetail.inviting") : t("classDetail.confirmInvite")}
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleEditClass} className="bg-indigo-600 hover:bg-indigo-700 text-white">{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Material Dialog */}
      <Dialog open={isMaterialDialogOpen} onOpenChange={setIsMaterialDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("classDetail.materialDialogTitle")}</DialogTitle>
            <DialogDescription>{t("classDetail.materialDialogDesc", { name: classData.name })}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="mat-title">{t("classDetail.labelMaterialTitle")} <span className="text-rose-500">*</span></Label>
              <Input 
                id="mat-title" 
                placeholder="VD: Giáo án Tuần 1" 
                value={newMaterial.title} 
                onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mat-desc">{t("classDetail.labelMaterialDesc")}</Label>
              <Input 
                id="mat-desc" 
                placeholder="Lưu ý quan trọng cho bài giảng này..." 
                value={newMaterial.description} 
                onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mat-link">{t("classDetail.labelMaterialLink")}</Label>
              <Input 
                id="mat-link" 
                placeholder="https://..." 
                value={newMaterial.link_url} 
                onChange={(e) => setNewMaterial({...newMaterial, link_url: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMaterialDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleAddMaterial} disabled={isAddingMaterial} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {isAddingMaterial ? t("classDetail.saving") : t("classDetail.confirmAdd")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
