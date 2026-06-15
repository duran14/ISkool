"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useGamification } from '../context/gamification-context';
import { Flame, Coins, Trophy, RefreshCw, GraduationCap, Users, User, ArrowRight } from 'lucide-react';
export const Header: React.FC = () => {
  const pathname = usePathname();
  const { stats, resetAllData, studentsList, activeStudentId, switchStudent, detailedStudents } = useGamification();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const getRoleFromPath = () => {
    if (pathname.startsWith('/student')) return 'student';
    if (pathname.startsWith('/teacher')) return 'teacher';
    if (pathname.startsWith('/parent')) return 'parent';
    if (pathname.startsWith('/coordinator')) return 'coordinator';
    return 'none';
  };

  const currentRole = getRoleFromPath();

  const getStudentLevelLabel = (id: string) => {
    const studentProfile = detailedStudents?.find(s => s.id === id);
    if (!studentProfile) return 'Preparatoria';
    if (studentProfile.level === 'primaria') {
      const gradeNum = parseInt(studentProfile.grade);
      if (gradeNum <= 3) return 'Primaria Baja';
      return 'Primaria Alta';
    }
    if (studentProfile.level === 'secundaria') return 'Secundaria';
    return 'Preparatoria';
  };  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            ISkool <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">Académico</span>
          </Link>
        </div>

        {/* Navigation by Role */}
        <nav className="hidden lg:flex items-center gap-6">
          {currentRole === 'student' && (
            <>
              <Link
                href="/student"
                className={`text-sm font-semibold transition-colors ${
                  pathname === '/student' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Misiones
              </Link>
              <Link
                href="/student/portfolio"
                className={`text-sm font-semibold transition-colors ${
                  pathname === '/student/portfolio' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Mi Portafolio
              </Link>
            </>
          )}

          {currentRole === 'teacher' && (
            <>
              <Link
                href="/teacher"
                className={`text-sm font-semibold transition-colors ${
                  pathname === '/teacher' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Revisión de Portafolio
              </Link>
              <Link
                href="/teacher/grades"
                className={`text-sm font-semibold transition-colors ${
                  pathname === '/teacher/grades' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Boleta SEP (Formativa)
              </Link>
            </>
          )}

          {currentRole === 'parent' && (
            <Link
              href="/parent"
              className={`text-sm font-semibold transition-colors ${
                pathname === '/parent' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Muro de Logros (Hijo)
            </Link>
          )}

          {currentRole === 'coordinator' && (
            <Link
              href="/coordinator"
              className={`text-sm font-semibold transition-colors ${
                pathname === '/coordinator' ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Control de Grupos y Horarios
            </Link>
          )}
        </nav>

        {/* Stats & Role Switcher */}
        <div className="flex items-center gap-4">
          {/* Quick Level Simulator (Cambiar alumno activo) */}
          {currentRole === 'student' && (
            <div className="flex items-center gap-1.5 bg-blue-50/50 dark:bg-blue-950/20 px-2 py-1 rounded-xl border border-blue-200/30 dark:border-blue-900/30">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 px-1">Demo:</span>
              <select
                value={activeStudentId}
                onChange={(e) => switchStudent(e.target.value)}
                className="bg-transparent text-xs font-bold text-zinc-700 dark:text-zinc-200 border-none outline-none cursor-pointer pr-1 focus:ring-0"
              >
                {studentsList.map((std) => (
                  <option key={std.id} value={std.id} className="bg-white dark:bg-zinc-900 text-zinc-800 dark:text-white">
                    {std.first_name} ({getStudentLevelLabel(std.id)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stats for Student */}
          {currentRole === 'student' && (
            <div className="hidden md:flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full text-xs font-semibold">
              <div className="flex items-center gap-1 text-amber-500">
                <Flame className="h-4 w-4 fill-current animate-pulse" />
                <span>{stats.current_streak} d</span>
              </div>
              <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700" />
              <div className="flex items-center gap-1 text-yellow-500">
                <Coins className="h-4 w-4 fill-current" />
                <span>{stats.coins}</span>
              </div>
              <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700" />
              <div className="flex items-center gap-1 text-blue-500">
                <Trophy className="h-4 w-4" />
                <span>Nivel {stats.level}</span>
              </div>
            </div>
          )}

          {/* Quick Role Selector */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
            <Link
              href="/student"
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                currentRole === 'student'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Alumno
            </Link>
            <Link
              href="/teacher"
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                currentRole === 'teacher'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Profesor
            </Link>
            <Link
              href="/parent"
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                currentRole === 'parent'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Tutor
            </Link>
            <Link
              href="/coordinator"
              className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                currentRole === 'coordinator'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Coordinador
            </Link>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            title="Reiniciar Datos"
            className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Custom Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
              ⚠️ ¿Restablecer Datos Simulados?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Esta acción eliminará todos los alumnos registrados, grupos conformados y horarios creados durante esta sesión de prueba, restaurando las semillas originales. ¿Deseas continuar?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 border rounded-full text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setIsResetConfirmOpen(false);
                  window.location.reload();
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold shadow-md shadow-red-500/10 transition-all"
              >
                Sí, restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
