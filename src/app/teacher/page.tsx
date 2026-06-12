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
  ZoomIn, ZoomOut, Maximize2, Users, Palette,
  X, MapPin, Phone, Mail, User, AlertTriangle, Bell,
  Bookmark, Save, Sparkles
} from 'lucide-react';
import { FormattedDate } from '@/components/FormattedDate';
import { DetailedStudent, AttendanceStatus, Attendance, ParentMessage, Quest, QuizQuestion } from '@/types';
import { PlanningTab } from './PlanningTab';

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

// Criterios de Rúbrica de Evaluación Formativa Gamificada
const RUBRIC_CRITERIA = [
  {
    key: 'technical',
    name: 'Poder de Saberes Científicos ⚡',
    levels: {
      avanzado: { label: 'Rango: Leyenda 👑 (+40 XP)', desc: 'Propone una solución innovadora y describe a la perfección los procesos involucrados.', text: 'Demuestra una comprensión técnica sobresaliente y un análisis profundo del funcionamiento del proyecto.' },
      logrado: { label: 'Rango: Héroe ⭐ (+25 XP)', desc: 'Describe correctamente las partes y el funcionamiento general del proyecto.', text: 'Identifica y describe correctamente las etapas principales del proyecto.' },
      proceso: { label: 'Rango: Aprendiz ⚔️ (+10 XP)', desc: 'Menciona los conceptos básicos pero requiere profundizar en la fundamentación.', text: 'Muestra noción del funcionamiento básico pero requiere profundizar en la fundamentación técnica.' },
      apoyo: { label: 'Rango: Iniciado 🛡️ (+5 XP)', desc: 'Muestra confusión en la explicación técnica básica del ejercicio.', text: 'Presenta dificultades para explicar los elementos clave del proyecto. Se sugiere repasar los conceptos fundamentales.' }
    }
  },
  {
    key: 'reflection',
    name: 'Clarividencia & Autoevaluación 🔮',
    levels: {
      avanzado: { label: 'Rango: Leyenda 👑 (+30 XP)', desc: 'Realiza una reflexión profunda sobre sus aprendizajes y retos superados.', text: 'Presenta una autoevaluación muy madura, identificando claramente aprendizajes y formas de superar retos.' },
      logrado: { label: 'Rango: Héroe ⭐ (+20 XP)', desc: 'Expresa su opinión sobre el desarrollo de la actividad e identifica aciertos.', text: 'Expresa reflexiones claras sobre su propio desempeño durante la actividad.' },
      proceso: { label: 'Rango: Aprendiz ⚔️ (+10 XP)', desc: 'Describe lo que hizo pero sin profundizar en un autoanálisis.', text: 'Describe el proceso realizado, pero se sugiere hacer un análisis más introspectivo de lo aprendido.' },
      apoyo: { label: 'Rango: Iniciado 🛡️ (+5 XP)', desc: 'La autoevaluación es muy breve. Se sugiere reflexionar sobre los retos encontrados en la actividad.', text: 'La autoevaluación es muy breve. Se sugiere reflexionar sobre los retos encontrados en la actividad.' }
    }
  },
  {
    key: 'evidence',
    name: 'Destreza del Artefacto (Evidencia) 🛡️',
    levels: {
      avanzado: { label: 'Rango: Leyenda 👑 (+30 XP)', desc: 'La evidencia está sumamente cuidada, estructurada y es de alta calidad.', text: 'La evidencia entregada tiene una presentación impecable, estructurada y muy clara.' },
      logrado: { label: 'Rango: Héroe ⭐ (+20 XP)', desc: 'La evidencia cumple de forma clara con todos los requisitos solicitados.', text: 'Cumple de manera clara y ordenada con el formato y los requisitos de la evidencia.' },
      proceso: { label: 'Rango: Aprendiz ⚔️ (+10 XP)', desc: 'La evidencia está incompleta o presenta detalles que dificultan comprenderla.', text: 'La evidencia está incompleta o tiene detalles visuales/de audio que dificultan la comprensión.' },
      apoyo: { label: 'Rango: Iniciado 🛡️ (+5 XP)', desc: 'La evidencia es ilegible, incorrecta o no corresponde a la actividad.', text: 'La evidencia es poco legible o no corresponde con los requisitos mínimos de la entrega.' }
    }
  }
];

export default function TeacherDashboard() {
  const { 
    portfolioItems, 
    reviewPortfolioItem, 
    currentTeacher, 
    detailedStudents, 
    schedulesList, 
    groupsList,
    subjects,
    missions,
    attendanceList,
    parentMessages,
    saveAttendanceList,
    sendParentMessage,
    saveQuest,
    linkPortfolioItemToQuest,
    submitPortfolioItemOnBehalf
  } = useGamification();

  // Expediente escolar detallado
  const [selectedStudent, setSelectedStudent] = useState<DetailedStudent | null>(null);

  // Navegación principal del portal del profesor
  const [currentMenuTab, setCurrentMenuTab] = useState<'evaluation' | 'attendance' | 'tasks' | 'design' | 'planning'>('evaluation');

  // Estados para Asistencia
  const [selectedAttendanceGroup, setSelectedAttendanceGroup] = useState<string>('');
  const [selectedAttendanceSubject, setSelectedAttendanceSubject] = useState<string>('');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: AttendanceStatus; comments: string }>>({});

  // Estados para Seguimiento de Tareas y Alertas
  const [selectedTaskGroup, setSelectedTaskGroup] = useState<string>('');
  const [selectedTaskSubject, setSelectedTaskSubject] = useState<string>('');
  const [selectedTaskQuest, setSelectedTaskQuest] = useState<string>('');
  
  // Modal de notificación a padres
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyingStudent, setNotifyingStudent] = useState<DetailedStudent | null>(null);
  const [notifyingQuestTitle, setNotifyingQuestTitle] = useState('');
  const [notificationTemplate, setNotificationTemplate] = useState<'late' | 'quality' | 'conduct'>('late');
  const [customMessage, setCustomMessage] = useState('');

  // Estados para Modal de Vincular Evidencia
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkingStudent, setLinkingStudent] = useState<DetailedStudent | null>(null);
  const [mockEvidenceTitle, setMockEvidenceTitle] = useState('');
  const [mockEvidenceDesc, setMockEvidenceDesc] = useState('');
  const [mockEvidenceFileUrl, setMockEvidenceFileUrl] = useState('');
  const [mockEvidenceFileType, setMockEvidenceFileType] = useState<'image' | 'audio' | 'video' | 'pdf'>('image');

  // Estados para Diseño de Exámenes (NEM + RPG Boss)
  const [isCreateExamFormOpen, setIsCreateExamFormOpen] = useState(false);
  const [designExamTitle, setDesignExamTitle] = useState('');
  const [designExamStory, setDesignExamStory] = useState('');
  const [designExamBossName, setDesignExamBossName] = useState('Tirano de las Fracciones');
  const [designExamBossHp, setDesignExamBossHp] = useState(100);
  const [designExamBossMaxDmg, setDesignExamBossMaxDmg] = useState(20);
  const [designExamXp, setDesignExamXp] = useState(300);
  const [designExamCoins, setDesignExamCoins] = useState(50);
  const [designExamSelectedCampos, setDesignExamSelectedCampos] = useState<string[]>([]);
  const [designExamSelectedEjes, setDesignExamSelectedEjes] = useState<string[]>([]);
  const [designExamSelectedPDA, setDesignExamSelectedPDA] = useState('');
  const [designExamCustomLoot, setDesignExamCustomLoot] = useState('shield_legend');
  const [designExamStatBoost, setDesignExamStatBoost] = useState({ strength: 3, intelligence: 3, defense: 3 });
  const [designExamQuestions, setDesignExamQuestions] = useState<QuizQuestion[]>([
    {
      id: 'eq1',
      question: 'Pregunta de examen 1: ¿Cuánto es 3/4 + 1/4?',
      options: ['1/2', '1', '1.5', '2/4'],
      correctAnswerIndex: 1,
      explanation: 'Explicación: Sumar 3/4 + 1/4 = 4/4 = 1 entero.'
    }
  ]);

  // Estados para Diseño de Tareas (NEM)
  const [selectedDesignSubject, setSelectedDesignSubject] = useState<string>('');
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [designQuestTitle, setDesignQuestTitle] = useState('');
  const [designQuestDesc, setDesignQuestDesc] = useState('');
  const [designQuestType, setDesignQuestType] = useState<'quiz' | 'portfolio_submission'>('portfolio_submission');
  const [designQuestXp, setDesignQuestXp] = useState<number>(100);
  const [designQuestCoins, setDesignQuestCoins] = useState<number>(15);
  const [designSelectedCampos, setDesignSelectedCampos] = useState<string[]>([]);
  const [designSelectedEjes, setDesignSelectedEjes] = useState<string[]>([]);
  const [designSelectedPDA, setDesignSelectedPDA] = useState<string>('');
  const [designInstructions, setDesignInstructions] = useState('');
  const [designAcceptedFormats, setDesignAcceptedFormats] = useState<string[]>(['image']);
  const [designQuizQuestions, setDesignQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q1',
      question: 'Pregunta de ejemplo: ¿Cuánto es 1/2 + 1/4?',
      options: ['1/2', '3/4', '2/4', '1/4'],
      correctAnswerIndex: 1,
      explanation: 'Explicación: Convertimos 1/2 a 2/4, sumamos 2/4 + 1/4 = 3/4.'
    }
  ]);

  // Inicializar grupos y materias por defecto para Israel López
  useEffect(() => {
    const mySchedules = schedulesList.filter(s => s.teacherId === currentTeacher.id);
    if (mySchedules.length > 0) {
      const firstGroup = mySchedules[0].groupId;
      const firstSubject = mySchedules[0].subjectId;
      setSelectedAttendanceGroup(firstGroup);
      setSelectedAttendanceSubject(firstSubject);
      setSelectedTaskGroup(firstGroup);
      setSelectedTaskSubject(firstSubject);
      setSelectedDesignSubject(firstSubject);
    }
  }, [schedulesList, currentTeacher.id]);

  // Cargar asistencia guardada al cambiar grupo, materia o fecha
  useEffect(() => {
    if (!selectedAttendanceGroup || !selectedAttendanceSubject || !attendanceDate) return;
    
    const studentsInGroup = detailedStudents.filter(s => s.group_id === selectedAttendanceGroup);
    const initialRecords: Record<string, { status: AttendanceStatus; comments: string }> = {};
    
    studentsInGroup.forEach(student => {
      const savedRecord = attendanceList.find(att => 
        att.student_id === student.id &&
        att.group_id === selectedAttendanceGroup &&
        att.subject_id === selectedAttendanceSubject &&
        att.date === attendanceDate
      );
      
      initialRecords[student.id] = {
        status: savedRecord ? savedRecord.status : 'presente',
        comments: savedRecord?.comments || ''
      };
    });
    
    setAttendanceRecords(initialRecords);
  }, [selectedAttendanceGroup, selectedAttendanceSubject, attendanceDate, attendanceList, detailedStudents]);

  // Autoseleccionar primera tarea al cambiar materia de seguimiento
  useEffect(() => {
    if (!selectedTaskSubject) return;
    const questsForSub = missions
      .filter(m => m.subject_id === selectedTaskSubject)
      .flatMap(m => m.quests || []);
    if (questsForSub.length > 0) {
      setSelectedTaskQuest(questsForSub[0].id);
      setNotifyingQuestTitle(questsForSub[0].title);
    } else {
      setSelectedTaskQuest('');
      setNotifyingQuestTitle('');
    }
  }, [selectedTaskSubject, missions]);

  // Actualizar plantilla de mensaje al cambiar plantilla o alumno notificado
  useEffect(() => {
    if (!notifyingStudent || !selectedTaskSubject) return;
    const studentName = `${notifyingStudent.first_name} ${notifyingStudent.last_name_1}`;
    const subjectName = subjects.find(s => s.id === selectedTaskSubject)?.name || 'Materia';
    
    if (notificationTemplate === 'late') {
      setCustomMessage(`Estimado tutor de ${studentName}, le informamos que el alumno no ha entregado a tiempo la tarea "${notifyingQuestTitle || 'Pendiente'}" de la asignatura ${subjectName}. Agradecemos su colaboración en casa para que el estudiante realice y envíe su evidencia lo antes posible para su evaluación.`);
    } else if (notificationTemplate === 'quality') {
      setCustomMessage(`Estimado tutor de ${studentName}, el trabajo "${notifyingQuestTitle || 'Pendiente'}" de la materia ${subjectName} ha sido revisado y requiere apoyo. Le hemos solicitado al alumno realizar algunas correcciones y volver a enviar. Agradecemos su apoyo en casa supervisando estos ajustes.`);
    } else if (notificationTemplate === 'conduct') {
      setCustomMessage(`Estimado tutor de ${studentName}, nos comunicamos para informarle que en la sesión de ${subjectName} el alumno presentó dificultades para concentrarse o no contaba con los materiales necesarios para la clase. Agradecemos conversar con él/ella al respecto para mejorar su desempeño.`);
    }
  }, [notifyingStudent, selectedTaskSubject, notificationTemplate, notifyingQuestTitle, subjects]);

  // Formateador de nombres de estudiantes (apellidos primero)
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

  // Selección automática de elementos ordenados por apellido
  const sortedCurrentItems = [...(activeTab === 'pending' ? pendingItems : reviewedItems)].sort((a, b) => {
    const nameA = a.student_profile ? formatStudentName(a.student_profile) : '';
    const nameB = b.student_profile ? formatStudentName(b.student_profile) : '';
    return nameA.localeCompare(nameB);
  });
  const activeItem = sortedCurrentItems.find(i => i.id === selectedItemId) || sortedCurrentItems[0] || null;

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
    
    // Buscar la tarea (quest) vinculada a esta entrega
    const quest = missions.flatMap(m => m.quests || []).find(q => q.id === activeItem.quest_id);

    // Campos formativos por defecto según materia, quest o entrega
    const defaultCampos = quest?.campos_formativos || activeItem.campos_formativos || (
      activeItem.subject?.id === 'sub-math' ? ['Saberes y Pensamiento Científico'] :
      activeItem.subject?.id === 'sub-sci' ? ['Saberes y Pensamiento Científico', 'Ética, Naturaleza y Sociedades'] :
      activeItem.subject?.id === 'sub-span' ? ['Lenguajes'] : []
    );
    setSelectedCampos(defaultCampos);

    setSelectedEjes(quest?.ejes_articuladores || activeItem.ejes_articuladores || ['Pensamiento Crítico']);
    
    // PDA inicial sugerido
    const pdasForSubject = PDA_CATALOG[activeItem.subject_id || ''] || [];
    setSelectedPDA(quest?.pdas?.[0] || activeItem.pdas?.[0] || pdasForSubject[0] || '');

    // XP breakdown por defecto
    setXpBreakdown({
      scientific: activeItem.xp_breakdown?.scientific ?? (activeItem.subject_id === 'sub-math' || activeItem.subject_id === 'sub-sci' ? 40 : 10),
      critical: activeItem.xp_breakdown?.critical ?? 30,
      collaborative: activeItem.xp_breakdown?.collaborative ?? 20,
      communication: activeItem.xp_breakdown?.communication ?? (activeItem.subject_id === 'sub-span' ? 40 : 10)
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
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-md">
              {currentMenuTab === 'evaluation' ? 'Módulo de Evaluación Formativa' : 
               currentMenuTab === 'attendance' ? 'Módulo de Asistencia Diaria' : 
               currentMenuTab === 'design' ? 'Módulo de Planificación y Diseño' : 
               currentMenuTab === 'planning' ? 'Planeación Didáctica NEM' : 'Módulo de Avisos y Tareas'}
            </span>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white mt-2">
              {currentMenuTab === 'evaluation' ? 'Alineación Estructural NEM' :
               currentMenuTab === 'attendance' ? 'Control de Asistencia de Grupos' :
               currentMenuTab === 'design' ? 'Diseño y Planeación de Tareas NEM' :
               currentMenuTab === 'planning' ? 'Generador de Planeación con IA' : 'Seguimiento de Tareas y Alertas a Padres'}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Docente: <strong>{currentTeacher.first_name} {currentTeacher.last_name}</strong> | Colegio Anglo Mexicano
            </p>
          </div>

          {/* Menú Principal del Docente */}
          <div className="flex flex-wrap gap-1 bg-zinc-150 dark:bg-zinc-955 p-1 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 w-full xl:w-auto">
            <button
              onClick={() => setCurrentMenuTab('evaluation')}
              className={`flex-1 xl:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                currentMenuTab === 'evaluation'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Evaluación Formativa
            </button>
            <button
              onClick={() => setCurrentMenuTab('design')}
              className={`flex-1 xl:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                currentMenuTab === 'design'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Diseño de Tareas
            </button>
            <button
              onClick={() => setCurrentMenuTab('planning')}
              className={`flex-1 xl:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                currentMenuTab === 'planning'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Planeación
            </button>
            <button
              onClick={() => setCurrentMenuTab('attendance')}
              className={`flex-1 xl:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                currentMenuTab === 'attendance'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Pasar Lista
            </button>
            <button
              onClick={() => setCurrentMenuTab('tasks')}
              className={`flex-1 xl:flex-initial px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                currentMenuTab === 'tasks'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Seguimiento de Tareas
            </button>
          </div>
        </div>

        {/* MÓDULO DE EVALUACIÓN FORMATIVA */}
        {currentMenuTab === 'evaluation' && (
          <>
            {/* Sub-Pestañas para Evaluación Formativa */}
            <div className="flex justify-end bg-white dark:bg-zinc-900 p-3 px-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-850/50 shadow-sm -mt-2">
              <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 w-full sm:w-auto">
                <button
                  onClick={() => { setActiveTab('pending'); setSelectedItemId(null); }}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'pending'
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                  }`}
                >
                  Pendientes ({pendingItems.length})
                </button>
                <button
                  onClick={() => { setActiveTab('reviewed'); setSelectedItemId(null); }}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'reviewed'
                      ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
                  }`}
                >
                  Evaluados ({reviewedItems.length})
                </button>
              </div>
            </div>

        {sortedCurrentItems.length === 0 ? (
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
              {sortedCurrentItems.map((item) => {
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
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                const student = detailedStudents.find(s => s.id === item.student_id);
                                if (!student) return;
                                
                                // Validar que el profesor da clase al grupo del alumno
                                const teacherGroupIds = schedulesList
                                  .filter(s => s.teacherId === currentTeacher.id)
                                  .map(s => s.groupId);
                                
                                const hasAccess = student.group_id && teacherGroupIds.includes(student.group_id);
                                if (hasAccess) {
                                  setSelectedStudent(student);
                                } else {
                                  alert("Acceso denegado: Este alumno no está inscrito en tus asignaciones de grupo vigentes.");
                                }
                              }}
                              className="hover:text-violet-600 dark:hover:text-violet-400 hover:underline transition-colors cursor-pointer"
                            >
                              {item.student_profile ? formatStudentName(item.student_profile) : ''}
                            </span>
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
                      <span className="ml-auto text-[9px] text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded-full border border-zinc-200/55 dark:border-zinc-800/60 uppercase">Definido en Tarea</span>
                    </h4>

                    {/* Campos Formativos */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Campos Formativos:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCampos.length > 0 ? (
                          selectedCampos.map((campo) => (
                            <div
                              key={campo}
                              className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-blue-600 border border-blue-600 text-white shadow-sm flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {campo}
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-zinc-400 italic">Ningún Campo Formativo asignado a esta tarea.</span>
                        )}
                      </div>
                    </div>

                    {/* Ejes Articuladores */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Ejes Articuladores:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedEjes.length > 0 ? (
                          selectedEjes.map((ejeName) => {
                            const eje = ejesArticuladoresList.find(e => e.name === ejeName);
                            const EjeIcon = eje?.icon || Brain;
                            return (
                              <div
                                key={ejeName}
                                className="px-3 py-1.5 rounded-xl text-[9px] font-bold bg-zinc-950 border border-zinc-950 text-white dark:bg-zinc-800 dark:border-zinc-755 shadow-sm flex items-center gap-1.5"
                              >
                                <EjeIcon className="h-3.5 w-3.5" />
                                {ejeName}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-xs text-zinc-400 italic">Ningún Eje Articulador asignado a esta tarea.</span>
                        )}
                      </div>
                    </div>

                    {/* PDAs (Procesos de Desarrollo de Aprendizaje) */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">PDA Seleccionado para Evaluar:</span>
                      {selectedPDA ? (
                        <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/50 dark:bg-zinc-950/40 dark:border-zinc-850 flex gap-2.5 items-start">
                          <Bookmark className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs font-semibold leading-relaxed text-zinc-800 dark:text-zinc-250">
                            {selectedPDA}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">Ningún PDA seleccionado para esta tarea.</span>
                      )}
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
                        <ChevronDown className={`h-3 w-3 transition-transform ${isRubricOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Desplegable de Rúbricas */}
                    {isRubricOpen && (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200/50 dark:border-zinc-800 flex flex-col gap-4 transition-all">
                        <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wide">Rúbrica de Evaluación:</p>
                        {RUBRIC_CRITERIA.map((crit) => (
                          <div key={crit.key} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10.5px] font-black text-zinc-850 dark:text-zinc-200">{crit.name}</span>
                              <span className="h-0.5 flex-1 bg-gradient-to-r from-zinc-200 to-transparent dark:from-zinc-800" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {Object.entries(crit.levels).map(([levelKey, levelInfo]) => {
                                const isSelected = rubricSelections[crit.key] === levelKey;
                                return (
                                  <button
                                    key={levelKey}
                                    type="button"
                                    onClick={() => handleRubricSelect(crit.key, levelKey)}
                                    title={levelInfo.desc}
                                    className={`p-3 rounded-2xl text-[9px] text-left border flex flex-col justify-between transition-all duration-200 transform hover:scale-102 ${
                                      isSelected
                                        ? levelKey === 'avanzado'
                                          ? 'bg-gradient-to-br from-amber-500 to-yellow-600 border-yellow-600 text-white shadow-md shadow-yellow-500/20 font-black'
                                          : levelKey === 'logrado'
                                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20 font-black'
                                          : levelKey === 'proceso'
                                          ? 'bg-gradient-to-br from-sky-500 to-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 font-black'
                                          : 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20 font-black'
                                        : 'bg-white border-zinc-205 hover:border-zinc-350 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-655 dark:text-zinc-300 hover:shadow-xs'
                                    }`}
                                  >
                                    <span className="font-extrabold truncate">{levelInfo.label}</span>
                                    <span className="text-[8px] leading-tight opacity-80 mt-1 line-clamp-3">{levelInfo.desc}</span>
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
        </>)}

        {/* ----------------- CONTROL DE ASISTENCIA ----------------- */}
        {currentMenuTab === 'attendance' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            
            {/* Filtros de Asistencia */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Grupo</label>
                <select
                  value={selectedAttendanceGroup}
                  onChange={(e) => setSelectedAttendanceGroup(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {groupsList
                    .filter(g => schedulesList.some(s => s.groupId === g.id && s.teacherId === currentTeacher.id))
                    .map(g => (
                      <option key={g.id} value={g.id}>{g.name} - {g.level_grade_id.startsWith('primaria') ? 'Primaria Alta' : g.level_grade_id.startsWith('secundaria') ? 'Secundaria' : 'Preparatoria'}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Asignatura</label>
                <select
                  value={selectedAttendanceSubject}
                  onChange={(e) => setSelectedAttendanceSubject(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {subjects
                    .filter(sub => schedulesList.some(s => s.subjectId === sub.id && s.groupId === selectedAttendanceGroup && s.teacherId === currentTeacher.id))
                    .map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Fecha de Asistencia</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-955 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Cabecera de Acciones Rápidas */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Alumnos en el grupo: <strong>{detailedStudents.filter(s => s.group_id === selectedAttendanceGroup).length}</strong>
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const studentsInGroup = detailedStudents.filter(s => s.group_id === selectedAttendanceGroup);
                    const updatedRecords = { ...attendanceRecords };
                    studentsInGroup.forEach(student => {
                      updatedRecords[student.id] = {
                        ...updatedRecords[student.id],
                        status: 'presente'
                      };
                    });
                    setAttendanceRecords(updatedRecords);
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 border border-emerald-200 hover:bg-emerald-50 text-emerald-600 dark:border-emerald-900/35 dark:hover:bg-emerald-950/20 rounded-xl text-xs font-bold transition-all"
                >
                  Marcar Todos Presente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const studentsInGroup = detailedStudents.filter(s => s.group_id === selectedAttendanceGroup);
                    const recordsToSave = studentsInGroup.map(s => ({
                      student_id: s.id,
                      group_id: selectedAttendanceGroup,
                      subject_id: selectedAttendanceSubject,
                      date: attendanceDate,
                      status: attendanceRecords[s.id]?.status || 'presente',
                      comments: attendanceRecords[s.id]?.comments || ''
                    }));
                    saveAttendanceList(recordsToSave);
                    alert('¡La asistencia escolar ha sido guardada exitosamente!');
                  }}
                  className="flex-1 sm:flex-initial px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10"
                >
                  Guardar Asistencia
                </button>
              </div>
            </div>

            {/* Tabla de Alumnos */}
            <div className="overflow-x-auto border border-zinc-200/50 dark:border-zinc-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200/60 dark:border-zinc-800/80 text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                    <th className="py-3.5 px-4">Alumno</th>
                    <th className="py-3.5 px-4 text-center">Estado de Asistencia</th>
                    <th className="py-3.5 px-4">Observaciones / Justificaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/50">
                  {detailedStudents
                    .filter(s => s.group_id === selectedAttendanceGroup)
                    .sort((a, b) => formatStudentName(a).localeCompare(formatStudentName(b)))
                    .map((student) => {
                      const record = attendanceRecords[student.id] || { status: 'presente', comments: '' };
                      return (
                        <tr key={student.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-extrabold text-[10px]">
                                {student.first_name[0]}{student.last_name_1?.[0] || ''}
                              </div>
                              <div>
                                <span
                                  onClick={() => setSelectedStudent(student)}
                                  className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer font-bold text-zinc-900 dark:text-white"
                                >
                                  {formatStudentName(student)}
                                </span>
                                <span className="block text-[9px] text-zinc-400 font-mono mt-0.5">{student.enrollment_id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center items-center">
                              <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/40 dark:border-zinc-805/40 max-w-xs">
                                {(['presente', 'falta', 'retardo', 'justificado'] as const).map((st) => {
                                  const isActive = record.status === st;
                                  const colorClass = 
                                    st === 'presente' ? 'bg-emerald-500 text-white shadow-sm' :
                                    st === 'falta' ? 'bg-rose-500 text-white shadow-sm' :
                                    st === 'retardo' ? 'bg-amber-500 text-white shadow-sm' :
                                    'bg-blue-500 text-white shadow-sm';
                                  
                                  return (
                                    <button
                                      key={st}
                                      type="button"
                                      onClick={() => {
                                        setAttendanceRecords(prev => ({
                                          ...prev,
                                          [student.id]: {
                                            ...prev[student.id],
                                            status: st
                                          }
                                        }));
                                      }}
                                      className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold capitalize transition-all ${
                                        isActive ? colorClass : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-250'
                                      }`}
                                    >
                                      {st}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={record.comments || ''}
                              onChange={(e) => {
                                setAttendanceRecords(prev => ({
                                  ...prev,
                                  [student.id]: {
                                    status: prev[student.id]?.status || 'presente',
                                    comments: e.target.value
                                  }
                                }));
                              }}
                              placeholder="Observación del comportamiento o retardo..."
                              className="w-full text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-blue-500"
                            />
                          </td>
                        </tr>
                      );
                    })
                  }
                  {detailedStudents.filter(s => s.group_id === selectedAttendanceGroup).length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-zinc-400">
                        No hay alumnos registrados en este grupo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ----------------- SEGUIMIENTO DE TAREAS Y AVISOS ----------------- */}
        {currentMenuTab === 'tasks' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            
            {/* Filtros de Tareas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Grupo</label>
                <select
                  value={selectedTaskGroup}
                  onChange={(e) => setSelectedTaskGroup(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {groupsList
                    .filter(g => schedulesList.some(s => s.groupId === g.id && s.teacherId === currentTeacher.id))
                    .map(g => (
                      <option key={g.id} value={g.id}>{g.name} - {g.level_grade_id.startsWith('primaria') ? 'Primaria Alta' : g.level_grade_id.startsWith('secundaria') ? 'Secundaria' : 'Preparatoria'}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Asignatura</label>
                <select
                  value={selectedTaskSubject}
                  onChange={(e) => setSelectedTaskSubject(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {subjects
                    .filter(sub => schedulesList.some(s => s.subjectId === sub.id && s.groupId === selectedTaskGroup && s.teacherId === currentTeacher.id))
                    .map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Tarea Escolar (Quest)</label>
                <select
                  value={selectedTaskQuest}
                  onChange={(e) => {
                    setSelectedTaskQuest(e.target.value);
                    const title = missions
                      .flatMap(m => m.quests || [])
                      .find(q => q.id === e.target.value)?.title || '';
                    setNotifyingQuestTitle(title);
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                >
                  {missions
                    .filter(m => m.subject_id === selectedTaskSubject)
                    .flatMap(m => m.quests || [])
                    .map(q => (
                      <option key={q.id} value={q.id}>{q.title}</option>
                    ))
                  }
                  {missions.filter(m => m.subject_id === selectedTaskSubject).flatMap(m => m.quests || []).length === 0 && (
                    <option value="">No hay tareas registradas para esta materia</option>
                  )}
                </select>
              </div>
            </div>

            {/* Listado de Alumnos y Estado de Entrega */}
            <div className="overflow-x-auto border border-zinc-200/50 dark:border-zinc-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-955 border-b border-zinc-200/60 dark:border-zinc-800/80 text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                    <th className="py-3.5 px-4">Alumno</th>
                    <th className="py-3.5 px-4 text-center">Estado de la Tarea</th>
                    <th className="py-3.5 px-4">Canal de Alertas a Padres</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/40 dark:divide-zinc-800/50">
                  {detailedStudents
                    .filter(s => s.group_id === selectedTaskGroup)
                    .sort((a, b) => formatStudentName(a).localeCompare(formatStudentName(b)))
                    .map((student) => {
                      // Buscar entrega
                      const submission = portfolioItems.find(item => 
                        item.student_id === student.id &&
                        item.subject_id === selectedTaskSubject &&
                        item.quest_id === selectedTaskQuest
                      );

                      // Buscar alerta previa
                      const sentAlert = parentMessages.find(m => 
                        m.student_id === student.id &&
                        m.subject_id === selectedTaskSubject &&
                        m.quest_id === selectedTaskQuest
                      );

                      return (
                        <tr key={student.id} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30 transition-colors">
                          <td className="py-4 px-4 align-top">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-extrabold text-[10px]">
                                {student.first_name[0]}{student.last_name_1?.[0] || ''}
                              </div>
                              <div>
                                <span
                                  onClick={() => setSelectedStudent(student)}
                                  className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer font-bold text-zinc-900 dark:text-white"
                                >
                                  {formatStudentName(student)}
                                </span>
                                <span className="block text-[9px] text-zinc-400 font-mono mt-0.5">{student.enrollment_id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center align-top">
                            {submission ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                {submission.status === 'approved' ? (
                                  <span className="px-2.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Entregado (Logrado)
                                  </span>
                                ) : submission.status === 'needs_revision' ? (
                                  <span className="px-2.5 py-0.5 rounded bg-rose-50 dark:bg-rose-955/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-100 dark:border-rose-900/30 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> Requiere Apoyo
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded bg-amber-50 dark:bg-amber-955/40 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-100 dark:border-amber-900/30 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Pendiente de Revisión
                                  </span>
                                )}
                                <span className="text-[9px] text-zinc-400">
                                  XP: +{submission.xp_breakdown 
                                    ? Object.values(submission.xp_breakdown).reduce((sum, val) => sum + (val || 0), 0)
                                    : (missions.flatMap(m => m.quests || []).find(q => q.id === submission.quest_id)?.xp_reward || 100)
                                  } XP
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentMenuTab('evaluation');
                                    setActiveTab(submission.status === 'submitted' ? 'pending' : 'reviewed');
                                    setSelectedItemId(submission.id);
                                  }}
                                  className="mt-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 rounded-lg text-[9px] font-extrabold flex items-center gap-1 transition-all"
                                >
                                  <FileText className="h-3 w-3" />
                                  Revisar Evidencia
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded bg-red-50 dark:bg-red-955/40 text-red-600 dark:text-red-400 text-[10px] font-bold border border-red-100 dark:border-red-900/30 flex items-center gap-1 justify-center mx-auto w-max">
                                  <AlertCircle className="h-3 w-3" /> Sin Entregar
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLinkingStudent(student);
                                    const qTitle = missions.flatMap(m => m.quests || []).find(q => q.id === selectedTaskQuest)?.title || '';
                                    setMockEvidenceTitle(`Evidencia de ${student.first_name} - ${qTitle}`);
                                    setMockEvidenceDesc('Trabajo o proyecto escolar presentado físicamente en el aula y evaluado conforme a los PDA.');
                                    setMockEvidenceFileUrl(selectedTaskSubject === 'sub-sci' ? 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600' : 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600');
                                    setMockEvidenceFileType('image');
                                    setIsLinkModalOpen(true);
                                  }}
                                  className="mt-1 px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-750 rounded-lg text-[9px] font-extrabold flex items-center gap-1 transition-all"
                                >
                                  Vincular Evidencia 🔗
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 align-top">
                            {sentAlert ? (
                              <div className="flex flex-col gap-2 p-3 bg-zinc-55 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-2xl max-w-md">
                                <div className="flex items-center justify-between text-[9px] text-zinc-400">
                                  <span className="flex items-center gap-1 text-[9px] font-bold">
                                    <Bell className="h-3 w-3 text-amber-500" />
                                    Aviso Enviado
                                  </span>
                                  <FormattedDate date={sentAlert.sent_at} className="text-[9px]" />
                                </div>
                                <p className="text-[10.5px] text-zinc-650 dark:text-zinc-350 leading-relaxed italic">
                                  "{sentAlert.message}"
                                </p>
                                <div className="flex items-center justify-between border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-1.5 mt-1">
                                  <span className="flex items-center gap-1">
                                    <span className={`h-1.5 w-1.5 rounded-full ${sentAlert.is_read ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                                    <span className="text-[9px] text-zinc-400 font-bold">{sentAlert.is_read ? 'Leído por tutor' : 'No leído aún'}</span>
                                  </span>
                                  <button
                                    onClick={() => {
                                      setNotifyingStudent(student);
                                      setIsNotifyModalOpen(true);
                                      setNotificationTemplate('late');
                                    }}
                                    className="text-[9px] font-black text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    Re-enviar Aviso
                                  </button>
                                </div>
                                {sentAlert.parent_reply && (
                                  <div className="bg-indigo-50/20 dark:bg-indigo-950/20 border border-indigo-100/35 dark:border-indigo-900/40 p-2 rounded-xl mt-1 text-[10.5px] text-zinc-700 dark:text-zinc-300">
                                    <strong className="text-indigo-650 dark:text-indigo-400">Tutor respondió: </strong>
                                    <span>"{sentAlert.parent_reply}"</span>
                                    <span className="block text-[8px] text-zinc-400 mt-0.5">
                                      <FormattedDate date={sentAlert.replied_at || ''} prefix="El " />
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setNotifyingStudent(student);
                                  setIsNotifyModalOpen(true);
                                  setNotificationTemplate('late');
                                }}
                                className="px-4.5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                              >
                                <Bell className="h-3.5 w-3.5" />
                                Notificar Tutor
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  }
                  {detailedStudents.filter(s => s.group_id === selectedTaskGroup).length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-zinc-400">
                        No hay alumnos registrados en este grupo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ----------------- DISEÑO Y PLANEACIÓN DE TAREAS NEM ----------------- */}
        {currentMenuTab === 'design' && (
          <div className="flex flex-col gap-6">
            
            {/* Header / Barra Superior de Filtros */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col gap-1.5 w-full md:w-72">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">Seleccionar Asignatura</label>
                <select
                  value={selectedDesignSubject}
                  onChange={(e) => {
                    setSelectedDesignSubject(e.target.value);
                    // Reset fields for new task
                    const pdas = PDA_CATALOG[e.target.value] || [];
                    setDesignSelectedPDA(pdas[0] || '');
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-bold"
                >
                  {subjects
                    .filter(sub => schedulesList.some(s => s.subjectId === sub.id && s.teacherId === currentTeacher.id))
                    .map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))
                  }
                </select>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto self-end md:self-auto">
                <button
                  onClick={() => {
                    setIsCreateFormOpen(true);
                    setIsCreateExamFormOpen(false);
                    // Initialize fields
                    setDesignQuestTitle('');
                    setDesignQuestDesc('');
                    setDesignQuestType('portfolio_submission');
                    setDesignQuestXp(100);
                    setDesignQuestCoins(15);
                    setDesignSelectedCampos(
                      selectedDesignSubject === 'sub-math' ? ['Saberes y Pensamiento Científico'] :
                      selectedDesignSubject === 'sub-sci' ? ['Saberes y Pensamiento Científico', 'Ética, Naturaleza y Sociedades'] :
                      selectedDesignSubject === 'sub-span' ? ['Lenguajes'] : []
                    );
                    setDesignSelectedEjes(['Pensamiento Crítico']);
                    const pdas = PDA_CATALOG[selectedDesignSubject] || [];
                    setDesignSelectedPDA(pdas[0] || '');
                    setDesignInstructions('');
                    setDesignAcceptedFormats(['image']);
                    setDesignQuizQuestions([
                      {
                        id: 'q1',
                        question: '¿Cuál es la representación decimal de la fracción 1/2?',
                        options: ['0.2', '0.5', '1.2', '0.25'],
                        correctAnswerIndex: 1,
                        explanation: 'Explicación: Dividir 1 entre 2 resulta en 0.5.'
                      }
                    ]);
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 transition-all hover:scale-102"
                >
                  <Plus className="h-4 w-4" />
                  Crear Tarea Escolar
                </button>
                <button
                  onClick={() => {
                    setIsCreateExamFormOpen(true);
                    setIsCreateFormOpen(false);
                    // Initialize fields for exam
                    setDesignExamTitle('');
                    setDesignExamStory('');
                    setDesignExamBossName(
                      selectedDesignSubject === 'sub-math' ? 'Fraccionator el Glotón 🍕' :
                      selectedDesignSubject === 'sub-sci' ? 'Eco-Devastador Tóxico ☣️' : 'Señor del Glifo y de las Runas 🔮'
                    );
                    setDesignExamBossHp(100);
                    setDesignExamBossMaxDmg(20);
                    setDesignExamXp(300);
                    setDesignExamCoins(50);
                    setDesignExamSelectedCampos(
                      selectedDesignSubject === 'sub-math' ? ['Saberes y Pensamiento Científico'] :
                      selectedDesignSubject === 'sub-sci' ? ['Saberes y Pensamiento Científico', 'Ética, Naturaleza y Sociedades'] :
                      selectedDesignSubject === 'sub-span' ? ['Lenguajes'] : []
                    );
                    setDesignExamSelectedEjes(['Pensamiento Crítico']);
                    const pdas = PDA_CATALOG[selectedDesignSubject] || [];
                    setDesignExamSelectedPDA(pdas[0] || '');
                    setDesignExamCustomLoot(
                      selectedDesignSubject === 'sub-math' ? 'corona_boss' :
                      selectedDesignSubject === 'sub-sci' ? 'mascara_gas' : 'baculo_runico'
                    );
                    setDesignExamStatBoost({ strength: 3, intelligence: 5, defense: 2 });
                    setDesignExamQuestions([
                      {
                        id: `eq-${Date.now()}-1`,
                        question: selectedDesignSubject === 'sub-math' 
                          ? '¿Qué fracción es equivalente a 2/4?' 
                          : selectedDesignSubject === 'sub-sci'
                            ? '¿Cuál de los siguientes es un gas de efecto invernadero?'
                            : '¿Cuál es la función principal de los adjetivos en un texto?',
                        options: selectedDesignSubject === 'sub-math'
                          ? ['1/3', '1/2', '3/4', '2/8']
                          : selectedDesignSubject === 'sub-sci'
                            ? ['Oxígeno', 'Dióxido de Carbono', 'Nitrógeno', 'Helio']
                            : ['Indicar acciones', 'Describir cualidades', 'Reemplazar nombres', 'Conectar oraciones'],
                        correctAnswerIndex: 1,
                        explanation: selectedDesignSubject === 'sub-math'
                          ? '¡Es correcto! 2/4 simplificado es 1/2 (dividimos numerador y denominador por 2).'
                          : selectedDesignSubject === 'sub-sci'
                            ? '¡Correcto! El dióxido de carbono retiene calor en la atmósfera.'
                            : '¡Perfecto! Los adjetivos califican y describen cualidades del sustantivo.'
                      }
                    ]);
                  }}
                  className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all hover:scale-102 border border-zinc-250 dark:border-zinc-800"
                >
                  <Plus className="h-4 w-4" />
                  Crear Examen
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {isCreateFormOpen ? (
                <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-6 text-left">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-blue-500" />
                      Nueva Tarea Escolar (Alineada a NEM)
                    </h3>
                    <button
                      onClick={() => setIsCreateFormOpen(false)}
                      className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Formulario */}
                  <div className="flex flex-col gap-5">
                    
                    {/* Fila 1: Título y Tipo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-bold">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Título de la Tarea</label>
                        <input
                          type="text"
                          value={designQuestTitle}
                          onChange={(e) => setDesignQuestTitle(e.target.value)}
                          placeholder="Ej. Fraccionando en Casa, La Leyenda del Jaguar..."
                          className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Tipo de Actividad</label>
                        <select
                          value={designQuestType}
                          onChange={(e) => setDesignQuestType(e.target.value as any)}
                          className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-bold"
                        >
                          <option value="portfolio_submission">Entrega de Evidencia (Portafolio)</option>
                          <option value="quiz">Cuestionario Autoevaluación (Quiz)</option>
                        </select>
                      </div>
                    </div>

                    {/* Fila 2: Descripción Corta */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Descripción / Misión Narrativa</label>
                      <textarea
                        rows={2}
                        value={designQuestDesc}
                        onChange={(e) => setDesignQuestDesc(e.target.value)}
                        placeholder="Ej. Describe de forma divertida o gamificada el objetivo de la actividad..."
                        className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 leading-relaxed font-medium"
                      />
                    </div>

                    {/* Fila 3: Recompensas de Gamificación */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Recompensa de Experiencia (XP)</label>
                        <input
                          type="number"
                          value={designQuestXp}
                          onChange={(e) => setDesignQuestXp(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 focus:outline-none focus:border-blue-500 font-black"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Recompensa de Monedas de Oro</label>
                        <input
                          type="number"
                          value={designQuestCoins}
                          onChange={(e) => setDesignQuestCoins(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-amber-500 focus:outline-none focus:border-blue-500 font-black"
                        />
                      </div>
                    </div>

                    {/* Fila 4: ALINEACIÓN NEM ESTRUCTURAL */}
                    <div className="p-5 bg-blue-50/20 dark:bg-blue-950/5 border border-blue-100/35 dark:border-blue-900/10 rounded-2xl flex flex-col gap-4">
                      <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-blue-100 dark:border-blue-900/20 pb-2">
                        <BookOpen className="h-4 w-4" />
                        Alineación Estructural NEM (Aplica a todo el grupo)
                      </span>

                      {/* Campos Formativos */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Campos Formativos (Multiselección)</label>
                        <div className="flex flex-wrap gap-1.5">
                          {camposFormativosOptions.map(campo => {
                            const isSelected = designSelectedCampos.includes(campo);
                            return (
                              <button
                                key={campo}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setDesignSelectedCampos(prev => prev.filter(c => c !== campo));
                                  } else {
                                    setDesignSelectedCampos(prev => [...prev, campo]);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                    : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-500'
                                }`}
                              >
                                {campo}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ejes Articuladores */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Ejes Articuladores</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {ejesArticuladoresList.map(eje => {
                            const isSelected = designSelectedEjes.includes(eje.name);
                            const EjeIcon = eje.icon;
                            return (
                              <button
                                key={eje.name}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setDesignSelectedEjes(prev => prev.filter(e => e !== eje.name));
                                  } else {
                                    setDesignSelectedEjes(prev => [...prev, eje.name]);
                                  }
                                }}
                                className={`p-2 rounded-xl text-[9px] font-bold transition-all border flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-zinc-950 border-zinc-950 text-white dark:bg-white dark:border-white dark:text-zinc-950 shadow-sm'
                                    : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-650 dark:text-zinc-300'
                                }`}
                              >
                                <span className={`p-1 rounded-lg ${isSelected ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-950' : eje.color}`}>
                                  <EjeIcon className="h-3.5 w-3.5" />
                                </span>
                                <span className="truncate">{eje.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* PDA Selector */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Proceso de Desarrollo de Aprendizaje (PDA) Evaluado</label>
                        <select
                          value={designSelectedPDA}
                          onChange={(e) => setDesignSelectedPDA(e.target.value)}
                          className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-semibold leading-relaxed"
                        >
                          {(PDA_CATALOG[selectedDesignSubject] || []).map((pda, idx) => (
                            <option key={idx} value={pda}>{pda}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Fila 5: Específico de tipo de actividad */}
                    {designQuestType === 'portfolio_submission' ? (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-850 flex flex-col gap-4">
                        <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Configuración de Entrega</span>
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Instrucciones de la Evidencia</label>
                          <textarea
                            rows={3}
                            value={designInstructions}
                            onChange={(e) => setDesignInstructions(e.target.value)}
                            placeholder="Ej. 1. Dibuja un pastel. 2. Divídelo en partes. 3. Sube la foto aquí."
                            className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 leading-relaxed font-medium"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase">Formatos Aceptados</label>
                          <div className="flex flex-wrap gap-4 text-xs font-semibold">
                            {['image', 'audio', 'video', 'pdf'].map(format => (
                              <label key={format} className="flex items-center gap-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300">
                                <input
                                  type="checkbox"
                                  checked={designAcceptedFormats.includes(format)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setDesignAcceptedFormats(prev => [...prev, format]);
                                    } else {
                                      setDesignAcceptedFormats(prev => prev.filter(f => f !== format));
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                                />
                                {format === 'image' ? 'Imagen / Foto' :
                                 format === 'audio' ? 'Audio / Nota de Voz' :
                                 format === 'video' ? 'Video' : 'Documento PDF'}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-850 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Preguntas del Cuestionario ({designQuizQuestions.length})</span>
                          <button
                            type="button"
                            onClick={() => {
                              setDesignQuizQuestions(prev => [
                                ...prev,
                                {
                                  id: `q-${Date.now()}-${Math.random()}`,
                                  question: '',
                                  options: ['', '', '', ''],
                                  correctAnswerIndex: 0,
                                  explanation: ''
                                }
                              ]);
                            }}
                            className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-250 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all"
                          >
                            <Plus className="h-3 w-3" />
                            Añadir Pregunta
                          </button>
                        </div>

                        <div className="flex flex-col gap-4 text-left">
                          {designQuizQuestions.map((q, qIdx) => (
                            <div key={q.id || qIdx} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-3 relative shadow-xs">
                              {designQuizQuestions.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDesignQuizQuestions(prev => prev.filter((_, idx) => idx !== qIdx));
                                  }}
                                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                              
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">Pregunta {qIdx + 1}</span>
                              <input
                                type="text"
                                value={q.question}
                                onChange={(e) => {
                                  const updated = [...designQuizQuestions];
                                  updated[qIdx].question = e.target.value;
                                  setDesignQuizQuestions(updated);
                                }}
                                placeholder="Escribe el enunciado de la pregunta..."
                                className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-semibold"
                              />

                              <div className="grid grid-cols-2 gap-2">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="flex flex-col gap-1">
                                    <label className="text-[9px] font-bold text-zinc-400">Opción {String.fromCharCode(65 + oIdx)}</label>
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) => {
                                        const updated = [...designQuizQuestions];
                                        updated[qIdx].options[oIdx] = e.target.value;
                                        setDesignQuizQuestions(updated);
                                      }}
                                      placeholder={`Opción ${String.fromCharCode(65 + oIdx)}`}
                                      className="text-[11px] p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-805 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-semibold"
                                    />
                                  </div>
                                ))}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-zinc-400 uppercase font-bold">Opción Correcta</label>
                                  <select
                                    value={q.correctAnswerIndex}
                                    onChange={(e) => {
                                      const updated = [...designQuizQuestions];
                                      updated[qIdx].correctAnswerIndex = Number(e.target.value);
                                      setDesignQuizQuestions(updated);
                                    }}
                                    className="text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-bold"
                                  >
                                    <option value={0}>Opción A</option>
                                    <option value={1}>Opción B</option>
                                    <option value={2}>Opción C</option>
                                    <option value={3}>Opción D</option>
                                  </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-zinc-400 uppercase font-bold">Explicación Constructiva (Gamificada)</label>
                                  <input
                                    type="text"
                                    value={q.explanation}
                                    onChange={(e) => {
                                      const updated = [...designQuizQuestions];
                                      updated[qIdx].explanation = e.target.value;
                                      setDesignQuizQuestions(updated);
                                    }}
                                    placeholder="Ej. ¡Excelente! Nos quedan 3/4 porque..."
                                    className="text-[11px] p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-medium"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones de Guardar/Cancelar */}
                  <div className="flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
                    <button
                      onClick={() => setIsCreateFormOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-550 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-950 text-xs font-bold transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        // Validación básica
                        if (!designQuestTitle.trim()) {
                          alert('Por favor introduce un título para la tarea.');
                          return;
                        }
                        if (designSelectedCampos.length === 0) {
                          alert('Por favor selecciona al menos un Campo Formativo de la NEM.');
                          return;
                        }
                        if (designSelectedEjes.length === 0) {
                          alert('Por favor selecciona al menos un Eje Articulador de la NEM.');
                          return;
                        }

                        // Construir contenido
                        const content = designQuestType === 'portfolio_submission'
                          ? { instructions: designInstructions, acceptedFormats: designAcceptedFormats }
                          : { questions: designQuizQuestions };

                        // Buscar si existe misión para este subject
                        const missionForSubject = missions.find(m => m.subject_id === selectedDesignSubject);
                        const mId = missionForSubject?.id || `mis-${selectedDesignSubject}-${Date.now()}`;

                        // Invocar saveQuest
                        saveQuest(selectedDesignSubject, {
                          id: `q-${Date.now()}`,
                          mission_id: mId,
                          title: designQuestTitle,
                          description: designQuestDesc,
                          type: designQuestType,
                          sequence_order: 1, // Se ajusta en el context
                          xp_reward: designQuestXp,
                          coins_reward: designQuestCoins,
                          content: content as any,
                          campos_formativos: designSelectedCampos,
                          ejes_articuladores: designSelectedEjes,
                          pdas: designSelectedPDA ? [designSelectedPDA] : []
                        });

                        alert('¡Tarea escolar creada exitosamente y alineada con las normas de la NEM!');
                        setIsCreateFormOpen(false);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-500/10 flex items-center gap-1.5 transition-all"
                    >
                      <Save className="h-4 w-4" />
                      Guardar y Publicar Tarea
                    </button>
                  </div>
                </div>
              ) : isCreateExamFormOpen ? (
                <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-6 text-left">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600 animate-pulse" />
                      Nuevo Examen Gamificado: Batalla de Jefe (NEM + RPG)
                    </h3>
                    <button
                      onClick={() => setIsCreateExamFormOpen(false)}
                      className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Formulario */}
                  <div className="flex flex-col gap-5">
                    
                    {/* Fila 1: Título y Nombre del Jefe */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-bold">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Título del Examen / Misión</label>
                        <input
                          type="text"
                          value={designExamTitle}
                          onChange={(e) => setDesignExamTitle(e.target.value)}
                          placeholder="Ej. Batalla Final en el Castillo de las Fracciones..."
                          className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Nombre del Jefe (Boss)</label>
                        <input
                          type="text"
                          value={designExamBossName}
                          onChange={(e) => setDesignExamBossName(e.target.value)}
                          placeholder="Ej. Fraccionator el Glotón"
                          className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-semibold"
                        />
                      </div>
                    </div>

                    {/* Fila 2: Historia Lore / Story Intro */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase">Narrativa / Historia de Introducción al Jefe (Lore)</label>
                      <textarea
                        rows={2}
                        value={designExamStory}
                        onChange={(e) => setDesignExamStory(e.target.value)}
                        placeholder="Ej. El gran Fraccionator ha robado la comida del reino. ¡Resuelve los problemas para debilitar su escudo y derrotarlo!..."
                        className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 leading-relaxed font-medium"
                      />
                    </div>

                    {/* Fila 3: Configuración del Boss y Recompensas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase">Puntos de Vida del Jefe (HP)</label>
                        <input
                          type="number"
                          value={designExamBossHp}
                          onChange={(e) => setDesignExamBossHp(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-red-650 focus:outline-none focus:border-blue-500 font-black"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase">Daño Máximo del Jefe</label>
                        <input
                          type="number"
                          value={designExamBossMaxDmg}
                          onChange={(e) => setDesignExamBossMaxDmg(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-rose-500 focus:outline-none focus:border-blue-500 font-black"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase">Recompensa XP</label>
                        <input
                          type="number"
                          value={designExamXp}
                          onChange={(e) => setDesignExamXp(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-blue-650 dark:text-blue-400 focus:outline-none focus:border-blue-500 font-black"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-zinc-400 uppercase">Recompensa Oro</label>
                        <input
                          type="number"
                          value={designExamCoins}
                          onChange={(e) => setDesignExamCoins(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-amber-500 focus:outline-none focus:border-blue-500 font-black"
                        />
                      </div>
                    </div>

                    {/* Fila 4: Efectos RPG y Recompensas */}
                    <div className="p-4 bg-purple-50/20 dark:bg-purple-950/10 border border-purple-100/35 dark:border-purple-900/20 rounded-2xl flex flex-col gap-3">
                      <span className="text-[10px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-purple-150 dark:border-purple-900/30 pb-2">
                        <Sparkles className="h-4 w-4" />
                        Recompensas de Combate (Al derrotar al Jefe)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* RPG Stat Boosts */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase">Incremento de Stats RPG de Personaje (+)</label>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] text-red-500 font-bold text-center">Fuerza 💪</span>
                              <input
                                type="number"
                                value={designExamStatBoost.strength}
                                onChange={(e) => setDesignExamStatBoost(prev => ({ ...prev, strength: Number(e.target.value) }))}
                                className="w-full text-center text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] text-blue-500 font-bold text-center">Intelecto 🔮</span>
                              <input
                                type="number"
                                value={designExamStatBoost.intelligence}
                                onChange={(e) => setDesignExamStatBoost(prev => ({ ...prev, intelligence: Number(e.target.value) }))}
                                className="w-full text-center text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] text-emerald-500 font-bold text-center">Defensa 🛡️</span>
                              <input
                                type="number"
                                value={designExamStatBoost.defense}
                                onChange={(e) => setDesignExamStatBoost(prev => ({ ...prev, defense: Number(e.target.value) }))}
                                className="w-full text-center text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 font-bold"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Custom Loot Item Selector & Pet Restoration */}
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase">Cosmético de Avatar Exclusivo Desbloqueable</label>
                            <select
                              value={designExamCustomLoot}
                              onChange={(e) => setDesignExamCustomLoot(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-semibold"
                            >
                              <option value="corona_boss">Corona del Conquistador 👑</option>
                              <option value="mascara_gas">Máscara de Gas del Ecosistema ☣️</option>
                              <option value="baculo_runico">Báculo Sagrado de Runas 🔮</option>
                              <option value="capa_leyenda">Capa de la Leyenda Áurea 🧥</option>
                              <option value="shield_legend">Escudo del Destino 🛡️</option>
                            </select>
                          </div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 italic bg-purple-50/50 dark:bg-purple-950/20 p-2.5 rounded-xl border border-purple-100/30 font-semibold">
                            🌟 Derrotar a este jefe también <strong>restaurará al 100%</strong> la energía, salud y felicidad de la mascota del alumno.
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Fila 5: ALINEACIÓN NEM ESTRUCTURAL */}
                    <div className="p-5 bg-blue-50/20 dark:bg-blue-950/5 border border-blue-100/35 dark:border-blue-900/10 rounded-2xl flex flex-col gap-4">
                      <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-blue-100 dark:border-blue-900/20 pb-2">
                        <BookOpen className="h-4 w-4" />
                        Alineación Estructural NEM
                      </span>

                      {/* Campos Formativos */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Campos Formativos (Multiselección)</label>
                        <div className="flex flex-wrap gap-1.5">
                          {camposFormativosOptions.map(campo => {
                            const isSelected = designExamSelectedCampos.includes(campo);
                            return (
                              <button
                                key={campo}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setDesignExamSelectedCampos(prev => prev.filter(c => c !== campo));
                                  } else {
                                    setDesignExamSelectedCampos(prev => [...prev, campo]);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                    : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-500'
                                }`}
                              >
                                {campo}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ejes Articuladores */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Ejes Articuladores</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                          {ejesArticuladoresList.map(eje => {
                            const isSelected = designExamSelectedEjes.includes(eje.name);
                            const EjeIcon = eje.icon;
                            return (
                              <button
                                key={eje.name}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setDesignExamSelectedEjes(prev => prev.filter(e => e !== eje.name));
                                  } else {
                                    setDesignExamSelectedEjes(prev => [...prev, eje.name]);
                                  }
                                }}
                                className={`p-2 rounded-xl text-[9px] font-bold transition-all border flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-zinc-950 border-zinc-950 text-white dark:bg-white dark:border-white dark:text-zinc-950 shadow-sm'
                                    : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-50 text-zinc-650 dark:text-zinc-300'
                                }`}
                              >
                                <span className={`p-1 rounded-lg ${isSelected ? 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-950' : eje.color}`}>
                                  <EjeIcon className="h-3.5 w-3.5" />
                                </span>
                                <span className="truncate">{eje.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* PDA Selector */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Proceso de Desarrollo de Aprendizaje (PDA) Evaluado</label>
                        <select
                          value={designExamSelectedPDA}
                          onChange={(e) => setDesignExamSelectedPDA(e.target.value)}
                          className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-semibold leading-relaxed"
                        >
                          {(PDA_CATALOG[selectedDesignSubject] || []).map((pda, idx) => (
                            <option key={idx} value={pda}>{pda}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Fila 6: PREGUNTAS DEL EXAMEN */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-zinc-100 dark:border-zinc-850 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Preguntas del Combate ({designExamQuestions.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setDesignExamQuestions(prev => [
                              ...prev,
                              {
                                id: `eq-${Date.now()}-${Math.random()}`,
                                question: '',
                                options: ['', '', '', ''],
                                correctAnswerIndex: 0,
                                explanation: ''
                              }
                            ]);
                          }}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-750 text-white rounded-lg text-[10px] font-black flex items-center gap-1 transition-all shadow-sm"
                        >
                          <Plus className="h-3 w-3" />
                          Añadir Pregunta Examen
                        </button>
                      </div>

                      <div className="flex flex-col gap-4 text-left">
                        {designExamQuestions.map((q, qIdx) => (
                          <div key={q.id || qIdx} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-3 relative shadow-xs">
                            {designExamQuestions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDesignExamQuestions(prev => prev.filter((_, idx) => idx !== qIdx));
                                }}
                                className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">Pregunta {qIdx + 1}</span>
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => {
                                const updated = [...designExamQuestions];
                                updated[qIdx].question = e.target.value;
                                setDesignExamQuestions(updated);
                              }}
                              placeholder="Escribe el enunciado de la pregunta de examen..."
                              className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-semibold"
                            />

                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt, oIdx) => (
                                <div key={oIdx} className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-zinc-400">Opción {String.fromCharCode(65 + oIdx)}</label>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => {
                                      const updated = [...designExamQuestions];
                                      updated[qIdx].options[oIdx] = e.target.value;
                                      setDesignExamQuestions(updated);
                                    }}
                                    placeholder={`Opción ${String.fromCharCode(65 + oIdx)}`}
                                    className="text-[11px] p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-semibold"
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5">
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-zinc-400 uppercase font-bold">Opción Correcta</label>
                                <select
                                  value={q.correctAnswerIndex}
                                  onChange={(e) => {
                                    const updated = [...designExamQuestions];
                                    updated[qIdx].correctAnswerIndex = Number(e.target.value);
                                    setDesignExamQuestions(updated);
                                  }}
                                  className="text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-bold"
                                >
                                  <option value={0}>Opción A</option>
                                  <option value={1}>Opción B</option>
                                  <option value={2}>Opción C</option>
                                  <option value={3}>Opción D</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-bold text-zinc-400 uppercase font-bold">Explicación Constructiva / Feedback Inmediato</label>
                                <input
                                  type="text"
                                  value={q.explanation}
                                  onChange={(e) => {
                                    const updated = [...designExamQuestions];
                                    updated[qIdx].explanation = e.target.value;
                                    setDesignExamQuestions(updated);
                                  }}
                                  placeholder="Ej. ¡Correcto! El divisor es el término que divide..."
                                  className="text-[11px] p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-medium"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Acciones de Guardar/Cancelar */}
                  <div className="flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-2">
                    <button
                      onClick={() => setIsCreateExamFormOpen(false)}
                      className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-555 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-955 text-xs font-bold transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        // Validación básica
                        if (!designExamTitle.trim()) {
                          alert('Por favor introduce un título para el examen.');
                          return;
                        }
                        if (!designExamBossName.trim()) {
                          alert('Por favor introduce un nombre para el Jefe.');
                          return;
                        }
                        if (designExamSelectedCampos.length === 0) {
                          alert('Por favor selecciona al menos un Campo Formativo de la NEM.');
                          return;
                        }
                        if (designExamSelectedEjes.length === 0) {
                          alert('Por favor selecciona al menos un Eje Articulador de la NEM.');
                          return;
                        }

                        // Validar que todas las preguntas tengan contenido
                        for (let i = 0; i < designExamQuestions.length; i++) {
                          const q = designExamQuestions[i];
                          if (!q.question.trim()) {
                            alert(`Por favor llena la pregunta ${i + 1}.`);
                            return;
                          }
                          if (q.options.some(o => !o.trim())) {
                            alert(`Por favor llena todas las opciones de la pregunta ${i + 1}.`);
                            return;
                          }
                        }

                        // Construir contenido del examen
                        const content = {
                          questions: designExamQuestions,
                          bossName: designExamBossName,
                          bossHp: designExamBossHp,
                          bossMaxDmg: designExamBossMaxDmg,
                          storyIntro: designExamStory,
                          statBoost: designExamStatBoost,
                          customLoot: designExamCustomLoot
                        };

                        // Buscar si existe misión para este subject
                        const missionForSubject = missions.find(m => m.subject_id === selectedDesignSubject);
                        const mId = missionForSubject?.id || `mis-${selectedDesignSubject}-${Date.now()}`;

                        // Invocar saveQuest
                        saveQuest(selectedDesignSubject, {
                          id: `q-${Date.now()}`,
                          mission_id: mId,
                          title: designExamTitle,
                          description: `¡Combate de Jefe contra ${designExamBossName}!`,
                          type: 'exam',
                          sequence_order: 1, // Se ajusta en el context
                          xp_reward: designExamXp,
                          coins_reward: designExamCoins,
                          content: content as any,
                          campos_formativos: designExamSelectedCampos,
                          ejes_articuladores: designExamSelectedEjes,
                          pdas: designExamSelectedPDA ? [designExamSelectedPDA] : []
                        });

                        alert('¡Examen con batalla de jefe creado y guardado exitosamente!');
                        setIsCreateExamFormOpen(false);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-md shadow-purple-500/10 flex items-center gap-1.5 transition-all"
                    >
                      <Save className="h-4 w-4" />
                      Guardar y Publicar Examen (Jefe Boss)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-4 bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/50 dark:border-zinc-800/40 rounded-3xl p-6 shadow-sm flex flex-col gap-4 text-left">
                  <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-zinc-200/40 pb-2 font-black">
                    <Brain className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
                    Principios de Planeación NEM
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                    De acuerdo con el Plan de Estudio de la <strong>Nueva Escuela Mexicana (NEM)</strong>:
                  </p>
                  <ul className="text-xs text-zinc-650 dark:text-zinc-350 flex flex-col gap-2.5 list-disc pl-4 leading-relaxed font-medium">
                    <li>
                      <strong>Clase-materia integrada</strong>: Los contenidos académicos (PDA) deben estar vinculados estructuralmente a campos formativos.
                    </li>
                    <li>
                      <strong>Ejes Articuladores transversales</strong>: Permiten conectar los saberes disciplinares con la realidad comunitaria de los alumnos.
                    </li>
                    <li>
                      <strong>Eficiencia en Evaluación</strong>: Alinear la tarea de forma grupal evita tener que reclasificar el PDA para cada alumno individual al momento de calificar su portafolio.
                    </li>
                  </ul>
                  <div className="mt-2 p-3.5 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/35 rounded-2xl text-[11px] font-semibold text-blue-700 dark:text-blue-300 leading-relaxed">
                    💡 <strong>Consejo del Portal</strong>: Selecciona la materia en la barra superior para ver las tareas existentes. Puedes editar o crear nuevas tareas con recompensas en XP vinculadas.
                  </div>
                </div>
              )}

              {/* LISTADO DE TAREAS EXISTENTES (lg:col-span-8 o lg:col-span-12) */}
              <div className={`${(isCreateFormOpen || isCreateExamFormOpen) ? 'lg:col-span-4' : 'lg:col-span-8'} flex flex-col gap-4 w-full`}>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-6 shadow-sm flex flex-col gap-4 w-full">
                  <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 pb-2 flex items-center justify-between">
                    <span>Tareas Creadas en Asignatura</span>
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-black">
                      {missions.filter(m => m.subject_id === selectedDesignSubject).flatMap(m => m.quests || []).length}
                    </span>
                  </span>

                  <div className="flex flex-col gap-3.5 max-h-[600px] overflow-y-auto pr-1">
                    {missions
                      .filter(m => m.subject_id === selectedDesignSubject)
                      .flatMap(m => m.quests || [])
                      .map((quest) => (
                        <div
                          key={quest.id}
                          className="p-4 rounded-2xl border border-zinc-200/70 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-xs flex flex-col gap-3 hover:border-zinc-300 transition-all text-left"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded font-black">
                                {quest.type === 'portfolio_submission' 
                                  ? 'Evidencia de Portafolio' 
                                  : quest.type === 'exam' 
                                    ? 'Batalla de Jefe (Examen) ⚔️' 
                                    : 'Quiz de Autoevaluación'}
                              </span>
                              <h5 className="text-xs font-black text-zinc-900 dark:text-white mt-1">
                                {quest.title}
                              </h5>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black">
                              <span className="text-blue-600 dark:text-blue-400 font-bold">+{quest.xp_reward} XP</span>
                              <span className="text-amber-500 font-bold">+{quest.coins_reward} oro</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                            {quest.description || 'Sin descripción ingresada.'}
                          </p>

                          {/* NEM Badges en tarjeta */}
                          <div className="flex flex-col gap-2 border-t border-zinc-100 dark:border-zinc-800/60 pt-2.5">
                            <div className="flex flex-wrap gap-1">
                              {(quest.campos_formativos || []).map(c => (
                                <span key={c} className="text-[9px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 px-2 py-0.5 rounded font-black">
                                  {c}
                                </span>
                              ))}
                              {(quest.ejes_articuladores || []).map(e => (
                                <span key={e} className="text-[9px] bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-300 px-2 py-0.5 rounded font-bold">
                                  {e}
                                </span>
                              ))}
                            </div>
                            {quest.pdas && quest.pdas.length > 0 && (
                              <div className="flex items-start gap-1.5 text-[9.5px] text-zinc-500 leading-relaxed font-medium">
                                <Bookmark className="h-3 w-3 text-indigo-500 flex-shrink-0 mt-0.5" />
                                <span>{quest.pdas[0]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    }
                    {missions.filter(m => m.subject_id === selectedDesignSubject).flatMap(m => m.quests || []).length === 0 && (
                      <div className="py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 text-center text-zinc-400">
                        <Plus className="h-8 w-8 text-zinc-300" />
                        <span className="text-xs font-semibold">No hay tareas escolares registradas para esta materia.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
        {currentMenuTab === 'planning' && (
          <PlanningTab
            currentTeacher={currentTeacher}
            subjects={subjects}
            schedulesList={schedulesList}
            groupsList={groupsList}
          />
        )}
      </main>

      {/* ----------------- MODAL DE VINCULAR EVIDENCIA ----------------- */}
      {isLinkModalOpen && linkingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 text-left">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-blue-500 animate-pulse" />
                Vincular Evidencia a Tarea
              </h3>
              <button 
                onClick={() => setIsLinkModalOpen(false)} 
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850 flex flex-col gap-1 text-xs">
              <p className="text-zinc-650 dark:text-zinc-350">
                Alumno: <strong className="text-zinc-900 dark:text-white">{linkingStudent.first_name} {linkingStudent.last_name_1}</strong>
              </p>
              <p className="text-zinc-650 dark:text-zinc-350">
                Asignatura: <strong className="text-zinc-900 dark:text-white">{subjects.find(s => s.id === selectedTaskSubject)?.name}</strong>
              </p>
              <p className="text-zinc-650 dark:text-zinc-350">
                Tarea Objetivo (Quest): <strong className="text-zinc-900 dark:text-white">{missions.flatMap(m => m.quests || []).find(q => q.id === selectedTaskQuest)?.title}</strong>
              </p>
            </div>

            {/* Listado de evidencias sin vincular */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-4">
              <div>
                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-2">Opción A: Vincular Evidencia General del Alumno</h4>
                {(() => {
                  const unlinkedItems = portfolioItems.filter(item => 
                    item.student_id === linkingStudent.id &&
                    item.subject_id === selectedTaskSubject &&
                    (!item.quest_id || item.quest_id === '')
                  );

                  if (unlinkedItems.length === 0) {
                    return (
                      <p className="text-xs text-zinc-500 italic p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-850">
                        El alumno no tiene archivos ni notas de voz subidas sin vincular en esta materia.
                      </p>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {unlinkedItems.map(item => (
                        <div key={item.id} className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col justify-between gap-3 shadow-xs">
                          <div>
                            <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded font-black capitalize">
                              {item.file_type === 'image' ? 'Imagen' : item.file_type === 'audio' ? 'Audio' : 'Documento'}
                            </span>
                            <h5 className="text-xs font-bold text-zinc-900 dark:text-white mt-1">{item.title}</h5>
                            <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5">{item.description}</p>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              linkPortfolioItemToQuest(item.id, selectedTaskQuest);
                              setIsLinkModalOpen(false);
                              alert('¡Evidencia vinculada exitosamente a la tarea!');
                            }}
                            className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all"
                          >
                            Vincular a esta Tarea 🔗
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Formulario de carga de Mock (en aula / offline) */}
              <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-4">
                <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-wider mb-3">Opción B: Registrar Evidencia Presentada Físicamente (En el Aula)</h4>
                <div className="bg-zinc-50/50 dark:bg-zinc-950/20 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-4 text-xs font-bold text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-zinc-400 uppercase font-bold">Título de la Evidencia</label>
                    <input
                      type="text"
                      value={mockEvidenceTitle}
                      onChange={(e) => setMockEvidenceTitle(e.target.value)}
                      placeholder="Ej. Proyecto Físico Entregado en Clase"
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-zinc-400 uppercase font-bold">Detalles / Anotación del Profesor</label>
                    <textarea
                      rows={2}
                      value={mockEvidenceDesc}
                      onChange={(e) => setMockEvidenceDesc(e.target.value)}
                      placeholder="Indica observaciones breves sobre lo entregado físicamente..."
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-blue-500 leading-relaxed font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-bold">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-zinc-400 uppercase font-bold">Tipo de Entrega</label>
                      <select
                        value={mockEvidenceFileType}
                        onChange={(e) => setMockEvidenceFileType(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-blue-500 font-bold"
                      >
                        <option value="image">Imagen / Fotografía</option>
                        <option value="pdf">Documento Escrito / Libreta</option>
                        <option value="audio">Audio / Exposición Oral</option>
                        <option value="video">Demostración / Video</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-zinc-400 uppercase font-bold">Imagen de Evidencia (Simulada)</label>
                      <input
                        type="text"
                        value={mockEvidenceFileUrl}
                        onChange={(e) => setMockEvidenceFileUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-xs p-2.5 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!mockEvidenceTitle.trim()) {
                        alert('Por favor introduce un título.');
                        return;
                      }
                      submitPortfolioItemOnBehalf(
                        linkingStudent.id,
                        mockEvidenceTitle,
                        mockEvidenceDesc,
                        mockEvidenceFileUrl || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600',
                        mockEvidenceFileType,
                        'Evidencia registrada por el docente en aula.',
                        selectedTaskQuest,
                        selectedTaskSubject
                      );
                      setIsLinkModalOpen(false);
                      alert(`¡Evidencia física creada y vinculada exitosamente para ${linkingStudent.first_name}!`);
                    }}
                    className="py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    Registrar y Vincular en Aula 📝
                  </button>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-250 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL DE NOTIFICACIÓN A TUTORES ----------------- */}
      {isNotifyModalOpen && notifyingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 text-left">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
              <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500 animate-bounce" />
                Enviar Alerta Escolar a Tutor
              </h3>
              <button 
                onClick={() => setIsNotifyModalOpen(false)} 
                className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <p className="text-xs text-zinc-650 dark:text-zinc-350">
                Estudiante: <strong>{notifyingStudent.first_name} {notifyingStudent.last_name_1}</strong><br />
                Asignatura: <strong>{subjects.find(s => s.id === selectedTaskSubject)?.name}</strong>
              </p>
            </div>

            {/* Selector de Plantillas */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Seleccionar Plantilla de Aviso</label>
              <div className="grid grid-cols-3 gap-2">
                {(['late', 'quality', 'conduct'] as const).map((temp) => {
                  const isActive = notificationTemplate === temp;
                  const label = 
                    temp === 'late' ? 'Tarea Atrasada' : 
                    temp === 'quality' ? 'Requiere Apoyo' : 'Incidencia Conducta';
                  
                  const activeColor = 
                    temp === 'late' ? 'bg-amber-600 border-amber-600 text-white' :
                    temp === 'quality' ? 'bg-rose-600 border-rose-600 text-white' :
                    'bg-blue-600 border-blue-600 text-white';

                  return (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setNotificationTemplate(temp)}
                      className={`py-2 px-3 rounded-xl text-[10px] font-extrabold border transition-all text-center ${
                        isActive ? activeColor : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 text-zinc-500 hover:text-zinc-750'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Campo de Mensaje Personalizable */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Cuerpo del Mensaje (Editable)</label>
              <textarea
                rows={5}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 font-sans leading-relaxed resize-none"
                placeholder="Escribe el aviso personalizado..."
              />
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                onClick={() => setIsNotifyModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-250 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  sendParentMessage({
                    parent_id: 'usr-parent-1', // Enviar al único padre de simulación
                    student_id: notifyingStudent.id,
                    student_name: `${notifyingStudent.first_name} ${notifyingStudent.last_name_1}`,
                    teacher_id: currentTeacher.id,
                    teacher_name: `${currentTeacher.first_name} ${currentTeacher.last_name}`,
                    subject_id: selectedTaskSubject,
                    subject_name: subjects.find(s => s.id === selectedTaskSubject)?.name || 'Materia',
                    quest_id: selectedTaskQuest || undefined,
                    quest_title: notifyingQuestTitle || undefined,
                    message: customMessage
                  });
                  setIsNotifyModalOpen(false);
                  alert(`¡Aviso enviado exitosamente al tutor de ${notifyingStudent.first_name}!`);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/10 transition-all"
              >
                Enviar Notificación
              </button>
            </div>
          </div>
        </div>
      )}

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
