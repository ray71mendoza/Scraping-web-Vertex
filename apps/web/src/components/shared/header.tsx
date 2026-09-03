"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Coins, Plus, Bell, RefreshCw } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Dashboard", subtitle }: HeaderProps) {
  const { data: quota, isLoading } = useQuery({
    queryKey: ["quota"],
    queryFn: () => api.getQuota(),
  });

  return (
    <header className="h-16 border-b border-white/5 bg-[#06060b]/60 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
      <div>
        <h1 className="text-base font-bold text-white flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Credits Pill */}
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-semibold transition-colors"
          title="Ver consumo de cuota e integraciones"
        >
          <Coins className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {isLoading ? "..." : `${quota?.remaining ?? 980} créditos`}
          </span>
        </Link>

        {/* New Search CTA */}
        <Link
          href="/prospecting/new"
          className="btn-accent text-xs px-3.5 py-1.5 font-medium flex items-center gap-1.5 shadow-indigo-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Prospección</span>
        </Link>
      </div>
    </header>
  );
}
