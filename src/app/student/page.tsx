"use client";

import React, { useState } from 'react';
import { useGamification } from '@/context/gamification-context';
import { Header } from '@/components/Header';
import { AvatarCustomizer } from '@/components/AvatarCustomizer';
import { 
  Flame, Coins, Sparkles, Compass, Trophy, Star, ArrowRight, 
  Lock, Heart, HelpCircle, Gamepad2, Dumbbell, Brain, Shield,
  FileText, Landmark, User, ExternalLink, Award, Sparkle, Users
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { 
    stats, avatar, missions, studentBadges, badges, activeStudentId, 
    feedPet, playWithPet, levelUpAttribute, portfolioItems, submitPeerReview,
    changeAvatar
  } = useGamification();

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<any>(null);
  const [peerScore, setPeerScore] = useState('9.0');
  const [peerComment, setPeerComment] = useState('');

  // Calcular el progreso del nivel
  const xpForCurrentLevel = stats.level * 200;
  const progressPercent = Math.min(100, Math.round((stats.xp / xpForCurrentLevel) * 100));

  // Renderizador estático del Avatar en SVG
  const renderAvatarPreview = (width = 120, height = 120) => {
    const bgGradient = avatar.background_style === 'nebula' 
      ? 'from-indigo-950 via-slate-900 to-purple-950'
      : 'from-emerald-950 via-teal-900 to-cyan-950';

    return (
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br ${bgGradient} overflow-hidden shadow-md`} style={{ width, height }}>
        <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 z-10 filter drop-shadow-md">
          <path d="M25 80 C 25 55, 75 55, 75 80 Z" fill={avatar.outfit_color} />
          <circle cx="50" cy="45" r="18" fill="#FDBA74" />
          <path d="M41 43 Q 44 39 47 43" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M53 43 Q 56 39 59 43" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M44 51 Q 50 56 56 51" stroke="#1F2937" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M30 38 C 30 20, 70 20, 70 38" fill={avatar.hair_color} />
        </svg>
      </div>
    );
  };

  // --- RENDER 1: PRIMARIA BAJA (MASCOTAS VIRTUALES) ---
  const renderPrimariaBaja = () => {
    // Ropa de mascota seleccionada
    const petOutfit = avatar.pet_outfit || 'none';
    const petHunger = avatar.pet_hunger ?? 50;
    const petHappiness = avatar.pet_happiness ?? 50;

    return (
      <div className="flex flex-col gap-8">
        {/* Banner Mascota */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 p-8 text-white shadow-lg">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-xl animate-pulse" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            
            {/* Visualización de la Mascota */}
            <div className="flex flex-col items-center gap-3 bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-sm shadow-inner w-52">
              <span className="text-[10px] font-extrabold bg-yellow-400 text-teal-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Mascota: {avatar.pet_name}
              </span>
              
              {/* Pet SVG */}
              <div className="h-28 w-28 flex items-center justify-center relative bg-emerald-950/20 rounded-full border border-white/10 p-2">
                <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
                  {/* Cuerpo Dragon */}
                  <circle cx="50" cy="55" r="24" fill="#34D399" />
                  <circle cx="50" cy="35" r="16" fill="#6EE7B7" />
                  {/* Ojos */}
                  <circle cx="44" cy="32" r="2" fill="#065F46" />
                  <circle cx="56" cy="32" r="2" fill="#065F46" />
                  <path d="M46 41 Q 50 44 54 41" stroke="#065F46" strokeWidth="1.5" fill="none" />
                  {/* Cuernos */}
                  <polygon points="40,22 44,14 47,22" fill="#FBBF24" />
                  <polygon points="60,22 56,14 53,22" fill="#FBBF24" />
                  
                  {/* Accesorios / Outfit de Mascota */}
                  {petOutfit === 'hat' && (
                    <polygon points="32,18 50,0 68,18" fill="#B91C1C" />
                  )}
                  {petOutfit === 'glasses' && (
                    <rect x="38" y="30" width="24" height="4" rx="1" fill="#111827" />
                  )}
                  {petOutfit === 'cape' && (
                    <path d="M25 60 L 10 90 L 90 90 L 75 60 Z" fill="#4F46E5" opacity="0.8" />
                  )}
                </svg>
              </div>

              {/* Ropa selector */}
              <div className="flex gap-1.5 mt-2">
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
              <h1 className="text-3xl font-extrabold tracking-tight">¡Hola, {avatar.avatar_name}!</h1>
              <p className="text-emerald-100 text-xs mt-1">Cuida de {avatar.pet_name} resolviendo tus retos escolares.</p>
              
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
              <h1 className="text-3xl font-extrabold tracking-tight mt-2">¡Hola, {avatar.avatar_name}!</h1>
              <p className="text-blue-100 mt-1 text-xs">Tu racha de {stats.current_streak} días está activa. ¡Viaja por la galaxia escolar!</p>

              {/* XP */}
              <div className="mt-4 max-w-md">
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span>Nivel {stats.level}</span>
                  <span>{stats.xp} / {xpForCurrentLevel} XP</span>
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
    const rpgClass = stats.rpg_class || 'mago';
    const strength = stats.attribute_strength || 10;
    const intelligence = stats.attribute_intelligence || 10;
    const defense = stats.attribute_defense || 10;
    const skillPoints = stats.skill_points || 0;

    return (
      <div className="flex flex-col gap-8">
        {/* Banner RPG */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-8 text-white shadow-xl border border-indigo-700/30">
          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-purple-500/25 blur-xl animate-pulse" />
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            
            {/* Hoja de Atributos */}
            <div className="bg-zinc-950/50 p-5 rounded-2xl border border-zinc-800 backdrop-blur-md shadow-2xl w-full md:w-72 flex flex-col gap-4">
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
            <div className="flex-1">
              <span className="bg-purple-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Gremio de Héroes
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight mt-2">Elena la Sabia</h1>
              <p className="text-zinc-300 text-xs mt-1">Completa contratos académicos para subir tus estadísticas de rol.</p>

              {/* XP RPG */}
              <div className="mt-4 max-w-md">
                <div className="flex justify-between items-center text-xs font-bold mb-1">
                  <span>Nivel {stats.level} ({rpgClass})</span>
                  <span>{stats.xp} / {xpForCurrentLevel} XP</span>
                </div>
                <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

          </div>
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
    const funding = stats.funding_credits ?? 1000;
    
    // Buscar entregas del portafolio que el estudiante actual puede "coevaluar" (de otros alumnos)
    // Para simplificar la demo, listamos items de portafolio que no pertenecen a std-prep (ej. std-pa) y que no tienen coevaluación registrada
    const peerItemsToReview = portfolioItems.filter(item => item.student_id !== 'std-prep' && !item.peer_review_score);

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
              <h1 className="text-3xl font-black mt-2">Mateo Díaz</h1>
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
                    onClick={() => {
                      submitPeerReview(selectedReviewItem.id, parseFloat(peerScore), peerComment);
                      setSelectedReviewItem(null);
                      setPeerComment('');
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
        {activeStudentId === 'std-pb' && renderPrimariaBaja()}
        {activeStudentId === 'std-pa' && renderPrimariaAlta()}
        {activeStudentId === 'std-sec' && renderSecundariaRPG()}
        {activeStudentId === 'std-prep' && renderPreparatoriaStartup()}

      </main>

      <AvatarCustomizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
      />
    </div>
  );
}
