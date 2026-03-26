"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, MessageSquare, Star, ChevronDown, Eye, ThumbsUp, ThumbsDown, Search } from "lucide-react";
import { toast } from "sonner";

const pendingSubmissions = [
  { id: "1", student: "Nguyễn Thị Mai", quiz: "Kiểm tra Văn HK2", question: "Phân tích nhân vật Mỵ trong 'Vợ chồng A Phủ'", answer: "Nhân vật Mỵ là biểu tượng cho khát vọng tự do. Từ một cô gái xinh đẹp, yêu đời, Mỵ bị bắt về làm dâu gạt nợ, trở thành nô lệ trong nhà thống lý Pá Tra. Qua mùa xuân, sức sống tiềm tàng trỗi dậy...", submittedAt: "2h trước", maxScore: 3 },
  { id: "2", student: "Trần Văn Hoàng", quiz: "Kiểm tra Văn HK2", question: "So sánh hình ảnh người lái đò sông Đà với Huấn Cao", answer: "Cả hai đều là những con người tài hoa. Ông lái đò tài hoa trong nghệ thuật vượt thác, Huấn Cao tài hoa trong nghệ thuật viết chữ. Tuy nhiên, ông lái đò là người lao động bình thường, còn Huấn Cao là người anh hùng...", submittedAt: "3h trước", maxScore: 4 },
  { id: "3", student: "Lê Thị Hương", quiz: "Bài tập IELTS Writing", question: "Essay: 'The advantages of studying abroad outweigh the disadvantages'. Discuss.", answer: "In today's globalized world, studying abroad has become increasingly popular among students. While there are some drawbacks, I strongly believe the benefits far outweigh the disadvantages. Firstly, international education offers...", submittedAt: "5h trước", maxScore: 9 },
  { id: "4", student: "Phạm Đức Anh", quiz: "Kiểm tra Toán HK2", question: "Giải và biện luận phương trình: log₂(x+1) + log₂(x-1) = 3", answer: "ĐK: x > 1. Ta có: log₂[(x+1)(x-1)] = 3 => (x+1)(x-1) = 2³ = 8 => x² - 1 = 8 => x² = 9 => x = ±3. Kết hợp ĐK: x = 3. Vậy nghiệm duy nhất x = 3.", submittedAt: "6h trước", maxScore: 2 },
  { id: "5", student: "Võ Minh Tuấn", quiz: "Kiểm tra Sử HK2", question: "Trình bày nguyên nhân sâu xa dẫn đến Chiến tranh thế giới thứ nhất", answer: "Chiến tranh thế giới thứ nhất bùng nổ do nhiều nguyên nhân sâu xa: Mâu thuẫn giữa các nước đế quốc về vấn đề thuộc địa, sự hình thành hai khối quân sự đối lập (Liên minh và Hiệp ước), cuộc chạy đua vũ trang...", submittedAt: "1 ngày trước", maxScore: 3 },
];

export default function GradingPage() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [graded, setGraded] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const handleGrade = (id: string) => {
    if (scores[id] === undefined) {
      toast.error("Vui lòng nhập điểm trước khi chấm!");
      return;
    }
    setGraded(prev => [...prev, id]);
    toast.success(`Đã chấm điểm cho bài nộp #${id}`);
  };

  const filtered = pendingSubmissions.filter(s => 
    !graded.includes(s.id) && (
      s.student.toLowerCase().includes(search.toLowerCase()) ||
      s.quiz.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hàng chấm điểm</h1>
          <p className="text-muted-foreground mt-1">Chấm bài tự luận và câu trả lời mở đang chờ duyệt.</p>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold border border-amber-200">
            <Clock className="w-4 h-4" /> {filtered.length} bài chờ chấm
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Chờ chấm", value: filtered.length, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Đã chấm hôm nay", value: graded.length, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Điểm TB đã chấm", value: "7.8", icon: Star, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Phản hồi đã gửi", value: Object.keys(feedback).filter(k => feedback[k]).length, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Tìm theo tên học sinh hoặc bài kiểm tra..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-10 w-full rounded-md border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3"
        />
      </div>

      {/* Submission Queue */}
      <div className="space-y-4">
        {filtered.map((sub) => (
          <Card key={sub.id} className={`shadow-sm transition-all hover:shadow-md ${expanded === sub.id ? 'ring-2 ring-indigo-200' : ''}`}>
            {/* Collapsed Header */}
            <div 
              className="flex items-center justify-between p-5 cursor-pointer"
              onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center text-sm font-bold">
                  {sub.student.split(' ').pop()?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{sub.student}</p>
                  <p className="text-xs text-slate-500">{sub.quiz} • {sub.submittedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-medium">Tối đa: {sub.maxScore} điểm</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expanded === sub.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Expanded Content */}
            {expanded === sub.id && (
              <div className="px-5 pb-5 border-t animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="mt-4 space-y-4">
                  {/* Question */}
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Câu hỏi</p>
                    <p className="text-sm text-slate-700 font-medium">{sub.question}</p>
                  </div>

                  {/* Answer */}
                  <div className="p-4 bg-slate-50 border rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Câu trả lời của học sinh</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{sub.answer}</p>
                  </div>

                  {/* Grading Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Điểm số (/{sub.maxScore})</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          max={sub.maxScore}
                          step={0.5}
                          value={scores[sub.id] ?? ""}
                          onChange={e => setScores({...scores, [sub.id]: parseFloat(e.target.value)})}
                          className="h-10 w-24 px-3 rounded-md border bg-white text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="0"
                        />
                        <span className="text-slate-400 text-sm">/ {sub.maxScore}</span>
                        <div className="flex gap-1 ml-2">
                          <button onClick={() => setScores({...scores, [sub.id]: sub.maxScore})} className="p-1.5 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100" title="Điểm tối đa">
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button onClick={() => setScores({...scores, [sub.id]: 0})} className="p-1.5 rounded bg-rose-50 text-rose-600 hover:bg-rose-100" title="0 điểm">
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Nhận xét (tuỳ chọn)</label>
                      <input
                        type="text"
                        value={feedback[sub.id] ?? ""}
                        onChange={e => setFeedback({...feedback, [sub.id]: e.target.value})}
                        placeholder="VD: Bài viết tốt, cần bổ sung dẫn chứng..."
                        className="h-10 w-full px-3 rounded-md border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="outline" className="gap-2" onClick={() => setExpanded(null)}>
                      <Eye className="w-4 h-4" /> Bỏ qua
                    </Button>
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleGrade(sub.id)}>
                      <CheckCircle2 className="w-4 h-4" /> Xác nhận chấm
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="shadow-sm">
            <CardContent className="py-16 text-center">
              <CheckCircle2 className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Không còn bài nào cần chấm! 🎉</h3>
              <p className="text-slate-500 text-sm">Tất cả câu trả lời tự luận đã được chấm điểm.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
