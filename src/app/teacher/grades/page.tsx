"use client";

import React, { useState } from 'react';
import { useGamification } from '@/context/gamification-context';
import { Header } from '@/components/Header';
import { 
  FileSpreadsheet, ArrowLeft, Award, CheckCircle2, 
  HelpCircle, Settings, Clipboard, Save, Info, AlertTriangle,
  X, MapPin, Phone, Mail, User, Activity
} from 'lucide-react';
import Link from 'next/link';
import { DetailedStudent } from '@/types';

export default function TeacherGrades() {
  const { studentsList, portfolioItems, questAttempts, detailedStudents, schedulesList, currentTeacher, groupsList } = useGamification();

  const [selectedStudent, setSelectedStudent] = useState<DetailedStudent | null>(null);

  const formatStudentName = (student: DetailedStudent | { first_name: string; last_name: string; second_name?: string; last_name_1?: string; last_name_2?: string }) => {
    if ('last_name_1' in student && student.last_name_1) {
      const ap1 = student.last_name_1;
      const ap2 = student.last_name_2 ? ` ${student.last_name_2}` : '';
      const n1 = student.first_name;
      const n2 = student.second_name ? ` ${student.second_name}` : '';
      return `${ap1}${ap2}, ${n1}${n2}`.trim();
    } else {
      const lastName = ('last_name' in student) ? student.last_name : '';
      const firstName = student.first_name || '';
      return `${lastName}, ${firstName}`.trim();
    }
  };

  const teacherGroupIds = schedulesList
    .filter(s => s.teacherId === currentTeacher?.id)
    .map(s => s.groupId);

  const myStudents = detailedStudents.filter(s => s.group_id && teacherGroupIds.includes(s.group_id));

  const sortedStudents = [...myStudents].sort((a, b) => {
    return formatStudentName(a).localeCompare(formatStudentName(b));
  });

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
          {sortedStudents.map((student) => {
            const finalGrade = calculateSepGrade(student.id);
            const isSaved = gradesSaved[student.id];

            return (
              <div
                key={student.id}
                className="rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 overflow-hidden shadow-sm flex flex-col md:flex-row"
              >
                {/* Info del alumno (Izquierda) */}
                <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-3 justify-center text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm">
                      {student.first_name[0]}{student.last_name_1[0]}
                    </div>
                    <div>
                      <h3 className="text-md font-bold text-zinc-950 dark:text-white leading-snug">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline transition-colors text-left focus:outline-none"
                        >
                          {formatStudentName(student)}
                        </button>
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

      {/* Modal de Detalle de Alumno */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md transition-opacity duration-300 text-left">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Cabecera del Modal */}
            <div className="relative p-6 border-b border-zinc-100 dark:border-zinc-850 flex flex-col md:flex-row items-center gap-6 bg-zinc-50/50 dark:bg-zinc-950/20">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Foto de Perfil con borde según nivel */}
              <div className={`relative h-24 w-24 rounded-full overflow-hidden border-4 flex-shrink-0 shadow-lg ${
                selectedStudent.level === 'primaria' ? 'border-blue-400' :
                selectedStudent.level === 'secundaria' ? 'border-violet-500' : 'border-orange-500'
              }`}>
                <img 
                  src={selectedStudent.photo_url || '/images/students/default.png'} 
                  alt={`${selectedStudent.first_name} ${selectedStudent.last_name_1}`}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedStudent.level === 'primaria' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' :
                    selectedStudent.level === 'secundaria' ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400' : 
                    'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400'
                  }`}>
                    {selectedStudent.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold">
                    {selectedStudent.grade}
                  </span>
                  {selectedStudent.group_id && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] font-bold">
                      Grupo {groupsList.find(g => g.id === selectedStudent.group_id)?.name || ''}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold">
                    Turno {selectedStudent.shift || 'matutino'}
                  </span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">
                  {formatStudentName(selectedStudent)}
                </h2>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 mt-2 text-xs text-zinc-500 font-semibold">
                  <span className="font-mono"><strong>Matrícula:</strong> {selectedStudent.enrollment_id}</span>
                  <span className="font-mono"><strong>CURP:</strong> {selectedStudent.curp}</span>
                </div>
              </div>
            </div>

            {/* Contenido (Desplazable si es necesario) */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* SECCIÓN 1: DATOS PERSONALES */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-violet-500" />
                    Datos Personales
                  </h3>
                  
                  <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Fecha de Nacimiento</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{selectedStudent.birth_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Edad Calculada</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex-shrink-0">
                        {(() => {
                          if (!selectedStudent.birth_date) return 0;
                          const birthDate = new Date(selectedStudent.birth_date);
                          const today = new Date();
                          let age = today.getFullYear() - birthDate.getFullYear();
                          const m = today.getMonth() - birthDate.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                          }
                          return age;
                        })()} años
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Género</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{selectedStudent.gender || 'Masculino'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Escuela de Procedencia</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{selectedStudent.previous_school || 'Ninguna'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Estado en el Sistema</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase mt-1">
                        ● {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: CONTACTO Y FAMILIA */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-violet-500" />
                    Contacto y Familiares
                  </h3>
                  
                  <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Dirección</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0 mt-0.5" /> {selectedStudent.address || 'S/D'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Teléfono de Contacto</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-zinc-400" /> {selectedStudent.phone || 'S/T'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Correo Electrónico</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-zinc-400" /> {selectedStudent.email || 'S/C'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Padres / Tutores</span>
                      <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-300 leading-tight space-y-1">
                        {selectedStudent.mother_name && <div>• <strong>Madre:</strong> {selectedStudent.mother_name}</div>}
                        {selectedStudent.father_name && <div>• <strong>Padre:</strong> {selectedStudent.father_name}</div>}
                        {selectedStudent.tutor_name && <div>• <strong>Tutor Legal:</strong> {selectedStudent.tutor_name}</div>}
                      </div>
                    </div>
                    {(selectedStudent.emergency_contact_name || selectedStudent.emergency_contact_phone) && (
                      <div className="border-t border-zinc-200/40 dark:border-zinc-800/40 pt-2 mt-2">
                        <span className="text-[10px] font-black text-red-500 dark:text-red-400 uppercase block">Contacto de Emergencia</span>
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 block">{selectedStudent.emergency_contact_name || 'S/N'}</span>
                        <span className="text-[10.5px] text-zinc-500 block">{selectedStudent.emergency_contact_phone || 'S/T'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECCIÓN 3: EXPEDIENTE MÉDICO Y ADMINISTRATIVO */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-violet-500" />
                    Expediente Escolar
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Pagos Pendientes */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Pagos y Adeudos</span>
                      {selectedStudent.pending_payments && selectedStudent.pending_payments.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedStudent.pending_payments.map((p, idx) => (
                            <div key={idx} className="p-2 rounded bg-amber-50 dark:bg-amber-955/10 border border-amber-200/50 text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              {p}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-955/10 border border-emerald-200/50 text-[11px] font-bold text-emerald-700 dark:text-emerald-450 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Sin adeudos registrados.
                        </div>
                      )}
                    </div>

                    {/* Reportes de Conducta */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Reportes de Conducta</span>
                      {selectedStudent.behavior_reports && selectedStudent.behavior_reports.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudent.behavior_reports.map((r, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-955/10 border border-rose-200/40 text-[10.5px]">
                              <div className="flex justify-between font-bold text-rose-700 dark:text-rose-400 mb-1 text-[9.5px]">
                                <span>Reporta: {r.reporter}</span>
                                <span>{r.date}</span>
                              </div>
                              <p className="text-zinc-700 dark:text-zinc-300">{r.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">No cuenta con incidencias ni reportes disciplinarios.</p>
                      )}
                    </div>

                    {/* Notas del Profesor */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Notas de Profesores</span>
                      {selectedStudent.teacher_notes && selectedStudent.teacher_notes.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudent.teacher_notes.map((n, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-violet-50/60 dark:bg-violet-955/10 border border-violet-200/30 text-[10.5px]">
                              <div className="flex justify-between font-bold text-violet-700 dark:text-violet-400 mb-1 text-[9.5px]">
                                <span>Prof. {n.teacher_name}</span>
                                <span>{n.date}</span>
                              </div>
                              <p className="text-zinc-700 dark:text-zinc-300 italic">"{n.note}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">Sin anotaciones de maestros.</p>
                      )}
                    </div>

                    {/* Médico */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Tipo de Sangre</span>
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-xs font-extrabold">{selectedStudent.blood_type || 'S/D'}</span>
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Alergias / Restricciones Médicas</span>
                        {selectedStudent.medical_notes ? (
                          <div className="p-2.5 rounded-lg bg-red-50/80 border border-red-200/50 dark:bg-red-950/10 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                            {selectedStudent.medical_notes}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Ninguna alergia reportada</span>
                        )}
                      </div>
                    </div>

                    {/* Notas Académicas de Coordinación */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Notas de Coordinación</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
                        {selectedStudent.academic_notes || "Sin notas académicas registradas en este expediente."}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Pie de Modal */}
            <div className="p-4 px-6 border-t border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/10 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-full text-xs font-bold shadow-md shadow-zinc-500/10 transition-all"
              >
                Cerrar Expediente
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
