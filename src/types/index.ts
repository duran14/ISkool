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
