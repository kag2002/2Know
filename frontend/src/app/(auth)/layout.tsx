import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Information/Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 border-r border-slate-800 flex-col p-12 text-white justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900/20 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full z-0"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="2Know" width={40} height={40} className="rounded-full shadow-lg" />
            <span className="text-2xl font-bold tracking-tight">2Know Plus</span>
          </div>
          <p className="max-w-md mt-6 text-lg text-slate-300 leading-relaxed">
            Nền tảng thi và giáo dục trực tuyến toàn diện được tích hợp AI. Tiết kiệm 80% thời gian chấm thi và phân tích phổ điểm ngay tức thì.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex max-w-sm gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mt-1">✓</div>
            <div>
              <h4 className="font-semibold text-lg">Định dạng đa dạng</h4>
              <p className="text-sm text-slate-400 mt-1">Hỗ trợ trắc nghiệm, tự luận, OMR chấm bằng AI siêu tốc.</p>
            </div>
          </div>
          <div className="flex max-w-sm gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mt-1">✓</div>
            <div>
              <h4 className="font-semibold text-lg">Phân tích chuyên sâu</h4>
              <p className="text-sm text-slate-400 mt-1">Báo cáo phổ điểm trực quan giúp cá nhân hóa lộ trình học.</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-muted-foreground">
          © {new Date().getFullYear()} 2Know Clone System. All rights reserved.
        </div>
      </div>

      {/* Right side - Form/Action */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background relative">
        {/* Mobile Header */}
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <Image src="/logo.png" alt="2Know" width={32} height={32} className="rounded-full" />
          <span className="font-bold text-foreground tracking-tight">2Know</span>
        </div>
        
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
