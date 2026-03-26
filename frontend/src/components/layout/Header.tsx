"use client";

import { Bell, Search, PanelLeftClose, ChevronDown, Settings, LogOut, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export function Header() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b bg-background/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="outline" size="icon" className="h-8 w-8 hidden md:flex">
          <PanelLeftClose className="h-4 w-4" />
        </Button>
        
        <div className="max-w-xl w-full relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Tìm kiếm, chạy lệnh hoặc hỏi..." 
            className="w-full pl-9 bg-muted/50 h-9 transition-all duration-200 focus:bg-background focus:shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-pink-500 rounded-full animate-pulse"></span>
        </Button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-all duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-slate-800 leading-none">{user?.name || "User"}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">Giáo viên</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden md:block transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border p-1.5 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-3 py-2 border-b mb-1">
                <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <Settings className="w-4 h-4" />
                Cài đặt
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <User className="w-4 h-4" />
                Hồ sơ cá nhân
              </Link>
              <div className="border-t mt-1 pt-1">
                <button
                  onClick={() => { setShowDropdown(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
