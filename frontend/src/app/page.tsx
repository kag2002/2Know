"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Layout, Zap, Shield, BarChart3, Users, Star } from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b pb-4 pt-4' : 'bg-transparent pt-6 pb-6'}`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${scrolled ? 'bg-indigo-600' : 'bg-slate-900'}`}>
              <span className="text-white text-xl font-black">2</span>
            </div>
            <span className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>Know</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
            <Link href="#features" className="hover:text-indigo-600 transition-colors">Tính năng</Link>
            <Link href="#solution" className="hover:text-indigo-600 transition-colors">Giải pháp</Link>
            <Link href="#pricing" className="hover:text-indigo-600 transition-colors">Bảng giá</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-semibold px-4 hover:bg-slate-100/50">Đăng nhập</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 rounded-full px-6 font-semibold">
                Đăng ký miễn phí
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[40rem] bg-gradient-to-b from-indigo-50/80 via-white to-slate-50 pointer-events-none"></div>
        <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-20 -left-20 w-[30rem] h-[30rem] bg-purple-200/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 font-medium text-sm shadow-sm">
              <SparkleIcon className="w-4 h-4" /> Nền tảng đánh giá giáo dục thế hệ mới
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Tổ chức thi trực tuyến<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                nhanh gọn & tối ưu
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              2Know/QuizLM cung cấp giải pháp toàn diện cho Giáo viên và Nhà trường trong việc ra đề, giám sát thi online và chấm điểm tự động tích hợp bảng phân tích dữ liệu chuyên nghiệp.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-base font-bold rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 w-full sm:w-auto">
                  Trải nghiệm miễn phí <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-full border-2 bg-white/50 backdrop-blur-sm w-full sm:w-auto">
                  Vào Trang Quản Trị
                </Button>
              </Link>
            </div>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="mt-16 lg:mt-24 relative max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-200 fill-mode-both">
            <div className="rounded-2xl border bg-white shadow-2xl overflow-hidden ring-1 ring-slate-900/5">
              <div className="h-8 bg-slate-100 border-b flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent z-10"></div>
                {/* Fake App Content for Visual */}
                <div className="h-[400px] bg-slate-50 flex">
                  <div className="w-64 bg-white border-r p-4 space-y-4">
                    <div className="h-8 w-24 bg-slate-200 rounded animate-pulse"></div>
                    <div className="space-y-2 pt-4">
                      {[1,2,3,4].map(i => <div key={i} className="h-10 border border-slate-100 bg-slate-50 rounded-md"></div>)}
                    </div>
                  </div>
                  <div className="flex-1 p-8 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="h-10 w-48 bg-slate-200 rounded animate-pulse"></div>
                      <div className="h-10 w-32 bg-indigo-200 rounded animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      {[1,2,3].map(i => <div key={i} className="h-32 bg-white border rounded-xl shadow-sm"></div>)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorator cards floating */}
            <div className="hidden lg:flex absolute -left-12 top-32 bg-white p-4 rounded-xl shadow-xl border animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><CheckCircle2 className="w-6 h-6" /></div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Chấm điểm tự động</p>
                  <p className="text-xs text-slate-500">Mất 0.1s thay vì 3 giờ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Tính năng vượt trội của nền tảng</h2>
            <p className="text-slate-600 text-lg">Mọi thứ bạn cần để tổ chức kỳ thi đều được thiết kế tối ưu, gọn nhẹ và bảo mật nhất.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Layout />} title="Wizard Soạn đề thông minh" 
              desc="8 bước thiết lập bài thi mạnh mẽ, từ câu hỏi đến anti-cheat, tất cả trong một luồng làm việc duy nhất." 
            />
            <FeatureCard 
              icon={<Shield />} title="Giám sát chống gian lận" 
              desc="Công nghệ khóa tab (Fullscreen), chặn copy/paste và AI camera giúp kết quả đánh giá trung thực tuyệt đối." 
            />
            <FeatureCard 
              icon={<BarChart3 />} title="Thống kê chuyên sâu" 
              desc="Báo cáo phân tích phổ điểm, cảnh báo câu hỏi dễ/khó giúp điều chỉnh giáo án kịp thời." 
            />
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "12,000+", label: "Giáo viên tin dùng" },
              { value: "850K+", label: "Bài thi đã tạo" },
              { value: "4.2M+", label: "Lượt làm bài" },
              { value: "99.9%", label: "Uptime hệ thống" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{stat.value}</div>
                <p className="text-slate-400 mt-2 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">Bảng giá đơn giản, minh bạch</h2>
            <p className="text-slate-600 text-lg">Bắt đầu miễn phí. Nâng cấp khi bạn cần mở rộng quy mô.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition-all">
              <h3 className="text-lg font-bold text-slate-800">Miễn phí</h3>
              <p className="text-slate-500 text-sm mt-1">Dành cho giáo viên cá nhân</p>
              <div className="my-6">
                <span className="text-4xl font-black text-slate-900">0đ</span>
                <span className="text-slate-500 text-sm">/tháng</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 mb-8">
                {["5 bài kiểm tra/tháng", "50 học sinh", "Chấm tự động trắc nghiệm", "Báo cáo cơ bản"].map(f => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/register">
                <Button variant="outline" className="w-full h-11 font-semibold">Bắt đầu miễn phí</Button>
              </Link>
            </div>

            {/* Pro — Highlighted */}
            <div className="bg-white rounded-2xl border-2 border-indigo-500 p-8 shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Phổ biến nhất</div>
              <h3 className="text-lg font-bold text-slate-800">Pro</h3>
              <p className="text-slate-500 text-sm mt-1">Dành cho tổ bộ môn & trường nhỏ</p>
              <div className="my-6">
                <span className="text-4xl font-black text-indigo-600">199K</span>
                <span className="text-slate-500 text-sm">/tháng</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 mb-8">
                {["Không giới hạn bài kiểm tra", "500 học sinh", "Chấm điểm OMR (AI)", "Chống gian lận nâng cao", "Thống kê phổ điểm", "Hỗ trợ ưu tiên"].map(f => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link href="/register">
                <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20">Nâng cấp Pro</Button>
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-lg transition-all">
              <h3 className="text-lg font-bold text-slate-800">Enterprise</h3>
              <p className="text-slate-500 text-sm mt-1">Dành cho trường học & sở GD</p>
              <div className="my-6">
                <span className="text-4xl font-black text-slate-900">Liên hệ</span>
              </div>
              <ul className="space-y-3 text-sm text-slate-600 mb-8">
                {["Mọi tính năng Pro", "Không giới hạn học sinh", "AI tạo đề tự động", "Tích hợp LMS/API", "SLA 99.9%", "Quản lý đa chi nhánh"].map(f => (
                  <li key={f} className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />{f}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full h-11 font-semibold">Liên hệ Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Sẵn sàng nâng cấp trải nghiệm thi?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">Hơn 12,000 giáo viên đã tin tưởng 2Know để tổ chức hàng triệu bài thi. Tham gia ngay hôm nay.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 text-base font-bold rounded-full bg-white text-indigo-700 hover:bg-indigo-50 shadow-xl w-full sm:w-auto">
                Đăng ký miễn phí <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-10 text-base font-bold rounded-full border-2 border-white/30 text-white hover:bg-white/10 w-full sm:w-auto">
                Dùng thử Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 pt-20 pb-10 border-t border-slate-800 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2 text-white">
               <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                 <span className="font-black">2</span>
               </div>
               <span className="text-xl font-bold tracking-tight">Know</span>
              </div>
              <p className="max-w-sm">
                Nền tảng thi và đánh giá trực tuyến cho giáo viên & hệ thống giáo dục. Được thiết kế tối ưu cho hàng triệu học viên.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Sản phẩm</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Tính năng</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Bảng giá</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Hướng dẫn Tích hợp</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Công ty</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Điều khoản</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Bảo mật</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2026 2Know Platform. Bản quyền phiên bản UI Clone.</p>
            <div className="flex items-center gap-1">Made with Next.js & Go by <span className="font-semibold text-white">Antigravity</span></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 hover:shadow-lg hover:border-indigo-100 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-white border shadow-sm flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
    </div>
  );
}

function SparkleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
