"use client";

import { Button } from "@/components/ui/button";
import { Clock, HelpCircle, AlertTriangle, ShieldCheck, User, Loader2 } from "lucide-react";
import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

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
  questions: Question[];
}

export default function TestIntroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [quiz, setQuiz] = useState<TestQuizData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [studentInfo, setStudentInfo] = useState({ name: "", sbd: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const loadQuizInfo = async () => {
      try {
        const data = await apiFetch(`/test/quiz/${id}`, { requireAuth: false });
        if (!data.questions) data.questions = [];
        setQuiz(data);
      } catch (err: any) {
        setError("Không thể tải thông tin bài kiểm tra: " + (err.message || "Lỗi mạng"));
      } finally {
        setLoading(false);
      }
    };
    loadQuizInfo();
  }, [id]);

  const handleStart = () => {
    if (!studentInfo.name.trim() || !studentInfo.sbd.trim()) {
      setError("Vui lòng nhập đầy đủ Họ Tên và Mã Học Sinh trước khi bắt đầu.");
      return;
    }
    // Store student info for guest mode
    sessionStorage.setItem("student_name", studentInfo.name.trim());
    sessionStorage.setItem("student_sbd", studentInfo.sbd.trim());
    router.push(`/test/${id}/take`);
  };

  if (loading) {
    return (
      <div className="flex justify-center flex-col items-center h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p>Đang chuẩn bị đề thi...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-20 text-slate-500">
        {error ? error : "Bài kiểm tra không tồn tại hoặc đã bị khóa."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Test Info Header */}
        <div className="text-center space-y-3 pb-8 border-b">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-indigo-50/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-indigo-100">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2 animate-pulse"></div>
            Đang mở
          </div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">{quiz.title}</h1>
          <p className="text-slate-500 text-sm">
            {quiz.subject || "Chưa phân loại"} • {quiz.grade_level || "Tự do"}
          </p>
          {quiz.description && (
             <p className="mx-auto max-w-lg mt-4 text-sm text-slate-600 italic bg-slate-50 p-4 rounded-xl border border-dashed">
                &quot;{quiz.description}&quot;
             </p>
          )}
        </div>

        {/* Test Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col items-center text-center gap-2 p-5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shadow-sm mb-1">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Thời gian</p>
              <p className="font-bold text-slate-900 text-lg">{quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes} Phút` : "Không giới hạn"}</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-2 p-5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl shadow-sm mb-1">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Số lượng</p>
              <p className="font-bold text-slate-900 text-lg">{quiz.questions.length || 0} Câu hỏi</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center gap-2 p-5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl shadow-sm mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Bảo mật</p>
              <p className="font-bold text-slate-900 text-lg">{(quiz.require_fullscreen || quiz.disable_copy_paste) ? "Chống gian lận" : "Tiêu chuẩn"}</p>
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
              <h4 className="font-bold text-amber-800 text-sm">Quy định chống gian lận được kích hoạt</h4>
              <ul className="text-[13px] text-amber-700 space-y-1 list-disc list-inside mt-2">
                {quiz.require_fullscreen && <li>Bắt buộc làm bài toàn màn hình. <strong>Cấm chuyển tab (Max 3 lần)</strong>.</li>}
                {quiz.disable_copy_paste && <li>Chức năng bôi đen, nhấp chuột phải và Copy/Paste bị khóa.</li>}
                <li>Vi phạm sẽ tự động thu bài và đánh dấu gian lận.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Entry Form */}
        <div className="bg-white border shadow-sm p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-indigo-500" /> Thông tin Thí sinh
          </h3>
          
          {error && (
            <div className="mb-4 p-3 text-sm text-rose-600 border border-rose-200 bg-rose-50 rounded-lg animate-in fade-in">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Họ và Tên <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                placeholder="Ví dụ: Nguyễn Văn A"
                value={studentInfo.name}
                onChange={e => { setStudentInfo({...studentInfo, name: e.target.value}); setError(""); }}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:font-normal placeholder:text-slate-400" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Mã định danh (SBD) <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                placeholder="Nhập MSSV / Mã học sinh"
                value={studentInfo.sbd}
                onChange={e => { setStudentInfo({...studentInfo, sbd: e.target.value}); setError(""); }}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:font-normal placeholder:text-slate-400" 
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
            Bắt Đầu Làm Bài Ngay
          </Button>
        </div>

      </div>
    </div>
  );
}
