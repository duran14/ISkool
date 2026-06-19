import { create } from 'zustand';
import { SchoolSettings, DetailedStudent, Group, ClassSchedule, Attendance, ParentMessage } from '../types';
import { DETAILED_STUDENTS_SEED, GROUPS_SEED, SCHEDULES_SEED, ATTENDANCE_SEED, PARENT_MESSAGES_SEED, TEACHER_SEED } from './seeds';
import { useStudentStore } from './useStudentStore';

interface SchoolAdminStoreState {
  schoolSettings: SchoolSettings;
  detailedStudents: DetailedStudent[];
  groupsList: Group[];
  schedulesList: ClassSchedule[];
  attendanceList: Attendance[];
  parentMessages: ParentMessage[];

  // Actions
  saveSchoolSettings: (settings: SchoolSettings) => void;
  registerStudent: (studentData: Omit<DetailedStudent, 'id'>) => void;
  generateGroupsForGrade: (level: 'primaria' | 'secundaria' | 'preparatoria', grade: string, groupNames: string[]) => void;
  assignStudentToGroup: (studentId: string, groupId: string) => void;
  createSchedule: (scheduleData: Omit<ClassSchedule, 'id'>) => void;
  deleteSchedule: (scheduleId: string) => void;
  deleteGroup: (groupId: string) => void;
  saveAttendanceList: (records: Omit<Attendance, 'id' | 'created_at' | 'registered_by'>[]) => void;
  sendParentMessage: (msg: Omit<ParentMessage, 'id' | 'sent_at' | 'is_read'>) => void;
  replyToParentMessage: (messageId: string, replyText: string) => void;
  markMessageAsRead: (messageId: string) => void;
  resetSchoolAdminStore: () => void;
}

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

  saveSchoolSettings: (settings) => {
    set({ schoolSettings: settings });
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

  deleteSchedule: (scheduleId) => {
    set((state) => ({
      schedulesList: state.schedulesList.filter(s => s.id !== scheduleId)
    }));
  },

  deleteGroup: (groupId) => {
    set((state) => ({
      groupsList: state.groupsList.filter(g => g.id !== groupId),
      detailedStudents: state.detailedStudents.map(s => s.group_id === groupId ? { ...s, group_id: undefined } : s),
      schedulesList: state.schedulesList.filter(s => s.groupId !== groupId)
    }));
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
      parentMessages: PARENT_MESSAGES_SEED
    });
  }
}));
