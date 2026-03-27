"use client";

import { Copy, GripVertical, MoreVertical, Plus, Sparkles, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

export interface QuestionPayload {
  id?: string | number;
  type: string;
  points: number;
  content: string;
  options: QuestionOption[];
}

interface QuestionBuilderProps {
  questions: QuestionPayload[];
  setQuestions: React.Dispatch<React.SetStateAction<QuestionPayload[]>>;
}

export function QuestionBuilder({ questions, setQuestions }: QuestionBuilderProps) {

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        type: "Trắc nghiệm",
        points: 10,
        content: "",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false }
        ]
      }
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].text = text;
    setQuestions(updated);
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optIndex
    }));
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={addQuestion} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Thêm câu hỏi
        </Button>
        <Button variant="outline" className="gap-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 hover:bg-indigo-100">
          <Sparkles className="w-4 h-4" /> AI Tạo tự động
        </Button>
        <Button variant="outline" className="gap-2">Chọn từ Ngân hàng</Button>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center gap-6 p-4 rounded-lg bg-muted border">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Tổng câu hỏi</span>
          <span className="text-xl font-bold">{questions.length}</span>
        </div>
        <div className="w-px h-8 bg-slate-200"></div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Tổng điểm</span>
          <span className="text-xl font-bold">{questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0)}</span>
        </div>
      </div>

      {/* List of Questions */}
      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id || index} className="group relative border rounded-lg bg-background shadow-sm hover:shadow transition-all flex flex-col">
            <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
              <div className="flex items-center gap-3 w-full">
                <GripVertical className="w-5 h-5 text-slate-300 cursor-grab hover:text-muted-foreground" />
                <span className="font-semibold text-sm whitespace-nowrap">Câu {index + 1}</span>
                <select 
                  className="text-xs p-1 border rounded bg-background text-slate-700 font-medium"
                  value={q.type}
                  onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                >
                  <option value="Trắc nghiệm">Trắc nghiệm</option>
                  <option value="Nhiều đáp án">Nhiều đáp án</option>
                  <option value="Tự luận">Tự luận</option>
                </select>
                <div className="flex items-center gap-1 ml-4">
                  <input 
                    type="number" 
                    className="w-14 text-xs p-1 border rounded text-center" 
                    value={q.points}
                    onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-xs text-muted-foreground font-medium">điểm</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-auto">
                <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)} className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-5 flex gap-4">
              <div className="flex-1 space-y-4">
                <div>
                  <textarea
                    placeholder="Nhập nội dung câu hỏi..."
                    className="w-full text-sm font-medium text-card-foreground p-3 border rounded-md focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none resize-y min-h-[80px]"
                    value={q.content}
                    onChange={(e) => updateQuestion(index, 'content', e.target.value)}
                  />
                </div>
                
                {q.type !== "Tự luận" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2 rounded-md border text-sm transition-colors ${opt.isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-muted'}`}>
                        <input 
                          type="radio" 
                          name={`correct_${index}`} 
                          checked={opt.isCorrect} 
                          onChange={() => setCorrectOption(index, i)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="w-6 h-6 rounded border border-border bg-background flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <input 
                           type="text"
                           placeholder={`Nhập đáp án ${String.fromCharCode(65 + i)}`}
                           className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-slate-700 placeholder:text-slate-400"
                           value={opt.text}
                           onChange={(e) => updateOption(index, i, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {questions.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-sm mb-4">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-card-foreground">Chưa có câu hỏi nào</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
              Nhấn nút Thêm bên trên hoặc sử dụng AI để tạo nhanh danh sách câu hỏi cho bài thi của bạn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
