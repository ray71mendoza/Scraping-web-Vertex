import React from "react";
import Link from "next/link";
import { Compass, Home, ArrowLeft, Sparkles, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Radial background glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-6 z-10 animate-fade-in">
        {/* Error Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Error 404 • Página No Encontrada</span>
        </div>

        {/* 404 Giant Number */}
        <div className="text-7xl sm:text-8xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent select-none">
          404
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">
            El prospecto o ruta que buscas no existe
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
            La página solicitada puede haber sido movida, eliminada o la URL ingresada contiene un error.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Ir al Inicio</span>
          </Link>

          <Link
            href="/prospecting/new"
            className="btn-accent w-full sm:w-auto text-xs font-semibold py-2.5 px-5 shadow-lg shadow-indigo-500/25"
          >
            <Compass className="w-4 h-4" />
            <span>Nueva Prospección</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
