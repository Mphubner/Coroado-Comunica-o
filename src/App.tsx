import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { checkAndSeedDatabase, healLesson1Video } from './seedData';
import { db, } from './firebase';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';

// Types representation
import { Module, Lesson, Devotional, DevotionalAnswer, LessonProgress, DevotionalProgress, WeeklyMeeting, MeetingAttendance } from './types';

// Importing sub-view modules
import { BottomNav } from './components/BottomNav';
import { ServoDashboard } from './components/ServoDashboard';
import { CurriculumTrail } from './components/CurriculumTrail';
import { InteractiveDevotions } from './components/InteractiveDevotions';
import { LiveMeetings } from './components/LiveMeetings';
import { LeaderPortal } from './components/LeaderPortal';
import { AdministrationPortal } from './components/AdministrationPortal';
import { ProfileConfig } from './components/ProfileConfig';

// Icons library
import { BookOpen, ShieldAlert, Heart, Calendar, Play, LogOut, CheckCircle, Menu, X, Settings, Sparkles } from 'lucide-react';

function AppContent() {
  const { user, loading, loginWithGoogle, logout } = useAuth();
  
  // Navigation tabs state switcher
  const [activeTab, setActiveTab] = useState('inicio');
  const [customSelectedLessonId, setCustomSelectedLessonId] = useState<string | null>(null);
  
  // Completion modal popup state
  const [completionModal, setCompletionModal] = useState<{
    isOpen: boolean;
    type: 'estudo' | 'devocional';
    title: string;
  }>({
    isOpen: false,
    type: 'estudo',
    title: ''
  });

  // Firestore dataset states
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [answers, setAnswers] = useState<DevotionalAnswer[]>([]);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [weeklyMeetings, setWeeklyMeetings] = useState<WeeklyMeeting[]>([]);
  const [meetingAttendance, setMeetingAttendance] = useState<MeetingAttendance[]>([]);

  // Mobile menu visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 1. If an admin logs in, check and seed database automatically if empty
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const runAutoSeed = async () => {
      try {
        await checkAndSeedDatabase();
        await healLesson1Video();
        forceReloadAllDatasets();
      } catch (err) {
        console.error("Auto seeding failed for admin:", err);
      }
    };
    runAutoSeed();
  }, [user]);

  // 2. Real-time lists synchronization loop
  const forceReloadAllDatasets = async () => {
    try {
      // Fetch modules/themes
      const modulesSnap = await getDocs(collection(db, 'modules'));
      setModules(modulesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Module)));

      // Fetch lessons
      const lessonsSnap = await getDocs(collection(db, 'lessons'));
      setLessons(lessonsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Lesson)));

      // Fetch devotionals
      const devotionalsSnap = await getDocs(collection(db, 'devotionals'));
      setDevotionals(devotionalsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Devotional)));

      // Fetch meetings list
      const meetingsSnap = await getDocs(collection(db, 'weeklyMeetings'));
      setWeeklyMeetings(meetingsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as WeeklyMeeting)));
    } catch (err) {
      console.warn("Real-time load warning:", err);
    }
  };

  // 3. User progress loaders which load whenever auth is resolved
  useEffect(() => {
    if (!user || user.status !== 'ativo') return;

    forceReloadAllDatasets();

    // Fetch this user's answers
    const answersQuery = query(collection(db, 'devotionalAnswers'), where('userId', '==', user.uid));
    const unsubscribeAnswers = onSnapshot(answersQuery, (snapshot) => {
      setAnswers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as DevotionalAnswer)));
    });

    // Fetch this user's lesson progress
    const lessonProgQuery = query(collection(db, 'lessonProgress'), where('userId', '==', user.uid));
    const unsubscribeLessonProg = onSnapshot(lessonProgQuery, (snapshot) => {
      setLessonProgress(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as LessonProgress)));
    });

    // Fetch attendance sheet
    const attendQuery = query(collection(db, 'meetingAttendance'), where('userId', '==', user.uid));
    const unsubscribeAttend = onSnapshot(attendQuery, (snapshot) => {
      setMeetingAttendance(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as MeetingAttendance)));
    });

    return () => {
      unsubscribeAnswers();
      unsubscribeLessonProg();
      unsubscribeAttend();
    };
  }, [user]);

  const handleNavigateWithPayload = (tab: string, lessonId?: string) => {
    if (lessonId) {
      setCustomSelectedLessonId(lessonId);
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Rendering Loader screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100 p-6 select-none animate-pulse">
        <div className="w-16 h-16 rounded-full bg-indigo-600 animate-bounce flex items-center justify-center font-extrabold text-2xl text-white shadow-lg shadow-indigo-950/50">
          CC
        </div>
        <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-500 mt-4 font-mono">Consolidando Caminhada...</h2>
      </div>
    );
  }

  // --- PUBLIC LANDING HOME PAGE ---
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 select-none flex flex-col justify-between font-sans">
        
        {/* Navigation header row */}
        <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            {/* Logo da Coroa Circular Branca no lugar do "CC" antigo */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center">
              <img src="/coroa-circulo-branca.png" alt="Coroa" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <div>
              {/* Logo "COROADO" em texto, caso prefira a imagem */}
              <img src="/coroado-texto-branco.png" alt="Coroado Comunicação" className="h-4 object-contain mb-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <span className="font-extrabold text-sm tracking-tight block">Comunicação</span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold block leading-none mt-1">Estudos</span>
            </div>
          </div>
          
          <button
            onClick={loginWithGoogle}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <span>Acessar Estudos</span>
          </button>
        </header>

        {/* Hero Segment */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 border border-zinc-800 text-zinc-300 uppercase tracking-wide">
              {/* Pequena coroa para detalhe */}
              <img src="/coroa-branca.png" alt="Coroa" className="w-3 h-3 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              Ministerio de Comunicação
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Conectamos pessoas a Jesus, discípulos a células e a Igreja à cidade.
            </h1>
            <p className="text-zinc-400 text-sm md:text-md leading-relaxed max-w-xl">
              Uma serie de estudos para servos que desejam comunicar com clareza, servir com excelência e caminhar com maturidade espiritual.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={loginWithGoogle}
                className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs px-6 py-4 rounded-xl transition-all shadow-lg shadow-white/5 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Fazer login</span>
                <Play size={12} fill="currentColor" />
              </button>
            </div>
            
            <p className="text-[10px] text-zinc-600 font-medium">Após o login Google, a equipe de líderes validará seu cadastro em até 24 horas.</p>
          </div>

          {/* Graphical Concept Board */}
          <div className="bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-800 shadow-2xl space-y-6">
            <h3 className="text-white font-extrabold text-md tracking-tight">O que temos por aqui?</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4 p-3 hover:bg-zinc-800/80 rounded-2xl transition-colors">
                <span className="text-xl shrink-0 mt-0.5">📚</span>
                <div>
                  <h4 className="font-bold text-white text-xs">Trilha de estudo</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">Aulas divididas em 5 temas estruturais: espiritualidade, DNA de célula, mordomia criativa e entrega técnica.</p>
                </div>
              </div>

              <div className="flex gap-4 p-3 hover:bg-zinc-800/80 rounded-2xl transition-colors">
                <span className="text-xl shrink-0 mt-0.5">🌱</span>
                <div>
                  <h4 className="font-bold text-white text-xs">Cuidado espiritual</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">Local para devocionais, nivelamento, autoconhecimento e autoliderança</p>
                </div>
              </div>

              <div className="flex gap-4 p-3 hover:bg-zinc-800/80 rounded-2xl transition-colors">
                <span className="text-xl shrink-0 mt-0.5">💬</span>
                <div>
                  <h4 className="font-bold text-white text-xs">Acompanhamento</h4>
                  <p className="text-zinc-400 text-xs leading-relaxed mt-0.5">Canal de acompanhamento para a liderança, e de partilhar com o time.</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer info banner */}
        <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6">
          <div className="max-w-7xl w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-600 font-medium">
            <span>© {new Date().getFullYear()} Igreja Coroado. Todos os direitos reservados.</span>
            <span>Conectamos pessoas a Jesus, discípulos a células e a Igreja à cidade.</span>
          </div>
        </footer>

      </div>
    );
  }

  // --- GATED SCREEN FOR PENDING APPROVAL USERS ---
  if (user && user.status === 'pendente') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 select-none font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 text-center space-y-6 shadow-2xl shadow-zinc-950/80">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
            <ShieldAlert size={24} />
          </div>

          <div className="space-y-2">
            <h2 className="text-zinc-100 font-extrabold text-lg md:text-xl font-sans tracking-tight leading-snug">Seu cadastro foi recebido.</h2>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Damos as boas-vindas à nossa família! A liderança do ministério de comunicação irá liberar seu acesso em breve.
            </p>
          </div>

          <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800/80 space-y-1.5 text-left text-[11px] leading-relaxed text-zinc-400">
            <span className="font-bold text-zinc-200 uppercase tracking-wider block">📝 SEU PERFIL:</span>
            <p>• Nome: <span className="text-zinc-200 font-semibold">{user.displayName}</span></p>
            <p>• E-mail: <span className="text-zinc-200 font-semibold font-mono">{user.email}</span></p>
            <p>• Registrado em: <span className="text-zinc-200 font-semibold">{new Date(user.createdAt).toLocaleDateString()}</span></p>
          </div>

          <div className="pt-2">
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white font-bold transition-colors"
            >
              <LogOut size={14} />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE ACCESS AUTHORIZED SYSTEM WRAPPER ---
  const isLiderOrAdmin = user.role === 'lider' || user.role === 'admin';
  const isAdmin = user.role === 'admin';

  // Find next upcoming meeting dynamically based on chronological date ordering
  const now = new Date();
  const nextUp = weeklyMeetings
    .filter(m => m.status === 'agendada' || m.status === 'ao_vivo' || new Date(m.startAt) >= now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0] || null;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 select-none flex font-sans">
      
      {/* Sidebar navigation for Tablet & Wide screens */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={handleNavigateWithPayload} 
        userProfile={user} 
      />

      {/* Main app panel */}
      <div className="flex-1 flex flex-col relative min-h-screen md:pb-0 pb-16">
        
        {/* Header toolbar banner */}
        <header className="bg-white border-b border-zinc-200/50 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <h2 className="text-zinc-950 font-bold tracking-tight text-sm md:text-md uppercase">
              {activeTab === 'inicio' && "Painel Geral"}
              {activeTab === 'trilha' && "Caminhada Individual"}
              {activeTab === 'devocionais' && "Reflexão no Secreto"}
              {activeTab === 'reunioes' && "Ao Vivo"}
              {activeTab === 'lider-servos' && "Liderança"}
              {activeTab === 'lider-respostas' && "Filtro Devocionais"}
              {activeTab === 'admin-config' && "Super Admin"}
              {activeTab === 'perfil' && "Meu Perfil"}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            {/* Quick logout link button */}
            <button
              onClick={logout}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </header>

        {/* Mobile slide-out overlay drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 md:hidden animate-fade-in" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-64 bg-zinc-900 h-full p-5 flex flex-col justify-between" onClick={e => e.stopPropagation()}>
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center">
                      <img src="/coroa-circulo-branca.png" alt="Coroa" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <div>
                      <img src="/coroado-texto-branco.png" alt="Coroado" className="h-4 object-contain mb-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block leading-none mt-1">Formação</p>
                    </div>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white p-1">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Conteúdos</p>
                  <button
                    onClick={() => handleNavigateWithPayload('inicio')}
                    className={`w-full flex items-center gap-3 py-2 px-3 text-xs font-bold rounded-lg ${
                      activeTab === 'inicio' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                    }`}
                  >
                    <span>Início</span>
                  </button>
                  <button
                    onClick={() => handleNavigateWithPayload('trilha')}
                    className={`w-full flex items-center gap-3 py-2 px-3 text-xs font-bold rounded-lg ${
                      activeTab === 'trilha' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                    }`}
                  >
                    <span>Estudos</span>
                  </button>
                  <button
                    onClick={() => handleNavigateWithPayload('devocionais')}
                    className={`w-full flex items-center gap-3 py-2 px-3 text-xs font-bold rounded-lg ${
                      activeTab === 'devocionais' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                    }`}
                  >
                    <span>Devocional</span>
                  </button>
                  <button
                    onClick={() => handleNavigateWithPayload('reunioes')}
                    className={`w-full flex items-center gap-3 py-2 px-3 text-xs font-bold rounded-lg ${
                      activeTab === 'reunioes' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                    }`}
                  >
                    <span>Reuniões</span>
                  </button>
                  <button
                    onClick={() => handleNavigateWithPayload('perfil')}
                    className={`w-full flex items-center gap-3 py-2 px-3 text-xs font-bold rounded-lg ${
                      activeTab === 'perfil' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                    }`}
                  >
                    <span>Meu Perfil</span>
                  </button>

                  {isLiderOrAdmin && (
                    <>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold pt-4">Liderança</p>
                      <button
                        onClick={() => handleNavigateWithPayload('lider-servos')}
                        className={`w-full flex items-center gap-3 py-2 px-3 text-xs font-bold rounded-lg ${
                          activeTab === 'lider-servos' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                        }`}
                      >
                        <span>Servos</span>
                      </button>
                      <button
                        onClick={() => handleNavigateWithPayload('lider-respostas')}
                        className={`w-full flex items-center gap-3 py-2 px-3 text-xs font-bold rounded-lg ${
                          activeTab === 'lider-respostas' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                        }`}
                      >
                        <span>Respostas</span>
                      </button>
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold pt-4">Controle</p>
                      <button
                        onClick={() => handleNavigateWithPayload('admin-config')}
                        className={`w-full flex items-center gap-3 py-2 px-3 text-xs font-bold rounded-lg ${
                          activeTab === 'admin-config' ? 'bg-indigo-600 text-white' : 'text-zinc-400'
                        }`}
                      >
                        <span>Configurações</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <button
                  onClick={logout}
                  className="w-full text-center py-2 text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-xl"
                >
                  Fazer Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic subview tab viewport router */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'inicio' && (
            <ServoDashboard 
              userProfile={user} 
              modules={modules}
              lessons={lessons} 
              progress={lessonProgress} 
              answers={answers} 
              nextMeeting={nextUp} 
              onNavigateToTab={handleNavigateWithPayload}
            />
          )}

          {activeTab === 'trilha' && (
            <CurriculumTrail 
              userId={user.uid} 
              modules={modules} 
              lessons={lessons} 
              progress={lessonProgress} 
              onRefreshProgress={forceReloadAllDatasets}
              onOpenDevotional={(lId) => handleNavigateWithPayload('devocionais', lId)}
              initiallySelectedLessonId={customSelectedLessonId}
              clearInitialLessonSelection={() => setCustomSelectedLessonId(null)}
              isAdmin={isAdmin}
              onShowCompletion={(title) => {
                setCompletionModal({
                  isOpen: true,
                  type: 'estudo',
                  title
                });
              }}
            />
          )}

          {activeTab === 'devocionais' && (
            <InteractiveDevotions 
              userId={user.uid} 
              userEmail={user.email || ''} 
              devotionals={devotionals} 
              lessons={lessons} 
              modules={modules} 
              answers={answers} 
              onRefreshAnswers={forceReloadAllDatasets}
              initiallySelectedLessonId={customSelectedLessonId}
              clearInitialLessonSelection={() => setCustomSelectedLessonId(null)}
              onShowCompletion={(title) => {
                setCompletionModal({
                  isOpen: true,
                  type: 'devocional',
                  title
                });
              }}
            />
          )}

          {activeTab === 'reunioes' && (
            <LiveMeetings 
              userId={user.uid} 
              userEmail={user.email || ''} 
              userRole={user.role}
              meetings={weeklyMeetings} 
              attendance={meetingAttendance} 
              lessons={lessons} 
              onRefreshMeetings={forceReloadAllDatasets}
            />
          )}

          {/* Leaders sections */}
          {activeTab === 'lider-servos' && isLiderOrAdmin && (
            <LeaderPortal 
              currentLeader={user} 
              lessons={lessons} 
              onRefreshAll={forceReloadAllDatasets}
            />
          )}

          {activeTab === 'lider-respostas' && isLiderOrAdmin && (
            <LeaderPortal 
              currentLeader={user} 
              lessons={lessons} 
              onRefreshAll={forceReloadAllDatasets}
            />
          )}

          {/* Administrators Section */}
          {activeTab === 'admin-config' && isAdmin && (
            <AdministrationPortal 
              currentAdmin={user} 
              onRefreshAll={forceReloadAllDatasets}
            />
          )}

          {activeTab === 'perfil' && (
            <ProfileConfig 
              userProfile={user} 
              progress={lessonProgress} 
              answers={answers} 
            />
          )}
        </main>

        {/* Visual progress celebration popup */}
        {completionModal.isOpen && (
          <div className="fixed inset-0 bg-[#121212]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-white rounded-[2.5rem] border border-[#F0EDEA] shadow-2xl p-8 md:p-10 max-w-sm w-full text-center space-y-6 relative overflow-hidden transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#C5A059] opacity-10 blur-3xl rounded-full translate-x-12 -translate-y-12 pointer-events-none"></div>
              
              <div className="flex flex-col items-center space-y-4">
                {completionModal.type === 'estudo' ? (
                  <div className="w-20 h-20 bg-emerald-500/10 border-4 border-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center shadow-lg transform scale-110">
                    <CheckCircle size={40} className="stroke-[2.5]" />
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-amber-500/10 border-4 border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shadow-lg transform scale-110 animate-pulse">
                    <Heart size={40} className="fill-current stroke-[2.5]" />
                  </div>
                )}
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold font-mono text-[#C5A059] uppercase tracking-widest">
                    {completionModal.type === 'estudo' ? "Estudo Realizado" : "Quietude e Reflexão"}
                  </span>
                  <h2 className="text-[#2D2926] font-serif text-2xl font-bold tracking-tight">
                    {completionModal.type === 'estudo' ? "Estudo Concluido!" : "Devocional Feito!"}
                  </h2>
                </div>
              </div>

              <div className="space-y-3.5 bg-[#FBF9F6] border border-[#F0EDEA] p-5 rounded-2xl">
                <span className="block text-[10px] font-bold font-sans text-[#8C847C] uppercase tracking-wider">
                  {completionModal.type === 'estudo' ? "AULA CONCLUÍDA" : "TÍTULO DO DEVOCIONAL"}
                </span>
                <p className="text-[#1A2E44] font-serif text-md font-bold leading-relaxed">
                  {completionModal.title}
                </p>
              </div>

              <p className="text-xs text-[#8C847C] leading-relaxed max-w-xs mx-auto">
                {completionModal.type === 'estudo' 
                  ? "Você registrou com fidelidade a conclusão desta aula. Continue caminhando em firmeza, obediência e dedicação técnica!" 
                  : "Sua meditação e reflexões secretas foram entregues com sucesso. O discipulado sincero floresce no secreto das suas atitudes."
                }
              </p>

              <button
                onClick={() => setCompletionModal(prev => ({ ...prev, isOpen: false }))}
                className="w-full bg-[#1A2E44] hover:bg-opacity-95 text-[#C5A059] font-sans font-bold text-xs uppercase tracking-wider py-4 rounded-2xl transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Glória a Deus!
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
