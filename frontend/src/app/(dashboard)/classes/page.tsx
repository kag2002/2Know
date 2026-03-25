"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Users, School, ChevronRight, MoreVertical } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockClasses = [
  { id: "1", name: "12A1 - Toán Học - Cô Lan", grade: "Lớp 12", subject: "Toán học", year: "2025-2026", studentsCount: 45, date: "12 thg 3, 2026" },
  { id: "2", name: "10A5 - Ngữ Văn Khối C", grade: "Lớp 10", subject: "Ngữ văn", year: "2025-2026", studentsCount: 42, date: "10 thg 3, 2026" },
  { id: "3", name: "Luyện thi IELTS Target 7.0+", grade: "Khác", subject: "Tiếng Anh", year: "2026", studentsCount: 15, date: "05 thg 3, 2026" },
  { id: "4", name: "11B2 - Vật Lý Thầy Tuấn", grade: "Lớp 11", subject: "Vật lý", year: "2025-2026", studentsCount: 38, date: "01 thg 3, 2026" },
];

export default function ClassesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý lớp học</h1>
          <p className="text-muted-foreground mt-1">
            Tổ chức học sinh theo lớp, dễ dàng giao bài tập và theo dõi tiến độ học tập.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white">
            <Filter className="w-4 h-4" /> Lọc
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4" /> Tạo lớp học mới
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 border rounded-xl shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm tên lớp học, niên khóa hoặc giáo viên..." 
            className="pl-10 h-10 bg-slate-50 border-transparent focus:bg-white transition-colors"
          />
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex gap-3 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs uppercase font-semibold">Tổng số lớp</span>
            <span className="font-bold text-slate-800 text-lg">12</span>
          </div>
          <div className="w-px h-8 bg-slate-100 mx-2 mt-1"></div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs uppercase font-semibold">Học sinh</span>
            <span className="font-bold text-indigo-600 text-lg">482</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClasses.map((cls) => (
          <div key={cls.id} className="group flex flex-col bg-white border rounded-xl overflow-hidden hover:shadow-md transition-all">
            <div className="p-5 flex-1 relative">
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Chỉnh sửa thông tin</DropdownMenuItem>
                    <DropdownMenuItem>Báo cáo điểm chuẩn</DropdownMenuItem>
                    <DropdownMenuItem className="text-rose-600">Lưu trữ lớp</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">{cls.subject} • {cls.grade}</div>
                  <h3 className="font-bold text-slate-800 line-clamp-1 pr-6">{cls.name}</h3>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-500 mb-6">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span><strong>{cls.studentsCount}</strong> học sinh</span>
                </div>
                <div>
                  <span>Năm học: {cls.year}</span>
                </div>
              </div>

              <div className="flex -space-x-2 overflow-hidden mb-2">
                {[1,2,3,4].map(avatar => (
                  <div key={avatar} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 border border-slate-300" />
                ))}
                <div className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-slate-50 text-[10px] font-medium text-slate-500 border border-slate-300">
                  +{cls.studentsCount - 4}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 border-t p-3 px-5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tạo ngày {cls.date}</span>
              <Link href={`/classes/${cls.id}`} className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-1 transition-colors">
                Xem danh sách <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}

        {/* Create New Card */}
        <div className="flex flex-col items-center justify-center min-h-[220px] bg-slate-50 border-2 border-dashed rounded-xl hover:bg-slate-100 hover:border-indigo-300 transition-all cursor-pointer group">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-indigo-500" />
          </div>
          <h3 className="font-semibold text-slate-700">Tạo Lớp học mới</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px] text-center">Tạo phòng học kín và quản lý tiến trình học tập của học viên</p>
        </div>
      </div>
    </div>
  );
}
