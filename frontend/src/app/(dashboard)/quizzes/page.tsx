"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreHorizontal, Clock, Users, Play, Copy, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Quiz {
  id: string;
  title: string;
  subject: string;
  status: string;
  created_at: string;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/quizzes");
      setQuizzes(data || []);
    } catch (err: any) {
      setError("Không thể tải danh sách đề thi.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-xs font-medium">Đang Mở</span>;
      case 'draft': return <span className="px-2 py-1 bg-slate-100 text-muted-foreground rounded-md text-xs font-medium">Bản Nháp</span>;
      case 'closed': return <span className="px-2 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-md text-xs font-medium">Đã Đóng</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Danh sách Đề thi</h1>
          <p className="text-muted-foreground text-sm mt-1">Quản lý và theo dõi các bài kiểm tra đã tạo</p>
        </div>
        <Link href="/quizzes/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Tạo đề thi mới
          </Button>
        </Link>
      </div>

      <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b bg-muted/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm theo tên đề thi..." 
              className="pl-9 h-10 w-full bg-background"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" className="gap-2 bg-background flex-1 sm:flex-none">
              <Filter className="w-4 h-4 text-muted-foreground" /> Trạng thái
            </Button>
            <Button variant="outline" className="gap-2 bg-background flex-1 sm:flex-none">
              <Filter className="w-4 h-4 text-muted-foreground" /> Môn học
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>}
        {error && <div className="p-8 text-center text-rose-500">{error}</div>}

        {/* Quiz List */}
        {!loading && !error && quizzes.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">Chưa có đề thi nào</h3>
            <p className="text-muted-foreground mb-4 text-sm">Hãy bắt đầu tạo bài kiểm tra đầu tiên của bạn.</p>
            <Link href="/quizzes/create">
              <Button variant="outline" className="text-indigo-600 border-indigo-200">Tạo đề thi ngay</Button>
            </Link>
          </div>
        )}

        {!loading && !error && quizzes.length > 0 && (
          <div className="divide-y divide-slate-100 px-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="py-5 flex flex-col sm:flex-row gap-6 items-start sm:items-center hover:bg-muted group transition-colors rounded-lg px-2 -mx-2">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground text-lg group-hover:text-indigo-600 transition-colors">
                      {quiz.title}
                    </h3>
                    {getStatusBadge(quiz.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {new Date(quiz.created_at).toLocaleDateString('vi-VN')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      Môn: {quiz.subject}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto sm:justify-end">
                  {quiz.status === 'published' && (
                    <Button variant="outline" size="sm" className="gap-2 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 w-full sm:w-auto">
                      <Play className="w-4 h-4" /> Bắt đầu Thi
                    </Button>
                  )}
                  {quiz.status === 'draft' && (
                    <Button variant="outline" size="sm" className="gap-2 text-muted-foreground w-full sm:w-auto">
                      <Edit2 className="w-4 h-4" /> Tiếp tục soạn
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-9 w-9 p-0 flex items-center justify-center rounded-md border bg-background hover:bg-muted text-muted-foreground shrink-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="gap-2"><Copy className="w-4 h-4 text-slate-400"/> Nhân bản đề thi</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><Users className="w-4 h-4 text-slate-400"/> Giao cho Lớp học</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-rose-600 focus:text-rose-600"><Trash2 className="w-4 h-4"/> Xóa đề thi</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure Input is defined locally since we dropped the import for brevity
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`} />
}
