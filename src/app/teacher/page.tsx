"use client";

import React, { useState } from 'react';
import { useGamification } from '@/context/gamification-context';
import { Header } from '@/components/Header';
import { 
  FileImage, Mic, HelpCircle, CheckCircle2, 
  AlertCircle, Clock, Heart, MessageSquare, 
  Send, ThumbsUp, Star, Award, BookOpen
} from 'lucide-react';

export default function TeacherDashboard() {
  const { portfolioItems, reviewPortfolioItem, currentTeacher } = useGamification();

  // Estados locales para la evaluación de cada elemento
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [xpAward, setXpAward] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');

  // Separar pendientes de revisados
  const pendingItems = portfolioItems.filter(item => item.status === 'submitted');
  const reviewedItems = portfolioItems.filter(item => item.status === 'approved' || item.status === 'needs_revision');

  const handleReview = (itemId: string, status: 'approved' | 'needs_revision') => {
    const comment = commentText[itemId] || (status === 'approved' ? '¡Excelente trabajo! Cumple perfectamente con los objetivos.' : 'Por favor revisa las observaciones para corregir el ejercicio.');
    const xp = xpAward[itemId] || 100;

    reviewPortfolioItem(itemId, status, comment, xp);

    // Limpiar campos
    setCommentText(prev => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
    setXpAward(prev => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const getStatusLabel = (status: string) => {
    if (status === 'approved') return <span className="text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200/30">Aprobado</span>;
    return <span className="text-rose-600 font-bold text-xs bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 px-2 py-0.5 rounded-full border border-rose-200/30">Requiere Revisión</span>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner Docente */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white">Panel del Docente - Evaluación Formativa</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Docente: <strong>{currentTeacher.first_name} {currentTeacher.last_name}</strong> | Colegio Anglo Mexicano - 4º A
            </p>
          </div>

          {/* Selector de Pestañas */}
          <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'pending'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Pendientes por Evaluar ({pendingItems.length})
            </button>
            <button
              onClick={() => setActiveTab('reviewed')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reviewed'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Historial Evaluado ({reviewedItems.length})
            </button>
          </div>
        </div>

        {/* --- PENDIENTES --- */}
        {activeTab === 'pending' && (
          pendingItems.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center justify-center gap-4">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">¡Al día con las evaluaciones!</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  No hay entregas pendientes en el Portafolio de Evidencias en este momento.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {pendingItems.map((item) => {
                const isImage = item.file_type === 'image';
                
                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 overflow-hidden shadow-sm flex flex-col"
                  >
                    {/* Estudiante e Info */}
                    <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          {item.student_profile?.first_name[0]}{item.student_profile?.last_name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-950 dark:text-white">
                            {item.student_profile?.first_name} {item.student_profile?.last_name}
                          </p>
                          <p className="text-[9px] text-zinc-400 uppercase mt-0.5">Grupo: 4º A | {item.subject?.name}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        Entregado el {new Date(item.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Contenido de Evidencia */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6 border-b border-zinc-200/60 dark:border-zinc-800/60">
                      {/* Multimedia (Left) */}
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-2">Evidencia del Estudiante</p>
                        {isImage ? (
                          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-video bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
                            <img
                              src={item.file_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center gap-2">
                            <Mic className="h-7 w-7 text-blue-500" />
                            <p className="text-xs font-bold">Nota de Voz</p>
                            <audio controls className="w-full max-w-xs mt-1" src={item.file_url} />
                          </div>
                        )}
                      </div>

                      {/* Detalles y Autoevaluación (Right) */}
                      <div className="md:col-span-3 flex flex-col gap-4">
                        <div>
                          <h3 className="text-md font-bold text-zinc-950 dark:text-white leading-snug">{item.title}</h3>
                          {item.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">{item.description}</p>
                          )}
                        </div>

                        {/* Autoevaluación - Esencial para Evaluación Formativa */}
                        {item.self_reflection && (
                          <div className="p-4 rounded-2xl bg-indigo-50/35 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/30">
                            <h4 className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1">
                              Autoevaluación del Alumno (Reflexión)
                            </h4>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                              "{item.self_reflection}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Formulario de Evaluación Formativa */}
                    <div className="p-6 bg-zinc-50/50 dark:bg-zinc-950/20 flex flex-col gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 mb-1">
                          <Award className="h-4.5 w-4.5 text-blue-500" />
                          Retroalimentación Formativa
                        </h4>
                        <p className="text-[10px] text-zinc-400">Escribe comentarios constructivos sobre el proceso del estudiante (NEM)</p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 items-end">
                        {/* Comentario */}
                        <div className="flex-1 w-full">
                          <textarea
                            value={commentText[item.id] || ''}
                            onChange={(e) => setCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                            placeholder="Escribe comentarios constructivos, destaca sus fortalezas y sugiere mejoras..."
                            className="w-full text-xs p-3 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 focus:border-blue-500 focus:outline-none text-zinc-900 dark:text-white min-h-[80px]"
                          />
                        </div>

                        {/* Configuración de XP y botones */}
                        <div className="w-full md:w-auto flex flex-row md:flex-col gap-3 items-stretch md:items-end justify-between">
                          {/* XP Award selector */}
                          <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">XP a otorgar:</label>
                            <select
                              value={xpAward[item.id] || 100}
                              onChange={(e) => setXpAward(prev => ({ ...prev, [item.id]: parseInt(e.target.value) }))}
                              className="text-xs px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 font-semibold"
                            >
                              <option value={50}>50 XP</option>
                              <option value={100}>100 XP</option>
                              <option value={150}>150 XP</option>
                              <option value={200}>200 XP</option>
                            </select>
                          </div>

                          {/* Botones de acción */}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleReview(item.id, 'needs_revision')}
                              className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/40 dark:hover:bg-rose-950/20 rounded-xl font-bold text-xs"
                            >
                              Corregir
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReview(item.id, 'approved')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/10"
                            >
                              Aprobar
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )
        )}

        {/* --- HISTORIAL EVALUADO --- */}
        {activeTab === 'reviewed' && (
          reviewedItems.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center justify-center gap-4">
              <HelpCircle className="h-16 w-16 text-zinc-400 animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Aún no hay historial</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Las evidencias que apruebes o solicites corregir se mostrarán aquí.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {reviewedItems.map((item) => {
                const isImage = item.file_type === 'image';
                
                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 overflow-hidden shadow-sm flex flex-col"
                  >
                    {/* Header */}
                    <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                          {item.student_profile?.first_name[0]}{item.student_profile?.last_name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-950 dark:text-white">
                            {item.student_profile?.first_name} {item.student_profile?.last_name}
                          </p>
                          <p className="text-[9px] text-zinc-400 uppercase mt-0.5">Grupo: 4º A | {item.subject?.name}</p>
                        </div>
                      </div>
                      {getStatusLabel(item.status)}
                    </div>

                    {/* Contenido */}
                    <div className="p-6 flex flex-col md:flex-row gap-6">
                      {/* Media */}
                      <div className="w-full md:w-1/3 flex-shrink-0">
                        {isImage ? (
                          <img
                            src={item.file_url}
                            alt={item.title}
                            className="rounded-xl border border-zinc-200 dark:border-zinc-800 w-full aspect-video object-cover"
                          />
                        ) : (
                          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center gap-1">
                            <Mic className="h-5 w-5 text-blue-500" />
                            <audio controls className="w-full mt-1" src={item.file_url} />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 flex flex-col gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-zinc-950 dark:text-white">{item.title}</h3>
                          {item.description && (
                            <p className="text-xs text-zinc-500 mt-1">{item.description}</p>
                          )}
                        </div>

                        {/* Comentarios de retroalimentación en la base */}
                        <div className="flex flex-col gap-2 mt-2">
                          <h4 className="text-[9px] font-bold text-zinc-400 uppercase">Comentarios registrados:</h4>
                          {item.feedbacks?.map((fb) => (
                            <div key={fb.id} className="p-2.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50 text-xs flex gap-2">
                              <span className="font-extrabold text-blue-600 dark:text-blue-400">
                                {fb.author_role === 'teacher' ? 'Docente' : fb.author_role === 'parent' ? 'Padre' : 'Alumno'}:
                              </span>
                              <p className="text-zinc-700 dark:text-zinc-300 italic">"{fb.feedback_text}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )
        )}

      </main>
    </div>
  );
}
