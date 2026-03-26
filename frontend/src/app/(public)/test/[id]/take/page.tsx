"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Flag, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

// Mock data for test taking
const mockQuestions = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  content: `Câu hỏi số ${i + 1}: Tìm đạo hàm của hàm số $y = x^2 - 4x + 3$?`,
  options: [
    `y' = 2x - 4`,
    `y' = 2x + 4`,
    `y' = x - 4`,
    `y' = 2x - 3`
  ]
}));

const MAX_TAB_SWITCHES = 3;

export default function TakeTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<number[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // === PROCTORING STATE ===
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);

  // --- Tab Switch Detection ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount >= MAX_TAB_SWITCHES) {
            // Auto-submit on 3rd strike
            handleAutoSubmit(newCount);
          }
          return newCount;
        });
        setTimerPaused(true);
        setShowWarning(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // --- Copy/Paste Prevention ---
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("copy", prevent);
    document.addEventListener("paste", prevent);
    document.addEventListener("cut", prevent);
    const preventCtx = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", preventCtx);
    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("paste", prevent);
      document.removeEventListener("cut", prevent);
      document.removeEventListener("contextmenu", preventCtx);
    };
  }, []);

  // Timer
  useEffect(() => {
    if (timerPaused) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit(tabSwitchCount);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timerPaused]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = mockQuestions[currentIdx];

  const toggleFlag = (qid: number) => {
    setFlagged(prev => prev.includes(qid) ? prev.filter(x => x !== qid) : [...prev, qid]);
  };

  const handleSelect = (qId: number, oIdx: number) => {
    setAnswers(prev => ({ ...prev, [qId]: oIdx }));
  };

  const handleAutoSubmit = (switches: number) => {
    // Store proctoring data for the result page
    sessionStorage.setItem("tabSwitchCount", String(switches));
    router.push(`/test/${id}/result`);
  };

  const handleSubmit = () => {
    if (confirm("Bạn có chắc chắn muốn nộp bài không? Thời gian vẫn còn dư.")) {
      sessionStorage.setItem("tabSwitchCount", String(tabSwitchCount));
      router.push(`/test/${id}/result`);
    }
  };

  const dismissWarning = () => {
    setShowWarning(false);
    setTimerPaused(false);
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] relative">

      {/* ======= TAB SWITCH WARNING MODAL ======= */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Phát hiện chuyển tab!</h2>
            <p className="text-slate-500 mb-4">
              Hệ thống đã ghi nhận bạn rời khỏi trang thi. Hành vi này sẽ được báo cáo cho giáo viên.
            </p>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-rose-700 font-bold text-lg">
                <AlertTriangle className="w-5 h-5" />
                Lần vi phạm: {tabSwitchCount} / {MAX_TAB_SWITCHES}
              </div>
              {tabSwitchCount >= MAX_TAB_SWITCHES ? (
                <p className="text-sm text-rose-600 mt-2 font-medium">
                  Bạn đã hết số lần cảnh báo. Bài thi sẽ được nộp tự động.
                </p>
              ) : (
                <p className="text-sm text-rose-600 mt-2">
                  Đến lần thứ {MAX_TAB_SWITCHES}, bài thi của bạn sẽ bị nộp tự động.
                </p>
              )}
            </div>
            {tabSwitchCount < MAX_TAB_SWITCHES && (
              <Button
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base"
                onClick={dismissWarning}
              >
                Tôi đã hiểu, tiếp tục làm bài
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Question Area */}
      <div className="flex-1 bg-white flex flex-col relative overflow-hidden">
        
        {/* Question Header */}
        <div className="h-16 border-b flex items-center justify-between px-6 bg-slate-50/50">
          <div className="font-semibold text-lg text-slate-800">
            Câu {currentIdx + 1} <span className="text-slate-400 font-normal text-sm">/ {mockQuestions.length}</span>
          </div>
          <div className="flex items-center gap-3">
            {tabSwitchCount > 0 && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-rose-100 text-rose-600 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> {tabSwitchCount} vi phạm
              </span>
            )}
            <Button 
              variant="ghost" 
              className={`gap-2 ${flagged.includes(currentQ.id) ? 'text-amber-500 bg-amber-50' : 'text-slate-500'}`}
              onClick={() => toggleFlag(currentQ.id)}
            >
              <Flag className="w-4 h-4" /> 
              {flagged.includes(currentQ.id) ? 'Bỏ cắm cờ' : 'Cắm cờ xem lại'}
            </Button>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-xl md:text-2xl font-medium text-slate-900 leading-relaxed">
              {currentQ.content}
            </h2>
            
            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === idx;
                return (
                  <label 
                    key={idx} 
                    onClick={() => handleSelect(currentQ.id, idx)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-indigo-600' : 'border-slate-300'
                    }`}>
                      {isSelected && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                    </div>
                    <span className={`text-base font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question Footer Navigation */}
        <div className="h-20 border-t flex items-center justify-between px-6 bg-white shrink-0 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
          >
            <ChevronLeft className="w-5 h-5" /> Câu trước
          </Button>
          
          {currentIdx === mockQuestions.length - 1 ? (
            <Button 
              size="lg" 
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSubmit}
            >
              <CheckCircle2 className="w-5 h-5" /> Nộp bài
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setCurrentIdx(prev => prev + 1)}
            >
              Câu tiếp <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Right Sidebar - Status Map */}
      <div className="w-full md:w-80 bg-slate-50 border-l flex flex-col shrink-0">
        
        {/* Timer Box */}
        <div className="p-6 border-b bg-white flex flex-col items-center justify-center">
          <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Thời gian còn lại
          </div>
          <div className={`text-4xl font-black font-mono tracking-tight ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
            {formatTime(timeLeft)}
          </div>
          {timerPaused && (
            <span className="text-xs text-amber-600 font-semibold mt-2 animate-pulse">⏸ Đã tạm dừng</span>
          )}
        </div>

        {/* Info summary */}
        <div className="px-6 py-4 grid grid-cols-3 gap-4 text-center border-b text-sm bg-white">
          <div>
            <div className="font-bold text-lg text-emerald-600">{Object.keys(answers).length}</div>
            <div className="text-slate-500 text-xs">Đã làm</div>
          </div>
          <div>
            <div className="font-bold text-lg text-amber-500">{flagged.length}</div>
            <div className="text-slate-500 text-xs">Phân vân</div>
          </div>
          <div>
            <div className={`font-bold text-lg ${tabSwitchCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>{tabSwitchCount}</div>
            <div className="text-slate-500 text-xs">Vi phạm</div>
          </div>
        </div>

        {/* Question Palette */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Danh sách câu hỏi</h3>
          <div className="grid grid-cols-5 gap-2">
            {mockQuestions.map((q, i) => {
              const isDone = answers[q.id] !== undefined;
              const isFlagged = flagged.includes(q.id);
              const isActive = currentIdx === i;
              
              let btnClass = "border-slate-200 text-slate-500 hover:border-slate-300 bg-white";
              if (isActive) btnClass = "border-indigo-600 bg-indigo-600 text-white ring-2 ring-indigo-200 ring-offset-1";
              else if (isFlagged && isDone) btnClass = "border-amber-500 bg-amber-500 text-white";
              else if (isFlagged) btnClass = "border-amber-500 text-amber-600 bg-amber-50";
              else if (isDone) btnClass = "border-emerald-500 bg-emerald-500 text-white";

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(i)}
                  className={`h-10 rounded-md border font-medium text-sm transition-all focus:outline-none ${btnClass}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> Đã trả lời</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-500"></div> Đang phân vân (cắm cờ)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border bg-white"></div> Chưa trả lời</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-rose-500"></div> Vi phạm tab</div>
          </div>
        </div>

        <div className="p-4 bg-white border-t">
          <Button variant="destructive" className="w-full text-base font-bold shadow-sm" onClick={handleSubmit}>
            NỘP BÀI NGAY
          </Button>
        </div>

      </div>
    </div>
  );
}
