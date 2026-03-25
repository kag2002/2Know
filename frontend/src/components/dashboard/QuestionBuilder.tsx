"use client";

import { useState } from "react";
import { Copy, GripVertical, MoreVertical, Plus, Sparkles, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockQuestions = [
  { id: 1, type: "Trắc nghiệm", points: 10, content: "Giải phương trình bậc 2 sau: x^2 - 4x + 4 = 0", options: ["x=2", "x=-2", "Vô nghiệm", "Phụ thuộc tham số"] },
  { id: 2, type: "Tự luận", points: 20, content: "Viết mở bài phân tích nhân vật Mị trong đêm tình mùa xuân.", options: [] }
];

export function QuestionBuilder() {
  const [questions, setQuestions] = useState(mockQuestions);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Actions */}
      <div className="flex flex-wrap gap-3">
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Thêm câu hỏi
        </Button>
        <Button variant="outline" className="gap-2 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100">
          <Sparkles className="w-4 h-4" /> AI Tạo tự động
        </Button>
        <Button variant="outline" className="gap-2">
          Chọn từ Ngân hàng
        </Button>
        <Button variant="outline" className="gap-2">
          Import từ Word / Excel
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="flex items-center gap-6 p-4 rounded-lg bg-slate-50 border">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Tổng câu hỏi</span>
          <span className="text-xl font-bold">{questions.length}</span>
        </div>
        <div className="w-px h-8 bg-slate-200"></div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase font-semibold">Tổng điểm</span>
          <span className="text-xl font-bold">{questions.reduce((sum, q) => sum + q.points, 0)}</span>
        </div>
      </div>

      {/* List of Questions */}
      <div className="space-y-4">
        {questions.map((q, index) => (
          <div key={q.id} className="group relative border rounded-lg bg-white shadow-sm hover:shadow transition-all flex flex-col">
            <div className="flex items-center justify-between p-4 border-b bg-slate-50/50 rounded-t-lg">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-slate-300 cursor-grab hover:text-slate-500" />
                <span className="font-semibold text-sm">Câu {index + 1}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                  {q.type}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {q.points} điểm
                </span>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-5 flex gap-4">
              <div className="flex-1 space-y-4">
                <div className="text-sm font-medium text-slate-800">
                  {q.content}
                </div>
                
                {q.options.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-md border bg-slate-50 text-sm">
                        <div className="w-5 h-5 rounded-full border border-slate-300 bg-white flex items-center justify-center text-[10px] font-medium text-slate-500">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-slate-700">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {questions.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-lg bg-slate-50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <BookOpen className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-800">Chưa có câu hỏi nào</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
              Nhấn nút Thêm bên trên hoặc sử dụng AI để tạo nhanh danh sách câu hỏi cho bài thi của bạn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
