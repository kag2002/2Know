"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, Save, Plus, Trash2, GripVertical, CheckCircle2,
  Settings2, Image as ImageIcon, BookOpen, Tags
} from "lucide-react";
import Link from "next/link";

export default function CreateQuestionPage() {
  const router = useRouter();
  const [qType, setQType] = useState("multiple_choice");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState([
    { id: 1, text: "", isCorrect: true },
    { id: 2, text: "", isCorrect: false },
    { id: 3, text: "", isCorrect: false },
    { id: 4, text: "", isCorrect: false },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleCorrect = (id: number) => {
    setOptions(options.map(opt =>
      opt.id === id ? { ...opt, isCorrect: true } : { ...opt, isCorrect: false }
    ));
  };

  const handleSave = async () => {
    if (!content.trim()) return alert("Vui lòng nhập nội dung câu hỏi!");
    setIsSaving(true);
    try {
      await apiFetch("/questions", {
        method: "POST",
        body: JSON.stringify({
          type: qType,
          content: content,
          difficulty: "Trung bình",
          folder: "Chưa phân loại",
          options: options.map(o => ({ content: o.text, is_correct: o.isCorrect }))
        })
      });
      alert("Đã lưu câu hỏi thành công!");
      router.push("/question-bank");
    } catch (err: any) {
      alert("Lỗi khi lưu câu hỏi: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/question-bank" className="p-2 border rounded-md hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Thêm câu hỏi mới</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tạo câu hỏi và lưu vào ngân hàng dữ liệu để tái sử dụng.
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white gap-2" disabled>
              Lưu nháp
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm font-semibold" onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4" /> {isSaving ? "Đang lưu..." : "Lưu vào Ngân hàng"}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6 bg-white p-6 border rounded-xl shadow-sm">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 space-y-2">
            <label className="text-sm font-medium">Loại câu hỏi</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
              <option>Trắc nghiệm (1 đáp án)</option>
              <option>Nhiều đáp án (Checkboxes)</option>
              <option>Đúng / Sai</option>
              <option>Tự luận</option>
              <option>Điền vào chỗ trống</option>
            </select>
          </div>
          <div className="col-span-1 space-y-2">
            <label className="text-sm font-medium">Chủ đề (Môn học)</label>
            <Input defaultValue="Toán học" />
          </div>
          <div className="col-span-1 space-y-2">
            <label className="text-sm font-medium">Mức độ / Lớp</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
              <option>Dễ (Nhận biết)</option>
              <option>Trung bình (Thông hiểu)</option>
              <option>Khó (Vận dụng)</option>
              <option>Rất khó (Vận dụng cao)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <label className="text-sm font-medium">Nội dung câu hỏi <span className="text-rose-500">*</span></label>
          <div className="border rounded-md">
            {/* Fake Rich Text Toolbar */}
            <div className="flex items-center gap-2 p-2 border-b bg-slate-50 rounded-t-md">
              <Button variant="ghost" size="sm" className="h-8 px-2 font-bold">B</Button>
              <Button variant="ghost" size="sm" className="h-8 px-2 italic">I</Button>
              <Button variant="ghost" size="sm" className="h-8 px-2 underline">U</Button>
              <div className="w-px h-4 bg-slate-300 mx-1"></div>
              <Button variant="ghost" size="sm" className="h-8 px-2">{"{x}"}</Button>
              <Button variant="ghost" size="sm" className="h-8 px-2">📷</Button>
            </div>
            <textarea
              className="w-full p-4 min-h-[120px] focus:outline-none resize-y"
              placeholder="Nhập nội dung câu hỏi..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Các đáp án</label>
            <span className="text-xs text-muted-foreground">Tích xanh vào đáp án đúng</span>
          </div>

          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={opt.id} className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${opt.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
                <div className="pt-2">
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={opt.isCorrect}
                    onChange={() => toggleCorrect(opt.id)}
                    className="w-4 h-4 text-emerald-600 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder={`Nhập đáp án ${String.fromCharCode(65 + i)}...`}
                    value={opt.text}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[i].text = e.target.value;
                      setOptions(newOpts);
                    }}
                    className={`bg-white ${opt.isCorrect ? 'border-emerald-300' : ''}`}
                  />
                </div>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-500 mt-0.5">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full border-dashed gap-2 text-slate-500 mt-2">
            <Plus className="w-4 h-4" /> Thêm đáp án khác
          </Button>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <label className="text-sm font-medium">Giải thích đáp án (Tùy chọn)</label>
          <textarea 
            className="flex min-h-[80px] w-full rounded-md border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
            placeholder="Giải thích tại sao đáp án lại đúng để học sinh có thể tham khảo sau khi thi xong..."
          ></textarea>
        </div>
      </div>
    </div>
  );
}
