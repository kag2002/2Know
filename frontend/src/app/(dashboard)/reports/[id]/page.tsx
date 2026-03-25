"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Users, Target, Activity, Trophy } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const mockResults = [
  { id: 1, rank: 1, sbd: "SV0124", name: "Nguyễn Văn An", score: 9.5, correct: 38, time: "25:12", status: "Hoàn thành" },
  { id: 2, rank: 2, sbd: "SV0128", name: "Lý Tiến Đạt", score: 9.0, correct: 36, time: "30:45", status: "Hoàn thành" },
  { id: 3, rank: 3, sbd: "SV0125", name: "Trần Thị Bích", score: 8.5, correct: 34, time: "40:22", status: "Hoàn thành" },
  { id: 4, rank: 4, sbd: "SV0126", name: "Lê Hoàng Phúc", score: 7.0, correct: 28, time: "44:50", status: "Cảnh báo gian lận" },
  { id: 5, rank: 5, sbd: "SV0127", name: "Phạm Diệu Linh", score: 6.5, correct: 26, time: "45:00", status: "Hết giờ" },
];

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/reports" className="p-2 border rounded-md hover:bg-slate-50 transition-colors bg-white">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kiểm tra Toán Học giữa kỳ 2</h1>
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase">
              Đã thu bài
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            45/45 học sinh đã nộp bài • Lớp 12A1
          </p>
        </div>
        <div className="ml-auto">
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-200">
            <Download className="w-4 h-4" /> Xuất báo cáo Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Điểm trung bình</CardTitle>
            <Activity className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">7.8 / 10</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Điểm cao nhất</CardTitle>
            <Trophy className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">9.5 <span className="text-xs font-normal text-slate-500">Nguyễn Văn An</span></div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Số lượng nộp bài</CardTitle>
            <Users className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">45 / 45</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Tỷ lệ chính xác (TB)</CardTitle>
            <Target className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">78%</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Bảng điểm chi tiết</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Lọc theo điểm</Button>
            <Button variant="outline" size="sm">Cảnh báo gian lận (1)</Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-white hover:bg-white">
              <TableHead className="w-[80px] text-center font-bold">Xếp hạng</TableHead>
              <TableHead className="font-semibold text-slate-600">Mã HS</TableHead>
              <TableHead className="font-semibold text-slate-600">Thí sinh</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Số câu đúng</TableHead>
              <TableHead className="font-semibold text-slate-600 text-center">Thời gian</TableHead>
              <TableHead className="font-semibold text-slate-600">Trạng thái</TableHead>
              <TableHead className="font-semibold text-slate-600 text-right">Tổng điểm</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockResults.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    r.rank === 1 ? 'bg-amber-100 text-amber-600' : 
                    r.rank === 2 ? 'bg-slate-200 text-slate-600' : 
                    r.rank === 3 ? 'bg-orange-100 text-orange-600' : 'text-slate-400'
                  }`}>
                    {r.rank}
                  </span>
                </TableCell>
                <TableCell className="font-medium text-slate-500">{r.sbd}</TableCell>
                <TableCell className="font-semibold text-slate-800">{r.name}</TableCell>
                <TableCell className="text-center text-slate-600">{r.correct} / 40</TableCell>
                <TableCell className="text-center text-slate-600">{r.time}</TableCell>
                <TableCell>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    r.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700' : 
                    r.status === 'Hết giờ' ? 'bg-slate-100 text-slate-600' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {r.status}
                  </span>
                </TableCell>
                <TableCell className="text-right font-black text-indigo-600 text-lg">
                  {r.score.toFixed(1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
