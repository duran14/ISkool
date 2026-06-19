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

// Supabase Mock Client representing RPC calls and Auth/Queries
export const supabase = {
  auth: new SupabaseAuth(),
  
  from: (tableName: string) => {
    return new SupabaseQueryBuilder(tableName);
  },

  rpc: async (functionName: string, args: any): Promise<any> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Verify Session exists before performing write operations (RPCs)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('401 Unauthorized: JWT no provisto para la operación');
    }

    switch (functionName) {
      case 'submit_quiz': {
        const { student_id, quest_id, score, answers } = args;
        const studentStats = db.stats[student_id];
        if (!studentStats) throw new Error(`Student ${student_id} not found.`);

        // Find quest config details from missions seed
        let xpReward = 50;
        let coinsReward = 5;
        let subjectId = "sub-math";

        const mission = MISSIONS_SEED.find(m => 
          m.quests?.some(q => {
            if (q.id === quest_id) {
              xpReward = q.xp_reward;
              coinsReward = q.coins_reward;
              return true;
            }
            return false;
          })
        );
        if (mission) subjectId = mission.subject_id;

        const factor = score / 100;
        const xpEarned = Math.round(xpReward * factor);
        const coinsEarned = score === 100 ? coinsReward + 5 : Math.round(coinsReward * factor);

        // Update streak
        let currentStreak = studentStats.current_streak;
        let maxStreak = studentStats.max_streak;
        const todayStr = new Date().toISOString().split('T')[0];
        
        if (!studentStats.last_active_date) {
          currentStreak = 1;
        } else if (studentStats.last_active_date !== todayStr) {
          const lastActiveDate = new Date(studentStats.last_active_date);
          const today = new Date(todayStr);
          const diffTime = Math.abs(today.getTime() - lastActiveDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            currentStreak += 1;
          } else {
            currentStreak = 1; // reset streak
          }
        }
        maxStreak = Math.max(currentStreak, maxStreak);

        // Update XP/Level
        let xp = studentStats.xp + xpEarned;
        let level = studentStats.level;
        let skillPoints = studentStats.skill_points || 0;
        let leveledUp = false;
        
        const xpRequired = level * 200;
        if (xp >= xpRequired) {
          xp -= xpRequired;
          level += 1;
          leveledUp = true;
          if (student_id === 'std-sec') {
            skillPoints += 2;
          }
        }

        // Save back to stats db
        const updatedStats: StudentStats = {
          ...studentStats,
          xp,
          level,
          coins: studentStats.coins + coinsEarned,
          current_streak: currentStreak,
          max_streak: maxStreak,
          last_active_date: todayStr,
          skill_points: skillPoints,
          updated_at: new Date().toISOString()
        };
        db.stats[student_id] = updatedStats;

        // Record attempt
        const newAttempt: QuestAttempt = {
          id: `att-${Date.now()}`,
          student_id,
          quest_id,
          score,
          is_completed: score >= 60,
          answers,
          feedback: score === 100 
            ? '¡Increíble! Obtuviste un puntaje perfecto. ¡Eres una estrella!' 
            : score >= 60 
              ? '¡Bien hecho! Aprobaste el reto.'
              : '¡No te preocupes! El error es aprendizaje. Vuelve a intentarlo.',
          created_at: new Date().toISOString()
        };
        db.attempts.push(newAttempt);

        // Check badge unlocks
        let badgeEarned = null;
        const hasBadge1 = db.badges.some(sb => sb.badge_id === 'badge-1' && sb.student_id === student_id);
        const hasBadge3 = db.badges.some(sb => sb.badge_id === 'badge-3' && sb.student_id === student_id);

        if (score === 100 && subjectId === 'sub-math' && !hasBadge1) {
          badgeEarned = BADGES_SEED[0];
          db.badges.push({ student_id, badge_id: BADGES_SEED[0].id, earned_at: new Date().toISOString() });
        } else if (score >= 60 && !hasBadge3) {
          const pastFail = db.attempts.some(qa => qa.quest_id === quest_id && qa.score < 60 && qa.student_id === student_id);
          if (pastFail) {
            badgeEarned = BADGES_SEED[2];
            db.badges.push({ student_id, badge_id: BADGES_SEED[2].id, earned_at: new Date().toISOString() });
          }
        }

        return {
          success: true,
          xp_earned: xpEarned,
          coins_earned: coinsEarned,
          leveled_up: leveledUp,
          badge_earned: badgeEarned,
          new_attempt: newAttempt,
          new_stats: updatedStats
        };
      }

      case 'submit_exam': {
        const { student_id, quest_id, score, answers, stat_boost, custom_loot } = args;
        const studentStats = db.stats[student_id];
        if (!studentStats) throw new Error(`Student ${student_id} not found.`);

        let xpReward = 150;
        let coinsReward = 20;

        const mission = MISSIONS_SEED.find(m => 
          m.quests?.some(q => {
            if (q.id === quest_id) {
              xpReward = q.xp_reward;
              coinsReward = q.coins_reward;
              return true;
            }
            return false;
          })
        );

        const factor = score / 100;
        const xpEarned = Math.round(xpReward * factor);
        const coinsEarned = score === 100 ? coinsReward + 10 : Math.round(coinsReward * factor);

        // Update stats
        let xp = studentStats.xp + xpEarned;
        let level = studentStats.level;
        let skillPoints = studentStats.skill_points || 0;
        let leveledUp = false;
        
        const xpRequired = level * 200;
        if (xp >= xpRequired) {
          xp -= xpRequired;
          level += 1;
          leveledUp = true;
          if (student_id === 'std-sec') {
            skillPoints += 2;
          }
        }

        // Apply RPG boosts
        let strength = studentStats.attribute_strength || 10;
        let intelligence = studentStats.attribute_intelligence || 10;
        let defense = studentStats.attribute_defense || 10;

        if (stat_boost) {
          if (stat_boost.strength) strength += stat_boost.strength;
          if (stat_boost.intelligence) intelligence += stat_boost.intelligence;
          if (stat_boost.defense) defense += stat_boost.defense;
        }

        const updatedStats: StudentStats = {
          ...studentStats,
          xp,
          level,
          coins: studentStats.coins + coinsEarned,
          skill_points: skillPoints,
          attribute_strength: strength,
          attribute_intelligence: intelligence,
          attribute_defense: defense,
          updated_at: new Date().toISOString()
        };
        db.stats[student_id] = updatedStats;

        // Unlock Custom Loot (for Elena/Secondary Avatar)
        if (custom_loot) {
          const avatar = db.avatars[student_id];
          if (avatar) {
            const currentUnlocked = avatar.unlocked_items || [];
            if (!currentUnlocked.includes(custom_loot)) {
              db.avatars[student_id] = {
                ...avatar,
                unlocked_items: [...currentUnlocked, custom_loot],
                pet_hunger: 100,
                pet_happiness: 100,
                updated_at: new Date().toISOString()
              };
            }
          }
        }

        // Record attempt
        const newAttempt: QuestAttempt = {
          id: `att-${Date.now()}`,
          student_id,
          quest_id,
          score,
          is_completed: score >= 60,
          answers,
          feedback: score === 100 
            ? '¡Increíble! Derrotaste al Jefe con un puntaje perfecto. ¡Eres una verdadera leyenda!' 
            : score >= 60 
              ? '¡Bien hecho! Superaste la prueba y salvaste el reino.'
              : '¡Fuiste derrotado! Revisa tus respuestas y vuelve a desafiar al jefe.',
          created_at: new Date().toISOString()
        };
        db.attempts.push(newAttempt);

        // Check perfect exam badge
        let badgeEarned = null;
        const hasPerfectBadge = db.badges.some(sb => sb.badge_id === 'badge-perfect-exam' && sb.student_id === student_id);
        if (score === 100 && !hasPerfectBadge) {
          badgeEarned = {
            id: 'badge-perfect-exam',
            name: 'Vencedor del Caos 🏆',
            description: 'Derrotó a un Jefe de Examen con puntaje perfecto.',
            category: 'academic',
            icon_name: 'award',
            xp_required: 0,
            created_at: new Date().toISOString()
          };
          db.badges.push({ student_id, badge_id: 'badge-perfect-exam', earned_at: new Date().toISOString() });
        }

        return {
          success: true,
          xp_earned: xpEarned,
          coins_earned: coinsEarned,
          leveled_up: leveledUp,
          badge_earned: badgeEarned,
          new_attempt: newAttempt,
          new_stats: updatedStats,
          new_avatar: db.avatars[student_id]
        };
      }

      case 'level_up_attribute': {
        const { student_id, attribute_name } = args;
        const studentStats = db.stats[student_id];
        if (!studentStats) throw new Error(`Student ${student_id} not found.`);

        if ((studentStats.skill_points || 0) <= 0) {
          throw new Error("No skill points available.");
        }

        let strength = studentStats.attribute_strength || 10;
        let intelligence = studentStats.attribute_intelligence || 10;
        let defense = studentStats.attribute_defense || 10;

        if (attribute_name === 'strength') strength += 1;
        else if (attribute_name === 'intelligence') intelligence += 1;
        else if (attribute_name === 'defense') defense += 1;

        const updatedStats: StudentStats = {
          ...studentStats,
          skill_points: (studentStats.skill_points || 1) - 1,
          attribute_strength: strength,
          attribute_intelligence: intelligence,
          attribute_defense: defense,
          updated_at: new Date().toISOString()
        };
        db.stats[student_id] = updatedStats;

        return {
          success: true,
          new_stats: updatedStats
        };
      }

      case 'purchase_artifact': {
        const { student_id, artifact_id } = args;
        const studentStats = db.stats[student_id];
        if (!studentStats) throw new Error(`Student ${student_id} not found.`);

        const artifact = db.artifactsList.find(a => a.id === artifact_id);
        if (!artifact) throw new Error(`Artifact ${artifact_id} not found.`);

        if (studentStats.coins < artifact.price) {
          throw new Error("Insufficient coins.");
        }

        const currentInventory = db.inventory[student_id] || [];
        if (currentInventory.includes(artifact_id)) {
          throw new Error("Artifact already owned.");
        }

        // Deduct coins
        const updatedStats: StudentStats = {
          ...studentStats,
          coins: studentStats.coins - artifact.price,
          updated_at: new Date().toISOString()
        };
        db.stats[student_id] = updatedStats;

        // Add to inventory
        const newInventory = [...currentInventory, artifact_id];
        db.inventory[student_id] = newInventory;

        // Message
        const newMessage: StudentMessage = {
          id: `smsg-${Date.now()}`,
          student_id,
          title: '🎁 Compra de Artefacto',
          message: `Has comprado el artefacto "${artifact.name}" por ${artifact.price} monedas. ¡Ahora tienes una oportunidad extra en exámenes!`,
          sent_at: new Date().toISOString(),
          is_read: false,
          type: 'general'
        };
        db.messages.unshift(newMessage);

        return {
          success: true,
          new_stats: updatedStats,
          new_inventory: newInventory,
          new_message: newMessage
        };
      }

      case 'grant_artifact': {
        const { student_id, artifact_id } = args;
        const artifact = db.artifactsList.find(a => a.id === artifact_id) || { name: 'Artefacto' };

        const currentInventory = db.inventory[student_id] || [];
        if (currentInventory.includes(artifact_id)) {
          throw new Error("Student already owns this artifact.");
        }

        const newInventory = [...currentInventory, artifact_id];
        db.inventory[student_id] = newInventory;

        const newMessage: StudentMessage = {
          id: `smsg-${Date.now()}`,
          student_id,
          title: '🎁 Artefacto Otorgado',
          message: `El profesor te ha otorgado el artefacto "${artifact.name}". ¡Se ha añadido a tu inventario!`,
          sent_at: new Date().toISOString(),
          is_read: false,
          type: 'general'
        };
        db.messages.unshift(newMessage);

        return {
          success: true,
          new_inventory: newInventory,
          new_message: newMessage
        };
      }

      case 'revoke_artifact': {
        const { student_id, artifact_id, reason } = args;
        const artifact = db.artifactsList.find(a => a.id === artifact_id) || { name: 'Artefacto' };

        const currentInventory = db.inventory[student_id] || [];
        const newInventory = currentInventory.filter(id => id !== artifact_id);
        db.inventory[student_id] = newInventory;

        const newMessage: StudentMessage = {
          id: `smsg-${Date.now()}`,
          student_id,
          title: '⚠️ Artefacto Retirado',
          message: `Se te ha retirado el artefacto "${artifact.name}". Motivo: ${reason}`,
          sent_at: new Date().toISOString(),
          is_read: false,
          type: 'revocation',
          revoked_artifact: artifact.name,
          reason: reason
        };
        db.messages.unshift(newMessage);

        return {
          success: true,
          new_inventory: newInventory,
          new_message: newMessage
        };
      }

      default:
        throw new Error(`Unknown RPC function: ${functionName}`);
    }
  }
};
