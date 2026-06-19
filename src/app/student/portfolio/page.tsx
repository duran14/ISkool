"use client";

import React, { useState, useEffect } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { Header } from '@/components/Header';
import { FileImage, Mic, HelpCircle, CheckCircle2, AlertCircle, Clock, Heart, MessageSquare } from 'lucide-react';
import { FormattedDate } from '@/components/FormattedDate';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function StudentPortfolio() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const portfolioItems = usePortfolioStore(state => state.portfolioItems);
  const fetchPortfolioItems = usePortfolioStore(state => state.fetchPortfolioItems);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchPortfolioItems();
    }
  }, [user, fetchPortfolioItems]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
          <p className="text-sm font-medium text-zinc-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Aprobado
          </span>
        );
      case 'needs_revision':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/40">
            <AlertCircle className="h-3.5 w-3.5" />
            Requiere Revisión
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40">
            <Clock className="h-3.5 w-3.5" />
            Entregado
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-2xl font-black text-zinc-950 dark:text-white">Mi Portafolio Digital de Evidencias</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Aquí se encuentran todos tus proyectos, grabaciones y dibujos escolares. Conéctate con tus papás y maestros a través de tus esfuerzos.
          </p>
        </div>

        {portfolioItems.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center justify-center gap-4">
            <HelpCircle className="h-16 w-16 text-zinc-400 animate-pulse" />
            <div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Aún no hay evidencias en tu portafolio</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Entra a una misión y completa un reto de tipo "Entrega de Evidencia" para subir tu primer trabajo.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {portfolioItems.map((item) => {
              const isImage = item.file_type === 'image';
              
              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 overflow-hidden shadow-sm flex flex-col"
                >
                  {/* Top Bar / Status */}
                  <div className="px-6 py-4 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 uppercase tracking-wider">
                        {item.subject?.name}
                      </span>
                      <FormattedDate
                        date={item.created_at}
                        prefix="Subido el "
                        className="text-[10px] text-zinc-400 font-medium"
                      />
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
                    {/* Media File (Left Column) */}
                    <div className="md:col-span-2 flex flex-col gap-3">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Evidencia Adjunta</p>
                      
                      {isImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-video bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
                          <img
                            src={item.file_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center gap-3 text-center">
                          <Mic className="h-8 w-8 text-blue-500 animate-pulse" />
                          <div className="w-full">
                            <p className="text-xs font-bold text-zinc-900 dark:text-white">Nota de voz grabada</p>
                            <p className="text-[9px] text-zinc-400 uppercase mt-0.5">Audio MP3</p>
                          </div>
                          <audio controls className="w-full max-w-xs mt-2" src={item.file_url} />
                        </div>
                      )}
                    </div>

                    {/* Details (Right Column) */}
                    <div className="md:col-span-3 flex flex-col gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-zinc-950 dark:text-white leading-snug">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">{item.description}</p>
                        )}
                      </div>

                      {/* Autoevaluación */}
                      {item.self_reflection && (
                        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50">
                          <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1.5">Mi Autoevaluación</h4>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                            "{item.self_reflection}"
                          </p>
                        </div>
                      )}

                      {/* Alineación NEM del Profesor */}
                      {(item.campos_formativos || item.ejes_articuladores || item.pdas) && (
                        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col gap-3">
                          <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Alineación Estructural (NEM)</h4>
                          
                          {item.campos_formativos && item.campos_formativos.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-medium text-zinc-400">Campos Formativos:</span>
                              <div className="flex flex-wrap gap-1">
                                {item.campos_formativos.map((campo, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/10">
                                    {campo}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.ejes_articuladores && item.ejes_articuladores.length > 0 && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-medium text-zinc-400">Ejes Articuladores:</span>
                              <div className="flex flex-wrap gap-1">
                                {item.ejes_articuladores.map((eje, idx) => (
                                  <span key={idx} className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                                    {eje}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {item.pdas && item.pdas.length > 0 && (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] font-medium text-zinc-400">PDA Alcanzado:</span>
                              <p className="text-[10.5px] font-semibold text-zinc-805 dark:text-zinc-200 leading-normal bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-100 dark:border-zinc-850">
                                {item.pdas[0]}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Desglose de XP Obtenido */}
                      {item.xp_breakdown && (
                        <div className="p-4 rounded-2xl bg-amber-50/25 dark:bg-amber-950/10 border border-amber-100/40 dark:border-amber-900/20 flex flex-col gap-2">
                          <h4 className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Desglose de Experiencia (XP)</h4>
                          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                            <div className="flex justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-1">
                              <span className="text-zinc-500">🔬 Científico:</span>
                              <span className="text-indigo-600 dark:text-indigo-400">+{item.xp_breakdown.scientific} XP</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-1">
                              <span className="text-zinc-500">🧠 Crítico:</span>
                              <span className="text-purple-600 dark:text-purple-400">+{item.xp_breakdown.critical} XP</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-1">
                              <span className="text-zinc-500">🤝 Colaborativo:</span>
                              <span className="text-emerald-600 dark:text-emerald-400">+{item.xp_breakdown.collaborative} XP</span>
                            </div>
                            <div className="flex justify-between border-b border-dashed border-zinc-200 dark:border-zinc-800 pb-1">
                              <span className="text-zinc-500">💬 Comunicación:</span>
                              <span className="text-pink-600 dark:text-pink-400">+{item.xp_breakdown.communication} XP</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feedback Section (Teacher & Parents comments) */}
                  <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/10 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-4">
                    <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" />
                      Retroalimentación y Comentarios ({item.feedbacks?.length || 0})
                    </h4>

                    {item.feedbacks && item.feedbacks.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {item.feedbacks.map((fb) => {
                          const isTeacher = fb.author_role === 'teacher';
                          const isParent = fb.author_role === 'parent';
                          
                          let roleBadge = 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';
                          if (isTeacher) roleBadge = 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400';
                          if (isParent) roleBadge = 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400';

                          return (
                            <div
                              key={fb.id}
                              className="p-3.5 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex gap-3 text-xs"
                            >
                              {/* Avatar Icon */}
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                isTeacher 
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950' 
                                  : isParent
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950'
                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-950'
                              }`}>
                                {fb.author_profile?.first_name[0]}{fb.author_profile?.last_name[0]}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-center gap-4 mb-1">
                                  <div>
                                    <strong className="text-zinc-900 dark:text-white">
                                      {fb.author_profile?.first_name} {fb.author_profile?.last_name}
                                    </strong>
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${roleBadge}`}>
                                      {isTeacher ? 'Maestro' : isParent ? 'Mamá/Papá' : 'Alumno'}
                                    </span>
                                  </div>
                                  <FormattedDate
                                    date={fb.created_at}
                                    className="text-[10px] text-zinc-400"
                                  />
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 leading-normal">{fb.feedback_text}</p>
                                
                                {/* Reactions */}
                                {fb.reactions && Object.keys(fb.reactions).length > 0 && (
                                  <div className="flex gap-1.5 mt-2 flex-wrap">
                                    {Object.entries(fb.reactions).map(([role, emojis]) => 
                                      emojis.map((emoji, idx) => (
                                        <span
                                          key={`${role}-${idx}`}
                                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                            role === 'teacher' 
                                              ? 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-950'
                                              : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950'
                                          }`}
                                        >
                                          <span>{emoji}</span>
                                          <span className="opacity-60 text-[9px]">1</span>
                                        </span>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">No hay comentarios aún. Esperando revisión del docente...</p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
