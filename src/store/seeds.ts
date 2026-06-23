import {
  StudentStats,
  StudentAvatar,
  Badge,
  StudentBadge,
  Mission,
  Quest,
  QuestAttempt,
  PortfolioItem,
  PortfolioFeedback,
  PortfolioItemStatus,
  FeedbackAuthorRole,
  Subject,
  UserProfile,
  GuildBoss,
  GuildMemberSubmission,
  DetailedStudent,
  ClassSchedule,
  Group,
  SchoolSettings,
  Attendance,
  AttendanceStatus,
  ParentMessage,
  ShopArtifact,
  StudentMessage
} from '../types';

export const DEFAULT_ARTIFACTS_SEED: ShopArtifact[] = [
  { id: 'art-boots', name: 'Botas de Velocidad Escolar', description: 'Te permiten esquivar preguntas capciosas.', price: 10, icon: 'Footprints', effect: 'extra_attempt' },
  { id: 'art-shield', name: 'Escudo de Concentración', description: 'Bloquea las distracciones externas.', price: 15, icon: 'Shield', effect: 'extra_attempt' },
  { id: 'art-pen', name: 'Pluma de Fénix Escrita', description: 'Corrige automáticamente faltas de ortografía.', price: 20, icon: 'PenTool', effect: 'extra_attempt' },
  { id: 'art-potion', name: 'Poción de Enfoque', description: 'Restaura tu energía mental durante un examen.', price: 25, icon: 'Wine', effect: 'extra_attempt' },
  { id: 'art-scroll', name: 'Pergamino de Sabiduría', description: 'Revela la pista secreta de cualquier misión.', price: 30, icon: 'Scroll', effect: 'extra_attempt' },
  { id: 'art-dumbbell', name: 'Amuleto del Matemago', description: 'Duplica el daño contra enemigos de Matemáticas.', price: 35, icon: 'Dumbbell', effect: 'extra_attempt' },
  { id: 'art-water', name: 'Elixir de la Memoria', description: 'Te permite recordar una respuesta incorrecta.', price: 40, icon: 'GlassWater', effect: 'extra_attempt' },
  { id: 'art-ring', name: 'Anillo del Pensamiento Crítico', description: 'Aumenta tu inteligencia en +2 puntos.', price: 50, icon: 'Sparkles', effect: 'extra_attempt' },
  { id: 'art-cape', name: 'Capa del Gremio', description: 'Aumenta la defensa del grupo en +3 puntos.', price: 60, icon: 'Shirt', effect: 'extra_attempt' },
  { id: 'art-wand', name: 'Báculo del Saber', description: 'Dispara rayos de lógica pura que infligen daño.', price: 75, icon: 'Wand2', effect: 'extra_attempt' },
  { id: 'art-gem', name: 'Gema de la Sincronía', description: 'Permite realizar el Ataque Sincronizado.', price: 90, icon: 'Gem', effect: 'extra_attempt' },
  { id: 'art-clock', name: 'Reloj de Arena Escolar', description: 'Te da tiempo extra para cualquier examen.', price: 110, icon: 'Clock', effect: 'extra_attempt' },
  { id: 'art-crown', name: 'Corona del Innovador', description: 'Otorga un 10% adicional de créditos.', price: 130, icon: 'Crown', effect: 'extra_attempt' },
  { id: 'art-book', name: 'Libro de las Eras', description: 'Contiene las respuestas de los guardianes.', price: 150, icon: 'BookOpen', effect: 'extra_attempt' },
  { id: 'art-heart', name: 'Cristal de la Segunda Oportunidad', description: 'Un poderoso cristal que otorga un intento extra.', price: 200, icon: 'Heart', effect: 'extra_attempt' }
];

export const STUDENT_INVENTORY_SEED: Record<string, string[]> = {
  'std-sec': ['art-boots'],
  'std-prep': ['art-shield']
};

export const STUDENT_MESSAGES_SEED: StudentMessage[] = [
  {
    id: 'smsg-1',
    student_id: 'std-sec',
    title: '⚠️ Bienvenido al Gremio de Héroes',
    message: 'Se te han otorgado las Botas de Velocidad Escolar por tu excelente inicio en Secundaria.',
    sent_at: new Date().toISOString(),
    is_read: false
  }
];

export const SUBJECTS_SEED: Subject[] = [
  { id: 'sub-math', school_id: 'sch-1', level_grade_id: 'lg-4', name: 'Matemáticas', sep_code: 'MAT-4A', created_at: new Date().toISOString() },
  { id: 'sub-span', school_id: 'sch-1', level_grade_id: 'lg-4', name: 'Español', sep_code: 'ESP-4A', created_at: new Date().toISOString() },
  { id: 'sub-sci', school_id: 'sch-1', level_grade_id: 'lg-4', name: 'Ciencias Naturales', sep_code: 'CIE-4A', created_at: new Date().toISOString() }
];

export const BADGES_SEED: Badge[] = [
  { id: 'badge-1', name: 'Matemago de Bronce', description: 'Resuelve tu primera misión de Matemáticas con racha perfecta.', icon_name: 'Calculator', category: 'academic', xp_required: 100, created_at: new Date().toISOString() },
  { id: 'badge-2', name: 'Lector de las Galaxias', description: 'Sube un audio leyendo en voz alta al portafolio.', icon_name: 'BookOpen', category: 'academic', xp_required: 150, created_at: new Date().toISOString() },
  { id: 'badge-3', name: 'Espíritu Indomable', description: 'Completa un reto después de haber fallado en el primer intento.', icon_name: 'Sparkles', category: 'persistence', xp_required: 200, created_at: new Date().toISOString() },
  { id: 'badge-4', name: 'Creador de Universos', description: 'Sube una evidencia artística o dibujo digital de alta calidad.', icon_name: 'Palette', category: 'creative', xp_required: 150, created_at: new Date().toISOString() },
  { id: 'badge-5', name: 'Compañero Estelar', description: 'Realiza una coevaluación constructiva para un compañero.', icon_name: 'Users', category: 'social', xp_required: 100, created_at: new Date().toISOString() },
  { id: 'badge-6', name: 'Racha del Sol', description: 'Mantén una racha de actividad diaria de 5 días seguidos.', icon_name: 'Flame', category: 'persistence', xp_required: 300, created_at: new Date().toISOString() }
];

// Misiones Muestra
export const MISSIONS_SEED: Mission[] = [
  {
    id: 'mis-fractions',
    school_id: 'sch-1',
    subject_id: 'sub-math',
    level_grade_id: 'lg-4',
    title: 'La Aventura de las Fracciones',
    description: 'Ayuda a reparar la nave del Explorador Lucas dividiendo la energía en partes iguales.',
    story_intro: 'El explorador Lucas aterrizó en un planeta desconocido. Su propulsor de hipervelocidad se rompió y necesita piezas divididas exactamente en partes iguales para poder encenderlo. ¡Solo las matemáticas pueden salvar la misión!',
    map_position_x: 20,
    map_position_y: 60,
    is_active: true,
    created_at: new Date().toISOString(),
    quests: [
      {
        id: 'q-fractions-1',
        mission_id: 'mis-fractions',
        title: 'El Pastel Dividido',
        description: 'Aprende a identificar las partes del numerador y denominador en ejemplos deliciosos.',
        type: 'quiz',
        sequence_order: 1,
        xp_reward: 100,
        coins_reward: 15,
        created_at: new Date().toISOString(),
        campos_formativos: ['Saberes y Pensamiento Científico'],
        ejes_articuladores: ['Pensamiento Crítico'],
        pdas: ['Fase 4 - Saberes y Pensamiento Científico: Resuelve problemas de reparto con fracciones (medios, cuartos, octavos).'],
        content: {
          questions: [
            {
              id: 'q1',
              question: 'Si dividimos un pastel en 4 partes iguales y nos comemos 3 partes, ¿qué fracción queda en la mesa?',
              options: ['3/4', '1/4', '4/3', '2/4'],
              correctAnswerIndex: 1,
              explanation: '¡Exacto! Nos comimos 3 partes, por lo tanto queda 1 de las 4 partes, es decir, 1/4.'
            },
            {
              id: 'q2',
              question: '¿Cómo se llama el número de arriba en una fracción que indica las partes que tomamos?',
              options: ['Denominador', 'Numerador', 'Dividendo', 'Fraccionario'],
              correctAnswerIndex: 1,
              explanation: '¡Muy bien! El Numerador es el número de arriba e indica las partes seleccionadas. El Denominador (abajo) indica el total de partes.'
            }
          ]
        }
      },
      {
        id: 'q-fractions-2',
        mission_id: 'mis-fractions',
        title: 'Fraccionando en Casa',
        description: 'Dibuja una pizza o pastel en tu cuaderno representando 5/8, tómale una foto y compártela en tu portafolio.',
        type: 'portfolio_submission',
        sequence_order: 2,
        xp_reward: 150,
        coins_reward: 25,
        created_at: new Date().toISOString(),
        campos_formativos: ['Saberes y Pensamiento Científico'],
        ejes_articuladores: ['Pensamiento Crítico'],
        pdas: ['Fase 4 - Saberes y Pensamiento Científico: Resuelve problemas de reparto con fracciones (medios, cuartos, octavos).'],
        content: {
          instructions: '1. Dibuja un círculo grande en tu cuaderno.\n2. Divídelo en 8 partes iguales.\n3. Colorea exactamente 5 partes.\n4. Escribe la fracción 5/8.\n5. Tómale una foto y súbela aquí.',
          acceptedFormats: ['image']
        }
      }
    ]
  },
  {
    id: 'mis-selva',
    school_id: 'sch-1',
    subject_id: 'sub-span',
    level_grade_id: 'lg-4',
    title: 'Guardianes de la Selva Lacandona',
    description: 'Recupera el manuscrito antiguo de las leyendas mayas usando el poder de tu voz.',
    story_intro: 'El sabio del Templo del Jaguar ha perdido su voz y no puede recitar la antigua leyenda. Necesita de un estudiante valiente que lee el poema sagrado con excelente entonación para despertar la lluvia.',
    map_position_x: 75,
    map_position_y: 35,
    is_active: true,
    created_at: new Date().toISOString(),
    quests: [
      {
        id: 'q-selva-1',
        mission_id: 'mis-selva',
        title: 'La Leyenda del Jaguar',
        description: 'Lee la leyenda y responde preguntas sobre los personajes.',
        type: 'quiz',
        sequence_order: 1,
        xp_reward: 80,
        coins_reward: 10,
        created_at: new Date().toISOString(),
        campos_formativos: ['Lenguajes'],
        ejes_articuladores: ['Fomento a la Lectura', 'Artes y Exp. Estéticas'],
        pdas: ['Fase 4 - Lenguajes: Lee y analiza leyendas y poemas tradicionales para valorar la diversidad cultural.'],
        content: {
          questions: [
            {
              id: 'qs1',
              question: '¿Por qué el jaguar pintó sus manchas en la historia?',
              options: ['Para esconderse en la noche', 'Como medallas otorgadas por la Luna', 'Por caerse en un pozo de lodo', 'Para asustar a los monos'],
              correctAnswerIndex: 1,
              explanation: '¡Excelente! En la leyenda maya, la Luna le regala las manchas al jaguar como medallas por su valentía.'
            }
          ]
        }
      },
      {
        id: 'q-selva-2',
        mission_id: 'mis-selva',
        title: 'El Susurro de la Lluvia',
        description: 'Graba un audio leyendo el poema maya del jaguar y súbelo.',
        type: 'portfolio_submission',
        sequence_order: 2,
        xp_reward: 150,
        coins_reward: 30,
        created_at: new Date().toISOString(),
        campos_formativos: ['Lenguajes'],
        ejes_articuladores: ['Fomento a la Lectura', 'Artes y Exp. Estéticas'],
        pdas: ['Fase 4 - Lenguajes: Lee y analiza leyendas y poemas tradicionales para valorar la diversidad cultural.'],
        content: {
          instructions: 'Lee el siguiente fragmento en voz alta con entonación:\n"Bajo las sombras del ceiba milenario, ruge el jaguar con ojos de fuego."\nGraba tu voz y súbela aquí.',
          acceptedFormats: ['audio']
        }
      }
    ]
  }
];

// Lista de Estudiantes de los 4 Niveles Educativos
export const STUDENTS_LIST_SEED: UserProfile[] = [
  { id: 'std-pb', first_name: 'Santi', last_name: 'Gómez', role: 'student', email: 'santi@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Primaria Baja (1º)
  { id: 'std-pa', first_name: 'Lucas', last_name: 'Skywalker', role: 'student', email: 'lucas@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Primaria Alta (4º)
  { id: 'std-sec', first_name: 'Elena', last_name: 'Rostova', role: 'student', email: 'elena@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Secundaria (2º)
  { id: 'std-prep', first_name: 'Mateo', last_name: 'Díaz', role: 'student', email: 'mateo@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Preparatoria (4º Sem)
  { id: 'std-sem-p1', first_name: 'Sofía', last_name: 'Castro', role: 'student', email: 'sofia.castro@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'std-sem-p2', first_name: 'Miguel', last_name: 'Ortiz', role: 'student', email: 'miguel.ortiz@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'std-sem-p3', first_name: 'Valentina', last_name: 'Hernández', role: 'student', email: 'valentina.hernandez@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'std-sem-s1', first_name: 'Alejandro', last_name: 'Flores', role: 'student', email: 'alejandro.flores@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'std-sem-s2', first_name: 'Camila', last_name: 'Jiménez', role: 'student', email: 'camila.jimenez@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'std-sem-s3', first_name: 'Diego', last_name: 'Vargas', role: 'student', email: 'diego.vargas@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'std-sem-h1', first_name: 'Isabella', last_name: 'Montes', role: 'student', email: 'isabella.montes@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'std-sem-h2', first_name: 'Leonardo', last_name: 'Soto', role: 'student', email: 'leonardo.soto@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'std-sem-h3', first_name: 'Natalia', last_name: 'Cruz', role: 'student', email: 'natalia.cruz@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

export const GROUPS_SEED: Group[] = [
  { id: 'grp-pb-a', school_id: 'sch-1', level_grade_id: 'primaria-1º', academic_year_id: 'ay-25-26', name: 'A', created_at: new Date().toISOString() },
  { id: 'grp-pa-a', school_id: 'sch-1', level_grade_id: 'primaria-4º', academic_year_id: 'ay-25-26', name: 'A', created_at: new Date().toISOString() },
  { id: 'grp-sec-a', school_id: 'sch-1', level_grade_id: 'secundaria-2º', academic_year_id: 'ay-25-26', name: 'A', created_at: new Date().toISOString() },
  { id: 'grp-prep-a', school_id: 'sch-1', level_grade_id: 'preparatoria-4ºSemestre', academic_year_id: 'ay-25-26', name: 'A', created_at: new Date().toISOString() }
];

export const DETAILED_STUDENTS_SEED: DetailedStudent[] = [
  {
    id: 'std-pb',
    first_name: 'Santi',
    second_name: 'Aurelio',
    last_name_1: 'Gómez',
    last_name_2: 'Pérez',
    birth_date: '2019-05-15',
    curp: 'GOPA190515HDFMRN01',
    enrollment_id: 'MAT-2025-001',
    gender: 'Masculino',
    shift: 'matutino',
    status: 'activo',
    previous_school: 'Jardín de Niños Pipila',
    photo_url: '/images/students/santi.png',
    address: 'Av. Juárez 123, Col. Centro, CDMX',
    phone: '555-123-4567',
    email: 'santi@iskool.edu.mx',
    father_name: 'Roberto Gómez',
    mother_name: 'Gabriela Pérez',
    tutor_name: 'Roberto Gómez',
    emergency_contact_name: 'Gabriela Pérez',
    emergency_contact_phone: '555-987-6543',
    blood_type: 'O+',
    medical_notes: 'Alergia al polen. No requiere medicamento diario.',
    academic_notes: 'Excelente alumno, participa mucho en clase.',
    level: 'primaria',
    grade: '1º',
    group_id: 'grp-pb-a',
    pending_payments: ["Colegiatura Junio 2026", "Inscripción Ciclo Escolar 2026-2027"],
    behavior_reports: [],
    teacher_notes: [{ date: "2026-06-02", note: "Santi es muy participativo en clase de matemáticas, comprendió rápido las figuras geométricas.", teacher_name: "Israel López" }]
  },
  {
    id: 'std-pa',
    first_name: 'Lucas',
    second_name: 'Caelum',
    last_name_1: 'Skywalker',
    last_name_2: 'Organa',
    birth_date: '2016-10-22',
    curp: 'SKOL161022HDFMRN02',
    enrollment_id: 'MAT-2025-002',
    gender: 'Masculino',
    shift: 'matutino',
    status: 'activo',
    previous_school: 'Colegio del Bosque',
    photo_url: '/images/students/lucas.png',
    address: 'Calle del Sol 45, Tattoine, EdoMex',
    phone: '555-234-5678',
    email: 'lucas@iskool.edu.mx',
    father_name: 'Anakin Skywalker',
    mother_name: 'Padmé Amidala',
    tutor_name: 'Anakin Skywalker',
    emergency_contact_name: 'Anakin Skywalker',
    emergency_contact_phone: '555-876-5432',
    blood_type: 'A+',
    medical_notes: 'Ninguna alergia reportada.',
    academic_notes: 'Muestra gran interés en las fracciones y las ciencias.',
    level: 'primaria',
    grade: '4º',
    group_id: 'grp-pa-a',
    pending_payments: [],
    behavior_reports: [{ date: "2026-05-18", description: "Lucas se distrajo usando un juguete durante la explicación de ciencias naturales.", reporter: "Israel López" }],
    teacher_notes: [{ date: "2026-05-20", note: "Lucas demostró excelente comprensión del tema de fracciones.", teacher_name: "Israel López" }]
  },
  {
    id: 'std-sec',
    first_name: 'Elena',
    second_name: 'Natasha',
    last_name_1: 'Rostova',
    last_name_2: 'Bolonskaya',
    birth_date: '2012-03-08',
    curp: 'ROBE120308MDFMRN03',
    enrollment_id: 'MAT-2024-054',
    gender: 'Femenino',
    shift: 'vespertino',
    status: 'activo',
    previous_school: 'Primaria Justo Sierra',
    photo_url: '/images/students/elena.png',
    address: 'Paseo de la Reforma 999, CDMX',
    phone: '555-345-6789',
    email: 'elena@iskool.edu.mx',
    father_name: 'Ilya Rostov',
    mother_name: 'Natalia Rostova',
    tutor_name: 'Natalia Rostova',
    emergency_contact_name: 'Ilya Rostov',
    emergency_contact_phone: '555-765-4321',
    blood_type: 'B-',
    medical_notes: 'Asma leve. Trae inhalador en su mochila.',
    academic_notes: 'Líder en las actividades del gremio. Alto nivel en ciencias.',
    level: 'secundaria',
    grade: '2º',
    group_id: 'grp-sec-a',
    pending_payments: ["Uniforme Deportivo"],
    behavior_reports: [],
    teacher_notes: [{ date: "2026-06-05", note: "Elena lideró de manera muy organizada el proyecto científico del biodigestor.", teacher_name: "Israel López" }]
  },
  {
    id: 'std-prep',
    first_name: 'Mateo',
    second_name: 'Benjamín',
    last_name_1: 'Díaz',
    last_name_2: 'Hernández',
    birth_date: '2009-11-30',
    curp: 'DIHM091130HDFMRN04',
    enrollment_id: 'MAT-2023-112',
    gender: 'Masculino',
    shift: 'matutino',
    status: 'activo',
    previous_school: 'Secundaria 14',
    photo_url: '/images/students/mateo.png',
    address: 'Av. Insurgentes Sur 55, CDMX',
    phone: '555-456-7890',
    email: 'mateo@iskool.edu.mx',
    father_name: 'Pedro Díaz',
    mother_name: 'Patricia Hernández',
    tutor_name: 'Pedro Díaz',
    emergency_contact_name: 'Pedro Díaz',
    emergency_contact_phone: '555-654-3210',
    blood_type: 'O-',
    medical_notes: 'Alergia alimentaria a las nueces.',
    academic_notes: 'Proactivo, excelente coevaluador y desempeño en el proyecto de biodigestor.',
    level: 'preparatoria',
    grade: '4º Semestre',
    group_id: 'grp-prep-a',
    pending_payments: ["Colegiatura Junio 2026"],
    behavior_reports: [{ date: "2026-04-12", description: "Mateo fue sorprendido copiando en el quiz de prueba. Se habló con él y reconoció el error.", reporter: "Israel López" }],
    teacher_notes: [{ date: "2026-05-10", note: "Mateo es un excelente coevaluador y ofrece críticas muy constructivas.", teacher_name: "Israel López" }]
  },
  {
    id: 'std-sem-p1',
    first_name: 'Sofía',
    second_name: 'Regina',
    last_name_1: 'Castro',
    last_name_2: 'Ruiz',
    birth_date: '2018-02-14',
    curp: 'CARS180214MDFMRN01',
    enrollment_id: 'MAT-2026-601',
    gender: 'Femenino',
    shift: 'matutino',
    status: 'activo',
    previous_school: 'Jardín de Niños México',
    photo_url: '/images/students/default.png',
    address: 'Av. Coyoacán 100, CDMX',
    phone: '555-601-0001',
    email: 'sofia.castro@iskool.edu.mx',
    father_name: 'Hugo Castro',
    mother_name: 'Regina Ruiz',
    blood_type: 'A+',
    medical_notes: '',
    academic_notes: 'Excelente disposición al juego colaborativo.',
    level: 'primaria',
    grade: '2º',
    pending_payments: ["Uniforme Escolar"],
    behavior_reports: [],
    teacher_notes: []
  },
  {
    id: 'std-sem-p2',
    first_name: 'Miguel',
    second_name: 'Ángel',
    last_name_1: 'Ortiz',
    last_name_2: 'Medina',
    birth_date: '2017-08-22',
    curp: 'OIMM170822HDFMRN02',
    enrollment_id: 'MAT-2026-602',
    gender: 'Masculino',
    shift: 'matutino',
    status: 'activo',
    previous_school: 'Colegio Anglo',
    photo_url: '/images/students/default.png',
    address: 'Calle 10, Col. San Pedro, CDMX',
    phone: '555-602-0002',
    email: 'miguel.ortiz@iskool.edu.mx',
    father_name: 'Angel Ortiz',
    mother_name: 'Laura Medina',
    blood_type: 'O+',
    medical_notes: 'Intolerancia a la lactosa.',
    academic_notes: 'Muestra interés en lectura y dibujo.',
    level: 'primaria',
    grade: '3º',
    pending_payments: [],
    behavior_reports: [],
    teacher_notes: []
  },
  {
    id: 'std-sem-p3',
    first_name: 'Valentina',
    last_name_1: 'Hernández',
    last_name_2: 'Silva',
    birth_date: '2015-04-10',
    curp: 'HESV150410MDFMRN03',
    enrollment_id: 'MAT-2026-603',
    gender: 'Femenino',
    shift: 'vespertino',
    status: 'activo',
    previous_school: 'Primaria Niños Héroes',
    photo_url: '/images/students/default.png',
    address: 'Paseo del Río 456, CDMX',
    phone: '555-603-0003',
    email: 'valentina.hernandez@iskool.edu.mx',
    tutor_name: 'Gloria Silva',
    blood_type: 'B+',
    medical_notes: '',
    academic_notes: 'Alumna atenta, muy participativa en actividades artísticas.',
    level: 'primaria',
    grade: '5º',
    pending_payments: ["Colegiatura Junio 2026"],
    behavior_reports: [],
    teacher_notes: []
  },
  {
    id: 'std-sem-s1',
    first_name: 'Alejandro',
    last_name_1: 'Flores',
    last_name_2: 'Torres',
    birth_date: '2013-11-05',
    curp: 'FOTA131105HDFMRN04',
    enrollment_id: 'MAT-2026-604',
    gender: 'Masculino',
    shift: 'matutino',
    status: 'activo',
    previous_school: 'Primaria Benito Juárez',
    photo_url: '/images/students/default.png',
    address: 'Colima 321, Roma Norte, CDMX',
    phone: '555-604-0004',
    email: 'alejandro.flores@iskool.edu.mx',
    father_name: 'Pedro Flores',
    blood_type: 'O-',
    medical_notes: 'Usa lentes para leer.',
    academic_notes: 'Gran desempeño en informática y cómputo.',
    level: 'secundaria',
    grade: '1º',
    pending_payments: [],
    behavior_reports: [],
    teacher_notes: []
  },
  {
    id: 'std-sem-s2',
    first_name: 'Camila',
    second_name: 'Ximena',
    last_name_1: 'Jiménez',
    last_name_2: 'Lara',
    birth_date: '2012-05-25',
    curp: 'JILC120525MDFMRN05',
    enrollment_id: 'MAT-2026-605',
    gender: 'Femenino',
    shift: 'vespertino',
    status: 'activo',
    previous_school: 'Secundaria 45',
    photo_url: '/images/students/default.png',
    address: 'Durango 12, Roma Norte, CDMX',
    phone: '555-605-0005',
    email: 'camila.jimenez@iskool.edu.mx',
    mother_name: 'Alicia Lara',
    blood_type: 'A-',
    medical_notes: 'Alergia menor al polvo.',
    academic_notes: 'Líder nata en trabajos en equipo.',
    level: 'secundaria',
    grade: '2º',
    pending_payments: ["Credencial Escolar"],
    behavior_reports: [],
    teacher_notes: []
  },
  {
    id: 'std-sem-s3',
    first_name: 'Diego',
    second_name: 'Armando',
    last_name_1: 'Vargas',
    last_name_2: 'Ríos',
    birth_date: '2011-09-15',
    curp: 'VARD110915HDFMRN06',
    enrollment_id: 'MAT-2026-606',
    gender: 'Masculino',
    shift: 'matutino',
    status: 'activo',
    previous_school: 'Colegio Patria',
    photo_url: '/images/students/default.png',
    address: 'Av. Universidad 800, CDMX',
    phone: '555-606-0006',
    email: 'diego.vargas@iskool.edu.mx',
    father_name: 'Armando Vargas',
    mother_name: 'Sofía Ríos',
    blood_type: 'AB+',
    medical_notes: '',
    academic_notes: 'Excelente aptitud deportiva y matemática.',
    level: 'secundaria',
    grade: '3º',
    pending_payments: [],
    behavior_reports: [],
    teacher_notes: []
  },
  {
    id: 'std-sem-h1',
    first_name: 'Isabella',
    last_name_1: 'Montes',
    last_name_2: 'Delgado',
    birth_date: '2010-07-30',
    curp: 'MODI100730MDFMRN07',
    enrollment_id: 'MAT-2026-607',
    gender: 'Femenino',
    shift: 'matutino',
    status: 'activo',
    previous_school: 'Secundaria 10',
    photo_url: '/images/students/default.png',
    address: 'Insurgentes Mixcoac 44, CDMX',
    phone: '555-607-0007',
    email: 'isabella.montes@iskool.edu.mx',
    mother_name: 'Gabriela Delgado',
    blood_type: 'O+',
    medical_notes: '',
    academic_notes: 'Interés por las ciencias sociales y debates.',
    level: 'preparatoria',
    grade: '2º Semestre',
    pending_payments: ["Colegiatura Junio 2026"],
    behavior_reports: [],
    teacher_notes: []
  },
  {
    id: 'std-sem-h2',
    first_name: 'Leonardo',
    second_name: 'Daniel',
    last_name_1: 'Soto',
    last_name_2: 'Luna',
    birth_date: '2009-12-18',
    curp: 'SOLL091218HDFMRN08',
    enrollment_id: 'MAT-2026-608',
    gender: 'Masculino',
    shift: 'matutino',
    status: 'activo',
    previous_school: 'Secundaria Técnica 1',
    photo_url: '/images/students/default.png',
    address: 'Félix Cuevas 99, CDMX',
    phone: '555-608-0008',
    email: 'leonardo.soto@iskool.edu.mx',
    father_name: 'Daniel Soto',
    blood_type: 'A+',
    medical_notes: 'Asma bajo control.',
    academic_notes: 'Habilidades lógicas muy altas, propenso a las ciencias exactas.',
    level: 'preparatoria',
    grade: '4º Semestre',
    pending_payments: [],
    behavior_reports: [],
    teacher_notes: []
  },
  {
    id: 'std-sem-h3',
    first_name: 'Natalia',
    second_name: 'Guadalupe',
    last_name_1: 'Cruz',
    last_name_2: 'Peña',
    birth_date: '2008-10-02',
    curp: 'CUPN081002MDFMRN09',
    enrollment_id: 'MAT-2026-609',
    gender: 'Femenino',
    shift: 'matutino',
    status: 'activo',
    previous_school: 'Secundaria Diurna 14',
    photo_url: '/images/students/default.png',
    address: 'Homero 1200, Polanco, CDMX',
    phone: '555-609-0009',
    email: 'natalia.cruz@iskool.edu.mx',
    father_name: 'Ramón Cruz',
    mother_name: 'Elena Peña',
    blood_type: 'B-',
    medical_notes: '',
    academic_notes: 'Proactiva y líder escolar. Organiza círculos de estudio.',
    level: 'preparatoria',
    grade: '6º Semestre',
    pending_payments: ["Taller de Robótica"],
    behavior_reports: [],
    teacher_notes: []
  }
];

export const SCHEDULES_SEED: ClassSchedule[] = [
  { id: 'sch-1', groupId: 'grp-pa-a', subjectId: 'sub-math', teacherId: 'usr-teacher-1', dayOfWeek: 'Lunes', timeSlot: '08:00 - 09:30' },
  { id: 'sch-2', groupId: 'grp-pa-a', subjectId: 'sub-span', teacherId: 'usr-teacher-1', dayOfWeek: 'Martes', timeSlot: '09:30 - 11:00' },
  { id: 'sch-3', groupId: 'grp-pa-a', subjectId: 'sub-sci', teacherId: 'usr-teacher-1', dayOfWeek: 'Miércoles', timeSlot: '08:00 - 09:30' },
  { id: 'sch-4', groupId: 'grp-sec-a', subjectId: 'sub-sci', teacherId: 'usr-teacher-1', dayOfWeek: 'Jueves', timeSlot: '11:30 - 13:00' },
  { id: 'sch-5', groupId: 'grp-prep-a', subjectId: 'sub-sci', teacherId: 'usr-teacher-1', dayOfWeek: 'Viernes', timeSlot: '10:00 - 11:30' }
];

export const TEACHER_SEED: UserProfile = {
  id: 'usr-teacher-1',
  first_name: 'Israel',
  last_name: 'López',
  role: 'teacher',
  email: 'israel.lopez@iskool.edu.mx',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const PARENT_SEED: UserProfile = {
  id: 'usr-parent-1',
  first_name: 'Carlos',
  last_name: 'Skywalker',
  role: 'parent',
  email: 'carlos.sky@mail.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Estadísticas de los 4 Estudiantes
export const STATS_MAP_SEED: Record<string, StudentStats> = {
  'std-pb': {
    student_id: 'std-pb', xp: 80, level: 1, coins: 25, current_streak: 2, max_streak: 2, updated_at: new Date().toISOString()
  },
  'std-pa': {
    student_id: 'std-pa', xp: 180, level: 2, coins: 45, current_streak: 3, max_streak: 5, last_active_date: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString()
  },
  'std-sec': {
    student_id: 'std-sec', xp: 350, level: 4, coins: 120, current_streak: 6, max_streak: 10, updated_at: new Date().toISOString(),
    rpg_class: 'mago', attribute_strength: 8, attribute_intelligence: 18, attribute_defense: 12, skill_points: 2
  },
  'std-prep': {
    student_id: 'std-prep', xp: 500, level: 5, coins: 200, current_streak: 4, max_streak: 8, updated_at: new Date().toISOString(),
    funding_credits: 1250
  },
  'std-sem-p1': {
    student_id: 'std-sem-p1', xp: 120, level: 1, coins: 35, current_streak: 3, max_streak: 4, updated_at: new Date().toISOString()
  },
  'std-sem-p2': {
    student_id: 'std-sem-p2', xp: 50, level: 1, coins: 10, current_streak: 1, max_streak: 2, updated_at: new Date().toISOString()
  },
  'std-sem-p3': {
    student_id: 'std-sem-p3', xp: 210, level: 2, coins: 50, current_streak: 4, max_streak: 6, updated_at: new Date().toISOString()
  },
  'std-sem-s1': {
    student_id: 'std-sem-s1', xp: 290, level: 3, coins: 80, current_streak: 5, max_streak: 7, updated_at: new Date().toISOString(),
    rpg_class: 'guerrero', attribute_strength: 15, attribute_intelligence: 10, attribute_defense: 15, skill_points: 1
  },
  'std-sem-s2': {
    student_id: 'std-sem-s2', xp: 380, level: 4, coins: 130, current_streak: 7, max_streak: 12, updated_at: new Date().toISOString(),
    rpg_class: 'curandero', attribute_strength: 8, attribute_intelligence: 16, attribute_defense: 14, skill_points: 0
  },
  'std-sem-s3': {
    student_id: 'std-sem-s3', xp: 420, level: 4, coins: 160, current_streak: 8, max_streak: 10, updated_at: new Date().toISOString(),
    rpg_class: 'explorador', attribute_strength: 12, attribute_intelligence: 12, attribute_defense: 10, skill_points: 3
  },
  'std-sem-h1': {
    student_id: 'std-sem-h1', xp: 450, level: 5, coins: 190, current_streak: 3, max_streak: 8, updated_at: new Date().toISOString(),
    funding_credits: 1100
  },
  'std-sem-h2': {
    student_id: 'std-sem-h2', xp: 520, level: 6, coins: 220, current_streak: 5, max_streak: 9, updated_at: new Date().toISOString(),
    funding_credits: 1350
  },
  'std-sem-h3': {
    student_id: 'std-sem-h3', xp: 600, level: 7, coins: 300, current_streak: 9, max_streak: 15, updated_at: new Date().toISOString(),
    funding_credits: 1600
  }
};

// Avatares y Mascotas de los 4 Estudiantes
export const AVATAR_MAP_SEED: Record<string, StudentAvatar> = {
  'std-pb': {
    student_id: 'std-pb', avatar_name: 'Santito', hair_style: 'classic', hair_color: '#4B5563', eyes_style: 'happy', outfit_style: 'explorer', outfit_color: '#3B82F6', background_style: 'forest', unlocked_items: ['classic', 'happy', 'explorer', 'forest'],
    pet_type: 'dragon', pet_name: 'Llamita', pet_hunger: 40, pet_happiness: 75, pet_outfit: 'none', updated_at: new Date().toISOString()
  },
  'std-pa': {
    student_id: 'std-pa', avatar_name: 'Lukin', hair_style: 'spiky', hair_color: '#FBBF24', eyes_style: 'sparkle', outfit_style: 'explorer', outfit_color: '#10B981', background_style: 'forest', unlocked_items: ['classic', 'happy', 'space_suit', 'nebula', 'spiky', 'sparkle', 'explorer', 'forest'], updated_at: new Date().toISOString()
  },
  'std-sec': {
    student_id: 'std-sec', avatar_name: 'Elenix', hair_style: 'wizard_hat', hair_color: '#8B5CF6', eyes_style: 'sparkle', outfit_style: 'purple', outfit_color: '#6D28D9', background_style: 'nebula', unlocked_items: ['classic', 'happy', 'wizard_hat', 'purple', 'nebula', 'sparkle'], updated_at: new Date().toISOString()
  },
  'std-prep': {
    student_id: 'std-prep', avatar_name: 'MateoCode', hair_style: 'spiky', hair_color: '#1F2937', eyes_style: 'happy', outfit_style: 'space_suit', outfit_color: '#6B7280', background_style: 'nebula', unlocked_items: ['classic', 'happy', 'space_suit', 'nebula', 'spiky'], updated_at: new Date().toISOString()
  },
  'std-sem-p1': {
    student_id: 'std-sem-p1', avatar_name: 'Sofi', hair_style: 'classic', hair_color: '#EC4899', eyes_style: 'happy', outfit_style: 'explorer', outfit_color: '#EC4899', background_style: 'forest', unlocked_items: ['classic', 'happy', 'explorer', 'forest'],
    pet_type: 'gatito', pet_name: 'Mishi', pet_hunger: 30, pet_happiness: 80, pet_outfit: 'none', updated_at: new Date().toISOString()
  },
  'std-sem-p2': {
    student_id: 'std-sem-p2', avatar_name: 'Migue', hair_style: 'spiky', hair_color: '#1E3A8A', eyes_style: 'happy', outfit_style: 'explorer', outfit_color: '#1E3A8A', background_style: 'forest', unlocked_items: ['classic', 'happy', 'explorer', 'forest'],
    pet_type: 'lobo', pet_name: 'Lobo', pet_hunger: 60, pet_happiness: 60, pet_outfit: 'none', updated_at: new Date().toISOString()
  },
  'std-sem-p3': {
    student_id: 'std-sem-p3', avatar_name: 'Vale', hair_style: 'classic', hair_color: '#D97706', eyes_style: 'sparkle', outfit_style: 'explorer', outfit_color: '#D97706', background_style: 'forest', unlocked_items: ['classic', 'happy', 'space_suit', 'nebula', 'sparkle', 'explorer', 'forest'], updated_at: new Date().toISOString()
  },
  'std-sem-s1': {
    student_id: 'std-sem-s1', avatar_name: 'Alex', hair_style: 'spiky', hair_color: '#4B5563', eyes_style: 'happy', outfit_style: 'purple', outfit_color: '#4B5563', background_style: 'nebula', unlocked_items: ['classic', 'happy', 'purple', 'nebula', 'spiky'], updated_at: new Date().toISOString()
  },
  'std-sem-s2': {
    student_id: 'std-sem-s2', avatar_name: 'Cami', hair_style: 'classic', hair_color: '#10B981', eyes_style: 'sparkle', outfit_style: 'purple', outfit_color: '#10B981', background_style: 'nebula', unlocked_items: ['classic', 'happy', 'purple', 'nebula', 'sparkle'], updated_at: new Date().toISOString()
  },
  'std-sem-s3': {
    student_id: 'std-sem-s3', avatar_name: 'Dieguito', hair_style: 'spiky', hair_color: '#FBBF24', eyes_style: 'happy', outfit_style: 'purple', outfit_color: '#FBBF24', background_style: 'nebula', unlocked_items: ['classic', 'happy', 'purple', 'nebula', 'spiky'], updated_at: new Date().toISOString()
  },
  'std-sem-h1': {
    student_id: 'std-sem-h1', avatar_name: 'Isa', hair_style: 'classic', hair_color: '#8B5CF6', eyes_style: 'sparkle', outfit_style: 'space_suit', outfit_color: '#8B5CF6', background_style: 'nebula', unlocked_items: ['classic', 'happy', 'space_suit', 'nebula', 'sparkle'], updated_at: new Date().toISOString()
  },
  'std-sem-h2': {
    student_id: 'std-sem-h2', avatar_name: 'Leo', hair_style: 'spiky', hair_color: '#3B82F6', eyes_style: 'happy', outfit_style: 'space_suit', outfit_color: '#3B82F6', background_style: 'nebula', unlocked_items: ['classic', 'happy', 'space_suit', 'nebula', 'spiky'], updated_at: new Date().toISOString()
  },
  'std-sem-h3': {
    student_id: 'std-sem-h3', avatar_name: 'Naty', hair_style: 'classic', hair_color: '#EF4444', eyes_style: 'sparkle', outfit_style: 'space_suit', outfit_color: '#EF4444', background_style: 'nebula', unlocked_items: ['classic', 'happy', 'space_suit', 'nebula', 'sparkle'], updated_at: new Date().toISOString()
  }
};

export const PORTFOLIO_SEED: PortfolioItem[] = [
  {
    id: 'port-1',
    student_id: 'std-pa',
    subject_id: 'sub-math',
    quest_id: 'q-fractions-2',
    title: 'Mi Pizza de Fracciones (5/8)',
    description: 'Dibujé una pizza con pepperoni y champiñones para representar 5/8.',
    file_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400',
    file_type: 'image',
    status: 'approved',
    self_reflection: 'Me costó un poco dividir el círculo en 8 partes iguales, pero al final usé una regla y me quedó muy bien.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    student_profile: STUDENTS_LIST_SEED[1],
    subject: SUBJECTS_SEED[0],
    feedbacks: [
      {
        id: 'fb-1',
        portfolio_item_id: 'port-1',
        author_id: 'usr-teacher-1',
        author_role: 'teacher',
        feedback_text: '¡Excelente trabajo, Lucas! Tu representación gráfica es muy clara.',
        reactions: { teacher: ['❤️', '👏'] },
        created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        author_profile: TEACHER_SEED
      }
    ]
  },
  {
    id: 'port-prep-1',
    student_id: 'std-prep',
    subject_id: 'sub-sci',
    title: 'Simulación de Biodigestor de Residuos',
    description: 'Reporte ejecutivo y diagrama de flujo para implementar un biodigestor en la cafetería escolar.',
    file_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400',
    file_type: 'image',
    status: 'submitted',
    self_reflection: 'Propuse un reactor anaeróbico de bajo costo. La tasa de retorno de inversión es de 14 meses vendiendo biogás.',
    peer_review_score: 9.2,
    peer_review_comments: 'Muy buena justificación económica. El diagrama de balance de masas tiene un pequeño error en el flujo de lodos.',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    student_profile: STUDENTS_LIST_SEED[3],
    subject: SUBJECTS_SEED[2],
    feedbacks: []
  }
];

export const BOSS_SEED: GuildBoss = {
  id: 'boss-historia',
  name: 'Guardián de Historia',
  hp_max: 200,
  hp_actual: 150,
  xp_reward: 500
};

export const GUILD_SUBMISSIONS_SEED: GuildMemberSubmission[] = [
  { student_id: 'std-pb', student_name: 'Santi', avatar_outfit: 'explorer', class_name: 'Guerrero', status: 'submitted_on_time' },
  { student_id: 'std-pa', student_name: 'Lucas', avatar_outfit: 'space_suit', class_name: 'Explorador', status: 'submitted_on_time' },
  { student_id: 'std-sec', student_name: 'Elena', avatar_outfit: 'purple', class_name: 'Mago', status: 'pending' }
];

export const ATTENDANCE_SEED: Attendance[] = [
  {
    id: 'att-1',
    student_id: 'std-pa',
    group_id: 'grp-pa-a',
    subject_id: 'sub-math',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // ayer
    status: 'presente',
    comments: 'Participó activamente',
    registered_by: 'usr-teacher-1',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'att-2',
    student_id: 'std-sec',
    group_id: 'grp-sec-a',
    subject_id: 'sub-sci',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // ayer
    status: 'retardo',
    comments: 'Llegó 10 minutos tarde',
    registered_by: 'usr-teacher-1',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

export const PARENT_MESSAGES_SEED: ParentMessage[] = [
  {
    id: 'msg-1',
    parent_id: 'usr-parent-1',
    student_id: 'std-pa',
    student_name: 'Lucas Skywalker',
    teacher_id: 'usr-teacher-1',
    teacher_name: 'Israel López',
    subject_id: 'sub-math',
    subject_name: 'Matemáticas',
    quest_id: 'q-fractions-2',
    quest_title: 'Fraccionando en Casa',
    message: 'Estimado tutor de Lucas, le informamos que el alumno no ha entregado la tarea "Fraccionando en Casa" de la materia Matemáticas. Agradecemos su apoyo en casa para regularizar esta situación.',
    sent_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    is_read: false
  }
];
