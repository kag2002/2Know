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

  useEffect(() => {
    apiFetch(`/students/${id}`)
      .then(data => setStudent(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>;
  if (!student) return <div className="p-8 text-center text-muted-foreground border rounded-xl m-8">{t("studentProfile.notFound")}</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/students">
          <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("studentProfile.title")}: {student.full_name || student.name}</h1>
          <p className="text-muted-foreground text-sm">{t("studentProfile.studentId")}: {student.student_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><User className="w-5 h-5 text-indigo-500"/> {t("studentProfile.personalInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{student.email || t("studentProfile.notUpdated")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{student.phone || t("studentProfile.notUpdated")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('vi-VN') : t("studentProfile.notUpdated")}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-500"/> {t("studentProfile.studyHistory")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-8 text-center border border-dashed rounded-lg text-muted-foreground bg-slate-50 dark:bg-slate-900/50">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              {t("studentProfile.loadingHistory")}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
