"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Settings, Users, BookOpen, Flag, CheckCircle, Clock, Award, Share2 } from "lucide-react";
import Link from "next/link";

const steps = [
  { id: 1, title: "Cài đặt chung", icon: Settings },
  { id: 2, title: "Người tham gia", icon: Users },
  { id: 3, title: "Câu hỏi", icon: BookOpen },
  { id: 4, title: "Cấu hình OMR", icon: CheckCircle }, // If applicable
  { id: 5, title: "Thời gian", icon: Clock },
  { id: 6, title: "Thang điểm", icon: Award },
  { id: 7, title: "Chống gian lận", icon: Flag },
  { id: 8, title: "Xuất bản", icon: Share2 },
];

export default function QuizBuilderWizard() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tạo bài kiểm tra mới</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Bước {currentStep} / {steps.length}: {steps[currentStep - 1].title}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/quizzes">Hủy</Link>
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
            Lưu nháp
          </Button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sidebar Stepper */}
        <Card className="w-64 flex-shrink-0 h-full overflow-y-auto">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isPast = step.id < currentStep;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                      isActive 
                        ? "bg-emerald-50 text-emerald-700" 
                        : isPast
                          ? "text-slate-700 hover:bg-slate-50"
                          : "text-muted-foreground hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${
                      isActive ? "border-emerald-500 bg-white" : isPast ? "bg-emerald-100 border-emerald-200 text-emerald-600" : "border-slate-200"
                    }`}>
                      {isPast ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-[10px]">{step.id}</span>
                      )}
                    </div>
                    <span className="flex-1 text-left">{step.title}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-emerald-500" />}
                  </button>
                );
              })}
            </nav>
          </CardContent>
        </Card>

        {/* Dynamic Step Content Area */}
        <Card className="flex-1 h-full overflow-y-auto bg-white">
          <CardContent className="p-8">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {(() => {
                    const Icon = steps[currentStep - 1].icon;
                    return <Icon className="w-5 h-5 text-emerald-600" />;
                  })()}
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Cấu hình các thông số cho phần {steps[currentStep - 1].title.toLowerCase()}.
                </p>
              </div>
              
              {/* Dynamic content for current step */}
              {currentStep === 4 ? (
                <div className="space-y-6">
                  <div className="grid gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium">Định dạng giấy OMR</label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <option>Phiếu 50 câu (mẫu A4)</option>
                        <option>Phiếu 120 câu (mẫu A4)</option>
                        <option>Phiếu tiếng Anh IELTS (kèm tự luận)</option>
                      </select>
                      <p className="text-xs text-muted-foreground">Chọn mẫu phiếu tô trắc nghiệm được hệ thống chuẩn hóa để in cho học sinh.</p>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      <label className="text-sm font-medium">Bố cục câu hỏi</label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4 cursor-pointer border-emerald-500 bg-emerald-50 relative">
                          <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-emerald-600" />
                          <h4 className="font-medium text-sm">Cơ bản (A, B, C, D)</h4>
                          <p className="text-xs text-slate-500 mt-1">4 đáp án tiêu chuẩn</p>
                        </div>
                        <div className="border rounded-lg p-4 cursor-pointer hover:bg-slate-50">
                          <h4 className="font-medium text-sm">Đúng/Sai (A, B)</h4>
                          <p className="text-xs text-slate-500 mt-1">Phân loại Đúng hoặc Sai</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between border p-4 rounded-lg bg-slate-50">
                      <div>
                        <h4 className="text-sm font-medium">Nhận diện SBD tự động</h4>
                        <p className="text-xs text-muted-foreground mt-1">Sử dụng AI để tự động map SBD với danh sách học sinh</p>
                      </div>
                      <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-lg bg-slate-50">
                  <p className="text-muted-foreground text-sm">
                    Form UI cho phần {steps[currentStep - 1].title} sẽ được render tại đây.
                  </p>
                </div>
              )}

              {/* Wizard Navigations */}
              <div className="flex justify-between pt-6 border-t mt-auto">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Quay lại
                </Button>
                {currentStep < steps.length ? (
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  >
                    Tiếp tục
                  </Button>
                ) : (
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Xuất bản ngay
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
