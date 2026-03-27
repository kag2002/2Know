"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MoreHorizontal, FolderCode, Tags } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

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
          {['Toán Đại Số 12', 'Hình Học Không Gian', 'Vật Lý Nâng Cao', 'Tiếng Anh B1'].map(folder => (
            <button key={folder} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors text-left">
              <FolderCode className="w-4 h-4 text-slate-400" />
              {folder}
            </button>
          ))}
          
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-6 mb-3 px-2">{t("questionBank.tagFilter")}</div>
          <div className="flex flex-wrap gap-2 px-2">
            {['#kho', '#trung-binh', '#de', '#thi-thu', '#chuong1'].map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-1 bg-slate-100 hover:bg-accent text-muted-foreground text-[11px] font-semibold rounded-md cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
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
                {questions.map((q) => (
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
                          <DropdownMenuItem onClick={() => window.location.href = '/question-bank/create'}>{t("edit")}</DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => {
                            try {
                              await apiFetch('/questions', { method: 'POST', body: JSON.stringify({ content: q.content + ' (Copy)', type: q.type, quiz_id: q.id }) });
                              loadQuestions();
                              toast.success(t("questionBank.cloneSuccess"));
                            } catch { toast.error(t("questionBank.cloneError")); }
                          }}>{t("questionBank.clone")}</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600" onClick={async () => {
                            if (!confirm(t("questionBank.confirmDelete"))) return;
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
    </div>
  );
}
