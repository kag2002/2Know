"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreHorizontal, Clock, Users, Play, Copy, Edit2, Trash2, Share2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "@/context/LanguageContext";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";


interface Quiz {
  id: string;
  title: string;
  subject: string;
  status: string;
  created_at: string;
}

export default function QuizzesPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null);

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareConfig, setShareConfig] = useState({ title: "", type: "public", quiz_id: "" });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/quizzes");
      setQuizzes(data || []);
    } catch (err: any) {
      setError(t("quizzes.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'published': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-md text-xs font-medium">{t("quizzes.statusPublished")}</span>;
      case 'draft': return <span className="px-2 py-1 bg-slate-100 text-muted-foreground rounded-md text-xs font-medium">{t("quizzes.statusDraft")}</span>;
      case 'closed': return <span className="px-2 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-md text-xs font-medium">{t("quizzes.statusClosed")}</span>;
      default: return null;
    }
  };

  const handleEditQuiz = async () => {
    if (!editingQuiz || !editingQuiz.title || !editingQuiz.subject) {
      toast.warning("Vui lòng nhập tên và môn học bài kiểm tra!");
      return;
    }
    try {
      await apiFetch(`/quizzes/${editingQuiz.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editingQuiz.title,
          subject: editingQuiz.subject
        })
      });
      toast.success("Cập nhật bài kiểm tra thành công!");
      setIsEditDialogOpen(false);
      loadQuizzes();
    } catch { toast.error(t("quizzes.editError") || "Lỗi cập nhật bài kiểm tra"); }
  };

  const handleCreateShare = async () => {
    if (!shareConfig.title) {
      toast.warning("Vui lòng nhập tên chiến dịch chia sẻ!");
      return;
    }
    try {
      await apiFetch("/shares", {
        method: "POST",
        body: JSON.stringify(shareConfig)
      });
      toast.success("Tạo link chia sẻ thành công!");
      setIsShareDialogOpen(false);
      // Optional: Redirect them to Sharing page or encourage them to view it
      setTimeout(() => window.location.href = '/sharing', 1000);
    } catch (err: any) {
      toast.error("Lỗi khi tạo chia sẻ: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("quizzes.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("quizzes.subtitle")}</p>
        </div>
        <Link href="/quizzes/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            {t("quizzes.createNew")}
          </Button>
        </Link>
      </div>

      <div className="bg-background rounded-xl shadow-sm border overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b bg-muted/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={t("quizzes.searchPlaceholder")} 
              className="pl-9 h-10 w-full bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 w-full sm:w-auto bg-muted p-1 rounded-lg">
            {[
              { value: "all", label: t("common.filter") || "Tất cả" },
              { value: "published", label: t("quizzes.statusPublished") },
              { value: "draft", label: t("quizzes.statusDraft") },
              { value: "closed", label: t("quizzes.statusClosed") },
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  statusFilter === tab.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="divide-y divide-slate-100 px-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-5 flex flex-col sm:flex-row gap-6 items-start sm:items-center px-2 -mx-2">
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-3/4 max-w-sm" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0 opacity-50">
                  <Skeleton className="h-9 w-28 rounded-md" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && <div className="p-8 text-center text-rose-500">{error}</div>}

        {/* Quiz List */}
        {!loading && !error && quizzes.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">{t("quizzes.noQuizzes")}</h3>
            <p className="text-muted-foreground mb-4 text-sm">{t("quizzes.noQuizzesDesc")}</p>
            <Link href="/quizzes/create">
              <Button variant="outline" className="text-indigo-600 border-indigo-200">{t("quizzes.createNow")}</Button>
            </Link>
          </div>
        )}

        {!loading && !error && quizzes.length > 0 && (() => {
          const filtered = quizzes
            .filter(q => statusFilter === "all" || q.status === statusFilter)
            .filter(q => !search || q.title.toLowerCase().includes(search.toLowerCase()) || (q.subject && q.subject.toLowerCase().includes(search.toLowerCase())));
          
          if (filtered.length === 0) return (
            <div className="p-12 text-center" key="no-filter-results">
              <p className="text-muted-foreground text-sm">Không tìm thấy bài kiểm tra phù hợp.</p>
              <button onClick={() => { setSearch(""); setStatusFilter("all"); }} className="mt-3 text-sm text-indigo-600 hover:underline">Xóa bộ lọc</button>
            </div>
          );

          return (
          <div className="divide-y divide-slate-100 px-4" key="quiz-list">
            {filtered.map((quiz) => (
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
                      {t("quizzes.subjectLabel")}: {quiz.subject}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto sm:justify-end">
                  {quiz.status === 'published' && (
                    <Button variant="outline" size="sm" className="gap-2 text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 w-full sm:w-auto" onClick={() => window.open(`/test/${quiz.id}`, '_blank')}>
                      <Play className="w-4 h-4" /> {t("quizzes.startExam")}
                    </Button>
                  )}
                  {quiz.status === 'draft' && (
                    <Button variant="outline" size="sm" className="gap-2 text-muted-foreground w-full sm:w-auto" onClick={() => window.location.href = `/quizzes/create?edit=${quiz.id}`}>
                      <Edit2 className="w-4 h-4" /> {t("quizzes.continueDraft")}
                    </Button>
                  )}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger className="h-9 w-9 p-0 flex items-center justify-center rounded-md border bg-background hover:bg-muted text-muted-foreground shrink-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="gap-2" onClick={() => { setEditingQuiz(quiz); setIsEditDialogOpen(true); }}>
                        <Edit2 className="w-4 h-4 text-slate-400"/> Cài đặt bài kiểm tra
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => { 
                        setShareConfig({ quiz_id: quiz.id, title: `Chia sẻ: ${quiz.title}`, type: "public" });
                        setIsShareDialogOpen(true);
                      }}>
                        <Share2 className="w-4 h-4 text-slate-400"/> Chia sẻ bài test
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={async () => {
                        try {
                          await apiFetch('/quizzes', { method: 'POST', body: JSON.stringify({ title: quiz.title + ' (Copy)', subject: quiz.subject, status: 'draft' }) });
                          loadQuizzes();
                          toast.success(t("quizzes.duplicateSuccess"));
                        } catch { toast.error(t("quizzes.duplicateError")); }
                      }}><Copy className="w-4 h-4 text-slate-400"/> {t("quizzes.duplicate")}</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => {
                        setShareConfig({ quiz_id: quiz.id, title: `Giao lớp: ${quiz.title}`, type: "class" });
                        setIsShareDialogOpen(true);
                      }}><Users className="w-4 h-4 text-slate-400"/> {t("quizzes.assignClass")}</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 text-rose-600 focus:text-rose-600" onClick={async () => {
                          const ok = await confirm({
                            title: "Xóa bài kiểm tra",
                            description: `Bạn có chắc muốn xóa bài kiểm tra này? Tất cả dữ liệu bài nộp liên quan cũng sẽ bị mất.`,
                            confirmLabel: "Xóa",
                            variant: "danger"
                          });
                          if (!ok) return;
                        try {
                          await apiFetch(`/quizzes/${quiz.id}`, { method: 'DELETE' });
                          setQuizzes(prev => prev.filter(q => q.id !== quiz.id));
                          toast.success(t("quizzes.deleteSuccess"));
                        } catch { toast.error(t("quizzes.deleteError")); }
                      }}><Trash2 className="w-4 h-4"/> {t("quizzes.deleteQuiz")}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
          );
        })()}
      </div>

      {/* Edit Quiz Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cài đặt bài kiểm tra</DialogTitle>
            <DialogDescription>Thay đổi thông tin cơ bản của bài kiểm tra.</DialogDescription>
          </DialogHeader>
          {editingQuiz && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-q-title">Tên bài kiểm tra</Label>
                <Input 
                  id="edit-q-title" 
                  value={editingQuiz.title} 
                  onChange={(e) => setEditingQuiz({...editingQuiz, title: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-q-subject">Môn học</Label>
                <Input 
                  id="edit-q-subject" 
                  value={editingQuiz.subject} 
                  onChange={(e) => setEditingQuiz({...editingQuiz, subject: e.target.value})} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleEditQuiz} className="bg-indigo-600 hover:bg-indigo-700 text-white">{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tạo link chia sẻ bài test</DialogTitle>
            <DialogDescription>Chia sẻ bài kiểm tra này cho học sinh hoặc lớp học.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="s_title">Tên chiến dịch chia sẻ</Label>
              <Input 
                id="s_title" 
                value={shareConfig.title} 
                onChange={(e) => setShareConfig({...shareConfig, title: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s_type">Phạm vi chia sẻ</Label>
              <select 
                id="s_type" 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={shareConfig.type} 
                onChange={(e) => setShareConfig({...shareConfig, type: e.target.value})}
              >
                <option value="public">Công khai (Bất kỳ ai có link)</option>
                <option value="class">Nội bộ (Chỉ lớp được chỉ định)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleCreateShare} className="bg-indigo-600 hover:bg-indigo-700 text-white">Tạo link chia sẻ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Ensure Input is defined locally since we dropped the import for brevity
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`} />
}
