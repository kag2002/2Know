"use client";

import { RandomWheel } from "@/components/dashboard/RandomWheel";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Filter, Settings2, Download, History } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

interface SpinHistory {
  id: number;
  winner: string;
  action: "kept" | "removed";
  time: Date;
}

export default function RandomWheelPage() {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  
  // Custom manual list instead of locked students array
  const [inputText, setInputText] = useState<string>("");
  const [history, setHistory] = useState<SpinHistory[]>([]);

  // Parse items from textarea (split by newline, remove empty)
  const parsedItems = inputText.split("\n").map(x => x.trim()).filter(x => x.length > 0);

  useEffect(() => {
    apiFetch("/classes").then(data => {
      if (Array.isArray(data)) {
         setClasses(data);
         if (data.length > 0) setSelectedClass(data[0].id);
      }
    }).catch(() => {});
  }, []);

  // When clicking "Load Class", fetch students and populate textarea
  const loadClassIntoList = () => {
    if (!selectedClass) return;
    apiFetch(`/classes/${selectedClass}`).then(cls => {
       if (cls && cls.students) {
          const names = cls.students.map((s: any) => s.full_name || s.name);
          if (names.length > 0) {
            setInputText(names.join("\n"));
          }
       }
    }).catch(() => {});
  };

  const handleKeepWinner = (winner: string) => {
    setHistory(prev => [{ id: Date.now(), winner, action: "kept", time: new Date() }, ...prev]);
  };

  const handleWinnerRemoved = (winner: string) => {
    setHistory(prev => [{ id: Date.now(), winner, action: "removed", time: new Date() }, ...prev]);
    setInputText(prev => {
      const lines = prev.split("\n");
      const idx = lines.findIndex(l => l.trim() === winner);
      if (idx !== -1) {
        lines.splice(idx, 1);
      }
      return lines.join("\n");
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("sidebar.tools.wheel") || "Vòng Quay May Mắn"}</h1>
        <p className="text-muted-foreground mt-1">
          {t("wheel.subtitle") || "Quay ngẫu nhiên chọn người phát biểu, chia nhóm hoặc bốc thăm trúng thưởng."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="w-4 h-4 text-indigo-500" /> {t("wheel.config.title") || "Tùy chỉnh danh sách"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col h-[calc(100%-60px)] space-y-5">
               <div className="space-y-2">
                 <label className="text-sm font-semibold">{t("wheel.config.load_class") || "Tải nhanh từ Lớp học"}</label>
                 <div className="flex gap-2">
                   <select 
                     className="flex-1 text-sm p-2 bg-background border rounded-md"
                     value={selectedClass}
                     onChange={(e) => setSelectedClass(e.target.value)}
                   >
                     {classes.map(c => (
                       <option key={c.id} value={c.id}>{c.name}</option>
                     ))}
                     {classes.length === 0 && <option value="">{t("wheel.config.loading") || "Đang tải lớp học..."}</option>}
                   </select>
                   <Button size="icon" variant="outline" onClick={loadClassIntoList} title="Dán danh sách lớp vào khung">
                      <Download className="w-4 h-4" />
                   </Button>
                 </div>
               </div>
               
               <div className="pt-2 border-t flex-grow flex flex-col space-y-2">
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" /> {t("wheel.config.list_title") || "Danh sách vòng quay"}
                    </label>
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                        {parsedItems.length} {t("wheel.config.items") || "mục"}
                    </span>
                 </div>
                 
                 <textarea
                   className="w-full text-sm p-3 border rounded-md flex-grow bg-background resize-y min-h-[300px]"
                   placeholder={t("wheel.config.placeholder") || "Nhập tên người tham gia ở đây...\nMỗi dòng là một người/vật phẩm mới."}
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                 />
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl min-h-[500px]">
          <div className="w-full max-w-lg">
             <RandomWheel 
               items={parsedItems} 
               onRemoveWinner={handleWinnerRemoved}
               onKeepWinner={handleKeepWinner}
             />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
           <CardTitle className="text-base flex items-center gap-2">
             <History className="w-4 h-4 text-indigo-500" /> {t("wheel.history") || "Lịch sử vòng quay"}
           </CardTitle>
        </CardHeader>
        <CardContent>
           {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("wheel.history.empty") || "Chưa có lượt quay nào."}</p>
           ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                   <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                      <tr>
                         <th className="px-4 py-3 font-medium rounded-tl-md">{t("wheel.history.round") || "Lần"}</th>
                         <th className="px-4 py-3 font-medium">{t("wheel.history.result") || "Kết quả"}</th>
                         <th className="px-4 py-3 font-medium">{t("wheel.history.action") || "Hành động"}</th>
                         <th className="px-4 py-3 font-medium rounded-tr-md">{t("wheel.history.time") || "Thời gian"}</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y border-b">
                      {history.map((h, i) => (
                         <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-semibold text-slate-500">#{history.length - i}</td>
                            <td className="px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400">{h.winner}</td>
                            <td className="px-4 py-3">
                               {h.action === "kept" ? (
                                 <span className="inline-flex text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                                     {t("wheel.history.kept") || "Giữ lại"}
                                 </span>
                               ) : (
                                 <span className="inline-flex text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                                     {t("wheel.history.removed") || "Loại bỏ"}
                                 </span>
                               )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{h.time.toLocaleTimeString()}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
              </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

