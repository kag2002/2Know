"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layers, CheckSquare, BarChart, Settings2, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "☀️ Chào buổi sáng";
  if (h < 18) return "🌤️ Chào buổi chiều";
  return "🌙 Chào buổi tối";
}

function AnimatedNumber({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  
  useEffect(() => {
    const numMatch = value.match(/[\d,.]+/);
    if (!numMatch) { setDisplay(value); return; }
    
    const target = parseFloat(numMatch[0].replace(",", "."));
    const duration = 1200;
    const start = performance.now();
    
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(target * eased * 10) / 10;
      
      if (target % 1 !== 0) {
        setDisplay(current.toFixed(1).replace(".", ","));
      } else {
        setDisplay(Math.round(current).toString());
      }
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  return <>{display}{suffix}</>;
}

const statCards = [
  {
    value: "56", label: "Bài kiểm tra hoạt động", desc: "Hiện đang mở cho học sinh",
    icon: Layers, iconColor: "text-indigo-500", badgeColor: "bg-indigo-50 text-indigo-600",
    badge: "Ổn định", change: null, changeLabel: "Chưa có chênh lệch tuần",
  },
  {
    value: "7", label: "Bài nộp 7 ngày", desc: "Hoàn thành trong tuần qua",
    icon: CheckSquare, iconColor: "text-rose-500", badgeColor: "bg-rose-50 text-rose-600",
    badge: "Giảm", change: -91, changeLabel: "-91 so với 7 ngày trước",
  },
  {
    value: "78,1", label: "Điểm trung bình 7 ngày", desc: "Bài làm đủ điều kiện",
    icon: BarChart, iconColor: "text-emerald-500", badgeColor: "bg-emerald-50 text-emerald-600",
    badge: "Tăng", change: 5.8, changeLabel: "+5,8 so với 7 ngày trước", suffix: "%",
  },
  {
    value: "135", label: "Hàng chấm", desc: "Câu trả lời thủ công còn chờ",
    icon: null, iconColor: "text-orange-500", badgeColor: "bg-orange-50 text-orange-600",
    badge: "Cần theo dõi", change: null, changeLabel: "Chưa có chênh lệch tuần",
  },
];

export default function OverviewPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-muted px-2.5 py-0.5 rounded-full text-xs font-medium text-muted-foreground">
              {getGreeting()}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {user?.name || "Giáo viên"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Đây là nhịp hoạt động trực tiếp của lớp học, hàng chấm và khối lượng AI của bạn.
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-white">
          <Settings2 className="w-4 h-4" /> Tải lại dữ liệu
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card 
            key={i} 
            className={`shadow-sm border-slate-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${
              mounted ? "animate-in fade-in slide-in-from-bottom-4" : "opacity-0"
            }`}
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both", animationDuration: "500ms" }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">{dateStr}</CardTitle>
              <span className="text-xs text-muted-foreground">{timeStr}</span>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-800">
                <AnimatedNumber value={card.value} suffix={card.suffix || ""} />
                {card.suffix || ""}
              </div>
              <p className={`text-xs font-medium mt-1 ${
                card.change && card.change > 0 ? "text-emerald-500" :
                card.change && card.change < 0 ? "text-rose-500" :
                "text-muted-foreground"
              }`}>
                {card.change && card.change > 0 && <TrendingUp className="inline w-3 h-3 mr-1" />}
                {card.change && card.change < 0 && <TrendingDown className="inline w-3 h-3 mr-1" />}
                {card.changeLabel}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  {card.icon ? (
                    <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-500"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  )}
                  <span className="font-medium">{card.label}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${card.badgeColor}`}>{card.badge}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Activity Feed and Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className={`col-span-4 shadow-sm border-slate-200 ${mounted ? "animate-in fade-in duration-500" : "opacity-0"}`} style={{ animationDelay: "500ms", animationFillMode: "both" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Dòng hoạt động</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Các bài hoàn thành gần đây, sự kiện bảo mật, phiên điểm danh đã đóng và cập nhật job AI.</p>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-emerald-600 outline-emerald-200 bg-emerald-50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Trực tiếp
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Lê Uy Đức", action: "đã hoàn thành minh chứng bài tập với 0%", time: "17:36", status: "Mở", statusColor: "text-pink-500 bg-pink-50" },
                { name: "Nguyễn Thị Mai", action: "đã nộp bài kiểm tra Toán giữa kỳ", time: "16:20", status: "Hoàn thành", statusColor: "text-emerald-600 bg-emerald-50" },
                { name: "Trần Văn Hoàng", action: "bị cảnh báo chuyển tab lần 2", time: "15:45", status: "Cảnh báo", statusColor: "text-amber-600 bg-amber-50" },
                { name: "AI Generator", action: "đã tạo 15 câu hỏi trắc nghiệm mới", time: "14:10", status: "Hoàn thành", statusColor: "text-emerald-600 bg-emerald-50" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col p-3 rounded-lg border text-sm hover:bg-slate-50/80 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium group-hover:text-indigo-600 transition-colors">
                      <strong>{item.name}</strong> {item.action}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${item.statusColor} shrink-0 ml-2`}>{item.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                    <span>{item.time} {dateStr}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className={`col-span-3 shadow-sm border-slate-200 ${mounted ? "animate-in fade-in duration-500" : "opacity-0"}`} style={{ animationDelay: "600ms", animationFillMode: "both" }}>
           <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Phân bố điểm học sinh</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Phân bổ điểm trung bình theo toàn bộ chuyên mục</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
              {/* Doughnut Chart */}
              <div className="w-48 h-48 rounded-full border-[16px] border-emerald-400 border-t-amber-400 border-r-rose-500 border-b-blue-400 flex items-center justify-center relative shadow-inner">
                <div className="text-center">
                  <div className="text-3xl font-bold">108</div>
                  <div className="text-xs text-muted-foreground">Có điểm</div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                {[
                  { label: "Giỏi", color: "bg-emerald-400", pct: "42%" },
                  { label: "Khá", color: "bg-blue-400", pct: "28%" },
                  { label: "TB", color: "bg-amber-400", pct: "20%" },
                  { label: "Yếu", color: "bg-rose-500", pct: "10%" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-xs">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                    <span className="text-muted-foreground">{item.label} ({item.pct})</span>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
