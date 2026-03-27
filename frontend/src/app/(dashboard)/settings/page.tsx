"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { User, Palette, Shield, Bell, Save, Loader2, Moon, Sun, Monitor, Check, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { useTranslation } from "@/context/LanguageContext";

const themes = [
  { id: "indigo", label: "Indigo", color: "bg-indigo-600" },
  { id: "emerald", label: "Xanh lá", color: "bg-emerald-600" },
  { id: "rose", label: "Hồng", color: "bg-rose-500" },
  { id: "amber", label: "Cam", color: "bg-amber-500" },
  { id: "violet", label: "Tím", color: "bg-violet-600" },
  { id: "slate", label: "Xám", color: "bg-slate-700" },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("indigo");
  const [fullName, setFullName] = useState(user?.full_name || "");

  const tabs = [
    { id: "account", label: "account", icon: User },
    { id: "appearance", label: "appearance", icon: Palette },
    { id: "security", label: "security", icon: Shield },
    { id: "notifications", label: "notifications", icon: Bell },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ full_name: fullName }),
      });
      toast.success(t("settings.account.save") + " ✓");
    } catch (err: any) {
      toast.error("Lỗi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("settings.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("settings.subtitle")}
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
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                  {t("settings.account.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg ring-4 ring-white">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">{t("settings.account.changeAvatar")}</Button>
                    <p className="text-xs text-muted-foreground mt-2">{t("settings.account.avatarHint")}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("settings.account.fullName")}</Label>
                      <Input defaultValue={user?.name || ""} className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("settings.account.email")}</Label>
                      <Input defaultValue={user?.email || ""} className="h-10" disabled />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("settings.account.role")}</Label>
                      <Input value={t("settings.account.roleValue")} className="h-10" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("settings.account.plan")}</Label>
                      <div className="flex items-center gap-2 h-10">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold">{t("settings.account.free")}</span>
                        <Button variant="link" className="text-indigo-600 text-xs p-0 h-auto">{t("settings.account.upgradePro")}</Button>
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
                    {t("settings.account.save")}
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
                  {t("settings.appearance.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Color Mode */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">{t("settings.appearance.displayMode")}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: "light", label: t("theme.light"), icon: Sun },
                      { id: "dark", label: t("theme.dark"), icon: Moon },
                      { id: "eye-care", label: t("theme.eyecare"), icon: BookOpen },
                      { id: "system", label: t("theme.system"), icon: Monitor },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setTheme(mode.id as "light" | "dark" | "system")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                          theme === mode.id
                            ? "border-indigo-500 bg-indigo-50 shadow-sm"
                            : "border-border hover:border-border hover:bg-muted"
                        }`}
                      >
                        <mode.icon className={`w-6 h-6 ${theme === mode.id ? "text-indigo-600" : "text-slate-400"}`} />
                        <span className={`text-sm font-medium ${theme === mode.id ? "text-indigo-700" : "text-muted-foreground"}`}>
                          {mode.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Colors */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">{t("settings.appearance.colorPalette")}</Label>
                  <div className="grid grid-cols-6 gap-3">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                          selectedTheme === theme.id
                            ? "border-indigo-500 bg-muted shadow-sm"
                            : "border-transparent hover:border-border"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full ${theme.color} shadow-inner flex items-center justify-center`}>
                          {selectedTheme === theme.id && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t("settings.appearance.apply")}
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
                  {t("settings.security.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>{t("settings.security.currentPassword")}</Label>
                    <Input type="password" className="h-10 max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("settings.security.newPassword")}</Label>
                    <Input type="password" className="h-10 max-w-md" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("settings.security.confirmPassword")}</Label>
                    <Input type="password" className="h-10 max-w-md" />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted border">
                  <h4 className="text-sm font-medium text-card-foreground">{t("settings.security.session")}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{t("settings.security.sessionInfo")}</p>
                  <div className="flex items-center gap-3 mt-3 p-3 bg-background border rounded-md">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Monitor className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">{t("settings.security.currentSession")}</p>
                      <p className="text-xs text-muted-foreground">Phiên hiện tại • Hoạt động</p>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-semibold rounded-full">{t("settings.security.active")}</span>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t("settings.security.changePassword")}
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
                  {t("settings.notifications.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Email khi có bài nộp mới", desc: "Nhận email mỗi khi học sinh hoàn thành bài kiểm tra", on: true },
                  { label: "Thông báo tóm tắt hàng ngày", desc: "Nhận tổng kết hoạt động lớp học mỗi ngày qua email", on: false },
                  { label: "Cảnh báo gian lận", desc: "Thông báo ngay lập tức khi phát hiện hành vi đáng ngờ", on: true },
                  { label: "Nhắc nhở báo cáo đánh giá", desc: "Nhắc bạn xem báo cáo phân tích phổ điểm hàng tuần", on: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted transition-colors">
                    <div>
                      <h4 className="text-sm font-medium text-card-foreground">{item.label}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${item.on ? "bg-indigo-500" : "bg-slate-200"}`}>
                      <div className={`w-4 h-4 bg-background rounded-full absolute top-0.5 shadow-sm transition-all ${item.on ? "right-0.5" : "left-0.5"}`}></div>
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
