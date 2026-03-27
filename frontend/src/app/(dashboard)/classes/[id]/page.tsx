"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, BarChart3, Mail, Search, MoreVertical, TrendingUp, Award, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/context/LanguageContext";

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
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
          <Mail className="w-4 h-4" /> {t("classDetail.invite")}
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
                          <DropdownMenuItem>{t("classDetail.viewProfile")}</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600">{t("classDetail.removeFromClass")}</DropdownMenuItem>
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
    </div>
  );
}
