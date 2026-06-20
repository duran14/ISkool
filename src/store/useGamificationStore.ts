import { create } from 'zustand';
import { Mission, QuestAttempt, StudentBadge, GuildBoss, GuildMemberSubmission, ShopArtifact, Quest, Badge } from '../types';
import { MISSIONS_SEED, BOSS_SEED, GUILD_SUBMISSIONS_SEED, DEFAULT_ARTIFACTS_SEED, SUBJECTS_SEED } from './seeds';
import { useStudentStore } from './useStudentStore';
import { supabase } from '@/lib/supabaseClient';

const STUDENT_MAP: Record<string, string> = {
  'std-pb': 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a33',
  'std-pa': 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11',
  'std-sec': 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a22',
  'std-prep': 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44',
};

const BADGE_MAP: Record<string, string> = {
  'badge-1': '83884124-d5cb-40c5-a663-fe8fb79d7246',
  'badge-2': '8022ef59-816e-421b-bfdb-7acf1ad92f04',
  'badge-3': '7589cae0-556c-4190-8bdc-fe545a9e4b0e',
  'badge-4': '70aaa111-88aa-4d3f-85b8-69508ace6bdd',
  'badge-5': '5e50c1fc-2435-4756-a83b-ffbc74f17f5f',
  'badge-6': '44fa24b1-2a3d-4308-ab2c-d02c65b762f7',
};

const SUBJECT_MAP: Record<string, string> = {
  'sub-math': 'b00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e11',
  'sub-span': 'b00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e22',
  'sub-sci': 'b00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e33',
};

const MISSION_MAP: Record<string, string> = {
  'mis-fractions': 'd00a0eeb-9c0b-4ef8-bb6d-6bb9bd380d11',
  'mis-selva': 'd00a0eeb-9c0b-4ef8-bb6d-6bb9bd380d22',
};

const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

const mapToUuid = (id: string, prefix = 'd00a0eeb-9c0b-4ef8-bb6d-') => {
  if (isUuid(id)) return id;
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
  return prefix + hex;
};

const mapStudentIdToUuid = (id: string): string => STUDENT_MAP[id] || id;
const mapBadgeIdToUuid = (id: string): string => BADGE_MAP[id] || id;
const mapSubjectIdToUuid = (id: string): string => SUBJECT_MAP[id] || id;
const mapMissionIdToUuid = (id: string): string => {
  if (MISSION_MAP[id]) return MISSION_MAP[id];
  return mapToUuid(id, 'd00a0eeb-9c0b-4ef8-bb6d-');
};
const mapQuestIdToUuid = (id: string): string => {
  if (id.startsWith('q-fractions-1')) return 'e00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c11';
  if (id.startsWith('q-fractions-2')) return 'e00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c22';
  if (id.startsWith('q-selva-1')) return 'e00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c33';
  if (id.startsWith('q-selva-2')) return 'e00a0eeb-9c0b-4ef8-bb6d-6bb9bd380c44';
  return mapToUuid(id, 'e00a0eeb-9c0b-4ef8-bb6d-');
};

const ensureSubjectExists = async (subjectId: string): Promise<string> => {
  const uuid = mapSubjectIdToUuid(subjectId);
  if (!isUuid(uuid)) return uuid;

  const { data, error } = await supabase
    .from('subjects')
    .select('id')
    .eq('id', uuid)
    .maybeSingle();

  if (error) throw new Error(`Error checking subject: ${error.message}`);
  if (data) return uuid;

  const name = subjectId === 'sub-math' ? 'Matemáticas' : subjectId === 'sub-sci' ? 'Ciencias Naturales' : 'Español';
  const { error: insertError } = await supabase
    .from('subjects')
    .insert({
      id: uuid,
      school_id: '00000000-0000-0000-0000-000000000000',
      level_grade_id: '1111c019-61c7-4097-8aca-03cc0c4db68a', // Default: Primaria 4º
      name: name,
      sep_code: subjectId.toUpperCase()
    });

  if (insertError) throw new Error(`Error inserting subject: ${insertError.message}`);
  return uuid;
};

const ensureMissionExists = async (subjectId: string, missionId: string, missionsList: Mission[]): Promise<string> => {
  const missionUuid = mapMissionIdToUuid(missionId);
  const subjectUuid = await ensureSubjectExists(subjectId);

  const { data, error } = await supabase
    .from('missions')
    .select('id')
    .eq('id', missionUuid)
    .maybeSingle();

  if (error) throw new Error(`Error checking mission: ${error.message}`);
  if (data) return missionUuid;

  const localMission = missionsList.find(m => m.id === missionId || mapMissionIdToUuid(m.id) === missionUuid);
  const title = localMission?.title || `Camino de Aprendizaje`;
  const description = localMission?.description || `Misiones y retos de la asignatura`;
  const storyIntro = localMission?.story_intro || `¡Bienvenido al mapa de aprendizaje!`;

  const { error: insertError } = await supabase
    .from('missions')
    .insert({
      id: missionUuid,
      school_id: '00000000-0000-0000-0000-000000000000',
      subject_id: subjectUuid,
      level_grade_id: '1111c019-61c7-4097-8aca-03cc0c4db68a', // Default to 4º Primaria
      title: title,
      description: description,
      story_intro: storyIntro,
      map_position_x: localMission?.map_position_x || 50,
      map_position_y: localMission?.map_position_y || 50,
      is_active: true
    });

  if (insertError) throw new Error(`Error inserting mission: ${insertError.message}`);
  return missionUuid;
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
  triggerGuildAttack: (damage: number) => void;
  resetGuildBoss: () => void;
  submitGuildHomework: (studentId: string, onTime: boolean) => void;
  createArtifact: (artifactData: Omit<ShopArtifact, 'id'>) => Promise<void>;
  unlockBadge: (studentId: string, badgeId: string) => Promise<void>;
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
      const questUuid = mapQuestIdToUuid(questData.id || `q-${Date.now()}`);

      // 2. Check if the quest already exists
      let exists = false;
      const { data: checkData, error: checkError } = await supabase
        .from('quests')
        .select('id')
        .eq('id', questUuid)
        .maybeSingle();

      if (checkError) throw new Error(checkError.message);
      if (checkData) {
        exists = true;
      }

      // 3. Map database columns
      const dbQuest = {
        id: questUuid,
        mission_id: missionUuid,
        title: questData.title,
        description: questData.description,
        type: questData.type === 'exam' ? 'quiz' : questData.type,
        sequence_order: questData.sequence_order || 1,
        xp_reward: questData.xp_reward,
        coins_reward: questData.coins_reward,
        content: questData.content
      };

      if (exists) {
        const { error } = await supabase
          .from('quests')
          .update(dbQuest)
          .eq('id', questUuid);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from('quests')
          .insert(dbQuest);
        if (error) throw new Error(error.message);
      }

      // 4. Update Zustand state ONLY if Supabase mutation was successful
      set((state) => {
        const existingMissionIndex = state.missionsList.findIndex(m => m.subject_id === subjectId);
        
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
      alert(`Error al sincronizar con Supabase: ${errorMsg}`);
    }
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
      const dbStudentId = mapStudentIdToUuid(studentId);
      const dbBadgeId = mapBadgeIdToUuid(badgeId);

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
      guildBoss: BOSS_SEED,
      guildSubmissions: GUILD_SUBMISSIONS_SEED,
      shopArtifacts: DEFAULT_ARTIFACTS_SEED,
      isLoadingMissions: false,
      syncError: null
    });
  }
}));
