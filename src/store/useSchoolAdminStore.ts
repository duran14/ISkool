import { create } from 'zustand';
import { SchoolSettings, DetailedStudent, Group, ClassSchedule, Attendance, ParentMessage } from '../types';
import { DETAILED_STUDENTS_SEED, GROUPS_SEED, SCHEDULES_SEED, ATTENDANCE_SEED, PARENT_MESSAGES_SEED, TEACHER_SEED } from './seeds';
import { useStudentStore } from './useStudentStore';
import { supabase } from '@/lib/supabaseClient';

const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

const mapGroupIdToUuid = (id: string): string => {
  if (isUuid(id)) return id;
  if (id === 'grp-pb-a') return 'a00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e11';
  if (id === 'grp-pa-a') return 'a00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e22';
  if (id === 'grp-sec-a') return 'a00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e33';
  if (id === 'grp-prep-a') return 'a00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e44';
  
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < id.length; i++) {
    hash1 = id.charCodeAt(i) + ((hash1 << 5) - hash1);
    hash2 = id.charCodeAt(id.length - 1 - i) + ((hash2 << 5) - hash2);
  }
  let hex = '';
  for (let i = 0; i < 4; i++) {
    hex += ('00' + ((hash1 >> (i * 8)) & 0xff).toString(16)).slice(-2);
  }
  for (let i = 0; i < 2; i++) {
    hex += ('00' + ((hash2 >> (i * 8)) & 0xff).toString(16)).slice(-2);
  }
  return 'a00a0eeb-9c0b-4ef8-bb6d-' + hex;
};

interface SchoolAdminStoreState {
  schoolSettings: SchoolSettings;
  detailedStudents: DetailedStudent[];
  groupsList: Group[];
  schedulesList: ClassSchedule[];
  attendanceList: Attendance[];
  parentMessages: ParentMessage[];
  syncError: string | null;

  // Actions
  saveSchoolSettings: (settings: SchoolSettings) => void;
  registerStudent: (studentData: Omit<DetailedStudent, 'id'>) => void;
  generateGroupsForGrade: (level: 'primaria' | 'secundaria' | 'preparatoria', grade: string, groupNames: string[]) => void;
  assignStudentToGroup: (studentId: string, groupId: string) => void;
  createSchedule: (scheduleData: Omit<ClassSchedule, 'id'>) => void;
  deleteSchedule: (scheduleId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  saveAttendanceList: (records: Omit<Attendance, 'id' | 'created_at' | 'registered_by'>[]) => void;
  sendParentMessage: (msg: Omit<ParentMessage, 'id' | 'sent_at' | 'is_read'>) => void;
  replyToParentMessage: (messageId: string, replyText: string) => void;
  markMessageAsRead: (messageId: string) => void;
  resetSchoolAdminStore: () => void;
}

let saveSettingsTimeout: NodeJS.Timeout | null = null;

export const useSchoolAdminStore = create<SchoolAdminStoreState>((set, get) => ({
  schoolSettings: {
    isConfigured: false,
    name: 'Colegio Anglo Mexicano',
    website: '',
    logoUrl: '',
    cct: '09DPR1234Z',
    address: 'Av. Paseo de la Reforma 123, Ciudad de México',
    phone: '555-019-2834',
    coordinators: ['Carlos Duran', 'Ana Gómez'],
    teachers: ['Israel López', 'María Fernández', 'Roberto Díaz'],
    themeColors: {
      primary: '250 84% 54%',
      secondary: '221 83% 53%',
      accent: '142 71% 45%'
    }
  },
  detailedStudents: DETAILED_STUDENTS_SEED,
  groupsList: GROUPS_SEED,
  schedulesList: SCHEDULES_SEED,
  attendanceList: ATTENDANCE_SEED,
  parentMessages: PARENT_MESSAGES_SEED,
  syncError: null,

  saveSchoolSettings: (settings) => {
    // 1. Instantly update local state to keep typing lag-free
    set({ schoolSettings: settings, syncError: null });

    // 2. Clear any pending Supabase upsert
    if (saveSettingsTimeout) {
      clearTimeout(saveSettingsTimeout);
    }

    // 3. Debounce database sync to 1000ms after user stops typing
    saveSettingsTimeout = setTimeout(async () => {
      try {
        const dbSettings = {
          name: settings.name,
          website: settings.website || '',
          logo_url: settings.logoUrl || '',
          cct: settings.cct || '',
          address: settings.address || '',
          phone: settings.phone || '',
          coordinators: settings.coordinators || [],
          teachers: settings.teachers || [],
          theme_colors: settings.themeColors,
          is_configured: settings.isConfigured
        };

        const { error } = await supabase
          .from('school_settings')
          .upsert({
            id: '00000000-0000-0000-0000-000000000000',
            ...dbSettings,
            updated_at: new Date().toISOString()
          });

        if (error) throw new Error(error.message);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al guardar la configuración escolar';
        console.error('Error saving school settings to Supabase:', err);
        set({ syncError: errorMsg });
      }
    }, 1000);
  },

  registerStudent: (studentData) => {
    const newId = `std-${Date.now()}`;
    const newStudent: DetailedStudent = {
      ...studentData,
      id: newId,
      photo_url: studentData.photo_url || '/images/students/default.png'
    };

    set((state) => ({
      detailedStudents: [...state.detailedStudents, newStudent]
    }));

    // Inicializar stats y avatar en useStudentStore
    const studentStore = useStudentStore.getState();
    studentStore.initializeNewStudent(newId, studentData.first_name);
  },

  generateGroupsForGrade: (level, grade, groupNames) => {
    const newGroups: Group[] = groupNames.map(name => {
      const key = `${level}-${grade.replace(/\s+/g, '')}`;
      return {
        id: `grp-${key}-${name.toLowerCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        school_id: 'sch-1',
        level_grade_id: key,
        academic_year_id: 'ay-25-26',
        name: name,
        created_at: new Date().toISOString()
      };
    });

    set((state) => ({
      groupsList: [...state.groupsList, ...newGroups]
    }));
  },

  assignStudentToGroup: (studentId, groupId) => {
    set((state) => ({
      detailedStudents: state.detailedStudents.map(s => 
        s.id === studentId ? { ...s, group_id: groupId } : s
      )
    }));
  },

  createSchedule: (scheduleData) => {
    const newSchedule: ClassSchedule = {
      ...scheduleData,
      id: `sch-${Date.now()}`
    };
    set((state) => ({
      schedulesList: [...state.schedulesList, newSchedule]
    }));
  },

  deleteSchedule: async (scheduleId) => {
    set({ syncError: null });
    try {
      const { error } = await supabase
        .from('class_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw new Error(error.message);

      set((state) => ({
        schedulesList: state.schedulesList.filter(s => s.id !== scheduleId)
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar el horario';
      console.error('Error deleting schedule:', err);
      set({ syncError: errorMsg });
      alert(`Error al eliminar el horario en Supabase: ${errorMsg}`);
    }
  },

  deleteGroup: async (groupId) => {
    set({ syncError: null });
    try {
      const uuid = mapGroupIdToUuid(groupId);
      
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', uuid);

      if (error) throw new Error(error.message);

      set((state) => ({
        groupsList: state.groupsList.filter(g => g.id !== groupId),
        detailedStudents: state.detailedStudents.map(s => s.group_id === groupId ? { ...s, group_id: undefined } : s),
        schedulesList: state.schedulesList.filter(s => s.groupId !== groupId)
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar el grupo';
      console.error('Error deleting group:', err);
      set({ syncError: errorMsg });
      alert(`Error al eliminar el grupo en Supabase: ${errorMsg}`);
    }
  },

  saveAttendanceList: (records) => {
    const timestamp = new Date().toISOString();
    const registered_by = TEACHER_SEED.id;

    set((state) => {
      const cleanPrev = state.attendanceList.filter(att => {
        const isSameGroupAndSubjectAndDate = records.some(rec => 
          rec.date === att.date && 
          rec.group_id === att.group_id && 
          rec.subject_id === att.subject_id &&
          rec.student_id === att.student_id
        );
        return !isSameGroupAndSubjectAndDate;
      });

      const newRecords: Attendance[] = records.map((rec, idx) => ({
        ...rec,
        id: `att-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        registered_by,
        created_at: timestamp
      }));

      return {
        attendanceList: [...cleanPrev, ...newRecords]
      };
    });
  },

  sendParentMessage: (msgData) => {
    const newMsg: ParentMessage = {
      ...msgData,
      id: `msg-${Date.now()}`,
      sent_at: new Date().toISOString(),
      is_read: false
    };

    set((state) => ({
      parentMessages: [newMsg, ...state.parentMessages]
    }));
  },

  replyToParentMessage: (messageId, replyText) => {
    set((state) => ({
      parentMessages: state.parentMessages.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            parent_reply: replyText,
            replied_at: new Date().toISOString(),
            is_read: true
          };
        }
        return msg;
      })
    }));
  },

  markMessageAsRead: (messageId) => {
    set((state) => ({
      parentMessages: state.parentMessages.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      )
    }));
  },

  resetSchoolAdminStore: () => {
    set({
      schoolSettings: {
        isConfigured: false,
        name: 'Colegio Anglo Mexicano',
        website: '',
        logoUrl: '',
        cct: '09DPR1234Z',
        address: 'Av. Paseo de la Reforma 123, Ciudad de México',
        phone: '555-019-2834',
        coordinators: ['Carlos Duran', 'Ana Gómez'],
        teachers: ['Israel López', 'María Fernández', 'Roberto Díaz'],
        themeColors: {
          primary: '250 84% 54%',
          secondary: '221 83% 53%',
          accent: '142 71% 45%'
        }
      },
      detailedStudents: DETAILED_STUDENTS_SEED,
      groupsList: GROUPS_SEED,
      schedulesList: SCHEDULES_SEED,
      attendanceList: ATTENDANCE_SEED,
      parentMessages: PARENT_MESSAGES_SEED,
      syncError: null
    });
  }
}));
