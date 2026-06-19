/**
 * @typedef {('superadmin' | 'admin' | 'director' | 'coordinator' | 'teacher' | 'student' | 'parent')} UserRole
 * @description Define los roles de usuario autorizados en el sistema escolar.
 * @stateImpact Determina los permisos en el frontend, accesibilidad de rutas y control RLS.
 */
export type UserRole = 'superadmin' | 'admin' | 'director' | 'coordinator' | 'teacher' | 'student' | 'parent';

/**
 * @interface UserProfile
 * @description Datos básicos del perfil general de cualquier usuario.
 * @database Mapea a la tabla `public.profiles`.
 * @relation Relación 1:1 con `auth.users` de Supabase. Referenciado en `Student` y `TeacherAssignment`.
 * @stateImpact Almacenado en `AuthContext` tras el inicio de sesión del usuario.
 */
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  email: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

/**
 * @interface School
 * @description Representa un plantel o escuela en el sistema.
 * @database Mapea a la tabla `public.schools`.
 * @relation Raíz jerárquica. Padre de `AcademicYear`, `Group`, `Subject`.
 * @stateImpact Leído en configuraciones iniciales por `useSchoolAdminStore`.
 */
export interface School {
  id: string;
  name: string;
  cct?: string; // Clave de Centro de Trabajo (SEP)
  address?: string;
  phone?: string;
  created_at: string;
}

/**
 * @interface AcademicYear
 * @description Representa un ciclo escolar (e.g., 2025-2026).
 * @database Mapea a la tabla `public.academic_years`.
 * @relation Pertenece a `School` (N:1). Padre de `AcademicPeriod` y `Group`.
 * @stateImpact Define el ciclo activo en `useSchoolAdminStore`.
 */
export interface AcademicYear {
  id: string;
  school_id: string;
  name: string; // e.g., "2025-2026"
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

/**
 * @interface AcademicPeriod
 * @description Representa bloques de evaluación dentro de un ciclo escolar (e.g., Bimestre 1).
 * @database Mapea a la tabla `public.academic_periods`.
 * @relation Pertenece a `AcademicYear` (N:1). Usado para filtrar `Grade`.
 * @stateImpact Utilizado para segmentar boletas formativas en el panel docente.
 */
export interface AcademicPeriod {
  id: string;
  academic_year_id: string;
  name: string; // e.g., "Bimestre 1", "Bimestre 2"
  start_date: string;
  end_date: string;
  created_at: string;
}

/**
 * @interface LevelGrade
 * @description Cataloga niveles educativos (primaria, secundaria, preparatoria) y sus grados respectivos.
 * @database Mapea a la tabla `public.levels_grades`.
 * @relation Referenciado en `Group` y `Subject`.
 * @stateImpact Determina la UI adaptada (Mascota, RPG, Créditos de Financiamiento) que verá el estudiante.
 */
export interface LevelGrade {
  id: string;
  level_name: 'primaria' | 'secundaria' | 'preparatoria';
  grade_name: string; // e.g., "1º", "2º", "3º", "1º Semestre"
  created_at: string;
}

/**
 * @interface Group
 * @description Define un grupo escolar (e.g., 4º "A").
 * @database Mapea a la tabla `public.groups`.
 * @relation Vinculado a `School` (N:1), `LevelGrade` (N:1), y `AcademicYear` (N:1). Contiene múltiples `Enrollment`.
 * @stateImpact Utilizado en RLS de profesores para filtrar alumnos evaluados.
 */
export interface Group {
  id: string;
  school_id: string;
  level_grade_id: string;
  academic_year_id: string;
  name: string; // e.g., "A", "B"
  created_at: string;
  
  // Relaciones opcionales cargadas en consultas
  level_grade?: LevelGrade;
  academic_year?: AcademicYear;
}

/**
 * @interface Subject
 * @description Materia académica dictada en el colegio (e.g., Matemáticas).
 * @database Mapea a la tabla `public.subjects`.
 * @relation Vinculado a `School` (N:1) y `LevelGrade` (N:1). Referenciada en `Mission` y `Grade`.
 * @stateImpact Filtra el mapa de misiones y la segmentación de evidencias en el portafolio del estudiante.
 */
export interface Subject {
  id: string;
  school_id: string;
  level_grade_id: string;
  name: string; // e.g., "Matemáticas"
  sep_code?: string;
  created_at: string;
}

/**
 * @interface Student
 * @description Perfil específico del rol estudiante.
 * @database Mapea a la tabla `public.students`.
 * @relation Vinculado a `UserProfile` (1:1), `School` (N:1). Tiene 1:N `Enrollment` e `Inventory`.
 * @stateImpact Identificador clave de acceso para RLS en consultas de stats y portafolio.
 */
export interface Student {
  id: string; // references UserProfile
  school_id: string;
  curp?: string;
  birth_date?: string;
  enrollment_id?: string; // Matrícula
  created_at: string;

  // Relaciones opcionales
  profile?: UserProfile;
}

/**
 * @interface ParentStudent
 * @description Relación de vinculación entre un tutor y un estudiante.
 * @database Mapea a la tabla `public.parent_students`.
 * @relation Vincula `UserProfile` del padre (N:1) con `Student` (N:1).
 * @stateImpact Permite al portal de tutores visualizar únicamente los logros del estudiante vinculado.
 */
export interface ParentStudent {
  parent_id: string;
  student_id: string;
  relationship: string; // "Padre", "Madre", "Tutor"
}

/**
 * @interface Enrollment
 * @description Inscripción de un estudiante en un grupo específico para un ciclo escolar.
 * @database Mapea a la tabla `public.enrollments`.
 * @relation Vincula `Student` (N:1) con `Group` (N:1).
 * @stateImpact Utilizado por `useSchoolAdminStore` para la distribución grupal.
 */
export interface Enrollment {
  id: string;
  student_id: string;
  group_id: string;
  created_at: string;

  // Relaciones opcionales
  student?: Student;
  group?: Group;
}

/**
 * @interface TeacherAssignment
 * @description Asignación que define qué docente imparte qué materia en qué grupo.
 * @database Mapea a la tabla `public.teacher_assignments`.
 * @relation Vincula `UserProfile` del profesor (N:1), `Group` (N:1), y `Subject` (N:1).
 * @stateImpact Validado en RLS para certificar qué grupos puede consultar un docente.
 */
export interface TeacherAssignment {
  id: string;
  teacher_id: string; // references UserProfile
  group_id: string;
  subject_id: string;
  created_at: string;

  // Relaciones opcionales
  teacher?: UserProfile;
  group?: Group;
  subject?: Subject;
}

/**
 * @typedef {('presente' | 'falta' | 'retardo' | 'justificado')} AttendanceStatus
 * @description Opciones de registro de asistencia diaria.
 */
export type AttendanceStatus = 'presente' | 'falta' | 'retardo' | 'justificado';

/**
 * @interface Attendance
 * @description Registro de asistencia de un estudiante en una fecha determinada.
 * @database Mapea a la tabla `public.attendance`.
 * @relation Vincula `Student` (N:1) y `Group` (N:1). Registrado por un `UserProfile` docente.
 * @stateImpact Controlado y actualizado por el panel del docente en `useSchoolAdminStore`.
 */
export interface Attendance {
  id: string;
  student_id: string;
  group_id: string;
  subject_id?: string; // null para asistencia general del día, o específico por materia
  date: string;
  status: AttendanceStatus;
  comments?: string;
  registered_by: string; // references UserProfile
  created_at: string;
}

/**
 * @interface Grade
 * @description Calificación cuantitativa ordinaria asignada a un estudiante en una materia y periodo.
 * @database Mapea a la tabla `public.grades`.
 * @relation Vincula `Student` (N:1), `Subject` (N:1), y `AcademicPeriod` (N:1).
 * @stateImpact Traducido y consolidado para la boleta SEP oficial en `useSchoolAdminStore`.
 */
export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  period_id: string; // references AcademicPeriod
  score: number; // Decimal (5.0 a 10.0)
  comments?: string;
  created_at: string;
  updated_at: string;
}

/**
 * @interface StudentStats
 * @description Estadísticas de gamificación y progresión de nivel de un estudiante.
 * @database Mapea a la tabla `public.student_stats`.
 * @relation Vinculado a `Student` (1:1).
 * @stateImpact Actualizado por acciones del almacén (`useStudentStore`, `addXpAndCoins`). Validado bajo políticas RLS por estudiante y docente.
 */
export interface StudentStats {
  student_id: string;
  xp: number;
  level: number;
  coins: number;
  current_streak: number;
  max_streak: number;
  last_active_date?: string;
  updated_at: string;

  // RPG (Solo nivel Secundaria)
  rpg_class?: 'guerrero' | 'mago' | 'curandero' | 'explorador';
  attribute_strength?: number;
  attribute_intelligence?: number;
  attribute_defense?: number;
  skill_points?: number;

  // Preparatoria (Proyectos Productivos)
  funding_credits?: number;
}

/**
 * @interface StudentAvatar
 * @description Configuración estética del avatar del alumno y el estado de su mascota.
 * @database Mapea a la tabla `public.student_avatars`.
 * @relation Vinculado a `Student` (1:1).
 * @stateImpact Almacenado y editado mediante `changeAvatar` en `useStudentStore`.
 */
export interface StudentAvatar {
  student_id: string;
  avatar_name: string;
  hair_style: string;
  hair_color: string;
  eyes_style: string;
  outfit_style: string;
  outfit_color: string;
  background_style: string;
  unlocked_items: string[];
  updated_at: string;

  // Mascota Virtual (Solo nivel Primaria Baja)
  pet_type?: 'dragon' | 'lobo' | 'venado' | 'gusano' | 'gatito';
  pet_name?: string;
  pet_hunger?: number;
  pet_happiness?: number;
  pet_outfit?: string;

  // RPG Customizer fields
  gender?: 'male' | 'female';
  rpg_class?: string;
  head_type?: string;
  skin_tone?: string;
}

/**
 * @typedef {('academic' | 'social' | 'persistence' | 'creative')} BadgeCategory
 * @description Categorías de medallas e insignias escolares.
 */
export type BadgeCategory = 'academic' | 'social' | 'persistence' | 'creative';

/**
 * @interface Badge
 * @description Catálogo de insignias que un estudiante puede ganar.
 * @database Mapea a la tabla `public.badges`.
 * @relation Referenciada en `StudentBadge` (1:N).
 * @stateImpact Listado global en la tienda de medallas de `useGamificationStore`.
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  category: BadgeCategory;
  xp_required: number;
  created_at: string;
}

/**
 * @interface StudentBadge
 * @description Registro de insignias obtenidas por un estudiante.
 * @database Mapea a la tabla `public.student_badges`.
 * @relation Vincula `Student` (N:1) y `Badge` (N:1).
 * @stateImpact Administrado por `unlockBadge` en `useGamificationStore`.
 */
export interface StudentBadge {
  student_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge; // Relación anidada para renderizado directo
}

/**
 * @interface Mission
 * @description Misión del mapa de aprendizaje que engloba una narrativa y varios retos.
 * @database Mapea a la tabla `public.missions`.
 * @relation Vinculado a `School` (N:1), `Subject` (N:1), y `LevelGrade` (N:1). Padre de `Quest`.
 * @stateImpact Cargado dinámicamente mediante `fetchMissions` en `useGamificationStore`.
 */
export interface Mission {
  id: string;
  school_id: string;
  subject_id: string;
  level_grade_id: string;
  title: string;
  description: string;
  story_intro: string;
  map_position_x: number;
  map_position_y: number;
  is_active: boolean;
  created_at: string;
  
  // Relaciones opcionales cargadas
  subject?: Subject;
  quests?: Quest[];
}

/**
 * @typedef {('quiz' | 'portfolio_submission' | 'exam')} QuestType
 * @description Tipos de retos escolares soportados.
 */
export type QuestType = 'quiz' | 'portfolio_submission' | 'exam';

/**
 * @interface QuizQuestion
 * @description Pregunta de opción múltiple con explicaciones retroalimentarias.
 */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

/**
 * @interface QuizContent
 * @description Estructura de cuestionario común para Quests de tipo 'quiz'.
 */
export interface QuizContent {
  questions: QuizQuestion[];
}

/**
 * @interface ExamContent
 * @description Reto especial tipo jefe de gremio (Boss Battle RPG) para exámenes.
 */
export interface ExamContent {
  questions: QuizQuestion[];
  bossName: string;
  bossHp: number;
  bossMaxDmg: number;
  storyIntro: string;
}

/**
 * @interface SubmissionContent
 * @description Parámetros y formatos aceptados para retos de entrega de evidencias.
 */
export interface SubmissionContent {
  instructions: string;
  acceptedFormats: string[]; // e.g., ["image", "audio", "video"]
}

/**
 * @interface Quest
 * @description Reto o actividad dentro de una misión académica.
 * @database Mapea a la tabla `public.quests`.
 * @relation Pertenece a `Mission` (N:1). Referenciado en `QuestAttempt` y `PortfolioItem`.
 * @stateImpact Define el contenido de las preguntas y formatos de evidencias que lee la UI del estudiante.
 */
export interface Quest {
  id: string;
  mission_id: string;
  title: string;
  description: string;
  type: QuestType;
  sequence_order: number;
  xp_reward: number;
  coins_reward: number;
  content: QuizContent | SubmissionContent | ExamContent;
  created_at: string;
  campos_formativos?: string[];
  ejes_articuladores?: string[];
  pdas?: string[];
}

/**
 * @interface QuestAttempt
 * @description Registro detallado del intento de resolución de un reto por un estudiante.
 * @database Mapea a la tabla `public.quest_attempts`.
 * @relation Vincula `Student` (N:1) y `Quest` (N:1).
 * @stateImpact Actualizado por `submitQuiz` y `submitExam` en `useGamificationStore`.
 */
export interface QuestAttempt {
  id: string;
  student_id: string;
  quest_id: string;
  score: number; // Porcentaje de 0.00 a 100.00
  is_completed: boolean;
  answers?: Record<string, string | number>;
  feedback?: string;
  created_at: string;
}

/**
 * @typedef {('draft' | 'submitted' | 'approved' | 'needs_revision')} PortfolioItemStatus
 * @description Estado de revisión formativa de una evidencia.
 */
export type PortfolioItemStatus = 'draft' | 'submitted' | 'approved' | 'needs_revision';

/**
 * @typedef {('image' | 'audio' | 'video' | 'pdf' | 'link')} PortfolioFileType
 * @description Formato multimedia de la evidencia cargada.
 */
export type PortfolioFileType = 'image' | 'audio' | 'video' | 'pdf' | 'link';

/**
 * @interface PortfolioItem
 * @description Evidencia de aprendizaje cargada por el estudiante para evaluación del docente.
 * @database Mapea a la tabla `public.portfolio_items`.
 * @relation Vincula `Student` (N:1), `Subject` (N:1), y opcionalmente `Quest` (N:1). Contiene 1:N `PortfolioFeedback`.
 * @stateImpact Almacenado en `usePortfolioStore`. Sujeto a políticas RLS por estudiante (ver propios) y docente (filtrado por group_id).
 */
export interface PortfolioItem {
  id: string;
  student_id: string;
  subject_id: string;
  quest_id?: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: PortfolioFileType;
  status: PortfolioItemStatus;
  self_reflection?: string;
  
  // Coevaluación (Preparatoria)
  peer_review_score?: number;
  peer_review_comments?: string;
  
  // Metadatos formativos (NEM)
  campos_formativos?: string[];
  pdas?: string[];
  ejes_articuladores?: string[];
  
  // Desglose de XP otorgado
  xp_breakdown?: {
    scientific?: number;
    critical?: number;
    collaborative?: number;
    communication?: number;
  };
  
  created_at: string;
  updated_at: string;

  // Relaciones anidadas opcionales
  student_profile?: UserProfile;
  subject?: Subject;
  quest?: Quest;
  feedbacks?: PortfolioFeedback[];
}

/**
 * @typedef {('teacher' | 'parent' | 'student' | 'peer')} FeedbackAuthorRole
 * @description Rol del autor que emite una retroalimentación formativa.
 */
export type FeedbackAuthorRole = 'teacher' | 'parent' | 'student' | 'peer';

/**
 * @interface PortfolioFeedback
 * @description Retroalimentación o comentarios añadidos a una evidencia del portafolio.
 * @database Mapea a la tabla `public.portfolio_feedbacks`.
 * @relation Pertenece a `PortfolioItem` (N:1). Escrito por un `UserProfile` (N:1).
 * @stateImpact Actualizado por `addPortfolioFeedback` en `usePortfolioStore`.
 */
export interface PortfolioFeedback {
  id: string;
  portfolio_item_id: string;
  author_id: string;
  author_role: FeedbackAuthorRole;
  feedback_text: string;
  reactions: Record<string, string[]>; // e.g. {"parents": ["❤️"], "peers": ["👏"]}
  created_at: string;
  author_profile?: UserProfile; // Relación anidada
}

/**
 * @interface GuildBoss
 * @description Parámetros de vida y recompensa del jefe grupal activo en una batalla de examen.
 * @database Mapea a la tabla `public.guild_bosses`.
 * @stateImpact Controla el renderizado de la barra de vida colectiva en `useGamificationStore`.
 */
export interface GuildBoss {
  id: string;
  name: string;
  hp_max: number;
  hp_actual: number;
  xp_reward: number;
}

/**
 * @interface GuildMemberSubmission
 * @description Estado de cumplimiento de tareas de un alumno dentro de un gremio cooperativo.
 */
export interface GuildMemberSubmission {
  student_id: string;
  student_name: string;
  avatar_outfit: string;
  class_name: string;
  status: 'pending' | 'submitted_on_time' | 'submitted_late';
  submitted_at?: string;
}

/**
 * @interface SchoolSettings
 * @description Configuraciones generales de personalización visual e identidad escolar.
 * @database Mapea a la tabla `public.school_settings` (o config escolar en Supabase).
 * @stateImpact Determina la paleta de colores dinámicos inyectada al DOM en `useSchoolAdminStore`.
 */
export interface SchoolSettings {
  isConfigured: boolean;
  name: string;
  website?: string;
  logoUrl?: string;
  cct?: string;
  address?: string;
  phone?: string;
  coordinators: string[];
  teachers: string[];
  themeColors: {
    primary: string;    // Color principal (Formato HSL o HEX)
    secondary: string;  // Color secundario (Formato HSL o HEX)
    accent: string;     // Color de acento (Formato HSL o HEX)
  };
}

/**
 * @interface DetailedStudent
 * @description Expediente escolar extendido para el control del coordinador escolar.
 * @database Mapea a la tabla `public.students` y join con perfiles médicos e historiales de conducta.
 * @stateImpact Utilizado para listados de control y emisión de reportes en `useSchoolAdminStore`.
 */
export interface DetailedStudent {
  id: string;
  first_name: string;
  second_name?: string;
  last_name_1: string;
  last_name_2?: string;
  birth_date: string;
  curp?: string;
  enrollment_id?: string;
  gender?: string;
  shift?: 'matutino' | 'vespertino' | 'completo';
  status: 'activo' | 'inactivo' | 'baja' | 'suspendido';
  previous_school?: string;
  photo_url?: string;
  
  // Contacto
  address?: string;
  phone?: string;
  email?: string;
  
  // Familiares
  father_name?: string;
  mother_name?: string;
  tutor_name?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // Médicos
  blood_type?: string;
  medical_notes?: string;
  
  // Académicos
  academic_notes?: string;
  level: 'primaria' | 'secundaria' | 'preparatoria';
  grade: string;
  group_id?: string;

  // Campos adicionales del expediente
  pending_payments?: string[];
  behavior_reports?: { date: string; description: string; reporter: string }[];
  teacher_notes?: { date: string; note: string; teacher_name: string }[];
}

/**
 * @interface ClassSchedule
 * @description Programación o bloque de horario de una materia y docente para un grupo.
 * @database Mapea a la tabla `public.class_schedules`.
 * @relation Vincula `Group` (N:1), `Subject` (N:1), y `UserProfile` del docente (N:1).
 * @stateImpact Determina el horario escolar renderizado en el portal del administrador y docente.
 */
export interface ClassSchedule {
  id: string;
  groupId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  timeSlot: string;
}

/**
 * @interface ParentMessage
 * @description Mensaje o alerta formal enviada al tutor sobre el desempeño del estudiante.
 * @database Mapea a la tabla `public.parent_messages`.
 * @relation Vincula `UserProfile` del padre (N:1), `Student` (N:1), `UserProfile` del docente (N:1) y `Subject` (N:1).
 * @stateImpact Controlado por `sendParentMessage` en `useSchoolAdminStore`.
 */
export interface ParentMessage {
  id: string;
  parent_id: string;
  student_id: string;
  student_name: string;
  teacher_id: string;
  teacher_name: string;
  subject_id: string;
  subject_name: string;
  quest_id?: string;
  quest_title?: string;
  message: string;
  sent_at: string;
  is_read: boolean;
  parent_reply?: string;
  replied_at?: string;
}

/**
 * @interface ShopArtifact
 * @description Objeto mágico disponible para compra en la Tienda del estudiante.
 * @database Mapea a la tabla `public.shop_artifacts`.
 * @stateImpact Listado en la tienda de `useGamificationStore`. Adquirible mediante las monedas ganadas por el alumno.
 */
export interface ShopArtifact {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string; // "Footprints" | "Shield" | "PenTool" | "Wine" | "Scroll" | "Dumbbell" | "GlassWater" | "Sparkles" | "Shirt" | "Wand2" | "Gem" | "Clock" | "Crown" | "BookOpen" | "Heart"
  effect: string;
  created_by?: string;
}

/**
 * @interface StudentMessage
 * @description Notificaciones internas de gamificación enviadas al buzón del alumno.
 * @database Mapea a la tabla `public.student_messages`.
 * @relation Vinculado a `Student` (N:1).
 * @stateImpact Renderizado en el buzón del estudiante de `useStudentStore`.
 */
export interface StudentMessage {
  id: string;
  student_id: string;
  title: string;
  message: string;
  sent_at: string;
  is_read: boolean;
  type?: 'general' | 'revocation';
  revoked_artifact?: string;
  reason?: string;
}
