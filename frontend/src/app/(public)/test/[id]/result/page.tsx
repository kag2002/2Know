"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Target, Home, RefreshCcw, XCircle, Award } from "lucide-react";
import Link from "next/link";

export default function TestResultPage({ params }: { params: { id: string } }) {
  // In a real app we fetch the result using params.id and maybe a session ticket
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        
        {/* Result Header Top */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-10 text-center text-white relative">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-medium text-indigo-100 mb-2">Chúc mừng bạn đã hoàn thành</h2>
          <h1 className="text-3xl font-bold mb-6">Bài kiểm tra Toán Học giữa kỳ 2</h1>
          <p className="text-indigo-100">Họ tên: Nguyễn Văn An • SBD: SV0124</p>
        </div>

        {/* Big Score Cirle */}
        <div className="flex justify-center -mt-10 mb-8 relative z-10">
          <div className="w-32 h-32 bg-white rounded-full p-2 shadow-xl border-4 border-emerald-100 flex items-center justify-center relative">
            <svg viewBox="0 0 36 36" className="w-full h-full text-emerald-500 absolute rotate-[-90deg]">
              <path
                className="text-slate-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray="85, 100"
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800">8.5</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Điểm</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-y-8 gap-x-4 p-8 pt-0 border-b">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">34</p>
              <p className="text-sm text-slate-500">Câu đúng</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">6</p>
              <p className="text-sm text-slate-500">Câu sai / trống</p>
            </div>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">32:15</p>
              <p className="text-sm text-slate-500">Thời gian làm</p>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Area */}
        <div className="p-8 bg-slate-50 space-y-6">
          <h3 className="font-semibold text-slate-800 text-lg">Đánh giá chung</h3>
          <p className="text-slate-600 leading-relaxed text-sm">
            Kết quả của bạn đạt mức Rất Tốt so với mặt bằng chung của lớp. Phần kiến thức về Đạo hàm và Tích phân cơ bản được củng cố vững, tuy nhiên cần xem lại 3 câu sai ở phần ứng dụng hình học không gian.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Button variant="outline" className="gap-2 bg-white flex-1" disabled>
              <Target className="w-4 h-4" /> Xem chi tiết bài làm
              <span className="text-[10px] ml-1 bg-slate-100 px-2 py-0.5 rounded text-slate-500 border">Đã khóa</span>
            </Button>
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold text-white flex-1 shadow-md shadow-indigo-600/20">
              <RefreshCcw className="w-4 h-4 hidden sm:block" /> Làm lại (Còn 1 lần)
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/">
          <Button variant="ghost" className="gap-2 text-slate-500 hover:text-slate-900">
            <Home className="w-4 h-4" /> Quay về Trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
