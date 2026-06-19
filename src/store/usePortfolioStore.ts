import { create } from 'zustand';
import { PortfolioItem, FeedbackAuthorRole, PortfolioItemStatus, PortfolioFeedback, UserProfile } from '../types';
import { PORTFOLIO_SEED, SUBJECTS_SEED, TEACHER_SEED, PARENT_SEED, STUDENTS_LIST_SEED, BADGES_SEED } from './seeds';
import { useStudentStore } from './useStudentStore';
import { useGamificationStore } from './useGamificationStore';
import { useSchoolAdminStore } from './useSchoolAdminStore';
import { supabase } from '@/lib/supabaseClient';

interface PortfolioStoreState {
  portfolioItems: PortfolioItem[];
  isLoadingPortfolio: boolean;
  
  // Actions
  submitPortfolioItem: (
    title: string,
    description: string,
    fileUrl: string,
    fileType: any,
    selfReflection: string,
    questId?: string,
    subjectId?: string
  ) => void;
  
  submitPortfolioItemOnBehalf: (
    studentId: string,
    title: string,
    description: string,
    fileUrl: string,
    fileType: any,
    selfReflection: string,
    questId?: string,
    subjectId?: string
  ) => void;
  
  addPortfolioFeedback: (itemId: string, text: string, role: FeedbackAuthorRole, authorId: string) => void;
  addReaction: (itemId: string, roleCategory: string, emoji: string) => void;
  
  reviewPortfolioItem: (
    itemId: string,
    status: PortfolioItemStatus,
    comment: string,
    xpAward?: number,
    campos_formativos?: string[],
    pdas?: string[],
    ejes_articuladores?: string[],
    xp_breakdown?: {
      scientific?: number;
      critical?: number;
      collaborative?: number;
      communication?: number;
    }
  ) => void;
  
  linkPortfolioItemToQuest: (itemId: string, questId: string) => void;
  submitPeerReview: (itemId: string, score: number, comment: string) => void;
  fetchPortfolioItems: (groupId?: string) => Promise<void>;
  resetPortfolioStore: () => void;
}

export const usePortfolioStore = create<PortfolioStoreState>((set, get) => ({
  portfolioItems: PORTFOLIO_SEED,
  isLoadingPortfolio: false,

  submitPortfolioItem: (title, description, fileUrl, fileType, selfReflection, questId, subjectId) => {
    const studentStore = useStudentStore.getState();
    const gamificationStore = useGamificationStore.getState();
    
    const activeStudentId = studentStore.activeStudentId;
    const currentStudent = STUDENTS_LIST_SEED.find(s => s.id === activeStudentId) || STUDENTS_LIST_SEED[1];
    
    const defaultSubjectId = subjectId || 'sub-math';
    const finalSubject = SUBJECTS_SEED.find(s => s.id === defaultSubjectId) || SUBJECTS_SEED[0];
    
    const quest = gamificationStore.missionsList.flatMap(m => m.quests || []).find(q => q.id === questId);

    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      student_id: activeStudentId,
      subject_id: defaultSubjectId,
      quest_id: questId,
      title: title,
      description: description,
      file_url: fileUrl,
      file_type: fileType,
      status: 'submitted',
      self_reflection: selfReflection,
      campos_formativos: quest?.campos_formativos,
      ejes_articuladores: quest?.ejes_articuladores,
      pdas: quest?.pdas,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      student_profile: currentStudent,
      subject: finalSubject,
      feedbacks: []
    };

    set((state) => ({
      portfolioItems: [newItem, ...state.portfolioItems]
    }));

    // Si es Elena (Secundaria), enlazar con la entrega del Gremio RPG automáticamente
    if (activeStudentId === 'std-sec') {
      gamificationStore.submitGuildHomework('std-sec', true);
    }

    // Recompensa de XP y monedas
    studentStore.addXpAndCoins(activeStudentId, 50, 10);

    // Medalla por subir audio
    if (fileType === 'audio' && !gamificationStore.studentBadges.some(sb => sb.badge_id === 'badge-2' && sb.student_id === activeStudentId)) {
      gamificationStore.unlockBadge(activeStudentId, 'badge-2');
    }
  },

  submitPortfolioItemOnBehalf: (studentId, title, description, fileUrl, fileType, selfReflection, questId, subjectId) => {
    const studentStore = useStudentStore.getState();
    const gamificationStore = useGamificationStore.getState();
    const schoolAdminStore = useSchoolAdminStore.getState();

    const defaultSubjectId = subjectId || 'sub-math';
    const finalSubject = SUBJECTS_SEED.find(s => s.id === defaultSubjectId) || SUBJECTS_SEED[0];
    const quest = gamificationStore.missionsList.flatMap(m => m.quests || []).find(q => q.id === questId);

    const sDetail = schoolAdminStore.detailedStudents.find(ds => ds.id === studentId);
    const targetStudentProfile: UserProfile = sDetail ? {
      id: studentId,
      first_name: sDetail.first_name,
      last_name: `${sDetail.last_name_1} ${sDetail.last_name_2 || ''}`.trim(),
      role: 'student',
      email: sDetail.email || `${sDetail.first_name.toLowerCase()}@iskool.edu.mx`,
      created_at: sDetail.birth_date,
      updated_at: new Date().toISOString()
    } : {
      id: studentId,
      first_name: 'Estudiante',
      last_name: 'Simulado',
      role: 'student',
      email: 'student@iskool.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newItem: PortfolioItem = {
      id: `port-${Date.now()}`,
      student_id: studentId,
      subject_id: defaultSubjectId,
      quest_id: questId,
      title: title,
      description: description,
      file_url: fileUrl,
      file_type: fileType,
      status: 'submitted',
      self_reflection: selfReflection,
      campos_formativos: quest?.campos_formativos,
      ejes_articuladores: quest?.ejes_articuladores,
      pdas: quest?.pdas,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      student_profile: targetStudentProfile,
      subject: finalSubject,
      feedbacks: []
    };

    set((state) => ({
      portfolioItems: [newItem, ...state.portfolioItems]
    }));

    studentStore.addXpAndCoins(studentId, 50, 10);
  },

  addPortfolioFeedback: (itemId, text, role, authorId) => {
    const studentStore = useStudentStore.getState();
    const activeStudentId = studentStore.activeStudentId;
    const currentStudent = STUDENTS_LIST_SEED.find(s => s.id === activeStudentId) || STUDENTS_LIST_SEED[1];

    let authorProfile: UserProfile = currentStudent;
    if (role === 'teacher') authorProfile = TEACHER_SEED;
    if (role === 'parent') authorProfile = PARENT_SEED;

    const newFeedback: PortfolioFeedback = {
      id: `fb-${Date.now()}`,
      portfolio_item_id: itemId,
      author_id: authorId,
      author_role: role,
      feedback_text: text,
      reactions: {},
      created_at: new Date().toISOString(),
      author_profile: authorProfile
    };

    set((state) => ({
      portfolioItems: state.portfolioItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            feedbacks: [...(item.feedbacks || []), newFeedback],
            updated_at: new Date().toISOString()
          };
        }
        return item;
      })
    }));
  },

  addReaction: (itemId, roleCategory, emoji) => {
    set((state) => ({
      portfolioItems: state.portfolioItems.map(item => {
        if (item.id === itemId) {
          const updatedFeedbacks = item.feedbacks ? [...item.feedbacks] : [];
          if (updatedFeedbacks.length > 0) {
            const firstFb = { ...updatedFeedbacks[0] };
            const currentReactions = firstFb.reactions[roleCategory] || [];
            if (!currentReactions.includes(emoji)) {
              firstFb.reactions = {
                ...firstFb.reactions,
                [roleCategory]: [...currentReactions, emoji]
              };
              updatedFeedbacks[0] = firstFb;
            }
          }
          return {
            ...item,
            feedbacks: updatedFeedbacks,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      })
    }));
  },

  reviewPortfolioItem: (itemId, status, comment, xpAward = 100, campos_formativos, pdas, ejes_articuladores, xp_breakdown) => {
    const newFeedback: PortfolioFeedback = {
      id: `fb-${Date.now()}`,
      portfolio_item_id: itemId,
      author_id: TEACHER_SEED.id,
      author_role: 'teacher',
      feedback_text: comment,
      reactions: { teacher: ['👏', '⭐'] },
      created_at: new Date().toISOString(),
      author_profile: TEACHER_SEED
    };

    let targetStudentId = '';

    set((state) => ({
      portfolioItems: state.portfolioItems.map(item => {
        if (item.id === itemId) {
          targetStudentId = item.student_id;
          return {
            ...item,
            status: status,
            feedbacks: [...(item.feedbacks || []), newFeedback],
            campos_formativos,
            pdas,
            ejes_articuladores,
            xp_breakdown,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      })
    }));

    if (status === 'approved' && targetStudentId) {
      const studentStore = useStudentStore.getState();
      studentStore.addXpAndCoins(targetStudentId, xpAward, 20);
    }
  },

  linkPortfolioItemToQuest: (itemId, questId) => {
    const gamificationStore = useGamificationStore.getState();
    const quest = gamificationStore.missionsList.flatMap(m => m.quests || []).find(q => q.id === questId);
    
    set((state) => ({
      portfolioItems: state.portfolioItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quest_id: questId,
            campos_formativos: quest?.campos_formativos || item.campos_formativos,
            ejes_articuladores: quest?.ejes_articuladores || item.ejes_articuladores,
            pdas: quest?.pdas || item.pdas,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      })
    }));
  },

  submitPeerReview: (itemId, score, comment) => {
    const studentStore = useStudentStore.getState();
    const gamificationStore = useGamificationStore.getState();
    const activeStudentId = studentStore.activeStudentId;

    set((state) => ({
      portfolioItems: state.portfolioItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            peer_review_score: score,
            peer_review_comments: comment,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      })
    }));

    // Recompensa al coevaluador
    studentStore.addXpAndCoins(activeStudentId, 100, 15);

    // Desbloquear medalla de Compañero Estelar (badge-5)
    if (!gamificationStore.studentBadges.some(sb => sb.badge_id === 'badge-5' && sb.student_id === activeStudentId)) {
      gamificationStore.unlockBadge(activeStudentId, 'badge-5');
    }
  },

  fetchPortfolioItems: async (groupId) => {
    set({ isLoadingPortfolio: true });
    try {
      let query = supabase.from('portfolio_items').select('*');
      if (groupId) {
        query = query.eq('group_id', groupId);
      }
      const response = await query;
      if (response.error) throw new Error(response.error.message);
      set({ portfolioItems: response.data || [] });
    } catch (err: any) {
      console.error('Error fetching portfolio items:', err.message);
    } finally {
      set({ isLoadingPortfolio: false });
    }
  },

  resetPortfolioStore: () => {
    set({
      portfolioItems: PORTFOLIO_SEED,
      isLoadingPortfolio: false
    });
  }
}));
