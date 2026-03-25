"use client";

import { Bell, Search, PanelLeftClose } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <Button variant="outline" size="icon" className="h-8 w-8 hidden md:flex">
          <PanelLeftClose className="h-4 w-4" />
        </Button>
        
        <div className="max-w-xl w-full relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Tìm kiếm, chạy lệnh hoắc hỏi..." 
            className="w-full pl-9 bg-muted/50 h-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-pink-500 rounded-full"></span>
        </Button>
      </div>
    </header>
  );
}
