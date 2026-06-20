import { create } from 'zustand';
import { Mission, QuestAttempt, StudentBadge, GuildBoss, GuildMemberSubmission, ShopArtifact, Quest, Badge } from '../types';
import { MISSIONS_SEED, BOSS_SEED, GUILD_SUBMISSIONS_SEED, DEFAULT_ARTIFACTS_SEED, BADGES_SEED, SUBJECTS_SEED } from './seeds';
import { useStudentStore } from './useStudentStore';
import { supabase } from '@/lib/supabaseClient';

interface GamificationStoreState {
  missionsList: Mission[];
  questAttempts: QuestAttempt[];
  studentBadges: StudentBadge[];
  guildBoss: GuildBoss;
  guildSubmissions: GuildMemberSubmission[];
  shopArtifacts: ShopArtifact[];
  isLoadingMissions: boolean;

  // Actions
  submitQuiz: (questId: string, score: number, answers: any) => Promise<{
    xpEarned: number;
    coinsEarned: number;
    leveledUp: boolean;
    badgeEarned: Badge | null;
  }>;
  
  submitExam: (
    questId: string,
    score: number,
    answers: any,
    statBoost?: { strength?: number; intelligence?: number; defense?: number },
    customLoot?: string
  ) => Promise<{
    xpEarned: number;
    coinsEarned: number;
    leveledUp: boolean;
    badgeEarned: Badge | null;
  }>;
  
  saveQuest: (subjectId: string, questData: Omit<Quest, 'created_at'> & { id?: string }) => void;
  triggerGuildAttack: (damage: number) => void;
  resetGuildBoss: () => void;
  submitGuildHomework: (studentId: string, onTime: boolean) => void;
  createArtifact: (artifactData: Omit<ShopArtifact, 'id'>) => void;
  unlockBadge: (studentId: string, badgeId: string) => void;
  fetchMissions: () => Promise<void>;
  resetGamificationStore: () => void;
}

export const useGamificationStore = create<GamificationStoreState>((set, get) => ({
  missionsList: MISSIONS_SEED,
  questAttempts: [],
  studentBadges: [
    { student_id: 'std-pa', badge_id: 'badge-1', earned_at: new Date().toISOString() },
    { student_id: 'std-sec', badge_id: 'badge-3', earned_at: new Date().toISOString() }
  ],
  guildBoss: BOSS_SEED,
  guildSubmissions: GUILD_SUBMISSIONS_SEED,
  shopArtifacts: DEFAULT_ARTIFACTS_SEED,
  isLoadingMissions: false,

  submitQuiz: async (questId, score, answers) => {
    const studentStore = useStudentStore.getState();
    const activeStudentId = studentStore.activeStudentId;

    try {
      const response = await supabase.rpc('submit_quiz', {
        student_id: activeStudentId,
        quest_id: questId,
        score: score,
        answers: answers
      });

      if (response && response.data && response.data.success) {
        // Update quest attempts
        set((state) => ({
          questAttempts: [response.data.new_attempt, ...state.questAttempts]
        }));

        // Update student store stats
        useStudentStore.setState((state) => ({
          allStats: {
            ...state.allStats,
            [activeStudentId]: response.data.new_stats
          }
        }));

        // Update student badges
        if (response.data.badge_earned) {
          get().unlockBadge(activeStudentId, response.data.badge_earned.id);
        }

        return {
          xpEarned: response.data.xp_earned,
          coinsEarned: response.data.coins_earned,
          leveledUp: response.data.leveled_up,
          badgeEarned: response.data.badge_earned
        };
      }
    } catch (err: any) {
      console.error('Error submitting quiz:', err);
    }

    return { xpEarned: 0, coinsEarned: 0, leveledUp: false, badgeEarned: null };
  },

  submitExam: async (questId, score, answers, statBoost, customLoot) => {
    const studentStore = useStudentStore.getState();
    const activeStudentId = studentStore.activeStudentId;

    try {
      const response = await supabase.rpc('submit_exam', {
        student_id: activeStudentId,
        quest_id: questId,
        score: score,
        answers: answers,
        stat_boost: statBoost,
        custom_loot: customLoot
      });

      if (response && response.data && response.data.success) {
        // Update quest attempts
        set((state) => ({
          questAttempts: [response.data.new_attempt, ...state.questAttempts]
        }));

        // Update student store stats & avatars
        useStudentStore.setState((state) => ({
          allStats: {
            ...state.allStats,
            [activeStudentId]: response.data.new_stats
          },
          allAvatars: {
            ...state.allAvatars,
            [activeStudentId]: response.data.new_avatar || state.allAvatars[activeStudentId]
          }
        }));

        // Update student badges
        if (response.data.badge_earned) {
          get().unlockBadge(activeStudentId, response.data.badge_earned.id);
        }

        return {
          xpEarned: response.data.xp_earned,
          coinsEarned: response.data.coins_earned,
          leveledUp: response.data.leveled_up,
          badgeEarned: response.data.badge_earned
        };
      }
    } catch (err: any) {
      console.error('Error submitting exam:', err);
    }

    return { xpEarned: 0, coinsEarned: 0, leveledUp: false, badgeEarned: null };
  },

  saveQuest: (subjectId, questData) => {
    set((state) => {
      const existingMissionIndex = state.missionsList.findIndex(m => m.subject_id === subjectId);
      const newQuest: Quest = {
        ...questData,
        id: questData.id || `q-${Date.now()}`,
        created_at: new Date().toISOString()
      } as Quest;

      if (existingMissionIndex !== -1) {
        const mission = state.missionsList[existingMissionIndex];
        const quests = mission.quests || [];
        const existingQuestIndex = quests.findIndex(q => q.id === newQuest.id);

        let updatedQuests;
        if (existingQuestIndex !== -1) {
          updatedQuests = quests.map((q, idx) => idx === existingQuestIndex ? newQuest : q);
        } else {
          updatedQuests = [...quests, { ...newQuest, sequence_order: quests.length + 1 }];
        }

        return {
          missionsList: state.missionsList.map((m, idx) => 
            idx === existingMissionIndex ? { ...mission, quests: updatedQuests } : m
          )
        };
      } else {
        const subject = SUBJECTS_SEED.find(s => s.id === subjectId);
        const subjectName = subject ? subject.name : 'Materia';
        const newMission: Mission = {
          id: `mis-${subjectId}-${Date.now()}`,
          school_id: 'sch-1',
          subject_id: subjectId,
          level_grade_id: 'lg-4',
          title: `Camino de Aprendizaje: ${subjectName}`,
          description: `Misiones y retos de la asignatura de ${subjectName}`,
          story_intro: `¡Bienvenido al mapa de aprendizaje de ${subjectName}! Supera los retos para obtener XP y medallas.`,
          map_position_x: 50,
          map_position_y: 50,
          is_active: true,
          created_at: new Date().toISOString(),
          quests: [{ ...newQuest, sequence_order: 1 }]
        };
        return {
          missionsList: [...state.missionsList, newMission]
        };
      }
    });
  },

  triggerGuildAttack: (damage) => {
    set((state) => {
      const newHp = Math.max(0, state.guildBoss.hp_actual - damage);
      return {
        guildBoss: {
          ...state.guildBoss,
          hp_actual: newHp
        }
      };
    });
  },

  resetGuildBoss: () => {
    set({
      guildBoss: BOSS_SEED,
      guildSubmissions: GUILD_SUBMISSIONS_SEED
    });
  },

  submitGuildHomework: (studentId, onTime) => {
    set((state) => ({
      guildSubmissions: state.guildSubmissions.map(member => {
        if (member.student_id === studentId) {
          return {
            ...member,
            status: onTime ? 'submitted_on_time' : 'submitted_late',
            submitted_at: new Date().toISOString()
          };
        }
        return member;
      })
    }));
  },

  createArtifact: (artifactData) => {
    const newArtifact: ShopArtifact = {
      ...artifactData,
      id: `art-${Date.now()}`
    };
    set((state) => ({
      shopArtifacts: [...state.shopArtifacts, newArtifact]
    }));
    alert(`Artefacto "${newArtifact.name}" creado con éxito.`);
  },

  unlockBadge: (studentId, badgeId) => {
    const newBadge: StudentBadge = {
      student_id: studentId,
      badge_id: badgeId,
      earned_at: new Date().toISOString()
    };
    set((state) => ({
      studentBadges: [...state.studentBadges, newBadge]
    }));
  },

  fetchMissions: async () => {
    set({ isLoadingMissions: true });
    try {
      const response = await supabase.from('missions').select('*');
      if (response.error) throw new Error(response.error.message);
      set({ missionsList: response.data || [] });
    } catch (err: any) {
      console.error('Error fetching missions:', err.message);
    } finally {
      set({ isLoadingMissions: false });
    }
  },

  resetGamificationStore: () => {
    set({
      missionsList: MISSIONS_SEED,
      questAttempts: [],
      studentBadges: [
        { student_id: 'std-pa', badge_id: 'badge-1', earned_at: new Date().toISOString() },
        { student_id: 'std-sec', badge_id: 'badge-3', earned_at: new Date().toISOString() }
      ],
      guildBoss: BOSS_SEED,
      guildSubmissions: GUILD_SUBMISSIONS_SEED,
      shopArtifacts: DEFAULT_ARTIFACTS_SEED,
      isLoadingMissions: false
    });
  }
}));
