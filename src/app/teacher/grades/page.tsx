"use client";

import React, { useState } from 'react';
import { useGamification } from '@/context/gamification-context';
import { Header } from '@/components/Header';
import { 
  FileSpreadsheet, ArrowLeft, Award, CheckCircle2, 
  HelpCircle, Settings, Clipboard, Save, Info, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function TeacherGrades() {
  const { studentsList, portfolioItems, questAttempts } = useGamification();

  // Estados de configuración de pesos (Porcentaje total = 100)
  const [questWeight, setQuestWeight] = useState(60); // 60% cuestionarios
  const [portfolioWeight, setPortfolioWeight] = useState(40); // 40% portafolio

  // Estados locales para boletas guardadas
  const [comments, setComments] = useState<Record<string, string>>({
    'std-pb': 'El alumno demuestra mucho entusiasmo con su mascota y sus laberintos. Muestra un avance excelente en lectoescritura.',
    'std-pa': 'Excelente desempeño en matemáticas. Muestra una actitud positiva frente al error y los reintentos.',
    'std-sec': 'Muy activa en las dinámicas RPG escolares. Ha incrementado su inteligencia en un 40% mediante actividades de ciencias.',
    'std-prep': 'Gran rol como coevaluador de proyectos. Sus análisis demuestran madurez técnica.'
  });
  const [gradesSaved, setGradesSaved] = useState<Record<string, boolean>>({});

  // Función para calcular la calificación SEP formativa (escala 5.0 a 10.0)
  const calculateSepGrade = (studentId: string) => {
    // 1. Calcular porcentaje de Quests aprobados (de 2 quests totales en las misiones)
    // Para simplificar, contamos los questAttempts exitosos
    const attempts = questAttempts?.filter(a => a.student_id === studentId && a.score >= 60) || [];
    const uniqueQuestsPassed = new Set(attempts.map(a => a.quest_id)).size;
    const totalQuests = 4; // Muestra general
    const questRatio = Math.min(1, uniqueQuestsPassed / totalQuests);

    // 2. Calcular porcentaje de portafolios aprobados
    const items = portfolioItems.filter(p => p.student_id === studentId);
    const approvedItemsCount = items.filter(p => p.status === 'approved').length;
    const totalItemsCount = items.length;
    const portfolioRatio = totalItemsCount > 0 ? approvedItemsCount / totalItemsCount : 0.5; // Por defecto 50% si no ha subido

    // 3. Ponderación
    const score0to100 = (questRatio * questWeight) + (portfolioRatio * portfolioWeight);
    
    // Mapear de 0-100 a la escala SEP (5.0 a 10.0)
    // Fórmula: 5.0 + (score0to100 / 100) * 5.0
    const finalScore = 5.0 + (score0to100 / 100) * 5.0;
    return parseFloat(finalScore.toFixed(1));
  };

  const handleSaveGrade = (studentId: string) => {
    setGradesSaved(prev => ({ ...prev, [studentId]: true }));
    setTimeout(() => {
      setGradesSaved(prev => ({ ...prev, [studentId]: false }));
    }, 2500);
  };

  const getStudentLevelLabel = (id: string) => {
    if (id === 'std-pb') return '1º Primaria (Baja)';
    if (id === 'std-pa') return '4º Primaria (Alta)';
    if (id === 'std-sec') return '2º Secundaria';
    return '4º Semestre Preparatoria';
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Traductor de Evaluación Formativa a Boleta SEP
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Nueva Escuela Mexicana (NEM) | Mapea automáticamente retos y evidencias a calificaciones oficiales.
            </p>
          </div>
        </div>

        {/* Ponderación y Configuración */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 mb-8 shadow-sm">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5 mb-4">
            <Settings className="h-4.5 w-4.5 text-zinc-500" />
            Configuración de Ponderación Formativa
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-2">
                <span>Retos y Cuestionarios Académicos: {questWeight}%</span>
                <span>Portafolio de Evidencias Digital: {portfolioWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={questWeight}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setQuestWeight(val);
                  setPortfolioWeight(100 - val);
                }}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/20 dark:border-blue-900/30 text-xs">
              <Info className="h-4.5 w-4.5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-zinc-600 dark:text-zinc-400 leading-normal">
                <strong>¿Cómo funciona?</strong> El sistema toma el avance y desempeño del estudiante en retos de cuestionarios ({questWeight}%) y la aprobación de sus evidencias en Seesaw ({portfolioWeight}%) para estimar una calificación del <strong>5.0 al 10.0</strong> para la boleta oficial de la SEP.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Alumnos */}
        <div className="flex flex-col gap-6">
          {studentsList.map((student) => {
            const finalGrade = calculateSepGrade(student.id);
            const isSaved = gradesSaved[student.id];

            return (
              <div
                key={student.id}
                className="rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 overflow-hidden shadow-sm flex flex-col md:flex-row"
              >
                {/* Info del alumno (Izquierda) */}
                <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-3 justify-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm">
                      {student.first_name[0]}{student.last_name[0]}
                    </div>
                    <div>
                      <h3 className="text-md font-bold text-zinc-950 dark:text-white leading-snug">
                        {student.first_name} {student.last_name}
                      </h3>
                      <p className="text-[10px] text-zinc-400 uppercase mt-0.5">{getStudentLevelLabel(student.id)}</p>
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500 mt-2 flex flex-col gap-1">
                    <span>Misiones Iniciadas: <strong>2</strong></span>
                    <span>Evidencias Aprobadas: <strong>{portfolioItems.filter(p => p.student_id === student.id && p.status === 'approved').length}</strong></span>
                  </div>
                </div>

                {/* Cálculo y Observación (Derecha) */}
                <div className="p-6 flex-1 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  
                  {/* Calificación sugerida */}
                  <div className="text-center md:text-left flex flex-row md:flex-col gap-4 md:gap-1 items-center md:items-start">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">CÁLCULO SEP SUGERIDO</span>
                    <span className={`text-4xl font-black ${finalGrade >= 8 ? 'text-emerald-600' : finalGrade >= 6 ? 'text-yellow-600' : 'text-rose-600'}`}>
                      {finalGrade.toFixed(1)}
                    </span>
                  </div>

                  {/* Observaciones oficiales */}
                  <div className="flex-1 w-full flex flex-col gap-1.5">
                    <label htmlFor={`obs-${student.id}`} className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                      Observaciones y Sugerencias de Mejora (SEP)
                    </label>
                    <textarea
                      id={`obs-${student.id}`}
                      value={comments[student.id] || ''}
                      onChange={(e) => setComments(prev => ({ ...prev, [student.id]: e.target.value }))}
                      placeholder="Observaciones de aprendizaje cualitativas..."
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 bg-transparent dark:border-zinc-800 focus:border-blue-500 focus:outline-none text-zinc-900 dark:text-white min-h-[60px]"
                    />
                  </div>

                  {/* Botón guardar */}
                  <button
                    onClick={() => handleSaveGrade(student.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-stretch md:self-auto justify-center ${
                      isSaved 
                        ? 'bg-emerald-600 text-white shadow-emerald-500/10'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Guardado
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Firmar Boleta
                      </>
                    )}
                  </button>

                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
