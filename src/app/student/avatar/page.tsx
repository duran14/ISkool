"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudentStore, useCurrentStudentAvatar } from '@/store/useStudentStore';
import { AnimeAvatarSprite } from '@/components/AnimeAvatarSprite';
import { Header } from '@/components/Header';
import { 
  Sparkles, Check, ChevronLeft, Save, Shield, Compass, User, 
  Smile, Scissors, Eye, Wand2, Paintbrush, Flame, Info 
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';

export default function AvatarCustomizerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const studentInventoryMap = useStudentStore(state => state.studentInventoryMap);
  const changeAvatar = useStudentStore(state => state.changeAvatar);
  const fetchStats = useStudentStore(state => state.fetchStats);
  const avatar = useCurrentStudentAvatar();
  const ownedArtifactIds = studentInventoryMap[activeStudentId] || [];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchStats();
    }
  }, [user, fetchStats]);

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

  // Local editing states initialized from current avatar settings
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [rpgClass, setRpgClass] = useState('mago');
  const [headType, setHeadType] = useState('standard');
  const [skinTone, setSkinTone] = useState('light');
  const [hairColor, setHairColor] = useState('pink');
  const [hairStyle, setHairStyle] = useState('hat');
  const [avatarName, setAvatarName] = useState('Elena la Sabia');
  
  // Audio context for sound effects
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Active section tab
  const [activeSection, setActiveSection] = useState<'base' | 'clase' | 'cabeza' | 'cabello'>('base');

  // Initialize from context on load
  useEffect(() => {
    if (avatar) {
      if (avatar.gender) setGender(avatar.gender);
      if (avatar.rpg_class) setRpgClass(avatar.rpg_class);
      if (avatar.head_type) setHeadType(avatar.head_type);
      if (avatar.skin_tone) setSkinTone(avatar.skin_tone);
      if (avatar.hair_color) setHairColor(avatar.hair_color);
      if (avatar.hair_style) setHairStyle(avatar.hair_style);
      if (avatar.avatar_name) setAvatarName(avatar.avatar_name);
    }
  }, [avatar]);

  // Audio helper
  const playSound = (type: 'click' | 'save' | 'back') => {
    try {
      let ctx = audioCtx;
      if (!ctx) {
        ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioCtx(ctx);
      }
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'save') {
        // Double tone up
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'back') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      }
    } catch (e) {
      console.warn('Audio Context error:', e);
    }
  };

  const handleOptionChange = (setter: any, val: any) => {
    playSound('click');
    setter(val);
  };

  const handleSave = () => {
    playSound('save');
    changeAvatar({
      gender,
      rpg_class: rpgClass,
      head_type: headType,
      skin_tone: skinTone,
      hair_color: hairColor,
      hair_style: hairStyle,
      avatar_name: avatarName
    });
    // Visual feedback transition
    setTimeout(() => {
      router.push('/student');
    }, 150);
  };

  const handleCancel = () => {
    playSound('back');
    router.push('/student');
  };

  // Preset definitions
  const genderOptions = [
    { id: 'male', label: 'Hombre', icon: '👦', desc: 'Apariencia masculina' },
    { id: 'female', label: 'Mujer', icon: '👧', desc: 'Apariencia femenina' },
  ];

  const classOptions = [
    { id: 'guerrero', label: 'Guerrero', icon: '⚔️', desc: 'Armadura pesada de acero y espada.' },
    { id: 'mago', label: 'Mago', icon: '🔮', desc: 'Túnica mística y báculo de cristal.' },
    { id: 'ninja', label: 'Ninja', icon: '🥷', desc: 'Vestimenta de sigilo y bufanda gris.' },
    { id: 'curador', label: 'Curadora', icon: '❤️', desc: 'Túnicas blancas sagradas y cetro de cruz.' },
    { id: 'domador', label: 'Domador de Dragones', icon: '🐉', desc: 'Escamas de dragón y cría compañera.' },
    { id: 'cazador', label: 'Cazador', icon: '🏹', desc: 'Ropas forestales y arco de cazador.' },
    { id: 'reptil', label: 'Reptil', icon: '🦎', desc: 'Túnica verde escamosa y garras brillantes.' }
  ];

  const headOptions = [
    { id: 'standard', label: 'Humano', icon: '🧑', desc: 'Cabeza humana estándar.' },
    { id: 'elf', label: 'Elfo', icon: '🧝', desc: 'Orejas puntiagudas de elfo noble.' },
    { id: 'cat', label: 'Neko Gato', icon: '🐱', desc: 'Tiernas orejas de gato en el cabello.' },
    { id: 'horns', label: 'Dracónico', icon: '😈', desc: 'Cuernos de dragón llameantes.' },
    { id: 'mask', label: 'Ninja Embozo', icon: '😷', desc: 'Máscara táctica que cubre tu boca.' }
  ];

  const skinToneOptions = [
    { id: 'light', label: 'Claro', color: '#FED7AA', text: 'text-orange-200' },
    { id: 'medium', label: 'Bronceado', color: '#FDBA74', text: 'text-orange-300' },
    { id: 'dark', label: 'Oscuro', color: '#92400E', text: 'text-amber-900' },
    { id: 'pale', label: 'Pálido', color: '#FFF1F2', text: 'text-rose-100' },
    { id: 'reptile', label: 'Reptiliano', color: '#10B981', text: 'text-emerald-500' },
    { id: 'dragon', label: 'Dracón', color: '#0891B2', text: 'text-cyan-600' }
  ];

  const hairColorOptions = [
    { id: 'pink', label: 'Rosa Anime', color: '#EC4899' },
    { id: 'brown', label: 'Castaño', color: '#78350F' },
    { id: 'yellow', label: 'Rubio Héroe', color: '#FBBF24' },
    { id: 'black', label: 'Azabache', color: '#111827' },
    { id: 'blue', label: 'Místico', color: '#3B82F6' },
    { id: 'red', label: 'Fuego', color: '#EF4444' },
    { id: 'silver', label: 'Platinado', color: '#D1D5DB' },
    { id: 'purple', label: 'Púrpura', color: '#8B5CF6' },
    { id: 'orange', label: 'Zorro', color: '#F97316' },
    { id: 'green', label: 'Bosque', color: '#10B981' }
  ];

  const hairStyleOptions = [
    { id: 'spiky', label: 'Alocado JRPG', icon: '💥', desc: 'Picos rebeldes clásicos.' },
    { id: 'long', label: 'Largo Fluyente', icon: '💇‍♀️', desc: 'Lacio que cae sobre hombros.' },
    { id: 'ponytail', label: 'Coleta Alta', icon: '👱‍♀️', desc: 'Cola de caballo recogida.' },
    { id: 'twintails', label: 'Dos Coletas', icon: '👧', desc: 'Dos coletas simétricas anime.' },
    { id: 'bob', label: 'Corte Bob', desc: 'Estilo clásico lacio y parejo.' },
    { id: 'dreadlocks', label: 'Dreadlocks', desc: 'Rastas urbanas detalladas.' },
    { id: 'bald', label: 'Calvo', desc: 'Estilo limpio sin cabello.' },
    { id: 'short', label: 'Corto Militar', desc: 'Corto y fácil de manejar.' },
    { id: 'hat', label: 'Sombrero Mago', icon: '🎩', desc: 'Gorro puntiagudo sobre el cabello.' },
    { id: 'mohawk', label: 'Cresta Punk', desc: 'Cresta de combate levantada.' }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-purple-600 selection:text-white pb-12">
      <Header />
      
      {/* Background ambient stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.12),rgba(255,255,255,0))] pointer-events-none" />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1 flex flex-col gap-6 relative z-10">
        
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button 
            onClick={handleCancel}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-semibold group self-start"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            Volver al Gremio
          </button>
          
          <div className="flex items-center gap-3">
            <span className="bg-purple-500/15 border border-purple-500/30 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <Sparkles className="h-3.5 w-3.5" /> Personalizador 2D Anime
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
            Edita tu Avatar de Secundaria
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm mt-1">Crea la apariencia perfecta para tu héroe y lúcelo en la arena de combate.</p>
        </div>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2 items-stretch">
          
          {/* LEFT PANEL: Customize Controls (7 columns on large screens) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Customizer Section Tabs */}
            <div className="flex bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800/80 backdrop-blur-md">
              <button
                onClick={() => handleOptionChange(setActiveSection, 'base')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeSection === 'base'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/35'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <User className="h-4 w-4" />
                Aspecto Base
              </button>
              <button
                onClick={() => handleOptionChange(setActiveSection, 'clase')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeSection === 'clase'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/35'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Shield className="h-4 w-4" />
                Clase y Ropa
              </button>
              <button
                onClick={() => handleOptionChange(setActiveSection, 'cabeza')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeSection === 'cabeza'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/35'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Smile className="h-4 w-4" />
                Cabeza y Orejas
              </button>
              <button
                onClick={() => handleOptionChange(setActiveSection, 'cabello')}
                className={`flex-1 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeSection === 'cabello'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/35'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Scissors className="h-4 w-4" />
                Peinado
              </button>
            </div>

            {/* Customizer Option Deck */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 backdrop-blur-md flex-1 flex flex-col gap-6">
              
              {/* SECTION 1: ASPECTO BASE (GENDER & SKIN TONE) */}
              {activeSection === 'base' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  
                  {/* Sexo / Gender */}
                  <div>
                    <h3 className="text-sm font-black uppercase text-purple-400 tracking-wider mb-3 flex items-center gap-1.5">
                      <span>👤</span> Sexo del Personaje
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {genderOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionChange(setGender, opt.id as any)}
                          className={`group p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex items-center gap-4 ${
                            gender === opt.id
                              ? 'border-purple-500 bg-purple-950/20 text-white shadow-md'
                              : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <span className="text-3xl">{opt.icon}</span>
                          <div>
                            <p className="font-bold text-sm">{opt.label}</p>
                            <p className="text-[10px] text-zinc-500">{opt.desc}</p>
                          </div>
                          {gender === opt.id && (
                            <div className="absolute right-4 top-4 bg-purple-500 text-white rounded-full p-0.5">
                              <Check className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-zinc-800/80" />

                  {/* Tono de Piel */}
                  <div>
                    <h3 className="text-sm font-black uppercase text-purple-400 tracking-wider mb-3 flex items-center gap-1.5">
                      <span>🎨</span> Tono de Piel
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {skinToneOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionChange(setSkinTone, opt.id)}
                          className={`p-3 rounded-2xl border flex items-center gap-3 text-left transition-all duration-300 ${
                            skinTone === opt.id
                              ? 'border-purple-500 bg-purple-950/20 text-white shadow-md'
                              : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <span 
                            className="h-6 w-6 rounded-full border border-black/40 flex-shrink-0 shadow-inner" 
                            style={{ backgroundColor: opt.color }}
                          />
                          <div className="truncate">
                            <p className="font-bold text-xs">{opt.label}</p>
                          </div>
                          {skinTone === opt.id && (
                            <span className="ml-auto text-purple-400">
                              <Check className="h-4 w-4" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* SECTION 2: CLASE Y VESTIMENTA */}
              {activeSection === 'clase' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <h3 className="text-sm font-black uppercase text-purple-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <span>🧙‍♂️</span> Clase del Héroe
                  </h3>
                  <p className="text-zinc-400 text-[11px] mb-3">La clase determina tu armadura de batalla, tu báculo o arma especial y tu acompañante.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-2">
                    {classOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleOptionChange(setRpgClass, opt.id)}
                        className={`group p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex items-start gap-3.5 ${
                          rpgClass === opt.id
                            ? 'border-purple-500 bg-purple-950/20 text-white shadow-md'
                            : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <span className="text-2xl mt-1">{opt.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs uppercase tracking-wide">{opt.label}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                        </div>
                        {rpgClass === opt.id && (
                          <div className="absolute right-3 top-3 bg-purple-500 text-white rounded-full p-0.5">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: CABEZA Y ACCESORIOS */}
              {activeSection === 'cabeza' && (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <h3 className="text-sm font-black uppercase text-purple-400 tracking-wider mb-1 flex items-center gap-1.5">
                    <span>👑</span> Forma de la Cabeza y Orejas
                  </h3>
                  <p className="text-zinc-400 text-[11px] mb-3">Dale un aspecto mitológico o ninja a las orejas y accesorios del rostro.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {headOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleOptionChange(setHeadType, opt.id)}
                        className={`group p-3.5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex items-start gap-3.5 ${
                          headType === opt.id
                            ? 'border-purple-500 bg-purple-950/20 text-white shadow-md'
                            : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <div>
                          <p className="font-bold text-xs uppercase tracking-wide">{opt.label}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                        </div>
                        {headType === opt.id && (
                          <div className="absolute right-3 top-3 bg-purple-500 text-white rounded-full p-0.5">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: CABELLO Y PEINADOS (10 OPTIONS & COLORS) */}
              {activeSection === 'cabello' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  
                  {/* Tipos de Cabello (10 Options) */}
                  <div>
                    <h3 className="text-sm font-black uppercase text-purple-400 tracking-wider mb-1 flex items-center gap-1.5">
                      <span>💈</span> Estilo de Peinado
                    </h3>
                    <p className="text-zinc-400 text-[11px] mb-3">Elige entre 10 peinados de fantasía y corte anime medieval.</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[200px] overflow-y-auto pr-2">
                      {hairStyleOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionChange(setHairStyle, opt.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all duration-300 relative overflow-hidden flex items-center gap-2 ${
                            hairStyle === opt.id
                              ? 'border-purple-500 bg-purple-950/20 text-white'
                              : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                          }`}
                        >
                          <span className="text-sm font-bold truncate">{opt.label}</span>
                          {hairStyle === opt.id && (
                            <span className="ml-auto text-purple-400">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-zinc-800/80" />

                  {/* Color de Cabello */}
                  <div>
                    <h3 className="text-sm font-black uppercase text-purple-400 tracking-wider mb-3 flex items-center gap-1.5">
                      <span>🎨</span> Color de Cabello Tinturado
                    </h3>
                    <div className="flex flex-wrap gap-2.5">
                      {hairColorOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleOptionChange(setHairColor, opt.id)}
                          className={`h-9 w-9 rounded-full border flex items-center justify-center transition-all duration-300 relative hover:scale-105 active:scale-95 ${
                            hairColor === opt.id
                              ? 'border-white ring-2 ring-purple-500 scale-105'
                              : 'border-zinc-800 ring-0 hover:border-zinc-500'
                          }`}
                          style={{ backgroundColor: opt.color }}
                          title={opt.label}
                        >
                          {hairColor === opt.id && (
                            <div className="h-4 w-4 bg-zinc-950/80 rounded-full flex items-center justify-center">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* Save Actions Bar */}
            <div className="flex items-center gap-4 bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 backdrop-blur-md">
              <button
                onClick={handleCancel}
                className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 border border-zinc-800 active:scale-95 flex items-center gap-2"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSave}
                className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-lg shadow-purple-950/20 active:scale-95 flex items-center justify-center gap-2 border border-purple-500/30"
              >
                <Save className="h-4 w-4" />
                Guardar y Regresar al Gremio
              </button>
            </div>

          </div>

          {/* RIGHT PANEL: Real-time Character Preview (5 columns on large screens) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* The live preview frame (Forest theme) */}
            <div className="relative overflow-hidden rounded-3xl border border-emerald-800/30 shadow-2xl flex flex-col h-full min-h-[420px] bg-gradient-to-b from-teal-950 via-emerald-950 to-zinc-950">
              
              {/* Forest Background Elements */}
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Sunrays */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl" />
                <div className="absolute top-0 right-1/4 w-0.5 h-full bg-gradient-to-b from-yellow-400/20 via-yellow-500/5 to-transparent rotate-[25deg] origin-top transform" />
                <div className="absolute top-0 right-1/3 w-1.5 h-full bg-gradient-to-b from-yellow-400/15 via-yellow-500/5 to-transparent rotate-[22deg] origin-top transform" />
                
                {/* SVG silhouette trees */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 right-0 h-1/2 w-full text-emerald-900/25 opacity-30">
                  <path d="M 0 100 L 0 70 L 15 50 L 30 70 L 45 45 L 60 75 L 80 55 L 100 80 L 100 100 Z" fill="currentColor" />
                  <path d="M 0 100 L 0 80 L 25 65 L 50 85 L 75 70 L 100 90 L 100 100 Z" fill="currentColor" opacity="0.5" />
                </svg>

                {/* Animated Fireflies */}
                <div className="absolute inset-0 bg-transparent">
                  <div className="absolute h-1.5 w-1.5 rounded-full bg-yellow-400/70 shadow-lg shadow-yellow-300 top-1/2 left-1/4 animate-bounce opacity-80" style={{ animationDuration: '4s' }} />
                  <div className="absolute h-1 w-1 rounded-full bg-yellow-300/80 shadow-lg shadow-yellow-300 top-1/3 right-1/4 animate-pulse" style={{ animationDuration: '3s' }} />
                  <div className="absolute h-2 w-2 rounded-full bg-emerald-400/60 shadow-lg shadow-emerald-300 bottom-1/3 left-1/3 animate-bounce" style={{ animationDuration: '5s' }} />
                  <div className="absolute h-1 w-1 rounded-full bg-yellow-400/95 shadow-lg shadow-yellow-300 bottom-1/4 right-1/3 animate-pulse" style={{ animationDuration: '2.5s' }} />
                </div>
              </div>

              {/* Live Card Overlay Content */}
              <div className="relative z-10 p-6 flex-1 flex flex-col justify-between">
                
                {/* Preview Info Tag */}
                <div className="flex justify-between items-center bg-zinc-950/60 backdrop-blur-md rounded-xl p-3 border border-zinc-800/80">
                  <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Vista Previa
                  </span>
                  
                  <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                    <Info className="h-3 w-3" /> Cambios en tiempo real
                  </span>
                </div>

                {/* Central Sprite Container */}
                <div className="flex-1 flex items-center justify-center my-6 relative min-h-[220px]">
                  {/* Aura Effect */}
                  <div className="absolute h-40 w-40 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
                  
                  {/* The anime sprite */}
                  <div className="h-48 w-48 relative filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-500">
                    <AnimeAvatarSprite 
                      gender={gender}
                      rpgClass={rpgClass}
                      headType={headType}
                      skinTone={skinTone}
                      hairColor={hairColor}
                      hairStyle={hairStyle}
                      equippedArtifacts={ownedArtifactIds}
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Name Input Box */}
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-2">
                  <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">
                    Nombre del Avatar
                  </label>
                  <input
                    type="text"
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    className="w-full font-bold text-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-purple-500 focus:outline-none text-zinc-100 rounded-xl px-4 py-2 text-center"
                    placeholder="Escribe el nombre de tu avatar..."
                  />
                  <p className="text-[10px] text-zinc-500 text-center">
                    Será visible en el panel del gremio y la clasificación.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
