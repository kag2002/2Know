"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Users, School, ChevronRight, MoreVertical, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ClassItem {
  id: string;
  name: string;
  grade: string;
  subject: string;
  school_year: string;
  students?: { id: string }[];
  created_at: string;
}

export default function ClassesPage() {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClass, setNewClass] = useState({ name: "", subject: "", grade: "", school_year: "2025-2026" });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/classes");
      setClasses(Array.isArray(data) ? data : []);
    } catch {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClass.name || !newClass.subject || !newClass.grade) {
      toast.warning("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    
    setLoading(true);
    try {
      await apiFetch("/classes", {
        method: "POST",
        body: JSON.stringify(newClass),
      });
      toast.success(`Đã tạo lớp "${newClass.name}" thành công!`);
      setIsDialogOpen(false);
      setNewClass({ name: "", subject: "", grade: "", school_year: "2025-2026" });
      loadClasses();
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
      setLoading(false);
    }
  };

  const handleEditClass = async () => {
    if (!editingClass || !editingClass.name || !editingClass.subject) {
      toast.warning("Vui lòng điền đủ thông tin!");
      return;
    }
    try {
      await apiFetch(`/classes/${editingClass.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editingClass.name,
          subject: editingClass.subject,
          grade: editingClass.grade,
        }),
      });
      toast.success("Cập nhật thông tin lớp thành công!");
      setIsEditDialogOpen(false);
      loadClasses();
    } catch (err: any) {
      toast.error("Lỗi cập nhật: " + err.message);
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">{t("classes.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("classes.subtitle")}
          </p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 bg-background dark:bg-card flex-1 sm:flex-none">
            <Filter className="w-4 h-4" /> Lọc
          </Button>

          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white flex-1 sm:flex-none" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" /> {t("classes.createNew")}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tạo lớp học mới</DialogTitle>
                <DialogDescription>
                  Điền các thông tin cơ bản để khởi tạo một lớp học mới trên hệ thống.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Tên lớp học</Label>
                  <Input 
                    id="name" 
                    placeholder="VD: 12A1" 
                    value={newClass.name} 
                    onChange={(e) => setNewClass({...newClass, name: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grade">Khối / Năm học</Label>
                  <Input 
                    id="grade" 
                    placeholder="VD: Lớp 12" 
                    value={newClass.grade} 
                    onChange={(e) => setNewClass({...newClass, grade: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Môn học phụ trách</Label>
                  <Input 
                    id="subject" 
                    placeholder="VD: Toán đại số" 
                    value={newClass.subject} 
                    onChange={(e) => setNewClass({...newClass, subject: e.target.value})} 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleCreateClass} className="bg-indigo-600 hover:bg-indigo-700 text-white">Xác nhận tạo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card p-4 border rounded-xl shadow-sm">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={t("classes.searchPlaceholder")} 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-10 bg-muted/50 border-transparent focus:bg-background transition-colors"
          />
        </div>
        <div className="hidden sm:block h-6 w-px bg-border"></div>
        <div className="flex gap-6 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs uppercase font-semibold">{t("classes.totalClasses")}</span>
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
                      <DropdownMenuItem onClick={() => { setEditingClass(cls); setIsEditDialogOpen(true); }}>{t("classes.editInfo")}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = `/reports`}>{t("classes.benchmarkReport")}</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={async () => {
                        if (!confirm(t("classes.confirmDelete"))) return;
                        try {
                          await apiFetch(`/classes/${cls.id}`, { method: 'DELETE' });
                          setClasses(prev => prev.filter(c => c.id !== cls.id));
                          toast.success(t("classes.deleteSuccess"));
                        } catch { toast.error(t("classes.deleteError")); }
                      }}>{t("classes.archiveClass")}</DropdownMenuItem>
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
            onClick={handleCreateClass}
          >
            <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="font-semibold">{t("classes.createNewCard")}</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px] text-center">{t("classes.createNewCardDesc")}</p>
          </div>
        </div>
      )}

      {/* Edit Class Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lớp học</DialogTitle>
            <DialogDescription>Thay đổi thông tin cơ bản của lớp học này.</DialogDescription>
          </DialogHeader>
          {editingClass && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Tên lớp học</Label>
                <Input 
                  id="edit-name" 
                  value={editingClass.name} 
                  onChange={(e) => setEditingClass({...editingClass, name: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-grade">Khối / Năm học</Label>
                <Input 
                  id="edit-grade" 
                  value={editingClass.grade} 
                  onChange={(e) => setEditingClass({...editingClass, grade: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-subject">Môn học phụ trách</Label>
                <Input 
                  id="edit-subject" 
                  value={editingClass.subject} 
                  onChange={(e) => setEditingClass({...editingClass, subject: e.target.value})} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleEditClass} className="bg-indigo-600 hover:bg-indigo-700 text-white">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
