"use client";

import React, { useState, useEffect, use } from 'react';
import { useGamification } from '@/context/gamification-context';
import { Header } from '@/components/Header';
import { 
  ArrowLeft, Play, FileSpreadsheet, AudioLines, 
  CheckCircle2, XCircle, ChevronRight, Coins, 
  Trophy, Sparkles, Upload, FileImage, Mic, HelpCircle, ArrowRight, Lock
} from 'lucide-react';
import Link from 'next/link';

interface MissionPageProps {
  params: Promise<{ id: string }>;
}

export default function MissionPage({ params }: MissionPageProps) {
  const { id } = use(params);
  const { missions, stats, submitQuiz, submitPortfolioItem, questAttempts } = useGamification();
  
  // Buscar misión
  const mission = missions.find(m => m.id === id);
  
  // Estados de control
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [isPlayingQuiz, setIsPlayingQuiz] = useState(false);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  
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

  const nextQuestion = () => {
    const questions = (selectedQuest.content as any).questions;
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOptionIdx(null);
      setIsAnswerSubmitted(false);
      setTimer(20);
    } else {
      // Final del cuestionario, enviar resultados
      const finalScorePercentage = Math.round((quizScore / questions.length) * 100);
      const results = submitQuiz(selectedQuest.id, finalScorePercentage, quizAnswers);
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

  // Helper para ver si este quest ya fue completado
  const getQuestStatus = (questId: string) => {
    const attempts = questAttempts.filter(a => a.quest_id === questId);
    if (attempts.length === 0) return 'pending';
    const hasPassed = attempts.some(a => a.score >= 60);
    return hasPassed ? 'completed' : 'failed';
  };

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
        
        {!isPlayingQuiz && !isSubmittingEvidence && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Detalles de la Misión / Historia (Izquierda) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 p-6 shadow-sm">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                  {mission.subject_id === 'sub-math' ? 'Matemáticas' : 'Español'}
                </span>
                
                <h1 className="text-2xl font-black mt-3 text-zinc-950 dark:text-white">{mission.title}</h1>
                
                {/* Cuadro de Narrativa */}
                <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/60 dark:border-indigo-900/30">
                  <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-4 w-4" />
                    Bitácora del Explorador
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed italic">
                    "{mission.story_intro}"
                  </p>
                </div>
              </div>
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
                      <div className="flex gap-4 items-center">
                        <div className={`p-3 rounded-xl ${
                          isLocked 
                            ? 'bg-zinc-100 text-zinc-400 dark:bg-zinc-950'
                            : status === 'completed'
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
                        }`}>
                          {quest.type === 'quiz' ? (
                            <FileSpreadsheet className="h-6 w-6" />
                          ) : (
                            <AudioLines className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-400">RETO {index + 1}</span>
                            {status === 'completed' && (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                                ¡Completado!
                              </span>
                            )}
                            {status === 'failed' && (
                              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 px-1.5 py-0.5 rounded-full">
                                Intentar de nuevo
                              </span>
                            )}
                          </div>
                          <h3 className="text-md font-bold text-zinc-900 dark:text-white mt-0.5">{quest.title}</h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal max-w-md">{quest.description}</p>
                        </div>
                      </div>

                      {/* Botón y Recompensas */}
                      <div className="flex items-center gap-4 self-stretch md:self-auto justify-between border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 dark:border-zinc-800">
                        {/* Recompensas */}
                        <div className="flex items-center gap-3 text-xs font-bold">
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
                            onClick={() => quest.type === 'quiz' ? startQuiz(quest) : startSubmission(quest)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all ${
                              status === 'completed'
                                ? 'bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600'
                                : 'bg-blue-600 hover:bg-blue-500'
                            }`}
                          >
                            {status === 'completed' ? 'Reintentar' : 'Jugar'}
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

      </main>
    </div>
  );
}
