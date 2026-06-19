"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { GraduationCap, Shield, Sparkles, User, Key, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';

const DEMO_ACCOUNTS = [
  {
    name: "Lucas Skywalker",
    role: "student",
    grade: "Primaria Alta (4º)",
    email: "lucas@iskool.edu.mx",
    avatarColor: "bg-emerald-500",
    id: "std-pa"
  },
  {
    name: "Elena Rostova",
    role: "student",
    grade: "Secundaria (2º) - RPG",
    email: "elena@iskool.edu.mx",
    avatarColor: "bg-purple-500",
    id: "std-sec"
  },
  {
    name: "Santi Gómez",
    role: "student",
    grade: "Primaria Baja (1º)",
    email: "santi@iskool.edu.mx",
    avatarColor: "bg-blue-500",
    id: "std-pb"
  },
  {
    name: "Mateo Díaz",
    role: "student",
    grade: "Preparatoria (4º Sem)",
    email: "mateo@iskool.edu.mx",
    avatarColor: "bg-amber-500",
    id: "std-prep"
  },
  {
    name: "Prof. Israel López",
    role: "teacher",
    grade: "Docente Evaluador",
    email: "israel.lopez@iskool.edu.mx",
    avatarColor: "bg-rose-500",
    id: "usr-teacher-1"
  }
];

export default function LoginPage() {
  const { login, loading: authLoading } = useAuth();
  const switchStudent = useStudentStore(state => state.switchStudent);
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('********');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Por favor introduce tu correo electrónico.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      const result = await login(email);
      if (result.success) {
        // Sync active student ID in store if student logged in
        const demo = DEMO_ACCOUNTS.find(a => a.email === email);
        if (demo && demo.role === 'student') {
          await switchStudent(demo.id);
          router.push('/student');
        } else if (demo && demo.role === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/');
        }
      } else {
        setErrorMsg(result.error || 'Credenciales inválidas.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemo = async (demo: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(demo.email);
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await login(demo.email);
      if (result.success) {
        if (demo.role === 'student') {
          await switchStudent(demo.id);
          router.push('/student');
        } else if (demo.role === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/');
        }
      } else {
        setErrorMsg(result.error || 'Error al iniciar sesión con cuenta demo.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-zinc-950 text-white font-sans overflow-hidden">
      
      {/* Columna Izquierda: Efecto visual y branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-tr from-blue-950 via-zinc-950 to-purple-950 flex-col justify-between p-12 overflow-hidden border-r border-zinc-800/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-60 z-0" />
        
        {/* Logo */}
        <div className="flex items-center gap-2.5 z-10">
          <GraduationCap className="h-9 w-9 text-blue-400" />
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            ISkool
          </span>
        </div>

        {/* Hero Concept */}
        <div className="max-w-md my-auto z-10 flex flex-col gap-5">
          <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-bold border border-blue-500/20 w-fit">
            <Sparkles className="h-4 w-4" />
            La Nueva Escuela Mexicana Gamificada
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Descubre una nueva forma de aprender y evaluar
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Una experiencia segura y controlada que recompensa el esfuerzo escolar y respeta las políticas RLS. El aprendizaje del estudiante se mide de forma divertida y confiable.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-zinc-500 text-xs z-10">
          © 2026 ISkool Academic. Todos los derechos reservados.
        </div>
      </div>

      {/* Columna Derecha: Login Form & Demo Accounts */}
      <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-16 xl:p-20 z-10">
        <div className="mx-auto w-full max-w-md flex flex-col gap-8">
          
          {/* Header Mobile / Text */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 lg:hidden mb-4">
              <GraduationCap className="h-7 w-7 text-blue-400" />
              <span className="text-xl font-bold tracking-tight">ISkool</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-zinc-400 text-sm">
              Introduce tus datos o selecciona una cuenta de demostración.
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl text-xs font-medium flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  placeholder="ejemplo@iskool.edu.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Contraseña
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-zinc-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-sm font-bold rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {isSubmitting || authLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Conectando con Supabase...
                </>
              ) : (
                <>
                  Ingresar al Reino
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-zinc-800"></div>
            <span className="flex-shrink mx-4 text-xs font-bold text-zinc-600 uppercase tracking-wider">
              Cuentas de Demostración
            </span>
            <div className="flex-grow border-t border-zinc-800"></div>
          </div>

          {/* Cuentas Demo */}
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
            {DEMO_ACCOUNTS.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => handleSelectDemo(demo)}
                disabled={isSubmitting || authLoading}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-zinc-900 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-800 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-xl ${demo.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {demo.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors">
                      {demo.name}
                    </h4>
                    <span className="text-[11px] text-zinc-500">
                      {demo.grade}
                    </span>
                  </div>
                </div>
                
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors uppercase">
                  {demo.role === 'teacher' ? 'Docente' : 'Alumno'}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
