"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, BarChart3, TrendingUp, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

const mockReports = [
  { id: "1", title: "Kiểm tra Toán Học giữa kỳ 2", status: "Đang diễn ra", submissions: 35, avgScore: 7.8, date: "Hôm nay, 14:00" },
  { id: "2", title: "Bài tập về nhà: Đạo hàm", status: "Đã đóng", submissions: 42, avgScore: 8.2, date: "20 thg 3, 2026" },
  { id: "3", title: "Khảo sát chất lượng tiếng Anh", status: "Đã đóng", submissions: 120, avgScore: 6.5, date: "15 thg 3, 2026" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Báo cáo & Phân tích</h1>
          <p className="text-muted-foreground mt-1">
            Theo dõi kết quả, phân tích phổ điểm và đánh giá chất lượng các bài kiểm tra.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-indigo-100">Tổng bài kiểm tra</CardTitle>
            <BarChart3 className="w-5 h-5 text-indigo-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">24</div>
            <p className="text-xs text-indigo-200 mt-1">+3 bài trong tháng này</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Lượt nộp bài (Tháng)</CardTitle>
            <Users className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">482</div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Tăng 12% so với tháng trước</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Điểm trung bình (Hệ thống)</CardTitle>
            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">P</div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800">7.4</div>
            <p className="text-xs text-slate-400 mt-1">Dựa trên 2.5k bài nộp</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-sm shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Tìm kiếm bài kiểm tra..." 
              className="pl-9 h-10 w-full bg-white"
            />
          </div>
          <Button variant="outline" className="gap-2 bg-white shrink-0">
            <Filter className="w-4 h-4" /> Lọc báo cáo
          </Button>
        </div>

        <div className="divide-y">
          {mockReports.map(rep => (
            <div key={rep.id} className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:bg-slate-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800 text-lg">{rep.title}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${rep.status === 'Đang diễn ra' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {rep.status}
                  </span>
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-4">
                  <span>Ngày thi: {rep.date}</span>
                </div>
              </div>

              <div className="flex gap-8 sm:gap-12 text-center shrink-0">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-slate-800">{rep.submissions}</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Bài nộp</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-emerald-600">{rep.avgScore}</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Điểm TB</span>
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                <Link href={`/reports/${rep.id}`}>
                  <Button variant="outline" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    Xem chi tiết <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
