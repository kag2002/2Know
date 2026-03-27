"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, QrCode, Link2, Users, Check, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "@/context/LanguageContext";
import { apiFetch } from "@/lib/api";

export interface ShareData {
  id: string;
  quiz_id: string;
  title: string;
  share_code: string;
  url: string;
  access_count: number;
  status: string;
  type: string;
  created_at: string;
}

export default function SharingPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharedQuizzes, setSharedQuizzes] = useState<ShareData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/shares");
      setSharedQuizzes(data || []);
    } catch {
      toast.error("Không thể tải danh sách chia sẻ");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success(t("sharing.copySuccess"));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = sharedQuizzes.filter(q =>
    (q.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (q.share_code || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">{t("sharing.title")}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{t("sharing.subtitle")}</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => window.location.href = '/quizzes'}>
          <Share2 className="w-4 h-4" /> {t("sharing.shareNew")}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t("sharing.activeShares"), value: sharedQuizzes.filter(q => q.status === "active").length, icon: Share2, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950" },
          { label: t("sharing.totalAccess"), value: sharedQuizzes.reduce((a, q) => a + q.access_count, 0), icon: Users, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: t("sharing.publicLinks"), value: sharedQuizzes.filter(q => q.type === "public").length, icon: Link2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
          { label: t("sharing.classShares"), value: sharedQuizzes.filter(q => q.type === "class").length, icon: QrCode, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          placeholder={t("sharing.searchPlaceholder")}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-10 w-full rounded-md border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3"
        />
      </div>

      {/* Share List */}
      <div className="space-y-3">
        {filtered.map(quiz => (
          <Card key={quiz.id} className="shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{quiz.title}</h3>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${quiz.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-muted-foreground"}`}>
                      {quiz.status === "active" ? "Đang mở" : "Hết hạn"}
                    </span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${quiz.type === "public" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {quiz.type === "public" ? "Công khai" : "Theo lớp"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">{quiz.share_code}</span>
                    <span>•</span>
                    <span>{quiz.access_count} lượt truy cập</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5 flex-1 sm:flex-none"
                    onClick={() => copyLink(quiz.id, quiz.url)}
                  >
                    {copiedId === quiz.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === quiz.id ? t("sharing.copied") : t("sharing.copy")}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 flex-1 sm:flex-none">
                    <ExternalLink className="w-3.5 h-3.5" /> {t("sharing.open")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
