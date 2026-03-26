"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      // Auto redirect to login
      router.push("/login?registered=success");
    } catch (err: any) {
      setError(err.message || "Không thể đăng ký. Email có thể đã tồn tại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tạo tài khoản mới</h1>
        <p className="text-slate-500">Trở thành đối tác giáo dục cùng 2Know</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100/50">
        <form onSubmit={handleRegister} className="space-y-5">
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
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              disabled={isLoading}
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
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              disabled={isLoading}
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
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              disabled={isLoading}
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
              value={formData.confirm}
              onChange={e => setFormData({...formData, confirm: e.target.value})}
              disabled={isLoading}
            />
          </div>

          <Button 
            className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium mt-2" 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đăng ký tài khoản
          </Button>

          <div className="text-xs text-center text-slate-500 mt-4 leading-relaxed">
            Bằng cách tạo tài khoản, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi.
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
