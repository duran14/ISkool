"use client";

import React, { useState } from 'react';
import { useGamification } from '@/context/gamification-context';
import { Header } from '@/components/Header';
import { 
  Heart, MessageSquare, Send, CheckCircle2, 
  Trophy, Flame, Coins, Smile, Landmark, Award, Mic
} from 'lucide-react';

export default function ParentDashboard() {
  const { 
    currentStudent, stats, avatar, portfolioItems, 
    addPortfolioFeedback, addReaction, currentParent 
  } = useGamification();

  const [parentComment, setParentComment] = useState<Record<string, string>>({});

  // Filtrar los portafolios del hijo actual
  const childItems = portfolioItems.filter(item => item.student_id === currentStudent.id);

  const getStudentLevelLabel = (id: string) => {
    if (id === 'std-pb') return '1º Primaria (Baja)';
    if (id === 'std-pa') return '4º Primaria (Alta)';
    if (id === 'std-sec') return '2º Secundaria';
    return '4º Semestre Preparatoria';
  };

  const handleCommentSubmit = (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    const comment = parentComment[itemId];
    if (!comment) return;

    addPortfolioFeedback(itemId, comment, 'parent', currentParent.id);

    // Limpiar campo
    setParentComment(prev => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const emojis = ['❤️', '👍', '👏', '🌟', '💪'];

  // --- RENDER STATS POR NIVEL (Para mostrar al Padre) ---
  const renderChildStats = () => {
    if (currentStudent.id === 'std-pb') {
      return (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 text-xs">
          <h3 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2">Estado de su Mascota ({avatar.pet_name})</h3>
          <div className="flex flex-col gap-1.5">
            <div>Felicidad: <strong>{avatar.pet_happiness}%</strong></div>
            <div>Hambre: <strong>{avatar.pet_hunger}%</strong></div>
            <div>Racha Activa: <strong>{stats.current_streak} días</strong></div>
          </div>
        </div>
      );
    }

    if (currentStudent.id === 'std-sec') {
      return (
        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-100/50 dark:border-purple-900/30 text-xs">
          <h3 className="font-bold text-purple-700 dark:text-purple-400 mb-2">Personaje de Rol (Secundaria)</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>Clase: <strong>{stats.rpg_class?.toUpperCase()}</strong></div>
            <div>Nivel de Rol: <strong>{stats.level}</strong></div>
            <div>Fuerza: <strong>{stats.attribute_strength}</strong></div>
            <div>Inteligencia: <strong>{stats.attribute_intelligence}</strong></div>
          </div>
        </div>
      );
    }

    if (currentStudent.id === 'std-prep') {
      return (
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 text-xs">
          <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-2">Desempeño del Proyecto</h3>
          <div className="flex flex-col gap-1.5">
            <div>Calificación de Coevaluación: <strong>9.2 / 10</strong></div>
            <div>Créditos de Financiamiento: <strong>{stats.funding_credits} 💰</strong></div>
            <div>Nivel Académico: <strong>{stats.level}</strong></div>
          </div>
        </div>
      );
    }

    // Default (Primaria Alta)
    return (
      <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl text-xs">
        <h3 className="font-bold mb-2">Estadísticas de Exploración</h3>
        <div className="flex flex-col gap-1.5">
          <div>Rango: <strong>Nivel {stats.level}</strong></div>
          <div>Monedas Acumuladas: <strong>{stats.coins} 🪙</strong></div>
          <div>Racha Activa: <strong>{stats.current_streak} días</strong></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner de Tutor */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 mb-8 shadow-sm flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white">Panel de Padres de Familia</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Hijo(a) vinculado: <strong>{currentStudent.first_name} {currentStudent.last_name}</strong> | Grado: {getStudentLevelLabel(currentStudent.id)}
            </p>
          </div>

          {/* Atributos dinámicos del hijo */}
          <div className="w-full md:w-auto">
            {renderChildStats()}
          </div>
        </div>

        {/* Visor de Actividad del Portafolio */}
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Muro de Logros e Historial de Portafolio
        </h2>

        {childItems.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center text-xs text-zinc-400">
            Tu hijo aún no ha subido trabajos o evidencias para este ciclo escolar.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {childItems.map((item) => {
              const isImage = item.file_type === 'image';
              
              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 overflow-hidden shadow-sm flex flex-col"
                >
                  {/* Header */}
                  <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                      {item.subject?.name}
                    </span>
                    <span className="text-[10px] text-zinc-400" suppressHydrationWarning>
                      Entregado el {new Date(item.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
                    {/* Media */}
                    <div className="md:col-span-2">
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
                    <div className="md:col-span-3 flex flex-col gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-zinc-500 mt-1 leading-normal">{item.description}</p>
                        )}
                      </div>

                      {/* Reflexión del Alumno */}
                      {item.self_reflection && (
                        <div className="p-3 bg-indigo-50/20 rounded-xl border border-indigo-100/30 text-xs italic text-zinc-600 dark:text-zinc-400">
                          "<strong>Autoevaluación:</strong> {item.self_reflection}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feedback y Comentarios */}
                  <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-4">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Retroalimentación escolar ({item.feedbacks?.length || 0})
                    </h4>

                    {/* Comentarios previos */}
                    {item.feedbacks && item.feedbacks.length > 0 && (
                      <div className="flex flex-col gap-2.5">
                        {item.feedbacks.map((fb) => {
                          const isTeacher = fb.author_role === 'teacher';
                          return (
                            <div key={fb.id} className="p-3 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 text-xs flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <strong className="text-zinc-900 dark:text-white">
                                  {isTeacher ? 'Maestro' : fb.author_role === 'parent' ? 'Mamá/Papá' : 'Alumno'}:
                                </strong>
                                <span className="ml-1 text-zinc-700 dark:text-zinc-300">"{fb.feedback_text}"</span>
                              </div>
                              <span className="text-[9px] text-zinc-400" suppressHydrationWarning>
                                {new Date(fb.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Formulario de Comentario de Padre de Familia */}
                    <form onSubmit={(e) => handleCommentSubmit(e, item.id)} className="flex gap-3 items-end mt-2">
                      <div className="flex-1">
                        <textarea
                          rows={1}
                          value={parentComment[item.id] || ''}
                          onChange={(e) => setParentComment(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Escribe palabras de apoyo y motivación para tu hijo..."
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 focus:border-blue-500 focus:outline-none text-zinc-900 dark:text-white min-h-[40px] resize-none"
                        />
                      </div>

                      {/* Emojis rápidos */}
                      <div className="hidden sm:flex gap-1">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => addReaction(item.id, 'parent', emoji)}
                            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-xs"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={!parentComment[item.id]}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold disabled:opacity-40 flex items-center gap-1"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Comentar
                      </button>
                    </form>
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
