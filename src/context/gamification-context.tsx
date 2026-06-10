"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  StudentStats,
  StudentAvatar,
  Badge,
  StudentBadge,
  Mission,
  Quest,
  QuestAttempt,
  PortfolioItem,
  PortfolioFeedback,
  PortfolioItemStatus,
  FeedbackAuthorRole,
  Subject,
  UserProfile,
  GuildBoss,
  GuildMemberSubmission
} from '../types';

interface GamificationContextProps {
  stats: StudentStats;
  avatar: StudentAvatar;
  badges: Badge[];
  studentBadges: StudentBadge[];
  missions: Mission[];
  portfolioItems: PortfolioItem[];
  questAttempts: QuestAttempt[];
  subjects: Subject[];
  
  // Perfiles Simulación
  currentStudent: UserProfile;
  studentsList: UserProfile[];
  activeStudentId: string;
  currentTeacher: UserProfile;
  currentParent: UserProfile;

  // RPG Boss and Guild Combat (Secundaria)
  guildBoss: GuildBoss;
  guildSubmissions: GuildMemberSubmission[];
  triggerGuildAttack: (damage: number) => void;
  resetGuildBoss: () => void;
  submitGuildHomework: (studentId: string, onTime: boolean) => void;
  
  // Acciones
  switchStudent: (studentId: string) => void;
  changeAvatar: (config: Partial<StudentAvatar>) => void;
  submitQuiz: (questId: string, score: number, answers: any) => { xpEarned: number, coinsEarned: number, leveledUp: boolean, badgeEarned: Badge | null };
  submitPortfolioItem: (title: string, description: string, fileUrl: string, fileType: any, selfReflection: string, questId?: string, subjectId?: string) => void;
  addPortfolioFeedback: (itemId: string, text: string, role: FeedbackAuthorRole, authorId: string) => void;
  addReaction: (itemId: string, roleCategory: string, emoji: string) => void;
  reviewPortfolioItem: (itemId: string, status: PortfolioItemStatus, comment: string, xpAward?: number) => void;
  
  // Acciones Específicas por Nivel
  feedPet: () => void;
  playWithPet: () => void;
  levelUpAttribute: (statName: 'strength' | 'intelligence' | 'defense') => void;
  submitPeerReview: (itemId: string, score: number, comment: string) => void;
  
  resetAllData: () => void;
}

const GamificationContext = createContext<GamificationContextProps | undefined>(undefined);

// --- SEED DATA ---

const SUBJECTS_SEED: Subject[] = [
  { id: 'sub-math', school_id: 'sch-1', level_grade_id: 'lg-4', name: 'Matemáticas', sep_code: 'MAT-4A', created_at: new Date().toISOString() },
  { id: 'sub-span', school_id: 'sch-1', level_grade_id: 'lg-4', name: 'Español', sep_code: 'ESP-4A', created_at: new Date().toISOString() },
  { id: 'sub-sci', school_id: 'sch-1', level_grade_id: 'lg-4', name: 'Ciencias Naturales', sep_code: 'CIE-4A', created_at: new Date().toISOString() }
];

const BADGES_SEED: Badge[] = [
  { id: 'badge-1', name: 'Matemago de Bronce', description: 'Resuelve tu primera misión de Matemáticas con racha perfecta.', icon_name: 'Calculator', category: 'academic', xp_required: 100, created_at: new Date().toISOString() },
  { id: 'badge-2', name: 'Lector de las Galaxias', description: 'Sube un audio leyendo en voz alta al portafolio.', icon_name: 'BookOpen', category: 'academic', xp_required: 150, created_at: new Date().toISOString() },
  { id: 'badge-3', name: 'Espíritu Indomable', description: 'Completa un reto después de haber fallado en el primer intento.', icon_name: 'Sparkles', category: 'persistence', xp_required: 200, created_at: new Date().toISOString() },
  { id: 'badge-4', name: 'Creador de Universos', description: 'Sube una evidencia artística o dibujo digital de alta calidad.', icon_name: 'Palette', category: 'creative', xp_required: 150, created_at: new Date().toISOString() },
  { id: 'badge-5', name: 'Compañero Estelar', description: 'Realiza una coevaluación constructiva para un compañero.', icon_name: 'Users', category: 'social', xp_required: 100, created_at: new Date().toISOString() },
  { id: 'badge-6', name: 'Racha del Sol', description: 'Mantén una racha de actividad diaria de 5 días seguidos.', icon_name: 'Flame', category: 'persistence', xp_required: 300, created_at: new Date().toISOString() }
];

// Misiones Muestra
const MISSIONS_SEED: Mission[] = [
  {
    id: 'mis-fractions',
    school_id: 'sch-1',
    subject_id: 'sub-math',
    level_grade_id: 'lg-4',
    title: 'La Aventura de las Fracciones',
    description: 'Ayuda a reparar la nave del Explorador Lucas dividiendo la energía en partes iguales.',
    story_intro: 'El explorador Lucas aterrizó en un planeta desconocido. Su propulsor de hipervelocidad se rompió y necesita piezas divididas exactamente en partes iguales para poder encenderlo. ¡Solo las matemáticas pueden salvar la misión!',
    map_position_x: 20,
    map_position_y: 60,
    is_active: true,
    created_at: new Date().toISOString(),
    quests: [
      {
        id: 'q-fractions-1',
        mission_id: 'mis-fractions',
        title: 'El Pastel Dividido',
        description: 'Aprende a identificar las partes del numerador y denominador en ejemplos deliciosos.',
        type: 'quiz',
        sequence_order: 1,
        xp_reward: 100,
        coins_reward: 15,
        created_at: new Date().toISOString(),
        content: {
          questions: [
            {
              id: 'q1',
              question: 'Si dividimos un pastel en 4 partes iguales y nos comemos 3 partes, ¿qué fracción queda en la mesa?',
              options: ['3/4', '1/4', '4/3', '2/4'],
              correctAnswerIndex: 1,
              explanation: '¡Exacto! Nos comimos 3 partes, por lo tanto queda 1 de las 4 partes, es decir, 1/4.'
            },
            {
              id: 'q2',
              question: '¿Cómo se llama el número de arriba en una fracción que indica las partes que tomamos?',
              options: ['Denominador', 'Numerador', 'Dividendo', 'Fraccionario'],
              correctAnswerIndex: 1,
              explanation: '¡Muy bien! El Numerador es el número de arriba e indica las partes seleccionadas. El Denominador (abajo) indica el total de partes.'
            }
          ]
        }
      },
      {
        id: 'q-fractions-2',
        mission_id: 'mis-fractions',
        title: 'Fraccionando en Casa',
        description: 'Dibuja una pizza o pastel en tu cuaderno representando 5/8, tómale una foto y compártela en tu portafolio.',
        type: 'portfolio_submission',
        sequence_order: 2,
        xp_reward: 150,
        coins_reward: 25,
        created_at: new Date().toISOString(),
        content: {
          instructions: '1. Dibuja un círculo grande en tu cuaderno.\n2. Divídelo en 8 partes iguales.\n3. Colorea exactamente 5 partes.\n4. Escribe la fracción 5/8.\n5. Tómale una foto y súbela aquí.',
          acceptedFormats: ['image']
        }
      }
    ]
  },
  {
    id: 'mis-selva',
    school_id: 'sch-1',
    subject_id: 'sub-span',
    level_grade_id: 'lg-4',
    title: 'Guardianes de la Selva Lacandona',
    description: 'Recupera el manuscrito antiguo de las leyendas mayas usando el poder de tu voz.',
    story_intro: 'El sabio del Templo del Jaguar ha perdido su voz y no puede recitar la antigua leyenda. Necesita de un estudiante valiente que lea el poema sagrado con excelente entonación para despertar la lluvia.',
    map_position_x: 75,
    map_position_y: 35,
    is_active: true,
    created_at: new Date().toISOString(),
    quests: [
      {
        id: 'q-selva-1',
        mission_id: 'mis-selva',
        title: 'La Leyenda del Jaguar',
        description: 'Lee la leyenda y responde preguntas sobre los personajes.',
        type: 'quiz',
        sequence_order: 1,
        xp_reward: 80,
        coins_reward: 10,
        created_at: new Date().toISOString(),
        content: {
          questions: [
            {
              id: 'qs1',
              question: '¿Por qué el jaguar pintó sus manchas en la historia?',
              options: ['Para esconderse en la noche', 'Como medallas otorgadas por la Luna', 'Por caerse en un pozo de lodo', 'Para asustar a los monos'],
              correctAnswerIndex: 1,
              explanation: '¡Excelente! En la leyenda maya, la Luna le regala las manchas al jaguar como medallas por su valentía.'
            }
          ]
        }
      },
      {
        id: 'q-selva-2',
        mission_id: 'mis-selva',
        title: 'El Susurro de la Lluvia',
        description: 'Graba un audio leyendo el poema maya del jaguar y súbelo.',
        type: 'portfolio_submission',
        sequence_order: 2,
        xp_reward: 150,
        coins_reward: 30,
        created_at: new Date().toISOString(),
        content: {
          instructions: 'Lee el siguiente fragmento en voz alta con entonación:\n"Bajo las sombras del ceiba milenario, ruge el jaguar con ojos de fuego."\nGraba tu voz y súbela aquí.',
          acceptedFormats: ['audio']
        }
      }
    ]
  }
];

// Lista de Estudiantes de los 4 Niveles Educativos
const STUDENTS_LIST_SEED: UserProfile[] = [
  { id: 'std-pb', first_name: 'Santi', last_name: 'Gómez', role: 'student', email: 'santi@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Primaria Baja (1º)
  { id: 'std-pa', first_name: 'Lucas', last_name: 'Skywalker', role: 'student', email: 'lucas@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Primaria Alta (4º)
  { id: 'std-sec', first_name: 'Elena', last_name: 'Rostova', role: 'student', email: 'elena@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, // Secundaria (2º)
  { id: 'std-prep', first_name: 'Mateo', last_name: 'Díaz', role: 'student', email: 'mateo@iskool.edu.mx', created_at: new Date().toISOString(), updated_at: new Date().toISOString() } // Preparatoria (4º Sem)
];

const TEACHER_SEED: UserProfile = {
  id: 'usr-teacher-1',
  first_name: 'Israel',
  last_name: 'López',
  role: 'teacher',
  email: 'israel.lopez@iskool.edu.mx',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const PARENT_SEED: UserProfile = {
  id: 'usr-parent-1',
  first_name: 'Carlos',
  last_name: 'Skywalker',
  role: 'parent',
  email: 'carlos.sky@mail.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// Estadísticas de los 4 Estudiantes
const STATS_MAP_SEED: Record<string, StudentStats> = {
  'std-pb': {
    student_id: 'std-pb', xp: 80, level: 1, coins: 25, current_streak: 2, max_streak: 2, updated_at: new Date().toISOString()
  },
  'std-pa': {
    student_id: 'std-pa', xp: 180, level: 2, coins: 45, current_streak: 3, max_streak: 5, last_active_date: new Date().toISOString().split('T')[0], updated_at: new Date().toISOString()
  },
  'std-sec': {
    student_id: 'std-sec', xp: 350, level: 4, coins: 120, current_streak: 6, max_streak: 10, updated_at: new Date().toISOString(),
    rpg_class: 'mago', attribute_strength: 8, attribute_intelligence: 18, attribute_defense: 12, skill_points: 2
  },
  'std-prep': {
    student_id: 'std-prep', xp: 500, level: 5, coins: 200, current_streak: 4, max_streak: 8, updated_at: new Date().toISOString(),
    funding_credits: 1250
  }
};

// Avatares y Mascotas de los 4 Estudiantes
const AVATAR_MAP_SEED: Record<string, StudentAvatar> = {
  'std-pb': {
    student_id: 'std-pb', avatar_name: 'Santito', hair_style: 'classic', hair_color: '#4B5563', eyes_style: 'happy', outfit_style: 'explorer', outfit_color: '#3B82F6', background_style: 'forest', unlocked_items: ['classic', 'happy', 'explorer', 'forest'],
    pet_type: 'dragon', pet_name: 'Llamita', pet_hunger: 40, pet_happiness: 75, pet_outfit: 'none', updated_at: new Date().toISOString()
  },
  'std-pa': {
    student_id: 'std-pa', avatar_name: 'Lukin', hair_style: 'spiky', hair_color: '#FBBF24', eyes_style: 'sparkle', outfit_style: 'explorer', outfit_color: '#10B981', background_style: 'forest', unlocked_items: ['classic', 'happy', 'space_suit', 'nebula', 'spiky', 'sparkle', 'explorer', 'forest'], updated_at: new Date().toISOString()
  },
  'std-sec': {
    student_id: 'std-sec', avatar_name: 'Elenix', hair_style: 'wizard_hat', hair_color: '#8B5CF6', eyes_style: 'sparkle', outfit_style: 'purple', outfit_color: '#6D28D9', background_style: 'nebula', unlocked_items: ['classic', 'happy', 'wizard_hat', 'purple', 'nebula', 'sparkle'], updated_at: new Date().toISOString()
  },
  'std-prep': {
    student_id: 'std-prep', avatar_name: 'MateoCode', hair_style: 'spiky', hair_color: '#1F2937', eyes_style: 'happy', outfit_style: 'space_suit', outfit_color: '#6B7280', background_style: 'nebula', unlocked_items: ['classic', 'happy', 'space_suit', 'nebula', 'spiky'], updated_at: new Date().toISOString()
  }
};

const PORTFOLIO_SEED: PortfolioItem[] = [
  {
    id: 'port-1',
    student_id: 'std-pa',
    subject_id: 'sub-math',
    quest_id: 'q-fractions-2',
    title: 'Mi Pizza de Fracciones (5/8)',
    description: 'Dibujé una pizza con pepperoni y champiñones para representar 5/8.',
    file_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400',
    file_type: 'image',
    status: 'approved',
    self_reflection: 'Me costó un poco dividir el círculo en 8 partes iguales, pero al final usé una regla y me quedó muy bien.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    student_profile: STUDENTS_LIST_SEED[1],
    subject: SUBJECTS_SEED[0],
    feedbacks: [
      {
        id: 'fb-1',
        portfolio_item_id: 'port-1',
        author_id: 'usr-teacher-1',
        author_role: 'teacher',
        feedback_text: '¡Excelente trabajo, Lucas! Tu representación gráfica es muy clara.',
        reactions: { teacher: ['❤️', '👏'] },
        created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        author_profile: TEACHER_SEED
      }
    ]
  },
  {
    id: 'port-prep-1',
    student_id: 'std-prep',
    subject_id: 'sub-sci',
    title: 'Simulación de Biodigestor de Residuos',
    description: 'Reporte ejecutivo y diagrama de flujo para implementar un biodigestor en la cafetería escolar.',
    file_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400',
    file_type: 'image',
    status: 'submitted',
    self_reflection: 'Propuse un reactor anaeróbico de bajo costo. La tasa de retorno de inversión es de 14 meses vendiendo biogás.',
    peer_review_score: 9.2,
    peer_review_comments: 'Muy buena justificación económica. El diagrama de balance de masas tiene un pequeño error en el flujo de lodos.',
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    student_profile: STUDENTS_LIST_SEED[3],
    subject: SUBJECTS_SEED[2],
    feedbacks: []
  }
];

const BOSS_SEED: GuildBoss = {
  id: 'boss-historia',
  name: 'Guardián de Historia',
  hp_max: 200,
  hp_actual: 150,
  xp_reward: 500
};

const GUILD_SUBMISSIONS_SEED: GuildMemberSubmission[] = [
  { student_id: 'std-pb', student_name: 'Santi', avatar_outfit: 'explorer', class_name: 'Guerrero', status: 'submitted_on_time' },
  { student_id: 'std-pa', student_name: 'Lucas', avatar_outfit: 'space_suit', class_name: 'Explorador', status: 'submitted_on_time' },
  { student_id: 'std-sec', student_name: 'Elena', avatar_outfit: 'purple', class_name: 'Mago', status: 'pending' }
];

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Guardar qué estudiante está activo (por defecto Lucas)
  const [activeStudentId, setActiveStudentId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iskool_active_student_id');
      return saved ? saved : 'std-pa';
    }
    return 'std-pa';
  });

  // Mapa de Estadísticas de todos los estudiantes
  const [allStats, setAllStats] = useState<Record<string, StudentStats>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iskool_all_stats');
      return saved ? JSON.parse(saved) : STATS_MAP_SEED;
    }
    return STATS_MAP_SEED;
  });

  // Mapa de Avatares de todos los estudiantes
  const [allAvatars, setAllAvatars] = useState<Record<string, StudentAvatar>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iskool_all_avatars');
      return saved ? JSON.parse(saved) : AVATAR_MAP_SEED;
    }
    return AVATAR_MAP_SEED;
  });

  const [studentBadges, setStudentBadges] = useState<StudentBadge[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iskool_student_badges');
      if (saved) return JSON.parse(saved);
    }
    return [
      { student_id: 'std-pa', badge_id: 'badge-1', earned_at: new Date().toISOString() },
      { student_id: 'std-sec', badge_id: 'badge-3', earned_at: new Date().toISOString() }
    ];
  });

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iskool_portfolio');
      return saved ? JSON.parse(saved) : PORTFOLIO_SEED;
    }
    return PORTFOLIO_SEED;
  });

  const [questAttempts, setQuestAttempts] = useState<QuestAttempt[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iskool_attempts');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [guildBoss, setGuildBoss] = useState<GuildBoss>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iskool_guild_boss');
      return saved ? JSON.parse(saved) : BOSS_SEED;
    }
    return BOSS_SEED;
  });

  const [guildSubmissions, setGuildSubmissions] = useState<GuildMemberSubmission[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iskool_guild_submissions');
      return saved ? JSON.parse(saved) : GUILD_SUBMISSIONS_SEED;
    }
    return GUILD_SUBMISSIONS_SEED;
  });

  // Obtener Perfil, Stats y Avatar actuales
  const currentStudent = STUDENTS_LIST_SEED.find(s => s.id === activeStudentId) || STUDENTS_LIST_SEED[1];
  const stats = allStats[activeStudentId] || STATS_MAP_SEED['std-pa'];
  const avatar = allAvatars[activeStudentId] || AVATAR_MAP_SEED['std-pa'];

  // Persistir Estados
  useEffect(() => {
    localStorage.setItem('iskool_active_student_id', activeStudentId);
  }, [activeStudentId]);

  useEffect(() => {
    localStorage.setItem('iskool_all_stats', JSON.stringify(allStats));
  }, [allStats]);

  useEffect(() => {
    localStorage.setItem('iskool_all_avatars', JSON.stringify(allAvatars));
  }, [allAvatars]);

  useEffect(() => {
    localStorage.setItem('iskool_student_badges', JSON.stringify(studentBadges));
  }, [studentBadges]);

  useEffect(() => {
    localStorage.setItem('iskool_portfolio', JSON.stringify(portfolioItems));
  }, [portfolioItems]);

  useEffect(() => {
    localStorage.setItem('iskool_attempts', JSON.stringify(questAttempts));
  }, [questAttempts]);

  useEffect(() => {
    localStorage.setItem('iskool_guild_boss', JSON.stringify(guildBoss));
  }, [guildBoss]);

  useEffect(() => {
    localStorage.setItem('iskool_guild_submissions', JSON.stringify(guildSubmissions));
  }, [guildSubmissions]);

  // Lógica RPG Combate Colaborativo
  const triggerGuildAttack = (damage: number) => {
    setGuildBoss(prev => {
      const newHp = Math.max(0, prev.hp_actual - damage);
      return {
        ...prev,
        hp_actual: newHp
      };
    });
  };

  const resetGuildBoss = () => {
    setGuildBoss(BOSS_SEED);
    setGuildSubmissions(GUILD_SUBMISSIONS_SEED);
  };

  const submitGuildHomework = (studentId: string, onTime: boolean) => {
    setGuildSubmissions(prev => prev.map(member => {
      if (member.student_id === studentId) {
        return {
          ...member,
          status: onTime ? 'submitted_on_time' : 'submitted_late',
          submitted_at: new Date().toISOString()
        };
      }
      return member;
    }));
  };

  // Cambiar Estudiante Activo
  const switchStudent = (studentId: string) => {
    setActiveStudentId(studentId);
  };

  // Modificar Avatar
  const changeAvatar = (config: Partial<StudentAvatar>) => {
    setAllAvatars(prev => ({
      ...prev,
      [activeStudentId]: {
        ...prev[activeStudentId],
        ...config,
        updated_at: new Date().toISOString()
      }
    }));
  };

  // Alimentar Mascota (Primaria Baja)
  const feedPet = () => {
    if (stats.coins < 5) {
      alert('¡No tienes suficientes monedas! Resuelve retos para ganar monedas.');
      return;
    }

    setAllStats(prev => ({
      ...prev,
      [activeStudentId]: {
        ...prev[activeStudentId],
        coins: prev[activeStudentId].coins - 5,
        xp: prev[activeStudentId].xp + 10 // Alimento da un poco de XP
      }
    }));

    setAllAvatars(prev => {
      const currentAv = prev[activeStudentId];
      const newHunger = Math.max(0, (currentAv.pet_hunger || 50) - 20);
      const newHappiness = Math.min(100, (currentAv.pet_happiness || 50) + 5);
      return {
        ...prev,
        [activeStudentId]: {
          ...currentAv,
          pet_hunger: newHunger,
          pet_happiness: newHappiness,
          updated_at: new Date().toISOString()
        }
      };
    });
  };

  // Jugar con Mascota (Primaria Baja)
  const playWithPet = () => {
    if (stats.coins < 2) {
      alert('¡No tienes suficientes monedas!');
      return;
    }

    setAllStats(prev => ({
      ...prev,
      [activeStudentId]: {
        ...prev[activeStudentId],
        coins: prev[activeStudentId].coins - 2,
        xp: prev[activeStudentId].xp + 5
      }
    }));

    setAllAvatars(prev => {
      const currentAv = prev[activeStudentId];
      const newHunger = Math.min(100, (currentAv.pet_hunger || 50) + 10);
      const newHappiness = Math.min(100, (currentAv.pet_happiness || 50) + 20);
      return {
        ...prev,
        [activeStudentId]: {
          ...currentAv,
          pet_hunger: newHunger,
          pet_happiness: newHappiness,
          updated_at: new Date().toISOString()
        }
      };
    });
  };

  // Subir atributo RPG (Secundaria)
  const levelUpAttribute = (statName: 'strength' | 'intelligence' | 'defense') => {
    if ((stats.skill_points || 0) <= 0) {
      alert('¡No tienes puntos de habilidad! Sube de nivel para ganar puntos.');
      return;
    }

    setAllStats(prev => {
      const currentS = prev[activeStudentId];
      const strength = currentS.attribute_strength || 10;
      const intelligence = currentS.attribute_intelligence || 10;
      const defense = currentS.attribute_defense || 10;

      return {
        ...prev,
        [activeStudentId]: {
          ...currentS,
          skill_points: (currentS.skill_points || 1) - 1,
          attribute_strength: statName === 'strength' ? strength + 1 : strength,
          attribute_intelligence: statName === 'intelligence' ? intelligence + 1 : intelligence,
          attribute_defense: statName === 'defense' ? defense + 1 : defense,
          updated_at: new Date().toISOString()
        }
      };
    });
  };

  // Enviar coevaluación (Preparatoria)
  const submitPeerReview = (itemId: string, score: number, comment: string) => {
    setPortfolioItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          peer_review_score: score,
          peer_review_comments: comment,
          updated_at: new Date().toISOString()
        };
      }
      return item;
    }));

    // Recompensa al coevaluador
    setAllStats(prev => {
      const currentS = prev[activeStudentId];
      let xp = currentS.xp + 100; // Gran premio por coevaluación
      let level = currentS.level;
      if (xp >= level * 200) {
        xp -= level * 200;
        level += 1;
      }
      return {
        ...prev,
        [activeStudentId]: {
          ...currentS,
          xp,
          level,
          coins: currentS.coins + 15,
          updated_at: new Date().toISOString()
        }
      };
    });

    // Desbloquear medalla de Compañero Estelar
    if (!studentBadges.some(sb => sb.badge_id === 'badge-5')) {
      setStudentBadges(prev => [
        ...prev,
        { student_id: activeStudentId, badge_id: 'badge-5', earned_at: new Date().toISOString() }
      ]);
    }
  };

  // Enviar Cuestionario (Kahoot Style)
  const submitQuiz = (questId: string, score: number, answers: any) => {
    let xpReward = 50;
    let coinsReward = 5;
    let missionTitle = "";
    let questTitle = "";
    let subjectId = "sub-math";

    const mission = MISSIONS_SEED.find(m => 
      m.quests?.some(q => {
        if (q.id === questId) {
          xpReward = q.xp_reward;
          coinsReward = q.coins_reward;
          questTitle = q.title;
          return true;
        }
        return false;
      })
    );

    if (mission) {
      missionTitle = mission.title;
      subjectId = mission.subject_id;
    }

    const factor = score / 100;
    const xpEarned = Math.round(xpReward * factor);
    const coinsEarned = score === 100 ? coinsReward + 5 : Math.round(coinsReward * factor);

    const newAttempt: QuestAttempt = {
      id: `att-${Date.now()}`,
      student_id: activeStudentId,
      quest_id: questId,
      score: score,
      is_completed: score >= 60,
      answers: answers,
      feedback: score === 100 
        ? '¡Increíble! Obtuviste un puntaje perfecto. ¡Eres una estrella!' 
        : score >= 60 
          ? '¡Bien hecho! Aprobaste el reto.'
          : '¡No te preocupes! El error es aprendizaje. Vuelve a intentarlo.',
      created_at: new Date().toISOString()
    };

    setQuestAttempts(prev => [newAttempt, ...prev]);

    // Calcular progreso
    let currentXP = stats.xp + xpEarned;
    let currentCoins = stats.coins + coinsEarned;
    let level = stats.level;
    let leveledUp = false;
    let skillPoints = stats.skill_points || 0;

    const xpRequiredForNextLevel = level * 200;
    if (currentXP >= xpRequiredForNextLevel) {
      currentXP -= xpRequiredForNextLevel;
      level += 1;
      leveledUp = true;
      if (currentStudent.role === 'student' && activeStudentId === 'std-sec') {
        skillPoints += 2; // Otorga 2 puntos de habilidad si es Secundaria
      }
    }

    let newStreak = stats.current_streak;
    const todayStr = new Date().toISOString().split('T')[0];
    if (stats.last_active_date !== todayStr) {
      newStreak = stats.current_streak + 1;
    }

    setAllStats(prev => ({
      ...prev,
      [activeStudentId]: {
        ...prev[activeStudentId],
        xp: currentXP,
        level: level,
        coins: currentCoins,
        current_streak: newStreak,
        max_streak: Math.max(newStreak, prev[activeStudentId].max_streak),
        last_active_date: todayStr,
        skill_points: skillPoints,
        updated_at: new Date().toISOString()
      }
    }));

    // Medallas
    let badgeEarned: Badge | null = null;
    if (score === 100 && subjectId === 'sub-math' && !studentBadges.some(sb => sb.badge_id === 'badge-1' && sb.student_id === activeStudentId)) {
      badgeEarned = BADGES_SEED[0];
    } else if (score >= 60 && !studentBadges.some(sb => sb.badge_id === 'badge-3' && sb.student_id === activeStudentId)) {
      const pastFail = questAttempts.some(qa => qa.quest_id === questId && qa.score < 60 && qa.student_id === activeStudentId);
      if (pastFail) {
        badgeEarned = BADGES_SEED[2];
      }
    }

    if (badgeEarned) {
      setStudentBadges(prev => [
        ...prev,
        { student_id: activeStudentId, badge_id: badgeEarned!.id, earned_at: new Date().toISOString() }
      ]);
    }

    return { xpEarned, coinsEarned, leveledUp, badgeEarned };
  };

  // Enviar Portafolio (Seesaw Style)
  const submitPortfolioItem = (
    title: string,
    description: string,
    fileUrl: string,
    fileType: any,
    selfReflection: string,
    questId?: string,
    subjectId?: string
  ) => {
    const defaultSubjectId = subjectId || 'sub-math';
    const finalSubject = SUBJECTS_SEED.find(s => s.id === defaultSubjectId) || SUBJECTS_SEED[0];

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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      student_profile: currentStudent,
      subject: finalSubject,
      feedbacks: []
    };

    setPortfolioItems(prev => [newItem, ...prev]);

    // Recompensa de XP
    setAllStats(prev => {
      const s = prev[activeStudentId];
      let currentXP = s.xp + 50;
      let level = s.level;
      const xpRequired = level * 200;
      if (currentXP >= xpRequired) {
        currentXP -= xpRequired;
        level += 1;
      }
      return {
        ...prev,
        [activeStudentId]: {
          ...s,
          xp: currentXP,
          level: level,
          coins: s.coins + 10,
          updated_at: new Date().toISOString()
        }
      };
    });

    if (fileType === 'audio' && !studentBadges.some(sb => sb.badge_id === 'badge-2' && sb.student_id === activeStudentId)) {
      const lectorBadge = BADGES_SEED[1];
      setStudentBadges(prev => [
        ...prev,
        { student_id: activeStudentId, badge_id: lectorBadge.id, earned_at: new Date().toISOString() }
      ]);
    }
  };

  // Feedback
  const addPortfolioFeedback = (itemId: string, text: string, role: FeedbackAuthorRole, authorId: string) => {
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

    setPortfolioItems(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          feedbacks: [...(item.feedbacks || []), newFeedback],
          updated_at: new Date().toISOString()
        };
      }
      return item;
    }));
  };

  // Reactions
  const addReaction = (itemId: string, roleCategory: string, emoji: string) => {
    setPortfolioItems(prev => prev.map(item => {
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
    }));
  };

  // Evaluar (Profesor)
  const reviewPortfolioItem = (itemId: string, status: PortfolioItemStatus, comment: string, xpAward = 100) => {
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

    setPortfolioItems(prev => prev.map(item => {
      if (item.id === itemId) {
        targetStudentId = item.student_id;
        return {
          ...item,
          status: status,
          feedbacks: [...(item.feedbacks || []), newFeedback],
          updated_at: new Date().toISOString()
        };
      }
      return item;
    }));

    if (status === 'approved' && targetStudentId) {
      setAllStats(prev => {
        const studentStats = prev[targetStudentId];
        if (!studentStats) return prev;
        let currentXP = studentStats.xp + xpAward;
        let level = studentStats.level;
        const xpRequired = level * 200;
        if (currentXP >= xpRequired) {
          currentXP -= xpRequired;
          level += 1;
        }
        return {
          ...prev,
          [targetStudentId]: {
            ...studentStats,
            xp: currentXP,
            level: level,
            coins: studentStats.coins + 20,
            updated_at: new Date().toISOString()
          }
        };
      });
    }
  };

  // Reiniciar
  const resetAllData = () => {
    localStorage.removeItem('iskool_active_student_id');
    localStorage.removeItem('iskool_all_stats');
    localStorage.removeItem('iskool_all_avatars');
    localStorage.removeItem('iskool_student_badges');
    localStorage.removeItem('iskool_portfolio');
    localStorage.removeItem('iskool_attempts');
    localStorage.removeItem('iskool_guild_boss');
    localStorage.removeItem('iskool_guild_submissions');
    setActiveStudentId('std-pa');
    setAllStats(STATS_MAP_SEED);
    setAllAvatars(AVATAR_MAP_SEED);
    setStudentBadges([
      { student_id: 'std-pa', badge_id: 'badge-1', earned_at: new Date().toISOString() },
      { student_id: 'std-sec', badge_id: 'badge-3', earned_at: new Date().toISOString() }
    ]);
    setPortfolioItems(PORTFOLIO_SEED);
    setQuestAttempts([]);
    setGuildBoss(BOSS_SEED);
    setGuildSubmissions(GUILD_SUBMISSIONS_SEED);
  };

  return (
    <GamificationContext.Provider value={{
      stats,
      avatar,
      badges: BADGES_SEED,
      studentBadges: studentBadges.filter(sb => sb.student_id === activeStudentId).map(sb => ({
        ...sb,
        badge: BADGES_SEED.find(b => b.id === sb.badge_id)
      })),
      missions: MISSIONS_SEED,
      portfolioItems: portfolioItems.filter(item => {
        // En vista de estudiante ve solo los suyos, en vista de profesor ve todos
        return item;
      }),
      questAttempts: questAttempts.filter(a => a.student_id === activeStudentId),
      subjects: SUBJECTS_SEED,
      
      currentStudent,
      studentsList: STUDENTS_LIST_SEED,
      activeStudentId,
      currentTeacher: TEACHER_SEED,
      currentParent: PARENT_SEED,
      
      guildBoss,
      guildSubmissions,
      triggerGuildAttack,
      resetGuildBoss,
      submitGuildHomework,
      
      switchStudent,
      changeAvatar,
      submitQuiz,
      submitPortfolioItem,
      addPortfolioFeedback,
      addReaction,
      reviewPortfolioItem,
      
      // Acciones específicas
      feedPet,
      playWithPet,
      levelUpAttribute,
      submitPeerReview,
      
      resetAllData
    }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification debe usarse dentro de un GamificationProvider');
  }
  return context;
};
