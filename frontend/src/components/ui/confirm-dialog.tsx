"use client";

import { useState, useCallback, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  const handleClose = (result: boolean) => {
    state?.resolve(result);
    setState(null);
  };

  const variantStyles = {
    danger: {
      icon: Trash2,
      iconBg: "bg-rose-100 dark:bg-rose-900/30",
      iconColor: "text-rose-600 dark:text-rose-400",
      confirmBg: "bg-rose-600 hover:bg-rose-700 text-white",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      confirmBg: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    info: {
      icon: AlertTriangle,
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      confirmBg: "bg-indigo-600 hover:bg-indigo-700 text-white",
    },
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state && (() => {
          const v = variantStyles[state.options.variant || "danger"];
          const Icon = v.icon;
          return (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
                onClick={() => handleClose(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[201] rounded-2xl bg-popover border shadow-2xl overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${v.iconBg} shrink-0`}>
                      <Icon className={`w-5 h-5 ${v.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-foreground mb-1">{state.options.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{state.options.description}</p>
                    </div>
                    <button
                      onClick={() => handleClose(false)}
                      className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="px-6 pb-5 flex gap-3 justify-end">
                  <button
                    onClick={() => handleClose(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-muted transition-colors"
                  >
                    {state.options.cancelLabel || "Hủy"}
                  </button>
                  <button
                    onClick={() => handleClose(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm ${v.confirmBg}`}
                  >
                    {state.options.confirmLabel || "Xác nhận"}
                  </button>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
