import React, { useState, useEffect } from 'react';
import { UserProfile, DevotionalAnswer, Lesson, WeeklyMeeting, MeetingAttendance, LeaderNote } from '../types';
import { 
  Users, FileText, CheckCircle, AlertTriangle, MessageSquare, 
  BookOpen, Heart, Calendar, PlusCircle, Trash, Search, ArrowLeft, Send,
  Phone, MapPin, Bookmark
} from 'lucide-react';
import { collection, doc, getDocs, setDoc, addDoc, updateDoc, query, where, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface LeaderPortalProps {
  currentLeader: UserProfile;
  lessons: Lesson[];
  onRefreshAll: () => void;
}

export const LeaderPortal: React.FC<LeaderPortalProps> = ({
  currentLeader,
  lessons,
  onRefreshAll
}) => {
  // Collection data loader states
  const [servos, setServos] = useState<UserProfile[]>([]);
  const [answers, setAnswers] = useState<DevotionalAnswer[]>([]);
  const [meetings, setMeetings] = useState<WeeklyMeeting[]>([]);
  const [attendance, setAttendance] = useState<MeetingAttendance[]>([]);
  const [leaderNotes, setLeaderNotes] = useState<LeaderNote[]>([]);
  const [lessonAnswers, setLessonAnswers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Active sub-views inside the leader dashboard: 'servos' | 'respostas' | 'reunioes'
  const [activeSubTab, setActiveSubTab] = useState<'servos' | 'respostas' | 'reunioes'>('servos');

  // Filter/Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServoIdForDetail, setSelectedServoIdForDetail] = useState<string | null>(null);

  // New Counseling note input fields
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // States for editing servo details
  const [editingServoFields, setEditingServoFields] = useState<boolean>(false);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editCelula, setEditCelula] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEndereco, setEditEndereco] = useState('');
  const [editAreaInteresse, setEditAreaInteresse] = useState('');
  const [savingServoFields, setSavingServoFields] = useState(false);

  // Core data fetcher
  const fetchLeaderData = async () => {
    try {
      setLoading(true);

      // Load all users
      const usersSnap = await getDocs(collection(db, 'users'));
      const fetchedUsers = usersSnap.docs.map(d => d.data() as UserProfile);
      setServos(fetchedUsers);

      // Load all devotional answers
      const answersSnap = await getDocs(collection(db, 'devotionalAnswers'));
      const fetchedAnswers = answersSnap.docs.map(d => ({ ...d.data(), id: d.id } as DevotionalAnswer));
      setAnswers(fetchedAnswers);

      // Load all meetings and attendance
      const meetingsSnap = await getDocs(collection(db, 'weeklyMeetings'));
      setMeetings(meetingsSnap.docs.map(d => ({ ...d.data(), id: d.id } as WeeklyMeeting)));

      const attendanceSnap = await getDocs(collection(db, 'meetingAttendance'));
      setAttendance(attendanceSnap.docs.map(d => ({ ...d.data(), id: d.id } as MeetingAttendance)));

      // Load counselor private notes
      const notesSnap = await getDocs(collection(db, 'leaderNotes'));
      setLeaderNotes(notesSnap.docs.map(d => ({ ...d.data(), id: d.id } as LeaderNote)));

      // Load study questions answers
      const lessonAnswersSnap = await getDocs(collection(db, 'lessonAnswers'));
      setLessonAnswers(lessonAnswersSnap.docs.map(d => ({ ...d.data(), id: d.id })));

    } catch (err) {
      console.error("Failed to load leader assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderData();
  }, []);

  const handleManualActionRefresh = () => {
    fetchLeaderData();
    onRefreshAll();
  };

  // Sync edit states when a student/servo card is selected
  useEffect(() => {
    if (selectedServoIdForDetail) {
      const servo = servos.find(s => s.uid === selectedServoIdForDetail);
      if (servo) {
        setEditDisplayName(servo.displayName || '');
        setEditCelula(servo.celula || '');
        setEditPhone(servo.phone || '');
        setEditEndereco(servo.endereco || '');
        setEditAreaInteresse(servo.areaInteresse || '');
        setEditingServoFields(false); // Reset edit state to view mode first
      }
    }
  }, [selectedServoIdForDetail, servos]);

  // Handle saving modified servo fields from leader Ficha Pastoral
  const handleSaveServoFields = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServoIdForDetail) return;
    setSavingServoFields(true);
    try {
      const userRef = doc(db, 'users', selectedServoIdForDetail);
      await updateDoc(userRef, {
        displayName: editDisplayName,
        celula: editCelula,
        phone: editPhone,
        endereco: editEndereco,
        areaInteresse: editAreaInteresse,
        updatedAt: new Date().toISOString()
      });
      // Refresh local states
      await fetchLeaderData();
      setEditingServoFields(false);
    } catch (err) {
      console.error("Error updating servo from leader portal:", err);
      handleFirestoreError(err, OperationType.WRITE, `users/${selectedServoIdForDetail}`);
    } finally {
      setSavingServoFields(false);
    }
  };

  // 1. Calculate Statistics
  const totalActives = servos.filter(s => s.role === 'servo' && s.status === 'ativo').length;
  const totalPendings = servos.filter(s => s.status === 'pendente').length;
  const answersPendingCount = answers.filter(a => a.status === 'nova').length;

  // 2. Add pastoral shepherding note for a student
  const handleAddCounselNote = async (e: React.FormEvent, targetStudentId: string) => {
    e.preventDefault();
    if (!newNoteText.trim() || savingNote) return;

    setSavingNote(true);
    const notePayload: LeaderNote = {
      userId: targetStudentId,
      leaderId: currentLeader.uid,
      note: newNoteText,
      visibility: 'lideres_admins',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'leaderNotes'), notePayload);
      setNewNoteText('');
      // Reload notes list
      const notesSnap = await getDocs(collection(db, 'leaderNotes'));
      setLeaderNotes(notesSnap.docs.map(d => ({ ...d.data(), id: d.id } as LeaderNote)));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'leaderNotes');
    } finally {
      setSavingNote(false);
    }
  };

  // 3. Mark Devotional Answer as Read/Accompanied
  const handleUpdateAnswerStatus = async (answerId: string, status: 'lida' | 'acompanhada') => {
    const answerRef = doc(db, 'devotionalAnswers', answerId);
    try {
      await updateDoc(answerRef, { 
        status,
        reviewedBy: currentLeader.displayName || 'Líder',
        reviewedAt: new Date().toISOString()
      });
      // Refresh responses list
      const answersSnap = await getDocs(collection(db, 'devotionalAnswers'));
      setAnswers(answersSnap.docs.map(d => ({ ...d.data(), id: d.id } as DevotionalAnswer)));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `devotionalAnswers/${answerId}`);
    }
  };

  // 4. Change Servo Role/Status
  const handleUpdateServoStatus = async (targetUid: string, status: any, role?: any) => {
    const userRef = doc(db, 'users', targetUid);
    const updates: Partial<UserProfile> = {
      status,
      updatedAt: new Date().toISOString()
    };
    if (role) {
      updates.role = role;
    }
    
    try {
      await updateDoc(userRef, updates);
      handleManualActionRefresh();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${targetUid}`);
    }
  };

  // Helper to dynamically suggest signaling alerts for students (Em Dia, Acompanhar, Atrasado, Conversar)
  const getServoCaminhadaBadge = (servoProfile: UserProfile) => {
    const studentAnswers = answers.filter(a => a.userId === servoProfile.uid);
    const hasRequestedConversation = studentAnswers.some(a => a.wantsLeaderConversation);
    const pendingReviewAnswers = studentAnswers.filter(a => a.status === 'nova').length;

    if (hasRequestedConversation) {
      return { label: 'Precisa Conversar', style: 'bg-red-100 text-red-800 border border-red-200' };
    }
    if (pendingReviewAnswers > 0) {
      return { label: 'Acompanhar', style: 'bg-amber-100 text-amber-800 border border-amber-200' };
    }
    if (studentAnswers.length < 2) {
      return { label: 'Atrasado', style: 'bg-zinc-100 text-zinc-600 border border-zinc-200' };
    }
    return { label: 'Em Dia', style: 'bg-emerald-100 text-emerald-800 border border-emerald-200' };
  };
  if (loading) {
    return <div className="p-10 text-center text-xs text-[#8C847C] font-semibold font-sans">Buscando relatórios e diários do ministério...</div>;
  }

  // SUB VIEW: SERVO PROFILE DETAIL DRAWER / FULL CARD
  if (selectedServoIdForDetail) {
    const servoDetails = servos.find(s => s.uid === selectedServoIdForDetail);
    if (!servoDetails) return null;

    const studentAnswers = answers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).filter(a => a.userId === servoDetails.uid);
    const notesList = leaderNotes.filter(n => n.userId === servoDetails.uid);
    const studentLessonAnswers = lessonAnswers.filter(a => a.userId === servoDetails.uid);

    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in relative pb-16 text-[#2D2926]">
        <button
          onClick={() => setSelectedServoIdForDetail(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C847C] hover:text-[#1A2E44] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Voltar para Lista de Servos</span>
        </button>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#F0EDEA] card-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {servoDetails.photoURL ? (
              <img src={servoDetails.photoURL} alt="" className="w-16 h-16 rounded-full object-cover border border-[#EEEAE5]" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#1A2E44] flex items-center justify-center font-bold text-xl text-white">
                {servoDetails.displayName?.charAt(0) || 'S'}
              </div>
            )}
            <div className="space-y-1">
              <h1 className="text-[#2D2926] font-serif font-bold text-xl md:text-2xl tracking-tight leading-none">{servoDetails.displayName}</h1>
              <p className="text-[#8C847C] text-xs font-semibold font-mono">{servoDetails.email}</p>
              <div className="flex flex-wrap gap-2 pt-1.5 text-[10px] font-bold uppercase tracking-wider">
                <span className="px-2.5 py-1 rounded-full bg-[#F5F2ED] text-[#B45309] border border-[#EEEAE5]">
                  {servoDetails.role}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-250">
                  {servoDetails.status}
                </span>
                <span className="text-[#8C847C] py-0.5">{servoDetails.celula ? `Célula: ${servoDetails.celula}` : "Sem célula"}</span>
              </div>
            </div>
          </div>

          {/* Leader Quick Actions Panel on the profile details view */}
          <div className="bg-[#F5F2ED]/50 border border-[#EEEAE5] p-5 rounded-3xl space-y-3.5 text-xs w-full md:w-64 shrink-0">
            <h4 className="font-serif font-bold text-[#1A2E44] text-sm mb-1">Administrar Cadastro</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleUpdateServoStatus(servoDetails.uid, 'ativo')}
                className="flex-1 py-1.5 font-bold border bg-white border-[#EEEAE5] rounded-xl text-green-700 hover:bg-green-100 text-[10px] cursor-pointer"
              >
                Ativar
              </button>
              <button
                onClick={() => handleUpdateServoStatus(servoDetails.uid, 'pausado')}
                className="flex-1 py-1.5 font-bold border bg-white border-[#EEEAE5] rounded-xl text-[#B45309] hover:bg-[#F5F2ED] text-[10px] cursor-pointer"
              >
                Pausar
              </button>
              <button
                onClick={() => handleUpdateServoStatus(servoDetails.uid, 'bloqueado')}
                className="flex-1 py-1.5 font-bold border bg-white border-[#EEEAE5] rounded-xl text-red-600 hover:bg-red-50 text-[10px] cursor-pointer"
              >
                Bloquear
              </button>
            </div>
            
            <div className="border-t border-[#EEEAE5] pt-2">
              <button
                onClick={() => handleUpdateServoStatus(servoDetails.uid, servoDetails.status, 'lider')}
                className="w-full text-center py-2 bg-[#1A2E44] hover:bg-opacity-95 text-white font-bold rounded-xl text-[10px] cursor-pointer"
              >
                Tornar Líder de Comunicação
              </button>
            </div>
          </div>
        </div>

        {/* Contact and address card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#F0EDEA] card-shadow space-y-6">
          <div className="flex items-center justify-between border-b border-[#F0EDEA] pb-3">
            <div>
              <h3 className="text-[#2D2926] font-serif font-bold text-lg">Informações Cadastrais de Contato</h3>
              <p className="text-[#8C847C] text-xs font-sans mt-0.5">Gerenciamento de telefone, endereço e grupo de célula do servo.</p>
            </div>
            <button
              onClick={() => setEditingServoFields(!editingServoFields)}
              className="text-xs font-bold text-[#1A2E44] hover:text-[#C5A059] bg-[#F5F2ED] border border-[#EEEAE5] hover:bg-[#EAE5DF] px-3.5 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              {editingServoFields ? "Cancelar" : "Editar Dados Cadastrais"}
            </button>
          </div>

          {!editingServoFields ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-sans">
              <div className="space-y-1 bg-[#F5F2ED]/30 p-4 rounded-2xl border border-[#EEEAE5]/60">
                <p className="font-bold text-[#8C847C] uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Bookmark size={10} className="text-[#C5A059]" />
                  <span>Célula do Servo</span>
                </p>
                <p className="font-bold text-[#2D2926] text-sm">{servoDetails.celula || "Não preenchida"}</p>
              </div>
              <div className="space-y-1 bg-[#F5F2ED]/30 p-4 rounded-2xl border border-[#EEEAE5]/60 font-mono">
                <p className="font-bold text-[#8C847C] uppercase tracking-wider text-[10px] flex items-center gap-1 font-sans">
                  <Phone size={10} className="text-[#C5A059]" />
                  <span>WhatsApp / Telefone</span>
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-bold text-[#2D2926] text-sm">{servoDetails.phone || "Não cadastrado"}</p>
                  {servoDetails.phone && (
                    <a
                      href={`https://wa.me/${servoDetails.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 font-sans font-extrabold text-[10px]"
                    >
                      (Chamar no WhatsApp ➔)
                    </a>
                  )}
                </div>
              </div>
              <div className="space-y-1 bg-[#F5F2ED]/30 p-4 rounded-2xl border border-[#EEEAE5]/60">
                <p className="font-bold text-[#8C847C] uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Bookmark size={10} className="text-[#C5A059]" />
                  <span>Segmento Ministerial</span>
                </p>
                <p className="font-bold text-[#2D2926] text-sm">{servoDetails.areaInteresse || "Não selecionado"}</p>
              </div>
              <div className="space-y-1 bg-[#F5F2ED]/30 p-4 rounded-2xl border border-[#EEEAE5]/60 sm:col-span-2 lg:col-span-1">
                <p className="font-bold text-[#8C847C] uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <MapPin size={10} className="text-[#C5A059]" />
                  <span>Endereço Físico</span>
                </p>
                <p className="font-bold text-[#2D2926] leading-tight text-xs sm:text-sm">{servoDetails.endereco || "Não preenchido"}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveServoFields} className="space-y-4 text-xs font-sans max-w-xl animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#8C847C]">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={editDisplayName}
                    onChange={e => setEditDisplayName(e.target.value)}
                    className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-2.5 font-sans text-xs text-[#2D2926] font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#8C847C]">Célula do Servo</label>
                  <input
                    type="text"
                    required
                    value={editCelula}
                    onChange={e => setEditCelula(e.target.value)}
                    className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-2.5 font-sans text-xs text-[#2D2926] font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div className="space-y-1">
                  <label className="font-bold text-[#8C847C]">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-2.5 font-sans text-xs text-[#2D2926] font-semibold"
                  />
                </div>
                <div className="space-y-1 font-sans">
                  <label className="font-bold text-[#8C847C]">Área de Atuação Ministerial</label>
                  <select
                    value={editAreaInteresse}
                    onChange={e => setEditAreaInteresse(e.target.value)}
                    className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-2.5 font-sans text-xs text-[#2D2926] font-semibold"
                  >
                    <option value="">Selecione...</option>
                    <option value="Midias Sociais">Mídias Sociais</option>
                    <option value="Fotografia">Fotografia</option>
                    <option value="Sonorizacao">Sonorização</option>
                    <option value="Projecao">Projeção</option>
                    <option value="Design Grafico">Design de Mídia</option>
                    <option value="Transmissao">Transmissão</option>
                    <option value="Lideranca">Liderança Geral</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#8C847C]">Endereço Residencial</label>
                <input
                  type="text"
                  required
                  value={editEndereco}
                  onChange={e => setEditEndereco(e.target.value)}
                  className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-2.5 font-sans text-xs text-[#2D2926] font-semibold"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={savingServoFields}
                  className="bg-[#1A2E44] hover:bg-opacity-95 disabled:bg-stone-300 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {savingServoFields ? "Gravando..." : "Salvar Alterações"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingServoFields(false)}
                  className="border border-[#EEEAE5] hover:bg-[#F5F2ED] text-[#8C847C] font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Devotional answers and history */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[#8C847C] font-semibold text-xs uppercase tracking-[0.2em]">Histórico de Respostas Devocionais</h3>
            
            {studentAnswers.length > 0 ? (
              <div className="space-y-6">
                {studentAnswers.map(ans => {
                  const correlatedL = lessons.find(l => l.id === ans.lessonId);
                  return (
                    <div key={ans.id} className="bg-white rounded-3xl border border-[#F0EDEA] p-6 card-shadow space-y-4">
                      <div className="flex items-center justify-between border-b border-[#F0EDEA] pb-3">
                        <div>
                          <span className="text-[10px] text-[#B45309] font-bold uppercase tracking-widest">{correlatedL?.title || "Aula Devocional"}</span>
                          <span className="text-[10px] text-[#8C847C] font-semibold block mt-0.5">Formulado em: {new Date(ans.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {ans.wantsLeaderConversation && (
                          <span className="bg-red-50 text-red-700 font-bold text-[9px] tracking-widest px-2.5 py-1 rounded-full border border-red-200">
                            SOLICITOU CONVERSA
                          </span>
                        )}
                      </div>

                      {/* Actual fields showing responses */}
                      <div className="space-y-4 text-xs font-sans">
                        <div className="space-y-1">
                          <p className="font-bold text-[#8C847C]">1. Palavra ou frase em destaque:</p>
                          <p className="text-[#2D2926] leading-relaxed font-semibold bg-[#F5F2ED]/50 p-3 rounded-2xl border border-[#EEEAE5]">"{ans.answers.q1}"</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-[#8C847C]">2. O que confronta ou forma em seu caráter e mente:</p>
                          <p className="text-[#2D2926] leading-relaxed font-semibold bg-[#F5F2ED]/50 p-3 rounded-2xl border border-[#EEEAE5]">"{ans.answers.q2}"</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-[#B45309]">3. Decisão prática para a semana:</p>
                          <p className="text-[#2D2926] leading-relaxed font-semibold bg-[#F5F2ED] p-3 rounded-2xl border border-[#EEEAE5]">"{ans.answers.q3}"</p>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-[#1A2E44]">4. Oração consagratória:</p>
                          <p className="text-[#2D2926] leading-relaxed font-mono italic bg-[#F5F2ED]/40 p-3 rounded-2xl border border-dashed border-[#EEEAE5]">"{ans.answers.q4}"</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-[#F0EDEA] text-[10px] font-bold text-[#8C847C]">
                        <span>Status: <span className="uppercase text-[#2D2926] font-extrabold">{ans.status}</span></span>
                        {ans.status === 'nova' && (
                          <div className="flex gap-2 ml-auto">
                            <button
                              onClick={() => handleUpdateAnswerStatus(ans.id || '', 'lida')}
                              className="text-[#1A2E44] bg-[#F5F2ED] border border-[#EEEAE5] hover:bg-[#EAE5DF] px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                            >
                              Marcar como lido
                            </button>
                            <button
                              onClick={() => handleUpdateAnswerStatus(ans.id || '', 'acompanhada')}
                              className="text-white bg-[#1A2E44] hover:bg-opacity-95 px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                            >
                              Marcar como acompanhado
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-[#F5F2ED]/45 border border-[#EEEAE5] rounded-3xl py-12 text-center text-xs text-[#8C847C] font-semibold">
                Nenhum devocional foi respondido por este servo até o momento.
              </div>
            )}

            {/* STUDY LESSONS ANSWERS HISTORY */}
            <div className="space-y-6 pt-4">
              <h3 className="text-[#8C847C] font-semibold text-xs uppercase tracking-[0.2em] pl-1">Respostas Teológicas do Estudo (Aulas)</h3>
              
              {studentLessonAnswers.length > 0 ? (
                <div className="space-y-6">
                  {studentLessonAnswers.map(ans => {
                    const correlatedL = lessons.find(l => l.id === ans.lessonId);
                    return (
                      <div key={ans.id} className="bg-white rounded-3xl border border-[#F0EDEA] p-6 card-shadow space-y-4 font-sans animate-fade-in">
                        <div className="flex items-center justify-between border-b border-[#F0EDEA] pb-3">
                          <div>
                            <span className="text-[10px] text-[#1A2E44] font-extrabold uppercase tracking-widest bg-[#F5F2ED] text-[#B45309] border border-[#EEEAE5] px-2.5 py-1 rounded-full">
                              📚 {correlatedL?.title || "Estudo Formativo"}
                            </span>
                            {ans.updatedAt && (
                              <span className="text-[9px] text-[#8C847C] font-semibold block mt-2 ml-1">
                                Respondido em: {new Date(ans.updatedAt).toLocaleDateString('pt-BR')} às {new Date(ans.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4 text-xs font-sans">
                          {ans.openingAnswer && (
                            <div className="space-y-1">
                              <p className="font-bold text-[#8C847C]">Passo 2 - Resposta de Reflexão de Entrada (Pergunta Inicial):</p>
                              <p className="text-[#2D2926] leading-relaxed font-semibold bg-[#F5F2ED]/40 p-3 rounded-2xl border border-[#EEEAE5] italic">
                                "{ans.openingAnswer}"
                              </p>
                            </div>
                          )}

                          {ans.finalAnswers && (
                            <div className="space-y-1">
                              <p className="font-bold text-[#8C847C]">Passo 4 - Respostas às Perguntas Finais de Fixação:</p>
                              <p className="text-[#2D2926] leading-relaxed whitespace-pre-wrap font-semibold bg-[#F5F2ED]/60 p-4 rounded-2xl border border-[#EEEAE5]">
                                {ans.finalAnswers}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-[#F5F2ED]/45 border border-[#EEEAE5] rounded-3xl py-12 text-center text-xs text-[#8C847C] font-semibold">
                  Nenhuma reflexão de estudo foi respondida por este servo até o momento.
                </div>
              )}
            </div>

          </div>

          {/* Counselor private pastoral notes */}
          <div className="space-y-6">
            <h3 className="text-[#8C847C] font-semibold text-xs uppercase tracking-[0.2em] pl-1">Acompanhamento</h3>
            
            <div className="bg-white rounded-3xl border border-[#F0EDEA] p-6 card-shadow space-y-4">
              <h4 className="text-[#2D2926] font-serif font-bold text-sm tracking-tight flex items-center gap-1">
                🔒 Diário de Notas Privadas
              </h4>
              <p className="text-[10px] text-[#8C847C] leading-snug font-sans">Anotações do aconselhamento compartilhado por pastores. O servo não possui visibilidade destas notas.</p>

              {/* Form to submit shepherding note */}
              <form onSubmit={e => handleAddCounselNote(e, servoDetails.uid)} className="space-y-3 pt-3 border-t border-[#F0EDEA]">
                <textarea
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Escreva anotações de aconselhamento, pontos de atenção ou pautas para conversa..."
                  rows={3}
                  required
                  className="w-full text-xs text-[#2D2926] bg-[#F5F2ED]/50 border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-2xl p-3 font-sans"
                />
                <button
                  type="submit"
                  disabled={savingNote}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#1A2E44] hover:bg-opacity-95 disabled:bg-zinc-300 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <Send size={10} />
                  <span>{savingNote ? "Salvando..." : "Anexar Nota"}</span>
                </button>
              </form>

              {/* Shepherding notes logs listing */}
              <div className="space-y-3 pt-4 border-t border-[#F0EDEA]">
                {notesList.length > 0 ? (
                  notesList.map(n => (
                    <div key={n.id} className="bg-[#F5F2ED] p-3.5 rounded-2xl border border-[#EEEAE5] text-[11px] leading-relaxed relative">
                      <p className="text-[#2D2926] text-xs italic font-sans">"{n.note}"</p>
                      <span className="text-[9px] text-[#8C847C] font-bold block mt-1">🕒 {new Date(n.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-[#8C847C] italic text-center py-4 font-sans">Nenhuma anotação de aconselhamento registrada para este perfil.</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8 select-none animate-fade-in pb-16 text-[#2D2926]">
      
      <div className="space-y-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[#2D2926] font-serif font-bold text-2xl md:text-3xl tracking-tight leading-snug">Painel de Acompanhamento</h1>
          <p className="text-[#8C847C] text-sm font-sans">Supervisão pedagógica, aconselhamento particular e aprovação de novos servos.</p>
        </div>

        <button
          onClick={handleManualActionRefresh}
          className="inline-flex self-start sm:self-center bg-white hover:bg-[#F5F2ED] text-[#1A2E44] font-bold text-xs px-4 py-2 rounded-xl border border-[#EEEAE5] transition-colors cursor-pointer"
        >
          🔄 Recarregar Dados
        </button>
      </div>

      {/* Grid of Shepherd metrics counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-[#F0EDEA] p-6 card-shadow space-y-1">
          <span className="text-[10px] font-bold text-[#8C847C] uppercase tracking-widest flex items-center gap-1.5">
            <Users size={14} className="text-[#C5A059]" /> Servos Ativos
          </span>
          <p className="text-2xl font-extrabold text-[#2D2926] font-mono leading-none pt-1">{totalActives}</p>
        </div>
        <div className="bg-white rounded-3xl border border-[#F0EDEA] p-6 card-shadow space-y-1">
          <span className="text-[10px] font-bold text-[#8C847C] uppercase tracking-widest flex items-center gap-1.5">
            <CheckCircle size={14} className="text-[#B45309]" /> Cadastros Pendentes
          </span>
          <p className="text-2xl font-extrabold text-[#2D2926] font-mono leading-none pt-1">{totalPendings}</p>
        </div>
        <div className="bg-white rounded-3xl border border-[#F0EDEA] p-6 card-shadow space-y-1">
          <span className="text-[10px] font-bold text-[#8C847C] uppercase tracking-widest flex items-center gap-1.5">
            <FileText size={14} className="text-[#1A2E44]" /> Respostas Novas
          </span>
          <p className="text-2xl font-extrabold text-[#2D2926] font-mono leading-none pt-1">{answersPendingCount}</p>
        </div>
      </div>

      {/* Interactive horizontal tabs indicator */}
      <div className="border-b border-[#EEEAE5] flex gap-6 text-xs font-bold leading-none uppercase tracking-wider mb-6">
        <button
          onClick={() => setActiveSubTab('servos')}
          className={`pb-3.5 transition-colors shrink-0 cursor-pointer ${
            activeSubTab === 'servos' ? 'text-[#1A2E44] border-b-2 border-[#1A2E44]' : 'text-[#8C847C] hover:text-[#2D2926]'
          }`}
        >
          Servos & Caminhada ({servos.filter(s => s.role === 'servo').length})
        </button>
        <button
          onClick={() => setActiveSubTab('respostas')}
          className={`pb-3.5 transition-colors shrink-0 cursor-pointer ${
            activeSubTab === 'respostas' ? 'text-[#1A2E44] border-b-2 border-[#1A2E44]' : 'text-[#8C847C] hover:text-[#2D2926]'
          }`}
        >
          Respostas Devocionais ({answers.length})
        </button>
      </div>

      {/* TAB: VOLUNTEER/SERVO LIST */}
      {activeSubTab === 'servos' && (
        <div className="bg-white rounded-3xl border border-[#F0EDEA] card-shadow overflow-hidden space-y-5 p-6">
          <div className="flex items-center bg-[#F5F2ED] px-4 py-2.5 rounded-2xl border border-[#EEEAE5] max-w-sm">
            <Search size={16} className="text-[#8C847C] shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, e-mail ou célula..."
              className="text-xs text-[#2D2926] bg-transparent focus:outline-none w-full font-semibold font-sans"
            />
          </div>

          <div className="overflow-x-auto border border-[#EEEAE5] rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5F2ED]/60 border-b border-[#EEEAE5] text-[10px] font-bold uppercase tracking-wider text-[#8C847C]">
                  <th className="p-4">Nome & Perfil</th>
                  <th className="p-4">Célula / Contato</th>
                  <th className="p-4">Devocionais</th>
                  <th className="p-4">Sinalização</th>
                  <th className="p-4">Controle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEEAE5] font-sans">
                {servos
                  .filter(servo => {
                    const combined = `${servo.displayName} ${servo.email} ${servo.celula}`.toLowerCase();
                    return combined.includes(searchQuery.toLowerCase());
                  })
                  .map(servo => {
                    const studentAnswersCount = answers.filter(a => a.userId === servo.uid).length;
                    const alertBadge = getServoCaminhadaBadge(servo);

                    return (
                      <tr key={servo.uid} className="hover:bg-[#F5F2ED]/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {servo.photoURL ? (
                              <img src={servo.photoURL} alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#EEEAE5]" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#1A2E44] flex items-center justify-center font-bold text-white shrink-0 uppercase">
                                {servo.displayName?.charAt(0) || 'S'}
                              </div>
                            )}
                            <div className="space-y-0.5 truncate max-w-xs">
                              <p className="font-bold text-[#2D2926] truncate">{servo.displayName}</p>
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[8px] font-bold uppercase bg-[#F5F2ED] border border-[#EEEAE5] text-[#B45309]">
                                {servo.role}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-[#2D2926]">{servo.celula || "Célula não listada"}</p>
                            <p className="text-[10px] text-[#8C847C] font-semibold font-mono">{servo.email}</p>
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-[#2D2926]">
                          {studentAnswersCount} / 15
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full font-bold text-[9px] uppercase tracking-wider leading-none ${alertBadge.style}`}>
                            {alertBadge.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => setSelectedServoIdForDetail(servo.uid)}
                            className="text-xs text-[#1A2E44] font-bold hover:text-[#C5A059] transition-colors cursor-pointer"
                          >
                            Abrir Ficha
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: DEVOTO RESPONSES FILTERS */}
      {activeSubTab === 'respostas' && (
        <div className="bg-white rounded-3xl border border-[#F0EDEA] card-shadow p-6 md:p-8 space-y-6">
          <div className="border-b border-[#F0EDEA] pb-3">
            <h3 className="text-[#2D2926] font-serif font-bold text-lg">Respostas Ativas</h3>
            <p className="text-[#8C847C] text-xs mt-0.5 font-sans">Análise e consolidação das meditações diárias concluídas por estudantes.</p>
          </div>

          <div className="space-y-4">
            {answers.length > 0 ? (
              answers.map(ans => {
                const studentProfile = servos.find(s => s.uid === ans.userId);
                const correlatedLesson = lessons.find(l => l.id === ans.lessonId);

                return (
                  <div key={ans.id} className="bg-[#F5F2ED]/45 rounded-3xl border border-[#F0EDEA] p-6 space-y-4 shadow-sm hover:shadow transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EEEAE5] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D2926] font-serif text-md">{studentProfile?.displayName || ans.userEmail}</span>
                        <span className="text-[#8C847C] text-[10px]">•</span>
                        <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-widest">{correlatedLesson?.title || "Aula Devocional"}</span>
                      </div>
                      <span className="text-[10px] text-[#8C847C] font-semibold font-mono">
                        Enviada em: {new Date(ans.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="space-y-4 text-xs font-sans">
                      <div>
                        <p className="font-bold text-[#8C847C]">1. Palavra ou frase em destaque:</p>
                        <p className="text-[#2D2926] leading-relaxed font-semibold bg-white p-2.5 rounded-xl border border-[#EEEAE5]/50 mt-1">"{ans.answers.q1}"</p>
                      </div>
                      <div>
                        <p className="font-bold text-[#8C847C]">2. O que confronta ou forma em você:</p>
                        <p className="text-[#2D2926] leading-relaxed italic bg-white p-2.5 rounded-xl border border-[#EEEAE5]/50 mt-1">"{ans.answers.q2}"</p>
                      </div>
                      <div>
                        <p className="font-bold text-[#B45309]">3. Decisão prática para a semana:</p>
                        <p className="text-[#2D2926] leading-relaxed font-bold bg-[#F5F2ED] p-3 rounded-xl border border-[#EEEAE5] mt-1">"{ans.answers.q3}"</p>
                      </div>
                      <div>
                        <p className="font-bold text-[#1A2E44]">4. Oração consagratória:</p>
                        <p className="text-[#2D2926] leading-relaxed font-mono font-medium mt-1">"{ans.answers.q4}"</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 items-center pt-4 border-t border-[#EEEAE5] justify-between text-[10px] font-bold text-[#8C847C]">
                      <div className="flex items-center gap-2">
                        <span>Feedback Liderança: <span className="uppercase text-[#1A2E44] font-extrabold">{ans.status}</span></span>
                        {ans.wantsLeaderConversation && (
                          <span className="bg-red-50 text-red-700 border border-red-250 roundedpx-2 py-0.5 font-bold uppercase tracking-widest text-[8px]">
                            SOLICITOU CONVERSA
                          </span>
                        )}
                      </div>

                      {ans.status === 'nova' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateAnswerStatus(ans.id || '', 'lida')}
                            className="bg-white hover:bg-[#F5F2ED] text-[#8C847C] border border-[#EEEAE5] rounded-xl px-3 py-1.5 cursor-pointer font-bold"
                          >
                            Marcar como Lido
                          </button>
                          <button
                            onClick={() => handleUpdateAnswerStatus(ans.id || '', 'acompanhada')}
                            className="bg-[#1A2E44] hover:bg-opacity-95 text-white rounded-xl px-3 py-1.5 cursor-pointer font-bold"
                          >
                            Marcar como Acompanhado
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-[#F5F2ED]/40 border border-[#EEEAE5] rounded-3xl py-12 text-center text-xs text-[#8C847C] font-semibold">
                Nenhuma resposta devocional registrada na plataforma ainda.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
