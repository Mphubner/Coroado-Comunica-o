import React, { useState, useEffect } from 'react';
import { UserProfile, PlatformSettings, Module, Lesson, Devotional } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, getDocs, updateDoc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { 
  Users, Shield, Check, X, RefreshCw, Layers, Sliders, Mail, MessageSquare,
  Plus, Edit, Trash, BookOpen, FileText, ChevronRight, Eye, Video, Save, 
  Trash2, AlertTriangle, HelpCircle, FileVideo, Book, Heart, Sparkles, CheckSquare
} from 'lucide-react';
import { forceSeedDatabase } from '../seedData';
import { DriveCourseImporter } from './DriveCourseImporter';

interface AdministrationPortalProps {
  currentAdmin: UserProfile;
  onRefreshAll: () => void;
}

export const AdministrationPortal: React.FC<AdministrationPortalProps> = ({
  currentAdmin,
  onRefreshAll
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'approvals' | 'curriculum' | 'settings'>('approvals');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  // Platform setting states
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [name, setName] = useState('CRD COMM');
  const [mainPhrase, setMainPhrase] = useState('Conectamos pessoas a Jesus, discípulos a células e a Igreja à cidade.');
  const [supportPhrase, setSupportPhrase] = useState('Tudo quanto fizerdes, por palavra ou por obra, fazei tudo em nome do Senhor Jesus."  — Colossenses 3:17');
  const [contactEmail, setContactEmail] = useState('marcospereirahubner@gmail.com');
  const [savingSettings, setSavingSettings] = useState(false);
  
  // Custom inline messages to avoid window.alert
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // --- Theme (Module) Management States ---
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [savingModule, setSavingModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');
  const [moduleOrder, setModuleOrder] = useState('1');
  const [moduleActive, setModuleActive] = useState(true);
  const [confirmDeleteModuleId, setConfirmDeleteModuleId] = useState<string | null>(null);

  // --- Lesson & Devotional Management States ---
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);
  const [confirmDeleteLessonId, setConfirmDeleteLessonId] = useState<string | null>(null);

  // Lesson Fields
  const [lessonModuleId, setLessonModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonOrder, setLessonOrder] = useState('1');
  const [lessonObjective, setLessonObjective] = useState('');
  const [lessonBibleReferences, setLessonBibleReferences] = useState('');
  const [lessonOpeningQuestion, setLessonOpeningQuestion] = useState('');
  const [lessonSummary, setLessonSummary] = useState('');
  const [lessonYoutubeUrl, setLessonYoutubeUrl] = useState('');
  const [lessonDriveDocUrl, setLessonDriveDocUrl] = useState('');
  const [lessonDriveSlideUrl, setLessonDriveSlideUrl] = useState('');
  const [lessonActive, setLessonActive] = useState(true);

  // Devotional Companion Fields
  const [devTitle, setDevTitle] = useState('');
  const [devBibleReference, setDevBibleReference] = useState('');
  const [devReadingInstruction, setDevReadingInstruction] = useState('');
  const [devGuidedMeditation, setDevGuidedMeditation] = useState('');
  const [devSuggestedPrayer, setDevSuggestedPrayer] = useState('');
  const [devWeeklyPractice, setDevWeeklyPractice] = useState('');
  const [devActive, setDevActive] = useState(true);

  const fetchAdminAssets = async () => {
    try {
      setLoading(true);

      // Fetch all user accounts
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => d.data() as UserProfile));

      // Fetch all themes (modules)
      const modulesSnap = await getDocs(collection(db, 'modules'));
      setModules(modulesSnap.docs.map(d => ({ ...d.data(), id: d.id } as Module)));

      // Fetch all lessons
      const lessonsSnap = await getDocs(collection(db, 'lessons'));
      setLessons(lessonsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Lesson)));

      // Fetch all devotionals
      const devotionalsSnap = await getDocs(collection(db, 'devotionals'));
      setDevotionals(devotionalsSnap.docs.map(d => ({ ...d.data(), id: d.id } as Devotional)));

      // Fetch platform visual configurations
      const settingsSnap = await getDocs(collection(db, 'platformSettings'));
      if (!settingsSnap.empty) {
        const docObj = settingsSnap.docs[0];
        setSettingsId(docObj.id);
        const data = docObj.data() as PlatformSettings;
        setName(data.name || 'Coroado Comunicação');
        setMainPhrase(data.mainPhrase || '');
        setSupportPhrase(data.supportPhrase || '');
        setContactEmail(data.contactEmail || '');
      }
    } catch (err) {
      console.error("Admin dashboard asset loader failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminAssets();
  }, []);

  // Show inline message briefly
  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 5000);
  };

  // Helper extractor for Youtube
  const extractYoutubeVideoId = (url: string): string | undefined => {
    if (!url) return undefined;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : undefined;
  };

  // --- USER ACCOUNT MUTATIONS ---
  const handleApproveUser = async (uid: string, status: 'ativo' | 'pausado' | 'bloqueado', role?: 'servo' | 'lider' | 'admin') => {
    const userRef = doc(db, 'users', uid);
    const updates: Partial<UserProfile> = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (role) {
      updates.role = role;
    }

    try {
      await updateDoc(userRef, updates);
      fetchAdminAssets();
      onRefreshAll();
      triggerFeedback("Ação salva com sucesso!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  };

  // --- SEED DATABASE ---
  const handleTriggerSeeding = async () => {
    if (seeding) return;
    setSeeding(true);
    setSeedSuccess(false);
    try {
      await forceSeedDatabase();
      setSeedSuccess(true);
      fetchAdminAssets();
      onRefreshAll();
    } catch (err) {
      triggerFeedback("Falha ao semear banco de dados: " + String(err));
    } finally {
      setSeeding(false);
    }
  };

  // --- SAVE PLATFORM SETTINGS ---
  const handleSavePlatformSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    const payload: PlatformSettings = {
      name,
      mainPhrase,
      supportPhrase,
      contactEmail
    };

    try {
      if (settingsId) {
        const ref = doc(db, 'platformSettings', settingsId);
        await updateDoc(ref, payload as any);
      } else {
        const colRef = collection(db, 'platformSettings');
        await addDoc(colRef, payload);
      }
      triggerFeedback("Configurações visuais atualizadas!");
      fetchAdminAssets();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `platformSettings/${settingsId}`);
    } finally {
      setSavingSettings(false);
    }
  };


  // --- MODULE (TEMA) CRUD FUNCTIONS ---
  const handleOpenModuleCreate = () => {
    setEditingModule(null);
    setModuleTitle('');
    setModuleDescription('');
    setModuleOrder(String(modules.length + 1));
    setModuleActive(true);
    setShowModuleForm(true);
  };

  const handleOpenModuleEdit = (mod: Module) => {
    setEditingModule(mod);
    setModuleTitle(mod.title || '');
    setModuleDescription(mod.description || '');
    setModuleOrder(String(mod.order || 1));
    setModuleActive(mod.active !== false);
    setShowModuleForm(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle) return;
    setSavingModule(true);

    const payload: Partial<Module> = {
      title: moduleTitle,
      description: moduleDescription,
      order: Number(moduleOrder),
      active: moduleActive,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingModule && editingModule.id) {
        const mRef = doc(db, 'modules', editingModule.id);
        await updateDoc(mRef, payload);
        triggerFeedback(`Tema "${moduleTitle}" atualizado com sucesso.`);
      } else {
        const colRef = collection(db, 'modules');
        const newPayload = {
          ...payload,
          createdAt: new Date().toISOString()
        };
        await addDoc(colRef, newPayload);
        triggerFeedback(`Novo Tema "${moduleTitle}" criado com sucesso!`);
      }
      setShowModuleForm(false);
      fetchAdminAssets();
      onRefreshAll();
    } catch (err) {
      console.error("Error saving theme/module:", err);
      triggerFeedback("Erro ao gravar tema no banco.");
    } finally {
      setSavingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    try {
      await deleteDoc(doc(db, 'modules', moduleId));
      triggerFeedback("Tema excluído definitivamente.");
      setConfirmDeleteModuleId(null);
      fetchAdminAssets();
      onRefreshAll();
    } catch (err) {
      console.error("Error deleting theme:", err);
      triggerFeedback("Falha ao salvar exclusão.");
    }
  };


  // --- LESSON & DEVOTIONAL CRUD FUNCTIONS ---
  const handleOpenLessonCreate = (initialModuleId = '') => {
    setEditingLesson(null);
    setLessonModuleId(initialModuleId || (modules[0]?.id || ''));
    setLessonTitle('');
    setLessonOrder(String(lessons.filter(l => l.moduleId === initialModuleId).length + 1));
    setLessonObjective('');
    setLessonBibleReferences('');
    setLessonOpeningQuestion('');
    setLessonSummary('');
    setLessonYoutubeUrl('');
    setLessonDriveDocUrl('');
    setLessonDriveSlideUrl('');
    setLessonActive(true);

    // Reset Companion Devotional fields too
    setDevTitle('');
    setDevBibleReference('');
    setDevReadingInstruction('');
    setDevGuidedMeditation('');
    setDevSuggestedPrayer('');
    setDevWeeklyPractice('');
    setDevActive(true);

    setShowLessonForm(true);
  };

  const handleOpenLessonEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonModuleId(lesson.moduleId || '');
    setLessonTitle(lesson.title || '');
    setLessonOrder(String(lesson.order || 1));
    setLessonObjective(lesson.objective || '');
    setLessonBibleReferences(lesson.bibleReferences || '');
    setLessonOpeningQuestion(lesson.openingQuestion || '');
    setLessonSummary(lesson.summary || '');
    setLessonYoutubeUrl(lesson.youtubeUrl || '');
    setLessonDriveDocUrl(lesson.driveDocUrl || '');
    setLessonDriveSlideUrl(lesson.driveSlideUrl || '');
    setLessonActive(lesson.active !== false);

    // Load companion devotional if exists, or start with default placeholder values
    const comp = devotionals.find(d => d.lessonId === lesson.id);
    if (comp) {
      setDevTitle(comp.title || '');
      setDevBibleReference(comp.bibleReference || '');
      setDevReadingInstruction(comp.readingInstruction || '');
      setDevGuidedMeditation(comp.guidedMeditation || '');
      setDevSuggestedPrayer(comp.suggestedPrayer || '');
      setDevWeeklyPractice(comp.weeklyPractice || '');
      setDevActive(comp.active !== false);
    } else {
      setDevTitle(`Devocional - ${lesson.title}`);
      setDevBibleReference('');
      setDevReadingInstruction('');
      setDevGuidedMeditation('');
      setDevSuggestedPrayer('');
      setDevWeeklyPractice('');
      setDevActive(true);
    }

    setShowLessonForm(true);
  };

  const handleSaveLessonAndDevotional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle || !lessonModuleId || !lessonOrder) return;
    setSavingLesson(true);

    const parsedVideoId = lessonYoutubeUrl ? extractYoutubeVideoId(lessonYoutubeUrl) : '';

    const lessonPayload: Partial<Lesson> = {
      moduleId: lessonModuleId,
      title: lessonTitle,
      order: Number(lessonOrder),
      objective: lessonObjective,
      bibleReferences: lessonBibleReferences,
      openingQuestion: lessonOpeningQuestion,
      summary: lessonSummary,
      youtubeUrl: lessonYoutubeUrl,
      youtubeVideoId: parsedVideoId || '',
      driveDocUrl: lessonDriveDocUrl,
      driveSlideUrl: lessonDriveSlideUrl,
      active: lessonActive,
      updatedAt: new Date().toISOString()
    };

    try {
      let savedLessonId = editingLesson?.id || '';

      if (editingLesson && editingLesson.id) {
        const lessonRef = doc(db, 'lessons', editingLesson.id);
        await updateDoc(lessonRef, lessonPayload);
      } else {
        const colRef = collection(db, 'lessons');
        const docRef = await addDoc(colRef, {
          ...lessonPayload,
          createdAt: new Date().toISOString()
        });
        savedLessonId = docRef.id;
      }

      // Safe save companion devotional
      const comp = devotionals.find(d => d.lessonId === savedLessonId);
      const devotionalPayload = {
        lessonId: savedLessonId,
        title: devTitle || `Devocional - ${lessonTitle}`,
        bibleReference: devBibleReference,
        readingInstruction: devReadingInstruction,
        guidedMeditation: devGuidedMeditation,
        suggestedPrayer: devSuggestedPrayer,
        weeklyPractice: devWeeklyPractice,
        active: devActive,
        updatedAt: new Date().toISOString()
      };

      if (comp && comp.id) {
        const devRef = doc(db, 'devotionals', comp.id);
        await updateDoc(devRef, devotionalPayload);
      } else {
        await addDoc(collection(db, 'devotionals'), {
          ...devotionalPayload,
          createdAt: new Date().toISOString()
        });
      }

      triggerFeedback(`Aula e Devocional "${lessonTitle}" gravados com absoluto sucesso!`);
      setShowLessonForm(false);
      fetchAdminAssets();
      onRefreshAll();
    } catch (err) {
      console.error("Error saving lesson and devotional:", err);
      triggerFeedback("Erro ao sincronizar informações com o Firebase.");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
      
      const comp = devotionals.find(d => d.lessonId === lessonId);
      if (comp && comp.id) {
        await deleteDoc(doc(db, 'devotionals', comp.id));
      }

      triggerFeedback("Aula e devocional associado apagados com êxito.");
      setConfirmDeleteLessonId(null);
      fetchAdminAssets();
      onRefreshAll();
    } catch (err) {
      console.error("Error deleting lesson:", err);
      triggerFeedback("Erro ao remover aula.");
    }
  };


  const pendingList = users.filter(u => u.status === 'pendente');

  if (loading) {
    return (
      <div className="p-16 text-center text-xs text-[#8C847C] font-semibold font-sans flex flex-col items-center justify-center gap-2">
        <RefreshCw className="animate-spin text-[#C5A059]" size={24} />
        <span>Carregando Central de Administração Pastoral...</span>
      </div>
    );
  }

  // Group lessons by module for absolute pristine visualization
  const getLessonsInModule = (modId: string) => {
    return lessons
      .filter(l => l.moduleId === modId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  return (
    <div className="space-y-8 select-none animate-fade-in pb-24 text-[#2D2926]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EEEAE5]/50 pb-4">
        <div className="space-y-1">
          <h1 className="text-[#2D2926] font-serif font-bold text-2xl md:text-3xl tracking-tight leading-snug">Painel de Administração</h1>
          <p className="text-[#8C847C] text-sm font-sans">Gerencie aprovações de membros, crie novos temas e edite todas as aulas da trilha pedagógica.</p>
        </div>
        
        {/* Quick Tabs Selector */}
        <div className="flex bg-[#F5F2ED] p-1 rounded-xl border border-[#EEEAE5] text-xs font-sans font-bold">
          <button
            onClick={() => setActiveAdminTab('approvals')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeAdminTab === 'approvals' 
                ? 'bg-white text-[#1A2E44] shadow-sm' 
                : 'text-[#8C847C] hover:text-[#2D2926]'
            }`}
          >
            <Users size={14} />
            <span>Contas</span>
            {pendingList.length > 0 && (
              <span className="bg-amber-600 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full leading-none">
                {pendingList.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveAdminTab('curriculum')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeAdminTab === 'curriculum' 
                ? 'bg-white text-[#1A2E44] shadow-sm' 
                : 'text-[#8C847C] hover:text-[#2D2926]'
            }`}
          >
            <BookOpen size={14} />
            <span>Currículo (Temas & Aulas)</span>
          </button>
          
          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeAdminTab === 'settings' 
                ? 'bg-white text-[#1A2E44] shadow-sm' 
                : 'text-[#8C847C] hover:text-[#2D2926]'
            }`}
          >
            <Sliders size={14} />
            <span>Configurações</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-[#1A2E44] text-white font-bold p-4 rounded-2xl text-xs flex items-center justify-between shadow-lg animate-fade-in border border-[#C5A059]/40">
          <span>🔔 {feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-[#C5A059] font-extrabold hover:text-white ml-2 cursor-pointer">X</button>
        </div>
      )}


      {/* ==================== TAB 1: ACCOUNTS APPROVAL & ROLES ==================== */}
      {activeAdminTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#F0EDEA] p-6 md:p-8 card-shadow space-y-4">
            <h3 className="text-[#2D2926] font-serif font-bold text-lg flex items-center gap-2 border-b border-[#F0EDEA] pb-3">
              <Shield size={18} className="text-[#C5A059]" />
              <span>Fila de Liberação de Cadastros</span>
              <span className="text-[10px] bg-[#F5F2ED] text-[#B45309] border border-[#EEEAE5] px-2.5 py-1 rounded-full font-mono font-bold leading-none">{pendingList.length}</span>
            </h3>
            <p className="text-[#8C847C] text-xs leading-relaxed font-sans max-w-xl">
              Novos usuários autenticados via conta Google entram como "pendente" para resguardo pastoral. Eles passam a visualizar o ambiente de estudo integral assim que autorizados por um administrador.
            </p>

            {pendingList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {pendingList.map(pending => (
                  <div 
                    key={pending.uid} 
                    className="bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {pending.photoURL ? (
                        <img src={pending.photoURL} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#EEEAE5]" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#1A2E44] text-white flex items-center justify-center font-bold">
                          {pending.displayName?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-bold text-[#2D2926] truncate font-serif">{pending.displayName}</p>
                        <p className="text-[10px] text-[#8C847C] truncate font-mono">{pending.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3 border-t border-[#EEEAE5]">
                      <button
                        onClick={() => handleApproveUser(pending.uid, 'ativo', 'servo')}
                        className="flex-1 bg-[#1A2E44] hover:bg-opacity-95 text-white font-bold text-[10px] py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Check size={12} />
                        <span>Aprovar Servo</span>
                      </button>
                      <button
                        onClick={() => handleApproveUser(pending.uid, 'ativo', 'lider')}
                        className="flex-1 bg-[#C5A059] hover:bg-opacity-95 text-[#1A2E44] font-bold text-[10px] py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Shield size={10} />
                        <span>Aprovar Líder</span>
                      </button>
                      <button
                        onClick={() => handleApproveUser(pending.uid, 'bloqueado')}
                        className="p-2 border border-[#EEEAE5] text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[#EEEAE5] rounded-3xl py-12 text-center text-xs text-[#8C847C] font-semibold bg-[#F5F2ED]/25">
                🌳 Não há inscrições pendentes aguardando aprovação no momento.
              </div>
            )}
          </div>

          {/* Database registered users list */}
          <div className="bg-white rounded-3xl border border-[#F0EDEA] p-6 md:p-8 card-shadow space-y-4">
            <h3 className="text-[#2D2926] font-serif font-bold text-lg">Membros Cadastrados ({users.length})</h3>
            <p className="text-[#8C847C] text-xs font-sans mt-0.5">Visão geral rápida e possibilidade de trocar perfis de permissão sem complicação ministerial.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#EEEAE5] text-[#8C847C] font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">Servo / Email</th>
                    <th className="py-3 px-2">Nível</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDEA]">
                  {users.map(u => (
                    <tr key={u.uid} className="hover:bg-stone-50 transition-colors">
                      <td className="py-3 px-2 flex items-center gap-2">
                        {u.photoURL ? (
                          <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full border border-[#EEEAE5]" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-[#1A2E44] text-white flex items-center justify-center font-bold font-serif text-xs">{u.displayName?.charAt(0) || 'S'}</div>
                        )}
                        <div className="max-w-[180px] sm:max-w-xs truncate">
                          <p className="font-bold text-[#2D2926] truncate">{u.displayName}</p>
                          <p className="text-[10px] text-[#8C847C] font-mono truncate">{u.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-indigo-150 text-indigo-700' :
                          u.role === 'lider' ? 'bg-amber-100 text-amber-700' :
                          'bg-stone-150 text-stone-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`font-semibold ${u.status === 'ativo' ? 'text-green-600' : 'text-stone-500'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="inline-flex gap-1.5">
                          {u.role !== 'admin' && (
                            <button
                              onClick={() => handleApproveUser(u.uid, u.status, u.role === 'lider' ? 'servo' : 'lider')}
                              className="bg-[#F5F2ED] hover:bg-[#EEEAE5] text-[#1A2E44] border border-[#EEEAE5] font-bold text-[9px] px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              Tornar {u.role === 'lider' ? 'Servo' : 'Líder'}
                            </button>
                          )}
                          
                          {u.status === 'ativo' ? (
                            <button
                              onClick={() => handleApproveUser(u.uid, 'pausado')}
                              className="text-stone-605 text-[9px] hover:underline cursor-pointer"
                            >
                              Pausar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApproveUser(u.uid, 'ativo')}
                              className="text-green-600 text-[9px] hover:underline cursor-pointer"
                            >
                              Ativar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}


      {/* ==================== TAB 2: CURRICULUM PEDAGOGY (NEW MODULES & NEW LESSONS) ==================== */}
      {activeAdminTab === 'curriculum' && (
        <div className="space-y-8">
          
          {/* Section for Themes (Módulos) list and fast control */}
          <div className="bg-white rounded-3xl border border-[#F0EDEA] p-6 md:p-8 card-shadow space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EDEA] pb-4">
              <div>
                <h3 className="text-[#2D2926] font-serif font-bold text-lg flex items-center gap-2">
                  <Layers size={18} className="text-[#C5A059]" />
                  <span>Temas Cadastrados (Conjuntos de Aulas)</span>
                </h3>
                <p className="text-[#8C847C] text-xs font-sans mt-0.5">As lições são agrupadas dentro desses temas/módulos para formatação sistemática.</p>
              </div>

              <button
                onClick={handleOpenModuleCreate}
                className="inline-flex items-center gap-1.5 bg-[#1A2E44] hover:bg-opacity-95 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
              >
                <Plus size={14} />
                <span>Criar Novo Tema</span>
              </button>
            </div>

            {modules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {modules
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map(mod => (
                    <div 
                      key={mod.id} 
                      className="bg-[#F5F2ED]/40 border border-[#EEEAE5] rounded-3xl p-5 flex flex-col justify-between space-y-3 relative overflow-hidden"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] bg-[#1A2E44]/5 text-[#1A2E44] font-bold px-2 py-0.5 rounded-md">
                            Tema {mod.order}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenModuleEdit(mod)}
                              title="Editar Tema"
                              className="p-1 px-2 hover:bg-white text-stone-700 hover:text-[#C5A059] rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit size={12} />
                            </button>

                            {confirmDeleteModuleId === mod.id ? (
                              <div className="flex items-center gap-1 bg-red-100 p-0.5 rounded-lg border border-red-200">
                                <button onClick={() => handleDeleteModule(mod.id!)} className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">Sim</button>
                                <button onClick={() => setConfirmDeleteModuleId(null)} className="text-[10px] text-stone-600 font-semibold px-1.5 py-0.5 rounded">Não</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteModuleId(mod.id!)}
                                title="Deletar Tema"
                                className="p-1 px-2 hover:bg-red-50 text-red-650 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="font-serif font-bold text-[#2D2926] text-md mt-2">{mod.title}</h4>
                        <p className="text-[#8C847C] text-xs leading-relaxed font-sans line-clamp-2 mt-1">{mod.description || 'Nenhuma descrição...'}</p>
                      </div>

                      <div className="pt-2 text-[10px] text-[#8C847C] border-t border-[#EEEAE5] flex items-center justify-between">
                        <span>{getLessonsInModule(mod.id || '').length} aulas anexas</span>
                        <span className={`font-bold uppercase tracking-wider ${mod.active !== false ? 'text-green-600' : 'text-stone-400'}`}>
                          {mod.active !== false ? '● Ativo' : '● Inativo'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-[#8C847C] italic pl-2 font-sans">Nenhum tema configurado. Use o 'Seed Utility' ou o Drive Importer.</p>
            )}
          </div>

          {/* Section for Lessons tree and interactive creator/editor per Theme */}
          <div className="space-y-6">
            <h3 className="text-[#2D2926] font-serif font-bold text-lg">Aulas e Atividades por Tema</h3>

            {modules
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(mod => {
                const moduleLessons = getLessonsInModule(mod.id || '');

                return (
                  <div key={mod.id} className="bg-white rounded-3xl border border-[#F0EDEA] p-6 md:p-8 card-shadow space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EDEA] pb-3">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider bg-[#F5F2ED] border border-[#EEEAE5] px-2 py-0.5 rounded-full font-bold text-[#B45309]">
                          Grupo {mod.order}
                        </span>
                        <h4 className="text-[#2D2926] font-serif font-bold text-md mt-1">{mod.title}</h4>
                      </div>

                      <button
                        onClick={() => handleOpenLessonCreate(mod.id)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#1A2E44] font-extrabold hover:text-[#C5A059] border border-[#EEEAE5] px-3.5 py-2 rounded-xl hover:bg-[#F5F2ED]/50 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Adicionar Aula neste Tema</span>
                      </button>
                    </div>

                    {moduleLessons.length > 0 ? (
                      <div className="divide-y divide-[#F0EDEA]">
                        {moduleLessons.map(lesson => {
                          const companionDevStr = devotionals.find(d => d.lessonId === lesson.id);

                          return (
                            <div key={lesson.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 first:pt-1 last:pb-1">
                              
                              <div className="space-y-1.5 max-w-2xl">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] font-bold text-[#1A2E44] bg-stone-100 rounded px-1.5 py-0.5">
                                    Aula {lesson.order}
                                  </span>
                                  <h5 className="font-bold text-[#2D2926] text-sm font-sans">{lesson.title}</h5>
                                  {lesson.active === false && (
                                    <span className="text-[8px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">INATIVA</span>
                                  )}
                                </div>
                                <p className="text-[#8C847C] text-xs leading-relaxed line-clamp-2 font-sans">
                                  <strong>Objetivo:</strong> {lesson.objective || 'Nenhum objetivo cadastrado...'}
                                </p>
                                
                                <div className="flex flex-wrap gap-2 text-[10px] text-[#8C847C] font-semibold">
                                  <span className="bg-[#F5F2ED]/50 px-2 py-0.5 rounded border border-stone-100 font-sans">📖 Ref: {lesson.bibleReferences || 'Não especificada'}</span>
                                  {companionDevStr ? (
                                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5">
                                      <Check size={10} /> Devocional Sincronizado
                                    </span>
                                  ) : (
                                    <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-100">⚠️ Devocional Pendente</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 self-stretch md:self-auto justify-end border-t md:border-t-0 border-[#F5F2ED] pt-2 md:pt-0">
                                <button
                                  onClick={() => handleOpenLessonEdit(lesson)}
                                  className="inline-flex items-center gap-1 bg-[#1A2E44]/5 hover:bg-[#1A2E44] hover:text-white transition-all text-[#1A2E44] font-bold text-[10px] px-3.5 py-2 rounded-xl cursor-pointer"
                                >
                                  <Edit size={12} />
                                  <span>Editar Tudo</span>
                                </button>

                                {confirmDeleteLessonId === lesson.id ? (
                                  <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-200 text-[10px]">
                                    <span className="font-bold text-red-700 px-1">Certeza?</span>
                                    <button onClick={() => handleDeleteLesson(lesson.id!)} className="bg-red-650 hover:bg-red-700 text-white font-extrabold px-2 py-1 rounded-lg">Sim</button>
                                    <button onClick={() => setConfirmDeleteLessonId(null)} className="text-stone-600 font-bold px-2 py-1 rounded-lg hover:bg-stone-200">Não</button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setConfirmDeleteLessonId(lesson.id!)}
                                    title="Deletar Aula e Devocional"
                                    className="p-2 hover:bg-red-50 text-red-650 hover:text-red-700 rounded-xl transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8C847C] italic leading-relaxed py-4 pl-1 font-sans">Nenhuma aula neste Tema. Comece criando uma nova lição no botão acima.</p>
                    )}
                  </div>
                );
              })}
          </div>

        </div>
      )}


      {/* ==================== TAB 3: PLATFORM GENERAL SETTINGS & DATABASE SEED ==================== */}
      {activeAdminTab === 'settings' && (
        <div className="space-y-6">
          
          {/* Admin Database seeding utility & backup */}
          <div className="bg-[#1A2E44] rounded-3xl p-6 md:p-8 border border-[#2D2926]/40 text-[#F5F2ED] space-y-5 shadow-xl">
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 bg-[#C5A059]/20 text-[#C5A059] font-extrabold text-[9px] tracking-widest px-2.5 py-1 rounded-full uppercase border border-[#C5A059]/30">
                🚀 ADMIN SEED UTILITY
              </span>
              <h3 className="text-white font-serif font-bold text-lg">Sementeira Automática da Trilha de Estudo</h3>
              <p className="text-[#8C847C] text-xs leading-relaxed max-w-2xl font-sans text-stone-300">
                Popula o seu banco de dados Firestore instantaneamente com as **15 aulas e 15 devocionais** padrão do curso pastoral Coroado Comunicação. Use este botão se o banco de dados estiver em branco ou desejar restaurar o curriculum original.
              </p>
            </div>

            {seedSuccess && (
              <div className="bg-[#F5F2ED] border border-[#EEEAE5] rounded-2xl p-4 text-xs text-[#B45309] font-bold">
                🌱 Sementeira concluída! A trilha de estudo e as meditações diárias foram inseridas com êxito em coleções unificadas do Firebase.
              </div>
            )}

            <button
              onClick={handleTriggerSeeding}
              disabled={seeding}
              className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-opacity-90 disabled:bg-stone-700 text-[#1A2E44] font-extrabold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Layers size={14} className={seeding ? "animate-spin" : ""} />
              <span>{seeding ? "Populando banco de dados..." : "Semear Trilha Completa (1 Click)"}</span>
            </button>
          </div>

          {/* Drivecourse importer is available inside general options */}
          <DriveCourseImporter modules={modules} onRefreshAll={onRefreshAll} />

          {/* Slogans setup */}
          <div className="bg-white rounded-3xl border border-[#F0EDEA] p-6 md:p-8 card-shadow space-y-6">
            <div className="border-b border-[#F0EDEA] pb-3 flex items-center gap-1.5">
              <Sliders size={18} className="text-[#C5A059]" />
              <h3 className="text-[#2D2926] font-serif font-bold text-lg">Personalização e Slogans do Ministério</h3>
            </div>

            <form onSubmit={handleSavePlatformSettings} className="space-y-5 max-w-xl text-xs">
              
              <div className="space-y-1.5">
                <label className="block font-bold text-[#8C847C] uppercase tracking-wider">Nome da Plataforma</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs font-semibold bg-[#F5F2ED]/50 outline-none border border-[#EEEAE5] rounded-2xl px-4 py-3 focus:bg-white focus:border-[#C5A059] transition-all text-[#2D2926]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#8C847C] uppercase tracking-wider">Frase Principal</label>
                <textarea
                  value={mainPhrase}
                  onChange={e => setMainPhrase(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-[#F5F2ED]/50 outline-none border border-[#EEEAE5] rounded-2xl px-4 py-3 focus:bg-white focus:border-[#C5A059] transition-all font-semibold text-[#2D2926] font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#8C847C] uppercase tracking-wider">Frase de Apoio</label>
                <textarea
                  value={supportPhrase}
                  onChange={e => setSupportPhrase(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-[#F5F2ED]/50 outline-none border border-[#EEEAE5] rounded-2xl px-4 py-3 focus:bg-white focus:border-[#C5A059] transition-all font-semibold text-[#8C847C] font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#8C847C] uppercase tracking-wider">E-mail de Suporte / Aconselhamento</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full text-xs font-semibold bg-[#F5F2ED]/50 outline-none border border-[#EEEAE5] rounded-2xl px-4 py-3 focus:bg-white focus:border-[#C5A059] transition-all text-[#2D2926] font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-[#1A2E44] hover:bg-opacity-95 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  {savingSettings ? "Salvando..." : "Salvar Configurações Visuais"}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}


      {/* ==================== THEME MODULE CREATION / EDITING OVERLAY MODAL ==================== */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowModuleForm(false)}>
          <div 
            className="w-full max-w-lg bg-white rounded-[32px] border border-[#F0EDEA] p-6 md:p-8 relative shadow-2xl space-y-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F0EDEA] pb-3">
              <div>
                <h3 className="text-[#2D2926] font-serif font-bold text-lg">
                  {editingModule ? 'Editar Tema / Módulo' : 'Criar Novo Tema / Conjunto de Aulas'}
                </h3>
                <p className="text-[#8C847C] text-xs font-sans mt-0.5">Estruture e ordene os assuntos pedagógicos para os servos.</p>
              </div>
              <button onClick={() => setShowModuleForm(false)} className="p-1 px-1.5 rounded-full hover:bg-stone-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Título do Tema *</label>
                <input
                  type="text"
                  required
                  value={moduleTitle}
                  onChange={e => setModuleTitle(e.target.value)}
                  placeholder="Ex: Tema 6 - Redação e Storytelling Criativo"
                  className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-[#2D2926]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Descrição ou Meta Espiritual</label>
                <textarea
                  value={moduleDescription}
                  onChange={e => setModuleDescription(e.target.value)}
                  rows={3}
                  placeholder="Explique o que os alunos vão absorver ao estudar este conjunto de aulas..."
                  className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-[#2D2926] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Ordem de Exibição *</label>
                  <input
                    type="number"
                    required
                    value={moduleOrder}
                    onChange={e => setModuleOrder(e.target.value)}
                    className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-[#2D2926]"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-3 select-none">
                    <input
                      type="checkbox"
                      checked={moduleActive}
                      onChange={e => setModuleActive(e.target.checked)}
                      className="w-4 h-4 text-[#C5A059] bg-[#F5F2ED] border-[#EEEAE5] rounded focus:ring-0"
                    />
                    <span className="font-bold text-[#8C847C]">Tema visível para servos</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#F0EDEA] flex justify-end gap-2 text-xs font-sans font-bold">
                <button
                  type="button"
                  onClick={() => setShowModuleForm(false)}
                  className="border border-[#EEEAE5] hover:bg-stone-50 text-stone-505 px-5 py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingModule}
                  className="bg-[#1A2E44] hover:bg-opacity-95 text-white px-6 py-3 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {savingModule ? 'Salvando...' : 'Gravar Tema'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* ==================== DOUBLE SECTION LESSON & DEVOTIONAL CREATION/EDITING MASTER OVERLAY ==================== */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={() => setShowLessonForm(false)}>
          <div 
            className="w-full max-w-5xl bg-white rounded-[32px] border border-[#F0EDEA] relative shadow-2xl flex flex-col max-h-[92vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 md:p-8 border-b border-[#F0EDEA] flex items-center justify-between shrink-0">
              <div>
                <span className="inline-flex items-center gap-1 bg-[#F5F2ED] text-[#B45309] font-bold text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#EEEAE5]">
                  <Sparkles size={10} /> Sincronizador de Formação Pastoral
                </span>
                <h3 className="text-[#2D2926] font-serif font-bold text-xl md:text-2xl mt-1">
                  {editingLesson ? `Editar Aula "${lessonTitle}"` : 'Inserir Nova Aula com Devocional Associado'}
                </h3>
                <p className="text-[#8C847C] text-xs font-sans">Cadastre e edite todas as áreas da trilha de estudo e sua reflexão pessoal companion no altar.</p>
              </div>
              <button 
                onClick={() => setShowLessonForm(false)} 
                className="p-1 px-1.5 rounded-full hover:bg-stone-100 text-[#8C847C] hover:text-[#2D2926] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Twin Columns Form (Aula vs Devocional) */}
            <form onSubmit={handleSaveLessonAndDevotional} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 select-none text-xs font-sans">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* COLUMN 1: INTERACTIVE LESSON PEDAGOGY */}
                <div className="space-y-5 bg-[#F5F2ED]/25 p-5 rounded-3xl border border-[#EEEAE5]/50">
                  <h4 className="text-sm font-serif font-bold text-[#1A2E44] flex items-center gap-1.5 border-b border-[#EEEAE5] pb-2">
                    <Book className="text-[#C5A059]" size={15} />
                    <span>Dados da Aula e Recursos Estéticos</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Tema Pertencente *</label>
                      <select
                        required
                        value={lessonModuleId}
                        onChange={e => setLessonModuleId(e.target.value)}
                        className="w-full bg-white border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-[#2D2926]"
                      >
                        <option value="">Escolha o Tema...</option>
                        {modules.map(mod => (
                          <option key={mod.id} value={mod.id}>Tema {mod.order} - {mod.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Posição / Ordem de Estudo *</label>
                      <input
                        type="number"
                        required
                        value={lessonOrder}
                        onChange={e => setLessonOrder(e.target.value)}
                        className="w-full bg-white border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-[#2D2926]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Título Curto da Aula *</label>
                    <input
                      type="text"
                      required
                      value={lessonTitle}
                      onChange={e => setLessonTitle(e.target.value)}
                      placeholder="Ex: Aula 01 - Linguagem Moderna"
                      className="w-full bg-white border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-[#2D2926]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Objetivo Pedagógico Fundamental *</label>
                    <textarea
                      required
                      value={lessonObjective}
                      onChange={e => setLessonObjective(e.target.value)}
                      rows={2}
                      placeholder="O que o servo será capacitado a exercer espiritualmente após essa aula..."
                      className="w-full bg-white border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-[#2D2926] resize-none font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Referências Bíblicas Principais *</label>
                    <input
                      type="text"
                      required
                      value={lessonBibleReferences}
                      onChange={e => setLessonBibleReferences(e.target.value)}
                      placeholder="Ex: Neemias 8:1-12; Lucas 4:14-21"
                      className="w-full bg-white border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-[#2D2926]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Pergunta de Abertura / Quebra Gelo</label>
                    <textarea
                      value={lessonOpeningQuestion}
                      onChange={e => setLessonOpeningQuestion(e.target.value)}
                      rows={2}
                      placeholder="Ex: Qual palavra ou postagem que você fez essa semana chamou atenção de forma espiritual?"
                      className="w-full bg-white border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-[#2D2926] resize-none font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Resumo do Conteúdo Didático *</label>
                    <textarea
                      required
                      value={lessonSummary}
                      onChange={e => setLessonSummary(e.target.value)}
                      rows={4}
                      placeholder="Resumo completo sobre este estudo..."
                      className="w-full bg-white border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-[#2D2926] resize-none font-sans leading-relaxed"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] uppercase font-bold text-[#8C847C] block">Recursos Externos de Mídia (Google Drive and YouTube)</span>
                    
                    <div className="space-y-1">
                      <label className="font-bold text-stone-500 block">Link de Vídeo no YouTube (Opcional)</label>
                      <input
                        type="url"
                        value={lessonYoutubeUrl}
                        onChange={e => setLessonYoutubeUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-white border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-2.5 font-semibold text-[#2D2926]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-500 block">Google Drive Doc URL (Leitura de Apoio)</label>
                      <input
                        type="url"
                        value={lessonDriveDocUrl}
                        onChange={e => setLessonDriveDocUrl(e.target.value)}
                        placeholder="https://docs.google.com/document/d/..."
                        className="w-full bg-white border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-2.5 font-semibold text-[#2D2926]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-stone-500 block">Google Drive Slides URL (Apresentação Visual)</label>
                      <input
                        type="url"
                        value={lessonDriveSlideUrl}
                        onChange={e => setLessonDriveSlideUrl(e.target.value)}
                        placeholder="https://docs.google.com/presentation/d/..."
                        className="w-full bg-white border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-2.5 font-semibold text-[#2D2926]"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={lessonActive}
                      onChange={e => setLessonActive(e.target.checked)}
                      className="w-4 h-4 text-[#C5A059] rounded focus:ring-0"
                    />
                    <span className="font-bold text-[#8C847C]">Aula e materiais ativos imediatamente</span>
                  </label>

                </div>


                {/* COLUMN 2: COMPANION DEVOTIONAL MEDITATION */}
                <div className="space-y-5 bg-emerald-50/20 p-5 rounded-3xl border border-emerald-100">
                  <h4 className="text-sm font-serif font-bold text-emerald-900 flex items-center gap-1.5 border-b border-emerald-200 pb-2">
                    <Heart className="text-emerald-600" size={15} />
                    <span>Meditação no Secreto (Devocional Diario)</span>
                  </h4>

                  <div className="space-y-1">
                    <label className="font-bold text-emerald-800 uppercase tracking-wider block">Título do Devocional *</label>
                    <input
                      type="text"
                      required
                      value={devTitle}
                      onChange={e => setDevTitle(e.target.value)}
                      placeholder="Ex: Devocional - Purificação dos Lábios"
                      className="w-full bg-white border border-emerald-100 focus:outline-none focus:border-emerald-600 rounded-xl p-3 font-semibold text-[#2D2926]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-emerald-800 uppercase tracking-wider block">Passagem Bíblica Direcionada *</label>
                    <input
                      type="text"
                      required
                      value={devBibleReference}
                      onChange={e => setDevBibleReference(e.target.value)}
                      placeholder="Ex: Neemias 8:1-8 ou Isaías 6:1-9"
                      className="w-full bg-white border border-emerald-100 focus:outline-none focus:border-emerald-600 rounded-xl p-3 font-semibold text-[#2D2926]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-emerald-800 uppercase tracking-wider block">Instruções para Leitura Atenta *</label>
                    <textarea
                      required
                      value={devReadingInstruction}
                      onChange={e => setDevReadingInstruction(e.target.value)}
                      rows={2}
                      placeholder="Ex: Abra sua Bíblia física no livro citado, leia com tranquilidade no secreto e anote..."
                      className="w-full bg-white border border-emerald-100 focus:outline-none focus:border-emerald-600 rounded-xl p-3 font-semibold text-[#2D2926] resize-none font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-emerald-800 uppercase tracking-wider block">Texto para Meditação Guiada *</label>
                    <textarea
                      required
                      value={devGuidedMeditation}
                      onChange={e => setDevGuidedMeditation(e.target.value)}
                      rows={4}
                      placeholder="Texto do ensinamento devocional espiritual conectando mídias, transmissão e santidade..."
                      className="w-full bg-white border border-emerald-100 focus:outline-none focus:border-emerald-600 rounded-xl p-3 font-semibold text-[#2D2926] resize-none font-sans leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-emerald-800 uppercase tracking-wider block">Pauta de Oração Sugerida *</label>
                    <textarea
                      required
                      value={devSuggestedPrayer}
                      onChange={e => setDevSuggestedPrayer(e.target.value)}
                      rows={2}
                      placeholder="Ex: Senhor Jesus, purifica os meus olhos diante do monitor. Que minhas edições glorifiquem..."
                      className="w-full bg-white border border-emerald-100 focus:outline-none focus:border-emerald-600 rounded-xl p-3 font-semibold text-[#2D2926] resize-none font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-emerald-800 uppercase tracking-wider block">Prática de Aplicação Diária/Semanal *</label>
                    <textarea
                      required
                      value={devWeeklyPractice}
                      onChange={e => setDevWeeklyPractice(e.target.value)}
                      rows={3}
                      placeholder="Tarefa prática. Ex: Pergunte a um colega se ele está cansado com a escalação..."
                      className="w-full bg-white border border-emerald-100 focus:outline-none focus:border-emerald-600 rounded-xl p-3 font-semibold text-[#2D2926] resize-none font-sans"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={devActive}
                      onChange={e => setDevActive(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-0 checked:bg-emerald-600"
                    />
                    <span className="font-bold text-emerald-800">Ativar devocional companion diário</span>
                  </label>
                  
                  <div className="bg-[#B45309]/5 border border-[#B45309]/10 rounded-2xl p-4 text-[11px] text-[#B45309] leading-relaxed flex items-start gap-2">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Sincronização de Progresso</p>
                      <p className="mt-0.5">Os servos registrarão a leitura desse devocional de forma interativa após concluírem a lição pedagógica correspondente no celular.</p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom Buttons Container */}
              <div className="border-t border-[#F0EDEA] pt-6 flex justify-end gap-3 shrink-0 text-xs font-sans font-bold">
                <button
                  type="button"
                  onClick={() => setShowLessonForm(false)}
                  className="border border-[#EEEAE5] hover:bg-stone-50 text-stone-505 px-6 py-3.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="bg-[#1A2E44] hover:bg-opacity-95 text-white px-8 py-3.5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>{savingLesson ? 'Gravando e unificando...' : 'Confirmar e Sincronizar Tudo'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


    </div>
  );
};
