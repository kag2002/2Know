"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, BookOpen, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";

export default function GlobalFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const actions = [
    { icon: FileText, label: t("sidebar.quizzes") || "Bài kiểm tra", route: "/quizzes", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
    { icon: Users, label: t("sidebar.students") || "Học sinh", route: "/students", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { icon: BookOpen, label: t("sidebar.classes") || "Lớp học", route: "/classes", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400" }
  ];

  const handleAction = (route: string) => {
    setIsOpen(false);
    router.push(route);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex flex-col gap-3"
          >
            {actions.map((action, i) => (
               <motion.button
                 key={i}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 transition={{ delay: i * 0.05 }}
                 onClick={() => handleAction(action.route)}
                 className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-indigo-500 transition-all font-semibold text-sm text-slate-700 dark:text-slate-200 group"
               >
                 <span className="group-hover:-translate-x-1 transition-transform">{action.label}</span>
                 <div className={`p-1.5 rounded-full ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                 </div>
               </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40 transition-all"
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7" />}
        </motion.div>
      </motion.button>
    </div>
  );
}
