"use client";

import { Button } from "@/components/ui/button";
import { Clock, HelpCircle, AlertTriangle, ShieldCheck, User, Loader2 } from "lucide-react";
import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/context/LanguageContext";

interface Question {
  id: string;
}

interface TestQuizData {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  time_limit_minutes: number;
  description: string;
  require_fullscreen: boolean;
  disable_copy_paste: boolean;
  questions_count?: number;
  questions?: Question[];
}

export default function TestIntroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslation();
  
  const [quiz, setQuiz] = useState<TestQuizData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [studentInfo, setStudentInfo] = useState({ name: "", sbd: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadQuizInfo = async () => {
      try {
        const data = await apiFetch(`/test/quiz/${id}/metadata`, { requireAuth: false });
        setQuiz(data);
      } catch (err: any) {
        setError(t("testIntro.loadError") + (err.message || "Lỗi mạng"));
      } finally {
        setLoading(false);
      }
    };
    loadQuizInfo();
  }, [id]);

  const handleStart = () => {
    if (!studentInfo.name.trim() || !studentInfo.sbd.trim()) {
      setError(t("testIntro.missingInfo") || "Vui lòng nhập đầy đủ Họ Tên và Mã Học Sinh trước khi bắt đầu.");
      return;
    }
    // Store student info for guest mode
    sessionStorage.setItem("student_name", studentInfo.name.trim());
    sessionStorage.setItem("student_sbd", studentInfo.sbd.trim());
    router.push(`/test/${id}/take`);
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-[60vh] text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p>{t("testIntro.loading")}</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        {error ? error : t("testIntro.notFound")}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-background rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Test Info Header */}
        <div className="text-center space-y-3 pb-8 border-b">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-indigo-50/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-indigo-100">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
            {t("testIntro.openNow")}
          </div>
          <h1 className="text-3xl font-bold text-foreground leading-tight">{quiz.title}</h1>
          <p className="text-muted-foreground text-sm">
            {quiz.subject || t("testIntro.uncategorized")} • {quiz.grade_level || t("testIntro.freeLevel")}
          </p>
          {quiz.description && (
             <p className="mx-auto max-w-lg mt-4 text-sm text-muted-foreground italic bg-muted p-4 rounded-xl border border-dashed">
                &quot;{quiz.description}&quot;
             </p>
          )}
        </div>

        {/* Test Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center gap-2 p-5 rounded-xl bg-muted hover:bg-muted border border-border transition-colors">
            <div className="p-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl shadow-sm mb-1">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{t("testIntro.timeLimit")}</p>
              <p className="font-bold text-foreground text-lg">{quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes} ${t("testIntro.minutes")}` : t("testIntro.noLimit")}</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-2 p-5 rounded-xl bg-muted hover:bg-muted border border-border transition-colors">
            <div className="p-3 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl shadow-sm mb-1">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{t("testIntro.quantity")}</p>
              <p className="font-bold text-foreground text-lg">{quiz.questions?.length || quiz.questions_count || 0} {t("testIntro.questions")}</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-2 p-5 rounded-xl bg-muted hover:bg-muted border border-border transition-colors">
            <div className="p-3 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-xl shadow-sm mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{t("testIntro.security")}</p>
              <p className="font-bold text-foreground text-lg">{(quiz.require_fullscreen || quiz.disable_copy_paste) ? t("testIntro.antiCheat") : t("testIntro.standard")}</p>
            </div>
          </div>
        </div>

        {/* Security Rules Notice */}
        {(quiz.require_fullscreen || quiz.disable_copy_paste) && (
          <div className="bg-amber-50/80 border border-amber-200/60 rounded-xl p-5 flex gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 shadow-sm border border-amber-200">
               <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-amber-800 text-sm">{t("testIntro.cheatRuleTitle")}</h4>
              <ul className="text-[13px] text-amber-700 space-y-1 list-disc list-inside mt-2">
                {quiz.require_fullscreen && <li dangerouslySetInnerHTML={{ __html: t("testIntro.cheatRule1") }} />}
                {quiz.disable_copy_paste && <li>{t("testIntro.cheatRule2")}</li>}
                <li>{t("testIntro.cheatRule3")}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Entry Form */}
        <div className="bg-background border shadow-sm p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          {error && (
            <div className="mb-4 p-3 text-sm text-rose-600 border border-rose-200 bg-rose-50 rounded-lg animate-in fade-in">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("testIntro.fullName")} <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                maxLength={250}
                placeholder={t("testIntro.fullNamePlaceholder") || "Nhập Họ Tên của bạn..."}
                value={studentInfo.name}
                onChange={e => { setStudentInfo({...studentInfo, name: e.target.value}); setError(""); }}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:font-normal placeholder:text-slate-400" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("testIntro.studentId")} <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                maxLength={90}
                placeholder={t("testIntro.studentIdPlaceholder") || "Nhập Mã học sinh..."}
                value={studentInfo.sbd}
                onChange={e => { setStudentInfo({...studentInfo, sbd: e.target.value}); setError(""); }}
                className="w-full h-11 px-4 rounded-xl border border-border bg-muted text-foreground focus:bg-background focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:font-normal placeholder:text-slate-400" 
              />
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="pt-2 flex justify-center">
          <Button
            size="lg"
            className="w-full md:w-auto md:min-w-[280px] h-14 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-[0_10px_20px_-10px_rgba(79,70,229,0.5)] transition-all hover:-translate-y-0.5"
            onClick={handleStart}
          >
            {t("testIntro.startTest")}
          </Button>
        </div>

      </div>
    </div>
  );
}
