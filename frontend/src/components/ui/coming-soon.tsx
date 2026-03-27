"use client";

import { Building2, Pickaxe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500">
      <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6">
        <Pickaxe className="w-10 h-10 text-indigo-500" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{title}</h1>
      <p className="text-muted-foreground max-w-md text-lg mb-8 leading-relaxed">
        {description}
      </p>
      
      <div className="p-6 rounded-xl border bg-muted/50 flex flex-col items-center gap-3">
        <Building2 className="w-8 h-8 text-slate-400" />
        <p className="text-sm font-medium text-muted-foreground">
          Tính năng này đang được phát triển và sẽ sớm ra mắt trong phiên bản tiếp theo.
        </p>
      </div>

      <Link href="/overview">
        <Button className="mt-8 gap-2 bg-indigo-600 hover:bg-indigo-700">
          Quay lại Tổng quan
        </Button>
      </Link>
    </div>
  );
}
