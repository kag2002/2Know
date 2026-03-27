"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Wand2, 
  FileText, 
  Upload, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2,
  Settings2,
  Copy,
  Save
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function AIGeneratorPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [generationSteps, setGenerationSteps] = useState<string[]>([]);
  
  const generateQuiz = async () => {
    if (!prompt.trim()) return alert("Vui lòng nhập chủ đề bạn muốn tạo câu hỏi.");
    
    setIsGenerating(true);
    setGeneratedQuestions([]);
    setGenerationSteps([]);

    // Simulate AI Generation Process Steps for UI feedback
    const steps = [
      "Đang phân tích cấu trúc ngữ nghĩa Prompt...",
      "Thực hiện truy vấn LLM Agentic Pipeline...",
      "Trích xuất và chuẩn hóa bộ JSON đầu ra...",
    ];

    // Show initial steps
    setGenerationSteps(prev => [...prev, steps[0]]);
    
    try {
        setGenerationSteps(prev => [...prev, steps[1]]);
        const res = await apiFetch("/ai/generate-quiz", {
            method: "POST",
            body: JSON.stringify({ prompt })
        });
        
        setGenerationSteps(prev => [...prev, steps[2]]);
        
        if (res && res.questions) {
            // Assign sequential IDs to the AI questions
            const formatted = res.questions.map((q: any, idx: number) => ({
                id: idx + 1,
                ...q
            }));
            setGeneratedQuestions(formatted);
        } else {
            alert("Lỗi: Không nhận được định dạng câu hỏi hợp lệ từ AI.");
        }
    } catch (err: any) {
        alert("Lỗi khi kết nối tới AI: " + (err.message || "Unknown error"));
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSaveToBank = () => {
    alert("Đã thêm " + generatedQuestions.length + " câu hỏi vào Ngân Hàng!");
    router.push("/question-bank");
  };

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
             Khởi tạo bằng AI <Sparkles className="w-5 h-5 text-blue-500 fill-blue-500" />
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Cung cấp 1 văn bản, chủ đề hoặc file PDF để 2Know AI tự động trích xuất thành bài trắc nghiệm.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Prompt Area */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-background p-6 rounded-xl border shadow-sm border-blue-100/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-50/0 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <h3 className="font-semibold text-card-foreground text-base mb-4 flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-blue-600" /> Nhập yêu cầu sinh đề
            </h3>
            
            <textarea 
              className="w-full min-h-[160px] p-4 text-sm bg-muted border border-border rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow outline-none resize-y"
              placeholder="VD: Tạo 10 câu trắc nghiệm (4 đáp án) về Ngôn ngữ lập trình Go, tập trung vào Goroutines, Channels và Memory Management. Thiết lập mức độ: Sinh viên năm 3 Đại học..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
            />

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 bg-background border-dashed border-border text-muted-foreground hover:text-blue-600 hover:border-blue-300 gap-2 h-11" disabled={isGenerating}>
                 <Upload className="w-4 h-4" /> Tải lên PDF (Max 5MB)
              </Button>
              <Button onClick={generateQuiz} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-md shadow-blue-500/20 h-11" disabled={isGenerating}>
                 {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin"/> Đang phân tích</> : <><Sparkles className="w-4 h-4" /> Sinh Câu Hỏi (Alt+G)</>}
              </Button>
            </div>

            <div className="mt-6">
               <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Tùy chỉnh Nâng cao</p>
               <div className="flex flex-wrap gap-2">
                 {['Số lượng: 10', 'Độ khó: Tự động', 'Định dạng: Mutilple Choice', 'Ngôn ngữ: Tiếng Việt'].map(badge => (
                   <span key={badge} className="px-3 py-1.5 bg-slate-100 text-muted-foreground rounded-full text-xs font-medium cursor-pointer hover:bg-accent transition-colors">
                     {badge}
                   </span>
                 ))}
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
                 Kết quả <span className="bg-slate-100 text-muted-foreground px-2 py-0.5 rounded text-xs">Preview</span>
               </h3>
               {generatedQuestions.length > 0 && (
                 <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="h-8 gap-1.5 text-muted-foreground">
                     <Settings2 className="w-3.5 h-3.5" /> Tinh chỉnh
                   </Button>
                   <Button size="sm" className="h-8 gap-1.5 bg-slate-900 text-white hover:bg-slate-800" onClick={handleSaveToBank}>
                     <Save className="w-3.5 h-3.5" /> Lưu vào Ngân hàng
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
                    <p className="font-medium text-foreground">AI đang chờ lệnh</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
                      Nhập prompt bên trái để hệ thống tự động sinh ra những câu hỏi chất lượng cao.
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
                           <span className="text-muted-foreground">Đang xử lý...</span>
                      </div>
                    </div>
                 </div>
               )}

               {!isGenerating && generatedQuestions.length > 0 && (
                 <div className="space-y-6 animate-in fade-in duration-500">
                   {generatedQuestions.map((q, qIndex) => (
                     <div key={q.id} className="bg-background p-5 border shadow-sm rounded-lg group relative">
                       <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded bg-slate-100 hover:bg-accent"><Copy className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded bg-slate-100 hover:bg-rose-100 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                       </div>
                       
                       <p className="font-medium text-foreground pr-16 leading-relaxed">
                         <span className="text-blue-600 mr-2">Câu {qIndex + 1}.</span> 
                         {q.question}
                       </p>
                       
                       <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {q.options.map((opt: string, optIndex: number) => (
                           <div 
                             key={optIndex} 
                             className={`p-3 rounded-md text-sm border flex gap-3 ${
                               q.correctIndex === optIndex 
                                 ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium' 
                                 : 'bg-muted text-slate-700 border-border'
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

                       <div className="mt-4 pt-4 border-t border-dashed">
                         <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">Giải thích (AI Tạo)</p>
                         <p className="text-sm text-muted-foreground leading-relaxed bg-muted p-3 rounded-md italic">
                           {q.explanation}
                         </p>
                       </div>
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

// Missing Lucide Icon fallback inline for simple import
function Trash2(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>;
}
