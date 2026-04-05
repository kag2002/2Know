"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2, AlertTriangle, Clock, Target, CheckCircle2, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface QuestionAnalyticsModalProps {
  quizId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionAnalyticsModal({ quizId, open, onOpenChange }: QuestionAnalyticsModalProps) {
  const [quiz, setQuiz] = useState<any>(null);
  const [analytics, setAnalytics] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!quizId || !open) {
      setQuiz(null);
      setAnalytics(null);
      setError("");
      return;
    }

    let isMounted = true;
    setLoading(true);

    Promise.all([
      apiFetch(`/quizzes/${quizId}`).catch(() => null),
      apiFetch(`/quizzes/${quizId}/analytics/questions`).catch(() => null)
    ]).then(([quizData, analyticsData]) => {
      if (!isMounted) return;
      if (!quizData || !analyticsData) {
        setError("Không thể lấy dữ liệu thống kê. Vui lòng thử lại sau.");
      } else {
        setQuiz(quizData);
        setAnalytics(analyticsData);
      }
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, [quizId, open]);

  // Transform data
  const questionCards = useMemo(() => {
    if (!quiz || !analytics) return [];
    
    return (quiz.questions || []).map((q: any, i: number) => {
       const stats = analytics[q.id] || { total_attempts: 0, average_time_seconds: 0, options: {} };
       
       const optionsMeta = q.metadata?.options || q.options || [];
       const totalVotes = stats.total_attempts || 0;
       
       let correctVoted = 0;
       
       const mappedOptions = optionsMeta.map((opt: any, optIdx: number) => {
         const votes = stats.options[opt.id] || 0;
         if (opt.isCorrect) correctVoted += votes;
         
         return {
           id: opt.id,
           label: String.fromCharCode(65 + optIdx),
           text: opt.text || opt.content || opt.label || "",
           isCorrect: opt.isCorrect,
           votes,
           percent: totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
         };
       });

       const correctPercent = totalVotes > 0 ? Math.round((correctVoted / totalVotes) * 100) : 0;

       return {
         id: q.id,
         index: i + 1,
         content: q.content || q.question,
         totalVotes,
         averageTime: stats.average_time_seconds,
         correctPercent,
         options: mappedOptions
       };
    });
  }, [quiz, analytics]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0 bg-slate-50 dark:bg-slate-950">
        <DialogHeader className="px-6 py-4 border-b bg-white dark:bg-slate-900 shrink-0">
          <DialogTitle className="text-xl flex items-center gap-2">
             Độ Khó Bội Phân (Question Analytics)
          </DialogTitle>
          <DialogDescription>
            Phân tích chuyên sâu hành vi lựa chọn và thời gian suy nghĩ của học sinh cho bài kiểm tra này. Dữ liệu đã được lọc anti-cheat tự động.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-indigo-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="font-medium text-slate-600 dark:text-slate-400">Đang tổng hợp dữ liệu từ hệ thống...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 text-rose-500 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-100 dark:border-rose-900">
              <AlertTriangle className="w-10 h-10 mb-4" />
              <p className="font-semibold">{error}</p>
            </div>
          ) : questionCards.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground border-2 border-dashed rounded-xl border-slate-200 dark:border-slate-800">
              Chưa có dữ liệu học sinh làm bài hoặc bài thi không có câu hỏi trắc nghiệm.
            </div>
          ) : (
            questionCards.map((qc: any) => (
              <div key={qc.id} className="bg-white dark:bg-slate-900 border shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow">
                 <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 pr-4">
                      Câu {qc.index}: <span className="font-normal text-slate-600 dark:text-slate-400">{qc.content}</span>
                    </h3>
                    <div className="flex items-center gap-3 shrink-0 text-sm font-medium">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                         <Target className="w-4 h-4"/> {qc.totalVotes} lượt
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded ${qc.averageTime > 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'}`}>
                         <Clock className="w-4 h-4"/> {qc.averageTime}s / câu
                      </div>
                    </div>
                 </div>

                 {/* Option Bars */}
                 <div className="space-y-3">
                   {qc.options.map((opt: any) => {
                     const isCorrect = opt.isCorrect;
                     const hasVotes = opt.votes > 0;
                     const barColor = isCorrect 
                        ? "bg-emerald-500 dark:bg-emerald-600" 
                        : (hasVotes ? "bg-rose-400 dark:bg-rose-500" : "bg-slate-300 dark:bg-slate-700");
                        
                     const bgColor = isCorrect 
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20" 
                        : (hasVotes ? "bg-rose-50/50 dark:bg-rose-950/20" : "");

                     return (
                       <div key={opt.id} className={`p-2 rounded-lg ${bgColor} border ${isCorrect ? 'border-emerald-100 dark:border-emerald-900/50' : 'border-transparent'}`}>
                          <div className="flex items-center justify-between text-sm mb-1.5">
                             <div className="flex items-center gap-2 font-medium">
                                <span className="w-6 h-6 flex items-center justify-center rounded bg-white dark:bg-slate-800 border shadow-sm">
                                  {opt.label}
                                </span>
                                <span className={`line-clamp-1 ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                  {opt.text}
                                </span>
                                {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-1"/>}
                                {!isCorrect && hasVotes && <XCircle className="w-4 h-4 text-rose-400 ml-1"/>}
                             </div>
                             <div className="font-bold text-slate-700 dark:text-slate-300">
                               {opt.percent}% <span className="font-normal text-slate-400 text-xs font-mono ml-1">({opt.votes})</span>
                             </div>
                          </div>
                          
                          {/* Progress Line */}
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                             <div 
                               className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`} 
                               style={{ width: `${opt.percent}%` }}
                             />
                          </div>
                       </div>
                     );
                   })}
                 </div>

                 {/* Diagnosis Recommendation */}
                 <div className="mt-5 pt-4 border-t border-dashed">
                    {qc.totalVotes >= 5 && qc.correctPercent <= 30 && (
                      <p className="text-sm text-rose-600 dark:text-rose-400 font-medium flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4"/> Câu hỏi Cực Khó (Hardcore): Tỷ lệ đúng dưới 30%, cân nhắc rà soát lại phương pháp dạy học cho chủ điểm này.
                      </p>
                    )}
                    {qc.totalVotes >= 5 && qc.correctPercent >= 90 && (
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4"/> Điểm mù dễ đoán: Trên 90% đúng, câu hỏi này không có tính phân loại học sinh cao.
                      </p>
                    )}
                 </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
