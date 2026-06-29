"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { STATS_MAP_SEED, AVATAR_MAP_SEED } from '@/store/seeds';
import { Header } from '@/components/Header';
import { 
  Award, CheckCircle2, Settings, Save, Info, Sparkles, Swords, 
  X, MapPin, Phone, Mail, User, Activity, Dumbbell, Brain, Shield, ChevronDown, ChevronUp, Coins
} from 'lucide-react';
import { DetailedStudent, StudentStats } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useStudentStore, normalizeStudentId } from '@/store/useStudentStore';

// Custom Avatar Preview component for RPG styling
const PlayerAvatarPreview = ({ avatar, name }: { avatar: any; name: string }) => {
  const getBgGradient = (bg: string) => {
    if (bg === 'forest') return 'from-emerald-950 via-teal-900 to-zinc-950';
    if (bg === 'space') return 'from-indigo-950 via-blue-900 to-purple-950';
    if (bg === 'sunset') return 'from-orange-950 via-red-900 to-zinc-950';
    return 'from-zinc-900 to-slate-950';
  };
  
  const initials = name.substring(0, 2).toUpperCase();
  const hairColor = avatar?.hair_color || '#4B5563';
  const outfitColor = avatar?.outfit_color || '#3B82F6';

  return (
    <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getBgGradient(avatar?.background_style)} border-2 border-amber-500/40 flex items-center justify-center relative overflow-hidden shadow-lg shadow-black/60 group`}>
      {/* Decorative JRPG background highlights */}
      <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
      
      {/* SVG Character Representation using student customizer choices */}
      <svg className="absolute inset-0 w-full h-full p-2.5 opacity-40 select-none pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <circle cx="50" cy="50" r="30" fill="#FDBA74" />
        {/* Hair */}
        <path d="M20 50C20 30 80 30 80 50C80 20 20 20 20 50Z" fill={hairColor} />
        {/* Outfit */}
        <path d="M25 80C35 70 65 70 75 80L50 95L25 80Z" fill={outfitColor} />
      </svg>

      {/* Initials with glowing font */}
      <span className="text-xs font-black font-serif text-amber-400 drop-shadow-[0_0_5px_rgba(245,158,11,0.85)] group-hover:scale-110 transition-transform duration-300 relative z-10">
        {initials}
      </span>
      
      {/* Mini badge for RPG class */}
      <div className="absolute bottom-0 inset-x-0 bg-black/70 py-0.5 text-[6px] font-black text-center text-zinc-400 uppercase tracking-widest leading-none border-t border-zinc-800">
        {avatar?.outfit_style?.substring(0, 5) || 'HERO'}
      </div>
    </div>
  );
};

export default function TeacherGrades() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const portfolioItems = usePortfolioStore(state => state.portfolioItems);
  const fetchPortfolioItems = usePortfolioStore(state => state.fetchPortfolioItems);
  const fetchStats = useStudentStore(state => state.fetchStats);
  const statsMap = useStudentStore(state => state.allStats);
  const avatarsMap = useStudentStore(state => state.allAvatars);
  const questAttempts = useGamificationStore(state => state.questAttempts);
  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);
  const schedulesList = useSchoolAdminStore(state => state.schedulesList);
  const groupsList = useSchoolAdminStore(state => state.groupsList);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'teacher') {
      fetchPortfolioItems();
      fetchStats();
    }
  }, [user, fetchPortfolioItems, fetchStats]);

  const [selectedStudent, setSelectedStudent] = useState<DetailedStudent | null>(null);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const totalQuests = 4;

  // Mappings between UUIDs and seed IDs
  const denormalizeStudentId = (id: string): string => {
    if (id === 'std-pa') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11';
    if (id === 'std-sec') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a22';
    if (id === 'std-pb') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a33';
    if (id === 'std-prep') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44';
    return id;
  };

  const getStudentStats = (studentId: string): StudentStats => {
    const norm = normalizeStudentId(studentId);
    const denorm = denormalizeStudentId(studentId);
    return statsMap[studentId] || statsMap[norm] || statsMap[denorm] || STATS_MAP_SEED[studentId] || STATS_MAP_SEED[norm] || {
      student_id: studentId,
      xp: 0,
      level: 1,
      coins: 0,
      current_streak: 1,
      max_streak: 1,
      rpg_class: 'mago',
      attribute_strength: 10,
      attribute_intelligence: 10,
      attribute_defense: 10,
      skill_points: 0,
      funding_credits: 1000,
      updated_at: new Date().toISOString()
    };
  };

  const getStudentAvatar = (studentId: string) => {
    const norm = normalizeStudentId(studentId);
    const denorm = denormalizeStudentId(studentId);
    return avatarsMap[studentId] || avatarsMap[norm] || avatarsMap[denorm] || AVATAR_MAP_SEED[studentId] || AVATAR_MAP_SEED[norm];
  };

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

  // Auth Group Filtering - Directly using user.id mapping for seed schedules matching
  const teacherId = user?.id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55' ? 'usr-teacher-1' : user?.id;
  const teacherGroupIds = schedulesList
    .filter(s => s.teacherId === teacherId)
    .map(s => s.groupId);

  const myStudents = detailedStudents.filter(s => s.group_id && teacherGroupIds.includes(s.group_id));

  const sortedStudents = useMemo(() => {
    return [...myStudents].sort((a, b) => {
      return formatStudentName(a).localeCompare(formatStudentName(b));
    });
  }, [myStudents]);

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
    const norm = normalizeStudentId(studentId);
    const denorm = denormalizeStudentId(studentId);

    // 1. Calcular porcentaje de Quests aprobados
    const attempts = questAttempts?.filter(a => 
      (a.student_id === studentId || a.student_id === norm || a.student_id === denorm) && a.score >= 60
    ) || [];
    const uniqueQuestsPassed = new Set(attempts.map(a => a.quest_id)).size;
    const questRatio = Math.min(1, uniqueQuestsPassed / totalQuests);

    // 2. Calcular porcentaje de portafolios aprobados
    const items = portfolioItems.filter(p => p.student_id === studentId || p.student_id === norm || p.student_id === denorm);
    const approvedItemsCount = items.filter(p => p.status === 'approved').length;
    const totalItemsCount = items.length;
    const portfolioRatio = totalItemsCount > 0 ? approvedItemsCount / totalItemsCount : 0.5;

    // 3. Ponderación
    const score0to100 = (questRatio * questWeight) + (portfolioRatio * portfolioWeight);
    
    // Mapear de 0-100 a la escala SEP (5.0 a 10.0)
    const finalScore = 5.0 + (score0to100 / 100) * 5.0;
    return parseFloat(finalScore.toFixed(1));
  };

  const handleSaveGrade = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el clic en el botón expanda/cierre la fila
    setGradesSaved(prev => ({ ...prev, [studentId]: true }));
    setTimeout(() => {
      setGradesSaved(prev => ({ ...prev, [studentId]: false }));
    }, 2500);
  };

  const getStudentLevelLabel = (id: string) => {
    const norm = normalizeStudentId(id);
    if (norm === 'std-pb') return '1º Primaria (Baja)';
    if (norm === 'std-pa') return '4º Primaria (Alta)';
    if (norm === 'std-sec') return '2º Secundaria';
    return '4º Semestre Preparatoria';
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans relative overflow-hidden">
      <Header />

      {/* Starry Dark Theme RPG background with blurred color blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="text-left">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)] animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                LISTA DE JUGADORES DEL GREMIO
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-wider font-serif bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-600 bg-clip-text text-transparent mt-1 uppercase">
              Panel del Administrador de Aventuras
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Gestión cualitativa y formativa. Inspecciona las estadísticas del gremio, evalúa sus contratos y firma la boleta SEP oficial.
            </p>
          </div>
        </div>

        {/* Ponderación y Configuración */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md p-6 mb-8 shadow-2xl">
          <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-1.5 mb-4 text-left">
            <Settings className="h-4.5 w-4.5 text-zinc-500" />
            Configuración de Ponderación Formativa
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-400 mb-2.5">
                <span>Retos y Cuestionarios Académicos: <span className="text-blue-400">{questWeight}%</span></span>
                <span>Portafolio de Evidencias Digital: <span className="text-purple-400">{portfolioWeight}%</span></span>
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
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/60 text-xs text-left">
              <Info className="h-4.5 w-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-zinc-400 leading-relaxed font-semibold">
                <strong>Fórmula de Evaluación Formativa:</strong> Calcula el avance del jugador en contratos de misiones ({questWeight}%) y Seesaw ({portfolioWeight}%) para determinar su calificación para la boleta (escala 5.0 a 10.0).
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Jugadores */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-4 mb-2">
            <span className="text-xs font-black tracking-widest text-zinc-500 uppercase">
              JUGADORES DEL GREMIO ({sortedStudents.length})
            </span>
            <span className="text-xs font-black tracking-widest text-zinc-500 uppercase">
              ESTATUS Y BOLETA
            </span>
          </div>

          {sortedStudents.map((student) => {
            const normId = normalizeStudentId(student.id);
            const denormId = denormalizeStudentId(student.id);
            const finalGrade = calculateSepGrade(student.id);
            const isSaved = gradesSaved[student.id] || gradesSaved[normId];
            const isExpanded = expandedStudentId === student.id;
            
            const stats = getStudentStats(student.id);
            const avatar = getStudentAvatar(student.id);

            // Fetch student attempts
            const attempts = questAttempts.filter(a => 
              a.student_id === student.id || a.student_id === normId || a.student_id === denormId
            );

            // Math to show XP Progress
            const xpForCurrentLevel = (stats.level || 1) * 200;
            const progressPercent = Math.min(100, Math.round(((stats.xp || 0) / xpForCurrentLevel) * 100));

            return (
              <div
                key={student.id}
                onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                className={`rounded-2xl border transition-all duration-300 bg-zinc-900/30 backdrop-blur-md overflow-hidden ${
                  isExpanded 
                    ? 'border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-zinc-900/50' 
                    : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40 hover:shadow-[0_0_15px_rgba(168,85,247,0.1)] cursor-pointer'
                }`}
              >
                {/* Row Header Content */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Player Info (Avatar / Name / Class) */}
                  <div className="flex items-center gap-4 text-left">
                    <PlayerAvatarPreview avatar={avatar} name={student.first_name} />

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-md font-bold text-zinc-100 font-serif leading-snug">
                          {formatStudentName(student)}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-purple-950/60 border border-purple-500/20 text-purple-400">
                          {stats.rpg_class?.toUpperCase() || 'EXPLORADOR'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">
                        {getStudentLevelLabel(student.id)}
                      </p>
                    </div>
                  </div>

                  {/* Level & XP Progress bar */}
                  <div className="flex flex-col gap-1 w-full md:w-44 text-left">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                      <span>NIVEL {stats.level}</span>
                      <span>{stats.xp} / {xpForCurrentLevel} XP</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950/60 rounded-full overflow-hidden border border-zinc-900">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>

                  {/* Coins & Quests Complete Count */}
                  <div className="flex items-center gap-6 justify-between md:justify-start">
                    <div className="flex items-center gap-1.5" title="Monedas">
                      <Coins className="h-4 w-4 text-amber-500 fill-current" />
                      <span className="text-xs font-black text-zinc-200">{stats.coins}</span>
                    </div>

                    <div className="w-[1px] h-6 bg-zinc-800 hidden md:block" />

                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">RETOS RESUELTOS</span>
                      <span className="text-xs font-bold text-zinc-300">
                        {attempts.filter(a => a.score >= 60).length} / {totalQuests}
                      </span>
                    </div>
                  </div>

                  {/* SEP Grade and Action */}
                  <div className="flex items-center gap-4 self-stretch md:self-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-zinc-900">
                    <div className="text-center md:text-right flex items-center md:flex-col gap-2 md:gap-0.5">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block md:hidden">SEP SUGERIDO</span>
                      <span className={`text-2xl font-black ${finalGrade >= 8 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.25)]' : finalGrade >= 6 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {finalGrade.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleSaveGrade(student.id, e)}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all duration-300 ${
                          isSaved 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/10'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/50'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Firmada
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Firmar Boleta
                          </>
                        )}
                      </button>
                      
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-zinc-500 hidden md:block" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-zinc-500 hidden md:block" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Section Accordion */}
                {isExpanded && (
                  <div className="border-t border-zinc-900 bg-zinc-950/40 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-3 duration-250 text-left">
                    
                    {/* Column 1: Hero Stats / Attributes */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-850 pb-2 flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-purple-400" />
                        Estadísticas de Héroe
                      </h4>

                      <div className="space-y-4 bg-zinc-950/40 p-4 rounded-xl border border-zinc-900/60 shadow-inner">
                        {/* strength */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                            <span className="flex items-center gap-1"><Dumbbell className="h-3.5 w-3.5 text-rose-500" /> Fuerza</span>
                            <span className="text-zinc-200">{stats.attribute_strength}</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-950">
                            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, (stats.attribute_strength || 10) * 5)}%` }} />
                          </div>
                        </div>

                        {/* intelligence */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                            <span className="flex items-center gap-1"><Brain className="h-3.5 w-3.5 text-blue-500" /> Inteligencia</span>
                            <span className="text-zinc-200">{stats.attribute_intelligence}</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-950">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, (stats.attribute_intelligence || 10) * 5)}%` }} />
                          </div>
                        </div>

                        {/* defense */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center text-xs font-bold text-zinc-400">
                            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-amber-500" /> Defensa</span>
                            <span className="text-zinc-200">{stats.attribute_defense}</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-950">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, (stats.attribute_defense || 10) * 5)}%` }} />
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-zinc-900 pt-3 text-[10px] font-bold text-zinc-500">
                          <span>Puntos de Habilidad: {stats.skill_points}</span>
                          <span>Créditos Startup: {stats.funding_credits} 🪙</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Recent Contracts / Attempts */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-850 pb-2 flex items-center gap-1.5">
                        <Swords className="h-4 w-4 text-purple-400" />
                        Historial de Contratos
                      </h4>

                      <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                        {attempts.length === 0 ? (
                          <div className="text-center py-6 text-xs text-zinc-500 italic bg-zinc-950/40 border border-zinc-900/60 rounded-xl">
                            Sin contratos iniciados aún.
                          </div>
                        ) : (
                          attempts.map((attempt) => (
                            <div key={attempt.id} className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-900/60 flex items-center justify-between text-xs gap-3">
                              <div className="flex flex-col gap-0.5 truncate text-left">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{attempt.quest_id?.split('-')[1] || 'RETO'}</span>
                                <span className="font-bold text-zinc-200 truncate">{attempt.quest_id}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`font-black ${attempt.score >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {attempt.score}%
                                </span>
                                {attempt.score >= 60 ? (
                                  <span className="px-1.5 py-0.5 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase rounded">Aprobado</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-rose-950/30 border border-rose-500/20 text-rose-400 text-[8px] font-black uppercase rounded">Fallo</span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Column 3: Qualitative Feedback / SEP Observations */}
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-850 pb-2 flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-purple-400" />
                        Evaluación Oficial (SEP)
                      </h4>

                      <div className="flex flex-col gap-2.5">
                        <label htmlFor={`obs-${student.id}`} className="text-[9px] font-black text-zinc-500 uppercase tracking-wide">
                          Observaciones Cualitativas y Sugerencias
                        </label>
                        <textarea
                          id={`obs-${student.id}`}
                          onClick={(e) => e.stopPropagation()} // Prevent closing accordion on textarea click
                          value={comments[student.id] || ''}
                          onChange={(e) => setComments(prev => ({ ...prev, [student.id]: e.target.value }))}
                          placeholder="Escribe comentarios formativos de retroalimentación cualitativa..."
                          className="w-full text-xs p-3 rounded-xl border border-zinc-800 bg-zinc-950/50 focus:border-amber-500 focus:outline-none text-zinc-200 min-h-[90px] font-semibold leading-relaxed shadow-inner"
                        />
                        <div className="flex justify-between items-center mt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(student);
                            }}
                            className="text-[10px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-wider"
                          >
                            Ver Expediente Dossier
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Modal de Detalle de Alumno - Dossier */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md transition-opacity duration-300 text-left">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] text-white">
            
            {/* Cabecera del Modal */}
            <div className="relative p-6 border-b border-zinc-800 flex flex-col md:flex-row items-center gap-6 bg-zinc-950/40">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Foto de Perfil con borde según nivel */}
              <div className={`relative h-24 w-24 rounded-full overflow-hidden border-4 flex-shrink-0 shadow-lg ${
                selectedStudent.level === 'primaria' ? 'border-blue-500' :
                selectedStudent.level === 'secundaria' ? 'border-purple-500' : 'border-amber-500'
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
                    selectedStudent.level === 'primaria' ? 'bg-blue-950/40 text-blue-400 border border-blue-500/25' :
                    selectedStudent.level === 'secundaria' ? 'bg-purple-950/40 text-purple-400 border border-purple-500/25' : 
                    'bg-amber-950/40 text-amber-400 border border-amber-500/25'
                  }`}>
                    {selectedStudent.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-850 border border-zinc-800 text-zinc-300 text-[10px] font-bold">
                    {selectedStudent.grade}
                  </span>
                  {selectedStudent.group_id && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-450 text-[10px] font-bold">
                      Grupo {groupsList.find(g => g.id === selectedStudent.group_id)?.name || ''}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-zinc-850 border border-zinc-800 text-zinc-400 text-[10px] font-bold">
                    Turno {selectedStudent.shift || 'matutino'}
                  </span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-black text-zinc-100 font-serif mt-1">
                  {formatStudentName(selectedStudent)}
                </h2>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 mt-2 text-xs text-zinc-455 font-semibold">
                  <span className="font-mono"><strong>Matrícula:</strong> {selectedStudent.enrollment_id}</span>
                  <span className="font-mono"><strong>CURP:</strong> {selectedStudent.curp}</span>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* SECCIÓN 1: DATOS PERSONALES */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-purple-400" />
                    Datos Personales
                  </h3>
                  
                  <div className="space-y-3 bg-zinc-955/20 p-4 rounded-2xl border border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Fecha de Nacimiento</span>
                      <span className="text-xs font-semibold text-zinc-300">{selectedStudent.birth_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Edad Calculada</span>
                      <span className="text-xs font-semibold text-zinc-300">
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
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Género</span>
                      <span className="text-xs font-semibold text-zinc-300">{selectedStudent.gender || 'Masculino'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Escuela de Procedencia</span>
                      <span className="text-xs font-semibold text-zinc-300">{selectedStudent.previous_school || 'Ninguna'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Estado en el Sistema</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase mt-1">
                        ● {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: CONTACTO Y FAMILIA */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-purple-400" />
                    Contacto y Familiares
                  </h3>
                  
                  <div className="space-y-3 bg-zinc-955/20 p-4 rounded-2xl border border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Dirección</span>
                      <span className="text-xs font-semibold text-zinc-300 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0 mt-0.5" /> {selectedStudent.address || 'S/D'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Teléfono de Contacto</span>
                      <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-zinc-500" /> {selectedStudent.phone || 'S/T'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Correo Electrónico</span>
                      <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-zinc-500" /> {selectedStudent.email || 'S/C'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block">Padres / Tutores</span>
                      <div className="mt-1 text-[11px] text-zinc-400 leading-tight space-y-1">
                        {selectedStudent.mother_name && <div>• <strong>Madre:</strong> {selectedStudent.mother_name}</div>}
                        {selectedStudent.father_name && <div>• <strong>Padre:</strong> {selectedStudent.father_name}</div>}
                        {selectedStudent.tutor_name && <div>• <strong>Tutor Legal:</strong> {selectedStudent.tutor_name}</div>}
                      </div>
                    </div>
                    {(selectedStudent.emergency_contact_name || selectedStudent.emergency_contact_phone) && (
                      <div className="border-t border-zinc-800 pt-2 mt-2">
                        <span className="text-[10px] font-black text-rose-450 uppercase block">Contacto de Emergencia</span>
                        <span className="text-[11px] font-bold text-zinc-200 block">{selectedStudent.emergency_contact_name || 'S/N'}</span>
                        <span className="text-[10.5px] text-zinc-500 block">{selectedStudent.emergency_contact_phone || 'S/T'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECCIÓN 3: EXPEDIENTE MÉDICO Y ADMINISTRATIVO */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-purple-400" />
                    Expediente Escolar
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Pagos Pendientes */}
                    <div className="bg-zinc-955/20 p-4 rounded-2xl border border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block mb-1.5">Pagos y Adeudos</span>
                      {selectedStudent.pending_payments && selectedStudent.pending_payments.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedStudent.pending_payments.map((p, idx) => (
                            <div key={idx} className="p-2 rounded bg-amber-950/30 border border-amber-500/25 text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              {p}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/25 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Sin adeudos registrados.
                        </div>
                      )}
                    </div>

                    {/* Reportes de Conducta */}
                    <div className="bg-zinc-955/20 p-4 rounded-2xl border border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block mb-1.5">Reportes de Conducta</span>
                      {selectedStudent.behavior_reports && selectedStudent.behavior_reports.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudent.behavior_reports.map((r, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-rose-955/20 border border-rose-500/20 text-[10.5px]">
                              <div className="flex justify-between font-bold text-rose-400 mb-1 text-[9.5px]">
                                <span>Reporta: {r.reporter}</span>
                                <span>{r.date}</span>
                              </div>
                              <p className="text-zinc-350">{r.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">No cuenta con incidencias disciplinarias.</p>
                      )}
                    </div>

                    {/* Notas del Profesor */}
                    <div className="bg-zinc-955/20 p-4 rounded-2xl border border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-505 uppercase block mb-1.5">Notas de Profesores</span>
                      {selectedStudent.teacher_notes && selectedStudent.teacher_notes.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudent.teacher_notes.map((n, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-purple-955/20 border border-purple-500/20 text-[10.5px]">
                              <div className="flex justify-between font-bold text-purple-400 mb-1 text-[9.5px]">
                                <span>Prof. {n.teacher_name}</span>
                                <span>{n.date}</span>
                              </div>
                              <p className="text-zinc-350 italic">"{n.note}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-505 italic">Sin anotaciones de maestros.</p>
                      )}
                    </div>

                    {/* Médico */}
                    <div className="bg-zinc-955/20 p-4 rounded-2xl border border-zinc-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-505 uppercase">Tipo de Sangre</span>
                        <span className="px-2 py-0.5 rounded bg-red-950/40 border border-red-500/25 text-red-400 text-xs font-extrabold">{selectedStudent.blood_type || 'S/D'}</span>
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-bold text-zinc-505 uppercase block mb-1">Alergias / Restricciones</span>
                        {selectedStudent.medical_notes ? (
                          <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/25 text-red-400 text-xs font-medium">
                            {selectedStudent.medical_notes}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-450">Ninguna alergia reportada</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Pie de Modal */}
            <div className="p-4 px-6 border-t border-zinc-850 bg-zinc-950 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-full text-xs font-bold transition-all"
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
