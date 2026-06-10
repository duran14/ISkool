"use client";

import Link from "next/link";
import { GraduationCap, Trophy, Users, ShieldAlert, Sparkles, BookOpen, Compass, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
      
      {/* Navbar Simple */}
      <header className="w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold tracking-tight">ISkool Académico</span>
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        
        {/* Intro */}
        <div className="text-center max-w-2xl mb-12 flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-200/20">
            <Sparkles className="h-3.5 w-3.5" />
            La Nueva Escuela Mexicana Gamificada
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
            Módulo Académico Gamificado
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg mt-2">
            Una experiencia inmersiva que conecta a alumnos, maestros y padres mediante mecánicas lúdicas de aprendizaje y portafolios digitales de evidencias.
          </p>
        </div>

        {/* Portales de Acceso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          
          {/* Tarjeta Estudiante */}
          <Link
            href="/student"
            className="group relative flex flex-col justify-between p-6 rounded-3xl border border-zinc-200/80 bg-white hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-blue-500"
          >
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 w-fit group-hover:scale-110 transition-transform">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Portal de Alumnos
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-normal">
                  Accede a tus misiones, personaliza tu avatar o mascota, resuelve cuestionarios interactivos y sube evidencias a tu portafolio.
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              Entrar como Alumno
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tarjeta Profesor */}
          <Link
            href="/teacher"
            className="group relative flex flex-col justify-between p-6 rounded-3xl border border-zinc-200/80 bg-white hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/5 transition-all dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-yellow-500"
          >
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-2xl bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400 w-fit group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                  Portal del Docente
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-normal">
                  Revisa entregas de evidencias, asigna retroalimentación formativa y traduce el progreso del alumno directamente a la Boleta SEP.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-yellow-600 dark:text-yellow-500">
              Entrar como Profesor
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tarjeta Padre */}
          <Link
            href="/parent"
            className="group relative flex flex-col justify-between p-6 rounded-3xl border border-zinc-200/80 bg-white hover:border-rose-500 hover:shadow-xl hover:shadow-rose-500/5 transition-all dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-rose-500"
          >
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 w-fit group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Portal de Padres
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-normal">
                  Observa el muro de logros de tu hijo(a), deja comentarios motivacionales y observa su avance en tiempo real.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              Entrar como Tutor
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
        © 2026 ISkool Academic. Todos los derechos reservados.
      </footer>

    </div>
  );
}

// Icono auxiliar no importado
function ArrowRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
