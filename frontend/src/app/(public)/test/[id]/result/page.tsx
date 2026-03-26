"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Target, Home, RefreshCcw, XCircle, Award, ShieldAlert, PartyPopper } from "lucide-react";
import Link from "next/link";

interface TestResultData {
  score: number;
  total_correct: number;
  total_incorrect: number;
  time_taken_seconds: number;
  student_name: string;
  student_identifier: string;
  tab_switch_count: number;
  status: string;
}

export default function TestResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [result, setResult] = useState<TestResultData | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Read the securely calculated result from the previous submission step
    const rawResult = sessionStorage.getItem("quizlm_latest_result");
    if (rawResult) {
      setResult(JSON.parse(rawResult));
    }

    // Hide confetti after 3s
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!result) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Không tìm thấy kết quả</h1>
        <p className="text-slate-500">Có lỗi xảy ra hoặc bạn chưa nộp bài thi này.</p>
        <Link href="/">
          <Button>Quay về trang chủ</Button>
        </Link>
      </div>
    );
  }

  const { score, total_correct, total_incorrect, time_taken_seconds, student_name, student_identifier, tab_switch_count, status } = result;
  // Convert Score (10.0 scale) to percentage for SVG circle
  const scorePercent = (score / 10) * 100;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">

      {/* Confetti Animation */}
      {showConfetti && score >= 5 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
                fontSize: `${12 + Math.random() * 16}px`,
              }}
            >
              {['🎉', '🎊', '⭐', '✨', '🏆', '💯'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        
        {/* Result Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-10 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-medium text-indigo-100 mb-2">Chúc mừng bạn đã hoàn thành!</h2>
            <h1 className="text-3xl font-bold mb-4">Kết Quả Thi</h1>
            <p className="text-indigo-100">Họ tên: {student_name} • Mã TS: {student_identifier}</p>

            {/* Proctoring Status Badge */}
            {tab_switch_count > 0 && (
              <div className="mt-4 inline-flex flex-col items-center gap-2">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/80 text-white text-sm font-semibold backdrop-blur-sm">
                  <ShieldAlert className="w-4 h-4" />
                  Phát hiện {tab_switch_count} lần chuyển tab
                 </div>
                 {status === 'cheating_flagged' && (
                    <span className="text-xs bg-black/30 px-3 py-1 rounded text-white font-mono uppercase tracking-wider">Hệ thống đã đánh dấu gian lận</span>
                 )}
              </div>
            )}
          </div>
        </div>

        {/* Big Score Circle */}
        <div className="flex justify-center -mt-10 mb-8 relative z-10">
          <div className="w-32 h-32 bg-white rounded-full p-2 shadow-xl border-4 border-emerald-100 flex items-center justify-center relative">
            <svg viewBox="0 0 36 36" className="w-full h-full absolute rotate-[-90deg]">
              <path
                className="text-slate-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={score >= 8 ? "text-emerald-500" : score >= 5 ? "text-amber-500" : "text-rose-500"}
                strokeDasharray={`${scorePercent}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800">{score.toFixed(1)}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Điểm</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`grid ${tab_switch_count > 0 ? 'grid-cols-4' : 'grid-cols-3'} gap-y-8 gap-x-4 p-8 pt-0 border-b`}>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{total_correct}</p>
              <p className="text-sm text-slate-500">Câu đúng</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{total_incorrect}</p>
              <p className="text-sm text-slate-500">Câu sai / trống</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{formatTime(time_taken_seconds)}</p>
              <p className="text-sm text-slate-500">Thời gian làm</p>
            </div>
          </div>
          {tab_switch_count > 0 && (
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{tab_switch_count}</p>
                <p className="text-sm text-slate-500">Vi phạm tab</p>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Breakdown Area */}
        <div className="p-8 bg-slate-50 space-y-6">
          <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-amber-500" /> Đánh giá chung
          </h3>
          <p className="text-slate-600 leading-relaxed text-sm">
            {score >= 8 
              ? "Kết quả xuất sắc! Kiến thức của bạn được củng cố rất vững. Hãy tiếp tục tiến độ này."
              : score >= 5
                ? "Kết quả đạt yêu cầu cơ bản. Hãy cố gắng xem lại các câu sai để tránh mắc lỗi lần sau nhé."
                : "Kết quả cần cải thiện đáng kể. Đừng nản chí, hãy lập kế hoạch ôn tập lại và thử sức phục thù!"
            }
          </p>
          
          {status === "cheating_flagged" && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm font-medium flex items-start gap-3">
               <ShieldAlert className="w-5 h-5 shrink-0" />
               Hệ thống đã khóa tính năng xem lại đề do phát hiện gian lận nghiêm trọng (&gt;3 lần rời khỏi màn hình). Giáo viên sẽ trực tiếp liên hệ bạn.
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-4">
            <Button variant="outline" className="gap-2 bg-white flex-1" disabled={status === "cheating_flagged"}>
              <Target className="w-4 h-4" /> Xem chi tiết bài làm
              {status === "cheating_flagged" ? (
                 <span className="text-[10px] ml-1 bg-rose-100 text-rose-600 px-2 py-0.5 rounded border border-rose-200">Bị khóa</span>
              ) : (
                 <span className="text-[10px] ml-1 bg-slate-100 px-2 py-0.5 rounded text-slate-500 border">Sắp ra mắt</span>
              )}
            </Button>
            <Link href={`/test/${id}/take`} className="flex-1">
              <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold text-white shadow-md shadow-indigo-600/20">
                <RefreshCcw className="w-4 h-4 hidden sm:block" /> Làm lại
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-slate-500 hover:text-slate-900">
            <Home className="w-4 h-4" /> Quay về Trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
