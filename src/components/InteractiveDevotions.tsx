import React, { useState } from 'react';
import { Devotional, Lesson, DevotionalAnswer, DevotionalProgress, Module } from '../types';
import { ArrowLeft, CheckCircle, Heart, HeartOff, MessageSquare } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface InteractiveDevotionsProps {
  userId: string;
  userEmail: string;
  devotionals: Devotional[];
  lessons: Lesson[];
  modules: Module[];
  answers: DevotionalAnswer[];
  onRefreshAnswers: () => void;
  // Dashboard or class tab redirects
  initiallySelectedLessonId?: string | null;
  clearInitialLessonSelection?: () => void;
  onShowCompletion?: (devotionalTitle: string) => void;
}

export const InteractiveDevotions: React.FC<InteractiveDevotionsProps> = ({
  userId,
  userEmail,
  devotionals,
  lessons,
  modules,
  answers,
  onRefreshAnswers,
  initiallySelectedLessonId,
  clearInitialLessonSelection,
  onShowCompletion
}) => {
  // If we should load a specific devotional worksheet directly
  const [selectedDevotional, setSelectedDevotional] = useState<Devotional | null>(null);

  // Form input states
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [q4, setQ4] = useState('');
  const [q5, setQ5] = useState<'sim' | 'nao'>('nao');

  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedDevotional) {
      const existingAns = answers.find(a => a.devotionalId === selectedDevotional.id);
      if (existingAns) {
        setQ1(existingAns.answers.q1 || '');
        setQ2(existingAns.answers.q2 || '');
        setQ3(existingAns.answers.q3 || '');
        setQ4(existingAns.answers.q4 || '');
        setQ5(existingAns.answers.q5 || 'nao');
      } else {
        setQ1(''); setQ2(''); setQ3(''); setQ4(''); setQ5('nao');
      }
    }
  }, [selectedDevotional, answers]);

  // Directly select devotional if routed
  React.useEffect(() => {
    if (initiallySelectedLessonId) {
      const devMatch = devotionals.find(d => d.lessonId === initiallySelectedLessonId);
      if (devMatch) {
        setSelectedDevotional(devMatch);
      }
      if (clearInitialLessonSelection) clearInitialLessonSelection();
    }
  }, [initiallySelectedLessonId, devotionals, clearInitialLessonSelection]);

  // Find related lesson title
  const getLessonTitle = (lessonId: string) => {
    const original = lessons.find(l => l.id === lessonId);
    return original ? original.title : 'Aula Geral';
  };

  // Find index number of lesson
  const getLessonOrder = (lessonId: string) => {
    const original = lessons.find(l => l.id === lessonId);
    return original ? original.order : 1;
  };

  // Save the devotional reflection sheet
  const handleSubmitReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevotional || saving) return;

    if (!q1.trim() || !q2.trim() || !q3.trim() || !q4.trim()) {
      alert("Por favor, preencha todas as perguntas abertas antes de enviar.");
      return;
    }

    setSaving(true);
    setToastMessage(null);

    const relatedLesson = lessons.find(l => l.id === selectedDevotional.lessonId);
    const answerId = `${userId}_${selectedDevotional.id}`;
    const answerRef = doc(db, 'devotionalAnswers', answerId);
    
    const existingAnswer = answers.find(a => a.devotionalId === selectedDevotional.id);

    const answerPayload: DevotionalAnswer = {
      userId,
      userEmail,
      devotionalId: selectedDevotional.id || '',
      lessonId: selectedDevotional.lessonId,
      moduleId: relatedLesson?.moduleId || 'dev',
      answers: { q1, q2, q3, q4, q5 },
      wantsLeaderConversation: q5 === 'sim',
      status: existingAnswer ? existingAnswer.status : 'nova',
      createdAt: existingAnswer ? existingAnswer.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Also update devotional progress tracking
    const progressId = `${userId}_${selectedDevotional.id}`;
    const progressRef = doc(db, 'devotionalProgress', progressId);

    const progressPayload: DevotionalProgress = {
      userId,
      devotionalId: selectedDevotional.id || '',
      lessonId: selectedDevotional.lessonId,
      status: 'respondido',
      answeredAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(answerRef, answerPayload);
      await setDoc(progressRef, progressPayload);
      onRefreshAnswers();
      if (onShowCompletion) {
        onShowCompletion(selectedDevotional.title);
      } else {
        setToastMessage("Resposta enviada. Sua liderança poderá caminhar com você a partir disso.");
        setTimeout(() => setToastMessage(null), 8500);
      }
      setSelectedDevotional(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `devotionalAnswers/${answerId}`);
    } finally {
      setSaving(false);
    }
  }  // View devotional sheet
  if (selectedDevotional) {
    const hasBeenResponded = answers.some(a => a.devotionalId === selectedDevotional.id);

    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-fade-in relative pb-16 text-[#2D2926]">
        
        <button
          onClick={() => setSelectedDevotional(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C847C] hover:text-[#1A2E44] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Voltar para Devocionais</span>
        </button>

        <div className="space-y-1.5">
          <span className="text-[10px] bg-[#F5F2ED] text-[#B45309] font-bold px-2.5 py-1 rounded-full border border-[#EEEAE5] uppercase font-mono tracking-wider">
            MEDITAÇÃO DO CAMINHO
          </span>
          <h1 className="text-[#2D2926] font-serif font-bold text-2xl tracking-tight leading-snug">{selectedDevotional.title}</h1>
          <p className="text-[#8C847C] text-xs font-semibold">Vinculado a: {getLessonTitle(selectedDevotional.lessonId)}</p>
        </div>

        {/* Section of Meditation Details */}
        <div className="bg-white rounded-3xl border border-[#F0EDEA] card-shadow p-6 md:p-8 space-y-6">
          
          <div className="space-y-2">
            <h3 className="text-[#1A2E44] font-semibold text-[10px] uppercase tracking-widest flex items-center gap-1">
              📖 Texto para Meditar (Versão NVI)
            </h3>
            <p className="text-[#B45309] font-serif font-bold text-md tracking-wide bg-[#F5F2ED] p-4 rounded-2xl border border-[#EEEAE5]">
              {selectedDevotional.bibleReference}
            </p>
            <p className="text-[#8C847C] text-xs leading-relaxed font-sans">
              {selectedDevotional.readingInstruction || "Abra sua Bíblia física ou aplicativo nesta referência e estude com o coração aberto."}
            </p>
          </div>

          <div className="border-t border-[#F0EDEA] pt-5 space-y-2">
            <h3 className="text-[#1A2E44] font-semibold text-[10px] uppercase tracking-widest">💡 Meditação Guiada</h3>
            <p className="text-[#2D2926] text-sm leading-relaxed whitespace-pre-wrap italic font-sans">
              "{selectedDevotional.guidedMeditation}"
            </p>
          </div>

          <div className="border-t border-[#F0EDEA] pt-5 space-y-2">
            <h3 className="text-[#1A2E44] font-semibold text-[10px] uppercase tracking-widest">🙏 Oração Recomendada</h3>
            <p className="text-[#8C847C] text-sm leading-relaxed whitespace-pre-wrap bg-[#F5F2ED]/55 p-4 rounded-2xl border border-dashed border-[#EEEAE5] font-sans">
              {selectedDevotional.suggestedPrayer}
            </p>
          </div>

          <div className="border-t border-[#F0EDEA] pt-5 space-y-2">
            <h3 className="text-[#B45309] font-semibold text-[10px] uppercase tracking-widest">🌱 Prática da Semana</h3>
            <p className="text-[#2D2926] text-sm leading-relaxed font-semibold bg-[#F5F2ED] border border-[#EEEAE5] p-4 rounded-2xl font-sans">
              {selectedDevotional.weeklyPractice}
            </p>
          </div>

        </div>

        {/* Questionnaire Form */}
        <div className="bg-white rounded-3xl border border-[#F0EDEA] card-shadow p-6 md:p-8">
          <div className="border-b border-[#F0EDEA] pb-4 mb-6">
            <h2 className="text-[#2D2926] font-serif font-bold text-lg">Suas Reflexões Pastorais</h2>
            <p className="text-[#8C847C] text-xs mt-0.5 font-sans">Siga o roteiro de perguntas para consolidar o estudo no coração e partilhar seu progresso.</p>
          </div>

          {hasBeenResponded && (
            <div className="bg-[#F5F2ED] border border-[#EEEAE5] rounded-2xl p-4 mb-6 text-xs text-[#B45309] flex items-start gap-2.5">
              <span>🌾</span>
              <div>
                <span className="font-bold font-serif">Aviso de Resposta Existente:</span>
                <p className="mt-0.5">Você já respondeu a este devocional. Se você atualizar os campos e reenviar, uma nova versão será salva e ficará disponível para o acompanhamento dos de líderes.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitReflection} className="space-y-6">
            
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A2E44]">
                1. Qual palavra ou frase chamou sua atenção no devocional? *
              </label>
              <textarea
                value={q1}
                onChange={e => setQ1(e.target.value)}
                placeholder="Explicite o versículo bíblico ou frase que saltou aos olhos durante a quietude..."
                rows={3}
                required
                className="w-full text-sm bg-[#F5F2ED]/45 focus:bg-white text-[#2D2926] px-4 py-3 rounded-2xl border border-[#EEEAE5] focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] focus:outline-none transition-all placeholder:text-[#8C847C] font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A2E44]">
                2. O que Deus está confrontando ou formando em seu caráter através deste tema? *
              </label>
              <textarea
                value={q2}
                onChange={e => setQ2(e.target.value)}
                placeholder="Partilhe de que forma o conteúdo ensinado desafia seus pensamentos ou atitudes cotidianas..."
                rows={3}
                required
                className="w-full text-sm bg-[#F5F2ED]/45 focus:bg-white text-[#2D2926] px-4 py-3 rounded-2xl border border-[#EEEAE5] focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] focus:outline-none transition-all placeholder:text-[#8C847C] font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A2E44]">
                3. Qual decisão ou mudança prática você quer adotar esta semana? *
              </label>
              <textarea
                value={q3}
                onChange={e => setQ3(e.target.value)}
                placeholder="Redija um ato concreto e viável baseado neste estudo..."
                rows={3}
                required
                className="w-full text-sm bg-[#F5F2ED]/45 focus:bg-white text-[#2D2926] px-4 py-3 rounded-2xl border border-[#EEEAE5] focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] focus:outline-none transition-all placeholder:text-[#8C847C] font-sans"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A2E44]">
                4. Escreva uma oração curta (2 a 3 linhas) baseada na meditação de hoje *
              </label>
              <textarea
                value={q4}
                onChange={e => setQ4(e.target.value)}
                placeholder="Consagre suas dúvidas e suas decisões finais em forma de oração..."
                rows={3}
                required
                className="w-full text-sm bg-[#F5F2ED]/45 focus:bg-white text-[#2D2926] px-4 py-3 rounded-2xl border border-[#EEEAE5] focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] focus:outline-none transition-all placeholder:text-[#8C847C] font-sans"
              />
            </div>

            <div className="space-y-3 p-4 bg-[#F5F2ED] border border-[#EEEAE5] rounded-2xl">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#1A2E44] flex items-center gap-1">
                <MessageSquare size={14} className="text-[#C5A059]" />
                Deseja conversar com um líder sobre essa resposta ou sobre seu chamado?
              </span>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-[#2D2926]">
                  <input
                    type="radio"
                    name="wantsTalk"
                    checked={q5 === 'sim'}
                    onChange={() => setQ5('sim')}
                    className="text-[#1A2E44] accent-[#1A2E44] focus:ring-[#1A2E44]"
                  />
                  <span>Sim, gostaria de conversar ou tirar dúvidas</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-[#2D2926]">
                  <input
                    type="radio"
                    name="wantsTalk"
                    checked={q5 === 'nao'}
                    onChange={() => setQ5('nao')}
                    className="text-[#1A2E44] accent-[#1A2E44] focus:ring-[#1A2E44]"
                  />
                  <span>Não há necessidade no momento</span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#1A2E44] hover:bg-opacity-95 disabled:bg-zinc-300 text-white font-bold text-xs px-5 py-3.5 rounded-2xl transition-all shadow-sm cursor-pointer"
              >
                {saving ? "Registrando respostas no Firestore..." : "Enviar resposta devocional"}
              </button>
            </div>

          </form>
        </div>

      </div>
    );
  }

  // Sort devotionals according to theme (module) order first, and then lesson order
  const sortedDevotionals = [...devotionals].sort((a, b) => {
    const lessonA = lessons.find(l => l.id === a.lessonId);
    const lessonB = lessons.find(l => l.id === b.lessonId);
    
    const mOrderA = lessonA ? (modules.find(m => m.id === lessonA.moduleId)?.order ?? 999) : 999;
    const mOrderB = lessonB ? (modules.find(m => m.id === lessonB.moduleId)?.order ?? 999) : 999;
    
    if (mOrderA !== mOrderB) {
      return mOrderA - mOrderB;
    }
    
    const lOrderA = lessonA ? lessonA.order : 999;
    const lOrderB = lessonB ? lessonB.order : 999;
    
    return lOrderA - lOrderB;
  });

  // Render Devotional List
  return (
    <div className="space-y-6 select-none animate-fade-in text-[#2D2926]">
      
      {toastMessage && (
        <div className="bg-[#1A2E44] border border-[#C5A059] text-white p-4 rounded-2xl text-xs mb-4">
          🌻 {toastMessage}
        </div>
      )}

      <div className="space-y-1.55">
        <h1 className="text-[#2D2926] font-serif font-bold text-2xl md:text-3xl tracking-tight leading-snug">Seus Devocionais</h1>
        <p className="text-[#8C847C] text-sm font-sans">Examine o andamento das suas reflexões secretas. O discipulado acontece no secreto das suas atitudes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedDevotionals.map(dev => {
          const hasAnswered = answers.some(a => a.devotionalId === dev.id);
          const lesson = lessons.find(l => l.id === dev.lessonId);
          const mod = lesson ? modules.find(m => m.id === lesson.moduleId) : null;
          const themePrefix = mod ? (mod.title.match(/Tema\s*\d+/i)?.[0] || mod.title.split(' - ')[0]) : 'Tema';
          const orderNum = lesson ? lesson.order : 1;

          return (
            <div 
              key={dev.id}
              onClick={() => {
                setSelectedDevotional(dev);
                const exAns = answers.find(a => a.devotionalId === dev.id);
                if (exAns) {
                  setQ1(exAns.answers.q1 || '');
                  setQ2(exAns.answers.q2 || '');
                  setQ3(exAns.answers.q3 || '');
                  setQ4(exAns.answers.q4 || '');
                  setQ5(exAns.answers.q5 || 'nao');
                } else {
                  setQ1(''); setQ2(''); setQ3(''); setQ4(''); setQ5('nao');
                }
              }}
              className="bg-white hover:bg-[#F5F2ED]/45 border border-[#F0EDEA] hover:border-[#C5A059] p-6 rounded-3xl card-shadow cursor-pointer transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold font-mono text-[#C5A059] uppercase bg-[#FBF9F6] border border-[#F0EDEA] px-2.5 py-1 rounded-full">
                    {themePrefix.toUpperCase()} • AULA {String(orderNum).padStart(2, '0')}
                  </span>
                  {hasAnswered ? (
                    <span className="flex items-center gap-1 text-[10px] bg-[#F5F2ED] text-[#B45309] font-bold px-2.5 py-1 rounded-full border border-[#EEEAE5]">
                      <Heart size={10} className="fill-current" /> Respondido
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] bg-zinc-150 text-[#8C847C] font-semibold px-2.5 py-1 rounded-full">
                      <HeartOff size={10} /> Pendente
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-[#2D2926] font-serif font-bold text-lg leading-tight">{dev.title}</h3>
                  <p className="text-[#8C847C] text-xs font-semibold truncate mt-2 font-mono">Ref: {dev.bibleReference}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-[#1A2E44] pt-4 border-t border-[#F0EDEA]">
                <span>{hasAnswered ? "Rever respostas" : "Preencher reflexão"}</span>
                <ArrowLeft size={14} className="rotate-180 text-[#C5A059]" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
