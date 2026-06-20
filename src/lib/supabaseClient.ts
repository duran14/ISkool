import { 
  STATS_MAP_SEED, 
  AVATAR_MAP_SEED, 
  STUDENT_INVENTORY_SEED, 
  STUDENT_MESSAGES_SEED, 
  MISSIONS_SEED, 
  BADGES_SEED,
  PORTFOLIO_SEED,
  STUDENTS_LIST_SEED,
  TEACHER_SEED,
  PARENT_SEED,
  DETAILED_STUDENTS_SEED,
  GROUPS_SEED,
  SCHEDULES_SEED,
  ATTENDANCE_SEED,
  PARENT_MESSAGES_SEED
} from '@/store/seeds';
import { 
  StudentStats, 
  StudentAvatar, 
  StudentMessage, 
  QuestAttempt, 
  StudentBadge, 
  PortfolioItem, 
  UserProfile, 
  Mission, 
  DetailedStudent, 
  Group, 
  ClassSchedule, 
  Attendance, 
  ParentMessage 
} from '@/types';

// In-Memory Simulated Database
class SimulatedDatabase {
  stats: Record<string, StudentStats> = JSON.parse(JSON.stringify(STATS_MAP_SEED));
  avatars: Record<string, StudentAvatar> = JSON.parse(JSON.stringify(AVATAR_MAP_SEED));
  inventory: Record<string, string[]> = JSON.parse(JSON.stringify(STUDENT_INVENTORY_SEED));
  messages: StudentMessage[] = JSON.parse(JSON.stringify(STUDENT_MESSAGES_SEED));
  attempts: QuestAttempt[] = [];
  badges: StudentBadge[] = [
    { student_id: 'std-pa', badge_id: 'badge-1', earned_at: new Date().toISOString() },
    { student_id: 'std-sec', badge_id: 'badge-3', earned_at: new Date().toISOString() }
  ];
  
  // Tables needed for RLS fetches
  portfolio: PortfolioItem[] = JSON.parse(JSON.stringify(PORTFOLIO_SEED));
  missions: Mission[] = JSON.parse(JSON.stringify(MISSIONS_SEED));
  detailedStudents: DetailedStudent[] = JSON.parse(JSON.stringify(DETAILED_STUDENTS_SEED));
  groupsList: Group[] = JSON.parse(JSON.stringify(GROUPS_SEED));
  schedulesList: ClassSchedule[] = JSON.parse(JSON.stringify(SCHEDULES_SEED));
  attendanceList: Attendance[] = JSON.parse(JSON.stringify(ATTENDANCE_SEED));
  parentMessages: ParentMessage[] = JSON.parse(JSON.stringify(PARENT_MESSAGES_SEED));

  // Lookup artifact pricing and names
  artifactsList = [
    { id: 'art-boots', name: 'Botas de Velocidad Escolar', price: 25 },
    { id: 'art-shield', name: 'Escudo Protector de Promedios', price: 40 },
    { id: 'art-elixir', name: 'Elixir del Fénix Sabio', price: 15 },
    { id: 'art-wand', name: 'Varita de la Clarividencia', price: 35 }
  ];

  reset() {
    this.stats = JSON.parse(JSON.stringify(STATS_MAP_SEED));
    this.avatars = JSON.parse(JSON.stringify(AVATAR_MAP_SEED));
    this.inventory = JSON.parse(JSON.stringify(STUDENT_INVENTORY_SEED));
    this.messages = JSON.parse(JSON.stringify(STUDENT_MESSAGES_SEED));
    this.attempts = [];
    this.badges = [
      { student_id: 'std-pa', badge_id: 'badge-1', earned_at: new Date().toISOString() },
      { student_id: 'std-sec', badge_id: 'badge-3', earned_at: new Date().toISOString() }
    ];
    this.portfolio = JSON.parse(JSON.stringify(PORTFOLIO_SEED));
    this.missions = JSON.parse(JSON.stringify(MISSIONS_SEED));
    this.detailedStudents = JSON.parse(JSON.stringify(DETAILED_STUDENTS_SEED));
    this.groupsList = JSON.parse(JSON.stringify(GROUPS_SEED));
    this.schedulesList = JSON.parse(JSON.stringify(SCHEDULES_SEED));
    this.attendanceList = JSON.parse(JSON.stringify(ATTENDANCE_SEED));
    this.parentMessages = JSON.parse(JSON.stringify(PARENT_MESSAGES_SEED));
  }
}

export const db = new SimulatedDatabase();

// Simulated Supabase Auth Module
class SupabaseAuth {
  private session: { access_token: string; user: UserProfile } | null = null;
  private listeners: ((event: string, session: any) => void)[] = [];

  async signInWithPassword({ email }: { email: string }) {
    let user: UserProfile | undefined;
    if (email === 'israel.lopez@iskool.edu.mx') {
      user = TEACHER_SEED;
    } else {
      user = STUDENTS_LIST_SEED.find(s => s.email === email);
    }

    if (!user) {
      if (email === 'carlos.sky@mail.com') {
        user = PARENT_SEED;
      } else {
        return { data: { session: null, user: null }, error: { message: 'Usuario no encontrado' } };
      }
    }

    this.session = {
      access_token: `mock-jwt-token-for-${user.id}-${user.role}`,
      user
    };

    this.triggerListeners('SIGNED_IN', this.session);
    return { data: { session: this.session, user }, error: null };
  }

  async signOut() {
    this.session = null;
    this.triggerListeners('SIGNED_OUT', null);
    return { error: null };
  }

  async getSession() {
    return { data: { session: this.session }, error: null };
  }

  async getUser() {
    return { data: { user: this.session?.user || null }, error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    callback(this.session ? 'SIGNED_IN' : 'INITIAL_SESSION', this.session);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  private triggerListeners(event: string, session: any) {
    this.listeners.forEach(l => l(event, session));
  }
}

// Simulated Fluent Query Builder representing RLS
class SupabaseQueryBuilder {
  private tableName: string;
  private filters: { field: string; value: any }[] = [];

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns = '*') {
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, value });
    return this;
  }

  async then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = await this.execute();
      return onfulfilled ? onfulfilled(result) : result;
    } catch (error) {
      if (onrejected) return onrejected(error);
      throw error;
    }
  }

  async execute() {
    // 1. Fetch Session to simulate JWT verification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { data: null, error: { message: '401 Unauthorized: JWT no provisto o sesión expirada' } };
    }

    const user = session.user;
    
    // Simulate network delay (200ms)
    await new Promise(r => setTimeout(r, 200));

    // 2. Enforce Row Level Security (RLS) policies
    switch (this.tableName) {
      case 'student_stats': {
        if (user.role === 'student') {
          // STUDENT RLS: Can only select where student_id = user.id
          const stats = db.stats[user.id];
          return { data: stats ? [stats] : [], error: null };
        } else if (user.role === 'teacher') {
          // TEACHER RLS: Must filter by group_id
          const groupFilter = this.filters.find(f => f.field === 'group_id');
          if (!groupFilter) {
            // RLS blocks if teacher doesn't specify or filter by group they teach
            // Return all students they are assigned to teach
            const teacherGroups = db.schedulesList
              .filter(s => s.teacherId === user.id)
              .map(s => s.groupId);
            
            const studentsInTeacherGroups = db.detailedStudents.filter(s => 
              s.group_id && teacherGroups.includes(s.group_id)
            );
            const studentIds = studentsInTeacherGroups.map(s => s.id);
            const stats = Object.values(db.stats).filter(s => studentIds.includes(s.student_id));
            return { data: stats, error: null };
          }

          const targetGroup = groupFilter.value;
          const isTeacherOfGroup = db.schedulesList.some(s => s.teacherId === user.id && s.groupId === targetGroup);
          if (!isTeacherOfGroup) {
            return { data: null, error: { message: `403 Forbidden: No tienes acceso a los alumnos del grupo ${targetGroup}` } };
          }

          const groupStudentIds = db.detailedStudents
            .filter(s => s.group_id === targetGroup)
            .map(s => s.id);

          const stats = Object.values(db.stats).filter(s => groupStudentIds.includes(s.student_id));
          return { data: stats, error: null };
        }
        return { data: Object.values(db.stats), error: null };
      }

      case 'portfolio_items': {
        if (user.role === 'student') {
          // STUDENT RLS: Can only select where student_id = user.id
          const items = db.portfolio.filter(item => item.student_id === user.id);
          return { data: items, error: null };
        } else if (user.role === 'teacher') {
          // TEACHER RLS: Must filter by group_id
          const groupFilter = this.filters.find(f => f.field === 'group_id');
          if (!groupFilter) {
            // Return items for groups the teacher teaches
            const teacherGroups = db.schedulesList
              .filter(s => s.teacherId === user.id)
              .map(s => s.groupId);
            
            const studentsInTeacherGroups = db.detailedStudents.filter(s => 
              s.group_id && teacherGroups.includes(s.group_id)
            );
            const studentIds = studentsInTeacherGroups.map(s => s.id);
            const items = db.portfolio.filter(item => studentIds.includes(item.student_id));
            return { data: items, error: null };
          }

          const targetGroup = groupFilter.value;
          const isTeacherOfGroup = db.schedulesList.some(s => s.teacherId === user.id && s.groupId === targetGroup);
          if (!isTeacherOfGroup) {
            return { data: null, error: { message: `403 Forbidden: No tienes acceso al portafolio del grupo ${targetGroup}` } };
          }

          const groupStudentIds = db.detailedStudents
            .filter(s => s.group_id === targetGroup)
            .map(s => s.id);

          const items = db.portfolio.filter(item => groupStudentIds.includes(item.student_id));
          return { data: items, error: null };
        }
        return { data: db.portfolio, error: null };
      }

      case 'missions': {
        // Missions are visible to all logged in users
        return { data: db.missions, error: null };
      }

      default:
        return { data: null, error: { message: `Tabla ${this.tableName} no soportada en el emulador RLS` } };
    }
  }
}

import { createClient } from '@supabase/supabase-js';

// Real Supabase client initialization using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
