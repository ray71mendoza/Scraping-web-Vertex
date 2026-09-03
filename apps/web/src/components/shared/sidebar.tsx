"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  FolderKanban,
  Sparkles,
  Layers,
  Settings,
  Flame,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Descubrimiento", href: "/prospecting/new", icon: Compass },
    { name: "Campañas", href: "/", icon: FolderKanban },
    { name: "Motor de Scoring", href: "/scoring", icon: Flame, badge: "AI" },
    { name: "Configuración", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-[#0a0a12]/80 backdrop-blur-xl flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <Link href="/" className="p-6 border-b border-white/5 flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            VERTEX
          </span>
          <span className="block text-[11px] text-indigo-400 font-medium tracking-wide uppercase">
            Prospect SaaS
          </span>
        </div>
      </Link>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-semibold text-gray-400 uppercase px-3 py-2 tracking-wider">
          Módulos Principales
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-inner"
                  : "text-gray-300 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive
                      ? "text-indigo-400"
                      : "text-gray-400 group-hover:text-gray-200"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        <div className="pt-6 text-[11px] font-semibold text-gray-400 uppercase px-3 py-2 tracking-wider">
          Auditoría & Scraping
        </div>
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Worker Playwright Activo</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Detección automática de CMS, SSL, PWA y extracción de leads con IA.
          </p>
        </div>
      </nav>

      {/* Footer Profile / Tenant */}
      <div className="p-4 border-t border-white/5">
        <Link
          href="/settings"
          className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
            VX
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Agencia VERTEX</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Multi-Tenant Activo
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
