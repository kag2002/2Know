"use client";

import { use, useEffect, useState } from "react";
import { OMRSheet } from "@/components/dashboard/OMRSheetPrinter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/context/LanguageContext";

// Dynamically import PDFViewer to avoid SSR window errors
import dynamic from "next/dynamic";
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-indigo-400"><Loader2 className="animate-spin w-8 h-8 mr-3"/> Đang tải bộ máy Render PDF...</div> }
);

export default function OMRPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslation();
  
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/quizzes/${id}`)
      .then(data => {
        setQuiz(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
     return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500"/></div>;
  }

  if (!quiz) {
     return <div className="p-8 text-center">Không tìm thấy bài kiểm tra.</div>;
  }

  // Derive questions count accurately whether it's M2M or embedded
  const questionsCount = quiz.questions?.length || quiz.questions_count || 40;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-100 dark:bg-slate-900 relative overflow-hidden -m-6 sm:-m-8">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-950 border-b shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.push(`/quizzes/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
          <div>
            <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100">In Phiếu Trắc Nghiệm OMR</h1>
            <p className="text-xs text-muted-foreground">{quiz.title} - {questionsCount} Câu hỏi</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 font-medium">
             <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
             Vui lòng in khổ giấy A4 chuẩn và không chọn "Fit to Page".
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
             <Printer className="w-4 h-4 mr-2" /> Hướng dẫn in chuẩn
          </Button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 w-full bg-slate-200/50 dark:bg-slate-900 p-2 sm:p-6 overflow-hidden">
        <div className="w-full h-full max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-300 dark:border-slate-800 bg-white ring-4 ring-black/5">
           <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }}>
              <OMRSheet quizTitle={quiz.title} numberOfQuestions={questionsCount} questions={quiz.questions} />
           </PDFViewer>
        </div>
      </div>
    </div>
  );
}
