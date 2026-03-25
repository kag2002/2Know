"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("full_name");
    const email = formData.get("email");
    const password = formData.get("password");
    const passwordConfirm = formData.get("password_confirm");

    if (password !== passwordConfirm) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Đăng ký thất bại");
      }

      // Automatically login after register or redirect to login
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bắt đầu miễn phí</h1>
        <p className="text-sm text-slate-500">
          Chỉ mất 1 phút để trải nghiệm tạo đề thi Siêu tốc 
          bằng AI.
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
            <Label htmlFor="full_name">Họ và Tên</Label>
            <Input 
              id="full_name" 
              name="full_name" 
              type="text" 
              placeholder="Nguyễn Văn A" 
              required 
              className="h-11"
              disabled={loading}
            />
          </div>

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
            <Label htmlFor="password">Mật khẩu</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              required 
              className="h-11"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirm">Xác nhận mật khẩu</Label>
            <Input 
              id="password_confirm" 
              name="password_confirm" 
              type="password" 
              required 
              className="h-11"
              disabled={loading}
            />
          </div>

          <Button 
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-medium mt-2" 
            type="submit" 
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo tài khoản
          </Button>

          <div className="text-xs text-center text-slate-500 mt-4 leading-relaxed">
            Bằng cách tạo tài khoản, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi.
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
