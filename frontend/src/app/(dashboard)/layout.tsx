import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { CommandPalette } from "@/components/layout/CommandPalette";
import GlobalFAB from "@/components/layout/FAB";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-muted/50 dark:bg-slate-950">
      <AppSidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 dark:bg-slate-900/50">
          <Breadcrumb />
          <Suspense fallback={<div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>}>
            {children}
          </Suspense>
        </main>
      </div>
      <GlobalFAB />
      <CommandPalette />
    </div>
  );
}
