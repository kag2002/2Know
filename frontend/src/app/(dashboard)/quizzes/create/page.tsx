"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Settings, Users, BookOpen, Flag, CheckCircle, Clock, Award, Share2 } from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { QuestionBuilder } from "@/components/dashboard/QuestionBuilder";

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

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function QuizBuilderWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    grade_level: "",
    time_limit_minutes: 0,
    max_attempts: 1,
    quiz_type: "online",
    omr_template: "",
    access_type: "public",
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (status: string = "draft") => {
    if (!formData.title) {
      alert("Vui lòng nhập tên bài kiểm tra");
      setCurrentStep(1);
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/quizzes", {
        method: "POST",
        body: JSON.stringify({ ...formData, status })
      });
      router.push("/quizzes");
    } catch (err: any) {
      alert("Lỗi lưu bài kiểm tra: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
          <Link href="/quizzes" className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            Hủy
          </Link>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => handleSave("draft")}
            disabled={loading}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Tên bài kiểm tra <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={(e) => updateForm("title", e.target.value)}
                        placeholder="VD: Kiểm tra Toán 15 Phút - Đại Số" 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mô tả hoặc Hướng dẫn bài làm</label>
                      <textarea 
                        value={formData.description}
                        onChange={(e) => updateForm("description", e.target.value)}
                        placeholder="VD: Đọc kỹ đề bài trước khi làm. Không được sử dụng tài liệu..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                        <label className="text-sm font-medium">Môn học / Chuyên mục</label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                          <option value="">-- Chọn Môn học --</option>
                          <option>Toán học</option>
                          <option>Ngữ văn</option>
                          <option>Tiếng Anh</option>
                          <option>Vật lý</option>
                          <option>Khác</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Lớp / Cấp độ</label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                          <option value="">-- Chọn Cấp độ --</option>
                          <option>Tiểu học</option>
                          <option>THCS</option>
                          <option>THPT</option>
                          <option>Đại học / Tự do</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid gap-6">
                    <div className="border rounded-lg p-5 flex items-start gap-4">
                      <div className="mt-0.5">
                        <input type="radio" id="public" name="assign" value="public" className="w-4 h-4 text-emerald-600" defaultChecked />
                      </div>
                      <div className="grid gap-1">
                        <label htmlFor="public" className="font-medium text-sm">Công khai (Ai có link cũng làm được)</label>
                        <p className="text-xs text-muted-foreground">Phù hợp cho thi thử, làm bài tự do. Hệ thống có thể yêu cầu điền tên trước khi làm.</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-5 flex items-start gap-4 border-emerald-500 bg-emerald-50/30">
                      <div className="mt-0.5">
                        <input type="radio" id="assigned" name="assign" value="assigned" className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="grid gap-4 w-full">
                        <div>
                          <label htmlFor="assigned" className="font-medium text-sm">Chỉ định lớp học</label>
                          <p className="text-xs text-muted-foreground mt-1">Giao bài cho một hoặc nhiều lớp cụ thể, chỉ học sinh trong lớp mới xem và làm được.</p>
                        </div>
                        <div className="bg-white p-4 border rounded-md">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-slate-500">DANH SÁCH LỚP HỌC CỦA BẠN</label>
                            <div className="space-y-2 mt-2 max-h-[150px] overflow-y-auto pr-2">
                              {['Lớp 11A1 - Toán', 'Lớp 11A2 - Toán', 'Đội tuyển HSG Lớp 10'].map(cls => (
                                <div key={cls} className="flex items-center space-x-2 border p-2.5 rounded-md hover:bg-slate-50 cursor-pointer">
                                  <input type="checkbox" id={cls} className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                                  <label htmlFor={cls} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                    {cls}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <QuestionBuilder />
              )}

              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in duration-300">
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
              )}

              {currentStep === 5 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Thời gian làm bài (Phút)</label>
                        <input type="number" placeholder="Bỏ trống nếu không giới hạn" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Số lần làm lại tối đa</label>
                        <input type="number" placeholder="Mặc định: 1" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Thời gian mở bài thi</label>
                        <input type="datetime-local" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Thời gian đóng bài thi (Deadline)</label>
                        <input type="datetime-local" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid gap-6">
                    <div className="border rounded-lg p-5 flex items-center justify-between bg-slate-50">
                      <div>
                        <h4 className="font-medium text-sm">Hiển thị kết quả sau khi thi xong</h4>
                        <p className="text-xs text-muted-foreground mt-1">Học sinh sẽ thấy điểm vả giải thích đáp án ngay lập tức</p>
                      </div>
                      <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-5 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">Hình phạt điểm (Trừ điểm khi làm sai)</h4>
                        <p className="text-xs text-muted-foreground mt-1">Trừ % điểm của câu hỏi nếu học sinh chọn sai đáp án</p>
                      </div>
                      <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 7 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid gap-4">
                    <div className="border rounded-lg p-5 flex items-center justify-between bg-emerald-50/50 border-emerald-200">
                      <div>
                        <h4 className="font-medium text-sm">Chế độ toàn màn hình (Fullscreen)</h4>
                        <p className="text-xs text-muted-foreground mt-1">Cảnh báo và lưu log nếu thí sinh tự ý thoát tab bài làm ra ngoài</p>
                      </div>
                      <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-5 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">Chống sao chép (Copy / Paste)</h4>
                        <p className="text-xs text-muted-foreground mt-1">Vô hiệu hóa chuột phải và tổ hợp phím sao chép văn bản trong lúc làm bài</p>
                      </div>
                      <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-5 flex items-center justify-between opacity-50 cursor-not-allowed">
                      <div>
                        <h4 className="font-medium text-sm flex gap-2 items-center">Chống gian lận bằng AI Camera <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">PRO</span></h4>
                        <p className="text-xs text-muted-foreground mt-1">Theo dõi hành vi và phát hiện nhiều khuôn mặt trước camera.</p>
                      </div>
                      <div className="w-10 h-5 bg-slate-200 rounded-full relative">
                        <div className="w-4 h-4 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 8 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-green-200 rounded-xl">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                      <Share2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Mọi thứ đã sẵn sàng!</h3>
                    <p className="text-slate-500 mt-2 max-w-sm text-sm">
                      Bài kiểm tra của bạn đã được lưu tự động. Bạn có thể xuất bản ngay bây giờ để gửi tới người tham gia.
                    </p>
                  </div>
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
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleSave("published")}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
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
