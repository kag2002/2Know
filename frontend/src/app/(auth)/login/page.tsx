"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đăng nhập thất bại");
      }

      // Store token in cookie for middleware
      document.cookie = `quizlm_token=${data.token}; path=/; max-age=259200; Secure; SameSite=Lax`;
      // Store user data in localStorage for UI
      localStorage.setItem("quizlm_user", JSON.stringify(data.user));

      // Redirect
      router.push("/overview");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Chào mừng trở lại</h1>
        <p className="text-sm text-slate-500">
          Nhập email và mật khẩu của bạn để truy cập bảng điều khiển.
        </p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100/50">
        <form onSubmit={onSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-rose-600 border border-rose-200 bg-rose-50 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Địa chỉ Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="name@example.com" 
              required 
              className="h-11"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link href="/forgot-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
                Quên mật khẩu?
              </Link>
            </div>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              autoComplete="current-password"
              required 
              className="h-11"
              disabled={loading}
            />
          </div>

          <Button 
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium" 
            type="submit" 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đăng nhập
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Đăng ký miễn phí
          </Link>
        </div>
      </div>
    </div>
  );
}
