"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, Mic, MicOff, X, Download, Shield, Heart, 
  Flame, HelpCircle, Users, Activity, Check, CheckSquare, 
  Square, RefreshCw, FileText
} from 'lucide-react';
import { DetailedStudent, UserProfile } from '@/types';

// ==========================================
// PROTOCOLOS DE SEGURIDAD NEM - CONFIGURACIÓN
// ==========================================

interface NemProtocol {
  key: 'accident' | 'bullying' | 'civil_defense' | 'emotional_crisis' | 'general';
  name: string;
  officialReference: string;
  severity: 'baja' | 'media' | 'critica';
  immediateActions: string[];
  notes: string;
}

const NEM_PROTOCOLS: Record<string, NemProtocol> = {
  accident: {
    key: 'accident',
    name: 'Protocolo de Accidentes / Emergencia Médica Escolar',
    officialReference: 'Lineamiento SEP 2024: Prevención y Atención de Accidentes y Emergencias Médicas en el Entorno Escolar.',
    severity: 'critica',
    immediateActions: [
      'Evaluar el estado del alumno (conciencia y signos vitales).',
      'Llamar al servicio médico escolar o de emergencias (911).',
      'Inmovilizar la zona afectada (no mover si se sospecha lesión cervical).',
      'Notificar de inmediato a los padres o tutores del alumno.',
      'Trasladar al centro médico más cercano si es necesario.',
      'Elaborar el acta de hechos administrativos y registrar en bitácora.'
    ],
    notes: 'Priorizar siempre la integridad del alumno antes de cualquier trámite administrativo. Mantener la calma del grupo.'
  },
  bullying: {
    key: 'bullying',
    name: 'Protocolo de Convivencia y Prevención de Acoso Escolar (Bullying)',
    officialReference: 'Acuerdo 716/NEM: Protocolo Nacional para la Prevención, Detección y Actuación en casos de Abuso, Acoso Escolar y Maltrato.',
    severity: 'media',
    immediateActions: [
      'Intervenir de inmediato para detener la agresión física o verbal.',
      'Separar a los alumnos involucrados y trasladar a espacios neutrales.',
      'Escuchar de forma individual y respetuosa las versiones de los hechos.',
      'Establecer medidas de protección inmediata para la víctima.',
      'Citar a los tutores de ambos alumnos por separado.',
      'Registrar el incidente en la Bitácora de Convivencia Escolar NEM.'
    ],
    notes: 'No confrontar a los alumnos involucrados ni revictimizar. Fomentar la mediación y reparación del daño.'
  },
  civil_defense: {
    key: 'civil_defense',
    name: 'Protocolo de Protección Civil y Gestión de Riesgos Ambientales',
    officialReference: 'Guía de Autoprotección Escolar: Plan de Emergencia y Simulacros en Planteles Educativos de Educación Básica.',
    severity: 'critica',
    immediateActions: [
      'Iniciar la evacuación ordenada del edificio hacia el punto de reunión.',
      'Suspender el suministro de servicios públicos (corte de gas, electricidad, agua).',
      'Llamar a bomberos o protección civil municipal (911).',
      'Realizar el pase de lista de los alumnos en el punto de reunión.',
      'Prestar primeros auxilios a personas lesionadas o con crisis nerviosa.',
      'Esperar indicaciones oficiales para el reingreso al inmueble.'
    ],
    notes: 'Siga la regla: No corro, No grito, No empujo. Mantenga los accesos libres de obstáculos.'
  },
  emotional_crisis: {
    key: 'emotional_crisis',
    name: 'Protocolo de Apoyo Socioemocional y Contención en Salud Mental',
    officialReference: 'Manual NEM: Herramientas de Apoyo Socioemocional y Salud Mental en el Aula Post-Pandemia.',
    severity: 'media',
    immediateActions: [
      'Retirar al alumno de forma discreta del aula hacia un sitio tranquilo.',
      'Brindar contención emocional mediante respiración guiada.',
      'Escuchar de forma activa y empática sin juzgar.',
      'Verificar si el alumno cuenta con medicamentos prescritos.',
      'Llamar al departamento de psicología escolar o dirección.',
      'Contactar a los padres para canalización médica/psicológica.'
    ],
    notes: 'Mantener un tono de voz suave y pausado. Evitar aglomeraciones de personas alrededor del alumno.'
  },
  general: {
    key: 'general',
    name: 'Protocolo General de Atención a Incidencias Escolares',
    officialReference: 'Reglamento General de Operación de Centros Escolares y Lineamientos NEM.',
    severity: 'baja',
    immediateActions: [
      'Registrar la descripción del reporte.',
      'Evaluar si requiere intervención de coordinación.',
      'Hacer seguimiento con los alumnos o áreas correspondientes.'
    ],
    notes: 'Documentar el hecho para el expediente escolar del alumno.'
  }
};

// ==========================================
// PRESETS DE VOZ PARA PRUEBAS RÁPIDAS
// ==========================================

const VOICE_PRESETS = [
  {
    icon: '🏥',
    title: 'Fractura en Patio',
    text: 'Un alumno de primaria se cayó jugando fútbol en la cancha de concreto y parece tener una fractura en el brazo izquierdo, está llorando del dolor.'
  },
  {
    icon: '⚔️',
    title: 'Pelea Escolar',
    text: 'Dos estudiantes de secundaria se están golpeando en los pasillos de la escuela tras un altercado verbal y empujones cerca de los baños.'
  },
  {
    icon: '☣️',
    title: 'Fuga de Gas',
    text: 'Se percibe un fuerte olor a gas proveniente de la cocina y el laboratorio de ciencias y el conserje sospecha de una válvula abierta.'
  },
  {
    icon: '🧠',
    title: 'Crisis de Ansiedad',
    text: 'Una alumna de preparatoria presenta una crisis de pánico grave en el salón de clases, está hiperventilando, tiembla y no puede respirar.'
  }
];

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTeacher: UserProfile;
  detailedStudents: DetailedStudent[];
}

export function EmergencyModal({ isOpen, onClose, currentTeacher, detailedStudents }: EmergencyModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  
  // --- Estados de Formulario Generado ---
  const [activeProtocol, setActiveProtocol] = useState<NemProtocol | null>(null);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [severityLevel, setSeverityLevel] = useState<'baja' | 'media' | 'critica'>('baja');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [completedActions, setCompletedActions] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isFormGenerated, setIsFormGenerated] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Inicializar Web Speech API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setSpeechSupported(false);
        return;
      }
      
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'es-MX';
      rec.interimResults = false;
      
      rec.onstart = () => {
        setIsListening(true);
      };
      
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscriptText(text);
        processEmergencyText(text);
      };
      
      rec.onerror = (event: any) => {
        console.error("Error en reconocimiento de voz", event.error);
        setIsListening(false);
      };
      
      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Cerrar y limpiar al desactivar modal
  useEffect(() => {
    if (!isOpen) {
      resetAll();
    }
  }, [isOpen]);

  const resetAll = () => {
    setTranscriptText('');
    setActiveProtocol(null);
    setIncidentTitle('');
    setSeverityLevel('baja');
    setSelectedStudentId('');
    setCompletedActions([]);
    setAdditionalNotes('');
    setIsFormGenerated(false);
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  // Activar Micrófono
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta control de voz, por favor escribe la emergencia o usa un preset.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscriptText('');
      setIsFormGenerated(false);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("No se pudo iniciar reconocimiento", e);
      }
    }
  };

  // --- Analizador de Emergencia Escolar (NLP Local) ---
  const processEmergencyText = (text: string) => {
    if (!text.trim()) return;

    // Normalizar texto
    const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    let protocolKey: keyof typeof NEM_PROTOCOLS = 'general';
    let title = 'Incidencia Escolar';
    let severity: 'baja' | 'media' | 'critica' = 'baja';

    // 1. Accidentes / Médica
    if (
      normalized.includes('caida') || 
      normalized.includes('caer') || 
      normalized.includes('fractur') || 
      normalized.includes('golpe') || 
      normalized.includes('sangr') || 
      normalized.includes('desmay') || 
      normalized.includes('accidente') || 
      normalized.includes('enfermo') || 
      normalized.includes('lesion') || 
      normalized.includes('herid') ||
      normalized.includes('duele') ||
      normalized.includes('dolor')
    ) {
      protocolKey = 'accident';
      title = 'Reporte de Emergencia Médica por Accidente';
      severity = 'critica';
    }
    // 2. Convivencia / Bullying
    else if (
      normalized.includes('pelea') || 
      normalized.includes('pelear') || 
      normalized.includes('golpeo') || 
      normalized.includes('acoso') || 
      normalized.includes('bullying') || 
      normalized.includes('robo') || 
      normalized.includes('insult') || 
      normalized.includes('empuj') || 
      normalized.includes('grita') || 
      normalized.includes('conflict') ||
      normalized.includes('pelean')
    ) {
      protocolKey = 'bullying';
      title = 'Reporte de Conflicto e Incumplimiento de Convivencia';
      severity = 'media';
    }
    // 3. Protección Civil / Ambiental
    else if (
      normalized.includes('gas') || 
      normalized.includes('fuego') || 
      normalized.includes('incendio') || 
      normalized.includes('sismo') || 
      normalized.includes('temblor') || 
      normalized.includes('inundacion') || 
      normalized.includes('humo') || 
      normalized.includes('explosi') || 
      normalized.includes('corto') || 
      normalized.includes('electri') || 
      normalized.includes('fuga')
    ) {
      protocolKey = 'civil_defense';
      title = 'Reporte de Emergencia e Incidencia de Protección Civil';
      severity = 'critica';
    }
    // 4. Crisis Emocional / Salud Mental
    else if (
      normalized.includes('panico') || 
      normalized.includes('ansiedad') || 
      normalized.includes('crisis') || 
      normalized.includes('llorar') || 
      normalized.includes('llora') || 
      normalized.includes('asustad') || 
      normalized.includes('respirar') || 
      normalized.includes('triste') || 
      normalized.includes('histeri')
    ) {
      protocolKey = 'emotional_crisis';
      title = 'Reporte de Incidencia por Crisis Socioemocional';
      severity = 'media';
    }

    const proto = NEM_PROTOCOLS[protocolKey];
    
    // Auto-vincular un alumno si se menciona su nombre
    let foundStudentId = '';
    detailedStudents.forEach(st => {
      const firstNameNorm = st.first_name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const lastNameNorm = st.last_name_1.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.includes(firstNameNorm) || normalized.includes(lastNameNorm)) {
        foundStudentId = st.id;
      }
    });

    // Rellenar formulario
    setActiveProtocol(proto);
    setIncidentTitle(title);
    setSeverityLevel(severity);
    setSelectedStudentId(foundStudentId || selectedStudentId);
    setCompletedActions([]);
    setIsFormGenerated(true);
  };

  // Manejar click en Preset
  const handlePresetClick = (presetText: string) => {
    setTranscriptText(presetText);
    processEmergencyText(presetText);
  };

  // Alternar checklist de acciones
  const toggleActionItem = (action: string) => {
    if (completedActions.includes(action)) {
      setCompletedActions(completedActions.filter(a => a !== action));
    } else {
      setCompletedActions([...completedActions, action]);
    }
  };

  // Descarga / Impresión
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md transition-opacity duration-300 text-left overflow-y-auto">
      
      {/* -------------------- INCRUSTAR ESTILOS DE IMPRESIÓN PARA ACTA DE EMERGENCIA -------------------- */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #nem-emergency-printable, #nem-emergency-printable * {
            visibility: visible !important;
          }
          #nem-emergency-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            font-family: Arial, Helvetica, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 no-print">
        
        {/* Cabecera del Modal */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-850 flex justify-between items-center bg-rose-50/20 dark:bg-rose-950/10">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <h3 className="text-sm font-black uppercase tracking-wider">Protocolos de Alerta & Emergencia NEM</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo del Modal (Split Screen: Inputs/Mic vs Preview de Reporte) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          
          {/* LADO IZQUIERDO: DETECTOR DE VOZ E INPUTS (md:col-span-5) */}
          <div className="md:col-span-5 flex flex-col gap-5 border-r border-zinc-100 dark:border-zinc-850 pr-0 md:pr-6">
            
            {/* Sección Micrófono */}
            <div className="flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-850 rounded-2xl text-center gap-4 relative overflow-hidden">
              {isListening && (
                <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              )}

              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                {isListening ? 'Escuchando tu voz...' : 'Presiona el micrófono para hablar'}
              </p>
              
              <button
                onClick={toggleListening}
                className={`h-16 w-16 rounded-full flex items-center justify-center transition-all shadow-md ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                    : 'bg-zinc-900 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900'
                }`}
              >
                {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
              </button>

              <div className="text-[10px] font-bold text-zinc-400">
                {speechSupported ? 'API de Reconocimiento de Voz Activa' : 'API de voz no compatible (Usa presets)'}
              </div>
            </div>

            {/* Presets Rápidos */}
            <div className="flex flex-col gap-2">
              <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-wider text-left">Pruebas Rápidas de Emergencia (Voz Simulada)</span>
              <div className="grid grid-cols-2 gap-2 text-[10.5px] font-bold">
                {VOICE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePresetClick(preset.text)}
                    className="p-2.5 bg-white border border-zinc-200 hover:border-rose-500/50 dark:bg-zinc-950 dark:border-zinc-800 dark:hover:border-rose-500/50 rounded-xl text-left flex flex-col gap-1 transition-all"
                  >
                    <span>{preset.icon} {preset.title}</span>
                    <span className="text-[8.5px] text-zinc-400 font-semibold line-clamp-1">{preset.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Entrada Manual de Texto */}
            <div className="flex flex-col gap-1.5 text-xs text-left">
              <label className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wider">Redacción Manual del Suceso (Opcional)</label>
              <textarea
                rows={3}
                value={transcriptText}
                onChange={(e) => {
                  setTranscriptText(e.target.value);
                  processEmergencyText(e.target.value);
                }}
                placeholder="O escribe la situación directamente aquí..."
                className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-rose-500 leading-normal font-semibold resize-none"
              />
            </div>

            {/* Selector de Estudiante Involucrado */}
            {isFormGenerated && (
              <div className="flex flex-col gap-1.5 text-xs text-left font-bold">
                <label className="text-[9.5px] text-zinc-400 uppercase tracking-wider">Vincular Estudiante Involucrado</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-rose-500 font-bold"
                >
                  <option value="">-- Seleccionar alumno implicado --</option>
                  {detailedStudents.map(st => (
                    <option key={st.id} value={st.id}>{st.first_name} {st.last_name_1}</option>
                  ))}
                </select>
              </div>
            )}

          </div>

          {/* LADO DERECHO: PROTOCOLO AUTO-RELLENADO Y PREVIEW (md:col-span-7) */}
          <div className="md:col-span-7 flex flex-col gap-4">
            
            {!isFormGenerated ? (
              /* PANTALLA INICIAL PRE-REPORTE */
              <div className="h-full bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-150 dark:border-zinc-850 rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-4 min-h-[350px]">
                <Shield className="h-12 w-12 text-rose-500/60 animate-pulse" />
                <div>
                  <h4 className="text-xs font-black text-zinc-950 dark:text-white uppercase tracking-wider">Esperando Registro de Alerta</h4>
                  <p className="text-[11px] text-zinc-400 max-w-xs mt-1 leading-normal">
                    Habla al micrófono o selecciona un preset de emergencia. El sistema determinará la gravedad y el protocolo oficial de la NEM al instante.
                  </p>
                </div>
              </div>
            ) : (
              /* FORMULARIO Y REPORT CARD */
              <div className="flex flex-col gap-4 text-left">
                
                {/* Protocolo Badge y Título */}
                {activeProtocol && (
                  <div className="bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-900/30 p-4 rounded-2xl flex items-start gap-3">
                    {activeProtocol.key === 'accident' ? <Heart className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" /> :
                     activeProtocol.key === 'civil_defense' ? <Flame className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" /> :
                     activeProtocol.key === 'bullying' ? <Users className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" /> :
                     <Activity className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />}
                    
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider text-white ${
                        severityLevel === 'critica' ? 'bg-rose-600' : severityLevel === 'media' ? 'bg-amber-600' : 'bg-blue-600'
                      }`}>
                        Prioridad: {severityLevel === 'critica' ? 'Crítica (SOS)' : severityLevel === 'media' ? 'Media (Alerta)' : 'Ordinaria'}
                      </span>
                      <h4 className="text-xs font-black text-zinc-950 dark:text-white mt-1.5 leading-tight">{activeProtocol.name}</h4>
                      <p className="text-[9.5px] text-zinc-400 font-mono mt-1">{activeProtocol.officialReference}</p>
                    </div>
                  </div>
                )}

                {/* Acciones Inmediatas - Checklist de Actuación Legal/Civil */}
                {activeProtocol && (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                      <Check className="h-4 w-4 text-emerald-500" />
                      Acciones Inmediatas Obligatorias (Checklist NEM)
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {activeProtocol.immediateActions.map((action, idx) => {
                        const isChecked = completedActions.includes(action);
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleActionItem(action)}
                            className={`p-3 rounded-xl border text-xs font-semibold text-left flex items-start gap-2.5 transition-all ${
                              isChecked
                                ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                            }`}
                          >
                            <span className="flex-shrink-0 mt-0.5">
                              {isChecked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                            </span>
                            <span>{action}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notas adicionales del Reporte */}
                <div className="flex flex-col gap-1.5 text-xs">
                  <label className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wider">Anotaciones de Control de la Emergencia</label>
                  <textarea
                    rows={2}
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Agrega anotaciones sobre la hora del reporte médico, estado físico actual, personas contactadas, etc."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-rose-500 leading-normal font-semibold resize-none"
                  />
                </div>

                {/* Acciones del Reporte */}
                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={resetAll}
                    className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-750 dark:text-zinc-250 transition-all flex items-center gap-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Limpiar
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-500/10 flex items-center gap-1.5 transition-all"
                  >
                    <Download className="h-4 w-4" />
                    Exportar Acta Oficial PDF
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECCIÓN OCULTA EN PANTALLA - SOLO SE MUESTRA AL IMPRIMIR (A4) */}
      {/* ------------------------------------------------------------- */}
      {isFormGenerated && activeProtocol && (
        <div 
          id="nem-emergency-printable"
          className="hidden p-12 bg-white text-black text-left font-sans leading-relaxed text-xs"
        >
          {/* Cabecera Oficial */}
          <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-4 mb-6">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">Sistema Educativo Nacional • NEM 2022</span>
              <h1 className="text-base font-black tracking-tight mt-0.5">COLEGIO ANGLO MEXICANO</h1>
              <p className="text-[10px] font-bold text-zinc-650">ACTA ADMINISTRATIVA DE SUCESOS & ACTUACIÓN DE PROTOCOLO</p>
            </div>
            <div className="border border-zinc-400 p-2 text-[8px] font-mono text-center">
              CODIGO: REG-SOS-NEM<br />
              FOLIO: {Date.now().toString().substring(6)}
            </div>
          </div>

          <h2 className="text-sm font-black text-center border border-zinc-900 p-2 uppercase bg-zinc-50 mb-6">
            {incidentTitle || 'Reporte de Suceso de Emergencia'}
          </h2>

          {/* Tabla de Datos Generales */}
          <table className="w-full border-collapse border border-zinc-400 mb-6 text-[10px]">
            <tbody>
              <tr>
                <td className="border border-zinc-400 p-2 font-bold w-1/3 bg-zinc-50">Fecha de Emisión:</td>
                <td className="border border-zinc-400 p-2">{new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
              <tr>
                <td className="border border-zinc-400 p-2 font-bold bg-zinc-50">Hora de Registro:</td>
                <td className="border border-zinc-400 p-2">{new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs</td>
              </tr>
              <tr>
                <td className="border border-zinc-400 p-2 font-bold bg-zinc-50">Docente Reportante:</td>
                <td className="border border-zinc-400 p-2">Prof. {currentTeacher.first_name} {currentTeacher.last_name}</td>
              </tr>
              <tr>
                <td className="border border-zinc-400 p-2 font-bold bg-zinc-50">Alumno(s) Implicado(s):</td>
                <td className="border border-zinc-400 p-2">
                  {(() => {
                    const student = detailedStudents.find(s => s.id === selectedStudentId);
                    return student ? `${student.first_name} ${student.last_name_1} ${student.last_name_2 || ''} (${student.enrollment_id})` : 'No asignado / Hecho general del plantel';
                  })()}
                </td>
              </tr>
              <tr>
                <td className="border border-zinc-400 p-2 font-bold bg-zinc-50">Nivel de Gravedad asignado:</td>
                <td className="border border-zinc-400 p-2 uppercase font-black">
                  {severityLevel === 'critica' ? 'Crítica (Urgencia Máxima)' : severityLevel === 'media' ? 'Media (Alerta / Convivencia)' : 'Ordinaria (Baja)'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Descripción del Suceso */}
          <div className="mb-6">
            <h3 className="text-[10px] font-black border-b border-zinc-400 pb-1 uppercase mb-2">I. Descripción Narrativa del Suceso (Declaración del Docente)</h3>
            <p className="p-3 bg-zinc-50/50 border border-zinc-200 rounded leading-relaxed text-zinc-800 italic">
              "{transcriptText || 'No se ingresó declaración por voz o texto.'}"
            </p>
          </div>

          {/* Protocolo Oficial SEP Aplicado */}
          <div className="mb-6">
            <h3 className="text-[10px] font-black border-b border-zinc-400 pb-1 uppercase mb-2">II. Protocolo de Actuación Legal y Curricular NEM</h3>
            <div className="p-3 border border-zinc-450 rounded leading-normal">
              <p className="font-bold text-[11px]">{activeProtocol.name}</p>
              <p className="text-[9px] text-zinc-500 font-mono mt-0.5">Referencia SEP: {activeProtocol.officialReference}</p>
              <p className="mt-2 text-zinc-700"><span className="font-bold">Indicaciones de bitácora:</span> {activeProtocol.notes}</p>
            </div>
          </div>

          {/* Acciones Inmediatas Ejecutadas */}
          <div className="mb-6">
            <h3 className="text-[10px] font-black border-b border-zinc-400 pb-1 uppercase mb-2">III. Acciones Inmediatas de Contención Ejecutadas</h3>
            <ul className="space-y-1.5 pl-5 list-disc text-zinc-800">
              {activeProtocol.immediateActions.map((action, idx) => {
                const isDone = completedActions.includes(action);
                return (
                  <li key={idx} className={isDone ? 'font-bold text-zinc-900' : 'text-zinc-400 line-through'}>
                    {action} {isDone ? ' [EJECUTADO]' : ' [PENDIENTE DE VALIDACIÓN]'}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Anotaciones Adicionales */}
          {additionalNotes && (
            <div className="mb-6">
              <h3 className="text-[10px] font-black border-b border-zinc-400 pb-1 uppercase mb-2">IV. Notas Adicionales y Seguimiento Inmediato</h3>
              <p className="p-3 bg-zinc-50 border border-zinc-200 rounded text-zinc-850">
                {additionalNotes}
              </p>
            </div>
          )}

          {/* Sección de Firmas de Validez */}
          <div className="grid grid-cols-3 gap-8 border-t-2 border-zinc-900 pt-8 mt-16 text-center text-[9px] font-bold uppercase tracking-wider">
            <div className="flex flex-col items-center">
              <div className="w-32 border-b border-zinc-400 h-8" />
              <span className="mt-2">Prof. {currentTeacher.first_name} {currentTeacher.last_name}</span>
              <span className="text-[8px] text-zinc-500 font-semibold">Docente Reportante</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-32 border-b border-zinc-400 h-8" />
              <span className="mt-2">Dirección / Coordinación</span>
              <span className="text-[8px] text-zinc-500 font-semibold">Firma de Validación</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-32 border-b border-zinc-400 h-8" />
              <span className="mt-2">Tutor del Alumno</span>
              <span className="text-[8px] text-zinc-500 font-semibold">Firma de Enterado</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
