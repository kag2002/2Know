"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { User, Palette, Shield, Bell, Save, Loader2, Moon, Sun, Monitor, Check } from "lucide-react";
import { toast } from "sonner";

const themes = [
  { id: "indigo", label: "Indigo", color: "bg-indigo-600" },
  { id: "emerald", label: "Xanh lá", color: "bg-emerald-600" },
  { id: "rose", label: "Hồng", color: "bg-rose-500" },
  { id: "amber", label: "Cam", color: "bg-amber-500" },
  { id: "violet", label: "Tím", color: "bg-violet-600" },
  { id: "slate", label: "Xám", color: "bg-slate-700" },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("indigo");

  const tabs = [
    { id: "account", label: "Tài khoản", icon: User },
    { id: "appearance", label: "Giao diện", icon: Palette },
    { id: "security", label: "Bảo mật", icon: Shield },
    { id: "notifications", label: "Thông báo", icon: Bell },
  ];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Đã lưu cài đặt thành công!");
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cài đặt</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý tài khoản, giao diện và tùy chỉnh cá nhân của bạn.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Tab Navigation */}
        <nav className="w-56 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "account" && (
            <Card className="shadow-sm animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" />
                  Thông tin tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Thay đổi ảnh đại diện</Button>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG hoặc GIF. Tối đa 2MB.</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Họ và Tên</Label>
                      <Input defaultValue={user?.name || ""} className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input defaultValue={user?.email || ""} className="h-10" disabled />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Vai trò</Label>
                      <Input value="Giáo viên" className="h-10" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Gói dịch vụ</Label>
                      <div className="flex items-center gap-2 h-10">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">Miễn phí</span>
                        <Button variant="link" className="text-indigo-600 text-xs p-0 h-auto">Nâng cấp Pro →</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Lưu thay đổi
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "appearance" && (
            <Card className="shadow-sm animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-indigo-500" />
                  Tùy chỉnh giao diện
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Color Mode */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Chế độ hiển thị</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "light", label: "Sáng", icon: Sun },
                      { id: "dark", label: "Tối", icon: Moon },
                      { id: "system", label: "Hệ thống", icon: Monitor },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setTheme(mode.id as "light" | "dark" | "system")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                          theme === mode.id
                            ? "border-indigo-500 bg-indigo-50 shadow-sm"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <mode.icon className={`w-6 h-6 ${theme === mode.id ? "text-indigo-600" : "text-slate-400"}`} />
                        <span className={`text-sm font-medium ${theme === mode.id ? "text-indigo-700" : "text-slate-600"}`}>
                          {mode.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Colors */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Bảng màu chủ đạo</Label>
                  <div className="grid grid-cols-6 gap-3">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                          selectedTheme === theme.id
                            ? "border-indigo-500 bg-slate-50 shadow-sm"
                            : "border-transparent hover:border-slate-200"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full ${theme.color} shadow-inner flex items-center justify-center`}>
                          {selectedTheme === theme.id && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-[11px] font-medium text-slate-600">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Áp dụng
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="shadow-sm animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  Bảo mật tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Mật khẩu hiện tại</Label>
                    <Input type="password" className="h-10 max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mật khẩu mới</Label>
                    <Input type="password" className="h-10 max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label>Xác nhận mật khẩu mới</Label>
                    <Input type="password" className="h-10 max-w-md" />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 border">
                  <h4 className="text-sm font-medium text-slate-800">Phiên đăng nhập</h4>
                  <p className="text-xs text-muted-foreground mt-1">Bạn đang đăng nhập trên 1 thiết bị</p>
                  <div className="flex items-center gap-3 mt-3 p-3 bg-white border rounded-md">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Monitor className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">macOS • Chrome</p>
                      <p className="text-xs text-muted-foreground">Phiên hiện tại • Hoạt động</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full">Đang dùng</span>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Đổi mật khẩu
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="shadow-sm animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-500" />
                  Cài đặt thông báo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Email khi có bài nộp mới", desc: "Nhận email mỗi khi học sinh hoàn thành bài kiểm tra", on: true },
                  { label: "Thông báo tóm tắt hàng ngày", desc: "Nhận tổng kết hoạt động lớp học mỗi ngày qua email", on: false },
                  { label: "Cảnh báo gian lận", desc: "Thông báo ngay lập tức khi phát hiện hành vi đáng ngờ", on: true },
                  { label: "Nhắc nhở báo cáo đánh giá", desc: "Nhắc bạn xem báo cáo phân tích phổ điểm hàng tuần", on: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="text-sm font-medium text-slate-800">{item.label}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${item.on ? "bg-indigo-500" : "bg-slate-200"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${item.on ? "right-0.5" : "left-0.5"}`}></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
