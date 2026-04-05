"use client";

import { RandomWheel } from "@/components/dashboard/RandomWheel";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Filter } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function RandomWheelPage() {
  const { t } = useTranslation();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<string[]>([]);
  
  useEffect(() => {
    apiFetch("/classes").then(data => {
      if (Array.isArray(data)) {
         setClasses(data);
         if (data.length > 0) setSelectedClass(data[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClass) {
      apiFetch(`/classes/${selectedClass}`).then(cls => {
         if (cls && cls.students) {
            setStudents(cls.students.map((s: any) => s.full_name || s.name));
         } else {
            setStudents([]);
         }
      }).catch(() => setStudents([]));
    }
  }, [selectedClass]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Vòng Quay May Mắn</h1>
        <p className="text-muted-foreground mt-1">
          Quay ngẫu nhiên chọn học sinh phát biểu hoặc trao thưởng.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="w-4 h-4 text-indigo-500" /> Cấu hình vòng quay
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-semibold">Chọn lớp học</label>
                 <select 
                   className="w-full text-sm p-2 border rounded-md"
                   value={selectedClass}
                   onChange={(e) => setSelectedClass(e.target.value)}
                 >
                   {classes.map(c => (
                     <option key={c.id} value={c.id}>{c.name}</option>
                   ))}
                   {classes.length === 0 && <option value="">Đang tải lớp học...</option>}
                 </select>
               </div>
               
               <div className="pt-2 border-t">
                 <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4" /> Danh sách ({students.length} học sinh)
                 </p>
                 <div className="max-h-[300px] overflow-y-auto space-y-1 p-2 bg-muted/50 rounded-md border text-sm">
                   {students.map((s, idx) => (
                      <div key={idx} className="bg-background px-3 py-1.5 rounded shadow-sm flex items-center gap-2">
                         <span className="text-xs text-muted-foreground w-4">{idx + 1}.</span>
                         {s}
                      </div>
                   ))}
                   {students.length === 0 && <span className="text-muted-foreground italic">Lớp học chưa có học sinh.</span>}
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900 border rounded-2xl">
          <div className="w-full max-w-lg">
             <RandomWheel items={students} />
          </div>
        </div>
      </div>
    </div>
  );
}
