"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Menu, 
  Power, 
  Laptop, 
  Mail, 
  Fingerprint, 
  Building2, 
  CalendarDays,
  Play,
  Settings
} from 'lucide-react';
import AdminCarouselCanvas, { CarouselItem } from '@/components/AdminCarouselCanvas';

// 1. Colegios (Vista Super Usuario)
const COLEGIOS_DATA: CarouselItem[] = [
  {
    id: 'col-1',
    title: 'Americano',
    subtitle: 'Bienvenido - DUEÑO -',
    creator: 'creador: taller1@robotbrain.mx',
    lastAccess: 'Último acceso: hace 14 días',
    code: '6ac33b2c3195bc4d',
    themeColor: 0x3b82f6, // Blue
    logoBgColor: 0x1e3a8a,
    logoType: 'shield_i'
  },
  {
    id: 'col-2',
    title: 'Juan Mantovani - Primaria Mayor',
    subtitle: 'Bienvenido - GAME MASTER -',
    creator: 'creador: pedro@robotbrain.mx',
    lastAccess: 'Último acceso: hace 8 días',
    code: '802fcc3d31760657',
    themeColor: 0x10b981, // Emerald/Green
    logoBgColor: 0x064e3b,
    logoType: 'shield_lion'
  },
  {
    id: 'col-3',
    title: 'Ceili PM lunes',
    subtitle: 'Bienvenido - DUEÑO -',
    creator: 'creador: taller1@robotbrain.mx',
    lastAccess: 'Último acceso: hace 2 meses',
    code: '21240be538a6c9d7',
    themeColor: 0xef4444, // Red
    logoBgColor: 0x7f1d1d,
    logoType: 'shield_ceili'
  },
  {
    id: 'col-4',
    title: 'CDI',
    subtitle: 'Bienvenido - DUEÑO -',
    creator: 'creador: taller1@robotbrain.mx',
    lastAccess: 'Último acceso: hace 2 meses',
    code: '5ccf61a527e10a8',
    themeColor: 0xf97316, // Orange
    logoBgColor: 0x7c2d12,
    logoType: 'shield_cdi'
  },
  {
    id: 'col-5',
    title: 'Ayuda!!!!!!',
    subtitle: 'Bienvenido - DUEÑO -',
    creator: 'creador: taller1@robotbrain.mx',
    lastAccess: 'Último acceso: hace 2 meses',
    code: '00324ffe6573d216',
    themeColor: 0xeab308, // Yellow
    logoBgColor: 0x713f12,
    logoType: 'shield_exclamation'
  }
];

// 2. Materias (Vista Profesor)
const MATERIAS_DATA: CarouselItem[] = [
  {
    id: 'mat-1',
    title: 'Matemáticas',
    subtitle: 'Curso Avanzado',
    creator: 'Profesor: Roberto Díaz',
    lastAccess: 'Último acceso: Hoy',
    code: 'MAT-2026-ALPHA',
    themeColor: 0x8b5cf6, // Purple
    logoBgColor: 0x4c1d95,
    logoType: 'sigma'
  },
  {
    id: 'mat-2',
    title: 'Historia',
    subtitle: 'Historia de México',
    creator: 'Profesor: Roberto Díaz',
    lastAccess: 'Último acceso: ayer',
    code: 'HIS-2026-NEM',
    themeColor: 0xf59e0b, // Amber
    logoBgColor: 0x78350f,
    logoType: 'scroll'
  },
  {
    id: 'mat-3',
    title: 'Ciencias',
    subtitle: 'Biología y Química',
    creator: 'Profesor: Roberto Díaz',
    lastAccess: 'Último acceso: hace 3 días',
    code: 'CIE-2026-BETA',
    themeColor: 0x10b981, // Green
    logoBgColor: 0x064e3b,
    logoType: 'atom'
  },
  {
    id: 'mat-4',
    title: 'Geografía',
    subtitle: 'Mundo y Sociedad',
    creator: 'Profesor: Roberto Díaz',
    lastAccess: 'Último acceso: hace 5 días',
    code: 'GEO-2026-OMEGA',
    themeColor: 0x3b82f6, // Blue
    logoBgColor: 0x1e3a8a,
    logoType: 'globe'
  },
  {
    id: 'mat-5',
    title: 'Español',
    subtitle: 'Lenguaje y Comunicación',
    creator: 'Profesor: Roberto Díaz',
    lastAccess: 'Último acceso: hace 1 semana',
    code: 'ESP-2026-GAMMA',
    themeColor: 0xec4899, // Pink
    logoBgColor: 0x831843,
    logoType: 'book'
  }
];

export default function AdminDashboard() {
  const router = useRouter();
  const [view, setView] = useState<'colegios' | 'materias'>('colegios');
  const [activeIndex, setActiveIndex] = useState(0);
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [colegios, setColegios] = useState<CarouselItem[]>(COLEGIOS_DATA);
  const [materias, setMaterias] = useState<CarouselItem[]>(MATERIAS_DATA);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar datos desde localStorage al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedColegios = localStorage.getItem('iskool_colegios_data');
      if (storedColegios) {
        try {
          setColegios(JSON.parse(storedColegios));
        } catch (e) {
          console.error("Error parsing stored colegios:", e);
        }
      }
      const storedMaterias = localStorage.getItem('iskool_materias_data');
      if (storedMaterias) {
        try {
          setMaterias(JSON.parse(storedMaterias));
        } catch (e) {
          console.error("Error parsing stored materias:", e);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  // Guardar colegios en localStorage tras cambios iniciados por el usuario
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('iskool_colegios_data', JSON.stringify(colegios));
    }
  }, [colegios, isInitialized]);

  // Guardar materias en localStorage tras cambios iniciados por el usuario
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('iskool_materias_data', JSON.stringify(materias));
    }
  }, [materias, isInitialized]);

  // Modal states for creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCreator, setNewCreator] = useState('');
  const [newThemeColor, setNewThemeColor] = useState('0x3b82f6');
  const [newLogoType, setNewLogoType] = useState('shield_i');
  const [newImageUrl, setNewImageUrl] = useState<string | undefined>(undefined);

  // Modal states for configuration/editing
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configItemId, setConfigItemId] = useState('');
  const [configTitle, setConfigTitle] = useState('');
  const [configSubtitle, setConfigSubtitle] = useState('');
  const [configCreator, setConfigCreator] = useState('');
  const [configThemeColor, setConfigThemeColor] = useState('0x3b82f6');
  const [configLogoType, setConfigLogoType] = useState('shield_i');
  const [configImageUrl, setConfigImageUrl] = useState<string | undefined>(undefined);

  const handleConfigImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setConfigImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!configTitle.trim()) return;

    const themeVal = parseInt(configThemeColor, 16);
    const colorBgMap: Record<string, number> = {
      '0x3b82f6': 0x1e3a8a, // Blue
      '0x10b981': 0x064e3b, // Green
      '0xef4444': 0x7f1d1d, // Red
      '0xf97316': 0x7c2d12, // Orange
      '0xeab308': 0x713f12, // Yellow
      '0x8b5cf6': 0x4c1d95, // Purple
      '0xec4899': 0x831843  // Pink
    };
    const logoBgVal = colorBgMap[configThemeColor] || 0x1f2937;

    const updateItem = (item: CarouselItem): CarouselItem => {
      if (item.id === configItemId) {
        return {
          ...item,
          title: configTitle,
          subtitle: configSubtitle,
          creator: configCreator,
          themeColor: themeVal,
          logoBgColor: logoBgVal,
          logoType: configLogoType as any,
          imageUrl: configImageUrl
        };
      }
      return item;
    };

    if (view === 'colegios') {
      setColegios(prev => prev.map(updateItem));
    } else {
      setMaterias(prev => prev.map(updateItem));
    }

    setShowConfigModal(false);
  };

  const items = view === 'colegios' ? colegios : materias;
  const currentItem = items[activeIndex] || items[0];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleSelectCard = (item: CarouselItem) => {
    if (view === 'colegios') {
      setView('materias');
      setActiveIndex(0);
    } else {
      router.push('/teacher');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const themeVal = parseInt(newThemeColor, 16);
    // Find corresponding logo bg color
    const colorBgMap: Record<string, number> = {
      '0x3b82f6': 0x1e3a8a, // Blue
      '0x10b981': 0x064e3b, // Green
      '0xef4444': 0x7f1d1d, // Red
      '0xf97316': 0x7c2d12, // Orange
      '0xeab308': 0x713f12, // Yellow
      '0x8b5cf6': 0x4c1d95, // Purple
      '0xec4899': 0x831843  // Pink
    };
    const logoBgVal = colorBgMap[newThemeColor] || 0x1f2937;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randCode = '';
    for (let i = 0; i < 8; i++) {
      randCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    if (view === 'colegios') {
      const newItem: CarouselItem = {
        id: `col-new-${Date.now()}`,
        title: newTitle,
        subtitle: newSubtitle || 'Bienvenido - DUEÑO -',
        creator: newCreator || 'creador: admin@robotbrain.mx',
        lastAccess: 'Último acceso: Recién creado',
        code: randCode,
        themeColor: themeVal,
        logoBgColor: logoBgVal,
        logoType: newLogoType as any,
        imageUrl: newImageUrl
      };

      setColegios((prev) => [...prev, newItem]);
      setActiveIndex(colegios.length); // Focus on the new card!
    } else {
      const newItem: CarouselItem = {
        id: `mat-new-${Date.now()}`,
        title: newTitle,
        subtitle: newSubtitle || 'Curso General',
        creator: newCreator || 'Profesor: Roberto Díaz',
        lastAccess: 'Último acceso: Recién creado',
        code: `SUB-${randCode}`,
        themeColor: themeVal,
        logoBgColor: logoBgVal,
        logoType: newLogoType as any
      };

      setMaterias((prev) => [...prev, newItem]);
      setActiveIndex(materias.length); // Focus on the new card!
    }

    // Reset fields
    setNewTitle('');
    setNewSubtitle('');
    setNewCreator('');
    setNewThemeColor(view === 'colegios' ? '0x3b82f6' : '0x8b5cf6');
    setNewLogoType(view === 'colegios' ? 'shield_i' : 'sigma');
    setNewImageUrl(undefined);
    setShowCreateModal(false);
  };

  const generateNewCode = (itemId: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let newCode = '';
    for (let i = 0; i < 8; i++) {
      newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Add prefix if it is a subject
    if (view === 'materias') {
      const prefixes: Record<string, string> = {
        'mat-1': 'MAT-',
        'mat-2': 'HIS-',
        'mat-3': 'CIE-',
        'mat-4': 'GEO-',
        'mat-5': 'ESP-'
      };
      const prefix = prefixes[itemId] || 'SUB-';
      newCode = `${prefix}${newCode}`;
    }

    if (view === 'colegios') {
      setColegios(prev => prev.map(item => item.id === itemId ? { ...item, code: newCode } : item));
    } else {
      setMaterias(prev => prev.map(item => item.id === itemId ? { ...item, code: newCode } : item));
    }
  };

  const formatHexColor = (num: number) => {
    return `#${num.toString(16).padStart(6, '0')}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* 1. Barra de Navegación Superior / Header */}
      <header className="w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        
        {/* Título & Rol */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Panel Administrativo</h1>
            <p className="text-xs text-zinc-500">Módulo de Control Global • ISkool</p>
          </div>
        </div>

        {/* Selector de Vista Premium */}
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
            <button
              onClick={() => {
                setView('colegios');
                setActiveIndex(0);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                view === 'colegios'
                  ? 'bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Colegios (Super Usuario)
            </button>
            <button
              onClick={() => {
                setView('materias');
                setActiveIndex(0);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                view === 'materias'
                  ? 'bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Materias (Profesor)
            </button>
          </div>

          <button
            onClick={() => {
              setNewTitle('');
              setNewSubtitle(view === 'colegios' ? 'Bienvenido - DUEÑO -' : 'Curso General');
              setNewCreator(view === 'colegios' ? 'creador: admin@robotbrain.mx' : 'Profesor: Roberto Díaz');
              setNewThemeColor(view === 'colegios' ? '0x3b82f6' : '0x8b5cf6');
              setNewLogoType(view === 'colegios' ? 'shield_i' : 'sigma');
              setNewImageUrl(undefined);
              setShowCreateModal(true);
            }}
            className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            title={view === 'colegios' ? "Crear nuevo colegio" : "Crear nueva materia"}
          >
            <Plus className="h-3.5 w-3.5" />
            Crear {view === 'colegios' ? 'Colegio' : 'Materia'}
          </button>
        </div>

        {/* Perfil del Super Usuario */}
        <div 
          onClick={() => setShowInfoModal(true)}
          className="flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/50 hover:bg-zinc-900 px-4 py-2 rounded-2xl cursor-pointer transition-all group"
        >
          <div className="text-right">
            <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Roberto Díaz</p>
            <p className="text-[10px] text-zinc-500">Super Usuario</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-500 text-zinc-950 font-bold flex items-center justify-center text-sm shadow-[0_0_10px_rgba(245,158,11,0.2)] border border-amber-400/30">
            RD
          </div>
        </div>

      </header>

      {/* 2. Sección Principal: Título del Carrusel y Canvas de PixiJS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-6 items-center justify-center">
        
        {/* Título de la Sección */}
        <div className="text-center flex flex-col items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
            <Sparkles className="h-3 w-3" />
            {view === 'colegios' ? 'Consola de Colegios Activos' : 'Planificación Académica'}
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white leading-none">
            {view === 'colegios' ? 'Selección de Aventura Escolar' : 'Selección de Materia'}
          </h2>
          <p className="text-xs text-zinc-500 max-w-md">
            {view === 'colegios'
              ? 'Navega por las aventuras de colegios gamificados disponibles. Arrastra horizontalmente para rotar.'
              : 'Selecciona una materia activa asignada a tu profesor para editar las misiones y portafolios.'}
          </p>
        </div>

        {/* Contenedor del Carrusel PixiJS */}
        <div className="relative w-full">
          
          <AdminCarouselCanvas
            items={items}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            onCardSelect={handleSelectCard}
          />

          {/* Flechas de Navegación Lateral (React Overlay) */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/60 text-zinc-400 hover:text-white p-4.5 rounded-full transition-all shadow-[0_0_20px_rgba(0,0,0,0.6)] cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-zinc-900/80 border border-zinc-800 hover:border-amber-500/60 text-zinc-400 hover:text-white p-4.5 rounded-full transition-all shadow-[0_0_20px_rgba(0,0,0,0.6)] cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Botones Flotantes del Panel Derecho eliminados por petición de diseño */}

          {/* Indicador de paginación circular inferior (tipo 1 2 3 >) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 bg-zinc-900/80 border border-zinc-800/80 px-4 py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-7 w-7 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                  activeIndex === i
                    ? 'bg-amber-500 text-zinc-950 font-black shadow-[0_0_10px_rgba(245,158,11,0.4)] scale-110'
                    : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={handleNext}
              className="h-7 w-7 rounded-full bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 flex items-center justify-center text-xs cursor-pointer"
            >
              &gt;
            </button>
          </div>

        </div>

        {/* 3. Panel de Detalle de Tarjeta Enfocada (Alta Fidelidad) */}
        {currentItem && (
          <div 
            className="w-full max-w-4xl bg-gradient-to-r from-zinc-900/60 to-zinc-950/60 border border-zinc-800/80 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-md relative overflow-hidden group"
            style={{ 
              borderLeft: `4px solid ${formatHexColor(currentItem.themeColor)}`
            }}
          >
            {/* Background glowing line */}
            <div 
              className="absolute -right-20 -top-20 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-20 transition-all duration-500 group-hover:scale-125"
              style={{ backgroundColor: formatHexColor(currentItem.themeColor) }}
            />

            <div className="flex flex-col gap-3 flex-1">
              <div className="flex items-center gap-3">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider text-white"
                  style={{ backgroundColor: `${formatHexColor(currentItem.themeColor)}30`, border: `1px solid ${formatHexColor(currentItem.themeColor)}` }}
                >
                  {currentItem.code}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">{currentItem.lastAccess}</span>
              </div>
              <h3 className="text-2xl font-black text-white">{currentItem.title}</h3>
              <p className="text-xs text-zinc-400 max-w-xl">
                {view === 'colegios'
                  ? `Colegio configurado dentro del Módulo Académico ISkool. Administrado por ${currentItem.creator.replace('creador: ', '')}. Este portal contiene portafolios digitales de evidencias NEM, misiones de historia, ciencias y avatares estudiantiles.`
                  : `Asignatura académica de la Nueva Escuela Mexicana. Permite revisar evidencias, calificar tareas y traducir retroalimentaciones en la Boleta SEP.`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={() => generateNewCode(currentItem.id)}
                className="px-5 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                title="Genera un código de acceso automáticamente para los alumnos"
              >
                Autogenerar Código
              </button>

              <button 
                onClick={() => {
                  setConfigItemId(currentItem.id);
                  setConfigTitle(currentItem.title);
                  setConfigSubtitle(currentItem.subtitle);
                  setConfigCreator(currentItem.creator);
                  setConfigThemeColor(`0x${currentItem.themeColor.toString(16).padStart(6, '0')}`);
                  setConfigLogoType(currentItem.logoType);
                  setConfigImageUrl(currentItem.imageUrl);
                  setShowConfigModal(true);
                }}
                className="px-5 py-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 text-xs font-bold text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Configurar
              </button>
              
              <button 
                onClick={() => handleSelectCard(currentItem)}
                className="px-5 py-3 rounded-2xl text-xs font-black text-zinc-950 transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-102 shadow-lg"
                style={{ 
                  backgroundColor: formatHexColor(currentItem.themeColor),
                  boxShadow: `0 4px 20px ${formatHexColor(currentItem.themeColor)}40`
                }}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                {view === 'colegios' ? 'Entrar a la Aventura' : 'Administrar Materia'}
              </button>
            </div>

          </div>
        )}

      </main>

      {/* 4. Barra de Pie de Página Persistente (Footer) */}
      <footer className="w-full border-t border-zinc-800 bg-[#0f0f11] px-6 py-5 flex items-center justify-between z-40">
        
        {/* Lado Izquierdo: Contexto Actual (con el ícono del logo origami de ISkool) */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.35)]">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              className="h-4.5 w-4.5 text-white"
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              {/* Origami/Airplane bird design matching reference logo */}
              <path d="M22 2L2 8.667l8.2 2.133L22 2zM10.2 10.8l2.133 8.2L22 2 10.2 10.8zM10.2 10.8v5.333L13.4 13.2" />
            </svg>
          </div>
          <div className="font-mono text-xs font-bold tracking-wider text-zinc-400">
            CONTEXTO: <span className="text-white font-black">{view === 'colegios' ? 'SUPER USUARIO > COLEGIOS' : 'PROFESOR > MATERIAS'}</span>
          </div>
        </div>

        {/* Lado Central: Botón Redondo Prominente "REGRESAR" */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border-2 border-zinc-700 hover:border-amber-500 px-6 py-2.5 rounded-full text-zinc-300 hover:text-white font-black text-xs transition-all shadow-[0_4px_25px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 active:scale-95 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            REGRESAR
          </button>
        </div>

        {/* Lado Derecho: Ver mi Información (Busto de Usuario) */}
        <button
          onClick={() => setShowInfoModal(true)}
          className="flex items-center gap-2.5 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 px-4 py-2 rounded-2xl cursor-pointer transition-all text-zinc-400 hover:text-amber-400 font-mono text-xs font-bold"
        >
          <span>VER MI INFORMACIÓN</span>
          <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
            <User className="h-4 w-4" />
          </div>
        </button>

      </footer>

      {/* 5. Modal de Información del Super Usuario (Aesthetics & Interaction) */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
          
          <div 
            className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative colored glow on top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-amber-500 to-purple-500 rounded-t-3xl" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mt-2">
              <h4 className="text-md font-bold text-white flex items-center gap-2">
                <Laptop className="h-4 w-4 text-amber-500" />
                Información de Sesión
              </h4>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-mono bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-md transition-all cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Info details */}
            <div className="py-5 flex flex-col gap-4">
              
              {/* User Bio */}
              <div className="flex items-center gap-4 bg-zinc-950/40 border border-zinc-800/40 p-3.5 rounded-2xl">
                <div className="h-12 w-12 rounded-xl bg-amber-500 text-zinc-950 font-black flex items-center justify-center text-lg">
                  RD
                </div>
                <div>
                  <h5 className="text-sm font-black text-white">Roberto Díaz</h5>
                  <p className="text-xs text-zinc-500">Super Usuario / Global Admin</p>
                </div>
              </div>

              {/* Data list */}
              <div className="flex flex-col gap-3 font-mono text-xs">
                
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/30">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Correo
                  </span>
                  <span className="text-zinc-300">roberto.diaz@iskool.mx</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/30">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Fingerprint className="h-3.5 w-3.5" /> Nivel de Acceso
                  </span>
                  <span className="text-amber-500 font-bold">Nivel 5 (Global Admin)</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/30">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Colegios Asignados
                  </span>
                  <span className="text-zinc-300">5 Activos / Ilimitado</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/30">
                  <span className="text-zinc-500 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Último Ingreso
                  </span>
                  <span className="text-zinc-300">26/06/2026 21:14 (Local)</span>
                </div>

              </div>

            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
              <button 
                onClick={() => setShowInfoModal(false)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                Cerrar Ventana
              </button>
            </div>

          </div>

        </div>
      )}

      {/* 6. Modal de Creación (Colegio / Materia) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
          
          <form 
            onSubmit={handleCreateItem}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-zinc-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative top bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-indigo-500 rounded-t-3xl" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mt-2">
              <h4 className="text-md font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-amber-500" />
                {view === 'colegios' ? 'Crear Nuevo Colegio' : 'Crear Nueva Materia'}
              </h4>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-mono bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-md transition-all cursor-pointer"
              >
                CERRAR
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-3 text-xs">
              
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-bold">Nombre del {view === 'colegios' ? 'Colegio' : 'Materia'}</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={view === 'colegios' ? "Ej. Colegio Anglo Americano" : "Ej. Química Orgánica"}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none p-3 rounded-xl text-white transition-all"
                  required
                />
              </div>

              {/* Subtitle / Rol */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-bold">Subtítulo / Rol de bienvenida</label>
                <input 
                  type="text" 
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder={view === 'colegios' ? "Ej. Bienvenido - DUEÑO -" : "Ej. Curso Propedéutico"}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none p-3 rounded-xl text-white transition-all"
                />
              </div>

              {/* Creator */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-bold">Creador / Profesor Asignado</label>
                <input 
                  type="text" 
                  value={newCreator}
                  onChange={(e) => setNewCreator(e.target.value)}
                  placeholder={view === 'colegios' ? "Ej. creador: director@colegio.edu.mx" : "Ej. Profesor: Roberto Díaz"}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none p-3 rounded-xl text-white transition-all"
                />
              </div>

              {/* Presets Grid (Theme Color & Logo Type) */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Color Theme */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 font-bold">Color del Tema</label>
                  <select 
                    value={newThemeColor}
                    onChange={(e) => {
                      setNewThemeColor(e.target.value);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none p-3 rounded-xl text-white transition-all"
                  >
                    <option value="0x3b82f6">Azul (Americano)</option>
                    <option value="0x10b981">Esmeralda (Mantovani)</option>
                    <option value="0xef4444">Rojo (Ceili)</option>
                    <option value="0xf97316">Naranja (CDI)</option>
                    <option value="0xeab308">Amarillo (Ayuda)</option>
                    <option value="0x8b5cf6">Morado (Matemáticas)</option>
                    <option value="0xec4899">Rosa (Español)</option>
                  </select>
                </div>

                {/* Logo Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 font-bold">Icono / Escudo</label>
                  <select 
                    value={newLogoType}
                    onChange={(e) => setNewLogoType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none p-3 rounded-xl text-white transition-all"
                  >
                    {view === 'colegios' ? (
                      <>
                        <option value="shield_i">Escudo Clásico I</option>
                        <option value="shield_lion">Escudo Corona de Oro</option>
                        <option value="shield_ceili">Escudo Estrella Roja</option>
                        <option value="shield_cdi">Escudo CDI Estrella</option>
                        <option value="shield_exclamation">Escudo de Alerta</option>
                      </>
                    ) : (
                      <>
                        <option value="sigma">Sigma (Matemáticas)</option>
                        <option value="scroll">Pergamino (Historia)</option>
                        <option value="atom">Átomo (Ciencias)</option>
                        <option value="globe">Globo (Geografía)</option>
                        <option value="book">Libro (Español)</option>
                      </>
                    )}
                  </select>
                </div>

              </div>

              {/* Upload image (Functional Shield Upload) */}
              {view === 'colegios' && (
                <div className="flex flex-col gap-2 p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-2xl">
                  <label className="text-zinc-400 font-bold">Subir Escudo Personalizado (Imagen)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 file:cursor-pointer cursor-pointer"
                  />
                  {newImageUrl && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">✔ Imagen cargada correctamente</span>
                      <button 
                        type="button" 
                        onClick={() => setNewImageUrl(undefined)} 
                        className="text-[10px] text-red-500 hover:underline cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 bg-amber-500 text-zinc-950 text-xs font-black rounded-xl transition-all cursor-pointer hover:scale-102 shadow-lg"
              >
                Crear Registro
              </button>
            </div>

          </form>

        </div>
      )}

      {/* 7. Modal de Configuración (Editar Colegio / Materia) */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
          
          <form 
            onSubmit={handleSaveConfig}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-zinc-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative top bar */}
            <div 
              className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl transition-colors duration-300" 
              style={{ backgroundColor: formatHexColor(parseInt(configThemeColor, 16)) }}
            />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mt-2">
              <h4 className="text-md font-bold text-white flex items-center gap-2">
                <Settings className="h-4 w-4 text-amber-500" />
                {view === 'colegios' ? 'Configurar Colegio' : 'Configurar Materia'}
              </h4>
              <button 
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 font-mono bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-md transition-all cursor-pointer"
              >
                CERRAR
              </button>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col gap-3 text-xs">
              
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-bold">Nombre del {view === 'colegios' ? 'Colegio' : 'Materia'}</label>
                <input 
                  type="text" 
                  value={configTitle}
                  onChange={(e) => setConfigTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none p-3 rounded-xl text-white transition-all"
                  required
                />
              </div>

              {/* Subtitle */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-bold">Subtítulo / Rol de bienvenida</label>
                <input 
                  type="text" 
                  value={configSubtitle}
                  onChange={(e) => setConfigSubtitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none p-3 rounded-xl text-white transition-all"
                />
              </div>

              {/* Creator */}
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 font-bold">Propietario (Correo electrónico)</label>
                <input 
                  type="text" 
                  value={configCreator}
                  onChange={(e) => setConfigCreator(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none p-3 rounded-xl text-white transition-all"
                  required
                />
              </div>

              {/* Theme Color & Icon */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Color */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 font-bold">Color del Tema</label>
                  <select 
                    value={configThemeColor}
                    onChange={(e) => setConfigThemeColor(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none p-3 rounded-xl text-white transition-all"
                  >
                    <option value="0x3b82f6">Azul (Americano)</option>
                    <option value="0x10b981">Esmeralda (Mantovani)</option>
                    <option value="0xef4444">Rojo (Ceili)</option>
                    <option value="0xf97316">Naranja (CDI)</option>
                    <option value="0xeab308">Amarillo (Ayuda)</option>
                    <option value="0x8b5cf6">Morado (Matemáticas)</option>
                    <option value="0xec4899">Rosa (Español)</option>
                  </select>
                </div>

                {/* Logo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 font-bold">Icono / Escudo</label>
                  <select 
                    value={configLogoType}
                    onChange={(e) => setConfigLogoType(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none p-3 rounded-xl text-white transition-all"
                  >
                    {view === 'colegios' ? (
                      <>
                        <option value="shield_i">Escudo Clásico I</option>
                        <option value="shield_lion">Escudo Corona de Oro</option>
                        <option value="shield_ceili">Escudo Estrella Roja</option>
                        <option value="shield_cdi">Escudo CDI Estrella</option>
                        <option value="shield_exclamation">Escudo de Alerta</option>
                      </>
                    ) : (
                      <>
                        <option value="sigma">Sigma (Matemáticas)</option>
                        <option value="scroll">Pergamino (Historia)</option>
                        <option value="atom">Átomo (Ciencias)</option>
                        <option value="globe">Globo (Geografía)</option>
                        <option value="book">Libro (Español)</option>
                      </>
                    )}
                  </select>
                </div>

              </div>

              {/* Custom Image Upload for School Shield */}
              {view === 'colegios' && (
                <div className="flex flex-col gap-2 p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-2xl">
                  <label className="text-zinc-400 font-bold">Cambiar Escudo Personalizado (Imagen)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleConfigImageUpload}
                    className="block w-full text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700 file:cursor-pointer cursor-pointer"
                  />
                  {configImageUrl && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">✔ Escudo de imagen activo</span>
                      <button 
                        type="button" 
                        onClick={() => setConfigImageUrl(undefined)} 
                        className="text-[10px] text-red-500 hover:underline cursor-pointer"
                      >
                        Eliminar Escudo
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button 
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 bg-amber-500 text-zinc-950 text-xs font-black rounded-xl transition-all cursor-pointer hover:scale-102 shadow-lg"
              >
                Guardar Cambios
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}
