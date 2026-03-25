import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Layers, CheckSquare, BarChart, Settings2 } from "lucide-react";

export default function OverviewPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-medium text-muted-foreground">
              👋 Chào buổi sáng
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ms.Tami</h1>
          <p className="text-muted-foreground mt-1">
            Đây là nhịp hoạt động trực tiếp của lớp học, hàng chấm và khối lượng AI của bạn.
          </p>
        </div>
        <Button variant="outline" className="gap-2 bg-white">
          <Settings2 className="w-4 h-4" /> Tải lại dữ liệu
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">25 thg 3, 2026</CardTitle>
            <span className="text-xs text-muted-foreground">18:30</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-800">56</div>
            <p className="text-xs text-muted-foreground mt-1">Chưa có chênh lệch tuần</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span className="font-medium">Bài kiểm tra hoạt động</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-semibold">Ổn định</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Hiện đang mở cho học sinh</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">25 thg 3, 2026</CardTitle>
            <span className="text-xs text-muted-foreground">18:30</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-800">7</div>
            <p className="text-xs text-rose-500 font-medium mt-1">-91 so với 7 ngày trước</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckSquare className="w-4 h-4 text-rose-500" />
                <span className="font-medium">Bài nộp 7 ngày</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold">Ổn định</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Hoàn thành trong tuần qua</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">25 thg 3, 2026</CardTitle>
            <span className="text-xs text-muted-foreground">18:30</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-800">78,1%</div>
            <p className="text-xs text-emerald-500 font-medium mt-1">+5,8 so với 7 ngày trước</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <BarChart className="w-4 h-4 text-emerald-500" />
                <span className="font-medium">Điểm trung bình 7 ngày</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-semibold">Ổn định</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Bài làm đủ điều kiện</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">25 thg 3, 2026</CardTitle>
            <span className="text-xs text-muted-foreground">18:30</span>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-800">135</div>
            <p className="text-xs text-muted-foreground mt-1">Chưa có chênh lệch tuần</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-orange-500"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                <span className="font-medium">Hàng chấm</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-semibold">Cần theo dõi</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Câu trả lời thủ công còn chờ</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity Feed and Charts will go here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-slate-200">
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
            {/* Feed items mock */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col p-3 rounded-md border text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">Lê Uy Đức đã hoàn thành minh chứng bài tập với 0%</span>
                    <span className="text-xs text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded">Mở</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                    <span>17:36 25 thg 3, 2026</span>
                    <span className="bg-emerald-50 text-emerald-600 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider text-[10px]">Success</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 shadow-sm border-slate-200">
           <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Phân bố điểm học sinh</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Phân bổ điểm trung bình theo toàn bộ chuyên mục</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
              {/* Doughnut Chart Placeholder */}
              <div className="w-48 h-48 rounded-full border-[16px] border-emerald-400 border-t-amber-400 border-r-rose-500 border-b-blue-400 flex items-center justify-center relative shadow-inner">
                <div className="text-center">
                  <div className="text-3xl font-bold">108</div>
                  <div className="text-xs text-muted-foreground">Có điểm</div>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
