"use client";

import React, { useState, useEffect, use } from 'react';
import { useStudentStore, useCurrentStudentStats } from '@/store/useStudentStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { Header } from '@/components/Header';
import { 
  ArrowLeft, Play, FileSpreadsheet, AudioLines, 
  CheckCircle2, XCircle, ChevronRight, Coins, 
  Trophy, Sparkles, Upload, FileImage, Mic, HelpCircle, ArrowRight, Lock, Award, Heart, Brain
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useCoopStore } from '@/store/useCoopStore';
import CoopInviteWidget from '@/components/CoopInviteWidget';
import PartyStatus from '@/components/PartyStatus';

const PixiCombatCanvas = dynamic(() => import('@/components/PixiCombatCanvas'), { ssr: false });

interface MissionPageProps {
  params: Promise<{ id: string }>;
}

export default function MissionPage({ params }: MissionPageProps) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPartyId = searchParams.get('party_id');

  const fetchStats = useStudentStore(state => state.fetchStats);
  const fetchMissions = useGamificationStore(state => state.fetchMissions);
  
  const stats = useCurrentStudentStats();
  
  const missions = useGamificationStore(state => state.missionsList);
  const submitQuiz = useGamificationStore(state => state.submitQuiz);
  const submitExam = useGamificationStore(state => state.submitExam);
  const questAttempts = useGamificationStore(state => state.questAttempts);
  
  const submitPortfolioItem = usePortfolioStore(state => state.submitPortfolioItem);

  // Zustand selectors for coop play
  const joinParty = useCoopStore(state => state.joinParty);
  const subscribeToPartyActions = useCoopStore(state => state.subscribeToPartyActions);
  const resetCoopStore = useCoopStore(state => state.resetCoopStore);
  const coopPartyId = useCoopStore(state => state.partyId);
  const coopBossHp = useCoopStore(state => state.bossHp);
  const sendPartyAction = useCoopStore(state => state.sendPartyAction);
  
  // Estados de control
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [isPlayingQuiz, setIsPlayingQuiz] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [isPlayingExam, setIsPlayingExam] = useState(false);

  // Estados para Examen / Boss Battle
  const [examCurrentQuestionIdx, setExamCurrentQuestionIdx] = useState(0);
  const [examSelectedOptionIdx, setExamSelectedOptionIdx] = useState<number | null>(null);
  const [isExamAnswerSubmitted, setIsExamAnswerSubmitted] = useState(false);
  const [examCorrectCount, setExamCorrectCount] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examResult, setExamResult] = useState<{ xpEarned: number, coinsEarned: number, leveledUp: boolean, badgeEarned: any } | null>(null);
  const [bossBattlePhase, setBossBattlePhase] = useState<'intro' | 'fight' | 'victory' | 'defeat'>('intro');
  const [canvasCombatState, setCanvasCombatState] = useState<'idle' | 'attacking' | 'boss_hurt' | 'victory' | 'defeat'>('idle');

  // Load party from URL query parameter on mount
  useEffect(() => {
    if (urlPartyId && urlPartyId !== coopPartyId) {
      console.log('Detectado party_id en URL, uniendo:', urlPartyId);
      joinParty(urlPartyId);
    }
  }, [joinParty, coopPartyId, urlPartyId]);

  // Subscribe to coop party actions whenever partyId is set
  useEffect(() => {
    if (!coopPartyId) return;

    console.log('Iniciando suscripción a la party cooperativa:', coopPartyId);
    const unsubscribe = subscribeToPartyActions(coopPartyId);

    return () => {
      console.log('Desmontando suscripción de party cooperativa:', coopPartyId);
      unsubscribe();
    };
  }, [coopPartyId, subscribeToPartyActions]);

  // Reset coop store on page unmount
  useEffect(() => {
    return () => {
      resetCoopStore();
    };
  }, [resetCoopStore]);

  // Subscribe to store actions to add logs to the local JRPG combat log
  useEffect(() => {
    if (!coopPartyId) return;
    
    const unsubscribe = useCoopStore.subscribe((state, prevState) => {
      const lastAction = state.lastAction;
      const prevLastAction = prevState.lastAction;
      
      if (lastAction && lastAction.id !== prevLastAction?.id) {
        const localStudentId = useStudentStore.getState().activeStudentId;
        if (lastAction.student_id !== localStudentId) {
          const actionMsg = `¡${lastAction.student_name?.split(' ')[0]} usó habilidad cooperativa e infligió ${lastAction.damage_dealt} de daño!`;
          setCombatLog(prev => [
            `🔮 [Grupo] ${actionMsg}`,
            ...prev
          ]);
        }
      }
    });
    
    return unsubscribe;
  }, [coopPartyId]);

  // Play audio synthesizer effect
  const playRetroSound = (type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup' | 'charge') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      if (type === 'laser') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'hit') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'charge') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.3);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const oscSeq = ctx.createOscillator();
          const gainSeq = ctx.createGain();
          oscSeq.connect(gainSeq);
          gainSeq.connect(ctx.destination);
          oscSeq.type = 'square';
          oscSeq.frequency.setValueAtTime(freq, now + idx * 0.1);
          gainSeq.gain.setValueAtTime(0.05, now + idx * 0.1);
          gainSeq.gain.linearRampToValueAtTime(0.01, now + idx * 0.1 + 0.15);
          oscSeq.start(now + idx * 0.1);
          oscSeq.stop(now + idx * 0.1 + 0.15);
        });
      }
    } catch (e) {
      console.warn('Web Audio API error or not allowed:', e);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchStats();
      fetchMissions();
    }
  }, [user, fetchStats, fetchMissions]);

  // Buscar misión
  const mission = missions.find(m => m.id === id);
  
  // Cuestionario (Quiz State)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [timer, setTimer] = useState(20);
  const [quizResult, setQuizResult] = useState<{ xpEarned: number, coinsEarned: number, leveledUp: boolean, badgeEarned: any } | null>(null);

  // Evidencias (Portfolio Submission State)
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceReflection, setEvidenceReflection] = useState('');
  const [mockFile, setMockFile] = useState<{ url: string, type: string } | null>(null);
  const [isSubmissionFinished, setIsSubmissionFinished] = useState(false);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
          <p className="text-sm font-medium text-zinc-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Temporizador de Cuestionario
  useEffect(() => {
    if (isPlayingQuiz && !isAnswerSubmitted && timer > 0 && !quizResult) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !isAnswerSubmitted && !quizResult) {
      // Tiempo agotado
      handleAnswerSubmit(-1); // Fuerza respuesta incorrecta por tiempo
    }
  }, [isPlayingQuiz, isAnswerSubmitted, timer, quizResult]);

  if (!mission) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <HelpCircle className="h-16 w-16 text-zinc-400 mb-4 animate-bounce" />
          <h2 className="text-xl font-bold">Misión no encontrada</h2>
          <Link href="/student" className="mt-4 text-blue-600 font-semibold hover:underline">
            Regresar al mapa
          </Link>
        </div>
      </div>
    );
  }

  // --- LOGICA DE CUESTIONARIO ---

  const startQuiz = (quest: any) => {
    setSelectedQuest(quest);
    setIsPlayingQuiz(true);
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizAnswers({});
    setTimer(20);
    setQuizResult(null);
  };

  const handleAnswerSubmit = (optionIndex: number) => {
    if (isAnswerSubmitted) return;

    const questions = (selectedQuest.content as any).questions;
    const currentQuestion = questions[currentQuestionIdx];
    const isCorrect = optionIndex === currentQuestion.correctAnswerIndex;

    setSelectedOptionIdx(optionIndex);
    setIsAnswerSubmitted(true);
    
    setQuizAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));

    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
  };

  const nextQuestion = async () => {
    const questions = (selectedQuest.content as any).questions;
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOptionIdx(null);
      setIsAnswerSubmitted(false);
      setTimer(20);
    } else {
      // Final del cuestionario, enviar resultados
      const finalScorePercentage = Math.round((quizScore / questions.length) * 100);
      const results = await submitQuiz(selectedQuest.id, finalScorePercentage, quizAnswers);
      setQuizResult(results);
    }
  };

  // --- LOGICA DE PORTAFOLIO ---

  const startSubmission = (quest: any) => {
    setSelectedQuest(quest);
    setIsSubmittingEvidence(true);
    setEvidenceTitle(quest.title);
    setEvidenceDesc(quest.description);
    setEvidenceReflection('');
    setMockFile(null);
    setIsSubmissionFinished(false);
  };

  const simulateFileUpload = (type: 'image' | 'audio') => {
    if (type === 'image') {
      setMockFile({
        url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
        type: 'image'
      });
    } else {
      setMockFile({
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        type: 'audio'
      });
    }
  };

  const handlePortfolioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockFile) return;

    submitPortfolioItem(
      evidenceTitle,
      evidenceDesc,
      mockFile.url,
      mockFile.type,
      evidenceReflection,
      selectedQuest.id,
      mission.subject_id
    );

    setIsSubmissionFinished(true);
  };

  // --- LOGICA DE EXAMEN / COMBATE DE JEFE ---

  const startBossBattle = (quest: any) => {
    setSelectedQuest(quest);
    setIsPlayingExam(true);
    setExamCurrentQuestionIdx(0);
    setExamSelectedOptionIdx(null);
    setIsExamAnswerSubmitted(false);
    setExamCorrectCount(0);
    setPlayerHp(100);
    
    const maxHp = (quest.content as any).bossHp || 100;
    setBossHp(maxHp);
    setBossMaxHp(maxHp);
    setCombatLog([`⚔️ ¡Te enfrentas a ${quest.content.bossName || 'Jefe'}! Prepárate para el combate.`]);
    setExamAnswers({});
    setExamResult(null);
    setBossBattlePhase('intro');
  };

  const handleExamAnswerSubmit = (optionIndex: number) => {
    const currentHp = coopPartyId ? coopBossHp : bossHp;
    if (isExamAnswerSubmitted || currentHp <= 0 || playerHp <= 0) return;

    const questions = (selectedQuest.content as any).questions;
    const currentQuestion = questions[examCurrentQuestionIdx];
    const isCorrect = optionIndex === currentQuestion.correctAnswerIndex;

    setExamSelectedOptionIdx(optionIndex);
    setIsExamAnswerSubmitted(true);

    setExamAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));

    if (isCorrect) {
      setExamCorrectCount(prev => prev + 1);
      setCanvasCombatState('attacking');
      
      // Daño base escalado según número de preguntas para derrotar al boss al final
      const baseDmg = Math.round(bossMaxHp / questions.length);
      const intelBonus = Math.round((stats.attribute_intelligence || 1) * 2.5);
      const totalDmg = baseDmg + intelBonus;

      if (coopPartyId) {
        sendPartyAction(totalDmg, 'attack');
      } else {
        const newBossHp = Math.max(0, bossHp - totalDmg);
        setBossHp(newBossHp);
      }

      setCombatLog(prev => [
        `⚔️ ¡Golpe Crítico! Respondiste correctamente. Haces ${totalDmg} de daño a ${selectedQuest.content.bossName || 'Jefe'} (Intelecto +${intelBonus})`,
        ...prev
      ]);

      // Control states for Canvas animation sequence
      setTimeout(() => {
        setCanvasCombatState('boss_hurt');
      }, 600);
      setTimeout(() => {
        setCanvasCombatState('idle');
      }, 1200);
    } else {
      setCanvasCombatState('idle');
      const bossMaxDmg = selectedQuest.content.bossMaxDmg || 20;
      const baseDmgIn = Math.round(bossMaxDmg * (0.8 + Math.random() * 0.4));
      const defReduction = Math.round((stats.attribute_defense || 1) * 1.5);
      const finalDmgIn = Math.max(5, baseDmgIn - defReduction);
      const newPlayerHp = Math.max(0, playerHp - finalDmgIn);
      setPlayerHp(newPlayerHp);

      setCombatLog(prev => [
        `💥 ¡Contraataque! Respuesta incorrecta. Recibes ${finalDmgIn} de daño de ${selectedQuest.content.bossName || 'Jefe'} (Defensa redujo ${defReduction})`,
        ...prev
      ]);
    }
  };

  const continueBossBattle = () => {
    const questions = (selectedQuest.content as any).questions;
    const currentHp = coopPartyId ? coopBossHp : bossHp;

    if (currentHp <= 0) {
      setBossBattlePhase('victory');
      const score = Math.max(60, Math.round((examCorrectCount / questions.length) * 100));
      const results = submitExam(
        selectedQuest.id,
        score,
        examAnswers,
        selectedQuest.content.statBoost,
        selectedQuest.content.customLoot
      );
      setExamResult(results as any);
    } else if (playerHp <= 0) {
      setBossBattlePhase('defeat');
      const score = Math.round((examCorrectCount / questions.length) * 100);
      submitExam(selectedQuest.id, score, examAnswers, undefined, undefined);
    } else if (examCurrentQuestionIdx < questions.length - 1) {
      setExamCurrentQuestionIdx(prev => prev + 1);
      setExamSelectedOptionIdx(null);
      setIsExamAnswerSubmitted(false);
    } else {
      // Llegó al final de las preguntas
      const passRate = examCorrectCount / questions.length;
      if (passRate >= 0.6) {
        if (!coopPartyId) {
          setBossHp(0);
        }
        setBossBattlePhase('victory');
        const score = Math.round((examCorrectCount / questions.length) * 100);
        const results = submitExam(
          selectedQuest.id,
          score,
          examAnswers,
          selectedQuest.content.statBoost,
          selectedQuest.content.customLoot
        );
        setExamResult(results as any);
      } else {
        setBossBattlePhase('defeat');
        const score = Math.round((examCorrectCount / questions.length) * 100);
        submitExam(selectedQuest.id, score, examAnswers, undefined, undefined);
      }
    }
  };

  // Helper para ver si este quest ya fue completado
  const getQuestStatus = (questId: string) => {
    const attempts = questAttempts.filter(a => a.quest_id === questId);
    if (attempts.length === 0) return 'pending';
    const hasPassed = attempts.some(a => a.score >= 60);
    return hasPassed ? 'completed' : 'failed';
  };

  const coopBossMaxHp = useCoopStore(state => state.bossMaxHp);
  const currentBossHp = coopPartyId ? coopBossHp : bossHp;
  const currentBossMaxHp = coopPartyId ? coopBossMaxHp : bossMaxHp;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />

      {/* Navegación y Título */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link href="/student" className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Regresar a Misiones
        </Link>
      </div>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {!isPlayingQuiz && !isSubmittingEvidence && !isPlayingExam && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Detalles de la Misión / Historia (Izquierda) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 p-6 shadow-sm">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  {mission.subject_id === 'sub-math' ? 'Matemáticas' : mission.subject_id === 'sub-sci' ? 'Ciencias Naturales' : 'Español'}
                </span>
                
                <h1 className="text-2xl font-black mt-3 text-zinc-950 dark:text-white">{mission.title}</h1>
                
                {/* Cuadro de Narrativa */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/60 dark:border-indigo-900/30">
                  <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-4 w-4" />
                    Bitácora del Explorador
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-350 leading-relaxed italic">
                    "{mission.story_intro}"
                  </p>
                </div>
              </div>

              {/* Componentes Cooperativos */}
              <CoopInviteWidget missionId={mission.id} />
              <PartyStatus />
            </div>

            {/* Camino de Retos (Derecha) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">Lista de Retos a Resolver</h2>
              
              <div className="flex flex-col gap-4">
                {mission.quests?.map((quest, index) => {
                  const status = getQuestStatus(quest.id);
                  const isLocked = index > 0 && getQuestStatus(mission.quests![index - 1].id) !== 'completed';

                  return (
                    <div
                      key={quest.id}
                      className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl border bg-white dark:bg-zinc-900 transition-all ${
                        isLocked 
                          ? 'opacity-40 border-zinc-200 dark:border-zinc-800' 
                          : status === 'completed'
                            ? 'border-emerald-200 bg-emerald-50/10 dark:border-emerald-900/30'
                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800'
                      }`}
                    >
                      {/* Icono e Info */}
                      <div className="flex gap-4 items-center font-bold">
                        <div className={`p-3 rounded-xl ${
                          isLocked 
                            ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-950'
                            : status === 'completed'
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                              : quest.type === 'exam'
                                ? 'bg-purple-100 text-purple-650 dark:bg-purple-950 dark:text-purple-400'
                                : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                        }`}>
                          {quest.type === 'exam' ? (
                            <Trophy className="h-6 w-6 animate-bounce" />
                          ) : quest.type === 'quiz' ? (
                            <FileSpreadsheet className="h-6 w-6" />
                          ) : (
                            <AudioLines className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-400">RETO {index + 1}</span>
                            {status === 'completed' && (
                              <span className="text-[9px] font-bold text-emerald-650 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-black">
                                ¡Completado!
                              </span>
                            )}
                            {status === 'failed' && (
                              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-black">
                                Intentar de nuevo
                              </span>
                            )}
                            {quest.type === 'exam' && (
                              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400 px-1.5 py-0.5 rounded-full font-black animate-pulse">
                                ⚔️ BATALLA DE JEFE
                              </span>
                            )}
                          </div>
                          <h3 className="text-md font-bold text-zinc-900 dark:text-white mt-0.5">{quest.title}</h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal max-w-md font-semibold">{quest.description}</p>
                        </div>
                      </div>

                      {/* Botón y Recompensas */}
                      <div className="flex items-center gap-4 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-zinc-800">
                        {/* Recompensas */}
                        <div className="flex items-center gap-3 text-xs font-black">
                          <span className="text-blue-500">{quest.xp_reward} XP</span>
                          <span className="text-yellow-500 flex items-center gap-0.5">
                            <Coins className="h-3.5 w-3.5 fill-current" />
                            {quest.coins_reward}
                          </span>
                        </div>

                        {/* Botón */}
                        {isLocked ? (
                          <div className="p-2 rounded-xl bg-zinc-100 text-zinc-400 dark:bg-zinc-800 flex items-center justify-center">
                            <Lock className="h-4 w-4" />
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (quest.type === 'exam') {
                                startBossBattle(quest);
                              } else if (quest.type === 'quiz') {
                                startQuiz(quest);
                              } else {
                                startSubmission(quest);
                              }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-black text-white transition-all ${
                              status === 'completed'
                                ? 'bg-zinc-850 hover:bg-zinc-750 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                                : quest.type === 'exam'
                                  ? 'bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-500/10'
                                  : 'bg-blue-600 hover:bg-blue-500'
                            }`}
                          >
                            {status === 'completed' ? 'Reintentar' : quest.type === 'exam' ? 'Desafiar Jefe ⚔️' : 'Jugar'}
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* --- MODO INTERACTIVO: KHOOT-STYLE QUIZ --- */}
        {isPlayingQuiz && selectedQuest && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-scale-up">
            
            {/* Header del Cuestionario */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Reto Cuestionario</span>
                <h2 className="text-md font-bold text-zinc-900 dark:text-white">{selectedQuest.title}</h2>
              </div>
              <button
                onClick={() => {
                  if (confirm('¿Quieres salir del cuestionario? Tu progreso se perderá.')) {
                    setIsPlayingQuiz(false);
                    setSelectedQuest(null);
                  }
                }}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Cerrar
              </button>
            </div>

            {!quizResult ? (
              <div className="p-6">
                {/* Preguntas y Progreso */}
                <div className="flex justify-between items-center text-xs font-bold text-zinc-400 mb-4">
                  <span>Pregunta {currentQuestionIdx + 1} de {(selectedQuest.content as any).questions.length}</span>
                  <span className={`px-2 py-0.5 rounded-md ${timer <= 5 ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 animate-pulse' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'}`}>
                    Tiempo: {timer}s
                  </span>
                </div>

                {/* Pregunta */}
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6">
                  {(selectedQuest.content as any).questions[currentQuestionIdx].question}
                </h3>

                {/* Opciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(selectedQuest.content as any).questions[currentQuestionIdx].options.map((opt: string, idx: number) => {
                    const isCorrectAnswer = idx === (selectedQuest.content as any).questions[currentQuestionIdx].correctAnswerIndex;
                    const isSelected = selectedOptionIdx === idx;
                    
                    let btnStyle = 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950/40 text-zinc-800 dark:text-zinc-200';
                    
                    if (isAnswerSubmitted) {
                      if (isCorrectAnswer) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';
                      } else if (isSelected) {
                        btnStyle = 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400';
                      } else {
                        btnStyle = 'border-zinc-200 opacity-50 dark:border-zinc-800';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={isAnswerSubmitted}
                        onClick={() => handleAnswerSubmit(idx)}
                        className={`flex items-center gap-3 p-4 rounded-2xl border text-left font-semibold text-sm transition-all ${btnStyle}`}
                      >
                        <span className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[11px] font-bold text-zinc-500">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Retroalimentación Formativa Inmediata (Estilo NEM) */}
                {isAnswerSubmitted && (
                  <div className={`mt-6 p-4 rounded-2xl border flex items-start gap-3 animate-fade-in ${
                    selectedOptionIdx === (selectedQuest.content as any).questions[currentQuestionIdx].correctAnswerIndex
                      ? 'border-emerald-100 bg-emerald-50/40 dark:border-emerald-900/10'
                      : 'border-rose-100 bg-rose-50/40 dark:border-rose-900/10'
                  }`}>
                    {selectedOptionIdx === (selectedQuest.content as any).questions[currentQuestionIdx].correctAnswerIndex ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 mb-1">Retroalimentación</p>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-normal">
                        {(selectedQuest.content as any).questions[currentQuestionIdx].explanation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Botón Siguiente */}
                {isAnswerSubmitted && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={nextQuestion}
                      className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                    >
                      {currentQuestionIdx < (selectedQuest.content as any).questions.length - 1 ? 'Siguiente Pregunta' : 'Finalizar Reto'}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

              </div>
            ) : (
              // RESULTADOS DE QUIZ
              <div className="p-8 text-center flex flex-col items-center justify-center gap-6">
                <div className="h-20 w-20 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center animate-bounce">
                  <Trophy className="h-10 w-10" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-zinc-950 dark:text-white">¡Reto Completado!</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm mx-auto">
                    Obtuviste un puntaje del <strong className="text-blue-600 font-extrabold">{quizScore * 100 / (selectedQuest.content as any).questions.length}%</strong>.
                  </p>
                </div>

                {/* Desglose de Recompensas Obtenidas */}
                <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 w-full max-w-md grid grid-cols-2 gap-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">EXPERIENCIA</span>
                    <span className="text-lg font-black text-blue-600 mt-1">+{quizResult.xpEarned} XP</span>
                  </div>
                  <div className="flex flex-col items-center justify-center border-l border-zinc-200 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">MONEDAS</span>
                    <span className="text-lg font-black text-yellow-500 flex items-center gap-0.5 mt-1 justify-center">
                      <Coins className="h-5 w-5 fill-current" />
                      +{quizResult.coinsEarned}
                    </span>
                  </div>
                </div>

                {/* Level Up o Insignia Alert */}
                {quizResult.leveledUp && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 text-emerald-800 dark:border-emerald-900/40 dark:text-emerald-400 flex items-center gap-2 text-xs font-bold animate-pulse">
                    <Sparkles className="h-4 w-4" />
                    ¡Súper! Subiste de nivel en la clasificación escolar.
                  </div>
                )}

                {quizResult.badgeEarned && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-amber-800 dark:border-amber-900/40 dark:text-amber-400 flex items-center gap-2 text-xs font-bold">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    ¡Desbloqueaste la medalla: {quizResult.badgeEarned.name}!
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsPlayingQuiz(false);
                    setSelectedQuest(null);
                  }}
                  className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full font-bold text-xs transition-all dark:bg-white dark:hover:bg-zinc-200 dark:text-black shadow-md"
                >
                  Regresar a la Misión
                </button>

              </div>
            )}

          </div>
        )}

        {/* --- MODO INTERACTIVO: SEESAW-STYLE EVIDENCE SUBMISSION --- */}
        {isSubmittingEvidence && selectedQuest && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Portafolio de Evidencias Digital</span>
                <h2 className="text-md font-bold text-zinc-900 dark:text-white">{selectedQuest.title}</h2>
              </div>
              <button
                onClick={() => {
                  setIsSubmittingEvidence(false);
                  setSelectedQuest(null);
                }}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                Cerrar
              </button>
            </div>

            {!isSubmissionFinished ? (
              <form onSubmit={handlePortfolioSubmit} className="p-6 flex flex-col gap-5">
                {/* Instrucciones de la tarea */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">INSTRUCCIONES DEL MAESTRO</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {(selectedQuest.content as any).instructions}
                  </p>
                </div>

                {/* Simulador de Carga */}
                <div>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-2">ADJUNTAR ARCHIVO DE EVIDENCIA</p>
                  
                  {!mockFile ? (
                    <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 text-center flex flex-col items-center gap-3 bg-zinc-50/50 dark:bg-zinc-950/20">
                      <Upload className="h-8 w-8 text-zinc-400" />
                      <p className="text-xs text-zinc-500">Simula la carga de un archivo para completar la entrega</p>
                      
                      <div className="flex gap-2 mt-2">
                        {((selectedQuest.content as any).acceptedFormats as string[]).includes('image') && (
                          <button
                            type="button"
                            onClick={() => simulateFileUpload('image')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-300 text-xs font-semibold bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700"
                          >
                            <FileImage className="h-3.5 w-3.5" />
                            Foto/Dibujo
                          </button>
                        )}
                        {((selectedQuest.content as any).acceptedFormats as string[]).includes('audio') && (
                          <button
                            type="button"
                            onClick={() => simulateFileUpload('audio')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-300 text-xs font-semibold bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-700"
                          >
                            <Mic className="h-3.5 w-3.5" />
                            Grabar Audio
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-emerald-100 bg-emerald-50/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                          {mockFile.type === 'image' ? (
                            <FileImage className="h-5 w-5" />
                          ) : (
                            <Mic className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-950 dark:text-white">
                            {mockFile.type === 'image' ? 'dibujo_fracciones.jpg' : 'lectura_selva.mp3'}
                          </p>
                          <p className="text-[10px] text-zinc-400 uppercase">{mockFile.type === 'image' ? 'Imagen' : 'Audio'}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMockFile(null)}
                        className="text-xs text-rose-500 hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>

                {/* Autoevaluación Formativa */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="reflection" className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                    MI AUTOEVALUACIÓN (MI REFLEXIÓN)
                  </label>
                  <textarea
                    id="reflection"
                    value={evidenceReflection}
                    onChange={(e) => setEvidenceReflection(e.target.value)}
                    required
                    placeholder="Escribe aquí qué fue lo que más te gustó de esta tarea, qué se te facilitó o qué se te complicó al resolverla."
                    className="w-full text-xs p-3 rounded-2xl border border-zinc-200 bg-transparent dark:border-zinc-800 focus:border-blue-500 focus:outline-none text-zinc-900 dark:text-white min-h-[90px]"
                  />
                </div>

                {/* Botón de Enviar */}
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmittingEvidence(false);
                      setSelectedQuest(null);
                    }}
                    className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-950/40 rounded-full font-bold text-xs text-zinc-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!mockFile || !evidenceReflection}
                    className="px-5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/10 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Subir a mi Portafolio
                  </button>
                </div>
              </form>
            ) : (
              // SUBMISSION FINISHED OVERLAY
              <div className="p-8 text-center flex flex-col items-center justify-center gap-6">
                <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="h-10 w-10" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-zinc-950 dark:text-white">¡Evidencia Subida!</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm mx-auto">
                    Tu trabajo ha sido guardado en tu Portafolio Digital de Evidencias. Tu maestro lo recibirá para revisarlo y enviarte feedback.
                  </p>
                </div>

                {/* XP Recompensa */}
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 w-full max-w-xs text-center flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">RECOMPENSA DE ENVÍO</span>
                  <span className="text-md font-black text-emerald-600 mt-1">+50 XP y +10 Monedas</span>
                </div>

                <button
                  onClick={() => {
                    setIsSubmittingEvidence(false);
                    setSelectedQuest(null);
                  }}
                  className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-full font-bold text-xs transition-all dark:bg-white dark:hover:bg-zinc-200 dark:text-black shadow-md"
                >
                  Regresar a la Misión
                </button>
              </div>
            )}

          </div>
        )}

        {/* --- MODO COMBATE DE JEFE (EXAMEN) --- */}
        {isPlayingExam && selectedQuest && (
          <div className="max-w-4xl mx-auto bg-zinc-950 text-white rounded-3xl overflow-hidden border border-purple-900/50 shadow-2xl shadow-purple-950/20 animate-scale-up">
            
            {/* Header del Combate */}
            <div className="px-6 py-4 bg-zinc-900 border-b border-purple-950 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Encuentro de Jefe de Zona (Examen)</span>
              </div>
              <button
                onClick={() => {
                  if (confirm('¿Quieres huir del combate? Tu HP se reducirá y perderás el progreso.')) {
                    setIsPlayingExam(false);
                    setSelectedQuest(null);
                  }
                }}
                className="text-xs font-bold text-zinc-400 hover:text-red-400 transition-colors"
              >
                Huir de la batalla 🏃‍♂️
              </button>
            </div>

            {bossBattlePhase === 'intro' ? (
              // FASE INTRODUCCIÓN LORE
              <div className="p-8 text-center flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-zinc-900 to-zinc-950">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full" />
                  <Trophy className="h-20 w-20 text-purple-500 relative animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-purple-400 tracking-wider">¡SE APROXIMA EL JEFE DE NIVEL!</h2>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedQuest.content.bossName || 'Tirano Oscuro'}</h3>
                  <p className="text-xs text-purple-300 font-semibold mt-1">HP: {selectedQuest.content.bossHp || 100} | Daño: 10-{selectedQuest.content.bossMaxDmg || 20}</p>
                </div>

                <div className="max-w-md p-5 rounded-2xl bg-zinc-900/80 border border-purple-950/60 leading-relaxed font-semibold italic text-xs text-zinc-350 shadow-inner">
                  "{selectedQuest.content.storyIntro || 'Un gran reto te espera. Usa tus saberes para derrotar al guardián.'}"
                </div>

                {/* RPG stats del alumno */}
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 w-full max-w-sm flex justify-around text-center text-xs">
                  <div>
                    <span className="text-red-500 block font-bold">Fuerza 💪</span>
                    <span className="text-md font-black">{stats.attribute_strength || 1}</span>
                  </div>
                  <div className="border-l border-zinc-800 h-8 self-center" />
                  <div>
                    <span className="text-blue-400 block font-bold">Intelecto 🔮</span>
                    <span className="text-md font-black">{stats.attribute_intelligence || 1}</span>
                  </div>
                  <div className="border-l border-zinc-800 h-8 self-center" />
                  <div>
                    <span className="text-emerald-400 block font-bold">Defensa 🛡️</span>
                    <span className="text-md font-black">{stats.attribute_defense || 1}</span>
                  </div>
                </div>

                <button
                  onClick={() => setBossBattlePhase('fight')}
                  className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-full shadow-lg shadow-purple-500/20 transition-all hover:scale-105 uppercase tracking-widest flex items-center gap-2"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Iniciar Combate
                </button>
              </div>
            ) : bossBattlePhase === 'fight' ? (
              // FASE COMBATE
              <div className="p-6 flex flex-col gap-6 bg-zinc-950">
                {/* Visualizadores de HP (Personaje vs Jefe) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center col-span-2">
                  
                  {/* Estudiante stats */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-zinc-300 font-black">Explorador (Tú)</span>
                      <span className="text-xs font-black text-zinc-400 font-black">HP {playerHp}/100</span>
                    </div>
                    {/* Barra de HP */}
                    <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          playerHp > 50 ? 'bg-emerald-500' : playerHp > 20 ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'
                        }`}
                        style={{ width: `${playerHp}%` }}
                      />
                    </div>
                    <div className="flex gap-4 text-[10px] font-bold text-zinc-400 mt-1">
                      <span>Fuerza: <strong className="text-red-550">{stats.attribute_strength || 1}</strong></span>
                      <span>Intelecto: <strong className="text-blue-400">{stats.attribute_intelligence || 1}</strong></span>
                      <span>Defensa: <strong className="text-emerald-405">{stats.attribute_defense || 1}</strong></span>
                    </div>
                  </div>

                  {/* Jefe stats */}
                  <div className="p-4 rounded-2xl bg-zinc-900 border border-purple-950/60 flex flex-col gap-2">
                    <div className="flex justify-between items-center font-black">
                      <span className="text-xs font-black text-purple-400">{selectedQuest.content.bossName}</span>
                      <span className="text-xs font-black text-purple-300">HP {currentBossHp}/{currentBossMaxHp}</span>
                    </div>
                    {/* Barra de HP */}
                    <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          currentBossHp > 50 ? 'bg-purple-650' : currentBossHp > 20 ? 'bg-fuchsia-500' : 'bg-red-650 animate-pulse'
                        }`}
                        style={{ width: `${(currentBossHp / currentBossMaxHp) * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 flex justify-between font-bold">
                      <span>Alineación: <strong className="text-indigo-400">NEM Integral</strong></span>
                      <span className="text-rose-450">Poder: 10-{selectedQuest.content.bossMaxDmg || 20}</span>
                    </div>
                  </div>

                </div>

                {/* Lienzo Gráfico de Combate RPG (PixiJS) */}
                <div className="w-full h-[220px] md:h-[280px] rounded-2xl overflow-hidden border border-purple-955/30 bg-zinc-900/35 relative">
                  <PixiCombatCanvas
                    combatState={canvasCombatState}
                    volume={1}
                    guildBoss={{
                      hp_actual: currentBossHp,
                      hp_max: currentBossMaxHp,
                      name: selectedQuest.content.bossName || 'Jefe',
                      xp_reward: selectedQuest.xp_reward
                    }}
                    partyHp={playerHp}
                    elenaSub={undefined}
                    playSound={playRetroSound}
                    onAttackFinish={() => setCanvasCombatState('idle')}
                  />
                </div>

                {/* Combat Log */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 max-h-[90px] overflow-y-auto text-[10px] leading-relaxed flex flex-col gap-1 font-mono text-zinc-400">
                  {combatLog.map((log, idx) => (
                    <div key={idx} className={log.startsWith('⚔️') ? 'text-emerald-400 font-semibold' : log.startsWith('💥') ? 'text-red-400 font-semibold' : 'text-zinc-300'}>
                      {log}
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-900 pt-5">
                  {/* Preguntas y Progreso */}
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-500 mb-3">
                    <span>Ronda {examCurrentQuestionIdx + 1} de {(selectedQuest.content as any).questions.length}</span>
                    <span className="text-[10px] bg-purple-950/60 text-purple-400 px-2 py-0.5 rounded border border-purple-900/40">
                      Modo Combate
                    </span>
                  </div>

                  {/* Pregunta */}
                  <h3 className="text-md font-bold text-white mb-5">
                    {(selectedQuest.content as any).questions[examCurrentQuestionIdx].question}
                  </h3>

                  {/* Opciones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedQuest.content as any).questions[examCurrentQuestionIdx].options.map((opt: string, idx: number) => {
                      const isCorrectAnswer = idx === (selectedQuest.content as any).questions[examCurrentQuestionIdx].correctAnswerIndex;
                      const isSelected = examSelectedOptionIdx === idx;
                      
                      let btnStyle = 'border-zinc-800 hover:bg-zinc-900 text-zinc-300';
                      
                      if (isExamAnswerSubmitted) {
                        if (isCorrectAnswer) {
                          btnStyle = 'border-emerald-600 bg-emerald-955/20 text-emerald-400';
                        } else if (isSelected) {
                          btnStyle = 'border-rose-600 bg-rose-955/20 text-rose-400';
                        } else {
                          btnStyle = 'border-zinc-800 opacity-40';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isExamAnswerSubmitted}
                          onClick={() => handleExamAnswerSubmit(idx)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border text-left font-semibold text-sm transition-all ${btnStyle}`}
                        >
                          <span className="h-6 w-6 rounded-full bg-zinc-900 flex items-center justify-center text-[11px] font-bold text-zinc-500 border border-zinc-800">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Retroalimentación NEM Formativa Inmediata */}
                  {isExamAnswerSubmitted && (
                    <div className={`mt-5 p-4 rounded-2xl border flex items-start gap-3 animate-fade-in ${
                      examSelectedOptionIdx === (selectedQuest.content as any).questions[examCurrentQuestionIdx].correctAnswerIndex
                        ? 'border-emerald-900 bg-emerald-955/10'
                        : 'border-rose-900 bg-rose-955/10'
                    }`}>
                      {examSelectedOptionIdx === (selectedQuest.content as any).questions[examCurrentQuestionIdx].correctAnswerIndex ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-zinc-500 mb-1">Efecto Formativo</p>
                        <p className="text-xs text-zinc-300 leading-normal font-semibold">
                          {(selectedQuest.content as any).questions[examCurrentQuestionIdx].explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Botón Siguiente / Continuar Combate */}
                  {isExamAnswerSubmitted && (
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={continueBossBattle}
                        className="px-6 py-2.5 rounded-full bg-purple-650 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/10"
                      >
                        Continuar Combate
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : bossBattlePhase === 'victory' ? (
              // FASE VICTORIA
              <div className="p-8 text-center flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-zinc-900 to-zinc-950">
                <div className="h-20 w-20 rounded-full bg-purple-900/50 text-purple-400 flex items-center justify-center animate-bounce border border-purple-500/30">
                  <Trophy className="h-10 w-10 text-purple-400" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-purple-400">¡VICTORIA LEGENDARIA!</h3>
                  <p className="text-sm text-zinc-300 mt-2 max-w-sm mx-auto font-semibold">
                    Lograste derrotar a <strong className="text-purple-300 font-extrabold">{selectedQuest.content.bossName}</strong> y restablecer el balance en la asignatura.
                  </p>
                </div>

                {/* Desglose de Recompensas Básicas */}
                {examResult && (
                  <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800 w-full max-w-md grid grid-cols-2 gap-4 text-center font-black">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">EXPERIENCIA</span>
                      <span className="text-lg font-black text-blue-400 mt-1">+{examResult.xpEarned} XP</span>
                    </div>
                    <div className="flex flex-col items-center justify-center border-l border-zinc-800">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">MONEDAS</span>
                      <span className="text-lg font-black text-yellow-500 flex items-center gap-0.5 mt-1 justify-center">
                        <Coins className="h-5 w-5 fill-current" />
                        +{examResult.coinsEarned}
                      </span>
                    </div>
                  </div>
                )}

                {/* Atributos e Items Desbloqueados */}
                <div className="bg-purple-950/20 border border-purple-900/35 rounded-2xl p-5 w-full max-w-md text-left flex flex-col gap-3 font-semibold text-xs text-zinc-300">
                  <span className="text-[9px] font-black text-purple-400 uppercase tracking-wider border-b border-purple-900/30 pb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    MEJORAS ACADÉMICAS Y DE PERSONAJE OBTENIDAS:
                  </span>
                  
                  {selectedQuest.content.statBoost && (
                    <div className="flex flex-col gap-1.5">
                      <p>✨ <strong>Aumento permanente de Atributos RPG:</strong></p>
                      <div className="flex gap-4 pl-3">
                        {(selectedQuest.content.statBoost.strength || 0) > 0 && <span className="text-red-400 font-bold">Fuerza 💪 +{selectedQuest.content.statBoost.strength}</span>}
                        {(selectedQuest.content.statBoost.intelligence || 0) > 0 && <span className="text-blue-400 font-bold">Intelecto 🔮 +{selectedQuest.content.statBoost.intelligence}</span>}
                        {(selectedQuest.content.statBoost.defense || 0) > 0 && <span className="text-emerald-400 font-bold">Defensa 🛡️ +{selectedQuest.content.statBoost.defense}</span>}
                      </div>
                    </div>
                  )}

                  {selectedQuest.content.customLoot && (
                    <div className="flex items-center gap-2 text-zinc-200 mt-1 bg-zinc-900/40 p-2.5 rounded-xl border border-zinc-800">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase">Loot Especial Desbloqueado</p>
                        <p className="font-extrabold text-white text-xs">
                          {selectedQuest.content.customLoot === 'corona_boss' ? 'Corona del Conquistador 👑' :
                           selectedQuest.content.customLoot === 'mascara_gas' ? 'Máscara de Gas del Ecosistema ☣️' :
                           selectedQuest.content.customLoot === 'baculo_runico' ? 'Báculo Sagrado de Runas 🔮' :
                           selectedQuest.content.customLoot === 'capa_leyenda' ? 'Capa de la Leyenda Áurea 🧥' : 'Escudo del Destino 🛡️'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-1 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-900/20">
                    <Heart className="h-4 w-4 fill-current text-emerald-450 flex-shrink-0" />
                    <span>¡Tu mascota ha comido y se siente sumamente feliz! Sus stats se han recuperado al 100%.</span>
                  </div>
                </div>

                {examResult?.leveledUp && (
                  <div className="p-4 rounded-xl border border-emerald-500 bg-emerald-950/20 text-emerald-400 flex items-center gap-2 text-xs font-bold animate-pulse">
                    <Sparkles className="h-4 w-4" />
                    ¡Subiste de nivel! Has ganado puntos de habilidad adicionales.
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsPlayingExam(false);
                    setSelectedQuest(null);
                  }}
                  className="px-8 py-3 bg-white hover:bg-zinc-200 text-zinc-950 rounded-full font-black text-xs transition-all shadow-md uppercase tracking-wider"
                >
                  Regresar a la Misión
                </button>
              </div>
            ) : (
              // FASE DEFEAT
              <div className="p-8 text-center flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-zinc-900 to-zinc-950">
                <div className="h-20 w-20 rounded-full bg-red-950/50 text-red-500 flex items-center justify-center animate-pulse border border-red-900/30">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-red-500">¡HAS SIDO DERROTADO!</h3>
                  <p className="text-sm text-zinc-300 mt-2 max-w-sm mx-auto font-semibold">
                    No lograste resistir los ataques de <strong className="text-purple-300 font-extrabold">{selectedQuest.content.bossName}</strong>. 
                  </p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed font-semibold">
                    Revisa las explicaciones de las preguntas, repasa los conceptos de la Nueva Escuela Mexicana y vuelve a desafiar al jefe.
                  </p>
                </div>

                {/* Atributos informativos */}
                <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 w-full max-w-md text-left text-xs text-zinc-400 flex flex-col gap-2 leading-relaxed font-semibold">
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block border-b border-zinc-800 pb-1 flex items-center gap-1 font-black">
                    <Brain className="h-4 w-4 text-red-400" />
                    Consejo RPG Académico:
                  </span>
                  <p>
                    🔮 **Aumenta tu atributo de Intelecto** resolviendo tareas regulares para hacer más daño al jefe con cada respuesta correcta.
                  </p>
                  <p>
                    🛡️ **Mejora tu Defensa** para reducir el contraataque del jefe cuando te equivoques.
                  </p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setBossBattlePhase('intro')}
                    className="px-6 py-2.5 bg-purple-650 hover:bg-purple-700 text-white rounded-full font-bold text-xs transition-all shadow-md"
                  >
                    Volver a Intentar
                  </button>
                  <button
                    onClick={() => {
                      setIsPlayingExam(false);
                      setSelectedQuest(null);
                    }}
                    className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800 rounded-full font-bold text-xs transition-all"
                  >
                    Retirarse
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
