"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, StickyNote, Search, MoreVertical, Pin, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialNotes = [
  { id: "1", title: "Kế hoạch kiểm tra HK2", content: "Tuần 1: Kiểm tra 15 phút chương Đạo hàm\nTuần 3: Kiểm tra 45 phút tổng hợp\nTuần 5: Thi HK2 (120 phút)", color: "bg-amber-50 border-amber-200", pinned: true, date: "Hôm nay" },
  { id: "2", title: "Lưu ý HS yếu lớp 12A1", content: "Bùi Quốc Khánh — yếu phần tích phân\nHoàng Thị Yến — vắng nhiều, cần gặp phụ huynh\nVõ Minh Tuấn — cần luyện thêm bài tập hình không gian", color: "bg-rose-50 border-rose-200", pinned: true, date: "Hôm qua" },
  { id: "3", title: "Ý tưởng câu hỏi IELTS", content: "- Task 2: Should governments invest more in public transport?\n- Task 1: Bar chart comparison of renewable energy sources\n- Speaking Part 2: Describe a memorable journey", color: "bg-blue-50 border-blue-200", pinned: false, date: "20 thg 3" },
  { id: "4", title: "Họp tổ Toán — Thứ 6", content: "Nội dung: Đánh giá tiến độ luyện thi\nĐịa điểm: Phòng 201\nThời gian: 14:00", color: "bg-emerald-50 border-emerald-200", pinned: false, date: "18 thg 3" },
  { id: "5", title: "Cập nhật rubric chấm tự luận", content: "Mức 1 (0-2đ): Chưa hiểu đề, trình bày lộn xộn\nMức 2 (3-5đ): Hiểu đề, thiếu dẫn chứng\nMức 3 (6-8đ): Đầy đủ, có luận điểm rõ ràng\nMức 4 (9-10đ): Sáng tạo, có dẫn chứng phong phú", color: "bg-violet-50 border-violet-200", pinned: false, date: "15 thg 3" },
];

export default function NotesPage() {
  const [notes, setNotes] = useState(initialNotes);
  const [search, setSearch] = useState("");

  const filtered = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    toast.success("Đã xóa ghi chú!");
  };

  const togglePin = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    toast.success("Đã cập nhật ghim!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">Ghi chú cá nhân</h1>
          <p className="text-muted-foreground mt-1 text-sm">Lưu trữ ý tưởng, kế hoạch giảng dạy và nhắc nhở quan trọng.</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => toast.info("Tính năng tạo ghi chú đang phát triển!")}>
          <Plus className="w-4 h-4" /> Tạo ghi chú
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Tìm kiếm ghi chú..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-10 w-full rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3"
        />
      </div>

      {pinned.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <Pin className="w-3.5 h-3.5" /> Đã ghim
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinned.map(note => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} onTogglePin={togglePin} />
            ))}
          </div>
        </>
      )}

      {unpinned.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-2">
            <StickyNote className="w-3.5 h-3.5" /> Khác
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinned.map(note => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} onTogglePin={togglePin} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function NoteCard({ note, onDelete, onTogglePin }: { note: typeof initialNotes[0]; onDelete: (id: string) => void; onTogglePin: (id: string) => void }) {
  return (
    <Card className={`shadow-sm hover:shadow-md transition-all border ${note.color} group`}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base font-bold">{note.title}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">{note.date}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-white/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2" onClick={() => onTogglePin(note.id)}>
              <Pin className="w-4 h-4" /> {note.pinned ? "Bỏ ghim" : "Ghim lên đầu"}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2">
              <Edit2 className="w-4 h-4" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => onDelete(note.id)}>
              <Trash2 className="w-4 h-4" /> Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed line-clamp-5">{note.content}</p>
      </CardContent>
    </Card>
  );
}
