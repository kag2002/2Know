"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Flag, ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, ShieldAlert, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/context/LanguageContext";
import { toast } from "sonner";

const MAX_TAB_SWITCHES = 3;

interface Option {
  id: string;
  label: string;
  content: string;
}

interface Question {
  id: string;
  content: string;
  options: Option[];
}

interface QuizData {
  id: string;
  title: string;
  time_limit_minutes: number;
  questions: Question[];
}

export default function TakeTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useTranslation();
  
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // QuestionID -> OptionID
  const [flagged, setFlagged] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // === PROCTORING STATE ===
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);

  // Initialize Quiz Data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await apiFetch(`/test/quiz/${id}`, { requireAuth: false });
        setQuiz(data);
        setTimeLeft((data.time_limit_minutes || 45) * 60);
      } catch (err: any) {
        setError(err.message || "Failed to load test. It may be closed or unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  // --- Tab Switch Detection ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !loading && quiz) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount >= MAX_TAB_SWITCHES) {
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
  }, [loading, quiz]);

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
    if (timerPaused || loading || !quiz) return;
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
  }, [timerPaused, loading, quiz]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFlag = (qid: string) => {
    setFlagged(prev => prev.includes(qid) ? prev.filter(x => x !== qid) : [...prev, qid]);
  };

  const handleSelect = (qId: string, oId: string) => {
    setAnswers(prev => ({ ...prev, [qId]: oId }));
  };

  const handleAutoSubmit = async (switches: number) => {
    sessionStorage.setItem("tabSwitchCount", String(switches));
    const success = await submitPayload(switches);
    if (success) router.push(`/test/${id}/result`);
  };

  const handleSubmit = async () => {
    if (confirm(t("testRoom.confirmSubmit") || "Bạn có chắc chắn muốn nộp bài không? Thời gian vẫn còn dư.")) {
      sessionStorage.setItem("tabSwitchCount", String(tabSwitchCount));
      const success = await submitPayload(tabSwitchCount);
      if (success) router.push(`/test/${id}/result`);
    }
  };

  const submitPayload = async (switches: number): Promise<boolean> => {
    try {
      const timeTaken = ((quiz?.time_limit_minutes || 0) * 60) - timeLeft;
      const studentName = "Guest Student";
      const studentId = "GUEST-" + Math.floor(Math.random() * 10000);

      const resultObj = await apiFetch("/test/submit", {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify({
          quiz_id: id,
          student_name: studentName,
          student_identifier: studentId,
          time_taken_seconds: timeTaken,
          answers: answers, // Map of QuestionID -> AnswerString/OptionID
          tab_switch_count: switches
        })
      });

      // SECURITY TIE-IN: Backend no longer returns total_correct/time_taken for anti-cheat minimization.
      // We must self-assemble the state we already know to display on the Result Page.
      const finalResult = {
        ...resultObj,
        student_name: studentName,
        student_identifier: studentId,
        time_taken_seconds: timeTaken,
        tab_switch_count: switches,
        total_correct: resultObj.total_correct ?? "-", 
        total_incorrect: resultObj.total_incorrect ?? "-"
      };
      
      sessionStorage.setItem("2know_latest_result", JSON.stringify(finalResult));
      return true;
    } catch(err: any) {
      console.error("Failed to submit", err);
      toast.error(err.message || t("testRoom.submitError") || "Không thể nộp bài. Vui lòng thử lại.");
      return false;
    }
  };

  const dismissWarning = () => {
    setShowWarning(false);
    setTimerPaused(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-muted-foreground font-medium">{t("testRoom.loading")}</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500" />
        <h1 className="text-2xl font-bold">{t("testRoom.quizLoadError")}</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.push("/")}>{t("testRoom.backToHome")}</Button>
      </div>
    );
  }

  const questions = quiz.questions || [];
  if (questions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">{t("testRoom.emptyTest")}</p>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] relative">

      {/* ======= TAB SWITCH WARNING MODAL ======= */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-background rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">{t("testRoom.proctorWarningTitle")}</h2>
            <p className="text-muted-foreground mb-4">
              {t("testRoom.proctorWarningDesc")}
            </p>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-rose-700 font-bold text-lg">
                <AlertTriangle className="w-5 h-5" />
                {t("testRoom.proctorViolationCount", { current: tabSwitchCount, max: MAX_TAB_SWITCHES })}
              </div>
              {tabSwitchCount > MAX_TAB_SWITCHES ? (
                <p className="text-sm text-rose-600 mt-2 font-medium">
                  {t("testRoom.proctorNoMoreWarnings")}
                </p>
              ) : (
                <p className="text-sm text-rose-600 mt-2">
                  {t("testRoom.proctorWarningLimit", { max: MAX_TAB_SWITCHES })}
                </p>
              )}
            </div>
            {tabSwitchCount < MAX_TAB_SWITCHES && (
              <Button
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base"
                onClick={dismissWarning}
              >
                {t("testRoom.proctorUnderstood")}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Main Question Area */}
      <div className="flex-1 bg-background flex flex-col relative overflow-hidden">
        
        {/* Question Header */}
        <div className="h-16 border-b flex items-center justify-between px-6 bg-muted/50">
          <div className="font-semibold text-lg text-card-foreground">
            {t("testRoom.question")} {currentIdx + 1} <span className="text-slate-400 font-normal text-sm">/ {questions.length}</span>
          </div>
          <div className="flex items-center gap-3">
            {tabSwitchCount > 0 && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> {tabSwitchCount} vi phạm
              </span>
            )}
            <Button 
              variant="ghost" 
              className={`gap-2 ${flagged.includes(currentQ.id) ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' : 'text-muted-foreground'}`}
              onClick={() => toggleFlag(currentQ.id)}
            >
              <Flag className="w-4 h-4" /> 
              {t("testRoom.flagLabel")}
            </Button>
          </div>
        </div>

        {/* Progress Bar overlay */}
        <div className="h-1 w-full bg-slate-100 dark:bg-slate-800">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out" 
            style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-y-auto p-6 md:p-12"
          >
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-xl md:text-2xl font-medium text-foreground leading-relaxed">
                {currentQ.content}
              </h2>
              
              <div className="space-y-4">
                {(currentQ.options || []).map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <label 
                      key={opt.id} 
                      onClick={() => handleSelect(currentQ.id, opt.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-sm' : 'border-border bg-background hover:border-indigo-200'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-indigo-600' : 'border-border'
                      }`}>
                        {isSelected && <div className="w-3 h-3 bg-indigo-600 rounded-full" />}
                      </div>
                      <span className={`text-base font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-300' : 'text-foreground'}`}>
                        {opt.label && <span className="font-bold mr-2">{opt.label}.</span>}
                        {opt.content}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Question Footer Navigation */}
        <div className="h-20 border-t flex items-center justify-between px-6 bg-background shrink-0 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-2"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
          >
            <ChevronLeft className="w-5 h-5" /> {t("testRoom.prevButton")}
          </Button>
          
          {currentIdx === questions.length - 1 ? (
            <Button 
              size="lg" 
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={handleSubmit}
            >
              <CheckCircle2 className="w-5 h-5" /> {t("testRoom.submitButton")}
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setCurrentIdx(prev => prev + 1)}
            >
              {t("testRoom.nextButton")} <ChevronRight className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Right Sidebar - Status Map */}
      <div className="w-full md:w-80 bg-muted border-l flex flex-col shrink-0">
        
        {/* Timer Box */}
        <div className="p-6 border-b bg-background flex flex-col items-center justify-center">
          <div className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" /> {t("testRoom.timeRemaining")}
          </div>
          <div className={`text-4xl font-black font-mono tracking-tight ${timeLeft < 300 ? 'text-rose-600 animate-pulse' : 'text-card-foreground'}`}>
            {formatTime(timeLeft)}
          </div>
          {timerPaused && (
            <span className="text-xs text-amber-600 font-semibold mt-2 animate-pulse">⏸ Đã tạm dừng</span>
          )}
        </div>

        {/* Info summary */}
        <div className="px-6 py-4 grid grid-cols-3 gap-4 text-center border-b text-sm bg-background">
          <div>
            <div className="font-bold text-lg text-emerald-600">{Object.keys(answers).length}</div>
            <div className="text-muted-foreground text-xs">{t("testRoom.metricsDone")}</div>
          </div>
          <div>
            <div className="font-bold text-lg text-amber-500">{flagged.length}</div>
            <div className="text-muted-foreground text-xs">{t("testRoom.metricsFlagged")}</div>
          </div>
          <div>
            <div className={`font-bold text-lg ${tabSwitchCount > 0 ? 'text-rose-500' : 'text-slate-400'}`}>{tabSwitchCount}</div>
            <div className="text-muted-foreground text-xs">{t("testRoom.metricsViolation")}</div>
          </div>
        </div>

        {/* Question Palette */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="font-semibold text-card-foreground mb-4">{t("testRoom.questionListTitle")}</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => {
              const isDone = answers[q.id] !== undefined;
              const isFlagged = flagged.includes(q.id);
              const isActive = currentIdx === i;
              
              let btnClass = "border-border text-muted-foreground hover:border-border bg-background";
              if (isActive) btnClass = "border-indigo-600 bg-indigo-600 text-white ring-2 ring-indigo-200 ring-offset-1";
              else if (isFlagged && isDone) btnClass = "border-amber-500 bg-amber-500 text-white";
              else if (isFlagged) btnClass = "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400";
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
          
          <div className="mt-8 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> {t("testRoom.statusAnswered")}</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-amber-500"></div> {t("testRoom.statusFlagged")}</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm border bg-background"></div> {t("testRoom.statusUnanswered")}</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-rose-500"></div> {t("testRoom.statusViolation")}</div>
          </div>
        </div>

        <div className="p-4 bg-background border-t">
          <Button variant="destructive" className="w-full text-base font-bold shadow-sm" onClick={handleSubmit} disabled={Object.keys(answers).length === 0}>
            {t("testRoom.submitNow")}
          </Button>
        </div>

      </div>
    </div>
  );
}
