"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useParams } from "next/navigation";

interface Player {
  id: string;
  name: string;
  score: number;
  correct: number;
  timeTaken: number;
}

export function LiveLeaderboard() {
  const params = useParams();
  const quizId = params.id as string;
  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  useEffect(() => {
    if (!quizId) return;

    // Build WebSocket URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace(/^http(s?):\/\//, "")
      : "localhost:8080";
    
    // Fallback URL for local dev
    const wsUrl = `${protocol}//${host}/ws/live/${quizId}`;
    
    const socket = new WebSocket(wsUrl);

    let pingInterval: NodeJS.Timeout;

    socket.onopen = () => {
      setStatus("connected");
      pingInterval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send("ping");
        }
      }, 15000); // 15 seconds keep-alive
    };

    socket.onclose = () => {
      setStatus("disconnected");
      clearInterval(pingInterval);
    };

    socket.onmessage = (event) => {
      if (event.data === "pong") return;
      try {
        const payload = JSON.parse(event.data);
        if (payload.action === "SCORE_UPDATE") {
          setPlayers((prev) => {
            const existingIdx = prev.findIndex((p) => p.id === payload.student_id);
            const nextState = [...prev];
            
            const pData = {
              id: payload.student_id || Math.random().toString(),
              name: payload.student_name,
              score: payload.score,
              correct: payload.correct,
              timeTaken: payload.time_taken,
            };

            if (existingIdx !== -1) {
              nextState[existingIdx] = pData;
            } else {
              nextState.push(pData);
            }

            // Sort Descending by Score, Ascending by Time (if tie)
            return nextState.sort((a, b) => {
              if (b.score !== a.score) return b.score - a.score;
              return a.timeTaken - b.timeTaken;
            });
          });
        }
      } catch (e) {
        console.error("WS Parse error", e);
      }
    };

    return () => {
      socket.close();
      clearInterval(pingInterval);
    };
  }, [quizId]);

  const getRankStyle = (index: number) => {
    switch(index) {
      case 0: return "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700/50 dark:text-amber-400";
      case 1: return "bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300";
      case 2: return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:border-orange-800/50 dark:text-orange-400";
      default: return "bg-card text-foreground border-border";
    }
  };

  const getRankIcon = (index: number) => {
    switch(index) {
      case 0: return <Trophy className="w-6 h-6 text-amber-500" />;
      case 1: return <Medal className="w-6 h-6 text-slate-500" />;
      case 2: return <Medal className="w-6 h-6 text-orange-500" />;
      default: return <span className="font-bold text-slate-400 w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Live Leaderboard</h2>
          <p className="text-muted-foreground mt-1">Bảng xếp hạng thời gian thực</p>
        </div>
        <div className="flex items-center gap-2">
          {status === "connecting" && (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-500 text-sm font-medium border">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
              </span>
              Đang kết nối...
            </span>
          )}
          {status === "connected" && (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-sm font-medium border border-emerald-100 dark:border-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Wifi className="w-4 h-4" /> Live
            </span>
          )}
          {status === "disconnected" && (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 text-sm font-medium border border-rose-100 dark:border-rose-800">
              <WifiOff className="w-4 h-4" /> Mất kết nối
            </span>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-slate-50/50 dark:bg-slate-900/20 shadow-inner p-4 min-h-[400px]">
        {players.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">Chưa có học sinh nào nộp bài</p>
          </div>
        ) : (
          <motion.div layout className="flex flex-col gap-3">
            <AnimatePresence>
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 24, 
                    mass: 0.8
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 shadow-sm ${getRankStyle(index)} backdrop-blur-sm transition-all`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 flex justify-center shrink-0">
                      {getRankIcon(index)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center font-bold text-lg shadow-sm">
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-lg leading-tight">{player.name}</span>
                        <span className="text-xs opacity-75 font-medium tracking-wide">
                          {player.timeTaken > 0 ? `Thời gian: ${Math.floor(player.timeTaken / 60)} phút ${player.timeTaken % 60} giây` : "Chưa xác định"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-black">{player.score}</span>
                      <span className="text-xs font-semibold opacity-70 mb-1 leading-tight">điểm</span>
                    </div>
                    <span className="text-xs opacity-80 font-medium bg-white/40 dark:bg-black/30 px-2 py-0.5 rounded-full mt-1">
                      Đúng {player.correct} câu
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
