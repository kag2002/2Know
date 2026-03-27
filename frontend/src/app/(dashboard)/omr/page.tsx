"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, Scan, Printer, FileText, CheckCircle2, History, Trash2, Smartphone, Edit2 } from "lucide-react";
import Link from "next/link";
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
import { apiFetch } from "@/lib/api";

export interface OmrBatch {
  id: string;
  title: string;
  template: string;
  sheets_scanned: number;
  total_sheets: number;
  status: string;
  created_at: string;
}

export default function OmrPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({ title: `Đợt chấm điểm ${new Date().toLocaleDateString('vi-VN')}`, template: "Mẫu 50 câu (A4)" });
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<OmrBatch | null>(null);

  const [batches, setBatches] = useState<OmrBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/omr/batches");
      setBatches(data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách đợt chấm");
    } finally {
      setLoading(false);
    }
  };

  const filtered = batches.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa đợt quét OMR này?")) return;
    try {
      await apiFetch(`/omr/batches/${id}`, { method: 'DELETE' });
      setBatches(batches.filter(b => b.id !== id));
      toast.success(t("omr.deleteSuccess"));
    } catch {
      toast.error("Lỗi xóa đợt quét");
    }
  };

  const handleCreate = async () => {
    if (!newBatch.title) {
      toast.warning("Vui lòng nhập tên đợt chấm điểm!");
      return;
    }
    
    try {
      await apiFetch("/omr/batches", {
        method: 'POST',
        body: JSON.stringify(newBatch)
      });
      toast.success(t("omr.createSuccess"));
      setIsDialogOpen(false);
      setNewBatch({ title: `Đợt chấm điểm ${new Date().toLocaleDateString('vi-VN')}`, template: "Mẫu 50 câu (A4)" });
      loadBatches();
    } catch {
      toast.error("Lỗi tạo đợt chấm");
    }
  };

  const handleEditBatch = async () => {
    if (!editingBatch || !editingBatch.title) {
      toast.warning("Vui lòng nhập tên đợt chấm điểm!");
      return;
    }
    try {
      await apiFetch(`/omr/batches/${editingBatch.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: editingBatch.title,
          template: editingBatch.template
        })
      });
      toast.success("Cập nhật đợt quét OMR thành công!");
      setIsEditDialogOpen(false);
      loadBatches();
    } catch {
      toast.error("Lỗi cập nhật đợt quét");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">{t("omr.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("omr.subtitle")}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
          <Button variant="outline" className="gap-2 bg-card flex-1 sm:flex-none" onClick={() => window.open('/omr-template.pdf', '_blank')}>
            <Printer className="w-4 h-4" /> {t("omr.printTemplate")}
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white flex-1 sm:flex-none" disabled={loading} onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4" /> {t("omr.createBatch")}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tạo đợt chấm OMR</DialogTitle>
                <DialogDescription>
                  Khởi tạo một đợt chấm điểm mới để nhóm các phiếu thi (Scanner) chung với nhau. 
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="b_title">Tên đợt chấm</Label>
                  <Input 
                    id="b_title" 
                    placeholder="VD: Kiểm tra 15p Toán đại" 
                    value={newBatch.title} 
                    onChange={(e) => setNewBatch({...newBatch, title: e.target.value})} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="b_template">Mẫu phiếu (Template)</Label>
                  <select 
                    id="b_template" 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newBatch.template} 
                    onChange={(e) => setNewBatch({...newBatch, template: e.target.value})}
                  >
                    <option value="Mẫu 50 câu (A4)">Mẫu 50 câu (A4)</option>
                    <option value="Mẫu 40 câu (Tự luận)">Mẫu kết hợp 40 MCQ + Tự luận</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">Xác nhận tạo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex flex-col justify-center relative overflow-hidden">
            <Scan className="w-5 h-5 text-indigo-500 mb-2 relative z-10" />
            <p className="text-3xl font-bold relative z-10">{batches.length}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase mt-1 relative z-10">Đợt chấm điểm</p>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-xl z-0"></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex flex-col justify-center relative overflow-hidden">
            <FileText className="w-5 h-5 text-emerald-500 mb-2 relative z-10" />
            <p className="text-3xl font-bold relative z-10">{batches.reduce((a, b) => a + b.sheets_scanned, 0)}</p>
            <p className="text-xs font-medium text-muted-foreground uppercase mt-1 relative z-10">Phiếu đã quét</p>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-xl z-0"></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex flex-col justify-center relative overflow-hidden">
            <CheckCircle2 className="w-5 h-5 text-amber-500 mb-2 relative z-10" />
            <p className="text-3xl font-bold relative z-10">99.8%</p>
            <p className="text-xs font-medium text-muted-foreground uppercase mt-1 relative z-10">Độ chính xác AI</p>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full blur-xl z-0"></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-indigo-600 text-white border-0 shadow-lg shadow-indigo-600/20">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            <Smartphone className="w-8 h-8 mb-3 opacity-90" />
            <p className="text-sm font-semibold mb-1">Mở app điện thoại</p>
            <p className="text-xs text-indigo-200">Quét OMR siêu tốc bằng ứng dụng 2Know Scanner</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm đợt chấm điểm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card focus:bg-background h-10 transition-colors"
          />
        </div>
        <Button variant="outline" className="gap-2 bg-card shrink-0">
          <Filter className="w-4 h-4 text-muted-foreground" /> Trạng thái
        </Button>
      </div>

      <div className="space-y-4">
        {filtered.map(batch => (
          <Card key={batch.id} className="shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-semibold text-lg text-foreground">{batch.title}</h3>
                    {batch.status === "completed" && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Hoàn tất</span>}
                    {batch.status === "scanning" && <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>Đang quét</span>}
                    {batch.status === "ready" && <span className="px-2 py-0.5 rounded-full bg-slate-100 text-muted-foreground dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider">Chờ quét</span>}
                  </div>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1.5">
                      <span>{new Date(batch.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      <span>Mẫu: {batch.template}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row items-center gap-6 shrink-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                  {/* Progress Ring */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
                        <path 
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="3" 
                          strokeDasharray={`${batch.total_sheets > 0 ? (batch.sheets_scanned / batch.total_sheets) * 100 : 0}, 100`}
                          className={batch.status === 'completed' ? 'text-emerald-500' : 'text-indigo-500'} 
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold">{batch.total_sheets > 0 ? Math.round((batch.sheets_scanned / batch.total_sheets) * 100) : 0}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-lg leading-none">{batch.sheets_scanned} <span className="text-sm font-normal text-muted-foreground">/ {batch.total_sheets}</span></span>
                      <span className="text-xs text-muted-foreground mt-1">phiếu đã quét</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/quizzes/${batch.id}/scan`}>
                      <Button variant={batch.status === "completed" ? "outline" : "default"} className={batch.status !== "completed" ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" : "bg-card"}>
                        {batch.status === "completed" ? "Xem kết quả" : "Quét tiếp"}
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2" onClick={() => { setEditingBatch(batch); setIsEditDialogOpen(true); }}><Edit2 className="w-4 h-4"/> Sửa đợt quét</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2" onClick={() => window.open('/reports', '_blank')}><Printer className="w-4 h-4"/> In bảng điểm</DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => handleDelete(batch.id)}><Trash2 className="w-4 h-4"/> Xóa đợt quét</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
            Chưa có đợt quét OMR nào.
          </div>
        )}
      </div>

      {/* Edit Batch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đợt quét OMR</DialogTitle>
            <DialogDescription>Thay đổi thông tin cơ bản của đợt quét này.</DialogDescription>
          </DialogHeader>
          {editingBatch && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-b-title">Tên đợt chấm</Label>
                <Input 
                  id="edit-b-title" 
                  value={editingBatch.title} 
                  onChange={(e) => setEditingBatch({...editingBatch, title: e.target.value})} 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-b-template">Mẫu phiếu (Template)</Label>
                <select 
                  id="edit-b-template" 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={editingBatch.template} 
                  onChange={(e) => setEditingBatch({...editingBatch, template: e.target.value})}
                >
                  <option value="Mẫu 50 câu (A4)">Mẫu 50 câu (A4)</option>
                  <option value="Mẫu 40 câu (Tự luận)">Mẫu kết hợp 40 MCQ + Tự luận</option>
                </select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleEditBatch} className="bg-indigo-600 hover:bg-indigo-700 text-white">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Quick component stub for MoreHorizontal
function MoreHorizontal(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
}
