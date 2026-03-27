"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Search, Filter, Library, FileText, CheckCircle2, Copy, Trash2, Edit2, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const initialRubrics = [
  { id: "1", title: "Biểu điểm phân tích tác phẩm Văn học", subject: "Ngữ văn", target: "HS Lớp 10-12", criteriaCount: 4, usageCount: 45, date: "12 thg 3, 2026", active: true },
  { id: "2", title: "IELTS Writing Task 2 (Band 6.0-9.0)", subject: "Tiếng Anh", target: "IELTS", criteriaCount: 4, usageCount: 120, date: "08 thg 3, 2026", active: true },
  { id: "3", title: "Đánh giá bài luận Tiếng Anh B1", subject: "Tiếng Anh", target: "HS Lớp 10", criteriaCount: 3, usageCount: 28, date: "05 thg 3, 2026", active: true },
  { id: "4", title: "Giải phương trình tự luận", subject: "Toán học", target: "Chung", criteriaCount: 3, usageCount: 15, date: "01 thg 3, 2026", active: false },
];

export default function RubricsPage() {
  const [search, setSearch] = useState("");
  const [rubrics, setRubrics] = useState(initialRubrics);

  const filtered = rubrics.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setRubrics(rubrics.filter(r => r.id !== id));
    toast.success("Đã xóa rubric!");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">Thư viện Rubric AI</h1>
          <p className="text-muted-foreground mt-1 text-sm">Quản lý các tiêu chí đánh giá tự động bằng AI cho bài kiểm tra tự luận.</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => toast.info("Tính năng tạo Rubric AI đang phát triển!")}>
          <Plus className="w-4 h-4" /> Tạo Rubric mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex flex-col justify-center">
            <Library className="w-5 h-5 text-indigo-500 mb-2" />
            <p className="text-3xl font-bold">{rubrics.length}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase mt-1">Tổng Rubric</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex flex-col justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
            <p className="text-3xl font-bold">{rubrics.filter(r => r.active).length}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase mt-1">Đang hoạt động</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex flex-col justify-center">
            <PlayCircle className="w-5 h-5 text-amber-500 mb-2" />
            <p className="text-3xl font-bold">{rubrics.reduce((a, r) => a + r.usageCount, 0)}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase mt-1">Lượt áp dụng chấm</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-dashed bg-muted/30 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toast.info("Khám phá Thư viện Rubric chung mẫu!")}>
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-card rounded-full shadow-sm mb-2"><Plus className="w-4 h-4 text-indigo-500" /></div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Khám phá thư viện mẫu</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm rubric theo tên hoặc môn học..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card focus:bg-background h-10 transition-colors"
          />
        </div>
        <Button variant="outline" className="gap-2 bg-card shrink-0">
          <Filter className="w-4 h-4 text-muted-foreground" /> Lọc
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(rubric => (
          <Card key={rubric.id} className="shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <CardHeader className="p-5 pb-3">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {rubric.subject}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <span className="text-xs text-muted-foreground">{rubric.target}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {rubric.title}
                  </CardTitle>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 -mt-2 -mr-2 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2"><Edit2 className="w-4 h-4"/> Chỉnh sửa tiêu chí</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2"><Copy className="w-4 h-4"/> Nhân bản</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => handleDelete(rubric.id)}><Trash2 className="w-4 h-4"/> Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>{rubric.criteriaCount} tiêu chí</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4" />
                  <span>Đã dùng {rubric.usageCount} lần</span>
                </div>
                {rubric.active ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase ml-auto">Đang áp dụng</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-muted-foreground dark:bg-slate-800 text-[10px] font-bold uppercase ml-auto">Bản nháp</span>
                )}
              </div>
              
              {/* Sample criteria pills */}
              <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                {rubric.subject === "Tiếng Anh" ? (
                  <>
                    <span className="px-2 py-1 bg-muted/50 rounded text-xs font-medium text-muted-foreground dark:text-slate-300 border">Ngữ pháp (25%)</span>
                    <span className="px-2 py-1 bg-muted/50 rounded text-xs font-medium text-muted-foreground dark:text-slate-300 border">Từ vựng (25%)</span>
                    <span className="px-2 py-1 bg-muted/50 rounded text-xs font-medium text-muted-foreground dark:text-slate-300 border">Mạch lạc (25%)</span>
                  </>
                ) : rubric.subject === "Ngữ văn" ? (
                  <>
                    <span className="px-2 py-1 bg-muted/50 rounded text-xs font-medium text-muted-foreground dark:text-slate-300 border">Hiểu đề (30%)</span>
                    <span className="px-2 py-1 bg-muted/50 rounded text-xs font-medium text-muted-foreground dark:text-slate-300 border">Dẫn chứng (40%)</span>
                    <span className="px-2 py-1 bg-muted/50 rounded text-xs font-medium text-muted-foreground dark:text-slate-300 border">Diễn đạt (30%)</span>
                  </>
                ) : (
                  <>
                    <span className="px-2 py-1 bg-muted/50 rounded text-xs font-medium text-muted-foreground dark:text-slate-300 border">Đáp án đúng (50%)</span>
                    <span className="px-2 py-1 bg-muted/50 rounded text-xs font-medium text-muted-foreground dark:text-slate-300 border">Lập luận logic (50%)</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-1 lg:col-span-2 p-12 text-center text-muted-foreground border rounded-xl bg-card">
            Không tìm thấy rubric nào phù hợp.
          </div>
        )}
      </div>
    </div>
  );
}

// Quick component stub for MoreHorizontal since lucide-react export is sometimes finicky in auto-imports
function MoreHorizontal(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
}
