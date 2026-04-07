"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useTranslation } from "@/context/LanguageContext";
import { Check, Trash2 } from "lucide-react";

interface RandomWheelProps {
  items: string[];
  colors?: string[];
  onWinner?: (winner: string) => void;
  onRemoveWinner?: (winner: string) => void;
  onKeepWinner?: (winner: string) => void;
}

const DEFAULT_COLORS = [
  "#6366f1", // indigo-500
  "#10b981", // emerald-500
  "#f43f5e", // rose-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#0ea5e9", // sky-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
];

export function RandomWheel({ items, colors = DEFAULT_COLORS, onWinner, onRemoveWinner, onKeepWinner }: RandomWheelProps) {
  const { t } = useTranslation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const currentRotation = useRef(0);
  const controls = useAnimation();

  // Ensure we have at least 2 items to draw a wheel
  const wheelItems = items.length > 0 ? items : ["Trống", "Trống..."];
  
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // We would ideally inject tiny base64 audio here or load from public folder
    spinSound.current = new Audio("/tick.mp3"); // placeholder
    winSound.current = new Audio("/tada.mp3");  // placeholder
  }, []);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleSpin = async () => {
    if (isSpinning || wheelItems.length === 0) return;
    setIsSpinning(true);
    setWinner(null);

    // Calculate rotation
    const minSpins = 5;
    const segments = wheelItems.length;
    const degreesPerSegment = 360 / segments;
    const winningSegmentIndex = Math.floor(Math.random() * segments);
    
    // The target rotation lands the arrow in the center of the winning slice
    const targetDegrees = (minSpins * 360) + (360 - (winningSegmentIndex * degreesPerSegment)) - (degreesPerSegment / 2);
    
    // Add some random wobble within the slice
    const wobble = (Math.random() - 0.5) * (degreesPerSegment * 0.8);
    
    const newRotation = currentRotation.current + targetDegrees + wobble;

    // Simulate sound tick
    let tickInterval: any;
    if (soundEnabled && spinSound.current) {
      // Simplified tick simulation during CSS transition time
      tickInterval = setInterval(() => {
        if (spinSound.current) {
          spinSound.current.currentTime = 0;
          spinSound.current.volume = 0.5;
          spinSound.current.play().catch(() => {});
        }
      }, 300);
    }

    await controls.start({
      rotate: newRotation,
      transition: {
        duration: 5,
        ease: [0.2, 0.8, 0.1, 1], // Custom slow-down curve
      }
    });

    currentRotation.current = newRotation % 360; // normalize
    setIsSpinning(false);
    
    const result = wheelItems[winningSegmentIndex];
    setWinner(result);
    triggerConfetti();
    
    if (soundEnabled && winSound.current) {
      clearInterval(tickInterval);
      winSound.current.currentTime = 0;
      winSound.current.volume = 1;
      winSound.current.play().catch(() => {});
    }

    if (onWinner) {
      onWinner(result);
    }
  };

  const renderSegments = () => {
    const segments = wheelItems.length;
    const degreesPerSegment = 360 / segments;
    
    return wheelItems.map((item, index) => {
      const rotation = index * degreesPerSegment;
      const color = colors[index % colors.length];
      
      // Calculate SVG path for wedge
      const radius = 50; // Use relative units (50%) for the circle
      
      // If 1 item, return a full circle
      if (segments === 1) {
        return <circle key={index} cx="50" cy="50" r="50" fill={color} />;
      }
      
      const startAngle = (rotation * Math.PI) / 180;
      const endAngle = ((rotation + degreesPerSegment) * Math.PI) / 180;
      
      const x1 = 50 + radius * Math.cos(startAngle);
      const y1 = 50 + radius * Math.sin(startAngle);
      const x2 = 50 + radius * Math.cos(endAngle);
      const y2 = 50 + radius * Math.sin(endAngle);
      
      const largeArcFlag = degreesPerSegment > 180 ? 1 : 0;
      
      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`
      ].join(" ");

      // Label text path
      const midAngle = rotation + degreesPerSegment / 2;
      const textRadius = 35; // Position text halfway
      const textX = 50 + textRadius * Math.cos((midAngle * Math.PI) / 180);
      const textY = 50 + textRadius * Math.sin((midAngle * Math.PI) / 180);
      const textRotation = midAngle + (midAngle > 90 && midAngle < 270 ? 180 : 0);

      return (
        <g key={index}>
          <path d={pathData} fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
          <text
            x={textX}
            y={textY}
            fill="white"
            fontSize={segments > 20 ? "2.5" : segments > 10 ? "3.5" : "4.5"}
            fontWeight="bold"
            textAnchor="middle"
            alignmentBaseline="middle"
            transform={`rotate(${textRotation}, ${textX}, ${textY})`}
            className="drop-shadow-sm select-none"
          >
            {item.length > 20 ? item.substring(0, 18) + "..." : item}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-8 bg-black/5 dark:bg-black/20 rounded-3xl overflow-hidden backdrop-blur-xl border border-white/20 shadow-2xl">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-black/10 pointer-events-none"></div>
      
      <div className="flex w-full justify-between items-center mb-10 z-10">
        <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-emerald-400">
          VÒNG QUAY MAY MẮN
        </h3>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/20 hover:bg-white/40 shadow-sm transition-all" onClick={() => setSoundEnabled(!soundEnabled)}>
          {soundEnabled ? <Volume2 className="w-5 h-5 text-slate-700 dark:text-white" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
        </Button>
      </div>

      <div className="relative w-[340px] h-[340px] md:w-[450px] md:h-[450px] mb-8 select-none shadow-2xl rounded-full">
        {/* Outer Rim */}
        <div className="absolute inset-[-12px] bg-gradient-to-b from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,0.6)] z-0 flex items-center justify-center">
            {/* Dots on rim */}
            {Array.from({ length: 24 }).map((_, i) => (
               <div key={i} className="absolute w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_5px_rgba(253,224,71,0.8)]" style={{ transform: `rotate(${i * 15}deg) translateY(-160px) md:translateY(-220px)`}}></div>
            ))}
        </div>

        {/* Pointer Arrow */}
        <div className="absolute top-1/2 -right-6 -translate-y-1/2 z-30 drop-shadow-lg scale-150 rotate-[225deg]">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 20C5.5 11.9919 11.9919 5.5 20 5.5C28.0081 5.5 34.5 11.9919 34.5 20C34.5 28.0081 28.0081 34.5 20 34.5" stroke="#F87171" strokeWidth="3" strokeLinecap="round"/>
            <path d="M20 3C20 3 20 14.8333 20 20C20 25.1667 20 37 20 37" stroke="#F87171" strokeWidth="4" strokeLinecap="round"/>
            <path d="M9 13.5L20 3L31 13.5" fill="#EF4444"/>
            <path d="M9 13.5L20 3L31 13.5" stroke="#B91C1C" strokeWidth="2" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Wheel SVG */}
        <motion.div 
          className="w-full h-full rounded-full overflow-hidden absolute inset-0 z-10 border-4 border-white shadow-inner bg-white"
          animate={controls}
          initial={{ rotate: 0 }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            {renderSegments()}
          </svg>
        </motion.div>

        {/* Center Knob */}
        <div className="absolute inset-0 m-auto w-16 h-16 bg-white rounded-full z-20 shadow-[0_4px_15px_rgba(0,0,0,0.3)] border-4 border-slate-200 flex items-center justify-center">
            <div className="w-6 h-6 bg-slate-300 rounded-full shadow-inner"></div>
        </div>
      </div>

      <div className="z-10 flex flex-col items-center">
        {!winner && (
          <Button 
            size="lg" 
            className="h-14 px-12 text-lg font-bold rounded-full shadow-[0_8px_0_rgba(79,70,229,1)] bg-indigo-500 hover:bg-indigo-400 hover:translate-y-1 hover:shadow-[0_4px_0_rgba(79,70,229,1)] active:translate-y-2 active:shadow-none transition-all"
            onClick={handleSpin}
            disabled={isSpinning || wheelItems.length === 0}
          >
            {isSpinning ? <Sparkles className="w-6 h-6 animate-spin mr-2" /> : <Play className="w-6 h-6 mr-2 fill-current" />}
            QUAY NGAY
          </Button>
        )}

        {winner && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 bg-white/90 dark:bg-slate-800/90 py-5 px-10 rounded-2xl shadow-xl backdrop-blur-md border-2 border-emerald-400"
          >
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-sm">
                <Trophy className="w-5 h-5 fill-emerald-100" />
                {t("wheel.winner.title") || "Người chiến thắng"}
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-center text-slate-800 dark:text-white bg-clip-text mb-2">
              {winner}
            </h2>
            <div className="flex gap-3 mt-2 w-full">
              <Button 
                 variant="outline" 
                 className="flex-1 text-slate-700 bg-white hover:bg-slate-50 border-slate-200" 
                 onClick={() => { 
                   if (onKeepWinner) onKeepWinner(winner);
                   setWinner(null); 
                 }}>
                <Check className="w-4 h-4 mr-2 text-emerald-500" /> {t("wheel.btn.keep") || "Giữ lại"}
              </Button>
              <Button 
                 variant="outline" 
                 className="flex-1 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200 bg-white" 
                 onClick={() => { 
                   if (onRemoveWinner) onRemoveWinner(winner);
                   setWinner(null); 
                 }}>
                <Trash2 className="w-4 h-4 mr-2" /> {t("wheel.btn.remove") || "Loại bỏ"}
              </Button>
            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
}
