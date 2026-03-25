"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, MoreHorizontal, BookOpen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockBank = [
  { id: "1", content: "Nguyên nhân chính dẫn đến Chiến tranh thế giới thứ nhất là gì?", type: "Trắc nghiệm", subject: "Lịch sử", grade: "Lớp 11", date: "22 thg 3, 2026" },
  { id: "2", content: "Giải phương trình logarit cơ bản", type: "Tự luận", subject: "Toán học", grade: "Lớp 12", date: "20 thg 3, 2026" },
  { id: "3", content: "Tìm từ trái nghĩa với từ 'Abundant'", type: "Trắc nghiệm", subject: "Tiếng Anh", grade: "Đại học", date: "15 thg 3, 2026" },
  { id: "4", content: "Sự bay hơi của nước phụ thuộc vào yếu tố nào?", type: "Đúng/Sai", subject: "Vật lý", grade: "Lớp 10", date: "10 thg 3, 2026" },
];

export default function QuestionBankPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ngân hàng câu hỏi</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tài nguyên, phân loại và tái sử dụng câu hỏi cho nhiều bài kiểm tra khác nhau.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white">
            <Filter className="w-4 h-4" /> Bộ lọc
          </Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4" /> Tạo câu hỏi mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Sidebar Filter/Categories */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">Chủ đề môn học</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex justify-between items-center bg-emerald-50 text-emerald-700 px-2 py-1.5 rounded-md font-medium cursor-pointer">
                <span>Tất cả môn học</span>
                <span className="bg-emerald-100 px-2 py-0.5 rounded-full text-xs">425</span>
              </li>
              <li className="flex justify-between items-center px-2 py-1.5 hover:bg-slate-50 rounded-md cursor-pointer">
                <span>Toán học</span>
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">120</span>
              </li>
              <li className="flex justify-between items-center px-2 py-1.5 hover:bg-slate-50 rounded-md cursor-pointer">
                <span>Ngữ văn</span>
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">85</span>
              </li>
              <li className="flex justify-between items-center px-2 py-1.5 hover:bg-slate-50 rounded-md cursor-pointer">
                <span>Vật lý</span>
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">60</span>
              </li>
              <li className="flex justify-between items-center px-2 py-1.5 hover:bg-slate-50 rounded-md cursor-pointer">
                <span>Tiếng Anh</span>
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">160</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-sm mb-3">Khối lớp</h3>
            <div className="flex flex-wrap gap-2">
              {["Lớp 10", "Lớp 11", "Lớp 12", "Luyện thi đại học"].map(level => (
                <span key={level} className="text-xs px-2.5 py-1.5 rounded-full border bg-slate-50 text-slate-600 cursor-pointer hover:border-emerald-300">
                  {level}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Main Table */}
        <div className="col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Tìm kiếm nội dung câu hỏi..." 
                className="pl-9 h-9 bg-white"
              />
            </div>
            <div className="text-sm text-slate-500">
              Hiển thị <strong>4</strong> / 425 câu hỏi
            </div>
          </div>

          <div className="border rounded-md bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[450px]">Nội dung câu hỏi</TableHead>
                  <TableHead>Chuyên mục</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBank.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-slate-300 mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-slate-800 line-clamp-2">{q.content}</span>
                          <span className="text-xs text-muted-foreground w-fit bg-slate-100 px-1.5 py-0.5 rounded">{q.type}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{q.subject}</TableCell>
                    <TableCell className="text-slate-600 text-sm">{q.grade}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{q.date}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                          <DropdownMenuItem>Tạo bản sao</DropdownMenuItem>
                          <DropdownMenuItem>Tạo đề thi từ câu này</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600">Xóa vĩnh viễn</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
