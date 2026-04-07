"use client";

import { RandomWheel } from "@/components/dashboard/RandomWheel";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Filter, Settings2, Download } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

export default function RandomWheelPage() {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  
  // Custom manual list instead of locked students array
  const [inputText, setInputText] = useState<string>("");
  const [removeWinner, setRemoveWinner] = useState<boolean>(true);

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

  const handleWinnerRemoved = (winner: string) => {
    if (removeWinner) {
      setInputText(prev => {
        const lines = prev.split("\n");
        const idx = lines.findIndex(l => l.trim() === winner);
        if (idx !== -1) {
          lines.splice(idx, 1);
        }
        return lines.join("\n");
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Vòng Quay May Mắn</h1>
        <p className="text-muted-foreground mt-1">
          Quay ngẫu nhiên chọn người phát biểu, chia nhóm hoặc bốc thăm trúng thưởng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings2 className="w-4 h-4 text-indigo-500" /> Tùy chỉnh danh sách
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-5">
               <div className="space-y-2">
                 <label className="text-sm font-semibold">Tải nhanh từ Lớp học</label>
                 <div className="flex gap-2">
                   <select 
                     className="flex-1 text-sm p-2 bg-background border rounded-md"
                     value={selectedClass}
                     onChange={(e) => setSelectedClass(e.target.value)}
                   >
                     {classes.map(c => (
                       <option key={c.id} value={c.id}>{c.name}</option>
                     ))}
                     {classes.length === 0 && <option value="">Đang tải lớp học...</option>}
                   </select>
                   <Button size="icon" variant="outline" onClick={loadClassIntoList} title="Dán danh sách lớp vào khung">
                      <Download className="w-4 h-4" />
                   </Button>
                 </div>
               </div>
               
               <div className="pt-2 border-t space-y-2">
                 <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" /> Danh sách vòng quay
                    </label>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        {parsedItems.length} mục
                    </span>
                 </div>
                 
                 <textarea
                   className="w-full text-sm p-3 border rounded-md min-h-[250px] bg-background resize-y"
                   placeholder="Nhập tên người tham gia ở đây...&#10;Mỗi dòng là một người/vật phẩm mới."
                   value={inputText}
                   onChange={(e) => setInputText(e.target.value)}
                 />
                 
                 <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="remove Winner" 
                      checked={removeWinner} 
                      onChange={(e) => setRemoveWinner(e.target.checked)} 
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="remove Winner" className="text-sm cursor-pointer select-none">
                      Xóa người trúng ra khỏi danh sách
                    </label>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 border rounded-2xl min-h-[500px]">
          <div className="w-full max-w-lg">
             <RandomWheel 
               items={parsedItems} 
               onRemoveWinner={handleWinnerRemoved}
             />
          </div>
        </div>
      </div>
    </div>
  );
}

