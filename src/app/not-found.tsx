import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Database, ArrowLeft, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-lg w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 text-center backdrop-blur-2xl shadow-2xl relative z-10">
          {/* Top 404 Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-400 text-xs font-mono font-semibold mb-6 shadow-inner">
            <AlertCircle className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>ERROR 404 • ROUTE_NOT_FOUND</span>
          </div>

          {/* Number Graphic */}
          <div className="relative mb-6">
            <span className="text-7xl sm:text-8xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              404
            </span>
            <div className="w-12 h-1 bg-indigo-500 mx-auto mt-2 rounded-full shadow-lg shadow-indigo-500/50" />
          </div>

          {/* Headline */}
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-3">
            Esquema no encontrado
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            La tabla o ruta a la que intentas acceder no existe en este esquema. Es posible que haya sido eliminada o que la URL sea incorrecta.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver al Inicio</span>
            </Link>

            <Link
              href="/convert"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
            >
              <span>Abrir Convertidor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        SQL Schemer — 404 Page Not Found
      </footer>
    </div>
  );
}
