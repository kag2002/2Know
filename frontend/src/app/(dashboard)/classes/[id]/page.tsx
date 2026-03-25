"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, UserPlus, FileUp, Search, Download, MoreHorizontal, GraduationCap, Settings } from "lucide-react";
import Link from "next/link";
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

const mockStudents = [
  { id: 1, sbd: "SV0124", name: "Nguyễn Văn An", dob: "12/05/2008", email: "an.nguyen@email.com", phone: "0912345678", joined: "12 thg 3, 2026" },
  { id: 2, sbd: "SV0125", name: "Trần Thị Bích", dob: "24/11/2008", email: "bich.tran@email.com", phone: "0987654321", joined: "12 thg 3, 2026" },
  { id: 3, sbd: "SV0126", name: "Lê Hoàng Phúc", dob: "05/01/2008", email: "phuc.le@email.com", phone: "0901112223", joined: "14 thg 3, 2026" },
  { id: 4, sbd: "SV0127", name: "Phạm Diệu Linh", dob: "19/08/2008", email: "linh.pham@email.com", phone: "0933444555", joined: "15 thg 3, 2026" },
];

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  // In a real app we fetch class details based on params.id
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/classes" className="p-2 border rounded-md hover:bg-slate-50 transition-colors bg-white">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">12A1 - Toán Học - Cô Lan</h1>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">Lớp 12</span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Tạo lúc 12 thg 3, 2026 • Niên khóa 2025-2026
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <Button variant="outline" className="gap-2 bg-white">
            <Settings className="w-4 h-4" /> Cài đặt lớp
          </Button>
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <UserPlus className="w-4 h-4" /> Thêm học sinh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Stats */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3 text-indigo-600 mb-6">
              <div className="p-2.5 bg-indigo-50 rounded-lg">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="font-semibold">Thống kê lớp học</h3>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 font-medium">Sĩ số hiện tại</span>
              <span className="text-3xl font-bold text-slate-800">45 <span className="text-sm font-normal text-slate-400">học sinh</span></span>
            </div>
            <div className="w-full h-px bg-slate-100"></div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 font-medium">Số bài kiểm tra đã giao</span>
              <span className="text-xl font-bold text-slate-800">12</span>
            </div>
            <div className="w-full h-px bg-slate-100"></div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 font-medium">Điểm trung bình lớp</span>
              <span className="text-xl font-bold text-emerald-600">7.8</span>
            </div>
          </div>
        </div>

        {/* Right Data Table */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white p-4 border rounded-xl shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center z-10 sticky top-0">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Tìm kiếm theo Tên hoặc Mã học sinh (SBD)..." 
                className="pl-10 h-10 bg-slate-50 border-transparent focus:bg-white transition-colors w-full"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                <FileUp className="w-4 h-4 text-slate-500" /> Import Excel
              </Button>
              <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
                <Download className="w-4 h-4 text-slate-500" /> Xuất danh sách
              </Button>
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="w-[100px] font-semibold text-slate-600">Mã HS/SBD</TableHead>
                  <TableHead className="font-semibold text-slate-600 w-[250px]">Họ và Tên</TableHead>
                  <TableHead className="font-semibold text-slate-600">Ngày sinh</TableHead>
                  <TableHead className="font-semibold text-slate-600">Liên hệ</TableHead>
                  <TableHead className="font-semibold text-slate-600">Ngày thêm</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockStudents.map((st) => (
                  <TableRow key={st.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-700">{st.sbd}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                          {st.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">{st.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-sm">{st.dob}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700">{st.phone}</span>
                        <span className="text-xs text-muted-foreground">{st.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{st.joined}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Xem kết quả học tập</DropdownMenuItem>
                          <DropdownMenuItem>Chỉnh sửa thông tin</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600">Xóa khỏi lớp</DropdownMenuItem>
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
