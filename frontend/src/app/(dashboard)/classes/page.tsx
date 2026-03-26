"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Users, School, ChevronRight, MoreVertical, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClassItem {
  id: string;
  name: string;
  grade: string;
  subject: string;
  school_year: string;
  students?: { id: string }[];
  created_at: string;
}

const fallbackClasses: ClassItem[] = [
  { id: "1", name: "12A1 - Toán Học - Cô Lan", grade: "Lớp 12", subject: "Toán học", school_year: "2025-2026", students: Array(45).fill({ id: "" }), created_at: "2026-03-12T00:00:00Z" },
  { id: "2", name: "10A5 - Ngữ Văn Khối C", grade: "Lớp 10", subject: "Ngữ văn", school_year: "2025-2026", students: Array(42).fill({ id: "" }), created_at: "2026-03-10T00:00:00Z" },
  { id: "3", name: "Luyện thi IELTS Target 7.0+", grade: "Khác", subject: "Tiếng Anh", school_year: "2026", students: Array(15).fill({ id: "" }), created_at: "2026-03-05T00:00:00Z" },
  { id: "4", name: "11B2 - Vật Lý Thầy Tuấn", grade: "Lớp 11", subject: "Vật lý", school_year: "2025-2026", students: Array(38).fill({ id: "" }), created_at: "2026-03-01T00:00:00Z" },
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/classes");
      setClasses(data && data.length > 0 ? data : fallbackClasses);
    } catch {
      // Fallback to mock data if API is not available
      setClasses(fallbackClasses);
    } finally {
      setLoading(false);
    }
  };

  const filtered = classes.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.subject.toLowerCase().includes(search.toLowerCase())
  );

  const totalStudents = classes.reduce((acc, c) => acc + (c.students?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">Quản lý lớp học</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tổ chức học sinh theo lớp, dễ dàng giao bài tập và theo dõi tiến độ học tập.
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 bg-white dark:bg-card flex-1 sm:flex-none">
            <Filter className="w-4 h-4" /> Lọc
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white flex-1 sm:flex-none" onClick={() => toast.info("Tính năng tạo lớp đang phát triển!")}>
            <Plus className="w-4 h-4" /> Tạo lớp mới
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card p-4 border rounded-xl shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm tên lớp học..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-10 bg-muted/50 border-transparent focus:bg-background transition-colors"
          />
        </div>
        <div className="hidden sm:block h-6 w-px bg-border"></div>
        <div className="flex gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs uppercase font-semibold">Tổng số lớp</span>
            <span className="font-bold text-lg">{classes.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs uppercase font-semibold">Học sinh</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">{totalStudents}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((cls) => (
            <div key={cls.id} className="group flex flex-col bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all">
              <div className="p-5 flex-1 relative">
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Chỉnh sửa thông tin</DropdownMenuItem>
                      <DropdownMenuItem>Báo cáo điểm chuẩn</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Lưu trữ lớp</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <School className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-0.5">{cls.subject} • {cls.grade}</div>
                    <h3 className="font-bold line-clamp-1 pr-6">{cls.name}</h3>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span><strong>{cls.students?.length || 0}</strong> học sinh</span>
                  </div>
                  <div>
                    <span>Năm học: {cls.school_year}</span>
                  </div>
                </div>

                <div className="flex -space-x-2 overflow-hidden mb-2">
                  {[1,2,3,4].map(avatar => (
                    <div key={avatar} className="inline-block h-8 w-8 rounded-full ring-2 ring-card bg-muted border" />
                  ))}
                  <div className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-card bg-muted text-[10px] font-medium text-muted-foreground border">
                    +{Math.max((cls.students?.length || 0) - 4, 0)}
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/30 border-t p-3 px-5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Tạo ngày {new Date(cls.created_at).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <Link href={`/classes/${cls.id}`} className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-700 flex items-center gap-1 transition-colors">
                  Xem danh sách <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          {/* Create New Card */}
          <div 
            className="flex flex-col items-center justify-center min-h-[220px] bg-muted/30 border-2 border-dashed rounded-xl hover:bg-muted/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group"
            onClick={() => toast.info("Tính năng tạo lớp đang phát triển!")}
          >
            <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="font-semibold">Tạo Lớp học mới</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] text-center">Tạo phòng học kín và quản lý tiến trình học tập</p>
          </div>
        </div>
      )}
    </div>
  );
}
