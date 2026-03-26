"use client";

import { Button } from "@/components/ui/button";
import { Clock, HelpCircle, AlertTriangle, ShieldCheck, User } from "lucide-react";
import { useState, use } from "react";
import { useRouter } from "next/navigation";

export default function TestIntroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [studentInfo, setStudentInfo] = useState({ name: "", sbd: "" });
  const [error, setError] = useState("");

  const handleStart = () => {
    if (!studentInfo.name.trim() || !studentInfo.sbd.trim()) {
      setError("Vui lòng nhập đầy đủ Họ Tên và Mã Học Sinh trước khi bắt đầu.");
      return;
    }
    // Store student info for guest mode
    sessionStorage.setItem("student_name", studentInfo.name.trim());
    sessionStorage.setItem("student_sbd", studentInfo.sbd.trim());
    router.push(`/test/${id}/take`);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-8">
        
        {/* Test Info Header */}
        <div className="text-center space-y-3 pb-8 border-b">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
            Đang mở
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Bài kiểm tra Toán Học giữa kỳ 2</h1>
          <p className="text-slate-500">Giáo viên: Thầy Hoàng Anh • Môn Toán • Khối 12</p>
        </div>

        {/* Test Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Thời gian</p>
              <p className="font-bold text-slate-900 text-lg">45 Phút</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Số lượng</p>
              <p className="font-bold text-slate-900 text-lg">40 Câu hỏi</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Yêu cầu</p>
              <p className="font-bold text-slate-900 text-lg">Bảo mật cao</p>
            </div>
          </div>
        </div>

        {/* Security Rules Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-800">Quy định làm bài online</h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>Hệ thống yêu cầu chế độ toàn màn hình (Fullscreen) trong quá trình làm bài.</li>
              <li>Mọi hành vi thoát tab hoặc chuyển ứng dụng sẽ bị cảnh báo và ghi log gửi cho Giáo viên.</li>
              <li>Sau <strong>3 lần</strong> chuyển tab, bài thi sẽ bị nộp tự động.</li>
              <li>Chức năng Copy / Paste (Sao chép dán) bị vô hiệu hóa.</li>
              <li>Khi hết giờ, hệ thống sẽ tự động nộp bài lập tức. Không thể sửa.</li>
            </ul>
          </div>
        </div>

        {/* Entry Form */}
        <div className="bg-slate-50 border p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800 border-b pb-3 border-slate-200">
            <User className="w-5 h-5 text-indigo-500" />
            Thông tin Thí sinh
          </div>
          {error && (
            <div className="p-3 text-sm text-rose-600 border border-rose-200 bg-rose-50 rounded-md">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Họ và Tên <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                placeholder="Ví dụ: Nguyễn Văn A"
                value={studentInfo.name}
                onChange={e => { setStudentInfo({...studentInfo, name: e.target.value}); setError(""); }}
                className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Mã Học Sinh / SBD <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                placeholder="Mã định danh của bạn..."
                value={studentInfo.sbd}
                onChange={e => { setStudentInfo({...studentInfo, sbd: e.target.value}); setError(""); }}
                className="w-full h-10 px-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]" 
              />
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="pt-4 flex justify-center">
          <Button
            size="lg"
            className="w-full sm:w-auto min-w-[200px] h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
            onClick={handleStart}
          >
            Bắt Đầu Làm Bài
          </Button>
        </div>

      </div>
    </div>
  );
}
