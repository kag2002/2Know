"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Wand2, 
  Upload, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2,
  Settings2,
  Copy,
  Save,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "@/context/LanguageContext";

export default function AIGeneratorPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [generationSteps, setGenerationSteps] = useState<string[]>([]);
  
  // Configuration state
  const [config, setConfig] = useState({
    count: 10,
    difficulty: "auto",
    format: "multiple_choice",
    language: "vi"
  });

  const generateQuiz = useCallback(async () => {
    if (!prompt.trim()) return toast.warning(t("quizGenerate.promptRequired"));
    
    setIsGenerating(true);
    setGeneratedQuestions([]);
    setGenerationSteps([]);

    const steps = [
      t("quizGenerate.step1") || "Đang phân tích cấu trúc ngữ nghĩa Prompt...",
      t("quizGenerate.step2") || "Thực hiện truy vấn LLM Agentic Pipeline...",
      t("quizGenerate.step3") || "Trích xuất và chuẩn hóa bộ JSON đầu ra...",
    ];

    setGenerationSteps(prev => [...prev, steps[0]]);
    
    try {
        setGenerationSteps(prev => [...prev, steps[1]]);
        const res = await apiFetch("/ai/generate-quiz", {
            method: "POST",
            body: JSON.stringify({ prompt, config })
        });
        
        setGenerationSteps(prev => [...prev, steps[2]]);
        
        if (res && res.questions) {
            const formatted = res.questions.map((q: any, idx: number) => ({
                id: idx + 1,
                ...q
            }));
            setGeneratedQuestions(formatted);
        } else {
            toast.error(t("quizGenerate.alertInvalidFormat"));
        }
    } catch (err: any) {
        toast.error(t("quizGenerate.alertNetworkError") + (err.message || "Unknown error"));
    } finally {
        setIsGenerating(false);
    }
  }, [prompt, config, t]);

  // Alt+G keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        if (!isGenerating) generateQuiz();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isGenerating, generateQuiz]);

  const handleSaveToBank = async () => {
    if (generatedQuestions.length === 0) return;
    try {
      const payload = generatedQuestions.map(q => ({
        type: "multiple_choice",
        content: q.question,
        options: q.options.map((opt: string, index: number) => ({
          label: String.fromCharCode(65 + index),
          content: opt,
          is_correct: index === q.correctIndex
        })),
        explanation: q.explanation,
        difficulty: config.difficulty === "auto" ? "medium" : config.difficulty,
        folder: "AI Generated",
        points: 10
      }));

      await apiFetch("/questions/batch", {
        method: "POST",
        body: JSON.stringify({ questions: payload })
      });

      toast.success(t("quizGenerate.alertAddSuccess", { count: generatedQuestions.length }));
      router.push("/question-bank");
    } catch (err: any) {
      toast.error(t("quizGenerate.alertSaveError") + (err.message || ""));
    }
  };

  const removeQuestion = (idx: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== idx));
    toast.success(t("quizGenerate.alertDeleteSuccess") || "Đã xóa câu hỏi khỏi danh sách.");
  };

  const copyQuestion = (q: any) => {
    const text = `${q.question}\n${q.options.map((o: string, i: number) => `${String.fromCharCode(65 + i)}. ${o}`).join("\n")}\nĐáp án: ${String.fromCharCode(65 + q.correctIndex)}`;
    navigator.clipboard.writeText(text);
    toast.success(t("quizGenerate.alertCopySuccess") || "Đã sao chép câu hỏi.");
  };

  const difficultyOptions = [
    { value: "auto", label: t("quizGenerate.diffAuto") || "Tự động" },
    { value: "easy", label: t("quizGenerate.diffEasy") || "Dễ" },
    { value: "medium", label: t("quizGenerate.diffMedium") || "Trung bình" },
    { value: "hard", label: t("quizGenerate.diffHard") || "Khó" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/question-bank">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
             {t("quizGenerate.title") || "Khởi tạo bằng AI"} <Sparkles className="w-5 h-5 text-blue-500 fill-blue-500" />
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("quizGenerate.subtitle") || "Cung cấp 1 văn bản, chủ đề hoặc file PDF để 2Know AI tự động trích xuất thành bài trắc nghiệm."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Prompt Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-background p-6 rounded-xl border shadow-sm border-blue-100/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-50/0 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <h3 className="font-semibold text-card-foreground text-base mb-4 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-blue-600" /> {t("quizGenerate.promptLabel") || "Nhập yêu cầu sinh đề"}
            </h3>
            
            <textarea 
              className="w-full min-h-[160px] p-4 text-sm bg-muted border border-border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow outline-none resize-y"
              placeholder={t("quizGenerate.promptPlaceholder") || "VD: Tạo 10 câu trắc nghiệm (4 đáp án) về Ngôn ngữ lập trình Go, tập trung vào Goroutines, Channels và Memory Management..."}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Button onClick={() => toast.info(t("quizGenerate.featureWip") || "Tính năng đang phát triển.")} variant="outline" className="flex-1 bg-background border-dashed border-border text-muted-foreground hover:text-blue-600 hover:border-blue-300 gap-2 h-11" disabled={isGenerating}>
                 <Upload className="w-4 h-4" /> {t("quizGenerate.uploadPDF") || "Tải lên PDF (Max 5MB)"}
              </Button>
              <Button onClick={generateQuiz} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-md shadow-blue-500/20 h-11" disabled={isGenerating}>
                 {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin"/> {t("quizGenerate.analyzing") || "Đang phân tích"}</> : <><Sparkles className="w-4 h-4" /> {t("quizGenerate.generate") || "Sinh Câu Hỏi"} <kbd className="ml-1 hidden sm:inline text-[10px] opacity-70 bg-blue-700/50 px-1 rounded">Alt+G</kbd></>}
              </Button>
            </div>

            {/* Advanced Config — Interactive */}
            <div className="mt-6">
               <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{t("quizGenerate.advancedConfig") || "Tùy chỉnh Nâng cao"}</p>
               <div className="grid grid-cols-2 gap-2">
                 {/* Count */}
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t("quizGenerate.countLabel") || "Số lượng"}</label>
                   <select 
                     value={config.count} 
                     onChange={e => setConfig({...config, count: parseInt(e.target.value)})}
                     className="w-full h-9 px-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                   >
                     {[5, 10, 15, 20, 30].map(n => <option key={n} value={n}>{n} câu</option>)}
                   </select>
                 </div>
                 {/* Difficulty */}
                 <div className="space-y-1">
                   <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t("quizGenerate.diffLabel") || "Độ khó"}</label>
                   <select
                     value={config.difficulty}
                     onChange={e => setConfig({...config, difficulty: e.target.value})}
                     className="w-full h-9 px-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                   >
                     {difficultyOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                   </select>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Output Area */}
        <div className="lg:col-span-7">
          <div className="bg-muted border rounded-xl h-[600px] flex flex-col relative overflow-hidden">
            
            {/* Header */}
            <div className="p-4 bg-background border-b flex items-center justify-between shrink-0">
               <h3 className="font-semibold text-card-foreground text-sm flex items-center gap-2">
                 {t("quizGenerate.resultTitle") || "Kết quả"} 
                 <span className="bg-slate-100 dark:bg-slate-800 text-muted-foreground px-2 py-0.5 rounded text-xs">
                   {generatedQuestions.length > 0 ? `${generatedQuestions.length} câu` : "Preview"}
                 </span>
               </h3>
               {generatedQuestions.length > 0 && (
                 <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="h-8 gap-1.5 text-muted-foreground">
                     <Settings2 className="w-3.5 h-3.5" /> {t("quizGenerate.refine") || "Tinh chỉnh"}
                   </Button>
                   <Button size="sm" className="h-8 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm" onClick={handleSaveToBank}>
                     <Save className="w-3.5 h-3.5" /> {t("quizGenerate.saveToBank") || "Lưu vào Ngân hàng"}
                   </Button>
                 </div>
               )}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-muted/50">
               {!isGenerating && generatedQuestions.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                    <div className="w-16 h-16 bg-background border rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                      <Sparkles className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="font-medium text-foreground">{t("quizGenerate.waitingTitle") || "AI đang chờ lệnh"}</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
                      {t("quizGenerate.waitingDesc") || "Nhập prompt bên trái để hệ thống tự động sinh ra những câu hỏi chất lượng cao."}
                    </p>
                 </div>
               )}

               {isGenerating && (
                 <div className="h-full flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full border-4 border-border border-t-blue-600 animate-spin mb-6"></div>
                    <div className="space-y-3 w-full">
                      {generationSteps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                           <span className={idx === generationSteps.length - 1 ? "text-foreground font-medium" : "text-muted-foreground"}>{step}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-3 text-sm opacity-50 animate-pulse">
                           <Loader2 className="w-4 h-4 text-slate-400 shrink-0 animate-spin" />
                           <span className="text-muted-foreground">{t("quizGenerate.processing") || "Đang xử lý..."}</span>
                      </div>
                    </div>
                 </div>
               )}

               {!isGenerating && generatedQuestions.length > 0 && (
                 <div className="space-y-6 animate-in fade-in duration-500">
                   {generatedQuestions.map((q, qIndex) => (
                     <div key={q.id} className="bg-background p-5 border shadow-sm rounded-lg group relative hover:shadow-md transition-shadow">
                       {/* Hover action buttons */}
                       <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded bg-slate-100 hover:bg-accent" onClick={() => copyQuestion(q)}>
                            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-600" onClick={() => removeQuestion(qIndex)}>
                            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                       </div>
                       
                       <p className="font-medium text-foreground pr-16 leading-relaxed">
                         <span className="text-blue-600 mr-2">{t("quizGenerate.questionPrefix") || "Câu"} {qIndex + 1}.</span> 
                         {q.question}
                       </p>
                       
                       <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {q.options?.map((opt: string, optIndex: number) => (
                           <div 
                             key={optIndex} 
                             className={`p-3 rounded-md text-sm border flex gap-3 ${
                               q.correctIndex === optIndex 
                                 ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-300 font-medium' 
                                 : 'bg-muted text-muted-foreground border-border'
                             }`}
                           >
                             <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] shrink-0 ${
                               q.correctIndex === optIndex ? 'bg-emerald-500 text-white' : 'bg-background border text-muted-foreground'
                             }`}>
                               {String.fromCharCode(65 + optIndex)}
                             </span>
                             {opt}
                           </div>
                         ))}
                       </div>

                       {q.explanation && (
                         <div className="mt-4 pt-4 border-t border-dashed">
                           <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">{t("quizGenerate.explanation") || "Giải thích (AI Tạo)"}</p>
                           <p className="text-sm text-muted-foreground leading-relaxed bg-muted p-3 rounded-md italic">
                             {q.explanation}
                           </p>
                         </div>
                       )}
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
