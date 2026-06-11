"use client";

import React, { useState, useEffect } from 'react';
import { useGamification } from '@/context/gamification-context';
import { Header } from '@/components/Header';
import { 
  FileImage, Mic, MicOff, HelpCircle, CheckCircle2, 
  AlertCircle, Clock, Heart, MessageSquare, 
  Send, ThumbsUp, Star, Award, BookOpen,
  Brain, Globe, Scale, Activity, Wand2, Plus,
  Trash2, Play, Square, FileText, Check, 
  ChevronDown, ChevronUp, RefreshCw, FileCode,
  ZoomIn, ZoomOut, Maximize2, Users, Palette
} from 'lucide-react';
import { FormattedDate } from '@/components/FormattedDate';

// Catálogo de PDAs por asignatura
const PDA_CATALOG: Record<string, string[]> = {
  'sub-math': [
    'Fase 4 - Saberes y Pensamiento Científico: Resuelve problemas que implican repartir y dividir elementos en partes iguales (fracciones).',
    'Fase 4 - Saberes y Pensamiento Científico: Compara y ordena fracciones con diferentes denominadores utilizando material concreto.',
    'Fase 4 - Saberes y Pensamiento Científico: Identifica y representa fracciones equivalentes en situaciones cotidianas.'
  ],
  'sub-span': [
    'Fase 4 - Lenguajes: Lee en voz alta textos poéticos o narrativos prestando atención a la entonación, modulación y volumen.',
    'Fase 4 - Lenguajes: Identifica la estructura de las leyendas y su relevancia cultural para la comunidad.',
    'Fase 4 - Lenguajes: Elabora portafolios de evidencias sobre mitos y relatos regionales.'
  ],
  'sub-sci': [
    'Fase 5 - Saberes y Pensamiento Científico: Diseña y describe el funcionamiento de un biodigestor de residuos orgánicos para generar biogás.',
    'Fase 5 - Ética, Naturaleza y Sociedades: Analiza las ventajas ambientales del uso de energías renovables en la comunidad.',
    'Fase 5 - De lo Humano y lo Comunitario: Desarrolla ecotecnias y prototipos para el desarrollo sustentable del entorno.'
  ]
};

// Criterios de Rúbrica de Evaluación Formativa
const RUBRIC_CRITERIA = [
  {
    key: 'technical',
    name: 'Comprensión Técnica / Científica',
    levels: {
      avanzado: { label: 'Avanzado (+40 XP)', desc: 'Propone una solución innovadora y describe a la perfección los procesos involucrados.', text: 'Demuestra una comprensión técnica sobresaliente y un análisis profundo del funcionamiento del proyecto.' },
      logrado: { label: 'Logrado (+25 XP)', desc: 'Describe correctamente las partes y el funcionamiento general del proyecto.', text: 'Identifica y describe correctamente las etapas principales del proyecto.' },
      proceso: { label: 'En Proceso (+10 XP)', desc: 'Menciona los conceptos básicos pero requiere profundizar en la fundamentación.', text: 'Muestra noción del funcionamiento básico pero requiere profundizar en la fundamentación técnica.' },
      apoyo: { label: 'Requiere Apoyo (+5 XP)', desc: 'Muestra confusión en la explicación técnica básica del ejercicio.', text: 'Presenta dificultades para explicar los elementos clave del proyecto. Se sugiere repasar los conceptos fundamentales.' }
    }
  },
  {
    key: 'reflection',
    name: 'Autoevaluación y Reflexión',
    levels: {
      avanzado: { label: 'Avanzado (+30 XP)', desc: 'Realiza una reflexión profunda sobre sus aprendizajes y retos superados.', text: 'Presenta una autoevaluación muy madura, identificando claramente aprendizajes y formas de superar retos.' },
      logrado: { label: 'Logrado (+20 XP)', desc: 'Expresa su opinión sobre el desarrollo de la actividad e identifica aciertos.', text: 'Expresa reflexiones claras sobre su propio desempeño durante la actividad.' },
      proceso: { label: 'En Proceso (+10 XP)', desc: 'Describe lo que hizo pero sin profundizar en un autoanálisis.', text: 'Describe el proceso realizado, pero se sugiere hacer un análisis más introspectivo de lo aprendido.' },
      apoyo: { label: 'Requiere Apoyo (+5 XP)', desc: 'No incluye reflexión o es sumamente breve y poco descriptiva.', text: 'La autoevaluación es muy breve. Se sugiere reflexionar sobre los retos encontrados en la actividad.' }
    }
  },
  {
    key: 'evidence',
    name: 'Calidad de la Evidencia',
    levels: {
      avanzado: { label: 'Avanzado (+30 XP)', desc: 'La evidencia está sumamente cuidada, estructurada y es de alta calidad.', text: 'La evidencia entregada tiene una presentación impecable, estructurada y muy clara.' },
      logrado: { label: 'Logrado (+20 XP)', desc: 'La evidencia cumple de forma clara con todos los requisitos solicitados.', text: 'Cumple de manera clara y ordenada con el formato y los requisitos de la evidencia.' },
      proceso: { label: 'En Proceso (+10 XP)', desc: 'La evidencia está incompleta o presenta detalles que dificultan comprenderla.', text: 'La evidencia está incompleta o tiene detalles visuales/de audio que dificultan la comprensión.' },
      apoyo: { label: 'Requiere Apoyo (+5 XP)', desc: 'La evidencia es ilegible, incorrecta o no corresponde a la actividad.', text: 'La evidencia es poco legible o no corresponde con los requisitos mínimos de la entrega.' }
    }
  }
];

export default function TeacherDashboard() {
  const { portfolioItems, reviewPortfolioItem, currentTeacher } = useGamification();

  // Estados generales del panel
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Estados del Formulario de Evaluación para el elemento seleccionado
  const [commentText, setCommentText] = useState<string>('');
  const [selectedCampos, setSelectedCampos] = useState<string[]>([]);
  const [selectedEjes, setSelectedEjes] = useState<string[]>([]);
  const [selectedPDA, setSelectedPDA] = useState<string>('');
  const [xpBreakdown, setXpBreakdown] = useState({
    scientific: 25,
    critical: 25,
    collaborative: 25,
    communication: 25
  });
  
  // Rúbrica activa
  const [rubricSelections, setRubricSelections] = useState<Record<string, string>>({});
  const [isRubricOpen, setIsRubricOpen] = useState(false);

  // Estados de simulación de herramientas
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewerTab, setViewerTab] = useState<'file' | 'technical'>('file');

  // Separar pendientes de revisados
  const pendingItems = portfolioItems.filter(item => item.status === 'submitted');
  const reviewedItems = portfolioItems.filter(item => item.status === 'approved' || item.status === 'needs_revision');

  // Selección automática de elementos
  const currentItems = activeTab === 'pending' ? pendingItems : reviewedItems;
  const activeItem = currentItems.find(i => i.id === selectedItemId) || currentItems[0] || null;

  // Cargar estados locales al cambiar el elemento activo
  useEffect(() => {
    if (!activeItem) {
      setSelectedItemId(null);
      return;
    }
    
    if (activeItem.id !== selectedItemId) {
      setSelectedItemId(activeItem.id);
    }

    // Inicializar valores según la entrega
    const teacherFeedback = activeItem.feedbacks?.find(f => f.author_role === 'teacher')?.feedback_text || '';
    setCommentText(teacherFeedback);
    
    // Campos formativos por defecto según materia si no tiene asignados
    const defaultCampos = activeItem.campos_formativos || (
      activeItem.subject?.id === 'sub-math' ? ['Saberes y Pensamiento Científico'] :
      activeItem.subject?.id === 'sub-sci' ? ['Saberes y Pensamiento Científico', 'Ética, Naturaleza y Sociedades'] :
      activeItem.subject?.id === 'sub-span' ? ['Lenguajes'] : []
    );
    setSelectedCampos(defaultCampos);

    setSelectedEjes(activeItem.ejes_articuladores || ['Pensamiento Crítico']);
    
    // PDA inicial sugerido
    const pdasForSubject = PDA_CATALOG[activeItem.subject_id || ''] || [];
    setSelectedPDA(activeItem.pdas?.[0] || pdasForSubject[0] || '');

    // XP breakdown por defecto
    setXpBreakdown(activeItem.xp_breakdown || {
      scientific: activeItem.subject_id === 'sub-math' || activeItem.subject_id === 'sub-sci' ? 40 : 10,
      critical: 30,
      collaborative: 20,
      communication: activeItem.subject_id === 'sub-span' ? 40 : 10
    });

    setRubricSelections({});
    setRecordedAudioUrl(null);
    setZoomLevel(100);
    setViewerTab(activeItem.file_type === 'image' ? 'file' : 'technical');
  }, [selectedItemId, activeItem]);

  // Manejo del cronómetro de grabación de voz
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Selección de criterio de rúbrica
  const handleRubricSelect = (criterionKey: string, levelKey: string) => {
    const nextSelections = { ...rubricSelections, [criterionKey]: levelKey };
    setRubricSelections(nextSelections);

    // Actualizar XP breakdown automáticamente para ahorrar tiempo
    setXpBreakdown(prev => {
      const copy = { ...prev };
      if (criterionKey === 'technical') {
        copy.scientific = levelKey === 'avanzado' ? 40 : levelKey === 'logrado' ? 25 : levelKey === 'proceso' ? 10 : 5;
      } else if (criterionKey === 'reflection') {
        copy.critical = levelKey === 'avanzado' ? 35 : levelKey === 'logrado' ? 25 : levelKey === 'proceso' ? 10 : 5;
      } else if (criterionKey === 'evidence') {
        copy.communication = levelKey === 'avanzado' ? 25 : levelKey === 'logrado' ? 15 : levelKey === 'proceso' ? 10 : 5;
      }
      return copy;
    });

    // Reconstruir comentarios
    const newComments: string[] = [];
    RUBRIC_CRITERIA.forEach(c => {
      const selectedLevel = c.key === criterionKey ? levelKey : rubricSelections[c.key];
      if (selectedLevel) {
        newComments.push(`- **${c.name}**: ${c.levels[selectedLevel as keyof typeof c.levels].text}`);
      }
    });

    setCommentText(newComments.join('\n'));
  };

  // Bancos de comentarios
  const insertQuickComment = (type: 'felicitacion' | 'mejora' | 'pregunta') => {
    let textToInsert = '';
    if (type === 'felicitacion') {
      textToInsert = ' ¡Felicidades por tu dedicación e iniciativa en este proyecto! Muestras gran avance.';
    } else if (type === 'mejora') {
      textToInsert = ' Te sugiero revisar detalladamente los cálculos técnicos para afinar la precisión.';
    } else if (type === 'pregunta') {
      textToInsert = ' ¿Qué otro material orgánico o alternativa propondrías para mejorar la eficiencia del proceso?';
    }
    setCommentText(prev => prev + textToInsert);
  };

  // Simulación de Asistente de IA
  const handleGenerateAIFeedback = () => {
    if (!activeItem) return;
    setIsGeneratingAI(true);

    setTimeout(() => {
      let aiText = '';
      if (activeItem.subject_id === 'sub-sci') {
        aiText = `¡Excelente trabajo en tu Simulación de Biodigestor, ${activeItem.student_profile?.first_name}! Tu propuesta de reactor anaeróbico demuestra un gran Pensamiento Científico. El análisis del retorno de inversión a 14 meses es financieramente viable. Como sugerencia formativa, te invito a revisar el balance de masas en la salida de lodos para afinar los detalles técnicos.`;
      } else if (activeItem.subject_id === 'sub-math') {
        aiText = `¡Gran esfuerzo, ${activeItem.student_profile?.first_name}! Tu pizza de fracciones muestra una representación visual perfecta de 5/8. Se nota el cuidado al dividir la pizza en partes iguales. Para seguir mejorando, intenta resolver el siguiente reto de fracciones equivalentes.`;
      } else {
        aiText = `Hola ${activeItem.student_profile?.first_name}, he revisado tu evidencia de "${activeItem.title}". Demuestras un excelente cumplimiento del PDA. Te sugiero añadir una conclusión breve sobre lo que más te costó trabajo resolver en la autoevaluación.`;
      }
      setCommentText(aiText);
      setIsGeneratingAI(false);
    }, 1500);
  };

  // Simulación de Nota de Voz
  const toggleRecording = () => {
    if (isRecording) {
      // Detener y transcribir
      setIsRecording(false);
      setRecordedAudioUrl('https://codesandbox.io/mock-audio.mp3'); // Mock
      setCommentText(prev => {
        const spacing = prev ? '\n\n' : '';
        return prev + spacing + '🎤 (Retroalimentación en Audio): "He revisado detalladamente tu ecotecnia. Me parece una excelente aplicación práctica de la biotecnología. Felicidades por integrar conceptos de física y ecología."';
      });
    } else {
      // Iniciar
      setIsRecording(true);
    }
  };

  // Guardar evaluación con desglose de XP y metadatos NEM
  const handleSaveReview = (statusType: 'needs_revision' | 'approved', bonusXp = 0) => {
    if (!activeItem) return;

    // Calcular XP total
    const totalXp = xpBreakdown.scientific + xpBreakdown.critical + xpBreakdown.collaborative + xpBreakdown.communication + bonusXp;

    reviewPortfolioItem(
      activeItem.id,
      statusType,
      commentText || (statusType === 'approved' ? 'Logrado. Excelente evidencia del aprendizaje.' : 'Requiere apoyo. Favor de realizar las correcciones indicadas.'),
      totalXp,
      selectedCampos,
      selectedPDA ? [selectedPDA] : [],
      selectedEjes,
      xpBreakdown
    );

    // Mensaje de éxito
    alert(`Evidencia calificada exitosamente.\nEstado: ${statusType === 'approved' ? 'Logrado/Avanzado' : 'Requiere Apoyo'}\nXP Total Otorgado: ${totalXp} XP`);
    
    // Seleccionar la siguiente de la lista si hay
    const remainingPending = pendingItems.filter(item => item.id !== activeItem.id);
    if (remainingPending.length > 0) {
      setSelectedItemId(remainingPending[0].id);
    } else {
      setSelectedItemId(null);
    }
  };

  // Campos Formativos disponibles
  const camposFormativosOptions = [
    'Saberes y Pensamiento Científico',
    'Lenguajes',
    'Ética, Naturaleza y Sociedades',
    'De lo Humano y lo Comunitario'
  ];

  // Ejes Articuladores disponibles con iconos
  const ejesArticuladoresList = [
    { name: 'Pensamiento Crítico', icon: Brain, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
    { name: 'Inclusión', icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
    { name: 'Vida Saludable', icon: Activity, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
    { name: 'Artes y Exp. Estéticas', icon: Palette, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40' },
    { name: 'Fomento a la Lectura', icon: BookOpen, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40' },
    { name: 'Igualdad de Género', icon: Scale, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40' },
    { name: 'Interculturalidad Crítica', icon: Globe, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' }
  ];

  const getStatusLabel = (status: string) => {
    if (status === 'approved') return <span className="text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200/30 flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Logrado / Avanzado</span>;
    if (status === 'needs_revision') return <span className="text-rose-600 font-bold text-xs bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 px-3 py-1 rounded-full border border-rose-200/30 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> Requiere Apoyo</span>;
    return <span className="text-amber-600 font-bold text-xs bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-200/30 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Pendiente de Revisión</span>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Banner Docente */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-md">Módulo de Evaluación Formativa</span>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white mt-2">Panel del Docente - Alineación Estructural NEM</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Docente: <strong>{currentTeacher.first_name} {currentTeacher.last_name}</strong> | Colegio Anglo Mexicano - 4º A & Preparatoria
            </p>
          </div>

          {/* Selector de Pestañas */}
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 self-stretch md:self-auto">
            <button
              onClick={() => { setActiveTab('pending'); setSelectedItemId(null); }}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'pending'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Pendientes ({pendingItems.length})
            </button>
            <button
              onClick={() => { setActiveTab('reviewed'); setSelectedItemId(null); }}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'reviewed'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Evaluados ({reviewedItems.length})
            </button>
          </div>
        </div>

        {currentItems.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-16 text-center flex flex-col items-center justify-center gap-4">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
            <div>
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white">¡No hay evidencias en esta sección!</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Todas las entregas han sido evaluadas o no se han subido evidencias aún.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMNA 1: LISTADO LATERAL (lg:col-span-3) */}
            <div className="lg:col-span-3 flex flex-col gap-3 max-h-[750px] overflow-y-auto pr-1">
              <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1">Entregas Recientes</p>
              {currentItems.map((item) => {
                const isActive = item.id === selectedItemId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                      isActive
                        ? 'bg-blue-50/70 border-blue-400/80 dark:bg-blue-950/20 dark:border-blue-500/80 shadow-md shadow-blue-500/5'
                        : 'bg-white border-zinc-200/85 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800/80 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-extrabold text-[10px]">
                          {item.student_profile?.first_name[0]}{item.student_profile?.last_name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                            {item.student_profile?.first_name} {item.student_profile?.last_name}
                          </p>
                          <p className="text-[9px] text-zinc-400 leading-none mt-0.5">{item.subject?.name}</p>
                        </div>
                      </div>
                      {item.status !== 'submitted' && (
                        <span className={`h-2 w-2 rounded-full ${item.status === 'approved' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      )}
                    </div>
                    <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-2 w-full">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">{item.title}</p>
                      <div className="text-[9.5px] text-zinc-400 mt-0.5 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <FormattedDate
                          date={item.created_at}
                          className="text-[9.5px]"
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ESPACIO DE TRABAJO SPLIT-SCREEN (lg:col-span-9) */}
            {activeItem && (
              <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                
                {/* PARTE IZQUIERDA: VISOR DE EVIDENCIA (md:col-span-5) */}
                <div className="md:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 flex flex-col gap-5 shadow-sm">
                  
                  {/* Visor Header */}
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <FileText className="h-4.5 w-4.5" />
                      </span>
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Panel del Documento</h3>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setViewerTab('file')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          viewerTab === 'file'
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white'
                            : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                      >
                        Archivo
                      </button>
                      <button
                        onClick={() => setViewerTab('technical')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          viewerTab === 'technical'
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white'
                            : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                      >
                        Reporte Técnico
                      </button>
                    </div>
                  </div>

                  {/* Visor de Evidencia */}
                  <div className="flex-1 min-h-[300px] flex flex-col bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
                    {viewerTab === 'file' ? (
                      activeItem.file_type === 'image' ? (
                        <div className="w-full h-full flex flex-col relative justify-center items-center p-4">
                          <img
                            src={activeItem.file_url}
                            alt={activeItem.title}
                            className="max-h-[260px] max-w-full rounded-lg object-contain transition-transform shadow-sm"
                            style={{ transform: `scale(${zoomLevel / 100})` }}
                          />
                          {/* Controles de Zoom */}
                          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 p-1 px-2.5 rounded-full shadow-lg border border-zinc-100 dark:border-zinc-800 text-[10px] font-semibold text-zinc-500">
                            <button onClick={() => setZoomLevel(z => Math.max(50, z - 25))} className="hover:text-zinc-800"><ZoomOut className="h-3 w-3" /></button>
                            <span className="w-8 text-center">{zoomLevel}%</span>
                            <button onClick={() => setZoomLevel(z => Math.min(200, z + 25))} className="hover:text-zinc-800"><ZoomIn className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col justify-center items-center p-8 text-center">
                          <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-500 mb-3 animate-pulse">
                            <Mic className="h-10 w-10" />
                          </div>
                          <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Nota de Voz de Alumno</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5">Formato MP3/Audio</p>
                          <audio controls className="w-full max-w-xs mt-5 shadow-sm" src={activeItem.file_url} />
                        </div>
                      )
                    ) : (
                      // Reporte técnico del Biodigestor / Detalle de la Fracción
                      <div className="w-full h-full p-5 overflow-y-auto max-h-[350px] flex flex-col gap-4 text-xs font-mono bg-zinc-950 text-zinc-200 border-none">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-[10px] text-zinc-500">
                          <span>Reporte_Proyecto.md</span>
                          <span className="flex items-center gap-1"><FileCode className="h-3.5 w-3.5" /> Markdown</span>
                        </div>
                        {activeItem.subject_id === 'sub-sci' ? (
                          <>
                            <h3 className="text-indigo-400 font-bold text-sm">## ECOTECNIA: Biodigestor Escolar v1.0</h3>
                            <p className="text-zinc-400 leading-relaxed">
                              **Descripción**: Prototipo funcional de biorreactor anaeróbico a pequeña escala para tratamiento de lodos y producción de biogás para estufas escolares.
                            </p>
                            <div className="bg-zinc-900/50 p-2.5 rounded border border-zinc-800 text-[11px] leading-relaxed">
                              **Especificaciones Técnicas**:<br />
                              - Sustrato: Residuos orgánicos de cafetería (15kg)<br />
                              - Volumen del reactor: 200 Litros<br />
                              - Rango de Tª: 35-38 °C (Mesofílico)<br />
                              - ROI estimado: 14 meses
                            </div>
                            
                            {/* Diagrama SVG interactivo */}
                            <div className="border border-zinc-800 rounded-lg p-2 bg-zinc-900/30 flex flex-col items-center gap-1.5">
                              <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Esquema del Reactor (Hover)</span>
                              <svg className="w-full h-24 max-w-xs" viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
                                <rect x="50" y="20" width="100" height="40" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
                                <line x1="30" y1="40" x2="50" y2="40" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3" />
                                <circle cx="30" cy="40" r="3" fill="#f59e0b" />
                                <text x="10" y="32" fill="#f59e0b" fontSize="7">Entrada</text>
                                
                                <path d="M100,20 Q100,5 120,5" fill="none" stroke="#10b981" strokeWidth="1.5" />
                                <circle cx="120" cy="5" r="2" fill="#10b981" />
                                <text x="125" y="8" fill="#10b981" fontSize="7">Biogás</text>
                                
                                <rect x="80" y="30" width="40" height="20" rx="4" fill="#0f172a" stroke="#475569" />
                                <text x="86" y="42" fill="#94a3b8" fontSize="6">LODO ACTIVO</text>
                              </svg>
                            </div>
                          </>
                        ) : (
                          <>
                            <h3 className="text-blue-400 font-bold text-sm">## EJERCICIO: Pizza de Fracciones (5/8)</h3>
                            <p className="text-zinc-400 leading-relaxed">
                              **Objetivo**: Representar una división de fracciones utilizando elementos gráficos comestibles de la vida real.
                            </p>
                            <div className="bg-zinc-900/50 p-2.5 rounded border border-zinc-800 text-[11px] leading-relaxed">
                              - Numerador (tomados): 5 partes<br />
                              - Denominador (total): 8 rebanadas iguales<br />
                              - Fracción resultante: 5/8 (equivalente a 62.5% del total)<br />
                              - Ingredientes dibujados: Pepperoni y champiñón
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Autoevaluación del Alumno */}
                  <div className="p-4 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/20">
                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 mb-1.5">
                      <Heart className="h-4 w-4" />
                      <h4 className="text-[10px] font-bold uppercase tracking-wider">Reflexión de Autoevaluación</h4>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                      "{activeItem.self_reflection || 'No se ingresó reflexión para esta entrega.'}"
                    </p>
                  </div>

                </div>

                {/* PARTE DERECHA: PANEL DE EVALUACIÓN NEM (md:col-span-7) */}
                <div className="md:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
                  
                  {/* Status Banner */}
                  <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/40 p-3 px-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                    <span className="text-[11px] font-semibold text-zinc-400">Estado de Evaluación:</span>
                    {getStatusLabel(activeItem.status)}
                  </div>

                  {/* SECCIÓN 1: ALINEACIÓN NEM */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800/60 pb-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      1. Alineación con la NEM
                    </h4>

                    {/* Campos Formativos (Vincular a más de uno simultáneamente) */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Campos Formativos (Multiselección):</span>
                      <div className="flex flex-wrap gap-1.5">
                        {camposFormativosOptions.map((campo) => {
                          const isSelected = selectedCampos.includes(campo);
                          return (
                            <button
                              key={campo}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedCampos(prev => prev.filter(c => c !== campo));
                                } else {
                                  setSelectedCampos(prev => [...prev, campo]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-zinc-50 border-zinc-200/70 hover:bg-zinc-100 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-500'
                              }`}
                            >
                              {campo}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ejes Articuladores (Toggle rápido) */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Ejes Articuladores:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {ejesArticuladoresList.map((eje) => {
                          const isSelected = selectedEjes.includes(eje.name);
                          const EjeIcon = eje.icon;
                          return (
                            <button
                              key={eje.name}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedEjes(prev => prev.filter(e => e !== eje.name));
                                } else {
                                  setSelectedEjes(prev => [...prev, eje.name]);
                                }
                              }}
                              className={`p-2 rounded-xl text-[9px] font-bold transition-all border flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-zinc-900 border-zinc-950 text-white dark:bg-white dark:border-white dark:text-zinc-900 shadow-sm'
                                  : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-850 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                              }`}
                            >
                              <span className={`p-1 rounded-lg ${isSelected ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900' : eje.color}`}>
                                <EjeIcon className="h-3 w-3" />
                              </span>
                              <span className="truncate">{eje.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* PDAs (Procesos de Desarrollo de Aprendizaje) */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">PDA Seleccionado para Evaluar:</span>
                      <select
                        value={selectedPDA}
                        onChange={(e) => setSelectedPDA(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                      >
                        {(PDA_CATALOG[activeItem.subject_id || ''] || []).map((pda, idx) => (
                          <option key={idx} value={pda}>{pda}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* SECCIÓN 2: RETROALIMENTACIÓN FORMATIVA Y PRODUCTIVIDAD */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/60 pb-2">
                      <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5">
                        <Award className="h-4.5 w-4.5 text-yellow-500" />
                        2. Retroalimentación Formativa
                      </h4>
                      
                      {/* Botón de Rúbricas Interactivas */}
                      <button
                        onClick={() => setIsRubricOpen(!isRubricOpen)}
                        className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-900/30 flex items-center gap-1 transition-all hover:bg-blue-100"
                      >
                        <Award className="h-3.5 w-3.5" />
                        {isRubricOpen ? 'Ocultar Rúbrica' : 'Evaluar con Rúbrica'}
                        <ChevronDown className={`h-3 w-3 transition-transform ${isRubricOpen ? 'rotate-185' : ''}`} />
                      </button>
                    </div>

                    {/* Desplegable de Rúbricas */}
                    {isRubricOpen && (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 flex flex-col gap-4 transition-all">
                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">Rúbrica de Evaluación:</p>
                        {RUBRIC_CRITERIA.map((crit) => (
                          <div key={crit.key} className="flex flex-col gap-1.5">
                            <span className="text-[10.5px] font-bold text-zinc-700 dark:text-zinc-300">{crit.name}</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                              {Object.entries(crit.levels).map(([levelKey, levelInfo]) => {
                                const isSelected = rubricSelections[crit.key] === levelKey;
                                return (
                                  <button
                                    key={levelKey}
                                    type="button"
                                    onClick={() => handleRubricSelect(crit.key, levelKey)}
                                    title={levelInfo.desc}
                                    className={`p-2 rounded-xl text-[9px] text-left border flex flex-col justify-between transition-all ${
                                      isSelected
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                        : 'bg-white border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300'
                                    }`}
                                  >
                                    <span className="font-extrabold truncate">{levelInfo.label}</span>
                                    <span className="text-[8px] leading-tight opacity-75 mt-1 line-clamp-2">{levelInfo.desc}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Banco de Comentarios Rápidos */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => insertQuickComment('felicitacion')}
                        className="text-[9.5px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        🌟 Felicitar
                      </button>
                      <button
                        type="button"
                        onClick={() => insertQuickComment('mejora')}
                        className="text-[9.5px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        💡 Sugerir Mejora
                      </button>
                      <button
                        type="button"
                        onClick={() => insertQuickComment('pregunta')}
                        className="text-[9.5px] font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1 rounded-lg text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        ❓ Preguntar
                      </button>
                    </div>

                    {/* Textarea de Comentarios y Herramientas integradas */}
                    <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-inner group">
                      
                      {/* Textarea */}
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Escribe comentarios constructivos sobre el proceso del alumno. Escribe / para atajos rápidos..."
                        className="w-full text-xs p-4 bg-transparent focus:outline-none text-zinc-900 dark:text-white min-h-[90px] resize-y"
                      />

                      {/* Barra de herramientas de productividad en el pie del Textarea */}
                      <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between flex-wrap gap-3">
                        
                        {/* IA & Mic Botones */}
                        <div className="flex gap-2 items-center">
                          {/* Generar Retroalimentación con IA */}
                          <button
                            type="button"
                            onClick={handleGenerateAIFeedback}
                            disabled={isGeneratingAI}
                            className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm border border-indigo-100/40 dark:border-indigo-900/30 disabled:opacity-50"
                          >
                            {isGeneratingAI ? (
                              <>
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                Analizando Evidencia...
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                                Redactar con IA
                              </>
                            )}
                          </button>

                          {/* Notas de voz */}
                          <button
                            type="button"
                            onClick={toggleRecording}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm border ${
                              isRecording
                                ? 'bg-rose-600 border-rose-600 text-white animate-pulse'
                                : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            {isRecording ? (
                              <>
                                <MicOff className="h-3.5 w-3.5 animate-bounce" />
                                Detener ({recordingDuration}s)
                              </>
                            ) : (
                              <>
                                <Mic className="h-3.5 w-3.5 text-rose-500" />
                                Dictar Voz
                              </>
                            )}
                          </button>
                        </div>

                        <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest">Retroalimentación Formativa</span>
                      </div>

                      {/* Simulador de Onda de Voz (solo visible si graba) */}
                      {isRecording && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white">
                          <Mic className="h-8 w-8 text-rose-500 animate-ping" />
                          <div className="flex flex-col items-center">
                            <span className="text-xs font-bold">Grabando retroalimentación de voz...</span>
                            <span className="text-[10px] opacity-75 mt-0.5">El audio se transcribirá automáticamente al detener la grabación.</span>
                          </div>
                          {/* Onda Animada */}
                          <div className="flex gap-1 items-end h-8 mt-2">
                            <div className="w-1 bg-rose-500 rounded-full h-4 animate-[pulse_1s_infinite_100ms]"></div>
                            <div className="w-1 bg-rose-500 rounded-full h-8 animate-[pulse_1s_infinite_200ms]"></div>
                            <div className="w-1 bg-rose-500 rounded-full h-6 animate-[pulse_1s_infinite_300ms]"></div>
                            <div className="w-1 bg-rose-500 rounded-full h-8 animate-[pulse_1s_infinite_400ms]"></div>
                            <div className="w-1 bg-rose-500 rounded-full h-5 animate-[pulse_1s_infinite_500ms]"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECCIÓN 3: GAMIFICACIÓN Y DESGLOSE DE XP */}
                  <div className="flex flex-col gap-3">
                    <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800/60 pb-2">
                      <Star className="h-4.5 w-4.5 text-orange-500" />
                      3. Gamificación con Propósito (Desglose de XP)
                    </h4>

                    {/* Desglose RPG Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850">
                      
                      {/* Pensamiento Científico */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-zinc-500 dark:text-zinc-400">🔬 Pensamiento Científico:</span>
                          <span className="text-indigo-600 dark:text-indigo-400">+{xpBreakdown.scientific} XP</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="5"
                          value={xpBreakdown.scientific}
                          onChange={(e) => setXpBreakdown(prev => ({ ...prev, scientific: parseInt(e.target.value) }))}
                          className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      {/* Pensamiento Crítico */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-zinc-500 dark:text-zinc-400">🧠 Pensamiento Crítico:</span>
                          <span className="text-purple-600 dark:text-purple-400">+{xpBreakdown.critical} XP</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="5"
                          value={xpBreakdown.critical}
                          onChange={(e) => setXpBreakdown(prev => ({ ...prev, critical: parseInt(e.target.value) }))}
                          className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                      </div>

                      {/* Trabajo Colaborativo */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-zinc-500 dark:text-zinc-400">🤝 Trabajo Colaborativo:</span>
                          <span className="text-emerald-600 dark:text-emerald-400">+{xpBreakdown.collaborative} XP</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="5"
                          value={xpBreakdown.collaborative}
                          onChange={(e) => setXpBreakdown(prev => ({ ...prev, collaborative: parseInt(e.target.value) }))}
                          className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>

                      {/* Comunicación y Lenguaje */}
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-zinc-500 dark:text-zinc-400">💬 Comunicación y Lenguaje:</span>
                          <span className="text-pink-600 dark:text-pink-400">+{xpBreakdown.communication} XP</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="5"
                          value={xpBreakdown.communication}
                          onChange={(e) => setXpBreakdown(prev => ({ ...prev, communication: parseInt(e.target.value) }))}
                          className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                        />
                      </div>

                    </div>

                    {/* Total XP Indicador */}
                    <div className="flex items-center justify-between text-xs font-black text-zinc-700 dark:text-zinc-300 px-1">
                      <span>Total de Experiencia Acumulada:</span>
                      <span className="bg-amber-100/70 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-3 py-1 rounded-lg border border-amber-200/20 text-sm">
                        +{xpBreakdown.scientific + xpBreakdown.critical + xpBreakdown.collaborative + xpBreakdown.communication} XP
                      </span>
                    </div>
                  </div>

                  {/* SECCIÓN 4: ACCIONES DE EVALUACIÓN (BOTONES DE PROGRESIÓN) */}
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-5 flex flex-col gap-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">4. Asignar Nivel de Progresión (Cerrar Calificación)</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      
                      {/* Botón Requiere Apoyo (needs_revision) */}
                      <button
                        type="button"
                        onClick={() => handleSaveReview('needs_revision')}
                        className="p-3 border border-rose-200 hover:bg-rose-50 text-rose-600 dark:border-rose-900/30 dark:hover:bg-rose-950/20 rounded-2xl flex flex-col items-center gap-1.5 text-center transition-all"
                      >
                        <AlertCircle className="h-5 w-5 text-rose-500" />
                        <span className="text-xs font-black">Requiere Apoyo</span>
                        <span className="text-[8px] opacity-75 font-medium leading-tight">Incompleto / Corregir</span>
                      </button>

                      {/* Botón En Proceso (needs_revision o mantiene submitted) */}
                      <button
                        type="button"
                        onClick={() => handleSaveReview('needs_revision')} // Mapeado a revisión intermedia
                        className="p-3 border border-amber-200 hover:bg-amber-50 text-amber-600 dark:border-amber-900/30 dark:hover:bg-amber-950/20 rounded-2xl flex flex-col items-center gap-1.5 text-center transition-all"
                      >
                        <Clock className="h-5 w-5 text-amber-500" />
                        <span className="text-xs font-black">En Proceso</span>
                        <span className="text-[8px] opacity-75 font-medium leading-tight">Buen camino / Parcial</span>
                      </button>

                      {/* Botón Logrado (approved) */}
                      <button
                        type="button"
                        onClick={() => handleSaveReview('approved')}
                        className="p-3 border border-blue-200 hover:bg-blue-50 text-blue-600 dark:border-blue-900/30 dark:hover:bg-blue-950/20 rounded-2xl flex flex-col items-center gap-1.5 text-center transition-all"
                      >
                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        <span className="text-xs font-black">Logrado</span>
                        <span className="text-[8px] opacity-75 font-medium leading-tight">Cumple con los objetivos</span>
                      </button>

                      {/* Botón Avanzado (approved + 20 XP bonus) */}
                      <button
                        type="button"
                        onClick={() => handleSaveReview('approved', 20)}
                        className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex flex-col items-center gap-1.5 text-center transition-all shadow-md shadow-emerald-600/10"
                      >
                        <Award className="h-5 w-5 text-emerald-250 animate-bounce" />
                        <span className="text-xs font-black">Avanzado 🌟</span>
                        <span className="text-[8px] text-emerald-100 font-medium leading-tight">Sobresaliente (+20 XP)</span>
                      </button>

                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
