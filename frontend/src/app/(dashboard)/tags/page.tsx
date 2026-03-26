"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Tags, Search, X, Hash, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const initialTags = [
  { id: "1", name: "Đạo hàm", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", count: 24 },
  { id: "2", name: "Tích phân", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", count: 18 },
  { id: "3", name: "Hình không gian", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400", count: 15 },
  { id: "4", name: "Grammar", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", count: 32 },
  { id: "5", name: "Vocabulary", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", count: 28 },
  { id: "6", name: "Thi thử", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400", count: 8 },
  { id: "7", name: "Dễ", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", count: 45 },
  { id: "8", name: "Trung bình", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", count: 38 },
  { id: "9", name: "Khó", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400", count: 22 },
  { id: "10", name: "Chương 1", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", count: 12 },
  { id: "11", name: "Chương 2", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", count: 16 },
  { id: "12", name: "Writing", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", count: 14 },
];

export default function TagsPage() {
  const [tags, setTags] = useState(initialTags);
  const [search, setSearch] = useState("");
  const [newTag, setNewTag] = useState("");

  const filtered = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  const addTag = () => {
    if (!newTag.trim()) return;
    const colors = ["bg-indigo-100 text-indigo-700", "bg-emerald-100 text-emerald-700", "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700", "bg-rose-100 text-rose-700"];
    setTags([...tags, { id: Date.now().toString(), name: newTag.trim(), color: colors[Math.floor(Math.random() * colors.length)], count: 0 }]);
    setNewTag("");
    toast.success(`Đã thêm thẻ "${newTag.trim()}"`);
  };

  const deleteTag = (id: string) => {
    setTags(tags.filter(t => t.id !== id));
    toast.success("Đã xóa thẻ!");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">Quản lý Thẻ (Tags)</h1>
          <p className="text-muted-foreground mt-1 text-sm">Phân loại câu hỏi và bài kiểm tra bằng hệ thống thẻ thông minh.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950"><Tags className="w-5 h-5 text-indigo-500" /></div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Tổng thẻ</p>
              <p className="text-2xl font-bold">{tags.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950"><BarChart3 className="w-5 h-5 text-emerald-500" /></div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">Câu hỏi đã gắn thẻ</p>
              <p className="text-2xl font-bold">{tags.reduce((a, t) => a + t.count, 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Tìm thẻ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 w-full rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3"
          />
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Tên thẻ mới..."
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTag()}
            className="h-10 w-48 rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3"
          />
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={addTag}>
            <Plus className="w-4 h-4" /> Thêm
          </Button>
        </div>
      </div>

      {/* Tags Cloud */}
      <div className="flex flex-wrap gap-3">
        {filtered.map(tag => (
          <div 
            key={tag.id} 
            className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:shadow-md cursor-default ${tag.color}`}
          >
            <Hash className="w-3.5 h-3.5 opacity-50" />
            {tag.name}
            <span className="text-[10px] opacity-60 font-normal">({tag.count})</span>
            <button 
              onClick={() => deleteTag(tag.id)} 
              className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm py-8">Không tìm thấy thẻ nào phù hợp.</p>
        )}
      </div>
    </div>
  );
}
