"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreHorizontal, FolderCode, Tags } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/context/LanguageContext";
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
import { Input } from "@/components/ui/input";

interface Question {
  id: string;
  type: string;
  content: string;
  folder: string;
  difficulty: string;
  tags: string[];
}

export default function QuestionBankPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/questions");
      setQuestions(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = async () => {
    if (!editingQuestion || !editingQuestion.content) {
      toast.warning("Nội dung câu hỏi không được để trống!");
      return;
    }
    setLoading(true);
    try {
      await apiFetch(`/questions/${editingQuestion.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          content: editingQuestion.content,
          difficulty: editingQuestion.difficulty,
          folder: editingQuestion.folder
        })
      });
      toast.success("Cập nhật câu hỏi thành công!");
      setIsEditDialogOpen(false);
      loadQuestions();
    } catch {
      toast.error("Lỗi khi cập nhật câu hỏi");
      setLoading(false);
    }
  };

  // Dynamic Sets
  const folders = useMemo(() => Array.from(new Set(questions.filter(q => q.folder).map(q => q.folder))), [questions]);
  const tags = useMemo(() => Array.from(new Set(questions.flatMap(q => q.tags || []))), [questions]);

  // Filtered Data
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchesSearch = q.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFolder = selectedFolder ? q.folder === selectedFolder : true;
      const matchesTag = selectedTag ? q.tags?.includes(selectedTag) : true;
      return matchesSearch && matchesFolder && matchesTag;
    });
  }, [questions, searchQuery, selectedFolder, selectedTag]);

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
      
      {/* Sidebar Filters */}
      <div className="w-64 shrink-0 flex flex-col gap-6 hidden md:flex h-full">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("questionBank.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("questionBank.subtitle")}</p>
        </div>

        <Link href="/question-bank/create">
          <Button className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
            <Plus className="w-4 h-4" /> {t("questionBank.addNew")}
          </Button>
        </Link>
        
        {/* Navigations/Folders */}
        <div className="space-y-1 overflow-y-auto flex-1 pr-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">{t("questionBank.folders")}</div>
          <button 
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${!selectedFolder ? 'text-indigo-600 bg-indigo-50' : 'text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50/50'}`}
            onClick={() => setSelectedFolder(null)}
          >
            <FolderCode className="w-4 h-4 text-slate-400" />
            Tất cả thư mục
          </button>
          
          {folders.map(folder => (
            <button 
              key={folder} 
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors text-left ${selectedFolder === folder ? 'text-indigo-600 bg-indigo-50' : 'text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50/50'}`}
              onClick={() => setSelectedFolder(folder)}
            >
              <FolderCode className="w-4 h-4 text-slate-400" />
              {folder}
            </button>
          ))}
          
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-8 mb-3 px-2 flex items-center justify-between">
            {t("questionBank.tagFilter")}
            {selectedTag && <span className="text-[10px] text-rose-500 cursor-pointer hover:underline" onClick={() => setSelectedTag(null)}>{t("common.clearFilterSmall")}</span>}
          </div>
          <div className="flex flex-wrap gap-2 px-2">
            {tags.map(tag => (
              <span 
                key={tag} 
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`inline-flex items-center px-2 py-1 text-[11px] font-semibold rounded-md cursor-pointer transition-colors ${selectedTag === tag ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300' : 'bg-slate-100 hover:bg-slate-200 text-muted-foreground'}`}
              >
                {tag}
              </span>
            ))}
            {tags.length === 0 && <span className="text-xs text-muted-foreground px-1">Chưa có thẻ</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background border shadow-sm rounded-xl overflow-hidden relative">
        {/* Toolbar */}
        <div className="p-4 border-b bg-muted/80 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("questionBank.searchPlaceholder")} 
              className="w-full pl-9 h-10 border border-input rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2 bg-background">
              <Filter className="w-4 h-4" /> {t("filter")}
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3 animate-pulse" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="w-5 h-5 bg-slate-200 rounded" />
                  <div className="w-20 h-6 bg-slate-200 rounded-md" />
                  <div className="flex-1 h-5 bg-slate-200 rounded-md" />
                  <div className="w-16 h-6 bg-slate-200 rounded-md" />
                  <div className="w-24 h-5 bg-slate-200 rounded-md" />
                  <div className="w-8 h-8 bg-slate-200 rounded-md" />
                </div>
              ))}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-card-foreground mb-1">
                {(searchQuery || selectedFolder || selectedTag) ? "Không tìm thấy kết quả" : t("questionBank.noResults")}
              </h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                {(searchQuery || selectedFolder || selectedTag)
                  ? "Không có câu hỏi nào khớp với bộ lọc hiện tại."
                  : "Bắt đầu bằng cách thêm câu hỏi đầu tiên vào Ngân hàng."}
              </p>
              {(searchQuery || selectedFolder || selectedTag) ? (
                <button
                  onClick={() => { setSearchQuery(""); setSelectedFolder(null); setSelectedTag(null); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              ) : (
                <a href="/question-bank/create" className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                  Thêm câu hỏi mới
                </a>
              )}
            </div>
          ) : questions.length === 0 ? (
             <div className="p-12 text-center text-muted-foreground">{t("questionBank.noResults")}</div>
          ) : (
            <Table>
              <TableHeader className="bg-background sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[50px] text-center">
                    <input type="checkbox" className="rounded border-border" />
                  </TableHead>
                  <TableHead className="w-[100px] font-semibold">{t("questionBank.type")}</TableHead>
                  <TableHead className="font-semibold">{t("questionBank.content")}</TableHead>
                  <TableHead className="font-semibold w-[150px]">{t("questionBank.difficulty")}</TableHead>
                  <TableHead className="font-semibold w-[120px]">{t("questionBank.folder")}</TableHead>
                  <TableHead className="text-right w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((q) => (
                  <TableRow key={q.id} className="hover:bg-muted/50 group cursor-pointer transition-colors">
                    <TableCell className="text-center">
                      <input type="checkbox" className="rounded border-border" />
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex px-2 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold uppercase rounded-md whitespace-nowrap">
                        {q.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[400px]">
                        <p className="font-medium text-card-foreground line-clamp-2 leading-relaxed">
                          {q.content}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-1 text-[11px] font-semibold rounded-md ${
                        q.difficulty === 'Khó' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 
                        q.difficulty === 'Dễ' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {q.difficulty}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{q.folder || t("questionBank.uncategorized")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingQuestion(q); setIsEditDialogOpen(true); }}>{t("edit")}</DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => {
                            try {
                              await apiFetch('/questions', { method: 'POST', body: JSON.stringify({ content: q.content + ' (Copy)', type: q.type, quiz_id: q.id }) });
                              loadQuestions();
                              toast.success(t("questionBank.cloneSuccess"));
                            } catch { toast.error(t("questionBank.cloneError")); }
                          }}>{t("questionBank.clone")}</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600" onClick={async () => {
                            const ok = await confirm({
                              title: "Xóa câu hỏi",
                              description: "Bạn có chắc muốn xóa vĩnh viễn câu hỏi này khỏi Ngân hàng?",
                              confirmLabel: "Xóa vĩnh viễn",
                              variant: "danger"
                            });
                            if (!ok) return;
                            try {
                              await apiFetch(`/questions/${q.id}`, { method: 'DELETE' });
                              setQuestions(prev => prev.filter(x => x.id !== q.id));
                              toast.success(t("questionBank.deleteSuccess"));
                            } catch { toast.error(t("questionBank.deleteError")); }
                          }}>{t("questionBank.deletePermanent")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        {/* Pagination Footer */}
        <div className="p-3 border-t bg-muted/50 flex items-center justify-between text-xs text-muted-foreground">
          <div>{t("questionBank.showing")} <span className="font-medium text-foreground">{questions.length}</span> {t("questionBank.questions")}</div>
        </div>
      </div>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa câu hỏi</DialogTitle>
            <DialogDescription>Chỉnh sửa nội dung và phân loại của câu hỏi trong ngân hàng.</DialogDescription>
          </DialogHeader>
          {editingQuestion && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-q-content">{t("questionBank.labelContent")}</Label>
                <textarea 
                  id="edit-q-content" 
                  value={editingQuestion.content} 
                  onChange={(e) => setEditingQuestion({...editingQuestion, content: e.target.value})} 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-q-difficulty">{t("questionBank.labelDifficulty")}</Label>
                <select 
                  id="edit-q-difficulty" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={editingQuestion.difficulty} 
                  onChange={(e) => setEditingQuestion({...editingQuestion, difficulty: e.target.value})}
                >
                  <option value="Dễ">Dễ</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Khó">Khó</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-q-folder">Thư mục / Chuyên đề</Label>
                <Input 
                  id="edit-q-folder" 
                  value={editingQuestion.folder || ''} 
                  onChange={(e) => setEditingQuestion({...editingQuestion, folder: e.target.value})} 
                  placeholder="VD: Toán học cơ bản"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={loading}>{t("common.cancel")}</Button>
            <Button onClick={handleEditQuestion} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
