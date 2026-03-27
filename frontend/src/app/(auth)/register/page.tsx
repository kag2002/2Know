"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, GraduationCap, Eye, EyeOff, CheckCircle, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (formData.password !== formData.confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify({ full_name: formData.name, email: formData.email, password: formData.password }),
      });
      router.push("/login?registered=success");
    } catch (err: any) {
      setError(err.message || "Không thể đăng ký. Email có thể đã tồn tại.");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "Tạo bài kiểm tra không giới hạn",
    "Chấm điểm tự động bằng AI",
    "Phân tích phổ điểm chuyên sâu",
    "Hỗ trợ chống gian lận nâng cao",
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Tạo tài khoản Giáo viên</h1>
        <p className="text-muted-foreground">Bắt đầu miễn phí, không cần thẻ tín dụng</p>
      </div>

      {/* Benefits List */}
      <div className="grid grid-cols-2 gap-2">
        {benefits.map((b, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-emerald-50/50 border border-emerald-100 rounded-lg px-3 py-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium">{b}</span>
          </div>
        ))}
      </div>

      <div className="bg-card text-card-foreground p-8 rounded-xl shadow-sm border border-border">
        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button className="h-11 flex items-center justify-center gap-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium text-foreground transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>
          <button className="h-11 flex items-center justify-center gap-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium text-foreground transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground font-medium">Hoặc đăng ký bằng Email</span></div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-rose-600 border border-rose-200 bg-rose-50 rounded-md animate-in fade-in duration-300">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="full_name">Họ và Tên</Label>
            <Input 
              id="full_name" 
              type="text" 
              placeholder="Nguyễn Văn A" 
              required 
              className="h-11 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Địa chỉ Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@school.edu.vn" 
              required 
              className="h-11 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPw ? "text" : "password"} 
                required 
                className="h-11 pr-10 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]"
                placeholder="Ít nhất 6 ký tự"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirm">Xác nhận mật khẩu</Label>
            <Input 
              id="password_confirm" 
              type="password" 
              required 
              className="h-11 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]"
              placeholder="Nhập lại mật khẩu"
              value={formData.confirm}
              onChange={e => setFormData({...formData, confirm: e.target.value})}
              disabled={isLoading}
            />
          </div>

          <Button 
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold mt-2 shadow-md shadow-indigo-600/20 gap-2 text-base" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản miễn phí"}
          </Button>

          <div className="text-xs text-center text-slate-500 mt-4 leading-relaxed">
            Bằng cách đăng ký, bạn đồng ý với{" "}
            <a href="#" className="underline text-indigo-600 hover:text-indigo-500">Điều khoản</a> và{" "}
            <a href="#" className="underline text-indigo-600 hover:text-indigo-500">Bảo mật</a> của 2Know.
          </div>
        </form>
      </div>

      <div className="text-center text-sm text-slate-500">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
