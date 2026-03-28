"use client";

import { use, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, Phone, BookOpen, Clock, Calendar } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { apiFetch } from "@/lib/api";

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      apiFetch(`/students/${id}`),
      apiFetch(`/students/${id}/history`)
    ])
      .then(([studentData, historyData]) => {
        setStudent(studentData);
        setHistory(historyData || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>;
  if (!student) return <div className="p-8 text-center text-muted-foreground border rounded-xl m-8">{t("studentProfile.notFound") || "Không tìm thấy học sinh."}</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("studentProfile.title") || "Hồ sơ Học sinh"}: {student.full_name || student.name}</h1>
          <p className="text-muted-foreground text-sm">{t("studentProfile.studentId") || "Mã HSSV"}: {student.student_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><User className="w-5 h-5 text-indigo-500"/> {t("studentProfile.personalInfo") || "Thông tin Cá nhân"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{student.email || t("studentProfile.notUpdated") || "Chưa cập nhật"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{student.phone || t("studentProfile.notUpdated") || "Chưa cập nhật"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('vi-VN') : t("studentProfile.notUpdated") || "Chưa cập nhật"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-500"/> {t("studentProfile.studyHistory") || "Lịch sử học tập"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {history.length === 0 ? (
              <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground bg-slate-50 dark:bg-slate-900/50">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                {t("studentProfile.noHistory") || "Học sinh này chưa tham gia bài khảo sát nào."}
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left font-medium p-3 text-muted-foreground">{t("studentProfile.colQuiz")}</th>
                      <th className="text-left font-medium p-3 text-muted-foreground">{t("studentProfile.colTime")}</th>
                      <th className="text-right font-medium p-3 text-muted-foreground">{t("studentProfile.colScore")}</th>
                      <th className="text-center font-medium p-3 text-muted-foreground">{t("studentProfile.colStatus")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium text-foreground">{item.quiz_title}</td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          {new Date(item.created_at).toLocaleDateString('vi-VN', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`font-bold ${item.score >= 8 ? 'text-emerald-600' : item.score >= 5 ? 'text-amber-500' : 'text-rose-500'}`}>
                            {item.score.toFixed(1)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {item.status === 'completed' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                              {t("studentProfile.statusCompleted")}
                            </span>
                          ) : item.status === 'pending' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                              {t("studentProfile.statusPending")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                              {t("studentProfile.statusFlagged")}
                            </span>
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
