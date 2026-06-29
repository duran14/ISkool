import { create } from 'zustand';
import { useMemo } from 'react';
import { StudentStats, StudentAvatar, StudentMessage, UserProfile } from '../types';
import { STATS_MAP_SEED, AVATAR_MAP_SEED, STUDENT_INVENTORY_SEED, STUDENT_MESSAGES_SEED, STUDENTS_LIST_SEED } from './seeds';
import { supabase } from '@/lib/supabaseClient';

interface StudentStoreState {
  activeStudentId: string;
  allStats: Record<string, StudentStats>;
  allAvatars: Record<string, StudentAvatar>;
  studentInventoryMap: Record<string, string[]>;
  studentMessages: StudentMessage[];
  isLoadingStats: boolean;
  
  // Actions
  switchStudent: (studentId: string) => Promise<void>;
  changeAvatar: (config: Partial<StudentAvatar>) => void;
  feedPet: () => void;
  playWithPet: () => void;
  levelUpAttribute: (statName: 'strength' | 'intelligence' | 'defense') => Promise<void>;
  purchaseArtifact: (studentId: string, artifactId: string) => Promise<void>;
  grantArtifact: (studentId: string, artifactId: string) => Promise<void>;
  revokeArtifact: (studentId: string, artifactId: string, reason: string) => Promise<void>;
  markStudentMessageAsRead: (messageId: string) => void;
  fetchStats: (groupId?: string) => Promise<void>;
  
  // Cross-store helpers
  addXpAndCoins: (studentId: string, xpEarned: number, coinsEarned: number, levelUpCallback?: (leveledUp: boolean) => void) => void;
  updateStatsAfterExam: (
    studentId: string, 
    xpEarned: number, 
    coinsEarned: number, 
    statBoost?: { strength?: number; intelligence?: number; defense?: number },
    customLoot?: string
  ) => void;
  initializeNewStudent: (studentId: string, firstName: string) => void;
  resetStudentStore: () => void;
}

export const useStudentStore = create<StudentStoreState>((set, get) => ({
  activeStudentId: 'std-pa',
  allStats: STATS_MAP_SEED,
  allAvatars: AVATAR_MAP_SEED,
  studentInventoryMap: STUDENT_INVENTORY_SEED,
  studentMessages: STUDENT_MESSAGES_SEED,
  isLoadingStats: false,

  switchStudent: async (studentId) => {
    set({ activeStudentId: studentId });
    const student = STUDENTS_LIST_SEED.find(s => s.id === studentId);
    const email = student?.email;
    if (email) {
      await supabase.auth.signInWithPassword({ email, password: 'ISkoolPassword2026!' });
      // Fetch stats to sync
      const response = await supabase.from('student_stats').select('*');
      if (response && response.data && response.data.length > 0) {
        set((state) => ({
          allStats: {
            ...state.allStats,
            [studentId]: response.data[0]
          }
        }));
      }
    }
  },

  changeAvatar: (config) => {
    const { activeStudentId } = get();
    set((state) => ({
      allAvatars: {
        ...state.allAvatars,
        [activeStudentId]: {
          ...state.allAvatars[activeStudentId],
          ...config,
          updated_at: new Date().toISOString(),
        },
      },
    }));
  },

  feedPet: () => {
    const { activeStudentId, allStats, allAvatars } = get();
    const stats = allStats[activeStudentId];
    if (!stats || stats.coins < 5) {
      alert('¡No tienes suficientes monedas! Resuelve retos para ganar monedas.');
      return;
    }

    set((state) => {
      const currentStats = state.allStats[activeStudentId];
      const currentAv = state.allAvatars[activeStudentId];
      const newHunger = Math.max(0, (currentAv.pet_hunger || 50) - 20);
      const newHappiness = Math.min(100, (currentAv.pet_happiness || 50) + 5);

      return {
        allStats: {
          ...state.allStats,
          [activeStudentId]: {
            ...currentStats,
            coins: currentStats.coins - 5,
            xp: currentStats.xp + 10,
          },
        },
        allAvatars: {
          ...state.allAvatars,
          [activeStudentId]: {
            ...currentAv,
            pet_hunger: newHunger,
            pet_happiness: newHappiness,
            updated_at: new Date().toISOString(),
          },
        },
      };
    });
  },

  playWithPet: () => {
    const { activeStudentId, allStats } = get();
    const stats = allStats[activeStudentId];
    if (!stats || stats.coins < 2) {
      alert('¡No tienes suficientes monedas!');
      return;
    }

    set((state) => {
      const currentStats = state.allStats[activeStudentId];
      const currentAv = state.allAvatars[activeStudentId];
      const newHunger = Math.min(100, (currentAv.pet_hunger || 50) + 10);
      const newHappiness = Math.min(100, (currentAv.pet_happiness || 50) + 20);

      return {
        allStats: {
          ...state.allStats,
          [activeStudentId]: {
            ...currentStats,
            coins: currentStats.coins - 2,
            xp: currentStats.xp + 5,
          },
        },
        allAvatars: {
          ...state.allAvatars,
          [activeStudentId]: {
            ...currentAv,
            pet_hunger: newHunger,
            pet_happiness: newHappiness,
            updated_at: new Date().toISOString(),
          },
        },
      };
    });
  },

  levelUpAttribute: async (statName) => {
    const { activeStudentId } = get();
    try {
      const response = await supabase.rpc('level_up_attribute', {
        student_id: activeStudentId,
        attribute_name: statName
      });
      if (response.error) {
        console.error('SQL / SCHEMA DEVIATION DETECTED: La función RPC "level_up_attribute" no existe o falló en la base de datos de Supabase.', response.error);
        alert('Error al subir de nivel el atributo: ' + response.error.message);
        return;
      }
      if (response && response.data && response.data.success) {
        set((state) => ({
          allStats: {
            ...state.allStats,
            [activeStudentId]: response.data.new_stats
          }
        }));
      }
    } catch (err: any) {
      console.error('Error al subir de nivel el atributo:', err);
      alert(err.message || 'Error al subir de nivel el atributo');
    }
  },

  purchaseArtifact: async (studentId, artifactId) => {
    try {
      const response = await supabase.rpc('purchase_artifact', {
        student_id: studentId,
        artifact_id: artifactId
      });
      if (response.error) {
        console.error('SQL / SCHEMA DEVIATION DETECTED: La función RPC "purchase_artifact" no está definida en Supabase.', response.error);
        alert('Error al comprar el artefacto: ' + response.error.message);
        return;
      }
      if (response && response.data && response.data.success) {
        set((state) => ({
          allStats: {
            ...state.allStats,
            [studentId]: response.data.new_stats
          },
          studentInventoryMap: {
            ...state.studentInventoryMap,
            [studentId]: response.data.new_inventory
          },
          studentMessages: [response.data.new_message, ...state.studentMessages]
        }));
        alert(`¡Compraste el artefacto con éxito!`);
      }
    } catch (err: any) {
      console.error('Error al comprar artefacto:', err);
      alert(err.message || 'Error al comprar el artefacto');
    }
  },

  grantArtifact: async (studentId, artifactId) => {
    try {
      const response = await supabase.rpc('grant_artifact', {
        student_id: studentId,
        artifact_id: artifactId
      });
      if (response.error) {
        console.error('SQL / SCHEMA DEVIATION DETECTED: La función RPC "grant_artifact" no está definida en la base de datos de Supabase.', response.error);
        alert('Error al otorgar artefacto: ' + response.error.message);
        return;
      }
      if (response && response.data && response.data.success) {
        set((state) => ({
          studentInventoryMap: {
            ...state.studentInventoryMap,
            [studentId]: response.data.new_inventory
          },
          studentMessages: [response.data.new_message, ...state.studentMessages]
        }));
        alert("Artefacto otorgado con éxito.");
      }
    } catch (err: any) {
      console.error('Error al otorgar artefacto:', err);
      alert(err.message || 'Error al otorgar artefacto');
    }
  },

  revokeArtifact: async (studentId, artifactId, reason) => {
    try {
      const response = await supabase.rpc('revoke_artifact', {
        student_id: studentId,
        artifact_id: artifactId,
        reason: reason
      });
      if (response.error) {
        console.error('SQL / SCHEMA DEVIATION DETECTED: La función RPC "revoke_artifact" no se encuentra registrada en la base de datos de Supabase.', response.error);
        alert('Error al retirar artefacto: ' + response.error.message);
        return;
      }
      if (response && response.data && response.data.success) {
        set((state) => ({
          studentInventoryMap: {
            ...state.studentInventoryMap,
            [studentId]: response.data.new_inventory
          },
          studentMessages: [response.data.new_message, ...state.studentMessages]
        }));
        alert("Artefacto retirado e informe enviado al alumno.");
      }
    } catch (err: any) {
      console.error('Error al retirar artefacto:', err);
      alert(err.message || 'Error al retirar artefacto');
    }
  },

  markStudentMessageAsRead: (messageId) => {
    set((state) => ({
      studentMessages: state.studentMessages.map((msg) =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ),
    }));
  },

  addXpAndCoins: (studentId, xpEarned, coinsEarned, levelUpCallback) => {
    const { allStats } = get();
    const studentStats = allStats[studentId];
    if (!studentStats) return;

    let currentXP = studentStats.xp + xpEarned;
    let currentCoins = studentStats.coins + coinsEarned;
    let level = studentStats.level;
    let leveledUp = false;
    let skillPoints = studentStats.skill_points || 0;

    const xpRequiredForNextLevel = level * 200;
    if (currentXP >= xpRequiredForNextLevel) {
      currentXP -= xpRequiredForNextLevel;
      level += 1;
      leveledUp = true;
      const isSec = studentId === 'std-sec';
      if (isSec) {
        skillPoints += 2;
      }
    }

    let newStreak = studentStats.current_streak;
    const todayStr = new Date().toISOString().split('T')[0];
    if (studentStats.last_active_date !== todayStr) {
      newStreak = studentStats.current_streak + 1;
    }

    set((state) => ({
      allStats: {
        ...state.allStats,
        [studentId]: {
          ...studentStats,
          xp: currentXP,
          level: level,
          coins: currentCoins,
          current_streak: newStreak,
          max_streak: Math.max(newStreak, studentStats.max_streak),
          last_active_date: todayStr,
          skill_points: skillPoints,
          updated_at: new Date().toISOString(),
        },
      },
    }));

    if (levelUpCallback) {
      levelUpCallback(leveledUp);
    }
  },

  updateStatsAfterExam: (studentId, xpEarned, coinsEarned, statBoost, customLoot) => {
    const { allStats } = get();
    const studentStats = allStats[studentId];
    if (!studentStats) return;

    let currentXP = studentStats.xp + xpEarned;
    let currentCoins = studentStats.coins + coinsEarned;
    let level = studentStats.level;
    let skillPoints = studentStats.skill_points || 0;

    const xpRequiredForNextLevel = level * 200;
    if (currentXP >= xpRequiredForNextLevel) {
      currentXP -= xpRequiredForNextLevel;
      level += 1;
      if (studentId === 'std-sec') {
        skillPoints += 2;
      }
    }

    let finalStrength = studentStats.attribute_strength || 1;
    let finalIntelligence = studentStats.attribute_intelligence || 1;
    let finalDefense = studentStats.attribute_defense || 1;

    if (statBoost) {
      if (statBoost.strength) finalStrength += statBoost.strength;
      if (statBoost.intelligence) finalIntelligence += statBoost.intelligence;
      if (statBoost.defense) finalDefense += statBoost.defense;
    }

    set((state) => ({
      allStats: {
        ...state.allStats,
        [studentId]: {
          ...studentStats,
          xp: currentXP,
          level: level,
          coins: currentCoins,
          skill_points: skillPoints,
          attribute_strength: finalStrength,
          attribute_intelligence: finalIntelligence,
          attribute_defense: finalDefense,
          updated_at: new Date().toISOString(),
        },
      },
    }));

    if (customLoot) {
      set((state) => {
        const studentAvatar = state.allAvatars[studentId];
        if (!studentAvatar) return state;
        const currentUnlocked = studentAvatar.unlocked_items || [];
        const nextUnlocked = currentUnlocked.includes(customLoot) ? currentUnlocked : [...currentUnlocked, customLoot];
        return {
          allAvatars: {
            ...state.allAvatars,
            [studentId]: {
              ...studentAvatar,
              unlocked_items: nextUnlocked,
              pet_hunger: 100,
              pet_happiness: 100,
              updated_at: new Date().toISOString(),
            },
          },
        };
      });
    }
  },

  initializeNewStudent: (studentId, firstName) => {
    set((state) => ({
      allStats: {
        ...state.allStats,
        [studentId]: {
          student_id: studentId,
          xp: 0,
          level: 1,
          coins: 0,
          current_streak: 1,
          max_streak: 1,
          updated_at: new Date().toISOString(),
        },
      },
      allAvatars: {
        ...state.allAvatars,
        [studentId]: {
          student_id: studentId,
          avatar_name: firstName,
          hair_style: 'classic',
          hair_color: '#4B5563',
          eyes_style: 'happy',
          outfit_style: 'explorer',
          outfit_color: '#3B82F6',
          background_style: 'forest',
          unlocked_items: ['classic', 'happy', 'explorer', 'forest'],
          updated_at: new Date().toISOString(),
        },
      },
    }));
  },

  fetchStats: async (groupId?: string) => {
    set({ isLoadingStats: true });
    try {
      let query = supabase.from('student_stats').select('*');
      if (groupId) {
        query = query.eq('group_id', groupId);
      }
      const response = await query;
      if (response.error) throw new Error(response.error.message);
      
      const statsList = response.data || [];
      if (statsList.length > 0) {
        const statsMap = { ...get().allStats };
        statsList.forEach((stat: StudentStats) => {
          statsMap[stat.student_id] = stat;
        });
        set({ allStats: statsMap });
      }
    } catch (err: any) {
      console.error('Error fetching student stats:', err.message);
    } finally {
      set({ isLoadingStats: false });
    }
  },

  resetStudentStore: () => {
    set({
      activeStudentId: 'std-pa',
      allStats: STATS_MAP_SEED,
      allAvatars: AVATAR_MAP_SEED,
      studentInventoryMap: STUDENT_INVENTORY_SEED,
      studentMessages: STUDENT_MESSAGES_SEED,
      isLoadingStats: false,
    });
  },
}));

export const normalizeStudentId = (id: string): string => {
  if (id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11') return 'std-pa';
  if (id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a22') return 'std-sec';
  if (id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a33') return 'std-pb';
  if (id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44') return 'std-prep';
  return id;
};

// Selectores React
export const useCurrentStudentStats = () => {
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const stats = useStudentStore(state => state.allStats[activeStudentId]);
  
  return useMemo(() => {
    const active = stats || STATS_MAP_SEED[activeStudentId] || STATS_MAP_SEED[normalizeStudentId(activeStudentId)];
    if (active) return active;
    return {
      student_id: activeStudentId,
      xp: 0,
      level: 1,
      coins: 0,
      current_streak: 1,
      max_streak: 1,
      updated_at: ''
    };
  }, [stats, activeStudentId]);
};

export const useCurrentStudentAvatar = () => {
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const avatar = useStudentStore(state => state.allAvatars[activeStudentId]);
  
  return useMemo(() => {
    const active = avatar || AVATAR_MAP_SEED[activeStudentId] || AVATAR_MAP_SEED[normalizeStudentId(activeStudentId)];
    if (active) return active;
    return {
      student_id: activeStudentId,
      avatar_name: 'Estudiante',
      hair_style: 'classic',
      hair_color: '#4B5563',
      eyes_style: 'happy',
      outfit_style: 'explorer',
      outfit_color: '#3B82F6',
      background_style: 'forest',
      unlocked_items: ['classic', 'happy', 'explorer', 'forest'],
      updated_at: ''
    };
  }, [avatar, activeStudentId]);
};

export const useCurrentStudentProfile = () => {
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  return useMemo(() => {
    const norm = normalizeStudentId(activeStudentId);
    return STUDENTS_LIST_SEED.find(s => s.id === norm) || STUDENTS_LIST_SEED.find(s => s.id === activeStudentId) || STUDENTS_LIST_SEED[1];
  }, [activeStudentId]);
};
