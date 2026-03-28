"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, StickyNote, Search, MoreVertical, Pin, Trash2, Edit2, Loader2, Save } from "lucide-react";
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
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/context/LanguageContext";

export default function NotesPage() {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);

  const loadNotes = async () => {
    try {
      const data = await apiFetch("/notes");
      if (data && Array.isArray(data)) setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) return toast.error(t("notes.required"));
    try {
      const colors = [
        "bg-amber-50 border-amber-200", 
        "bg-emerald-50 border-emerald-200", 
        "bg-blue-50 border-blue-200", 
        "bg-violet-50 border-violet-200", 
        "bg-rose-50 border-rose-200"
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const newNote = await apiFetch("/notes", {
        method: "POST",
        body: JSON.stringify({ title: newTitle, content: newContent, color, pinned: false })
      });
      setNotes([newNote, ...notes]);
      setIsCreating(false);
      setNewTitle("");
      setNewContent("");
      toast.success(t("notes.createSuccess"));
    } catch (err) {
      toast.error(t("notes.createError"));
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await apiFetch(`/notes/${id}`, { method: "DELETE" });
      setNotes(notes.filter(n => n.id !== id));
      toast.success(t("notes.deleteSuccess"));
    } catch (err) {
      toast.error(t("dashboard.notes.deleteError"));
    }
  };

  const togglePin = async (id: string) => {
    try {
      await apiFetch(`/notes/${id}/pin`, { method: "PATCH" });
      setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
      toast.success(t("notes.pinSuccess"));
    } catch (err) {
      toast.error(t("dashboard.notes.pinError"));
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote || !editingNote.title.trim() || !editingNote.content.trim()) {
      toast.error(t("notes.required"));
      return;
    }
    try {
      await apiFetch(`/notes/${editingNote.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: editingNote.title,
          content: editingNote.content
        })
      });
      setNotes(notes.map(n => n.id === editingNote.id ? { ...n, title: editingNote.title, content: editingNote.content } : n));
      setIsEditing(false);
      setEditingNote(null);
      toast.success(t("dashboard.notes.updateSuccess"));
    } catch (err) {
      toast.error(t("dashboard.notes.updateError"));
    }
  };

  const filtered = notes.filter(n => 
    n.title?.toLowerCase().includes(search.toLowerCase()) || 
    n.content?.toLowerCase().includes(search.toLowerCase())
  );

  const pinned = filtered.filter(n => n.pinned);
  const unpinned = filtered.filter(n => !n.pinned);

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">{t("notes.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("notes.subtitle")}</p>
        </div>
        {!isCreating && (
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4" /> {t("notes.create")}
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="border-indigo-200 border-2 shadow-sm animate-in fade-in slide-in-from-top-2">
          <CardHeader className="py-3 bg-indigo-50/50">
            <input 
              className="text-lg font-bold bg-transparent outline-none placeholder:text-slate-400" 
              placeholder={t("notes.titlePlaceholder")} 
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              autoFocus
            />
          </CardHeader>
          <CardContent className="pt-2 pb-3">
            <textarea 
               className="w-full text-sm bg-transparent outline-none resize-y min-h-[80px]" 
               placeholder={t("notes.contentPlaceholder")}
               value={newContent}
               onChange={e => setNewContent(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>{t("notes.cancel")}</Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 gap-1" onClick={handleCreate}><Save className="w-4 h-4" /> {t("notes.save")}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder={t("notes.searchPlaceholder")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-10 w-full rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3"
        />
      </div>

      {pinned.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            <Pin className="w-3.5 h-3.5" /> {t("notes.pinned")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinned.map(note => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} onTogglePin={togglePin} onEdit={(n) => { setEditingNote(n); setIsEditing(true); }} t={t} />
            ))}
          </div>
        </>
      )}

      {unpinned.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-2">
            <StickyNote className="w-3.5 h-3.5" /> {t("notes.other")}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinned.map(note => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} onTogglePin={togglePin} onEdit={(n) => { setEditingNote(n); setIsEditing(true); }} t={t} />
            ))}
          </div>
        </>
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa ghi chú</DialogTitle>
            <DialogDescription>{t("notes.editDesc")}</DialogDescription>
          </DialogHeader>
          {editingNote && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-note-title">Tiêu đề</Label>
                <input 
                  id="edit-note-title"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-note-content">{t("notes.labelContent")}</Label>
                <textarea 
                  id="edit-note-content"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>{t("notes.cancel") || "Hủy"}</Button>
            <Button onClick={handleUpdateNote} className="bg-indigo-600 hover:bg-indigo-700 text-white">{t("notes.save") || "Lưu"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NoteCard({ note, onDelete, onTogglePin, onEdit, t }: { note: any; onDelete: (id: string) => void; onTogglePin: (id: string) => void; onEdit: (note: any) => void; t: any }) {
  return (
    <Card className={`shadow-sm hover:shadow-md transition-all border ${note.color} group`}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-base font-bold">{note.title}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {note.created_at ? new Date(note.created_at).toLocaleDateString("vi-VN") : "Hôm nay"}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-background/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2" onClick={() => onTogglePin(note.id)}>
              <Pin className="w-4 h-4" /> {note.pinned ? t("notes.unpin") : t("notes.pin")}
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2" onClick={() => onEdit(note)}>
              <Edit2 className="w-4 h-4" /> Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => onDelete(note.id)}>
              <Trash2 className="w-4 h-4" /> {t("notes.delete")}
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
