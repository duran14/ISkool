"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, BookOpen, FileText, Activity, Users, Brain, 
  Scale, Globe, Palette, Download, Save, Trash2, Plus, 
  ChevronRight, Image, FileDown, CheckCircle2, Wand2, Eye, 
  RefreshCw, Settings, Check, HelpCircle, Edit3, Lock,
  ChevronDown
} from 'lucide-react';
import { UserProfile, Subject, ClassSchedule, Group } from '@/types';

// ==========================================
// BASE DE DATOS CURRICULAR DE LA NEM 2022
// ==========================================

interface NemContent {
  campoFormativo: string;
  ejesArticuladores: string[];
  pda: string;
  inicio: string;
  desarrollo: string;
  cierre: string;
  evaluacion: string;
  materiales: string;
}

const NEM_CURRICULUM_DATABASE: Record<string, Record<string, NemContent>> = {
  'matematicas': {
    'primaria-baja': {
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejesArticuladores: ['Pensamiento Crítico', 'Inclusión'],
      pda: 'Fase 3 - Expresa de manera oral y escrita números de hasta dos cifras, e identifica fracciones sencillas como mitades y cuartos en situaciones cotidianas de reparto.',
      inicio: 'Reunir a los alumnos en semicírculo. Presentar una manzana y plantear la pregunta detonadora: ¿Cómo podemos compartir esta manzana de manera justa entre dos niños? ¿Y entre cuatro? Escuchar y anotar sus respuestas en el pizarrón.',
      desarrollo: 'Entregar hojas de papel de colores y círculos de cartulina a cada equipo de tres integrantes. Pedirles que los doblen y corten en 2 y 4 partes iguales. Jugar al "Restaurante de Fracciones", donde deben atender pedidos de clientes que solicitan "media pizza" o "un cuarto de pastel" utilizando sus figuras de papel. Completar una hoja de registro ilustrada.',
      cierre: 'Ronda de reflexión metacognitiva: ¿Qué pasa si las partes no son iguales? ¿Sigue siendo una fracción? Juego de retos rápidos en el pizarrón dibujando figuras divididas y pidiendo al grupo que identifique si representan fracciones reales.',
      evaluacion: 'Lista de cotejo: Coherencia en el reparto de material concreto, representación escrita correcta de 1/2 y 1/4, y participación en el trabajo en equipo.',
      materiales: 'Manzanas de plástico o reales, círculos de cartulina de colores, tijeras, pegamento, hojas de registro del "Restaurante de Fracciones".'
    },
    'primaria-alta': {
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejesArticuladores: ['Pensamiento Crítico', 'Artes y Experiencias Estéticas'],
      pda: 'Fase 5 - Resuelve problemas de suma y resta con fracciones de diferente denominador utilizando la equivalencia, y representa gráficamente las operaciones en su contexto diario.',
      inicio: 'Presentar una receta de cocina que requiere 1/2 taza de leche y 3/4 de taza de agua. Plantear el conflicto cognitivo: ¿Cómo podemos saber cuánta cantidad de líquido necesitamos en total? ¿Podemos sumar directamente 1/2 + 3/4?',
      desarrollo: 'En parejas, construir tiras de fracciones equivalentes en cartoncillo de colores. Utilizar las tiras para resolver una serie de desafíos prácticos donde deben sumar y restar porciones de ingredientes escolares. Representar las sumas de fracciones de forma gráfica coloreando vitrales didácticos (diseños artísticos divididos en cuadrículas).',
      cierre: 'Plenaria para explicar el método del mínimo común denominador y de la equivalencia gráfica. Resolver un problema integrador de forma colaborativa en el pizarrón. Escribir en su bitácora la mayor dificultad que tuvieron.',
      evaluacion: 'Rúbrica de evaluación formativa: Dominio en la conversión a fracciones equivalentes, precisión en las sumas gráficas, y análisis del significado de la suma en contextos reales.',
      materiales: 'Tiras de fracciones impresas en cartulina, colores, reglas, problemas de aplicación contextualizados, vitrales didácticos en papel bond.'
    },
    'secundaria': {
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejesArticuladores: ['Pensamiento Crítico'],
      pda: 'Fase 6 - Resuelve ecuaciones lineales de primer grado utilizando propiedades de la igualdad, y calcula proporciones y porcentajes aplicados a situaciones de la vida económica local.',
      inicio: 'Analizar un recibo de luz real o una nota de compra de abarrotes de la comunidad. Preguntar cómo se calcula el IVA (16%) y de qué manera se podría formular matemáticamente para calcular el costo base antes del impuesto.',
      desarrollo: 'Resolver un taller de desafíos basados en la economía local (negocios familiares, producción agrícola o comercial). Modelar las relaciones matemáticas en forma de ecuaciones de la forma ax + b = c. En equipos de 4, crear un "Tablero de Comercio Sostenible" donde calculan costos, ofertas del 20% de descuento y ganancias netas formulando ecuaciones.',
      cierre: 'Exposición breve del método algebraico de balanzas para despejar la incógnita. Autoevaluación en su bitácora de aprendizaje: ¿Cómo me ayuda el álgebra a entender los cobros diarios?',
      evaluacion: 'Examen rápido formativo de 3 reactivos contextualizados, revisión del planteamiento formal de las ecuaciones en el portafolio, y coevaluación del trabajo en equipo.',
      materiales: 'Notas de compra simuladas, hojas de ejercicios "El Álgebra en la Tiendita", calculadora científica, plumones y pizarrón.'
    },
    'preparatoria': {
      campoFormativo: 'Pensamiento Matemático (Nivel Medio Superior)',
      ejesArticuladores: ['Pensamiento Crítico', 'Igualdad de Género'],
      pda: 'Estructuras algebraicas y trigonométricas: Modela situaciones reales y calcula variaciones proporcionales y funciones mediante sistemas de ecuaciones lineales y vectores en 2D.',
      inicio: 'Presentar un mapa de vientos de la región o trayectorias de navegación de embarcaciones/aviones. Discutir qué propiedades físicas y matemáticas se requieren para describir una fuerza que tiene magnitud y dirección.',
      desarrollo: 'Explicación teórica de vectores y descomposición trigonométrica. Resolver ejercicios en parejas donde deben calcular la fuerza resultante sobre una estructura física escolar sometida a tensiones. Desarrollar un simulador analógico en papel milimétrico empleando reglas y transportadores para contrastar el método gráfico y el analítico.',
      cierre: 'Presentación grupal de los resultados de fuerza resultantes. Reflexión sobre la equidad de género en las carreras de ingeniería y STEM (Ciencia, Tecnología, Ingeniería y Matemáticas) fomentando el diálogo.',
      evaluacion: 'Reporte técnico en parejas con la resolución detallada de un sistema vectorial y una propuesta de mejora estructural utilizando vectores.',
      materiales: 'Papel milimétrico, reglas, transportadores, hojas de problemas vectoriales de física aplicada, presentación digital de conceptos trigonométricos.'
    }
  },
  'ciencias': {
    'primaria-baja': {
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejesArticuladores: ['Vida Saludable', 'Inclusión'],
      pda: 'Fase 3 - Reconoce la importancia del agua, el aire y el suelo para la vida silvestre y humana, y propone acciones cotidianas para su cuidado y preservación en la escuela.',
      inicio: 'Realizar una caminata de observación por el huerto o jardines de la escuela. Pedir a los niños que toquen la tierra, sientan el aire y observen las plantas. Al volver al salón, registrar en un mapa conceptual gigante qué elementos son necesarios para que la vida florezca.',
      desarrollo: 'Crear en equipos pequeños un "Miniecosistema de Germinación" en vasos transparentes reciclados utilizando tierra, semillas de frijol y agua. Experimentar con tres variables controladas: uno con sol y agua, otro a oscuras, y otro sin agua. Registrar diariamente los cambios en una tabla con dibujos.',
      cierre: 'Conversatorio grupal sobre los resultados del experimento de germinación. Concluir por qué la luz, el agua y la tierra son indispensables. Elaborar carteles coloridos para promover el ahorro de agua en los lavabos del colegio.',
      evaluacion: 'Bitácora del experimento de germinación con registro gráfico continuo de cambios, y calidad y creatividad del cartel escolar.',
      materiales: 'Vasos transparentes reciclados, tierra fértil, algodón, semillas de frijol rápido, atomizadores con agua, cartulinas y colores de cera.'
    },
    'primaria-alta': {
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejesArticuladores: ['Pensamiento Crítico', 'Vida Saludable'],
      pda: 'Fase 5 - Describe las características de los ecosistemas locales, analiza la huella ecológica humana en la biodiversidad y diseña prototipos sencillos de ecotecnias (como biodigestores o deshidratadores solares).',
      inicio: 'Observar un video corto sobre cómo los desechos orgánicos generan gases nocivos si no se tratan adecuadamente. Introducir el concepto de "Ecotecnias" y preguntar: ¿Qué podemos hacer con las cáscaras de fruta de la cafetería de la escuela?',
      desarrollo: 'Construir en parejas un prototipo escolar de Biodigestor Anaeróbico a escala utilizando una botella PET de 2 litros, un globo resistente, residuos orgánicos machacados (plátano, manzana) y levadura. Sellar herméticamente con plastilina y registrar la inflación del globo (producción de biogás) durante los días subsecuentes.',
      cierre: 'Plenaria explicativa de la digestión anaerobia y la transformación bacteriana de residuos en gas metano y biofertilizante. Discutir la viabilidad económica y ecológica de un biodigestor escolar real.',
      evaluacion: 'Reporte ilustrado del prototipo del biodigestor, correcto sellado técnico de la botella, y justificación ecológica del proyecto redactada individualmente.',
      materiales: 'Botellas de plástico de 2 litros limpias, globos, embudos, residuos orgánicos blandos, levadura en polvo, plastilina, cintas métricas.'
    },
    'secundaria': {
      campoFormativo: 'Saberes y Pensamiento Científico',
      ejesArticuladores: ['Pensamiento Crítico', 'Interculturalidad Crítica'],
      pda: 'Fase 6 - Valora la importancia de los procesos de oxidación y combustión en la producción de gases de efecto invernadero (GEI) y propone alternativas tecnológicas sustentables como el biogás para mitigar el cambio climático.',
      inicio: 'Analizar gráficas globales de aumento de emisiones de CO2 y Metano en los últimos 50 años. Preguntar qué actividades en sus hogares y escuelas contribuyen directamente a esta tendencia y qué alternativas energéticas existen en comunidades rurales del país.',
      desarrollo: 'Investigar en equipos los fundamentos químicos del biogás (composición del biogás, bacterias metanogénicas, fases de hidrólisis, acidogénesis y metanogénesis). Elaborar un reporte técnico de balance de masas y estimar el potencial calorífico del biogás escolar en comparación con el gas LP convencional.',
      cierre: 'Mesa redonda: "Soberanía energética y ecotecnologías en México". Discutir cómo los biodigestores benefician el desarrollo de comunidades indígenas y marginadas, reduciendo la tala de árboles para leña.',
      evaluacion: 'Bitácora científica grupal con el marco teórico químico de la digestión anaeróbica, cálculos de rendimiento térmico simulados y coevaluación del desempeño.',
      materiales: 'Artículos de investigación científica impresos, laptop/tablet para investigación, pliego de papel bond, marcadores de colores.'
    },
    'preparatoria': {
      campoFormativo: 'Ciencias Experimentales (Nivel Medio Superior)',
      ejesArticuladores: ['Pensamiento Crítico', 'Vida Saludable'],
      pda: 'Estequiometría y Termoquímica: Analiza el rendimiento térmico de reacciones químicas exotérmicas y endotérmicas, y calcula el balance calórico de sistemas biológicos y tecnológicos cerrados.',
      inicio: 'Presentar el dilema de la eficiencia de la biomasa frente a los hidrocarburos. Discutir qué variables físicas (entalpía, entropía, energía libre de Gibbs) regulan la viabilidad termodinámica de un combustible biológico.',
      desarrollo: 'Explicación del calorímetro y cálculo de calor liberado en reacciones de combustión de alcoholes y gases orgánicos. En el laboratorio escolar, simular el rendimiento térmico de una celda de combustión de gas orgánico midiendo la temperatura de agua. Realizar el balance termoquímico formal planteando ecuaciones estequiométricas.',
      cierre: 'Plenaria sobre termodinámica aplicada a procesos industriales ecológicos. Debate rápido: ¿Es el biogás una solución definitiva o de transición para la descarbonización industrial?',
      evaluacion: 'Práctica de laboratorio estequiométrica redactada con formato de artículo científico breve que incluya cálculos matemáticos rigurosos de entalpía.',
      materiales: 'Termómetros de alta precisión, calorímetros caseros o escolares, vasos de precipitados, mecheros, simulaciones teóricas de combustión de metano.'
    }
  },
  'lenguajes': {
    'primaria-baja': {
      campoFormativo: 'Lenguajes',
      ejesArticuladores: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Artes y Experiencias Estéticas'],
      pda: 'Fase 3 - Lee en voz alta poemas y textos de la lírica tradicional, identifica patrones de rima y ritmo, e inventa sus propias estrofas de forma lúdica.',
      inicio: 'Cantar colectivamente una canción tradicional infantil mexicana (como "Naranja dulce, limón partido"). Pedir a los niños que palmoteen siguiendo el ritmo de los versos e identifiquen qué palabras suenan parecido al final.',
      desarrollo: 'Jugar a la "Fábrica de Rimas": dar tarjetas de palabras a cada alumno y pedirles que busquen a un compañero que tenga una palabra que rime con la suya. En parejas, escribir un poema breve de cuatro versos ilustrado sobre sus mascotas o su escuela y decorarlo artísticamente.',
      cierre: 'Micrófono Abierto: Invitar a los alumnos a recitar sus creaciones poéticas frente a sus compañeros con entonación y expresión corporal. Dar aplausos afectuosos.',
      evaluacion: 'Participación activa en el canto y ritmo, escritura de al menos una rima lógica por pareja, y lectura expresiva en voz alta.',
      materiales: 'Tarjetas con palabras ilustradas que riman, hojas de papel decorativas, colores, micrófono de juguete o real para la recitación.'
    },
    'primaria-alta': {
      campoFormativo: 'Lenguajes',
      ejesArticuladores: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Interculturalidad Crítica'],
      pda: 'Fase 4 - Identifica las características estructurales de las leyendas y mitos de tradición oral, reconoce su valor cultural para la comunidad y elabora narraciones escritas creativas.',
      inicio: 'Sentar al grupo en círculo. Contar una versión dramatizada de una leyenda prehispánica (como "La llorona" o "El callejón del beso"). Preguntar: ¿Es una historia real? ¿Cómo ha llegado hasta nosotros hoy en día?',
      desarrollo: 'Visitar la biblioteca o realizar una investigación en clase sobre leyendas regionales mexicanas. En equipos de 4, seleccionar una leyenda, analizar sus personajes, elementos mágicos y reales, y estructurarla en un guion teatral corto. Ensayar la lectura dramática de los personajes asignados.',
      cierre: 'Puesta en escena simulada en el aula de las lecturas dramáticas de las leyendas. Compartir opiniones sobre los valores o creencias comunitarias que transmite cada historia.',
      evaluacion: 'Rúbrica: Comprensión de los elementos de la leyenda (magia vs realidad), fluidez en la lectura dramática, y trabajo armónico en el equipo.',
      materiales: 'Textos impresos de leyendas populares mexicanas, hojas blancas para redactar guiones, elementos de utilería simples (sombreros, mantas).'
    },
    'secundaria': {
      campoFormativo: 'Lenguajes',
      ejesArticuladores: ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Pensamiento Crítico'],
      pda: 'Fase 6 - Analiza la intención comunicativa de textos líricos, narrativos e históricos en lengua española de distintas épocas, y redacta ensayos argumentativos estructurados sobre temáticas sociales.',
      inicio: 'Proyectar un fragmento de una obra literaria barroca y una canción de protesta social contemporánea. Discutir: ¿Qué mensaje buscan transmitir? ¿Cómo influye el momento histórico en la forma de escribir del autor?',
      desarrollo: 'Analizar individualmente la estructura de un ensayo argumentativo (Tesis, Argumentos, Conclusión). Elegir una problemática social (ej. igualdad de género, conservación ecológica o migración) y redactar un ensayo breve de 3 cuartillas, citando de manera formal al menos dos fuentes de consulta confiables.',
      cierre: 'Ronda de debate en mesa redonda donde cada estudiante expone la tesis de su ensayo y responde preguntas críticas de sus compañeros de manera respetuosa.',
      evaluacion: 'Ensayo argumentativo impreso (estructura formal, cohesión, coherencia y ortografía) y defensa de su tesis oral durante la mesa redonda.',
      materiales: 'Guía de redacción de ensayos, textos literarios de ejemplo, fichas de referencias bibliográficas, plumones de colores.'
    },
    'preparatoria': {
      campoFormativo: 'Lengua y Comunicación (Nivel Medio Superior)',
      ejesArticuladores: ['Pensamiento Crítico', 'Artes y Experiencias Estéticas'],
      pda: 'Redacción avanzada e interpretación literaria: Desarrolla el pensamiento crítico mediante el análisis literario comparativo de textos líricos y redacta discursos persuasivos de impacto comunitario.',
      inicio: 'Ver un video de un discurso persuasivo célebre (como el de Martin Luther King o Malala Yousafzai). Identificar qué recursos lingüísticos y emocionales utilizan para conectar con la audiencia.',
      desarrollo: 'Exposición de figuras retóricas avanzadas (metáfora, anáfora, hipérbole, ironía). Redactar de forma individual un discurso persuasivo sobre una problemática del plantel escolar o de la colonia. Grabar un video o realizar una oratoria de 3 minutos aplicando modulación vocal y expresión ad hoc.',
      cierre: 'Taller de retroalimentación literaria entre pares (taller de escritores). Evaluar el discurso del compañero utilizando una escala estimativa.',
      evaluacion: 'Manuscrito del discurso con uso explícito de figuras retóricas y video de la oratoria final del alumno.',
      materiales: 'Manual de retórica y oratoria, videos de discursos históricos, rúbrica de coevaluación escolar.'
    }
  }
};

// ==========================================
// CAMPOS FORMATIVOS Y EJES ARTICULADORES
// ==========================================

const CAMPOS_FORMATIVOS = [
  'Lenguajes',
  'Saberes y Pensamiento Científico',
  'Ética, Naturaleza y Sociedades',
  'De lo Humano y lo Comunitario'
];

const EJES_ARTICULADORES = [
  { name: 'Pensamiento Crítico', icon: Brain, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/40' },
  { name: 'Inclusión', icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200/40' },
  { name: 'Vida Saludable', icon: Activity, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/40' },
  { name: 'Artes y Exp. Estéticas', icon: Palette, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40 border-pink-200/40' },
  { name: 'Fomento a la Lectura', icon: BookOpen, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200/40' },
  { name: 'Igualdad de Género', icon: Scale, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200/40' },
  { name: 'Interculturalidad Crítica', icon: Globe, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200/40' }
];

interface PlanningTabProps {
  currentTeacher: UserProfile;
  subjects: Subject[];
  schedulesList: ClassSchedule[];
  groupsList: Group[];
}

export function PlanningTab({ currentTeacher, subjects, schedulesList, groupsList }: PlanningTabProps) {
  // --- Estados de Entrada ---
  const [inputText, setInputText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('primaria-alta');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  // --- Estado de Archivos ---
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: 'image' | 'pdf'; size: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Estados del Gemini API ---
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('iskool_gemini_api_key') || '';
    }
    return '';
  });

  // --- Estados de Ejecución/IA ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const generationSteps = [
    'Analizando texto e insumos...',
    'Buscando correspondencia en el plan de estudios NEM...',
    'Generando PDA y ejes articuladores adecuados...',
    'Estructurando secuencia didáctica y criterios de evaluación...',
    'Finalizando planeación...'
  ];

  // --- Estados de Resultado ---
  const [activePlanning, setActivePlanning] = useState<any | null>(null);
  const [planningsHistory, setPlanningsHistory] = useState<any[]>([]);

  // Inicializar Asignatura según las disponibles para el maestro
  useEffect(() => {
    const teacherSchedules = schedulesList.filter(s => s.teacherId === currentTeacher.id);
    if (teacherSchedules.length > 0) {
      const firstSubjectId = teacherSchedules[0].subjectId;
      // Mapear subject del seed a la clave del curriculum
      const curSubject = firstSubjectId === 'sub-math' ? 'matematicas' : 
                         firstSubjectId === 'sub-sci' ? 'ciencias' : 'lenguajes';
      setSelectedSubject(curSubject);
    } else {
      setSelectedSubject('ciencias');
    }
  }, [schedulesList, currentTeacher]);

  // Cargar historial de planeaciones al montar
  useEffect(() => {
    const saved = localStorage.getItem('iskool_generated_plannings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPlanningsHistory(parsed);
        if (parsed.length > 0) {
          setActivePlanning(parsed[0]);
        }
      } catch (e) {
        console.error("Error al cargar historial de planeaciones", e);
      }
    }
  }, []);

  // Guardar historial en localStorage
  const saveHistory = (newHistory: any[]) => {
    setPlanningsHistory(newHistory);
    localStorage.setItem('iskool_generated_plannings', JSON.stringify(newHistory));
  };

  // --- Manejadores de Archivos ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const type: 'image' | 'pdf' = file.type.includes('pdf') ? 'pdf' : 'image';
    
    setUploadedFile({
      name: file.name,
      type,
      size: sizeMB
    });

    if (type === 'image') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }

    // Auto-rellenar input con el nombre del archivo estilizado
    const cleanName = file.name
      .replace(/\.[^/.]+$/, "") // Quitar extensión
      .replace(/[_-]/g, " ");   // Reemplazar guiones por espacios
    
    if (!inputText) {
      setInputText(cleanName);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setUploadedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- Guardar API Key ---
  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('iskool_gemini_api_key', key);
    alert('API Key de Gemini guardada de forma segura en tu navegador.');
    setApiSettingsOpen(false);
  };

  // --- Generador Didáctico de Planeación ---
  const handleGenerate = async () => {
    if (!inputText.trim() && !uploadedFile) {
      alert("Por favor introduce una idea, palabra clave o sube un archivo.");
      return;
    }

    setIsGenerating(true);
    setGenerationStep(0);

    // Animación de pasos de IA
    const interval = setInterval(() => {
      setGenerationStep(prev => {
        if (prev < generationSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1100);

    // Esperar a que la simulación termine
    await new Promise(resolve => setTimeout(resolve, 5500));

    // Determinar si usamos Gemini Real u Offline
    let resultPlanning: any = null;

    if (geminiApiKey.trim()) {
      try {
        resultPlanning = await callGeminiAPI(inputText, selectedLevel, selectedSubject);
      } catch (err) {
        console.error("Fallo llamada a Gemini API, usando motor heurístico local", err);
        resultPlanning = generateLocalNEMPlanning(inputText, selectedLevel, selectedSubject);
      }
    } else {
      resultPlanning = generateLocalNEMPlanning(inputText, selectedLevel, selectedSubject);
    }

    clearInterval(interval);
    setIsGenerating(false);

    // Guardar en Historial y seleccionar
    const updatedHistory = [resultPlanning, ...planningsHistory.filter(p => p.id !== resultPlanning.id)];
    saveHistory(updatedHistory);
    setActivePlanning(resultPlanning);
  };

  // --- Llamada a la API Real de Gemini ---
  const callGeminiAPI = async (promptText: string, level: string, subject: string) => {
    const levelLabel = level === 'primaria-baja' ? 'Primaria Baja (1º a 3º Grado)' :
                       level === 'primaria-alta' ? 'Primaria Alta (4º a 6º Grado)' :
                       level === 'secundaria' ? 'Secundaria (1º a 3º Grado)' : 'Preparatoria / Bachillerato';

    const subjectLabel = subject === 'matematicas' ? 'Matemáticas / Saberes Científicos' :
                         subject === 'ciencias' ? 'Ciencias / Saberes y Pensamiento Científico' : 'Lenguajes (Español/Comunicación)';

    const systemPrompt = `Eres un Asesor Pedagógico Experto de la SEP especializado en la Nueva Escuela Mexicana (NEM).
Genera una planeación didáctica formal basada en la NEM 2022.
Nivel educativo: ${levelLabel}.
Asignatura: ${subjectLabel}.
Tema/Idea de entrada: ${promptText}.

Debes responder ÚNICAMENTE con un objeto JSON válido, estructurado exactamente con las siguientes claves:
{
  "title": "Título corto y atractivo para la sesión",
  "campoFormativo": "Especifica a qué Campo Formativo pertenece (Lenguajes, Saberes y Pensamiento Científico, Ética Naturaleza y Sociedades, o De lo Humano y lo Comunitario)",
  "ejesArticuladores": ["Lista de hasta 2 ejes articuladores de la NEM vigentes"],
  "pda": "Proceso de Desarrollo de Aprendizaje (PDA) oficial y formal adaptado a este nivel y tema",
  "duration": "Ejemplo: 4 horas lectivas",
  "inicio": "Descripción detallada de actividades iniciales (recuperación de saberes previos, conflicto cognitivo)",
  "desarrollo": "Descripción detallada de la secuencia de desarrollo (indagación, experimentos, proyectos)",
  "cierre": "Descripción detallada de actividades de cierre (metacognición, socialización, evaluación formativa)",
  "evaluacion": "Evidencia evaluable y criterios de evaluación formativa",
  "materiales": "Lista de recursos y materiales didácticos requeridos"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: `${systemPrompt}\n\nGenera la planeación en español con base en la información del tema: "${promptText}"` }] }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Limpiar posibles bloques de código markdown que añaden los LLMs
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(text);

    return {
      id: 'plan-' + Date.now(),
      title: parsed.title || 'Planeación Didáctica',
      subjectId: subject,
      subjectName: subjectLabel,
      levelId: level,
      levelName: levelLabel,
      campoFormativo: parsed.campoFormativo || 'Saberes y Pensamiento Científico',
      ejesArticuladores: parsed.ejesArticuladores || ['Pensamiento Crítico'],
      pda: parsed.pda || 'PDA General',
      duration: parsed.duration || '4 horas',
      inicio: parsed.inicio || 'Actividades de inicio.',
      desarrollo: parsed.desarrollo || 'Actividades de desarrollo.',
      cierre: parsed.cierre || 'Actividades de cierre.',
      evaluacion: parsed.evaluacion || 'Evidencia de aprendizaje.',
      materiales: parsed.materiales || 'Materiales generales.',
      createdAt: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  // --- Generador Heurístico Local ---
  const generateLocalNEMPlanning = (promptText: string, level: string, subject: string) => {
    // Normalizar texto
    const searchStr = promptText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    let dbKey = 'ciencias'; // Default
    if (subject === 'matematicas' || searchStr.includes('fraccion') || searchStr.includes('numero') || searchStr.includes('algebra') || searchStr.includes('matematica') || searchStr.includes('ecuacion') || searchStr.includes('geometria')) {
      dbKey = 'matematicas';
    } else if (subject === 'lenguajes' || searchStr.includes('poe') || searchStr.includes('leyenda') || searchStr.includes('lectura') || searchStr.includes('escribir') || searchStr.includes('redac') || searchStr.includes('espanol') || searchStr.includes('carta') || searchStr.includes('comunic')) {
      dbKey = 'lenguajes';
    }

    const hasSpecificContent = NEM_CURRICULUM_DATABASE[dbKey]?.[level];
    let content: NemContent;

    if (hasSpecificContent && (searchStr.includes('fraccion') || searchStr.includes('biodigestor') || searchStr.includes('leyenda') || searchStr.includes('poe') || searchStr.includes('agua') || searchStr.includes('algebra') || searchStr.includes('clima') || searchStr.includes('germina'))) {
      content = NEM_CURRICULUM_DATABASE[dbKey][level];
    } else {
      // Compilar planeación dinámica con el tema del usuario
      const capitalizedTopic = promptText.charAt(0).toUpperCase() + promptText.slice(1);
      
      const campos = {
        'matematicas': 'Saberes y Pensamiento Científico',
        'ciencias': 'Saberes y Pensamiento Científico',
        'lenguajes': 'Lenguajes'
      };
      
      const defaultCampo = campos[subject as keyof typeof campos] || 'Ética, Naturaleza y Sociedades';

      const pdaTemplates = {
        'primaria-baja': `Fase 3 - Identifica y explica con sus palabras la importancia de "${capitalizedTopic}" en su vida diaria, casa y escuela, realizando registros gráficos y sencillos de su entorno.`,
        'primaria-alta': `Fase 5 - Investiga y sistematiza información sobre las implicaciones ecológicas y científicas de "${capitalizedTopic}" en la comunidad escolar, proponiendo alternativas creativas sustentables.`,
        'secundaria': `Fase 6 - Analiza de forma crítica el impacto social, científico y tecnológico de "${capitalizedTopic}" a nivel regional y diseña un informe escrito argumentativo sobre sus aplicaciones.`,
        'preparatoria': `Modela y argumenta fenómenos complejos de la sociedad y naturaleza integrando conceptos teóricos de "${capitalizedTopic}" para plantear soluciones interdisciplinarias.`
      };

      const defaultPda = pdaTemplates[level as keyof typeof pdaTemplates] || `PDA sobre ${capitalizedTopic}`;

      content = {
        campoFormativo: defaultCampo,
        ejesArticuladores: subject === 'lenguajes' 
          ? ['Apropiación de las Culturas a través de la Lectura y la Escritura', 'Pensamiento Crítico']
          : ['Pensamiento Crítico', 'Vida Saludable'],
        pda: defaultPda,
        inicio: `Presentar el tema central "${capitalizedTopic}" al grupo a través de una dinámica grupal o lluvia de ideas. Plantear la pregunta detonadora: ¿Cómo se relaciona "${capitalizedTopic}" con las actividades que hacemos todos los días en la escuela y en nuestros hogares? Registrar opiniones en el pizarrón.`,
        desarrollo: `En equipos cooperativos, investigar las características y aplicaciones prácticas de "${capitalizedTopic}". Utilizar recursos escolares (libros de texto, fichas de biblioteca o experimentos prácticos). Diseñar de manera colaborativa un organizador gráfico (mapa mental o cuadro sinóptico) que compile la información recolectada e incluya ilustraciones.`,
        cierre: `Exposición grupal de los organizadores gráficos de cada equipo. Espacio de retroalimentación formativa y coevaluación constructiva entre compañeros. Redactar de forma individual una breve conclusión de 5 líneas sobre los saberes adquiridos de "${capitalizedTopic}".`,
        evaluacion: `Organizador gráfico final del equipo, participación cooperativa valorada por rúbrica, y conclusión escrita reflexiva sobre "${capitalizedTopic}".`,
        materiales: `Hojas de rotafolio o cartulina, marcadores de colores, colores, libro de texto "Nuestros Saberes", y fichas informativas de consulta preparadas por el docente.`
      };
    }

    const levelNames = {
      'primaria-baja': 'Primaria Baja (1º a 3º Grado)',
      'primaria-alta': 'Primaria Alta (4º a 6º Grado)',
      'secundaria': 'Secundaria (1º a 3º Grado)',
      'preparatoria': 'Preparatoria / Bachillerato'
    };

    const subjectNames = {
      'matematicas': 'Matemáticas',
      'ciencias': 'Ciencias Naturales',
      'lenguajes': 'Español / Lenguajes'
    };

    return {
      id: 'plan-' + Date.now(),
      title: `Proyecto: Aprendiendo sobre ${promptText.substring(0, 30)}`,
      subjectId: subject,
      subjectName: subjectNames[subject as keyof typeof subjectNames] || 'Asignatura',
      levelId: level,
      levelName: levelNames[level as keyof typeof levelNames] || 'Nivel Educativo',
      campoFormativo: content.campoFormativo,
      ejesArticuladores: content.ejesArticuladores,
      pda: content.pda,
      duration: '4 horas lectivas',
      inicio: content.inicio,
      desarrollo: content.desarrollo,
      cierre: content.cierre,
      evaluacion: content.evaluacion,
      materiales: content.materiales,
      createdAt: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    };
  };

  // --- Actualizar campos editados ---
  const updateActivePlanningField = (key: string, value: any) => {
    if (!activePlanning) return;
    const updated = { ...activePlanning, [key]: value };
    setActivePlanning(updated);
    
    // Actualizar también en el historial
    const updatedHistory = planningsHistory.map(p => p.id === activePlanning.id ? updated : p);
    saveHistory(updatedHistory);
  };

  // --- Borrar Planeación ---
  const handleDeletePlanning = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Seguro que deseas eliminar esta planeación del historial?")) {
      const updatedHistory = planningsHistory.filter(p => p.id !== id);
      saveHistory(updatedHistory);
      if (activePlanning?.id === id) {
        setActivePlanning(updatedHistory.length > 0 ? updatedHistory[0] : null);
      }
    }
  };

  // --- Descarga a PDF usando window.print ---
  const handlePrint = () => {
    if (!activePlanning) return;
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* -------------------- COLUMNA IZQUIERDA: INPUTS (lg:col-span-4) -------------------- */}
      <div className="lg:col-span-4 flex flex-col gap-5 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-5 shadow-sm text-left no-print">
        
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Wand2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Configurar Insumos
          </h3>
          <button 
            onClick={() => setApiSettingsOpen(!apiSettingsOpen)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-650 transition-colors"
            title="Configurar API Key de Gemini"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario API Key */}
        {apiSettingsOpen && (
          <div className="bg-blue-50/50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-blue-150/40 dark:border-zinc-850 flex flex-col gap-3">
            <h4 className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wide">Clave de API Gemini (Google AI)</h4>
            <p className="text-[9.5px] text-zinc-500 leading-normal">
              Opcional. Si deseas usar inteligencia artificial generativa de verdad en lugar del motor local offline, introduce tu API key. Se guarda solo en tu navegador.
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-mono focus:outline-none"
              />
              <button
                onClick={() => handleSaveApiKey(geminiApiKey)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Nivel Educativo y Asignatura */}
        <div className="grid grid-cols-2 gap-4 font-bold text-xs text-zinc-800 dark:text-zinc-200">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9.5px] text-zinc-400 uppercase tracking-wider">Nivel Educativo</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-blue-500 font-bold"
            >
              <option value="primaria-baja">Primaria Baja (1º-3º)</option>
              <option value="primaria-alta">Primaria Alta (4º-6º)</option>
              <option value="secundaria">Secundaria (1º-3º)</option>
              <option value="preparatoria">Preparatoria</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9.5px] text-zinc-400 uppercase tracking-wider">Asignatura</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-blue-500 font-bold"
            >
              <option value="ciencias">Ciencias Naturales</option>
              <option value="matematicas">Matemáticas</option>
              <option value="lenguajes">Español / Lenguajes</option>
            </select>
          </div>
        </div>

        {/* Entrada de Texto o Párrafo */}
        <div className="flex flex-col gap-1.5 text-xs">
          <label className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wider">Idea, Palabra Clave o Párrafo</label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe el tema de la clase, ejemplo: 'fracciones equivalentes con pizza', 'cuidado del agua', 'biodigestores', 'leyendas prehispánicas'..."
            className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-150 focus:outline-none focus:border-blue-500 leading-relaxed font-semibold resize-none"
          />
        </div>

        {/* Subida de Archivos (Imagen o PDF) */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wider">Subir Fotografía o Archivo PDF</label>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />

          {!uploadedFile ? (
            <button
              type="button"
              onClick={triggerFileSelect}
              className="w-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:border-blue-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-950/30 transition-all group"
            >
              <div className="p-2.5 rounded-full bg-zinc-50 dark:bg-zinc-950 text-zinc-400 group-hover:text-blue-500 group-hover:scale-105 transition-all">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-200">Seleccionar imagen o PDF</p>
                <p className="text-[9px] text-zinc-400 mt-0.5">Formatos aceptados: JPG, PNG, PDF (Máx. 10MB)</p>
              </div>
            </button>
          ) : (
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {uploadedFile.type === 'image' ? (
                  imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Miniatura" 
                      className="h-10 w-10 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-zinc-150 dark:bg-zinc-900 text-zinc-500 flex items-center justify-center flex-shrink-0">
                      <Image className="h-5 w-5" />
                    </div>
                  )
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                )}
                
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{uploadedFile.name}</p>
                  <p className="text-[9px] text-zinc-400 mt-0.5 uppercase font-bold">{uploadedFile.type} • {uploadedFile.size}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={removeFile}
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Botón de Enviar */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || (!inputText.trim() && !uploadedFile)}
          className={`w-full py-3 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all ${
            isGenerating 
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none'
              : !inputText.trim() && !uploadedFile
                ? 'bg-zinc-100 dark:bg-zinc-950 text-zinc-400 border border-zinc-200 dark:border-zinc-800 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10 hover:scale-[1.01]'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generando Planeación...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generar con IA NEM
            </>
          )}
        </button>

        {/* HISTORIAL DE PLANEACIONES */}
        {planningsHistory.length > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Historial de Planeaciones</span>
            <div className="flex flex-col gap-2 max-h-[170px] overflow-y-auto pr-1">
              {planningsHistory.map((plan) => {
                const isActive = activePlanning?.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setActivePlanning(plan)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex justify-between items-center transition-all ${
                      isActive
                        ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/10 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 font-bold'
                        : 'bg-white dark:bg-zinc-900 border-zinc-150 hover:border-zinc-250 dark:border-zinc-800/80 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{plan.title}</span>
                    </div>
                    
                    <button
                      onClick={(e) => handleDeletePlanning(plan.id, e)}
                      className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* -------------------- COLUMNA DERECHA: DOCUMENTO / LOADING (lg:col-span-8) -------------------- */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* PANTALLA DE CARGA DE IA */}
        {isGenerating ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-6 shadow-sm min-h-[480px] no-print">
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 dark:border-blue-500/5" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-base font-black text-zinc-950 dark:text-white">Procesando Insumos Pedagógicos</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm leading-normal">
                Nuestra IA está estructurando la planeación didáctica de acuerdo a los campos formativos de la NEM actual.
              </p>
            </div>

            {/* Pasos Visuales */}
            <div className="w-full max-w-md bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-150 dark:border-zinc-850 p-5 flex flex-col gap-3.5">
              {generationSteps.map((step, idx) => {
                const isActive = generationStep === idx;
                const isCompleted = generationStep > idx;
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs font-semibold">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 flex-shrink-0" />
                    ) : isActive ? (
                      <div className="h-4.5 w-4.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin flex-shrink-0" />
                    ) : (
                      <div className="h-4.5 w-4.5 rounded-full border-2 border-zinc-200 dark:border-zinc-800 flex-shrink-0" />
                    )}
                    
                    <span className={isCompleted ? 'text-zinc-400 line-through' : isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-zinc-400'}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : !activePlanning ? (
          /* PANTALLA INICIAL SIN PLAN */
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-16 flex flex-col items-center justify-center text-center gap-5 shadow-sm min-h-[480px] no-print">
            <div className="p-4.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-3xl">
              <FileDown className="h-12 w-12" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-950 dark:text-white">Generador de Planeación Escolar</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm leading-normal">
                Usa el formulario lateral para ingresar la idea de tu clase. El generador estructurará una planeación pedagógica NEM editable y descargable en PDF al instante.
              </p>
            </div>
          </div>
        ) : (
          /* VISTA DEL DOCUMENTO GENERADO (HOJA A4) */
          <>
            {/* Barra de Acciones del Documento */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-3 shadow-xs flex justify-between items-center no-print">
              <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1.5 px-2">
                <Edit3 className="h-4 w-4 text-zinc-400" />
                Haz clic sobre cualquier texto para editar directamente la planeación
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-sm shadow-blue-500/10 flex items-center gap-1.5 transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  Descargar PDF / Imprimir
                </button>
              </div>
            </div>

            {/* Contenedor Imprimible */}
            <div 
              id="nem-print-container" 
              className="print-page bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-8 sm:p-12 shadow-sm text-left relative text-zinc-800 dark:text-zinc-100 font-sans"
            >
              {/* Estilos CSS Locales e Incrustados para Impresión */}
              <style>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #nem-print-container, #nem-print-container * {
                    visibility: visible !important;
                  }
                  #nem-print-container {
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
                  }
                  .no-print {
                    display: none !important;
                  }
                  .print-badge {
                    border: 1px solid #ccc !important;
                    background: #f5f5f5 !important;
                    color: black !important;
                    padding: 2px 6px !important;
                    border-radius: 4px !important;
                  }
                  textarea {
                    border: none !important;
                    resize: none !important;
                    overflow: visible !important;
                    height: auto !important;
                  }
                }
              `}</style>

              {/* Membrete Oficial */}
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 border-b-2 border-double border-zinc-200 dark:border-zinc-800 pb-6 mb-6">
                <div className="text-center sm:text-left flex flex-col gap-1">
                  <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">Secretaría de Educación Pública</span>
                  <h2 className="text-lg font-black tracking-tight text-zinc-950 dark:text-white leading-tight">COLEGIO ANGLO MEXICANO</h2>
                  <p className="text-[10.5px] font-medium text-zinc-500">Módulo Académico Gamificado • Planeación Didáctica NEM</p>
                </div>
                
                {/* Sello Escolar */}
                <div className="h-14 w-14 rounded-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-[9px] font-black text-zinc-400 text-center uppercase leading-none p-1 flex-shrink-0">
                  Sello<br />Escolar
                </div>
              </div>

              {/* Título de la Sesión */}
              <div className="mb-6 flex flex-col gap-1.5">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Título del Proyecto Didáctico</span>
                <input
                  type="text"
                  value={activePlanning.title}
                  onChange={(e) => updateActivePlanningField('title', e.target.value)}
                  className="w-full text-xl font-black text-zinc-950 dark:text-white border-b border-transparent hover:border-zinc-200 focus:border-blue-500 outline-none pb-1.5 focus:px-2 rounded"
                />
              </div>

              {/* Tabla de Metadatos Didácticos */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5 bg-zinc-50/50 dark:bg-zinc-950/20 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 mb-6 font-semibold text-xs leading-normal">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Docente Titular</span>
                  <span className="text-zinc-850 dark:text-zinc-200">{currentTeacher.first_name} {currentTeacher.last_name}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Nivel / Fase</span>
                  <span className="text-zinc-850 dark:text-zinc-200">{activePlanning.levelName}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Asignatura</span>
                  <span className="text-zinc-850 dark:text-zinc-200">{activePlanning.subjectName}</span>
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Campo Formativo (NEM)</span>
                  <input
                    type="text"
                    value={activePlanning.campoFormativo}
                    onChange={(e) => updateActivePlanningField('campoFormativo', e.target.value)}
                    className="bg-transparent text-zinc-850 dark:text-zinc-200 border-b border-transparent hover:border-zinc-200 focus:border-blue-500 outline-none w-full"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Duración Estimada</span>
                  <input
                    type="text"
                    value={activePlanning.duration}
                    onChange={(e) => updateActivePlanningField('duration', e.target.value)}
                    className="bg-transparent text-zinc-850 dark:text-zinc-200 border-b border-transparent hover:border-zinc-200 focus:border-blue-500 outline-none w-full"
                  />
                </div>
              </div>

              {/* Ejes Articuladores */}
              <div className="mb-6 flex flex-col gap-2">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Ejes Articuladores Vigentes</span>
                <div className="flex flex-wrap gap-2">
                  {activePlanning.ejesArticuladores.map((ejeName: string, idx: number) => {
                    const matchedEje = EJES_ARTICULADORES.find(e => e.name.toLowerCase().includes(ejeName.toLowerCase().substring(0, 8)));
                    const IconComp = matchedEje?.icon || BookOpen;
                    return (
                      <span 
                        key={idx}
                        className={`print-badge flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold border ${
                          matchedEje?.color || 'text-zinc-650 bg-zinc-50 border-zinc-200'
                        }`}
                      >
                        <IconComp className="h-3.5 w-3.5 flex-shrink-0" />
                        {ejeName}
                      </span>
                    );
                  })}
                  
                  {/* Selector rápido para añadir Eje (solo en pantalla) */}
                  <div className="relative inline-block no-print">
                    <select
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        if (!activePlanning.ejesArticuladores.includes(e.target.value)) {
                          updateActivePlanningField('ejesArticuladores', [...activePlanning.ejesArticuladores, e.target.value]);
                        }
                      }}
                      className="px-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold bg-zinc-50 dark:bg-zinc-950 text-zinc-500 outline-none cursor-pointer"
                    >
                      <option value="">+ Agregar Eje</option>
                      {EJES_ARTICULADORES.map((e, idx) => (
                        <option key={idx} value={e.name}>{e.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Limpiar Ejes (solo en pantalla) */}
                  {activePlanning.ejesArticuladores.length > 0 && (
                    <button
                      onClick={() => updateActivePlanningField('ejesArticuladores', [])}
                      className="no-print text-[9px] font-bold text-rose-500 hover:underline px-2"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {/* I. Proceso de Desarrollo de Aprendizaje (PDA) */}
              <div className="mb-6 border-l-4 border-blue-600 pl-4 py-0.5 flex flex-col gap-1.5">
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider flex items-center gap-1">
                  <Brain className="h-4 w-4" />
                  I. Proceso de Desarrollo de Aprendizaje (PDA)
                </span>
                <EditableField
                  value={activePlanning.pda}
                  onChange={(val) => updateActivePlanningField('pda', val)}
                  placeholder="Proceso de Desarrollo de Aprendizaje..."
                />
              </div>

              {/* II. Secuencia Didáctica */}
              <div className="mb-6 flex flex-col gap-4">
                <span className="text-[10px] text-zinc-950 dark:text-white font-black uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-850 pb-1.5 flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  II. Secuencia Didáctica (Metodología de Proyectos)
                </span>

                {/* Inicio */}
                <div className="flex flex-col gap-1.5 pl-2 print-avoid-break">
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">Inicio (Anticipación / Lluvia de ideas)</span>
                  <EditableField
                    value={activePlanning.inicio}
                    onChange={(val) => updateActivePlanningField('inicio', val)}
                    placeholder="Actividades de inicio..."
                  />
                </div>

                {/* Desarrollo */}
                <div className="flex flex-col gap-1.5 pl-2 print-avoid-break">
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">Desarrollo (Indagación / Aplicación práctica)</span>
                  <EditableField
                    value={activePlanning.desarrollo}
                    onChange={(val) => updateActivePlanningField('desarrollo', val)}
                    placeholder="Actividades de desarrollo..."
                  />
                </div>

                {/* Cierre */}
                <div className="flex flex-col gap-1.5 pl-2 print-avoid-break">
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wide">Cierre (Reflexión / Metacognición)</span>
                  <EditableField
                    value={activePlanning.cierre}
                    onChange={(val) => updateActivePlanningField('cierre', val)}
                    placeholder="Actividades de cierre..."
                  />
                </div>
              </div>

              {/* III. Evaluación Formativa y Evidencias */}
              <div className="mb-6 flex flex-col gap-2.5 print-avoid-break">
                <span className="text-[10px] text-zinc-950 dark:text-white font-black uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-850 pb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  III. Evaluación Formativa y Evidencia Sugerida
                </span>
                <div className="pl-2">
                  <EditableField
                    value={activePlanning.evaluacion}
                    onChange={(val) => updateActivePlanningField('evaluacion', val)}
                    placeholder="Criterios y evidencias de evaluación..."
                  />
                </div>
              </div>

              {/* IV. Materiales y Recursos Didácticos */}
              <div className="mb-8 flex flex-col gap-2.5 print-avoid-break">
                <span className="text-[10px] text-zinc-950 dark:text-white font-black uppercase tracking-wider border-b border-zinc-150 dark:border-zinc-850 pb-1.5 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  IV. Materiales y Recursos Didácticos
                </span>
                <div className="pl-2">
                  <EditableField
                    value={activePlanning.materiales}
                    onChange={(val) => updateActivePlanningField('materiales', val)}
                    placeholder="Materiales y recursos didácticos..."
                  />
                </div>
              </div>

              {/* Bloque de firmas */}
              <div className="grid grid-cols-2 gap-12 border-t border-zinc-100 dark:border-zinc-850 pt-8 mt-12 text-center text-xs font-semibold text-zinc-400 leading-normal print-avoid-break">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-36 border-b border-zinc-300 dark:border-zinc-700 h-10" />
                  <span className="text-zinc-600 dark:text-zinc-300 mt-2">Prof. {currentTeacher.first_name} {currentTeacher.last_name}</span>
                  <span className="text-[9px] uppercase tracking-wider">Docente Titular</span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <div className="w-36 border-b border-zinc-300 dark:border-zinc-700 h-10" />
                  <span className="text-zinc-650 dark:text-zinc-350 mt-2">Coordinación Académica</span>
                  <span className="text-[9px] uppercase tracking-wider">Firma de Aprobación</span>
                </div>
              </div>

              {/* Pie de página de impresión */}
              <div className="absolute bottom-4 right-8 left-8 flex justify-between text-[8.5px] text-zinc-400 font-mono no-print">
                <span>Generado vía ISkool IA</span>
                <span>Fecha: {activePlanning.createdAt}</span>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE AUXILIAR CAMPO DE TEXTO AUTO-EXPANDIBLE
// ==========================================

function EditableField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
    // Añadir manejador de cambio de tamaño de ventana para ajustar el alto
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className="w-full bg-transparent border border-transparent hover:border-zinc-200 focus:border-blue-500 focus:bg-blue-50/5 dark:focus:bg-zinc-950/20 py-2.5 px-3 rounded-xl text-xs text-zinc-700 dark:text-zinc-350 font-medium outline-none resize-none overflow-hidden transition-all leading-relaxed"
    />
  );
}
