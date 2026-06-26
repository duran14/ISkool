"use client";

import React, { useState } from 'react';
import { useStudentStore, useCurrentStudentStats, useCurrentStudentAvatar } from '@/store/useStudentStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { BADGES_SEED } from '@/store/seeds';
import { Header } from '@/components/Header';
import { AvatarCustomizer } from '@/components/AvatarCustomizer';
import { RpgCombatViewport } from '@/components/RpgCombatViewport';
import { 
  Flame, Coins, Sparkles, Compass, Trophy, Star, ArrowRight, 
  Lock, Heart, HelpCircle, Gamepad2, Dumbbell, Brain, Shield,
  FileText, Landmark, User, ExternalLink, Award, Sparkle, Users, Swords
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const feedPet = useStudentStore(state => state.feedPet);
  const playWithPet = useStudentStore(state => state.playWithPet);
  const levelUpAttribute = useStudentStore(state => state.levelUpAttribute);
  const changeAvatar = useStudentStore(state => state.changeAvatar);
  const studentInventoryMap = useStudentStore(state => state.studentInventoryMap);
  const studentMessages = useStudentStore(state => state.studentMessages);
  const markStudentMessageAsRead = useStudentStore(state => state.markStudentMessageAsRead);
  const fetchStats = useStudentStore(state => state.fetchStats);
  const fetchPortfolioItems = usePortfolioStore(state => state.fetchPortfolioItems);
  const fetchMissions = useGamificationStore(state => state.fetchMissions);
  
  const rawStats = useCurrentStudentStats();
  const rawAvatar = useCurrentStudentAvatar();

  const defaultStats = {
    student_id: activeStudentId || '',
    xp: 0,
    level: 1,
    coins: 0,
    current_streak: 1,
    max_streak: 1,
    rpg_class: 'mago' as const,
    attribute_strength: 10,
    attribute_intelligence: 10,
    attribute_defense: 10,
    skill_points: 0,
    funding_credits: 1000,
    updated_at: new Date().toISOString()
  };

  const defaultAvatar = {
    student_id: activeStudentId || '',
    avatar_name: 'Estudiante',
    hair_style: 'classic',
    hair_color: '#4B5563',
    eyes_style: 'happy',
    outfit_style: 'explorer',
    outfit_color: '#3B82F6',
    background_style: 'forest',
    unlocked_items: ['classic', 'happy', 'explorer', 'forest'],
    pet_type: 'dragon' as const,
    pet_name: 'Mascota',
    pet_hunger: 50,
    pet_happiness: 50,
    pet_outfit: 'none',
    updated_at: new Date().toISOString()
  };

  const stats = rawStats ? { ...defaultStats, ...rawStats } : defaultStats;
  const avatar = rawAvatar ? { ...defaultAvatar, ...rawAvatar } : defaultAvatar;

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  React.useEffect(() => {
    if (user && user.role === 'student') {
      // Sincronizar activeStudentId con el id real del usuario en Zustand
      const currentActiveId = useStudentStore.getState().activeStudentId;
      if (currentActiveId !== user.id) {
        useStudentStore.setState({ activeStudentId: user.id });
      }

      // Validar si existen estadísticas en Zustand para este usuario y disparar fetch si no
      const localStats = useStudentStore.getState().allStats[user.id];
      if (!localStats) {
        fetchStats();
      }

      fetchPortfolioItems();
      fetchMissions();
    }
  }, [user, fetchStats, fetchPortfolioItems, fetchMissions]);

  const purchaseArtifact = async (studentId: string, artifactId: string) => {
    await useStudentStore.getState().purchaseArtifact(studentId, artifactId);
  };

  const missions = useGamificationStore(state => state.missionsList);
  const shopArtifacts = useGamificationStore(state => state.shopArtifacts);
  const rawStudentBadges = useGamificationStore(state => state.studentBadges);
  const studentBadges = rawStudentBadges.filter(sb => sb.student_id === activeStudentId).map(sb => ({
    ...sb,
    badge: BADGES_SEED.find(b => b.id === sb.badge_id)
  }));
  const badges = BADGES_SEED;

  const portfolioItems = usePortfolioStore(state => state.portfolioItems);
  const submitPeerReview = usePortfolioStore(state => state.submitPeerReview);

  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);

  const ownedArtifactIds = studentInventoryMap[activeStudentId] || [];

  const activeStudent = detailedStudents?.find(s => s.id === activeStudentId);
  const activeLevel = activeStudent?.level || 'preparatoria';
  const activeGrade = activeStudent?.grade || '1º';

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<any>(null);
  const [peerScore, setPeerScore] = useState('9.0');
  const [peerComment, setPeerComment] = useState('');

  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && activeLevel === 'secundaria') {
      const completed = localStorage.getItem('iskool_rpg_tour_completed');
      if (!completed) {
        setShowTour(true);
      }
    }
  }, [activeLevel]);

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


  // Calcular el progreso del nivel
  const xpForCurrentLevel = (stats?.level ?? 1) * 200;
  const progressPercent = Math.min(100, Math.round(((stats?.xp ?? 0) / xpForCurrentLevel) * 100));

  // Renderizador estático del Avatar en SVG
  const renderAvatarPreview = (width = 120, height = 120) => {
    const bgGradient = (avatar?.background_style ?? 'forest') === 'nebula' 
      ? 'from-indigo-950 via-slate-900 to-purple-950'
      : 'from-emerald-950 via-teal-900 to-cyan-950';

    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br ${bgGradient} overflow-hidden shadow-md`} style={{ width, height }}>
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 z-10 filter drop-shadow-md">
          <path d="M25 80 C 25 55, 75 55, 75 80 Z" fill={avatar?.outfit_color ?? '#3B82F6'} />
          <circle cx="50" cy="45" r="18" fill="#FDBA74" />
          <path d="M41 43 Q 44 39 47 43" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M53 43 Q 56 39 59 43" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M44 51 Q 50 56 56 51" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M30 38 C 30 20, 70 20, 70 38" fill={avatar?.hair_color ?? '#4B5563'} />
        </svg>
      </div>
    );
  };

  const renderPetSVG = (type = 'dragon') => {
    switch (type) {
      case 'lobo':
        return (
          <>
            <circle cx="50" cy="56" r="23" fill="#9CA3AF" />
            <circle cx="50" cy="56" r="14" fill="#E5E7EB" />
            <circle cx="50" cy="36" r="16" fill="#D1D5DB" />
            <polygon points="34,30 32,14 44,22" fill="#9CA3AF" />
            <polygon points="36,28 35,18 42,23" fill="#FCA5A5" />
            <polygon points="66,30 68,14 56,22" fill="#9CA3AF" />
            <polygon points="64,28 65,18 58,23" fill="#FCA5A5" />
            <circle cx="38" cy="40" r="5" fill="#F3F4F6" />
            <circle cx="62" cy="40" r="5" fill="#F3F4F6" />
            <circle cx="44" cy="33" r="2" fill="#1F2937" />
            <circle cx="56" cy="33" r="2" fill="#1F2937" />
            <ellipse cx="50" cy="39" rx="4" ry="2.5" fill="#F3F4F6" />
            <polygon points="48,38 52,38 50,40" fill="#111827" />
            <path d="M49 41 Q 50 42.5 51 41" stroke="#111827" strokeWidth="1" fill="none" />
          </>
        );
      case 'venado':
        return (
          <>
            <circle cx="50" cy="56" r="23" fill="#D97706" />
            <circle cx="42" cy="48" r="2" fill="#FFFFFF" />
            <circle cx="58" cy="52" r="2" fill="#FFFFFF" />
            <circle cx="40" cy="58" r="1.5" fill="#FFFFFF" />
            <circle cx="56" cy="62" r="1.5" fill="#FFFFFF" />
            <circle cx="50" cy="36" r="16" fill="#F59E0B" />
            <ellipse cx="33" cy="26" rx="5" ry="10" transform="rotate(-30, 33, 26)" fill="#D97706" />
            <ellipse cx="33" cy="26" rx="2.5" ry="7" transform="rotate(-30, 33, 26)" fill="#FCA5A5" />
            <ellipse cx="67" cy="26" rx="5" ry="10" transform="rotate(30, 67, 26)" fill="#D97706" />
            <ellipse cx="67" cy="26" rx="2.5" ry="7" transform="rotate(30, 67, 26)" fill="#FCA5A5" />
            <circle cx="43" cy="34" r="2.5" fill="#1F2937" />
            <circle cx="42.2" cy="33.2" r="0.8" fill="#FFFFFF" />
            <circle cx="57" cy="34" r="2.5" fill="#1F2937" />
            <circle cx="56.2" cy="33.2" r="0.8" fill="#FFFFFF" />
            <ellipse cx="50" cy="40" rx="3" ry="2" fill="#FEF3C7" />
            <circle cx="50" cy="39" r="1" fill="#111827" />
          </>
        );
      case 'gusano':
        return (
          <>
            <circle cx="38" cy="65" r="12" fill="#EC4899" />
            <circle cx="46" cy="59" r="11" fill="#F43F5E" />
            <circle cx="56" cy="55" r="12" fill="#F472B6" />
            <circle cx="62" cy="40" r="14" fill="#FB7185" />
            <path d="M58 28 Q 54 20 48 22" stroke="#EC4899" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="47" cy="22" r="2.5" fill="#FBBF24" />
            <circle cx="58" cy="38" r="1.5" fill="#FFFFFF" />
            <circle cx="58" cy="38" r="0.8" fill="#111827" />
            <circle cx="67" cy="38" r="1.5" fill="#FFFFFF" />
            <circle cx="67" cy="38" r="0.8" fill="#111827" />
            <path d="M60 45 Q 64 48 68 44" stroke="#881337" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </>
        );
      case 'gatito':
        return (
          <>
            <circle cx="50" cy="56" r="23" fill="#F59E0B" />
            <circle cx="50" cy="58" r="13" fill="#FEF3C7" />
            <circle cx="50" cy="35" r="16" fill="#FBBF24" />
            <polygon points="34,26 31,10 45,20" fill="#F59E0B" />
            <polygon points="36,23 34,14 42,20" fill="#FCA5A5" />
            <polygon points="66,26 69,10 55,20" fill="#F59E0B" />
            <polygon points="64,23 66,14 58,20" fill="#FCA5A5" />
            <circle cx="43" cy="33" r="2" fill="#065F46" />
            <circle cx="57" cy="33" r="2" fill="#065F46" />
            <path d="M46 40 Q 50 43 54 40" stroke="#78350F" strokeWidth="1.2" fill="none" />
            <line x1="33" y1="38" x2="25" y2="36" stroke="#78350F" strokeWidth="1" />
            <line x1="33" y1="41" x2="24" y2="41" stroke="#78350F" strokeWidth="1" />
            <line x1="67" y1="38" x2="75" y2="36" stroke="#78350F" strokeWidth="1" />
            <line x1="67" y1="41" x2="76" y2="41" stroke="#78350F" strokeWidth="1" />
          </>
        );
      case 'dragon':
      default:
        return (
          <>
            <circle cx="50" cy="55" r="24" fill="#34D399" />
            <circle cx="50" cy="35" r="16" fill="#6EE7B7" />
            <circle cx="44" cy="32" r="2" fill="#065F46" />
            <circle cx="56" cy="32" r="2" fill="#065F46" />
            <path d="M46 41 Q 50 44 54 41" stroke="#065F46" strokeWidth="1.5" fill="none" />
            <polygon points="40,22 44,14 47,22" fill="#FBBF24" />
            <polygon points="60,22 56,14 53,22" fill="#FBBF24" />
          </>
        );
    }
  };

  const renderPetAccessories = (type = 'dragon', outfit = 'none') => {
    if (outfit === 'none') return null;

    if (type === 'gusano') {
      return (
        <>
          {outfit === 'hat' && (
            <polygon points="48,24 62,6 76,24" fill="#B91C1C" />
          )}
          {outfit === 'glasses' && (
            <rect x="50" y="34" width="22" height="4" rx="1" fill="#111827" />
          )}
          {outfit === 'cape' && (
            <path d="M30 60 L 12 85 L 75 85 L 60 60 Z" fill="#4F46E5" opacity="0.8" />
          )}
        </>
      );
    }

    return (
      <>
        {outfit === 'hat' && (
          <polygon points="32,18 50,0 68,18" fill="#B91C1C" />
        )}
        {outfit === 'glasses' && (
          <rect x="38" y="30" width="24" height="4" rx="1" fill="#111827" />
        )}
        {outfit === 'cape' && (
          <path d="M25 60 L 10 90 L 90 90 L 75 60 Z" fill="#4F46E5" opacity="0.8" />
        )}
      </>
    );
  };

  // --- RENDER 1: PRIMARIA BAJA (MASCOTAS VIRTUALES) ---
  const renderPrimariaBaja = () => {
    // Ropa de mascota seleccionada
    const petOutfit = avatar?.pet_outfit || 'none';
    const petHunger = avatar?.pet_hunger ?? 50;
    const petHappiness = avatar?.pet_happiness ?? 50;

    return (
      <div className="flex flex-col gap-8">
        {/* Banner Mascota */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 p-8 text-white shadow-lg">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-xl animate-pulse" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            
            {/* Visualización de la Mascota */}
            <div className="flex flex-col items-center gap-3 bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-sm shadow-inner w-52">
              <span className="text-[10px] font-extrabold bg-yellow-400 text-teal-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Mascota: {avatar?.pet_name ?? 'Mascota'}
              </span>
              
              {/* Pet SVG */}
              <div className="h-28 w-28 flex items-center justify-center relative bg-emerald-950/20 rounded-full border border-white/10 p-2">
                <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
                  {renderPetSVG(avatar?.pet_type || 'dragon')}
                  {renderPetAccessories(avatar?.pet_type || 'dragon', petOutfit)}
                </svg>
              </div>

              {/* Ropa selector */}
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => setIsPetModalOpen(true)}
                  className="px-2 py-0.5 rounded text-[9px] font-bold bg-white text-emerald-700 hover:bg-emerald-50"
                >
                  Mascota
                </button>
                <button
                  onClick={() => changeAvatar({ pet_outfit: 'hat' })}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${petOutfit === 'hat' ? 'bg-white text-emerald-700' : 'bg-white/25 text-white'}`}
                >
                  Gorro
                </button>
                <button
                  onClick={() => changeAvatar({ pet_outfit: 'glasses' })}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${petOutfit === 'glasses' ? 'bg-white text-emerald-700' : 'bg-white/25 text-white'}`}
                >
                  Lentes
                </button>
                <button
                  onClick={() => changeAvatar({ pet_outfit: 'cape' })}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${petOutfit === 'cape' ? 'bg-white text-emerald-700' : 'bg-white/25 text-white'}`}
                >
                  Capa
                </button>
                <button
                  onClick={() => changeAvatar({ pet_outfit: 'none' })}
                  className="px-1.5 py-0.5 rounded text-[9px] bg-red-500/20 text-white font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Acciones de Mascota e Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight">¡Hola, {avatar?.avatar_name ?? 'Estudiante'}!</h1>
              <p className="text-emerald-100 text-xs mt-1">Cuida de {avatar?.pet_name ?? 'Mascota'} resolviendo tus retos escolares.</p>
              
              {/* Barras de Estado */}
              <div className="grid grid-cols-2 gap-4 mt-4 max-w-sm">
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                    <span>Hambre</span>
                    <span>{petHunger}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 rounded-full" style={{ width: `${petHunger}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                    <span>Felicidad</span>
                    <span>{petHappiness}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${petHappiness}%` }} />
                  </div>
                </div>
              </div>

              {/* Botones de Cuidado */}
              <div className="flex gap-3 mt-5">
                <button
                  onClick={feedPet}
                  className="px-4 py-2 bg-white text-emerald-800 rounded-xl text-xs font-bold shadow-md hover:bg-emerald-50 transition-all flex items-center gap-1.5"
                >
                  <Gamepad2 className="h-4 w-4" />
                  Alimentar (5 🪙)
                </button>
                <button
                  onClick={playWithPet}
                  className="px-4 py-2 bg-emerald-950/45 text-white border border-white/25 rounded-xl text-xs font-bold hover:bg-emerald-950/60 transition-all flex items-center gap-1.5"
                >
                  <Heart className="h-4 w-4 fill-current text-rose-300" />
                  Jugar (2 🪙)
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Laberinto de Misiones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missions.map(mission => (
            <div key={mission.id} className="rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 p-5 flex flex-col justify-between shadow-sm">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                  Laberinto de {mission.subject_id === 'sub-math' ? 'Matemáticas' : 'Español'}
                </span>
                <h3 className="text-md font-bold mt-2 text-zinc-900 dark:text-white">{mission.title}</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{mission.description}</p>
              </div>
              
              <Link
                href={`/student/missions/${mission.id}`}
                className="w-full text-center mt-5 bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-xl text-xs font-bold text-white shadow-md shadow-emerald-500/10 transition-all flex items-center justify-center gap-1.5"
              >
                Buscar pistas en el laberinto
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- RENDER 2: PRIMARIA ALTA (EXPLORACIÓN ESPACIAL - YA DETALLADO) ---
  const renderPrimariaAlta = () => {
    return (
      <div className="flex flex-col gap-8">
        {/* Banner de Bienvenida Espacial */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-lg">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-pulse" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              {renderAvatarPreview(110, 110)}
              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="mt-2 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition-all"
              >
                Cambiar Traje
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="inline-flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                Explorador Académico
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-2">¡Hola, {avatar?.avatar_name ?? 'Estudiante'}!</h1>
              <p className="text-blue-100 mt-1 text-xs">Tu racha de {stats?.current_streak ?? 1} días está activa. ¡Viaja por la galaxia escolar!</p>

              {/* XP */}
              <div className="mt-4 max-w-md">
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span>Nivel {stats?.level ?? 1}</span>
                  <span>{stats?.xp ?? 0} / {xpForCurrentLevel} XP</span>
                </div>
                <div className="h-3 w-full bg-white/25 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa de Misiones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missions.map(mission => (
            <div key={mission.id} className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[10px] text-blue-600 font-bold uppercase tracking-wider">
                  Misión Espacial
                </span>
                <h3 className="text-md font-bold mt-2 text-zinc-900 dark:text-white">{mission.title}</h3>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{mission.description}</p>
              </div>
              <Link
                href={`/student/missions/${mission.id}`}
                className="w-full text-center mt-5 bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5"
              >
                Iniciar Aventura
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // --- RENDER 3: SECUNDARIA (RPG HEROES OF ISKOOL) ---
  const renderSecundariaRPG = () => {
    const rpgClass = stats?.rpg_class || 'mago';
    const strength = stats?.attribute_strength ?? 10;
    const intelligence = stats?.attribute_intelligence ?? 10;
    const defense = stats?.attribute_defense ?? 10;
    const skillPoints = stats?.skill_points ?? 0;

    return (
      <div className="flex flex-col gap-8">
        {/* Banner RPG */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-8 text-white shadow-xl border border-indigo-700/30">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-purple-500/25 blur-xl animate-pulse" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            
            {/* Hoja de Atributos */}
            <div id="rpg-attributes-panel" className="bg-zinc-950/50 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md shadow-2xl w-full md:w-72 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <span className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Hoja de Héroe
                </span>
                <span className="text-[10px] font-bold text-yellow-500">Clase: {rpgClass.toUpperCase()}</span>
              </div>

              {/* Atributos */}
              <div className="flex flex-col gap-3">
                {/* Fuerza */}
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Dumbbell className="h-3.5 w-3.5 text-rose-500" />
                    Fuerza
                  </span>
                  <div className="flex items-center gap-2">
                    <strong className="text-zinc-100">{strength}</strong>
                    {skillPoints > 0 && (
                      <button
                        onClick={() => levelUpAttribute('strength')}
                        className="h-5 w-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                {/* Inteligencia */}
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Brain className="h-3.5 w-3.5 text-blue-500" />
                    Inteligencia
                  </span>
                  <div className="flex items-center gap-2">
                    <strong className="text-zinc-100">{intelligence}</strong>
                    {skillPoints > 0 && (
                      <button
                        onClick={() => levelUpAttribute('intelligence')}
                        className="h-5 w-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>

                {/* Defensa */}
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Shield className="h-3.5 w-3.5 text-amber-500" />
                    Defensa
                  </span>
                  <div className="flex items-center gap-2">
                    <strong className="text-zinc-100">{defense}</strong>
                    {skillPoints > 0 && (
                      <button
                        onClick={() => levelUpAttribute('defense')}
                        className="h-5 w-5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {skillPoints > 0 ? (
                <div className="text-[10px] text-emerald-400 font-bold text-center border-t border-zinc-800 pt-2 animate-bounce">
                  ¡Tienes {skillPoints} puntos de habilidad disponibles!
                </div>
              ) : (
                <div className="text-[9px] text-zinc-500 text-center border-t border-zinc-800 pt-2">
                  Completa misiones para ganar puntos de habilidad.
                </div>
              )}
            </div>

            {/* Info principal RPG */}
            <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6">
              <div>
                <span className="bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Gremio de Héroes
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight mt-2">{avatar?.avatar_name || (activeStudent ? `${activeStudent.first_name} ${activeStudent.last_name_1}` : 'Elena la Sabia')}</h1>
                <p className="text-zinc-300 text-xs mt-1">Completa contratos académicos para subir tus estadísticas de rol.</p>

                {/* XP RPG */}
                <div className="mt-4 w-64 sm:w-80">
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span>Nivel {stats?.level ?? 1} ({rpgClass})</span>
                    <span>{stats?.xp ?? 0} / {xpForCurrentLevel} XP</span>
                  </div>
                  <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Botón de la Tienda de Artefactos y Personalización */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  id="rpg-avatar-edit-button"
                  href="/student/avatar"
                  className="relative group overflow-hidden px-6 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-950/20 transition-all duration-300 border border-purple-500/35 active:scale-95 flex flex-col items-center gap-1.5 min-w-[140px]"
                >
                  <span className="text-2xl">🧙‍♂️</span>
                  <span className="relative z-10 flex items-center gap-2">
                    Edita tu Avatar
                  </span>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Link>

                <Link
                  id="rpg-shop-banner-button"
                  href="/student/shop"
                  className="relative group overflow-hidden px-6 py-4 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:from-yellow-400 hover:to-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-950/20 transition-all duration-300 border border-yellow-400/30 active:scale-95 flex flex-col items-center gap-1.5 min-w-[140px]"
                >
                  <span className="text-2xl">🏬</span>
                  <span className="relative z-10 flex items-center gap-2">
                    Tienda Mágica
                  </span>
                  <div className="absolute inset-0 bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* Campo de Batalla del Gremio */}
        <div id="rpg-combat-arena" className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Swords className="h-5 w-5 text-purple-500" />
            Arena del Gremio: Batalla Sincrónica
          </h2>
          <RpgCombatViewport />
        </div>

        {/* Tablero de Gremios / Contratos de Secundaria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {missions.map(mission => (
            <div key={mission.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col justify-between shadow-lg text-white">
              <div>
                <span className="px-2 py-0.5 rounded bg-purple-950 text-[10px] text-purple-300 font-bold uppercase tracking-wider">
                  Contrato de Gremio
                </span>
                <h3 className="text-md font-bold mt-2 text-white">{mission.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{mission.description}</p>
              </div>
              <Link
                href={`/student/missions/${mission.id}`}
                className="w-full text-center mt-5 bg-purple-700 hover:bg-purple-600 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/10"
              >
                Aceptar Contrato Académico
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>


      </div>
    );
  };

  // --- RENDER 4: PREPARATORIA (STARTUPS E INNOVACIÓN) ---
  const renderPreparatoriaStartup = () => {
    const funding = stats?.funding_credits ?? 1000;
    
    // Buscar entregas del portafolio que el estudiante actual puede "coevaluar" (de otros alumnos)
    // Para simplificar la demo, listamos items de portafolio que no pertenecen a este alumno y que no tienen coevaluación registrada
    const peerItemsToReview = portfolioItems.filter(item => item.student_id !== activeStudentId && !item.peer_review_score);

    return (
      <div className="flex flex-col gap-8">
        {/* Banner Startup */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 text-white shadow-xl">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-blue-500/10 blur-xl" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            
            <div>
              <span className="bg-blue-500/25 border border-blue-500/30 text-blue-400 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Incubadora de Innovación
              </span>
              <h1 className="text-3xl font-black mt-2">{avatar?.avatar_name || (activeStudent ? `${activeStudent.first_name} ${activeStudent.last_name_1}` : 'Mateo Díaz')}</h1>
              <p className="text-xs text-zinc-400 mt-1">Simula proyectos profesionales, coevalúa propuestas y acumula créditos de inversión.</p>
            </div>

            {/* Créditos de Inversión */}
            <div className="bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800 flex items-center gap-4 text-center">
              <Landmark className="h-8 w-8 text-blue-500" />
              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Créditos de Financiamiento</span>
                <span className="text-xl font-black text-white">{funding} 💰</span>
              </div>
            </div>

          </div>
        </div>

        {/* Sección de Coevaluación (Peer Review) */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Evaluación de Proyectos por Pares (Simulación Laboral)
          </h2>

          {peerItemsToReview.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center text-xs text-zinc-400">
              No hay proyectos de compañeros pendientes de evaluar por tu parte. ¡Gran trabajo!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {peerItemsToReview.map((item) => (
                <div key={item.id} className="rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 p-5 flex flex-col justify-between gap-4 shadow-sm">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600 dark:bg-blue-950/20 dark:text-blue-400">
                        {item.subject?.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-semibold">De: {item.student_profile?.first_name}</span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{item.title}</h3>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.self_reflection}</p>
                  </div>

                  <button
                    onClick={() => setSelectedReviewItem(item)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    Coevaluar Propuesta
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Misiones / Hitos de Proyecto */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Compass className="h-5 w-5 text-blue-500" />
            Hitos y Entregables Activos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {missions.map(mission => (
              <div key={mission.id} className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 text-[10px] text-zinc-600 dark:text-zinc-400 font-bold uppercase tracking-wider">
                    Proyecto de Hito
                  </span>
                  <h3 className="text-md font-bold mt-2 text-zinc-900 dark:text-white">{mission.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{mission.description}</p>
                </div>
                <Link
                  href={`/student/missions/${mission.id}`}
                  className="w-full text-center mt-5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  Entregar Documento Ejecutivo
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Modal de Coevaluación */}
        {selectedReviewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              
              <h3 className="text-md font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Coevaluar: {selectedReviewItem.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Autor: {selectedReviewItem.student_profile?.first_name} {selectedReviewItem.student_profile?.last_name}</p>

              {/* Formulario */}
              <div className="flex flex-col gap-4 mt-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Calificación sugerida del proyecto (0.0 a 10.0)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={peerScore}
                    onChange={(e) => setPeerScore(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent mt-1 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">Comentarios y Feedback de Innovación</label>
                  <textarea
                    required
                    value={peerComment}
                    onChange={(e) => setPeerComment(e.target.value)}
                    placeholder="Escribe comentarios objetivos. ¿Qué se puede mejorar? ¿Qué valor aporta la propuesta al mercado escolar?"
                    className="w-full text-xs p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-transparent mt-1 min-h-[90px] text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => setSelectedReviewItem(null)}
                    className="px-4 py-2 border rounded-full text-xs font-bold text-zinc-500 hover:bg-zinc-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await submitPeerReview(selectedReviewItem.id, parseFloat(peerScore), peerComment);
                        setSelectedReviewItem(null);
                        setPeerComment('');
                        alert('¡Coevaluación registrada exitosamente! Ganaste +100 XP.');
                      } catch (error: any) {
                        alert(`Error al registrar coevaluación: ${error.message || error}`);
                      }
                    }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold"
                  >
                    Registrar Coevaluación (+100 XP)
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Renderizado Condicional por Nivel */}
        {activeLevel === 'primaria' && (parseInt(activeGrade) <= 3 ? renderPrimariaBaja() : renderPrimariaAlta())}
        {activeLevel === 'secundaria' && renderSecundariaRPG()}
        {activeLevel === 'preparatoria' && renderPreparatoriaStartup()}

      </main>

      <AvatarCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />

      {isPetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2 mb-4">
              ✨ Elige tu Mascota y su Nombre
            </h3>
            
            {/* Opciones de Mascota */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {[
                { type: 'dragon', label: 'Dragón', emoji: '🐉' },
                { type: 'lobo', label: 'Lobo', emoji: '🐺' },
                { type: 'venado', label: 'Venado', emoji: '🦌' },
                { type: 'gusano', label: 'Gusano', emoji: '🐛' },
                { type: 'gatito', label: 'Gato', emoji: '🐱' }
              ].map(option => (
                <button
                  key={option.type}
                  onClick={() => changeAvatar({ pet_type: option.type as any })}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                    (avatar?.pet_type || 'dragon') === option.type
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/35 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="text-[9px] mt-1 text-center truncate w-full">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Nombre de la Mascota */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase block mb-1.5">Nombre de la Mascota</label>
              <input
                type="text"
                value={avatar?.pet_name || ''}
                onChange={(e) => changeAvatar({ pet_name: e.target.value })}
                placeholder="Ej. Llamita"
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsPetModalOpen(false)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold shadow-md shadow-emerald-500/10 transition-all"
              >
                ¡Listo!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tour Overlay de Gamificación */}
      {showTour && activeLevel === 'secundaria' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm transition-all duration-300">
          <div className="relative max-w-md w-full mx-4 p-6 rounded-3xl border border-purple-500/50 bg-gradient-to-br from-zinc-900 to-purple-950/90 text-white shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Step indicator */}
            <div className="flex justify-between items-center text-[10px] font-black text-purple-400 uppercase tracking-widest">
              <span>Guía del Gremio (Paso {tourStep + 1} de 4)</span>
              <button 
                onClick={() => {
                  setShowTour(false);
                  localStorage.setItem('iskool_rpg_tour_completed', 'true');
                }}
                className="hover:text-purple-300 transition-colors"
              >
                Saltar Tour ✕
              </button>
            </div>

            {/* Mentor Avatar and Dialogue */}
            <div className="flex gap-4 items-start bg-zinc-950/40 p-4 rounded-2xl border border-purple-900/30">
              <div className="text-4xl p-2 bg-purple-950/50 rounded-2xl border border-purple-500/30 shadow-inner select-none">🧙‍♂️</div>
              <div className="flex-1">
                <strong className="text-purple-300 text-xs font-bold block mb-1">Sombra (Mentor de Rol)</strong>
                <p className="text-xs text-zinc-300 leading-relaxed font-semibold">
                  {tourStep === 0 && "🔮 ¡Bienvenido al Gremio de Héroes! Aquí verás tu Hoja de Héroe. Al completar contratos de tareas y subir de nivel, obtendrás puntos para mejorar tu Fuerza, Inteligencia y Defensa."}
                  {tourStep === 1 && "🏬 Esta es la Tienda de Artefactos. Compra objetos mágicos con las monedas que ganes. ¡Cada artefacto te otorga una oportunidad extra de reintentar el examen final!"}
                  {tourStep === 2 && "👾 En la Arena, tus tareas pendientes cobran vida como monstruos en el lado derecho. ¡Completa las tareas para aumentar tu Poder Académico y golpear con fuerza!"}
                  {tourStep === 3 && "👑 El Examen es el Jefe Final. Si no completas tus tareas, tu Poder Académico será 0% y tus ataques harán 0 de daño. ¡Véncelo en menos turnos para obtener mejor calificación!"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-2">
              <button
                disabled={tourStep === 0}
                onClick={() => setTourStep(prev => prev - 1)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Atrás
              </button>
              
              <button
                onClick={() => {
                  if (tourStep < 3) {
                    setTourStep(prev => prev + 1);
                    // Highlight corresponding element if needed
                    const targets = ["rpg-attributes-panel", "rpg-shop-banner-button", "rpg-combat-arena", "rpg-combat-arena"];
                    const targetId = targets[tourStep + 1];
                    const el = document.getElementById(targetId);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.classList.add('ring-4', 'ring-yellow-400/60', 'duration-500');
                      setTimeout(() => el.classList.remove('ring-4', 'ring-yellow-400/60'), 2000);
                    }
                  } else {
                    setShowTour(false);
                    localStorage.setItem('iskool_rpg_tour_completed', 'true');
                  }
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                {tourStep === 3 ? "¡Entendido!" : "Siguiente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
