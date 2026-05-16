"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

interface AIGeneratorProps {
  isEmbedded?: boolean;
  onSaved?: () => void;
}

export function AIGenerator({ isEmbedded = false, onSaved }: AIGeneratorProps = {}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [generationSteps, setGenerationSteps] = useState<string[]>([]);
  const [rawStreamText, setRawStreamText] = useState("");
  
  // Refine state
  const [isRefining, setIsRefining] = useState(false);
  const [isRefineModalOpen, setIsRefineModalOpen] = useState(false);
  const [refinePromptText, setRefinePromptText] = useState("");
  
  // Configuration state
  const [config, setConfig] = useState({
    count: 10,
    difficulty: "auto",
    format: "multiple_choice",
    language: "vi"
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-scroll refs
  const streamContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScroll = useRef(true);

  // Auto scroll effect
  useEffect(() => {
    if (isAutoScroll.current && streamContainerRef.current) {
      streamContainerRef.current.scrollTop = streamContainerRef.current.scrollHeight;
    }
  }, [rawStreamText]);

  const handleStreamScroll = () => {
    if (!streamContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = streamContainerRef.current;
    // If user scrolled up (not at bottom), disable auto-scroll
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
    isAutoScroll.current = isAtBottom;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error(t("quizGenerate.alertFileTooLarge") || "File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.");
    }

    if (file.type !== "application/pdf") {
      return toast.error(t("quizGenerate.alertFileFormat") || "Chỉ hỗ trợ file định dạng PDF.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading(t("quizGenerate.uploading") || "Đang trích xuất văn bản từ PDF...");
    setIsGenerating(true);

    try {
      const token = localStorage.getItem("2know_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/ai/upload-pdf`, {
        method: "POST",
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Upload error ${res.status}`);
      }

      const data = await res.json();
      if (data.text) {
        setPrompt(data.text);
        toast.success(t("quizGenerate.uploadSuccess") || "Đã trích xuất văn bản thành công!", { id: toastId });
      } else {
        throw new Error("No text returned");
      }
    } catch (err: any) {
      toast.error(t("quizGenerate.uploadError") || "Không thể trích xuất văn bản. " + err.message, { id: toastId });
    } finally {
      setIsGenerating(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
    setRawStreamText("");
    isAutoScroll.current = true;
    
    try {
        setGenerationSteps(prev => [...prev, steps[1]]);
        
        const token = localStorage.getItem("2know_token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"}/ai/generate-quiz-stream`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ prompt, config })
        });

        if (!res.ok) throw new Error("Network response was not ok");
        
        setGenerationSteps(prev => [...prev, steps[2]]);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let accumulatedJSON = "";

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') break;
                        if (!dataStr) continue;
                        
                        try {
                            const parsed = JSON.parse(dataStr);
                            if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                const content = parsed.choices[0].delta.content;
                                accumulatedJSON += content;
                                setRawStreamText(prev => prev + content);
                            }
                        } catch (e) {
                            // ignore chunk parse errors
                        }
                    }
                }
            }
        }
        
        // Clean markdown backticks
        let cleanJSON = accumulatedJSON.trim();
        cleanJSON = cleanJSON.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
        
        // Auto-fix common JSON errors made by the AI
        cleanJSON = cleanJSON.replace(/"(question|options|correctIndex|explanation):\s*"/g, '"$1": "');
        cleanJSON = cleanJSON.replace(/"(question|options|correctIndex|explanation):\s*\[/g, '"$1": [');
        cleanJSON = cleanJSON.replace(/"(question|options|correctIndex|explanation):\s*\d/g, match => match.replace(':', '":'));

        try {
            const parsedQuestions = JSON.parse(cleanJSON);
            const formatted = parsedQuestions.map((q: any, idx: number) => ({
                id: idx + 1,
                ...q
            }));
            setGeneratedQuestions(formatted);
            setRawStreamText(""); // Clear on success
        } catch (e) {
            toast.error("AI sinh ra dữ liệu không hợp lệ. Vui lòng xem log hiển thị.");
            console.error("JSON parse error:", cleanJSON);
        }
    } catch (err: any) {
        toast.error(t("quizGenerate.alertNetworkError") + (err.message || "Unknown error"));
    } finally {
        setIsGenerating(false);
    }
  }, [prompt, config, t]);

  const refineQuiz = useCallback(async () => {
    if (!refinePromptText.trim()) return toast.warning("Vui lòng nhập yêu cầu tinh chỉnh.");
    
    setIsRefining(true);
    const toastId = toast.loading("AI đang tinh chỉnh câu hỏi...");

    try {
        const res = await apiFetch("/ai/refine-quiz", {
            method: "POST",
            body: JSON.stringify({ 
                original_questions: generatedQuestions.map(q => ({
                    question: q.question,
                    options: q.options,
                    correctIndex: q.correctIndex,
                    explanation: q.explanation
                })), 
                refine_prompt: refinePromptText 
            })
        });
        
        if (res && res.questions) {
            const formatted = res.questions.map((q: any, idx: number) => ({
                id: idx + 1,
                ...q
            }));
            setGeneratedQuestions(formatted);
            toast.success("Tinh chỉnh thành công!", { id: toastId });
            setIsRefineModalOpen(false);
            setRefinePromptText("");
        } else {
            toast.error("Định dạng dữ liệu trả về không hợp lệ.", { id: toastId });
        }
    } catch (err: any) {
        toast.error("Lỗi khi tinh chỉnh: " + (err.message || "Unknown error"), { id: toastId });
    } finally {
        setIsRefining(false);
    }
  }, [generatedQuestions, refinePromptText]);

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
      if (onSaved) {
        onSaved();
      } else {
        router.push("/question-bank");
      }
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
      {/* Render header conditionally */}
      {!isEmbedded && (
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center justify-center rounded-full w-10 h-10 hover:bg-accent">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {t("quizGenerate.title") || "Khởi tạo bằng AI"} <Sparkles className="w-5 h-5 text-blue-500 fill-blue-500" />
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {t("quizGenerate.subtitle") || "Cung cấp 1 văn bản, chủ đề hoặc file PDF để 2Know AI tự động trích xuất thành bài trắc nghiệm."}
            </p>
          </div>
        </div>
      )}

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
              <input 
                type="file" 
                accept=".pdf" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1 bg-background border-dashed border-border text-muted-foreground hover:text-blue-600 hover:border-blue-300 gap-2 h-11" disabled={isGenerating}>
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
                   <Button variant="outline" size="sm" className="h-8 gap-1.5 text-muted-foreground" onClick={() => setIsRefineModalOpen(true)}>
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

               {isGenerating && !rawStreamText && (
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

               {isGenerating && rawStreamText && (
                 <div className="h-full flex flex-col animate-in fade-in">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">AI ĐANG SUY LUẬN (STREAMING)</span>
                    </div>
                    <div 
                      ref={streamContainerRef}
                      onScroll={handleStreamScroll}
                      className="flex-1 bg-[#0d1117] rounded-lg p-4 overflow-y-auto font-mono text-[13px] text-green-400 border border-slate-800 shadow-inner whitespace-pre-wrap leading-relaxed"
                    >
                      {rawStreamText}
                      <span className="animate-pulse inline-block w-2 h-4 bg-green-400 ml-1 align-middle"></span>
                    </div>
                 </div>
               )}

               {!isGenerating && rawStreamText && generatedQuestions.length === 0 && (
                 <div className="h-full flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-rose-600 uppercase tracking-widest">LỖI PHÂN TÍCH JSON</span>
                    </div>
                    <div className="flex-1 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg p-4 overflow-y-auto font-mono text-[13px] text-foreground border border-rose-200 dark:border-rose-900 whitespace-pre-wrap">
                      {rawStreamText}
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

      {/* Refine Modal */}
      {isRefineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background rounded-xl border shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-blue-600" /> Tinh chỉnh câu hỏi
              </h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Bạn muốn sửa gì? (AI sẽ đọc và sửa lại danh sách hiện tại)
              </label>
              <textarea
                className="w-full min-h-[120px] p-3 text-sm bg-muted border border-border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y"
                placeholder="VD: Hãy làm cho câu 2 khó hơn, thay đổi chủ đề câu 3..."
                value={refinePromptText}
                onChange={(e) => setRefinePromptText(e.target.value)}
                autoFocus
              />
            </div>
            <div className="p-4 bg-muted/30 border-t flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsRefineModalOpen(false)} disabled={isRefining}>Hủy bỏ</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={refineQuiz} disabled={isRefining || !refinePromptText.trim()}>
                {isRefining ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Đang xử lý</> : <><Sparkles className="w-4 h-4 mr-2" /> Tinh chỉnh ngay</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
