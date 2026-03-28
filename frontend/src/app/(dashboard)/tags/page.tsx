"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Tags, Search, X, Hash, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/context/LanguageContext";

export default function TagsPage() {
  const { t } = useTranslation();
  const [tags, setTags] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTags = async () => {
    try {
      const data = await apiFetch("/tags");
      if (data && Array.isArray(data)) setTags(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const filtered = tags.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()));

  const addTag = async () => {
    if (!newTag.trim()) return;
    const colors = ["bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400", "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400", "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    try {
      const createdTag = await apiFetch("/tags", {
        method: "POST",
        body: JSON.stringify({ name: newTag.trim(), color, count: 0 })
      });
      setTags([createdTag, ...tags]);
      setNewTag("");
      toast.success(t("dashboard.tags.addSuccess").replace("{name}", newTag.trim()));
    } catch (err) {
      toast.error(t("tags.addError"));
    }
  };

  const deleteTag = async (id: string) => {
    try {
      await apiFetch(`/tags/${id}`, { method: "DELETE" });
      setTags(tags.filter(t => t.id !== id));
      toast.success(t("tags.deleteSuccess"));
    } catch (err) {
      toast.error(t("dashboard.tags.deleteError"));
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">{t("tags.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("tags.subtitle")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950"><Tags className="w-5 h-5 text-indigo-500" /></div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">{t("tags.totalTags")}</p>
              <p className="text-2xl font-bold">{tags.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950"><BarChart3 className="w-5 h-5 text-emerald-500" /></div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase">{t("tags.taggedQuestions")}</p>
              <p className="text-2xl font-bold">{tags.reduce((a, t) => a + t.count, 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder={t("tags.searchPlaceholder")}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10 w-full rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3"
          />
        </div>
        <div className="flex gap-2">
          <input
            placeholder={t("tags.newTagPlaceholder")}
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addTag()}
            className="h-10 w-48 rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3"
          />
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={addTag}>
            <Plus className="w-4 h-4" /> {t("tags.add")}
          </Button>
        </div>
      </div>

      {/* Tags Cloud */}
      <div className="flex flex-wrap gap-3">
        {filtered.map(tag => (
          <div 
            key={tag.id} 
            className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:shadow-md cursor-default ${tag.color}`}
          >
            <Hash className="w-3.5 h-3.5 opacity-50" />
            {tag.name}
            <span className="text-[10px] opacity-60 font-normal">({tag.count})</span>
            <button 
              onClick={() => deleteTag(tag.id)} 
              className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-sm py-8">{t("tags.noResults")}</p>
        )}
      </div>
    </div>
  );
}
