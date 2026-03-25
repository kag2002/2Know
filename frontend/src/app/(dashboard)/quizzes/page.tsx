import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Plus, Search, Filter, MoreHorizontal } from "lucide-react";
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

const mockQuizzes = [
  { id: "1", title: "Kiểm tra Toán 15p - Hình học", status: "Hoạt động", plays: 45, date: "20 thg 3, 2026", type: "Trắc nghiệm" },
  { id: "2", title: "Văn học Giữa kỳ II - Lớp 11", status: "Bản nháp", plays: 0, date: "22 thg 3, 2026", type: "Tự luận" },
  { id: "3", title: "Kiểm tra Anh Văn - Unit 7", status: "Hoạt động", plays: 120, date: "15 thg 3, 2026", type: "Kết hợp" },
  { id: "4", title: "[OMR] Bài thi thử THPT Quốc gia", status: "Đóng", plays: 500, date: "10 thg 3, 2026", type: "Giấy (OMR)" },
];

export default function QuizzesPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bài kiểm tra</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tất cả định dạng bài tập: Trực tuyến, Tự luận, và Phiếu tô màu (OMR).
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-white">
            <Filter className="w-4 h-4" /> Bộ lọc
          </Button>
          <Button asChild className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Link href="/quizzes/create">
              <Plus className="w-4 h-4" /> Tạo mới
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-slate-200/50">
            <TabsTrigger value="all">Tất cả bài tập</TabsTrigger>
            <TabsTrigger value="drafts">Bản nháp</TabsTrigger>
            <TabsTrigger value="archived">Đã lưu trữ</TabsTrigger>
            <TabsTrigger value="trash">Thùng rác</TabsTrigger>
          </TabsList>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Tìm kiếm bài tập..." 
              className="pl-9 h-9 bg-white"
            />
          </div>
        </div>

        <TabsContent value="all" className="m-0">
          <div className="border rounded-md bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[400px]">Tên bài kiểm tra</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Định dạng</TableHead>
                  <TableHead>Lượt làm bài</TableHead>
                  <TableHead>Ngày cập nhật</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockQuizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">
                      {quiz.title}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium
                        ${quiz.status === 'Hoạt động' ? 'bg-emerald-50 text-emerald-700' : 
                          quiz.status === 'Bản nháp' ? 'bg-slate-100 text-slate-700' : 
                          'bg-rose-50 text-rose-700'}`}>
                        {quiz.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{quiz.type}</TableCell>
                    <TableCell className="text-slate-700">{quiz.plays}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{quiz.date}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Sửa bài tập</DropdownMenuItem>
                          <DropdownMenuItem>Xem báo cáo</DropdownMenuItem>
                          <DropdownMenuItem>Chia sẻ</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-600">Xóa</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
