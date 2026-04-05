"use client";

import { Plus, Sparkles, Trash2, BookOpen, Database, Search, CheckCircle2, Expand, Shrink, Save, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, memo } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

const SortableQuestionItem = memo(function SortableQuestionItem({ q, index, updateQuestion, updateOption, setCorrectOption, removeQuestion, addOption, removeOption }: any) {
  const sortableId = q.id ? q.id.toString() : `temp-${index}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortableId });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      addOption(index);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
          <div ref={setNodeRef} style={style} className={`group relative border rounded-lg bg-background shadow-sm hover:shadow transition-all flex flex-col ${isDragging ? 'ring-2 ring-indigo-500 shadow-xl' : ''}`}>
            <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg">
              <div className="flex items-center gap-3 w-full">
                <div {...attributes} {...listeners} className="cursor-grab hover:bg-slate-200 p-1 rounded text-slate-400 hover:text-slate-600 focus:outline-none">
                  <GripVertical className="w-5 h-5" />
                </div>
                <span className="font-semibold text-sm whitespace-nowrap">Câu {index + 1}</span>
                <select 
                  className="text-xs p-1 border rounded bg-background text-slate-700 font-medium cursor-pointer"
                  value={q.type}
                  onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                >
                  <option value="Trắc nghiệm">Trắc nghiệm</option>
                  <option value="Nhiều đáp án">Nhiều đáp án</option>
                  <option value="Tự luận">Tự luận</option>
                </select>
                <div className="flex items-center gap-1 ml-4 bg-background px-2 py-0.5 rounded border">
                  <input 
                    type="number" 
                    className="w-12 text-xs p-1 text-center bg-transparent border-none outline-none focus:ring-0" 
                    value={q.points}
                    onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 0)}
                  />
                  <span className="text-xs text-muted-foreground font-medium shrink-0">điểm</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-auto">
                <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                  {isCollapsed ? <Expand className="w-4 h-4" /> : <Shrink className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)} className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {!isCollapsed && (
            <div className="p-5 flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex-1 space-y-4">
                <div>
                  <textarea
                    placeholder="Nhập nội dung câu hỏi (Cmd/Ctrl + Enter để thêm đáp án)..."
                    className="w-full text-sm font-medium text-card-foreground p-3 border rounded-md focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none resize-y min-h-[80px] bg-background transition-shadow shadow-sm focus:shadow-md"
                    value={q.content}
                    onChange={(e) => updateQuestion(index, 'content', e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                
                {q.type !== "Tự luận" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {q.options.map((opt: any, i: number) => (
                      <div key={i} className={`flex items-center gap-3 p-2 rounded-md border text-sm transition-colors ${opt.isCorrect ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20' : 'bg-muted/50'}`}>
                        <input 
                          type="radio" 
                          name={`correct_${sortableId}`} 
                          checked={opt.isCorrect} 
                          onChange={() => setCorrectOption(index, i)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer border-slate-300"
                        />
                        <div className={`w-6 h-6 rounded border flex items-center justify-center text-[10px] font-bold shrink-0 ${opt.isCorrect ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-background text-muted-foreground border-border'}`}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <input 
                           type="text"
                           placeholder={`Nhập đáp án ${String.fromCharCode(65 + i)}`}
                           className="flex-[1_1_0%] bg-transparent border-none focus:ring-0 p-0 text-foreground placeholder:text-muted-foreground outline-none min-w-0"
                           value={opt.text}
                           onChange={(e) => updateOption(index, i, e.target.value)}
                           onKeyDown={handleKeyDown}
                        />
                        {q.options.length > 2 && (
                          <button type="button" className="text-slate-400 hover:text-rose-500 shrink-0 p-1 rounded-md hover:bg-rose-50 transition-colors" onClick={() => removeOption(index, i)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="flex items-center justify-center w-full border border-dashed rounded-md h-10 gap-2 text-sm text-muted-foreground hover:bg-muted transition-colors col-span-1 sm:col-span-2 mt-1 font-medium" onClick={() => addOption(index)}>
                      <Plus className="w-4 h-4" /> Thêm đáp án khác
                    </button>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.q === nextProps.q && prevProps.index === nextProps.index;
});

import { useTranslation } from "@/context/LanguageContext";

export function QuestionBuilder({ questions, setQuestions }: QuestionBuilderProps) {
  const { t } = useTranslation();
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<any[]>([]);
  const [searchBank, setSearchBank] = useState("");
  const [loadingBank, setLoadingBank] = useState(false);
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (questions.length > 0) {
      const timer = setTimeout(() => setLastSaved(new Date()), 1000);
      return () => clearTimeout(timer);
    }
  }, [questions]);

  const loadBank = async () => {
    try {
      setLoadingBank(true);
      const data = await apiFetch("/questions");
      setBankQuestions(data || []);
    } catch {
      toast.error(t("component.questionBuilder.loadError") || "Không thể tải ngân hàng câu hỏi");
    } finally {
      setLoadingBank(false);
    }
  };

  const addQuestion = () => {
    if (questions.length >= 200) {
      toast.warning(t("component.questionBuilder.limitQuestions") || "Một bài kiểm tra tối đa 200 câu hỏi");
      return;
    }
    setQuestions([
      ...questions,
      {
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((i, idx) => (i.id ? i.id.toString() : `temp-${idx}`) === active.id);
        const newIndex = items.findIndex((i, idx) => (i.id ? i.id.toString() : `temp-${idx}`) === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateQuestion = useCallback((index: number, field: string, value: any) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }, [setQuestions]);

  const updateOption = useCallback((qIndex: number, optIndex: number, text: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      const updatedQ = { ...updated[qIndex], options: [...updated[qIndex].options] };
      updatedQ.options[optIndex] = { ...updatedQ.options[optIndex], text };
      updated[qIndex] = updatedQ;
      return updated;
    });
  }, [setQuestions]);

  const setCorrectOption = useCallback((qIndex: number, optIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      const updatedQ = { 
        ...updated[qIndex], 
        options: updated[qIndex].options.map((opt, i) => ({
          ...opt,
          isCorrect: i === optIndex
        }))
      };
      updated[qIndex] = updatedQ;
      return updated;
    });
  }, [setQuestions]);

  const removeQuestion = useCallback((index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  }, [setQuestions]);

  const addOption = useCallback((qIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (updated[qIndex].options.length >= 8) {
        toast.warning(t("component.questionBuilder.limitOptions") || "Tối đa 8 đáp án cho mỗi câu hỏi");
        return prev;
      }
      const updatedQ = { ...updated[qIndex], options: [...updated[qIndex].options, { text: "", isCorrect: false }] };
      updated[qIndex] = updatedQ;
      return updated;
    });
  }, [setQuestions]);

  const removeOption = useCallback((qIndex: number, optIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (updated[qIndex].options.length <= 2) {
        toast.warning(t("component.questionBuilder.minOptions") || "Phải có ít nhất 2 đáp án");
        return prev;
      }
      const remainingOptions = updated[qIndex].options.filter((_, i) => i !== optIndex);
      if (!remainingOptions.some(o => o.isCorrect)) {
         remainingOptions[0].isCorrect = true;
      }
      const updatedQ = { ...updated[qIndex], options: remainingOptions };
      updated[qIndex] = updatedQ;
      return updated;
    });
  }, [setQuestions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Actions */}
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={addQuestion} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Thêm câu hỏi
        </Button>
        <Button type="button" variant="outline" className="gap-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 hover:bg-indigo-100" onClick={() => window.location.href = '/quizzes/generate'}>
          <Sparkles className="w-4 h-4" /> AI Tạo tự động
        </Button>
        <Button type="button" variant="outline" className="gap-2" onClick={() => { setIsBankOpen(true); loadBank(); }}>
          <Database className="w-4 h-4" /> Chọn từ Ngân hàng
        </Button>
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
        <div className="ml-auto flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800">
          {lastSaved ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã lưu tự động lúc {lastSaved.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Chưa có thay đổi</span>
            </>
          )}
        </div>
      </div>

      {/* List of Questions */}
      <div className="space-y-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map((q, idx) => q.id ? q.id.toString() : `temp-${idx}`)} strategy={verticalListSortingStrategy}>
            {questions.map((q, index) => (
              <SortableQuestionItem
                key={q.id ? q.id.toString() : `temp-${index}`}
                q={q}
                index={index}
                updateQuestion={updateQuestion}
                updateOption={updateOption}
                setCorrectOption={setCorrectOption}
                removeQuestion={removeQuestion}
                addOption={addOption}
                removeOption={removeOption}
              />
            ))}
          </SortableContext>
        </DndContext>
        
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

      {/* Select From Bank Dialog */}
      <Dialog open={isBankOpen} onOpenChange={setIsBankOpen}>
        <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Chọn từ Ngân hàng</DialogTitle>
            <DialogDescription>Chọn các câu hỏi có sẵn để thêm vào bài kiểm tra này</DialogDescription>
          </DialogHeader>
          <div className="relative my-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm nội dung câu hỏi..." 
              value={searchBank}
              onChange={(e) => setSearchBank(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 p-1">
            {loadingBank ? (
               <div className="flex justify-center py-8">Đang tải ngân hàng câu hỏi...</div>
            ) : bankQuestions.filter(q => q.content.toLowerCase().includes(searchBank.toLowerCase())).map(q => {
               const isSelected = selectedBankIds.includes(q.id);
               return (
                 <div 
                   key={q.id} 
                   className={`p-3 border rounded-lg cursor-pointer transition-colors flex gap-3 ${isSelected ? 'border-emerald-500 bg-emerald-50/30' : 'hover:border-indigo-300'}`}
                   onClick={() => {
                     if (isSelected) setSelectedBankIds(prev => prev.filter(id => id !== q.id));
                     else setSelectedBankIds(prev => [...prev, q.id]);
                   }}
                 >
                   <div className="mt-1 shrink-0">
                     <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'border-slate-300'}`}>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                     </div>
                   </div>
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-muted-foreground">{q.subject}</span>
                       <span className="text-xs text-muted-foreground">{q.difficulty}</span>
                       <span className="text-xs text-muted-foreground">{q.points} điểm</span>
                     </div>
                     <p className="text-sm line-clamp-2 leading-relaxed">{q.content}</p>
                   </div>
                 </div>
               )
            })}
            {bankQuestions.length === 0 && !loadingBank && (
              <p className="text-center text-muted-foreground py-8">{t("questionBank.alertEmpty") || "Ngân hàng câu hỏi trống"}</p>
            )}
          </div>
          <DialogFooter className="pt-4 mt-auto">
            <Button variant="outline" onClick={() => setIsBankOpen(false)}>{t("common.cancel") || "Hủy"}</Button>
            <Button 
               disabled={selectedBankIds.length === 0} 
               onClick={() => {
                 const selectedQ = bankQuestions.filter(q => selectedBankIds.includes(q.id));
                 const formatted = selectedQ.map(q => ({
                   id: q.id,
                   type: "Trắc nghiệm",
                   points: q.points || 10,
                   content: q.content,
                   options: q.metadata?.options && q.metadata.options.length > 0 ? q.metadata.options : [
                     { text: "", isCorrect: true },
                     { text: "", isCorrect: false }
                   ]
                 }));
                 setQuestions([...questions, ...formatted]);
                 setIsBankOpen(false);
                 setSelectedBankIds([]);
                 toast.success(t("dashboard.questions.addSuccess", { count: formatted.length }) || `Đã thêm ${formatted.length} câu hỏi vào bài kiểm tra`);
               }}
            >
              {t("common.add")} {selectedBankIds.length} {t("dashboard.questions.selectedLabel") || "câu đã chọn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
