import React from 'react';
import { UserProfile, Module, Lesson, DevotionalAnswer, WeeklyMeeting, LessonProgress } from '../types';
import { BookOpen, Heart, Video, Calendar, ArrowRight, CheckCircle, Clock } from 'lucide-react';

interface ServoDashboardProps {
  userProfile: UserProfile;
  modules: Module[];
  lessons: Lesson[];
  progress: LessonProgress[];
  answers: DevotionalAnswer[];
  nextMeeting: WeeklyMeeting | null;
  onNavigateToTab: (tab: string, lessonId?: string) => void;
}

export const ServoDashboard: React.FC<ServoDashboardProps> = ({
  userProfile,
  modules,
  lessons,
  progress,
  answers,
  nextMeeting,
  onNavigateToTab
}) => {
  // 1. Calculate general course stats
  const totalLessons = lessons.length > 0 ? lessons.length : 15;
  const completedLessonsCount = progress.filter(p => p.status === 'concluida').length;
  const completedDevotionalsCount = answers.length; // Each answer is a completed devotional

  // Calculate percentages
  const lessonsPercent = Math.min(Math.round((completedLessonsCount / totalLessons) * 100), 100);
  const devotionalsPercent = Math.min(Math.round((completedDevotionalsCount / totalLessons) * 100), 100);
  const generalProgressPercent = Math.round((lessonsPercent + devotionalsPercent) / 2);

  // 2. Recommend the first uncompleted lesson, sorting by module order then lesson order
  const getModuleOrder = (moduleId: string) => {
    const parent = modules.find(m => m.id === moduleId);
    return parent ? parent.order : 999;
  };

  const sortedLessons = [...lessons].sort((a, b) => {
    const orderA = getModuleOrder(a.moduleId);
    const orderB = getModuleOrder(b.moduleId);
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return (a.title || '').localeCompare(b.title || '');
  });

  const recommendedLesson = sortedLessons.find(l => {
    const matchProg = progress.find(p => p.lessonId === l.id);
    return !matchProg || matchProg.status !== 'concluida';
  }) || sortedLessons[0];

  // Check if there is an uncompleted devotional for a concluded lesson
  const pendingDevotionalLesson = lessons.find(l => {
    const isLessonDone = progress.some(p => p.lessonId === l.id && p.status === 'concluida');
    const isDevotionalResponded = answers.some(a => a.lessonId === l.id);
    return isLessonDone && !isDevotionalResponded;
  });

  return (
    <div className="space-y-8 select-none animate-fade-in text-[#2D2926]">
      
      {/* Header and Pastoral Welcome Banner */}
      <div className="relative bg-[#1A2E44] rounded-[2.5rem] p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between overflow-hidden border border-white/5 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-full bg-[#C5A059] opacity-10 blur-3xl rounded-full translate-x-20 -translate-y-10 pointer-events-none"></div>
        <div className="relative z-10 max-w-xl space-y-3.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30">
            🌳 Ministério de comunicação
          </span>
          <h3 className="text-white font-serif text-3xl md:text-3.5xl tracking-wide italic leading-tight">
            "Não criamos conteúdo para entreter. Comunicamos para transformar."
          </h3>
          <p className="text-white/75 text-sm leading-relaxed font-sans">
            Graça e paz, <span className="text-[#C5A059] font-medium">{userProfile.displayName}</span>. Seus estudos acontece no secreto e no caminho. Continue com fidelidade.
          </p>
        </div>
        <div className="relative z-10 mt-6 md:mt-0 shrink-0">
          <button
            onClick={() => {
              if (pendingDevotionalLesson) {
                onNavigateToTab('devocionais', pendingDevotionalLesson.id);
              } else if (recommendedLesson) {
                onNavigateToTab('trilha', recommendedLesson.id);
              } else {
                onNavigateToTab('trilha');
              }
            }}
            className="w-full sm:w-auto bg-[#C5A059] text-[#1A2E44] font-bold px-8 py-3.5 rounded-full hover:shadow-lg hover:shadow-[#C5A059]/20 transition-all text-xs uppercase tracking-wider cursor-pointer font-sans"
          >
            {pendingDevotionalLesson ? "Responder Devocional" : "Retomar Aula"}
          </button>
        </div>
      </div>

      {/* Devotional Status/Pastoral reminder */}
      <div className="bg-[#F5F2ED] rounded-3xl p-6 border-l-4 border-[#C5A059] flex items-start gap-4 shadow-sm">
        <span className="text-2xl mt-0.5">🕊️</span>
        <div className="space-y-1">
          <p className="text-[10px] text-[#B45309] font-bold uppercase tracking-widest">
            {pendingDevotionalLesson ? "Pendência " : "Lembrete para a caminhada"}
          </p>
          <p className="text-[#2D2926] text-sm font-medium leading-relaxed italic">
            {pendingDevotionalLesson 
              ? "Como seu serviço hoje reflete a imagem de Cristo? Sua resposta ajuda os pastores a caminharem com você."
              : "Sua caminhada com Cristo alimenta o seu trabalho técnico. Tire alguns minutos para buscar a Deus em oração antes de planejar suas tarefas."
            }
          </p>
          {pendingDevotionalLesson && (
            <button
              onClick={() => onNavigateToTab('devocionais', pendingDevotionalLesson.id)}
              className="mt-2 text-xs text-[#1A2E44] font-bold underline underline-offset-4 self-start hover:text-[#C5A059] transition-colors cursor-pointer"
            >
              Responder Agora
            </button>
          )}
        </div>
      </div>

      {/* Grid of Stats and Progress Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Progress Summary Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 card-shadow border border-[#F0EDEA] space-y-6 lg:col-span-8 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EEEAE5] pb-4">
              <h3 className="text-[#2D2926] font-serif text-xl font-bold tracking-tight">
                Seu Progresso de estudo
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#F5F2ED] text-[#B45309] font-semibold font-sans">{generalProgressPercent}% concluído</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              
              {/* Lessons Tracker */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8C847C] font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                    <BookOpen size={14} className="text-[#1A2E44]" />
                    Aulas Assistidas
                  </span>
                  <span className="text-[#2D2926] font-extrabold font-mono text-sm">{completedLessonsCount} / {totalLessons}</span>
                </div>
                <div className="w-full h-2 bg-[#F5F2ED] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1A2E44] rounded-full transition-all duration-500"
                    style={{ width: `${lessonsPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Devotionals Tracker */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8C847C] font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                    <Heart size={14} className="text-[#C5A059]" />
                    Devocionais Respondidos
                  </span>
                  <span className="text-[#2D2926] font-extrabold font-mono text-sm">{completedDevotionalsCount} / {totalLessons}</span>
                </div>
                <div className="w-full h-2 bg-[#F5F2ED] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#C5A059] rounded-full transition-all duration-500"
                    style={{ width: `${devotionalsPercent}%` }}
                  ></div>
                </div>
              </div>

            </div>
          </div>

          <div className="border-t border-[#EEEAE5] mt-6 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8C847C]">
            <span className="font-medium">Estudos para ajudar os servos nas dimensões técnicas e espirituais da Igreja.</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1 font-semibold text-green-600"><CheckCircle size={14} /> Ativo</span>
              <span className="flex items-center gap-1 font-mono"><Clock size={14} /> NVI Brasil</span>
            </div>
          </div>
        </div>

        {/* Suggested Next Objective */}
        <div className="bg-white rounded-3xl p-6 md:p-8 card-shadow border border-[#F0EDEA] lg:col-span-4 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8C847C] block">Próxima Etapa</span>
            {pendingDevotionalLesson ? (
              <div className="space-y-2">
                <span className="text-[10px] px-2 py-0.5 bg-[#F5F2ED] rounded-full text-[#B45309] font-bold uppercase tracking-tighter">Pendente</span>
                <h4 className="text-[#2D2926] font-serif text-lg font-bold leading-snug">
                  Responder Devocional de: <span className="italic text-[#1A2E44]">{pendingDevotionalLesson.title}</span>
                </h4>
                <p className="text-[#8C847C] text-xs leading-relaxed font-sans">
                  Você completou o acompanhamento, mas ainda não registrou seus sentimentos em relação a comunicação.
                </p>
              </div>
            ) : recommendedLesson ? (
              <div className="space-y-2">
                <span className="text-[10px] px-2 py-0.5 bg-[#F5F2ED] rounded-full text-[#B45309] font-bold uppercase tracking-tighter">Próxima Aula</span>
                <h4 className="text-[#2D2926] font-serif text-lg font-bold leading-snug">
                  Estudar: <span className="text-[#1A2E44]">{recommendedLesson.title}</span>
                </h4>
                <p className="text-[#8C847C] text-xs leading-relaxed line-clamp-3 font-sans">
                  {recommendedLesson.objective || "Aprofundar sua vida espiritual e técnica para a da comunicação."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <span className="text-[10px] px-2 py-0.5 bg-green-50 rounded-full text-green-700 font-bold uppercase tracking-tighter">Completo</span>
                <h4 className="text-[#2D2926] font-serif text-lg font-bold">Toda a trilha concluída!</h4>
                <p className="text-[#8C847C] text-xs leading-relaxed font-sans">
                  Parabéns por sua dedicação em cumprir as tarefas propostas ao longo desse estudo.
                </p>
              </div>
            )}
          </div>

          <div className="pt-6">
            <button
              onClick={() => {
                if (pendingDevotionalLesson) {
                  onNavigateToTab('devocionais', pendingDevotionalLesson.id);
                } else if (recommendedLesson) {
                  onNavigateToTab('trilha', recommendedLesson.id);
                } else {
                  onNavigateToTab('trilha');
                }
              }}
              className="w-full flex items-center justify-between text-xs font-bold text-[#1A2E44] hover:text-[#C5A059] bg-[#F5F2ED] hover:bg-[#EAE5DF] px-4 py-3 rounded-2xl transition-all cursor-pointer shadow-sm"
            >
              <span>Ir para conteúdo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Next Weekly Live Meeting Panel */}
      <div className="bg-white rounded-3xl p-6 md:p-8 card-shadow border border-[#F0EDEA] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#EEEAE5]">
          <h3 className="text-[#2D2926] font-serif text-xl font-bold tracking-tight flex items-center gap-2">
            <Calendar size={18} className="text-[#C5A059]" />
            <span>Encontros da Comunidade</span>
          </h3>
          <span className="text-xs uppercase tracking-widest text-[#8C847C] font-semibold">Semanal</span>
        </div>

        {nextMeeting ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#F5F2ED] border border-[#EEEAE5] p-6 rounded-3xl">
            <div className="space-y-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase bg-white text-[#B45309] border border-[#EEEAE5]">
                {nextMeeting.type.replaceAll('_', ' ')}
              </span>
              <h4 className="text-[#2D2926] font-serif text-xl font-extrabold">{nextMeeting.title}</h4>
              <p className="text-[#8C847C] text-xs leading-relaxed max-w-2xl">{nextMeeting.description}</p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-[#8C847C]">
                <span className="font-semibold">🕒 {new Date(nextMeeting.startAt).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                {nextMeeting.googleMeetUrl && (
                  <span className="text-[#1A2E44] font-bold font-mono">Meet Disponível</span>
                )}
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onNavigateToTab('reunioes')}
                className="bg-[#1A2E44] hover:bg-opacity-90 text-white font-bold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-sm cursor-pointer"
              >
                Participar do Encontro
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center bg-[#F5F2ED] rounded-3xl border border-[#EEEAE5]">
            <Video size={36} className="text-[#C5A059] mb-3" />
            <h5 className="text-[#2D2926] font-serif font-bold text-md">Nenhuma reunião agendada no momento.</h5>
            <p className="text-xs text-[#8C847C] max-w-xs mt-1">Sua liderança enviará os links e os avisos do Google Meet no grupo de discipulado.</p>
          </div>
        )}
      </div>

    </div>
  );
};
