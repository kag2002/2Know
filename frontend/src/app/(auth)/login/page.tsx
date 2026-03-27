"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (searchParams.get("registered") === "success") {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        requireAuth: false,
        body: JSON.stringify({ email, password }),
      });
      login(data.token, data.user);
      toast.success("Đăng nhập thành công!");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      toast.error("Đăng nhập thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xl font-black">2</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Chào mừng trở lại</h1>
        <p className="text-muted-foreground">Đăng nhập để vào trang quản trị 2Know</p>
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
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground font-medium">Hoặc đăng nhập bằng Email</span></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-rose-600 border border-rose-200 bg-rose-50 rounded-md animate-in fade-in duration-300">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Địa chỉ Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@school.edu.vn" 
              required 
              className="h-11 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <Input 
                id="password" 
                type={showPw ? "text" : "password"} 
                autoComplete="current-password"
                required 
                className="h-11 pr-10 transition-all duration-200 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.1)]"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button 
            className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold mt-2 shadow-md shadow-indigo-600/20 gap-2 text-base" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-5 p-3 rounded-lg bg-amber-50 border border-amber-100 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-xs text-amber-700">
            <p className="font-semibold">Tài khoản Demo</p>
            <p className="mt-0.5">Email: <code className="bg-amber-100 px-1 rounded">demo@2know.edu.vn</code> • Mật khẩu: <code className="bg-amber-100 px-1 rounded">demo123</code></p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Đăng ký miễn phí
        </Link>
      </div>
    </div>
  );
}
