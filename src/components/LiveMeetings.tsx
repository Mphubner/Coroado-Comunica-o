import React, { useState, useEffect } from 'react';
import { WeeklyMeeting, MeetingAttendance, Lesson } from '../types';
import { 
  Calendar, Video, ExternalLink, CheckCircle, HelpCircle, FileVideo, 
  Plus, Edit, Trash, X, Save, Clock, ChevronDown, Check, Link, AlertTriangle
} from 'lucide-react';
import { doc, setDoc, collection, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface LiveMeetingsProps {
  userId: string;
  userEmail: string;
  userRole?: 'servo' | 'lider' | 'admin';
  meetings: WeeklyMeeting[];
  attendance: MeetingAttendance[];
  lessons: Lesson[];
  onRefreshMeetings: () => void;
}

export const LiveMeetings: React.FC<LiveMeetingsProps> = ({
  userId,
  userEmail,
  userRole = 'servo',
  meetings,
  attendance,
  lessons,
  onRefreshMeetings
}) => {
  const isLiderOrAdmin = userRole === 'lider' || userRole === 'admin';
  const [submittingRsvp, setSubmittingRsvp] = useState(false);

  // Management States
  const [showForm, setShowForm] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [submittingMeeting, setSubmittingMeeting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [type, setType] = useState<'youtube_live' | 'google_meet' | 'both' | 'in_person'>('google_meet');
  const [googleMeetUrl, setGoogleMeetUrl] = useState('');
  const [youtubeLiveUrl, setYoutubeLiveUrl] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [status, setStatus] = useState<'agendada' | 'ao_vivo' | 'encerrada' | 'cancelada'>('agendada');
  const [relatedLessonId, setRelatedLessonId] = useState('');

  // Auxiliary formatting logic
  const formatIsoToDatetimeLocal = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const extractYoutubeVideoId = (url: string): string | undefined => {
    if (!url) return undefined;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : undefined;
  };

  // Open the form in creation mode
  const handleOpenCreateForm = () => {
    setEditingMeetingId(null);
    setTitle('');
    setDescription('');
    setStartAt(formatIsoToDatetimeLocal(new Date().toISOString()));
    setEndAt('');
    setType('google_meet');
    setGoogleMeetUrl('');
    setYoutubeLiveUrl('');
    setRecordingUrl('');
    setStatus('agendada');
    setRelatedLessonId('');
    setShowForm(true);
  };

  // Open the form in editing mode for an existing meeting
  const handleOpenEditForm = (meeting: WeeklyMeeting) => {
    setEditingMeetingId(meeting.id || null);
    setTitle(meeting.title || '');
    setDescription(meeting.description || '');
    setStartAt(formatIsoToDatetimeLocal(meeting.startAt));
    setEndAt(formatIsoToDatetimeLocal(meeting.endAt));
    setType(meeting.type || 'google_meet');
    setGoogleMeetUrl(meeting.googleMeetUrl || '');
    setYoutubeLiveUrl(meeting.youtubeLiveUrl || '');
    setRecordingUrl(meeting.recordingUrl || '');
    setStatus(meeting.status || 'agendada');
    setRelatedLessonId(meeting.relatedLessonId || '');
    setShowForm(true);
  };

  // Form Submission handles both Create & Edit
  const handleSaveMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startAt) return;
    setSubmittingMeeting(true);

    const parsedYoutubeVideoId = youtubeLiveUrl ? extractYoutubeVideoId(youtubeLiveUrl) : undefined;

    const payload: Partial<WeeklyMeeting> = {
      title,
      description,
      startAt: new Date(startAt).toISOString(),
      endAt: endAt ? new Date(endAt).toISOString() : undefined,
      type,
      googleMeetUrl: type === 'google_meet' || type === 'both' ? googleMeetUrl : '',
      youtubeLiveUrl: type === 'youtube_live' || type === 'both' ? youtubeLiveUrl : '',
      youtubeVideoId: parsedYoutubeVideoId,
      recordingUrl: recordingUrl || '',
      status,
      relatedLessonId: relatedLessonId || undefined,
      updatedAt: new Date().toISOString()
    };

    // Remove undefined values to prevent Firestore errors
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    try {
      if (editingMeetingId) {
        // Edit Mode
        const meetingRef = doc(db, 'weeklyMeetings', editingMeetingId);
        await updateDoc(meetingRef, payload);
      } else {
        // Create Mode
        const newDoc = {
          ...payload,
          title: payload.title!,
          description: payload.description || '',
          startAt: payload.startAt!,
          type: payload.type!,
          status: payload.status!,
          createdBy: userId,
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'weeklyMeetings'), newDoc);
      }
      setShowForm(false);
      onRefreshMeetings();
    } catch (err) {
      console.error("Error saving meeting:", err);
      handleFirestoreError(err, OperationType.WRITE, `weeklyMeetings/${editingMeetingId || 'new'}`);
    } finally {
      setSubmittingMeeting(false);
    }
  };

  // Delete Meeting execution
  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      await deleteDoc(doc(db, 'weeklyMeetings', meetingId));
      setConfirmDeleteId(null);
      onRefreshMeetings();
    } catch (err) {
      console.error("Error deleting meeting:", err);
      handleFirestoreError(err, OperationType.DELETE, `weeklyMeetings/${meetingId}`);
    }
  };

  // Parse meetings into Upcoming and Past categories
  const now = new Date();
  
  const upcomingMeetings = meetings
    .filter(m => m.status === 'agendada' || m.status === 'ao_vivo' || new Date(m.startAt) >= now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const pastMeetings = meetings
    .filter(m => m.status === 'encerrada' || new Date(m.startAt) < now)
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  // Get RSVP status for a given meeting
  const getRsvpStatus = (meetingId: string) => {
    const rsvp = attendance.find(a => a.meetingId === meetingId && a.userId === userId);
    return rsvp ? rsvp.status : null;
  };

  // Submit RSVP (Confirm presence)
  const handleRsvp = async (meetingId: string, status: 'confirmado' | 'ausente') => {
    if (submittingRsvp) return;
    setSubmittingRsvp(true);

    const attendanceId = `${userId}_${meetingId}`;
    const attendanceRef = doc(db, 'meetingAttendance', attendanceId);

    const payload: MeetingAttendance = {
      meetingId,
      userId,
      userEmail,
      status,
      confirmedAt: new Date().toISOString()
    };

    try {
      await setDoc(attendanceRef, payload);
      onRefreshMeetings();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `meetingAttendance/${attendanceId}`);
    } finally {
      setSubmittingRsvp(false);
    }
  };

  const getLessonTitle = (lessonId?: string) => {
    if (!lessonId) return "";
    const match = lessons.find(l => l.id === lessonId);
    return match ? `Aula Associada: ${match.title}` : "";
  };

  return (
    <div className="space-y-8 select-none animate-fade-in pb-16 text-[#2D2926]">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-[#2D2926] font-serif font-bold text-2xl md:text-3xl tracking-tight leading-snug">Reuniões Ao Vivo</h1>
          <p className="text-[#8C847C] text-sm font-sans">
            Acompanhe os encontros semanais, marque presença no Google Meet e revise gravações passadas.
          </p>
        </div>

        {isLiderOrAdmin && (
          <button
            onClick={handleOpenCreateForm}
            className="inline-flex items-center gap-2 bg-[#1A2E44] hover:bg-opacity-95 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
          >
            <Plus size={14} />
            <span>Criar Nova Reunião</span>
          </button>
        )}
      </div>

      {/* --- WEEKLY MEETING EDIT / AGENDAMENTO FORM OVERLAY --- */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowForm(false)}>
          <div 
            className="w-full max-w-2xl bg-white rounded-[32px] border border-[#F0EDEA] p-6 md:p-8 relative shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F0EDEA] pb-3">
              <div>
                <h3 className="text-[#2D2926] font-serif font-bold text-xl">
                  {editingMeetingId ? "Editar Detalhes da Reunião" : "Agendar Novo Encontro Ao Vivo"}
                </h3>
                <p className="text-[#8C847C] text-xs font-sans mt-0.5">Preencha os dados e anexe os links do Google Meet ou YouTube.</p>
              </div>
              <button 
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-full hover:bg-[#F5F2ED] text-[#8C847C] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMeeting} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Título do Encontro *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Alinhamento Prático: Feedback Temas 1 a 4"
                  className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-xs text-[#2D2926]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Descrição detalhada</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Explique o objetivo do encontro, assuntos que serão pautados e instruções adicionais de engajamento..."
                  className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-xs text-[#2D2926] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Início do Encontro *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startAt}
                    onChange={e => setStartAt(e.target.value)}
                    className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-xs text-[#2D2926]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Término Aproximado (Opcional)</label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={e => setEndAt(e.target.value)}
                    className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-xs text-[#2D2926]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Formato da Reunião</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as any)}
                    className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-xs text-[#2D2926]"
                  >
                    <option value="google_meet">📹 Apenas Google Meet</option>
                    <option value="youtube_live">🔴 Apenas Transmissão YouTube Live</option>
                    <option value="both">⚡ Transmissão Dupla (Meet + YouTube)</option>
                    <option value="in_person">⛪ Encontro Presencial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Status da Reunião</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-xs text-[#2D2926]"
                  >
                    <option value="agendada">📅 Agendada / Futura</option>
                    <option value="ao_vivo">🔴 No Ar / Ao Vivo Agora</option>
                    <option value="encerrada">🏁 Concluída / Encerrada</option>
                    <option value="cancelada">❌ Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#8C847C] uppercase tracking-wider block">Aula ou Guia Associado</label>
                <select
                  value={relatedLessonId}
                  onChange={e => setRelatedLessonId(e.target.value)}
                  className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-xs text-[#2D2926]"
                >
                  <option value="">Nenhuma aula ligada...</option>
                  {lessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                  ))}
                </select>
              </div>

              {(type === 'google_meet' || type === 'both') && (
                <div className="space-y-1 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
                  <label className="font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                    <Video size={12} className="text-emerald-600" />
                    <span>Link do Google Meet *</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={googleMeetUrl}
                    onChange={e => setGoogleMeetUrl(e.target.value)}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full bg-white border border-[#EEEAE5] focus:outline-none focus:border-emerald-600 rounded-xl p-2.5 font-semibold text-xs text-[#2D2926] mt-1"
                  />
                </div>
              )}

              {(type === 'youtube_live' || type === 'both') && (
                <div className="space-y-1 bg-amber-50/40 p-3.5 rounded-2xl border border-amber-150">
                  <label className="font-bold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
                    <FileVideo size={12} className="text-[#B45309]" />
                    <span>Link do Evento no YouTube Live *</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={youtubeLiveUrl}
                    onChange={e => setYoutubeLiveUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full bg-white border border-[#EEEAE5] focus:outline-none focus:border-[#B45309] rounded-xl p-2.5 font-semibold text-xs text-[#2D2926] mt-1"
                  />
                  <p className="text-[10px] text-[#8C847C] font-semibold mt-1">O link será automaticamente processado para renderização do player incorporado.</p>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-[#8C847C] uppercase tracking-wider block">URL da Gravação (Após encerramento)</label>
                <input
                  type="url"
                  value={recordingUrl}
                  onChange={e => setRecordingUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... ou Link de compartilhamento"
                  className="w-full bg-[#F5F2ED] border border-[#EEEAE5] focus:outline-none focus:border-[#C5A059] rounded-xl p-3 font-semibold text-xs text-[#2D2926]"
                />
              </div>

              <div className="pt-4 border-t border-[#F0EDEA] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="border border-[#EEEAE5] hover:bg-[#F5F2ED] text-[#8C847C] font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingMeeting}
                  className="bg-[#1A2E44] hover:bg-opacity-95 disabled:bg-stone-400 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save size={14} />
                  <span>{submittingMeeting ? 'Gravando...' : 'Confirmar e Publicar'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* 1. UPCOMING / ACTIVE MEETING VIEW */}
      <div className="space-y-4">
        <h2 className="text-[#8C847C] font-semibold text-xs uppercase tracking-[0.2em] pl-1">Próximos Encontros agendados</h2>
        
        {upcomingMeetings.length > 0 ? (
          <div className="space-y-6">
            {upcomingMeetings.map(meeting => {
              const rsvp = getRsvpStatus(meeting.id || '');
              const isLive = meeting.status === 'ao_vivo';

              return (
                <div 
                  key={meeting.id}
                  className={`bg-white rounded-3xl border p-6 md:p-8 card-shadow space-y-6 relative overflow-hidden transition-all ${
                    isLive ? 'border-[#C5A059] ring-1 ring-[#C5A059]/20' : 'border-[#F0EDEA]'
                  }`}
                >
                  {/* Absolute Badge for Live events or Edit menu for leaders */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {isLive && (
                      <span className="flex items-center gap-1.5 bg-[#B45309] text-white font-extrabold text-[9px] tracking-widest px-2.5 py-1 rounded-full animate-pulse uppercase">
                        ● AO VIVO AGORA
                      </span>
                    )}

                    {isLiderOrAdmin && (
                      <div className="flex items-center gap-1 bg-[#F5F2ED] border border-[#EEEAE5] rounded-xl p-1 shadow-sm">
                        <button
                          onClick={() => handleOpenEditForm(meeting)}
                          title="Editar reunião"
                          className="p-1 px-2 rounded-lg text-stone-700 hover:text-[#C5A059] hover:bg-[#EAE5DF] transition-colors cursor-pointer"
                        >
                          <Edit size={12} />
                        </button>
                        
                        {confirmDeleteId === meeting.id ? (
                          <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded-lg border border-red-200">
                            <button
                              onClick={() => handleDeleteMeeting(meeting.id!)}
                              className="text-[10px] bg-red-600 hover:bg-red-700 font-bold text-white px-2 py-0.5 rounded transition-colors"
                            >
                              Sim
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] text-stone-600 hover:bg-stone-200 px-2 py-0.5 rounded transition-colors"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(meeting.id!)}
                            title="Apagar reunião"
                            className="p-1 px-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="space-y-3 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[#F5F2ED] text-[#B45309] border border-[#EEEAE5]">
                          {meeting.type.replaceAll('_', ' ')}
                        </span>
                        {meeting.relatedLessonId && (
                          <span className="text-[10px] text-[#8C847C] font-semibold truncate bg-[#F5F2ED]/60 px-2.5 py-1 rounded-full border border-[#EEEAE5]/50 font-serif">
                            {getLessonTitle(meeting.relatedLessonId)}
                          </span>
                        )}
                      </div>

                      <h3 className="text-[#2D2926] font-serif font-bold text-lg md:text-xl leading-snug">{meeting.title}</h3>
                      <p className="text-[#8C847C] text-sm leading-relaxed font-sans">{meeting.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#8C847C] pt-1">
                        <span className="flex items-center gap-1 text-[#1A2E44]">
                          <Clock size={12} />
                          Início: {new Date(meeting.startAt).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        {meeting.endAt && (
                          <span>| Término aproximado: {new Date(meeting.endAt).toLocaleTimeString('pt-BR', { timeStyle: 'short' })}</span>
                        )}
                      </div>
                    </div>

                    {/* Interactive RSVP panel */}
                    <div className="bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-2xl p-5 lg:w-72 shrink-0 flex flex-col justify-between space-y-4 text-xs">
                      <div>
                        <h4 className="font-bold text-[#1A2E44] font-serif text-sm">Seu RSVP</h4>
                        <p className="text-[#8C847C] text-[10px] leading-snug mt-1 font-sans">Sua confirmação auxilia os moderadores na interatividade virtual.</p>
                      </div>

                      {rsvp ? (
                        <div className="flex items-center justify-between p-2.5 bg-white border border-[#EEEAE5] text-[#B45309] rounded-xl font-bold font-sans">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle size={15} className="text-[#B45309]" />
                            <span>Presença Confirmada ({rsvp})</span>
                          </div>
                          <button
                            onClick={() => handleRsvp(meeting.id || '', 'ausente')}
                            className="text-[10px] text-red-600 font-extrabold hover:underline"
                          >
                            Mudar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRsvp(meeting.id || '', 'confirmado')}
                            disabled={submittingRsvp}
                            className="bg-[#1A2E44] hover:bg-[#2A3E54] text-white font-extrabold flex-1 py-2.5 rounded-xl transition-all cursor-pointer text-center"
                          >
                            Sim, participarei!
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* YouTube Embed Player directly on meetings dashboard if relevant URL exists */}
                  {meeting.youtubeLiveUrl && meeting.youtubeVideoId && (
                    <div className="border-t border-[#F0EDEA] pt-6 space-y-3">
                      <h4 className="text-[#2D2926] font-serif font-bold text-sm flex items-center gap-1.5">
                        <Video size={14} className="text-[#C5A059]" />
                        Transmissão Incorporada do YouTube
                      </h4>
                      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#EEEAE5]">
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${meeting.youtubeVideoId}`}
                          title="YouTube live video"
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}

                  {/* CTAs row */}
                  {(meeting.googleMeetUrl || meeting.youtubeLiveUrl) && (
                    <div className="flex flex-wrap gap-3 border-t border-[#F0EDEA] pt-5">
                      {meeting.googleMeetUrl && (
                        <a
                          href={meeting.googleMeetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          <Video size={14} />
                          <span>Entrar no Google Meet</span>
                          <ExternalLink size={12} className="opacity-80" />
                        </a>
                      )}
                      {meeting.youtubeLiveUrl && (
                        <a
                          href={meeting.youtubeLiveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#B45309] hover:bg-opacity-90 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          <FileVideo size={14} />
                          <span>Assistir no YouTube</span>
                          <ExternalLink size={12} className="opacity-80" />
                        </a>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-white border border-[#F0EDEA] rounded-3xl p-6 card-shadow">
            <Calendar size={44} className="text-[#C5A059] mb-2 opacity-80" />
            <h4 className="text-[#2D2926] font-serif font-bold text-md">Nenhuma reunião semanal agendada no momento.</h4>
            <p className="text-xs text-[#8C847C] max-w-sm mt-1 font-sans">Classes coletivas e lives semanais serão anunciadas por fórum ou painel de tarefas.</p>
          </div>
        )}
      </div>

      {/* 2. HISTORIC / PAST RECORDS ARCHIVE */}
      <div className="space-y-4">
        <h2 className="text-[#8C847C] font-semibold text-xs uppercase tracking-[0.2em] pl-1">Gravações e Reuniões Anteriores</h2>
        
        {pastMeetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastMeetings.map(meeting => (
              <div 
                key={meeting.id}
                className="bg-white rounded-3xl border border-[#F0EDEA] p-6 card-shadow space-y-4 flex flex-col justify-between relative"
              >
                {/* Edit options inside past list too */}
                {isLiderOrAdmin && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-[#F5F2ED] border border-[#EEEAE5] rounded-xl p-1 shadow-sm">
                    <button
                      onClick={() => handleOpenEditForm(meeting)}
                      className="p-1 px-1.5 rounded-lg text-stone-700 hover:text-[#C5A059] hover:bg-[#EAE5DF] transition-colors cursor-pointer"
                    >
                      <Edit size={10} />
                    </button>
                    {confirmDeleteId === meeting.id ? (
                      <div className="flex items-center gap-0.5 bg-red-50 p-0.5 rounded border border-red-200">
                        <button
                          onClick={() => handleDeleteMeeting(meeting.id!)}
                          className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded transition-colors"
                        >
                          Apagar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(meeting.id!)}
                        className="p-1 px-1.5 rounded-lg text-red-650 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash size={10} />
                      </button>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-[#F5F2ED] text-[#B45309] font-bold px-2.5 py-1 rounded-full uppercase">
                      {meeting.type.replaceAll('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[#8C847C] font-semibold">
                      {new Date(meeting.startAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-[#2D2926] font-serif font-bold text-md leading-snug">{meeting.title}</h4>
                  <p className="text-[#8C847C] text-xs line-clamp-3 leading-relaxed font-sans">{meeting.description}</p>
                </div>

                {meeting.recordingUrl ? (
                  <div className="pt-3 border-t border-[#F0EDEA] space-y-3">
                    {meeting.youtubeVideoId && (
                      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#EEEAE5]">
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={`https://www.youtube.com/embed/${meeting.youtubeVideoId}`}
                          title="Recorded session"
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                    <a
                      href={meeting.recordingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#1A2E44] font-bold hover:text-[#C5A059] transition-colors"
                    >
                      <Video size={14} className="text-[#C5A059]" />
                      <span>Abrir Gravação Completa</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                ) : (
                  <div className="text-[10px] text-[#8C847C] pt-3 border-t border-[#F0EDEA] leading-relaxed italic font-sans">
                    Nenhum link de gravação ou vídeo foi anexado para essa aula concluída.
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-[#8C847C] pl-1 italic font-sans">Nenhum evento anterior catalogado.</p>
        )}
      </div>

    </div>
  );
};
