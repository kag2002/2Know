"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/context/LanguageContext";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { apiFetch } from "@/lib/api";

export interface RubricData {
  id: string;
  title: string;
  subject: string;
  target: string;
  criteria_count: number;
  usage_count: number;
  active: boolean;
  created_at: string;
}

export default function RubricsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [rubrics, setRubrics] = useState<RubricData[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRubric, setNewRubric] = useState({ title: "", subject: "", target: "", criteria_count: 3 });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRubric, setEditingRubric] = useState<RubricData | null>(null);

  useEffect(() => {
    loadRubrics();
  }, []);

  const loadRubrics = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/rubrics");
      setRubrics(data || []);
    } catch (err) {
      toast.error(t("dashboard.rubrics.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const filtered = rubrics.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: t("dashboard.rubrics.deleteConfirmTitle"),
      description: t("dashboard.rubrics.deleteConfirmDesc"),
      confirmLabel: t("dashboard.rubrics.deleteConfirmBtn"),
      variant: "danger"
    });
    if (!ok) return;
    try {
      await apiFetch(`/rubrics/${id}`, { method: 'DELETE' });
      setRubrics(rubrics.filter(r => r.id !== id));
      toast.success(t("rubrics.deleteSuccess"));
    } catch {
      toast.error(t("dashboard.rubrics.deleteError"));
    }
  };

  const handleCreate = async () => {
    if (!newRubric.title || !newRubric.subject) {
      toast.warning(t("dashboard.rubrics.requireNameSubject"));
      return;
    }
    
    try {
      await apiFetch("/rubrics", {
        method: 'POST',
        body: JSON.stringify(newRubric)
      });
      toast.success(t("rubrics.createSuccess"));
      setIsCreateDialogOpen(false);
      setNewRubric({ title: "", subject: "", target: "", criteria_count: 3 });
      loadRubrics();
    } catch {
      toast.error(t("dashboard.rubrics.createError"));
    }
  };

  const handleEditRubric = async () => {
    if (!editingRubric || !editingRubric.title || !editingRubric.subject) {
      toast.warning(t("dashboard.rubrics.requireAll"));
      return;
    }
    try {
      await apiFetch(`/rubrics/${editingRubric.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editingRubric.title,
          subject: editingRubric.subject,
          target: editingRubric.target,
        }),
      });
      toast.success(t("dashboard.rubrics.updateSuccess"));
      setIsEditDialogOpen(false);
      loadRubrics();
    } catch (err: any) {
      toast.error(t("dashboard.rubrics.updateError") + " " + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">{t("rubrics.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("rubrics.subtitle")}</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading} onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4" /> {t("rubrics.createNew")}
        </Button>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tạo Rubric mới</DialogTitle>
            <DialogDescription>Nhập thông tin cho bộ tiêu chí chấm điểm.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="c_title">Tên Rubric</Label>
              <Input 
                id="c_title" 
                placeholder="VD: Tiêu chí chấm văn tự luận"
                value={newRubric.title} 
                onChange={(e) => setNewRubric({...newRubric, title: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c_subject">Môn học</Label>
              <Input 
                id="c_subject" 
                placeholder="VD: Ngữ văn, Lịch sử..."
                value={newRubric.subject} 
                onChange={(e) => setNewRubric({...newRubric, subject: e.target.value})} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c_target">Đối tượng</Label>
              <Input 
                id="c_target" 
                placeholder="VD: Lớp 10 Chung"
                value={newRubric.target} 
                onChange={(e) => setNewRubric({...newRubric, target: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">Xác nhận tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex flex-col justify-center">
            <Library className="w-5 h-5 text-indigo-500 mb-2" />
            <p className="text-3xl font-bold">{rubrics.length}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase mt-1">{t("rubrics.totalRubrics")}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex flex-col justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-2" />
            <p className="text-3xl font-bold">{rubrics.filter(r => r.active).length}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase mt-1">{t("rubrics.activeCount")}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex flex-col justify-center">
            <PlayCircle className="w-5 h-5 text-amber-500 mb-2" />
            <p className="text-3xl font-bold">{rubrics.reduce((a, r) => a + r.usage_count, 0)}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase mt-1">{t("rubrics.usageCount")}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-dashed bg-muted/30 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toast.success(t("rubrics.exploreLibrarySuccess"))}>
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
            <div className="p-3 bg-card rounded-full shadow-sm mb-2"><Plus className="w-4 h-4 text-indigo-500" /></div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{t("rubrics.exploreLibrary")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("rubrics.searchPlaceholder")}
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
                    <DropdownMenuItem className="gap-2" onClick={() => { setEditingRubric(rubric); setIsEditDialogOpen(true); }}><Edit2 className="w-4 h-4"/> {t("rubrics.editCriteria")}</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2" onClick={async () => {
                      try {
                        await apiFetch("/rubrics", {
                          method: 'POST',
                          body: JSON.stringify({ title: rubric.title + " (Copy)", subject: rubric.subject, target: rubric.target, criteria_count: rubric.criteria_count })
                        });
                        loadRubrics();
                        toast.success(t("rubrics.cloneSuccess") || "Đã nhân bản Rubric");
                      } catch { toast.error("Lỗi nhân bản Rubric") }
                    }}><Copy className="w-4 h-4"/> {t("rubrics.duplicate")}</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => handleDelete(rubric.id)}><Trash2 className="w-4 h-4"/> Xóa</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-center gap-6 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  <span>{rubric.criteria_count} tiêu chí</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <PlayCircle className="w-4 h-4" />
                  <span>Đã dùng {rubric.usage_count} lần</span>
                </div>
                {rubric.active ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase ml-auto">{t("rubrics.statusActive")}</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-muted-foreground dark:bg-slate-800 text-[10px] font-bold uppercase ml-auto">{t("rubrics.statusDraft")}</span>
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
            {t("rubrics.noResults")}
          </div>
        )}
      </div>

      {/* Edit Rubric Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Rubric</DialogTitle>
            <DialogDescription>Thay đổi thông tin cơ bản của bộ tiêu chí chấm điểm này.</DialogDescription>
          </DialogHeader>
          {editingRubric && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-r-title">Tên Rubric</Label>
                <Input 
                  id="edit-r-title" 
                  value={editingRubric.title} 
                  onChange={(e) => setEditingRubric({...editingRubric, title: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-r-subject">Môn học</Label>
                <Input 
                  id="edit-r-subject" 
                  value={editingRubric.subject} 
                  onChange={(e) => setEditingRubric({...editingRubric, subject: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-r-target">Đối tượng áp dụng</Label>
                <Input 
                  id="edit-r-target" 
                  value={editingRubric.target} 
                  onChange={(e) => setEditingRubric({...editingRubric, target: e.target.value})} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleEditRubric} className="bg-indigo-600 hover:bg-indigo-700 text-white">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Quick component stub for MoreHorizontal since lucide-react export is sometimes finicky in auto-imports
function MoreHorizontal(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
}
