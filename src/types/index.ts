export type UserRole = 'superadmin' | 'admin' | 'director' | 'coordinator' | 'teacher' | 'student' | 'parent';

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

export interface School {
  id: string;
  name: string;
  cct?: string; // Clave de Centro de Trabajo (SEP)
  address?: string;
  phone?: string;
  created_at: string;
}

export interface AcademicYear {
  id: string;
  school_id: string;
  name: string; // e.g., "2025-2026"
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface AcademicPeriod {
  id: string;
  academic_year_id: string;
  name: string; // e.g., "Bimestre 1", "Bimestre 2"
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface LevelGrade {
  id: string;
  level_name: 'primaria' | 'secundaria' | 'preparatoria';
  grade_name: string; // e.g., "1º", "2º", "3º", "1º Semestre"
  created_at: string;
}

export interface Group {
  id: string;
  school_id: string;
  level_grade_id: string;
  academic_year_id: string;
  name: string; // e.g., "A", "B"
  created_at: string;
  
  // Optional relations
  level_grade?: LevelGrade;
  academic_year?: AcademicYear;
}

export interface Subject {
  id: string;
  school_id: string;
  level_grade_id: string;
  name: string; // e.g., "Matemáticas"
  sep_code?: string;
  created_at: string;
}

export interface Student {
  id: string; // references UserProfile
  school_id: string;
  curp?: string;
  birth_date?: string;
  enrollment_id?: string; // Matrícula
  created_at: string;

  // Optional relations
  profile?: UserProfile;
}

export interface ParentStudent {
  parent_id: string;
  student_id: string;
  relationship: string; // "Padre", "Madre", "Tutor"
}

export interface Enrollment {
  id: string;
  student_id: string;
  group_id: string;
  created_at: string;

  // Optional relations
  student?: Student;
  group?: Group;
}

export interface TeacherAssignment {
  id: string;
  teacher_id: string; // references UserProfile
  group_id: string;
  subject_id: string;
  created_at: string;

  // Optional relations
  teacher?: UserProfile;
  group?: Group;
  subject?: Subject;
}

export type AttendanceStatus = 'presente' | 'falta' | 'retardo' | 'justificado';

export interface Attendance {
  id: string;
  student_id: string;
  group_id: string;
  subject_id?: string; // null for general attendance, or specific per-subject
  date: string;
  status: AttendanceStatus;
  comments?: string;
  registered_by: string; // references UserProfile
  created_at: string;
}

export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  period_id: string; // references AcademicPeriod
  score: number; // Decimal (5.0 to 10.0)
  comments?: string;
  created_at: string;
  updated_at: string;
}

// === Nuevas Interfaces de Gamificación y Portafolio ===

export interface StudentStats {
  student_id: string;
  xp: number;
  level: number;
  coins: number;
  current_streak: number;
  max_streak: number;
  last_active_date?: string;
  updated_at: string;

  // RPG (Secundaria)
  rpg_class?: 'guerrero' | 'mago' | 'curandero' | 'explorador';
  attribute_strength?: number;
  attribute_intelligence?: number;
  attribute_defense?: number;
  skill_points?: number;

  // Preparatoria
  funding_credits?: number;
}

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

  // Mascota (Primaria Baja)
  pet_type?: 'dragon' | 'gatito' | 'osito';
  pet_name?: string;
  pet_hunger?: number;
  pet_happiness?: number;
  pet_outfit?: string;
}

export type BadgeCategory = 'academic' | 'social' | 'persistence' | 'creative';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  category: BadgeCategory;
  xp_required: number;
  created_at: string;
}

export interface StudentBadge {
  student_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge; // Opcional relación
}

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
  
  // Relaciones opcionales
  subject?: Subject;
  quests?: Quest[];
}

export type QuestType = 'quiz' | 'portfolio_submission';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizContent {
  questions: QuizQuestion[];
}

export interface SubmissionContent {
  instructions: string;
  acceptedFormats: string[]; // e.g., ["image", "audio", "video"]
}

export interface Quest {
  id: string;
  mission_id: string;
  title: string;
  description: string;
  type: QuestType;
  sequence_order: number;
  xp_reward: number;
  coins_reward: number;
  content: QuizContent | SubmissionContent;
  created_at: string;
}

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

export type PortfolioItemStatus = 'draft' | 'submitted' | 'approved' | 'needs_revision';
export type PortfolioFileType = 'image' | 'audio' | 'video' | 'pdf' | 'link';

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
  
  created_at: string;
  updated_at: string;

  // Relaciones opcionales
  student_profile?: UserProfile;
  subject?: Subject;
  quest?: Quest;
  feedbacks?: PortfolioFeedback[];
}

export type FeedbackAuthorRole = 'teacher' | 'parent' | 'student' | 'peer';

export interface PortfolioFeedback {
  id: string;
  portfolio_item_id: string;
  author_id: string;
  author_role: FeedbackAuthorRole;
  feedback_text: string;
  reactions: Record<string, string[]>; // e.g. {"parents": ["❤️"], "peers": ["👏"]}
  created_at: string;
  author_profile?: UserProfile; // Opcional relación
}

