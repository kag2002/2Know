"use client";

import { LiveLeaderboard } from "@/components/dashboard/LiveLeaderboard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function LiveLeaderboardPage() {
  const params = useParams();
  const quizId = params.id as string;

  // Optional: Auto collapse sidebar logic or recommend F11
  useEffect(() => {
    // A trick to scroll to top to hide browser bars on mobile sometimes
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background/50 flex flex-col">
      <div className="p-4 border-b bg-card flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/quizzes">
            <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold flex items-center gap-2">
              <MonitorPlay className="w-4 h-4 text-indigo-500" /> 
              Màn hình Trình chiếu (Projector Mode)
            </h1>
            <p className="text-xs text-muted-foreground">Nhấn F11 hoặc Fn+F11 để bật toàn màn hình cho lớp học</p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 py-8 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-background to-background dark:from-slate-900">
        <LiveLeaderboard />
      </div>
    </div>
  );
}
