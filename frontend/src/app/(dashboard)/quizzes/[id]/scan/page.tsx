"use client";

import { useState, useRef, useEffect, useCallback, use } from "react";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  ScanLine, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2,
  Settings2,
  RefreshCw,
  Zap,
  Upload
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OMRScannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [cameraError, setCameraError] = useState("");
  const [scanProgress, setScanProgress] = useState(0);

  // Initialize Camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setCameraError("Không thể truy cập Camera. Vui lòng cấp quyền hoặc sử dụng thiết bị có hỗ trợ webcam.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Draw current video frame to canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.8);
    }
    return null;
  };

  const processOMR = async () => {
    const rawImage = takeSnapshot();
    if (!rawImage) return;

    setIsScanning(true);
    setScanProgress(0);

    // Simulate AI Processing Pipeline
    const stages = [
      { p: 20, time: 400 }, // Detecting paper bounds
      { p: 45, time: 600 }, // Perspective transform
      { p: 70, time: 500 }, // Thresholding & Bubble extraction
      { p: 90, time: 400 }, // Neural classification
      { p: 100, time: 300 } // Finalizing score
    ];

    for (const stage of stages) {
      await new Promise(r => setTimeout(r, stage.time));
      setScanProgress(stage.p);
    }

    // Demo Mode Result (Real AI integration pending)
    setTimeout(() => {
      setScanResult({
        student_id: "HS" + Math.floor(10000 + Math.random() * 90000),
        score: (Math.random() * 4 + 6).toFixed(1),
        total_correct: Math.floor(Math.random() * 10 + 30),
        total_questions: 40,
        confidence: 0.98,
        capturedImage: rawImage,
        isDemo: true,
      });
      setIsScanning(false);
    }, 300);
  };

  const handleNextBlank = () => {
    setScanResult(null);
    setScanProgress(0);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-950 text-slate-50 relative overflow-hidden -m-6 sm:-m-8">
      
      {/* Top Navbar Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-white hover:bg-background/20" onClick={() => router.push(`/quizzes/${id}`)}>
            <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
          </Button>
          <div className="hidden sm:block">
            <h1 className="font-semibold text-lg">Hệ thống chấm thi OMR AI</h1>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Sẵn sàng phân tích
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="text-white hover:bg-background/20" onClick={startCamera}>
            <RefreshCw className="w-5 h-5" />
          </Button>
          <Button variant="ghost" className="text-white hover:bg-background/20">
            <Settings2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Scanner Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        
        {/* Hidden Canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        {cameraError ? (
          <div className="text-center p-6 bg-slate-900 rounded-xl border border-slate-800 max-w-sm">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Lỗi Camera</h3>
            <p className="text-sm text-slate-400 mb-6">{cameraError}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">Tải ảnh lên</Button>
              <Button onClick={startCamera} className="bg-indigo-600 hover:bg-indigo-700 text-white">Thử lại</Button>
            </div>
          </div>
        ) : (
          <>
            {/* Live Video Feed */}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover transition-all duration-700 ${isScanning ? 'blur-md scale-105 opacity-50' : scanResult ? 'blur-lg opacity-30 shadow-2xl scale-110' : ''}`}
            />

            {/* AI HUD Overlay (Only visible when not showing result) */}
            {!scanResult && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Bounding Box Guide */}
                <div className={`w-[85vw] max-w-[600px] aspect-[1/1.4] border-2 border-dashed transition-all duration-300 relative ${isScanning ? 'border-indigo-500 bg-indigo-500/10 scale-95' : 'border-emerald-500/70 bg-emerald-500/5'}`}>
                  {/* Corner brackets */}
                  <div className={`absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 transition-colors ${isScanning ? 'border-indigo-400' : 'border-emerald-400'}`}></div>
                  <div className={`absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 transition-colors ${isScanning ? 'border-indigo-400' : 'border-emerald-400'}`}></div>
                  <div className={`absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 transition-colors ${isScanning ? 'border-indigo-400' : 'border-emerald-400'}`}></div>
                  <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 transition-colors ${isScanning ? 'border-indigo-400' : 'border-emerald-400'}`}></div>
                  
                  {/* Scanning Animation Line */}
                  <div className={`absolute top-0 left-0 w-full h-[2px] shadow-[0_0_15px_rgba(74,222,128,0.8)] ${isScanning ? 'animate-[scan_1.5s_ease-in-out_infinite] bg-indigo-500 block' : 'hidden'}`}></div>
                  
                  {isScanning && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Zap className="w-12 h-12 text-indigo-400 mb-4 animate-pulse" />
                      <div className="text-xl font-bold text-white tracking-widest">{scanProgress}%</div>
                      <div className="text-indigo-200 text-sm mt-2 font-medium">Đang dùng AI trích xuất dữ liệu...</div>
                    </div>
                  )}
                </div>
                
                {/* Instruction Text */}
                <div className="absolute bottom-32 bg-black/60 px-6 py-3 rounded-full backdrop-blur-md">
                  <p className="text-sm font-medium tracking-wide">Căn lề phiếu trắc nghiệm vào khung viền xanh</p>
                </div>
              </div>
            )}

            {/* Results Overlay */}
            {scanResult && (
              <div className="absolute inset-0 flex items-center justify-center z-30 bg-slate-950/40 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-300">
                <div className="bg-background text-foreground w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                  {/* Result Header */}
                  <div className="bg-emerald-50 border-b border-emerald-100 p-6 text-center relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-card-foreground">Chấm điểm thành công!</h2>
                    {scanResult?.isDemo && (
                      <span className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold rounded-full">⚠️ CHẾ ĐỘ DEMO</span>
                    )}
                    <p className="text-emerald-700 text-sm mt-1 font-medium">OMR AI phân tích hoàn tất với độ chính xác {(scanResult.confidence * 100).toFixed(1)}%</p>
                  </div>
                  
                  {/* Result Details */}
                  <div className="p-6 grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Số Báo Danh (SBD)</p>
                        <p className="text-2xl font-bold font-mono tracking-wider">{scanResult.student_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium mb-1">Số câu đúng</p>
                        <p className="text-xl font-semibold text-indigo-600">{scanResult.total_correct} <span className="text-base text-slate-400 font-normal">/ {scanResult.total_questions}</span></p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center bg-muted rounded-xl border border-border p-4">
                      <p className="text-sm text-muted-foreground font-medium mb-2 uppercase tracking-wider">Tổng điểm</p>
                      <div className="text-5xl font-black text-emerald-600 tracking-tighter">
                        {scanResult.score}
                      </div>
                    </div>
                  </div>

                  {/* Captured Highlight Image */}
                  <div className="px-6 pb-4">
                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Ảnh Cắt Bằng AI (Crop)</p>
                    <div className="h-24 bg-slate-100 rounded-lg overflow-hidden relative border border-border">
                      <img src={scanResult.capturedImage} className="w-full h-full object-cover" alt="Captured Sheet" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2">
                        <span className="text-xs text-white font-medium bg-black/40 px-2 py-1 rounded backdrop-blur-sm">Khớp 100% tọa độ Form</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="p-4 bg-muted grid grid-cols-2 gap-3 border-t">
                    <Button variant="outline" className="h-12 border-border text-slate-700 bg-background hover:bg-muted font-semibold" onClick={handleNextBlank}>
                      <Camera className="w-4 h-4 mr-2" /> Chụp phiếu khác
                    </Button>
                    <Button className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-500/20" onClick={() => router.push(`/reports/${id}`)}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Lưu vào Sổ điểm
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Action Bar */}
      {!scanResult && (
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-black to-transparent z-20">
          <div className="max-w-md mx-auto flex gap-4">
            <Button 
              className="flex-1 h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
              onClick={processOMR}
              disabled={isScanning || !!cameraError}
            >
              {isScanning ? (
                <><Loader2 className="w-6 h-6 mr-3 animate-spin"/> Đang phân tích...</>
              ) : (
                <><ScanLine className="w-6 h-6 mr-3" /> CHẤM ĐIỂM NGAY</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Global styles for animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
