import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  Sparkles,
  ArrowRight,
  Database,
  Download,
  Code2,
  Zap,
  Gift,
  CheckCircle2,
  Star,
} from 'lucide-react';

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Animated Ambient Gradient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[400px] bg-gradient-to-tr from-indigo-600/30 via-violet-600/25 to-cyan-500/20 blur-[140px] rounded-full pointer-events-none animate-pulse-glow" />
        <div className="absolute top-1/2 right-10 w-96 h-96 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* 100% Gratis Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-8 backdrop-blur-xl shadow-lg shadow-emerald-500/10 hover:border-emerald-500/60 transition-colors">
            <Gift className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            <span className="font-semibold text-emerald-400">100% Gratis & Open Source</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Sin registro ni límites</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1]">
            Convierte tus esquemas{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              SQL en diagramas Mermaid
            </span>{' '}
            en segundos
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed text-balance">
            Genera diagramas de clases UML con atributos tipados, relaciones por claves foráneas con cardinalidades y métodos CRUD listos para documentar arquitecturas.
          </p>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/convert"
              className="group relative w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold shadow-2xl shadow-indigo-600/40 transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Abrir Convertidor Gratis</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/convert?demo=true"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-medium transition hover:scale-[1.02] shadow-lg"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Probar con Demo (10 Tablas)</span>
            </Link>
          </div>

          {/* Free Guarantee Callout */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sin tarjeta de crédito
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sin límites de uso
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Acceso inmediato
            </span>
          </div>

          {/* Dialects supported */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 font-mono">
            <span>Compatible con:</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-indigo-500/40 transition">MySQL</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-indigo-500/40 transition">MariaDB</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-indigo-500/40 transition">PostgreSQL</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-slate-300 hover:border-indigo-500/40 transition">SQLite</span>
          </div>

          {/* Visual Showcase Box with Floating Animation */}
          <div className="mt-16 max-w-5xl mx-auto relative group animate-float-slow">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-60 transition duration-700" />
            <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Left Code Mockup */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left font-mono text-xs text-slate-300 shadow-inner hover:border-slate-700 transition">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] text-slate-500">schema.sql</span>
                  </div>
                  <pre className="text-slate-400 overflow-x-auto text-[11px] leading-relaxed">
                    <code>{`CREATE TABLE usuarios (
  id_usu INT PRIMARY KEY AUTO_INCREMENT,
  nom_usu VARCHAR(80) NOT NULL,
  ema_usu VARCHAR(150) NOT NULL UNIQUE,
  id_rol_usu INT NOT NULL,
  act_usu BOOLEAN DEFAULT 1,
  FOREIGN KEY (id_rol_usu) 
    REFERENCES roles(id_rol)
);`}</code>
                  </pre>
                </div>

                {/* Right Output Visual Mockup */}
                <div className="bg-slate-950 border border-indigo-900/40 rounded-2xl p-5 text-left shadow-inner flex flex-col justify-center hover:border-indigo-700/60 transition">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                    <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" /> Diagrama UML Generado
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-0.5 rounded-full font-medium">
                      Listo para Mermaid
                    </span>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl p-4 space-y-2.5 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                      <span className="font-bold text-sm text-cyan-300">Usuarios</span>
                      <span className="text-[10px] text-slate-400 font-mono">Class</span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-300 space-y-1">
                      <div>+int id_usu*</div>
                      <div>+string nom_usu</div>
                      <div>+string ema_usu</div>
                      <div>+bool act_usu</div>
                    </div>
                    <div className="border-t border-slate-700/80 pt-2 font-mono text-[10px] text-indigo-400 space-y-0.5">
                      <div>+registrar()</div>
                      <div>+actualizar()</div>
                      <div>+deshabilitar()</div>
                    </div>
                  </div>
                  <div className="mt-3 text-center text-[10px] text-slate-400 font-mono">
                    Roles &quot;1&quot; --&gt; &quot;*&quot; Usuarios : tiene
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Flujo de trabajo simple en 3 pasos
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              Convierte cualquier esquema SQL sin configuraciones complicadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 relative hover:border-indigo-500/40 transition hover:-translate-y-1 duration-200">
              <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-5 right-5 font-mono group-hover:text-indigo-500/40 transition">
                01
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Pega o Sube tu SQL</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Importa cualquier archivo DDL o pega las sentencias `CREATE TABLE` directamente en el editor.
              </p>
            </div>

            <div className="group bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 relative hover:border-cyan-500/40 transition hover:-translate-y-1 duration-200">
              <span className="text-4xl font-extrabold text-cyan-500/20 absolute top-5 right-5 font-mono group-hover:text-cyan-500/40 transition">
                02
              </span>
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Compilación Instantánea</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                El motor analiza tablas, tipos, atributos primarios, claves foráneas y genera métodos CRUD.
              </p>
            </div>

            <div className="group bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 relative hover:border-emerald-500/40 transition hover:-translate-y-1 duration-200">
              <span className="text-4xl font-extrabold text-emerald-500/20 absolute top-5 right-5 font-mono group-hover:text-emerald-500/40 transition">
                03
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Exporta en .mmd o SVG</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Descarga el archivo `.mmd` listo para tu repositorio o abre el diagrama en Mermaid Live con un clic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GitHub Star Callout Section */}
      <section className="py-16 border-t border-slate-900 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-4">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Open Source & Community Driven</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            ⭐ ¿Te gusta este proyecto? ¡Danos una estrella en GitHub!
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Si esta herramienta te ayuda a ahorrar tiempo generando diagramas de arquitectura de base de datos, apóyanos dejándonos una estrella en el repositorio de GitHub. ¡Nos ayuda mucho a que más desarrolladores la conozcan!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/santy123371/sql-to-mermaid"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-white font-semibold shadow-xl transition-all hover:scale-105 active:scale-95 group"
            >
              <GithubIcon className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
              <span>Dar Estrella en GitHub</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:rotate-12 transition-transform" />
            </a>

            <Link
              href="/convert"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition hover:scale-105 active:scale-95"
            >
              <span>Usar Convertidor Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>SQL Schemer — Herramienta libre y 100% gratuita para la comunidad.</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/santy123371/sql-to-mermaid"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400/80" />
              <span>Star en GitHub</span>
            </a>
            <Link href="/convert" className="text-indigo-400 hover:text-indigo-300 transition">
              Abrir Studio →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
