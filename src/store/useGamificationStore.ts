import { create } from 'zustand';
import { Mission, QuestAttempt, StudentBadge, GuildBoss, GuildMemberSubmission, ShopArtifact, Quest, Badge } from '../types';
import { MISSIONS_SEED, BOSS_SEED, GUILD_SUBMISSIONS_SEED, DEFAULT_ARTIFACTS_SEED, SUBJECTS_SEED, BADGES_SEED } from './seeds';
import { useStudentStore } from './useStudentStore';
import { supabase } from '@/lib/supabaseClient';

const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

const ensureSubjectExists = async (subjectId: string): Promise<string> => {
  if (isUuid(subjectId)) {
    const { data, error } = await supabase
      .from('subjects')
      .select('id')
      .eq('id', subjectId)
      .maybeSingle();

    if (error) throw new Error(`Error checking subject: ${error.message}`);
    if (data) return subjectId;
  }

  const name = subjectId === 'sub-math' ? 'Matemáticas' : subjectId === 'sub-sci' ? 'Ciencias Naturales' : 'Español';
  
  const { data: existingSubject, error: findError } = await supabase
    .from('subjects')
    .select('id')
    .eq('name', name)
    .maybeSingle();

  if (findError) throw new Error(`Error finding subject: ${findError.message}`);
  if (existingSubject) return existingSubject.id;

  const { data: newSubject, error: insertError } = await supabase
    .from('subjects')
    .insert({
      school_id: '00000000-0000-0000-0000-000000000000',
      level_grade_id: '1111c019-61c7-4097-8aca-03cc0c4db68a', // Default: Primaria 4º
      name: name,
      sep_code: subjectId.toUpperCase()
    })
    .select('id')
    .single();

  if (insertError) throw new Error(`Error inserting subject: ${insertError.message}`);
  return newSubject.id;
};

const ensureMissionExists = async (subjectId: string, missionId: string, missionsList: Mission[]): Promise<string> => {
  const subjectUuid = await ensureSubjectExists(subjectId);

  if (isUuid(missionId)) {
    const { data, error } = await supabase
      .from('missions')
      .select('id')
      .eq('id', missionId)
      .maybeSingle();

    if (error) throw new Error(`Error checking mission: ${error.message}`);
    if (data) return missionId;
  }

  const { data: existingMission, error: missionError } = await supabase
    .from('missions')
    .select('id')
    .eq('subject_id', subjectUuid)
    .maybeSingle();

  if (missionError) throw new Error(`Error checking mission by subject: ${missionError.message}`);
  if (existingMission) return existingMission.id;

  const localMission = missionsList.find(m => m.id === missionId);
  const title = localMission?.title || `Camino de Aprendizaje`;
  const description = localMission?.description || `Misiones y retos de la asignatura`;
  const storyIntro = localMission?.story_intro || `¡Bienvenido al mapa de aprendizaje!`;

  const { data: newMission, error: insertError } = await supabase
    .from('missions')
    .insert({
      school_id: '00000000-0000-0000-0000-000000000000',
      subject_id: subjectUuid,
      level_grade_id: '1111c019-61c7-4097-8aca-03cc0c4db68a', // Default to 4º Primaria
      title: title,
      description: description,
      story_intro: storyIntro,
      map_position_x: localMission?.map_position_x || 50,
      map_position_y: localMission?.map_position_y || 50,
      is_active: true
    })
    .select('id')
    .single();

  if (insertError) throw new Error(`Error inserting mission: ${insertError.message}`);
  return newMission.id;
};

interface GamificationStoreState {
  missionsList: Mission[];
  questAttempts: QuestAttempt[];
  studentBadges: StudentBadge[];
  guildBoss: GuildBoss;
  guildSubmissions: GuildMemberSubmission[];
  shopArtifacts: ShopArtifact[];
  isLoadingMissions: boolean;
  syncError: string | null;

  // Actions
  submitQuiz: (questId: string, score: number, answers: Record<string, string | number>) => Promise<{
    xpEarned: number;
    coinsEarned: number;
    leveledUp: boolean;
    badgeEarned: Badge | null;
  }>;
  
  submitExam: (
    questId: string,
    score: number,
    answers: Record<string, string | number>,
    statBoost?: { strength?: number; intelligence?: number; defense?: number },
    customLoot?: string
  ) => Promise<{
    xpEarned: number;
    coinsEarned: number;
    leveledUp: boolean;
    badgeEarned: Badge | null;
  }>;
  
  saveQuest: (subjectId: string, questData: Omit<Quest, 'created_at'> & { id?: string }) => Promise<void>;
  triggerGuildAttack: (damage: number) => Promise<void>;
  resetGuildBoss: () => void;
  submitGuildHomework: (studentId: string, onTime: boolean) => void;
  createArtifact: (artifactData: Omit<ShopArtifact, 'id'>) => Promise<void>;
  unlockBadge: (studentId: string, badgeId: string) => Promise<void>;
  fetchMissions: () => Promise<void>;
  fetchActiveGuildBoss: () => Promise<void>;
  subscribeToGuildChanges: () => () => void;
  resetGamificationStore: () => void;
}


export const useGamificationStore = create<GamificationStoreState>((set, get) => ({
  missionsList: MISSIONS_SEED,
  questAttempts: [],
  studentBadges: [
    { student_id: 'std-pa', badge_id: 'badge-1', earned_at: new Date().toISOString() },
    { student_id: 'std-sec', badge_id: 'badge-3', earned_at: new Date().toISOString() }
  ],
  guildBoss: { id: '', name: 'Cargando Jefe...', hp_max: 1, hp_actual: 1, xp_reward: 0 },
  guildSubmissions: [],
  shopArtifacts: DEFAULT_ARTIFACTS_SEED,
  isLoadingMissions: false,
  syncError: null,

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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Error submitting quiz:', errorMsg);
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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Error submitting exam:', errorMsg);
    }

    return { xpEarned: 0, coinsEarned: 0, leveledUp: false, badgeEarned: null };
  },

  saveQuest: async (subjectId, questData) => {
    set({ syncError: null });
    try {
      // 1. Ensure subject and mission exist in Supabase
      const missionUuid = await ensureMissionExists(subjectId, questData.mission_id, get().missionsList);
      let questUuid = questData.id;
      const isNew = !questUuid || !isUuid(questUuid);

      // 2. Map database columns
      const dbQuest: any = {
        mission_id: missionUuid,
        title: questData.title,
        description: questData.description,
        type: questData.type === 'exam' ? 'quiz' : questData.type,
        sequence_order: questData.sequence_order || 1,
        xp_reward: questData.xp_reward,
        coins_reward: questData.coins_reward,
        content: questData.content
      };

      if (!isNew) {
        dbQuest.id = questUuid;
        const { error } = await supabase
          .from('quests')
          .update(dbQuest)
          .eq('id', questUuid);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from('quests')
          .insert(dbQuest)
          .select('id')
          .single();
        if (error) throw new Error(error.message);
        questUuid = data.id;
      }

      // 4. Update Zustand state ONLY if Supabase mutation was successful
      set((state) => {
        const existingMissionIndex = state.missionsList.findIndex(m => m.subject_id === subjectId || m.id === missionUuid);
        
        const newQuest: Quest = {
          ...questData,
          id: questUuid, // Keep consistent with database UUID
          mission_id: missionUuid,
          created_at: new Date().toISOString()
        } as Quest;

        if (existingMissionIndex !== -1) {
          const mission = state.missionsList[existingMissionIndex];
          const quests = mission.quests || [];
          const existingQuestIndex = quests.findIndex(q => q.id === questUuid || q.id === questData.id);

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
            id: missionUuid,
            school_id: '00000000-0000-0000-0000-000000000000',
            subject_id: subjectId,
            level_grade_id: '1111c019-61c7-4097-8aca-03cc0c4db68a',
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

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar el reto';
      console.error('Error saving quest:', err);
      set({ syncError: errorMsg });
      throw err;
    }
  },

  triggerGuildAttack: async (damage) => {
    try {
      // 1. Try with RPC first
      const { data, error } = await supabase.rpc('trigger_guild_attack', {
        damage_amount: damage
      });

      if (!error && data && data.success) {
        set({
          guildBoss: {
            id: data.id,
            name: data.name,
            hp_max: data.hp_max,
            hp_actual: data.hp_actual,
            xp_reward: data.xp_reward
          }
        });
        return;
      }
    } catch (err) {
      console.warn('RPC trigger_guild_attack failed, falling back to direct update:', err);
    }

    // Fallback: Direct UPDATE
    try {
      const currentBoss = get().guildBoss;
      const newHp = Math.max(0, currentBoss.hp_actual - damage);
      
      const { error } = await supabase
        .from('guild_bosses')
        .update({ hp_actual: newHp })
        .eq('id', currentBoss.id);

      if (error) throw error;

      set((state) => ({
        guildBoss: {
          ...state.guildBoss,
          hp_actual: newHp
        }
      }));
    } catch (err) {
      console.error('Error in fallback guild attack:', err);
    }
  },

  resetGuildBoss: () => {
    supabase
      .from('guild_bosses')
      .update({ hp_actual: 150 })
      .eq('id', 'boss-historia')
      .then(({ error }) => {
        if (error) console.error('Error resetting guild boss on Supabase:', error);
      });
    set({
      guildBoss: { ...BOSS_SEED, hp_actual: 150 },
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

  fetchActiveGuildBoss: async () => {
    try {
      const { data, error } = await supabase
        .from('guild_bosses')
        .select('*')
        .eq('id', 'boss-historia')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        set({ guildBoss: data as GuildBoss });
      } else {
        const { error: insertError } = await supabase
          .from('guild_bosses')
          .insert({
            id: 'boss-historia',
            name: 'Guardián de Historia',
            hp_max: 200,
            hp_actual: 150,
            xp_reward: 500
          });
        if (insertError) throw insertError;
        set({ guildBoss: { id: 'boss-historia', name: 'Guardián de Historia', hp_max: 200, hp_actual: 150, xp_reward: 500 } });
      }
    } catch (err) {
      console.error('Error fetching active guild boss:', err);
    }
  },

  subscribeToGuildChanges: () => {
    const channel = supabase
      .channel('guild_events')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'guild_bosses' },
        (payload) => {
          console.log('Realtime update received for guild boss:', payload);
          if (payload.new) {
            set({ guildBoss: payload.new as GuildBoss });
          }
        }
      )
      .subscribe((status) => {
        console.log('Supabase Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  },

  createArtifact: async (artifactData) => {
    set({ syncError: null });
    try {
      const artifactId = `art-${Date.now()}`;
      const dbArtifact = {
        id: artifactId,
        name: artifactData.name,
        description: artifactData.description,
        price: artifactData.price,
        icon: artifactData.icon
      };

      const { error } = await supabase
        .from('shop_artifacts')
        .insert(dbArtifact);

      if (error) throw new Error(error.message);

      // Zustand state update only after successful insert
      const newArtifact: ShopArtifact = {
        ...artifactData,
        id: artifactId
      };

      set((state) => ({
        shopArtifacts: [...state.shopArtifacts, newArtifact]
      }));

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar el artefacto';
      console.error('Error creating artifact:', err);
      set({ syncError: errorMsg });
      alert(`Error al sincronizar con Supabase: ${errorMsg}`);
    }
  },

  unlockBadge: async (studentId, badgeId) => {
    set({ syncError: null });
    try {
      const dbStudentId = studentId;
      let dbBadgeId = badgeId;

      if (!isUuid(badgeId)) {
        const seedBadge = BADGES_SEED.find(b => b.id === badgeId);
        if (seedBadge) {
          const { data, error } = await supabase
            .from('badges')
            .select('id')
            .eq('name', seedBadge.name)
            .maybeSingle();
          if (error) throw new Error(error.message);
          if (data) {
            dbBadgeId = data.id;
          }
        }
      }

      if (!isUuid(dbBadgeId)) {
        throw new Error(`Invalid badge ID format: ${badgeId}`);
      }

      const { data, error } = await supabase
        .from('student_badges')
        .insert({
          student_id: dbStudentId,
          badge_id: dbBadgeId
        })
        .select()
        .single();

      if (error) {
        // If already unlocked (duplicate key violation), we don't treat it as a hard failure
        if (error.code === '23505') {
          console.log(`Badge ${badgeId} already unlocked for student ${studentId}`);
          return;
        }
        throw new Error(error.message);
      }

      const earnedAt = data?.earned_at || new Date().toISOString();
      const newBadge: StudentBadge = {
        student_id: studentId,
        badge_id: badgeId,
        earned_at: earnedAt
      };

      set((state) => ({
        studentBadges: [...state.studentBadges, newBadge]
      }));

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al guardar en Supabase';
      console.error('Error unlocking badge:', err);
      set({ syncError: errorMsg });
      alert(`Error al desbloquear la medalla: ${errorMsg}`);
    }
  },

  fetchMissions: async () => {
    set({ isLoadingMissions: true });
    try {
      const response = await supabase.from('missions').select('*, quests(*)');
      if (response.error) throw new Error(response.error.message);
      
      const missionsWithSortedQuests = (response.data || []).map((m) => {
        const mission = m as Mission & { quests?: Quest[] };
        return {
          ...mission,
          quests: mission.quests ? [...mission.quests].sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0)) : []
        };
      });

      set({ missionsList: missionsWithSortedQuests });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error('Error fetching missions:', errorMsg);
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
      guildBoss: { id: '', name: 'Cargando Jefe...', hp_max: 1, hp_actual: 1, xp_reward: 0 },
      guildSubmissions: [],
      shopArtifacts: DEFAULT_ARTIFACTS_SEED,
      isLoadingMissions: false,
      syncError: null
    });
  }
}));
