"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy, QrCode, Link2, Users, Check, ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";

const sharedQuizzes = [
  { id: "1", title: "Kiểm tra Toán HK2", shareCode: "TN-2026-001", url: "https://2know.edu.vn/test/abc123", accessCount: 45, status: "active", type: "public" },
  { id: "2", title: "Khảo sát Tiếng Anh B1", shareCode: "EN-2026-042", url: "https://2know.edu.vn/test/def456", accessCount: 120, status: "active", type: "public" },
  { id: "3", title: "Bài tập Đạo hàm nâng cao", shareCode: "TN-2026-003", url: "https://2know.edu.vn/test/ghi789", accessCount: 38, status: "expired", type: "class" },
  { id: "4", title: "Kiểm tra Lý 45 phút", shareCode: "LY-2026-008", url: "https://2know.edu.vn/test/jkl012", accessCount: 22, status: "active", type: "class" },
];

export default function SharingPage() {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Đã sao chép liên kết!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = sharedQuizzes.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) ||
    q.shareCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight dark:text-white">Bộ chia sẻ</h1>
          <p className="text-muted-foreground mt-1 text-sm">Quản lý liên kết, mã truy cập và QR code cho các bài kiểm tra đã chia sẻ.</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => toast.info("Hãy tạo bài kiểm tra trước để chia sẻ!")}>
          <Share2 className="w-4 h-4" /> Chia sẻ mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Đang chia sẻ", value: sharedQuizzes.filter(q => q.status === "active").length, icon: Share2, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950" },
          { label: "Tổng lượt truy cập", value: sharedQuizzes.reduce((a, q) => a + q.accessCount, 0), icon: Users, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950" },
          { label: "Liên kết công khai", value: sharedQuizzes.filter(q => q.type === "public").length, icon: Link2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
          { label: "Chia sẻ qua lớp", value: sharedQuizzes.filter(q => q.type === "class").length, icon: QrCode, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950" },
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
          placeholder="Tìm bài kiểm tra hoặc mã chia sẻ..."
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
                    <span className="font-mono">{quiz.shareCode}</span>
                    <span>•</span>
                    <span>{quiz.accessCount} lượt truy cập</span>
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
                    {copiedId === quiz.id ? "Đã sao chép" : "Sao chép"}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1.5 flex-1 sm:flex-none">
                    <ExternalLink className="w-3.5 h-3.5" /> Mở
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
