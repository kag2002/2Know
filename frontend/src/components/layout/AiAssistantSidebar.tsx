"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, Bot, User, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

import { API_BASE_URL } from "@/lib/api";

export function AiAssistantSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'ai', content: string}[]>([
    { role: 'ai', content: 'Xin chào! Tôi là 2Know AI. Tôi có thể giúp bạn tạo đề thi phân hóa cao, phân tích điểm rơi năng lực của học sinh hoặc tư vấn chiến lược giảng dạy. Hôm nay bạn cần hỗ trợ gì?' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState(50); // MOCKED QUOTA FOR DEMO
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-ai-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-ai-sidebar', handleToggle);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading || quota <= 0) return;
    
    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("2know_token");
      
      // Prepare payload (convert to system/user role if needed, but LocalAI supports user/assistant)
      const apiMessages = newMessages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }));

      // Add a hidden system prompt for context
      apiMessages.unshift({
        role: 'system',
        content: 'Bạn là trợ lý ảo 2Know AI, chuyên hỗ trợ giáo viên tạo đề thi và giảng dạy. Hãy trả lời ngắn gọn, tự nhiên, bằng tiếng Việt.'
      });

      const res = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!res.ok) {
        throw new Error(`API Error ${res.status}`);
      }

      setQuota(prev => prev - 1);
      
      // Initialize an empty AI message
      setMessages(prev => [...prev, { role: 'ai', content: '' }]);
      setLoading(false); // Remove spinner, start streaming text

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.substring(6));
              const text = data.choices[0]?.delta?.content || "";
              if (text) {
                setMessages(prev => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  updated[lastIndex] = { ...updated[lastIndex], content: updated[lastIndex].content + text };
                  return updated;
                });
              }
            } catch (e) {
              // Ignore parse errors on incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { role: 'ai', content: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[60] backdrop-blur-sm sm:hidden"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed top-0 right-0 h-screen w-[90%] sm:w-[400px] bg-white dark:bg-slate-950 shadow-2xl border-l z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                   <Sparkles className="w-5 h-5 text-white" />
                 </div>
                 <div>
                   <h2 className="font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
                     2Know Co-pilot <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400">Beta</span>
                   </h2>
                   <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500"/> Còn {quota} lươt hỏi hôm nay
                   </p>
                 </div>
               </div>
               <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                 <X className="w-5 h-5" />
               </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-black/10">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-800' : 'bg-indigo-100 dark:bg-indigo-900/30'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-slate-600 dark:text-slate-400" /> : <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <div 
                    className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 border shadow-sm rounded-tl-none text-slate-700 dark:text-slate-300'}`}
                    dangerouslySetInnerHTML={{ __html: msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                  />
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/30">
                    <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 border shadow-sm rounded-2xl rounded-tl-none">
                     <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white dark:bg-slate-950">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 rounded-full pr-2 pl-4 py-2 border shadow-inner"
              >
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Gợi ý cấu trúc đề kiểm tra Đại số..."
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  disabled={loading || quota <= 0}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || loading || quota <= 0}
                  className="rounded-full w-8 h-8 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="text-center mt-3">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  AI có thể mắc lỗi • Kiểm tra lại thông tin
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
