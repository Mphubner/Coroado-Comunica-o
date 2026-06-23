import React, { useState, useEffect } from 'react';
import { Module, Lesson, LessonProgress } from '../types';
import { VideoPlayer } from './VideoPlayer';
import { BookOpen, CheckCircle, ChevronRight, ArrowLeft, ArrowRight, ExternalLink, HelpCircle, Sparkles, MessageSquare, RefreshCw } from 'lucide-react';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';

interface CurriculumTrailProps {
  userId: string;
  modules: Module[];
  lessons: Lesson[];
  progress: LessonProgress[];
  onRefreshProgress: () => void;
  onOpenDevotional: (lessonId: string) => void;
  // Allows the dashboard to directly open a specific lesson
  initiallySelectedLessonId?: string | null;
  clearInitialLessonSelection?: () => void;
  isAdmin?: boolean;
  onShowCompletion?: (lessonTitle: string) => void;
}

export const CurriculumTrail: React.FC<CurriculumTrailProps> = ({
  userId,
  modules,
  lessons,
  progress,
  onRefreshProgress,
  onOpenDevotional,
  initiallySelectedLessonId,
  clearInitialLessonSelection,
  isAdmin = false,
  onShowCompletion
}) => {
  // Navigation states: 'list' | 'theme' | 'lesson'
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(() => {
    if (initiallySelectedLessonId) {
      const foundLesson = lessons.find(l => l.id === initiallySelectedLessonId);
      return foundLesson || null;
    }
    return null;
  });

  const [savingProgress, setSavingProgress] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States for editing a lesson (Admin exclusive)
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editObjective, setEditObjective] = useState('');
  const [editBibleReferences, setEditBibleReferences] = useState('');
  const [editOpeningQuestion, setEditOpeningQuestion] = useState('');
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Users' questions answers states
  const [openingAnswer, setOpeningAnswer] = useState('');
  const [finalAnswers, setFinalAnswers] = useState('');
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [savingAnswers, setSavingAnswers] = useState(false);

  // Load existing study answers
  useEffect(() => {
    if (selectedLesson && userId) {
      const fetchLessonAnswers = async () => {
        setLoadingAnswers(true);
        try {
          const docId = `${userId}_${selectedLesson.id}`;
          const qRef = doc(db, 'lessonAnswers', docId);
          const snap = await getDoc(qRef);
          
          if (snap.exists()) {
            const data = snap.data();
            setOpeningAnswer(data.openingAnswer || '');
            setFinalAnswers(data.finalAnswers || '');
          } else {
            setOpeningAnswer('');
            setFinalAnswers('');
          }
        } catch (err) {
          console.error("Failed to load lesson answers:", err);
        } finally {
          setLoadingAnswers(false);
        }
      };
      fetchLessonAnswers();
    }
  }, [selectedLesson, userId]);

  // Save/submit answers to Firestore
  const handleSaveLessonAnswers = async () => {
    if (!selectedLesson || !userId) return;
    setSavingAnswers(true);
    const docId = `${userId}_${selectedLesson.id}`;
    const ref = doc(db, 'lessonAnswers', docId);

    const payload = {
      userId,
      userEmail: auth.currentUser?.email || '',
      lessonId: selectedLesson.id || '',
      openingAnswer,
      finalAnswers,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(ref, payload, { merge: true });
      setToastMessage("Suas respostas do estudo foram salvas com sucesso!");
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error("Failed to save study answers:", err);
      setToastMessage("Falha ao salvar respostas.");
    } finally {
      setSavingAnswers(false);
    }
  };

  const handleStartEditing = () => {
    if (!selectedLesson) return;
    setEditTitle(selectedLesson.title || '');
    setEditObjective(selectedLesson.objective || '');
    setEditBibleReferences(selectedLesson.bibleReferences || '');
    setEditOpeningQuestion(selectedOpeningQuestion() || '');
    setEditYoutubeUrl(selectedLesson.youtubeUrl || '');
    setIsEditingLesson(true);
  };

  const selectedOpeningQuestion = () => {
    return selectedLesson?.openingQuestion || '';
  };

  const handleSaveLessonEdit = async () => {
    if (!selectedLesson) return;
    setIsSavingEdit(true);
    try {
      const { updateDoc, doc: fsDoc } = await import('firebase/firestore');
      const lessonRef = fsDoc(db, 'lessons', selectedLesson.id || '');
      
      const cleanUrl = editYoutubeUrl.trim();
      const extractedId = cleanUrl ? (cleanUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || '') : '';
      const finalId = extractedId.length === 11 ? extractedId : '';

      await updateDoc(lessonRef, {
        title: editTitle,
        objective: editObjective,
        bibleReferences: editBibleReferences,
        openingQuestion: editOpeningQuestion,
        youtubeUrl: cleanUrl,
        youtubeVideoId: finalId || 'dQw4w9WgXcQ',
        updatedAt: new Date().toISOString()
      });

      setToastMessage("Dados da aula atualizados com sucesso!");
      setTimeout(() => setToastMessage(null), 5000);
      setIsEditingLesson(false);
      onRefreshProgress();

      // Update state locally
      selectedLesson.title = editTitle;
      selectedLesson.objective = editObjective;
      selectedLesson.bibleReferences = editBibleReferences;
      selectedLesson.openingQuestion = editOpeningQuestion;
      selectedLesson.youtubeUrl = cleanUrl;
      selectedLesson.youtubeVideoId = finalId || 'dQw4w9WgXcQ';
    } catch (err) {
      console.error("Failed to update lesson:", err);
      setToastMessage("Falha ao salvar alterações da aula.");
      setTimeout(() => setToastMessage(null), 5000);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // If the dashboard commanded to open a specific lesson directly
  useEffect(() => {
    if (initiallySelectedLessonId) {
      const foundLesson = lessons.find(l => l.id === initiallySelectedLessonId);
      if (foundLesson) {
        setSelectedLesson(foundLesson);
        const relatedModule = modules.find(m => m.id === foundLesson.moduleId);
        if (relatedModule) setSelectedModule(relatedModule);
      }
      if (clearInitialLessonSelection) clearInitialLessonSelection();
    }
  }, [initiallySelectedLessonId, lessons, modules]);

  // Helper to get lesson progress status
  const getLessonStatus = (lessonId: string) => {
    const match = progress.find(p => p.lessonId === lessonId);
    return match ? match.status : 'nao_iniciada';
  };

  // Mark lesson as complete
  const handleMarkAsComplete = async (lesson: Lesson) => {
    if (savingProgress) return;
    setSavingProgress(true);
    setToastMessage(null);

    const progressId = `${userId}_${lesson.id}`;
    const progressRef = doc(db, 'lessonProgress', progressId);

    const payload: LessonProgress = {
      userId,
      lessonId: lesson.id || '',
      moduleId: lesson.moduleId,
      status: 'concluida',
      percent: 100,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(progressRef, payload);
      onRefreshProgress();
      if (onShowCompletion) {
        onShowCompletion(lesson.title);
      } else {
        setToastMessage("Aula concluída. Continue com fidelidade na prática da semana.");
        setTimeout(() => setToastMessage(null), 8000);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `lessonProgress/${progressId}`);
    } finally {
      setSavingProgress(false);
    }
  };

  // Calc theme (Module) overall progress percent
  const getModulePercent = (moduleId: string) => {
    const relatedLessons = lessons.filter(l => l.moduleId === moduleId);
    if (relatedLessons.length === 0) return 0;
    const completedRelated = relatedLessons.filter(l => getLessonStatus(l.id || '') === 'concluida').length;
    return Math.round((completedRelated / relatedLessons.length) * 100);
  };

  // Render Theme Lessons List
  if (selectedModule && !selectedLesson) {
    const relatedLessons = lessons
      .filter(l => l.moduleId === selectedModule.id)
      .sort((a, b) => a.order - b.order);

    return (
      <div className="space-y-6 animate-fade-in text-[#2D2926]">
        <button
          onClick={() => setSelectedModule(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C847C] hover:text-[#1A2E44] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Voltar para Temas</span>
        </button>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#F0EDEA] card-shadow space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309]">Tema Selecionado</span>
          <h2 className="text-[#2D2926] font-serif text-2xl font-bold leading-tight">{selectedModule.title}</h2>
          <p className="text-[#8C847C] text-sm leading-relaxed">{selectedModule.description}</p>
          <div className="w-full bg-[#F5F2ED] h-2 rounded-full overflow-hidden mt-3">
            <div 
              className="h-full bg-[#C5A059] transition-all"
              style={{ width: `${getModulePercent(selectedModule.id || '')}%` }}
            ></div>
          </div>
        </div>

        <h3 className="text-[#8C847C] font-semibold text-xs uppercase tracking-[0.2em] pl-1 mt-6">Aulas da Caminhada</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedLessons.map(lesson => {
            const status = getLessonStatus(lesson.id || '');
            return (
              <div 
                key={lesson.id} 
                onClick={() => setSelectedLesson(lesson)}
                className="bg-white hover:bg-[#F5F2ED]/45 border border-[#F0EDEA] hover:border-[#C5A059] rounded-3xl p-6 card-shadow cursor-pointer transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono text-[#8C847C]">AULA {String(lesson.order).padStart(2, '0')}</span>
                    {status === 'concluida' ? (
                      <span className="flex items-center gap-1 text-[10px] bg-[#F5F2ED] text-[#B45309] font-bold px-2.5 py-1 rounded-full border border-[#EEEAE5]">
                        <CheckCircle size={10} /> Concluída
                      </span>
                    ) : (
                      <span className="text-[10px] bg-zinc-150 text-[#8C847C] px-2.5 py-1 rounded-full font-semibold">
                        Pendente
                      </span>
                    )}
                  </div>
                  <h4 className="text-[#2D2926] font-serif font-bold text-lg leading-tight">{lesson.title}</h4>
                  <p className="text-[#8C847C] text-xs line-clamp-3 leading-relaxed font-sans">
                    {lesson.objective || "Estudo técnico e espiritual direcionado para novos integrantes do ministério de mídias."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F0EDEA] text-xs font-bold text-[#1A2E44]">
                  <span>Abrir Aula</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Render Lesson Detail
  if (selectedLesson) {
    const status = getLessonStatus(selectedLesson.id || '');
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in relative pb-16 text-[#2D2926]">
        
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            onClick={() => {
              setSelectedLesson(null);
              // Ensure we keep parent module loaded
              const relatedM = modules.find(m => m.id === selectedLesson.moduleId);
              if (relatedM) setSelectedModule(relatedM);
              setIsEditingLesson(false); // Reset editing mode
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C847C] hover:text-[#1A2E44] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Voltar para as Aulas</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                if (isEditingLesson) {
                  setIsEditingLesson(false);
                } else {
                  handleStartEditing();
                }
              }}
              className="inline-flex items-center gap-1.5 bg-[#FBF9F6] border border-[#F0EDEA] hover:border-[#C5A059] text-[#1A2E44] px-3.5 py-1.5 rounded-xl transition-all font-bold cursor-pointer text-xs shadow-sm"
            >
              <Sparkles size={13} className="text-[#C5A059]" />
              <span>{isEditingLesson ? "Voltar ao Modo Normal" : "Editar Vídeo / Dados da Aula"}</span>
            </button>
          )}
        </div>

        {/* Lesson Toast feedback banner */}
        {toastMessage && (
          <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 bg-[#1A2E44] border border-[#C5A059] text-white p-4 rounded-2xl shadow-2xl z-50 animate-slide-in flex items-start gap-3">
            <span className="text-md">🌻</span>
            <div className="space-y-1">
              <h5 className="font-serif font-bold text-xs text-white uppercase tracking-wide">Excelente!</h5>
              <p className="text-xs leading-relaxed opacity-95">{toastMessage}</p>
            </div>
          </div>
        )}

        {/* Admin Inline Editor */}
        {isAdmin && isEditingLesson && (
          <div className="bg-[#1A2E44] text-[#F5F2ED] rounded-3xl p-6 md:p-8 border border-[#2D2926]/40 text-[#F5F2ED] space-y-5 shadow-xl animate-fade-in font-sans">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 bg-[#C5A059]/20 text-[#C5A059] font-extrabold text-[9px] tracking-widest px-2.5 py-1 rounded-full uppercase border border-[#C5A059]/30">
                ⚙️ CONTROLE EXCLUSIVO ADMINISTRADOR
              </span>
              <h3 className="text-white font-serif font-bold text-lg">Modificar Dados Técnicos da Aula</h3>
              <p className="text-[#8C847C] text-xs leading-relaxed text-stone-300">
                Altere o vídeo do YouTube desta aula ou reescreva os textos base de objetivo, referências e pergunta de entrada. Ao salvar, as modificações são gravadas diretamente no Firebase.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 text-xs pt-1 text-stone-200">
              <div className="space-y-1.5">
                <label className="block font-bold text-stone-300 uppercase tracking-wider">Título do Estudo</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full text-xs font-semibold bg-white/10 outline-none border border-white/20 rounded-2xl px-4 py-3 focus:bg-white focus:text-[#2D2926] focus:border-[#C5A059] transition-all text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-stone-300 uppercase tracking-wider">Link Completo do YouTube (Vídeos Públicos ou Não Listados)</label>
                <input
                  type="text"
                  placeholder="Ex: https://www.youtube.com/watch?v=7HC8lPB36OQ"
                  value={editYoutubeUrl}
                  onChange={e => setEditYoutubeUrl(e.target.value)}
                  className="w-full text-xs font-semibold bg-white/10 outline-none border border-white/20 rounded-2xl px-4 py-3 focus:bg-white focus:text-[#2D2926] focus:border-[#C5A059] transition-all text-white font-mono"
                />
                <p className="text-[10px] text-stone-400">Insira um link válido do YouTube. Certifique-se de que o vídeo possui a opção de incorporação autorizada pelo proprietário no YouTube.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-stone-300 uppercase tracking-wider">Objetivo Técnico / Espiritual</label>
                <textarea
                  value={editObjective}
                  onChange={e => setEditObjective(e.target.value)}
                  rows={2}
                  className="w-full text-xs lg:text-xs bg-white/10 outline-none border border-white/20 rounded-2xl px-4 py-3 focus:bg-white focus:text-[#2D2926] focus:border-[#C5A059] transition-all text-white font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-stone-300 uppercase tracking-wider">Passagens e Referências Bíblicas</label>
                <input
                  type="text"
                  value={editBibleReferences}
                  onChange={e => setEditBibleReferences(e.target.value)}
                  className="w-full text-xs font-semibold bg-white/10 outline-none border border-white/20 rounded-2xl px-4 py-3 focus:bg-white focus:text-[#2D2926] focus:border-[#C5A059] transition-all text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-stone-300 uppercase tracking-wider">Pergunta Inicial (Secreto)</label>
                <input
                  type="text"
                  value={editOpeningQuestion}
                  onChange={e => setEditOpeningQuestion(e.target.value)}
                  className="w-full text-xs font-semibold bg-white/10 outline-none border border-white/20 rounded-2xl px-4 py-3 focus:bg-white focus:text-[#2D2926] focus:border-[#C5A059] transition-all text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={handleSaveLessonEdit}
                disabled={isSavingEdit}
                className="bg-[#C5A059] hover:bg-opacity-90 disabled:bg-stone-700 text-[#1A2E44] font-extrabold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5"
              >
                {isSavingEdit ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Salvando alterações...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} className="stroke-[2.5px]" />
                    <span>Salvar Dados da Aula</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setIsEditingLesson(false)}
                className="bg-transparent border border-white/20 hover:bg-white/5 text-stone-300 hover:text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#8C847C] font-semibold uppercase tracking-wider">
            <span>{selectedModule?.title || "Trilha"}</span>
            <span>•</span>
            <span className="font-mono text-[10px]">AULA {selectedLesson.order}</span>
          </div>
          <h1 className="text-[#2D2926] font-serif font-bold text-2xl md:text-3xl tracking-tight leading-snug">{selectedLesson.title}</h1>
        </div>

        {/* Video Player */}
        <VideoPlayer youtubeUrl={selectedLesson.youtubeUrl} youtubeVideoId={selectedLesson.youtubeVideoId} />

        {/* Accordions and Layout sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main summary text content (Interactive Step-by-Step Flow) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* PASSO 1: TEXTO BÍBLICO */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#F0EDEA] card-shadow space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center bg-[#1A2E44] text-[#C5A059] font-mono text-[10px] font-bold w-6 h-6 rounded-full border border-[#C5A059]/40 shadow-sm">
                  1
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309] font-sans">
                  PASSO 1 • Texto-Base Bíblico (NVI)
                </span>
              </div>

              <div className="border-t border-[#F5F2ED] pt-3 space-y-3">
                <p className="text-[#1A2E44] font-serif font-extrabold text-xl tracking-wide leading-relaxed pl-1">
                  {selectedLesson.bibleReferences || "Consulte e leia na Bíblia"}
                </p>
                <div className="bg-[#F5F2ED]/50 border border-[#EEEAE5] p-3 rounded-2xl text-xs md:text-sm text-[#8C847C] leading-relaxed">
                  📖 O discípulo com maturidade espiritual lê e estuda as escrituras sob oração antes de projetá-las em telas criativas. Abra sua Bíblia de cabeceira se desejar.
                </div>
              </div>
            </div>

            {/* PASSO 2: PERGUNTA INICIAL */}
            {selectedLesson.openingQuestion && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#F0EDEA] card-shadow space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center bg-[#1A2E44] text-[#C5A059] font-mono text-[10px] font-bold w-6 h-6 rounded-full border border-[#C5A059]/40 shadow-sm">
                    2
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309] font-sans">
                    PASSO 2 • Pergunta de Reflexão de Entrada
                  </span>
                </div>

                <div className="border-t border-[#F5F2ED] pt-4 space-y-3">
                  <p className="text-[#2D2926] text-base md:text-lg leading-relaxed font-bold font-serif pl-1">
                    {selectedLesson.openingQuestion}
                  </p>
                  
                  <textarea
                    rows={4}
                    value={openingAnswer}
                    onChange={(e) => setOpeningAnswer(e.target.value)}
                    placeholder="Reflita e anote seu entendimento ou posicionamento espiritual antes de iniciar a aula..."
                    className="w-full text-sm md:text-base bg-[#F5F2ED]/40 border border-[#EEEAE5] rounded-2xl p-4 outline-none focus:bg-white focus:border-[#C5A059] transition-all text-[#2D2926] leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* PASSO 3: A AULA */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#F0EDEA] card-shadow space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center bg-[#1A2E44] text-[#C5A059] font-mono text-[10px] font-bold w-6 h-6 rounded-full border border-[#C5A059]/40 shadow-sm">
                  3
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309] font-sans">
                  PASSO 3 • A Aula & Desenvolvimento Doutrinário
                </span>
              </div>

              <div className="border-t border-[#F5F2ED] pt-4 space-y-4">
                <div className="bg-[#1A2E44]/5 border border-[#C5A059]/20 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono font-bold text-[#B45309] uppercase">Alvo Teológico</span>
                  <p className="text-[#2D2926] text-sm md:text-base font-semibold leading-relaxed">
                    {selectedLesson.objective}
                  </p>
                </div>

                <p className="text-[#8C847C] text-base md:text-lg leading-relaxed whitespace-pre-wrap font-sans pl-1">
                  {selectedLesson.summary || "Conteúdo formativo sob revisão doutrinária pela equipe de pastores da Comunidade Coroado."}
                </p>
              </div>
            </div>

            {/* PASSO 4: PERGUNTAS FINAIS */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#F0EDEA] card-shadow space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center justify-center bg-[#1A2E44] text-[#C5A059] font-mono text-[10px] font-bold w-6 h-6 rounded-full border border-[#C5A059]/40 shadow-sm">
                  4
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#B45309] font-sans">
                  PASSO 4 • Perguntas de Fixação e Aplicação Prática
                </span>
              </div>

              <div className="border-t border-[#F5F2ED] pt-4 space-y-4">
                <div className="bg-[#F5F2ED]/50 border border-[#EEEAE5] p-5 rounded-2xl space-y-3">
                  <span className="text-[9px] font-mono font-bold text-[#1A2E44] uppercase tracking-wider block">Questionário de Estudo</span>
                  
                  <p className="text-[#2D2926] text-sm md:text-base font-serif font-bold leading-relaxed whitespace-pre-wrap pl-1">
                    {(selectedLesson as any).finalQuestions || "1. Qual o principal aprendizado teológico e técnico dessa aula na sua vida?\n2. De que modo você buscará a excelência para cooperar com o Reino local esta semana?"}
                  </p>
                </div>

                <textarea
                  rows={5}
                  value={finalAnswers}
                  onChange={(e) => setFinalAnswers(e.target.value)}
                  placeholder="Escreva suas respostas detalhadas às perguntas acima..."
                  className="w-full text-sm md:text-base bg-[#F5F2ED]/40 border border-[#EEEAE5] rounded-2xl p-4 outline-none focus:bg-white focus:border-[#C5A059] transition-all text-[#2D2926] leading-relaxed"
                />

                <div className="flex items-center justify-between gap-4 pt-1">
                  <p className="text-[10px] text-[#8C847C] leading-snug max-w-xs font-sans">
                    * Suas respostas de reflexão serão integradas ao painel.
                  </p>

                  <button
                    onClick={handleSaveLessonAnswers}
                    disabled={savingAnswers}
                    className="inline-flex items-center gap-1.5 bg-[#1A2E44] hover:bg-opacity-95 text-[#C5A059] font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {savingAnswers ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <MessageSquare size={13} />
                    )}
                    <span>{savingAnswers ? "Gravando respostas..." : "Salvar Respostas da Aula"}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar downloads and controls */}
          <div className="space-y-6">
            
            {/* Action buttons list */}
            <div className="bg-white p-6 rounded-3xl border border-[#F0EDEA] card-shadow space-y-4">
              <h4 className="text-[#8C847C] font-semibold text-[10px] uppercase tracking-widest mb-2">Suas Atividades</h4>
              
              {status === 'concluida' ? (
                <div className="bg-[#F5F2ED] text-[#B45309] border border-[#EEEAE5] rounded-2xl p-4 text-center space-y-1.5 shadow-sm">
                  <span className="font-bold text-xs flex items-center justify-center gap-1.5 text-[#B45309]">
                    <CheckCircle size={16} /> Aula Concluída!
                  </span>
                  <p className="text-[10px] opacity-80 leading-snug">Você registrou que assistiu a prelação técnica de hoje.</p>
                </div>
              ) : (
                <button
                  onClick={() => handleMarkAsComplete(selectedLesson)}
                  disabled={savingProgress}
                  className="w-full bg-[#1A2E44] hover:bg-opacity-95 disabled:bg-zinc-300 text-white font-bold text-xs px-4 py-3.5 rounded-2xl transition-all shadow-sm cursor-pointer"
                >
                  {savingProgress ? "Salvando..." : "Marcar como concluída"}
                </button>
              )}

              <button
                onClick={() => onOpenDevotional(selectedLesson.id || '')}
                className="w-full bg-[#F5F2ED] hover:bg-[#EAE5DF] text-[#1A2E44] font-bold text-xs px-4 py-3.5 rounded-2xl transition-all border border-[#EEEAE5] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Responder Devocional</span>
                <ArrowRight size={14} className="text-[#C5A059]" />
              </button>
            </div>

            {/* Support materials & external drives */}
            <div className="bg-[#F5F2ED] p-6 rounded-3xl border border-[#EEEAE5] space-y-4">
              <h4 className="text-[#1A2E44] font-serif font-bold text-sm flex items-center gap-1.5">
                📂 Apoio & Documentos
              </h4>
              
              <div className="space-y-3 text-xs">
                {selectedLesson.driveDocUrl && (
                  <a
                    href={selectedLesson.driveDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white hover:bg-zinc-100 rounded-2xl border border-[#EEEAE5] transition-colors"
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-[#2D2926] truncate font-sans">Documentação Ministerial</p>
                      <p className="text-[10px] text-[#8C847C] font-mono">PDF / Google Drive</p>
                    </div>
                    <ExternalLink size={14} className="text-[#C5A059] shrink-0" />
                  </a>
                )}

                {selectedLesson.driveSlideUrl && (
                  <a
                    href={selectedLesson.driveSlideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-white hover:bg-zinc-100 rounded-2xl border border-[#EEEAE5] transition-colors"
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-[#2D2926] truncate font-sans">Apresentação de Apoio</p>
                      <p className="text-[10px] text-[#8C847C] font-mono">Slides da Reunião</p>
                    </div>
                    <ExternalLink size={14} className="text-[#C5A059] shrink-0" />
                  </a>
                )}

                <div className="bg-white/80 border border-[#EEEAE5] p-3 rounded-2xl text-[10px] text-[#8C847C] leading-relaxed">
                  ⚠️ Apoios técnicos servem de auxílio para as atividades, mas lembre-se do principal: fidelidade no secreto e no caminhar.
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // Render Theme Grid
  return (
    <div className="space-y-6 select-none animate-fade-in text-[#2D2926]">
      
      <div className="space-y-1.5">
        <h1 className="text-[#2D2926] font-serif font-bold text-2xl md:text-3xl tracking-tight leading-snug">Sua Trilha de Estudo</h1>
        <p className="text-[#8C847C] text-sm font-sans">Desenvolva habilidades técnicas com discernimento de caráter e maturidade espiritual.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules
          .sort((a, b) => a.order - b.order)
          .map(mod => {
            const pct = getModulePercent(mod.id || '');
            const related = lessons.filter(l => l.moduleId === mod.id);

            return (
              <div 
                key={mod.id} 
                onClick={() => setSelectedModule(mod)}
                className="bg-white hover:bg-[#F5F2ED]/45 border border-[#F0EDEA] hover:border-[#C5A059] rounded-3xl p-6 card-shadow cursor-pointer transition-all flex flex-col justify-between space-y-6 pb-7"
              >
                <div className="space-y-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase bg-[#F5F2ED] text-[#B45309] border border-[#EEEAE5]">
                    TEMA 0{mod.order}
                  </span>
                  
                  <div className="space-y-1">
                    <h3 className="text-[#2D2926] font-serif font-bold text-lg leading-tight">{mod.title}</h3>
                    <p className="text-[#8C847C] text-xs leading-relaxed line-clamp-3 font-sans">{mod.description}</p>
                  </div>
                </div>

                <div className="space-y-3 border-t border-[#EEEAE5] pt-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#8C847C]">{related.length} aulas</span>
                    <span className="text-[#2D2926] font-extrabold font-mono">{pct}% completo</span>
                  </div>

                  <div className="w-full bg-[#F5F2ED] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        pct === 100 ? 'bg-green-700' : 'bg-[#1A2E44]'
                      }`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

    </div>
  );
};
