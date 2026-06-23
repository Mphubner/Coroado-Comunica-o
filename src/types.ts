export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  phone?: string;
  celula?: string;
  endereco?: string;
  areaInteresse?: string;
  role: 'servo' | 'lider' | 'admin';
  status: 'pendente' | 'ativo' | 'pausado' | 'bloqueado' | 'concluido';
  createdAt: any;
  updatedAt: any;
  lastLoginAt: any;
}

export interface Module {
  id?: string;
  title: string;
  description: string;
  order: number;
  active: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Lesson {
  id?: string;
  moduleId: string;
  title: string;
  order: number;
  objective: string;
  bibleReferences: string;
  openingQuestion?: string;
  summary: string;
  youtubeUrl?: string;
  youtubeVideoId?: string;
  driveDocUrl?: string;
  driveSlideUrl?: string;
  active: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Devotional {
  id?: string;
  lessonId: string;
  title: string;
  bibleReference: string;
  readingInstruction: string;
  guidedMeditation: string;
  suggestedPrayer: string;
  weeklyPractice: string;
  active: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface DevotionalQuestions {
  id?: string;
  devotionalId: string;
  question: string;
  type: 'text' | 'textarea' | 'boolean' | 'select';
  required: boolean;
  order: number;
  active: boolean;
}

export interface DevotionalAnswer {
  id?: string;
  userId: string;
  userEmail: string;
  devotionalId: string;
  lessonId: string;
  moduleId: string;
  answers: {
    q1: string; // Qual palavra ou frase chamou sua atenção?
    q2: string; // O que Deus está confrontando ou formando em você?
    q3: string; // Qual decisão prática você quer tomar esta semana?
    q4: string; // Escreva uma oração curta a partir deste devocional.
    q5: string; // Você deseja conversar com um líder sobre essa resposta? ("sim" ou "nao")
  };
  wantsLeaderConversation: boolean;
  status: 'nova' | 'lida' | 'acompanhada';
  createdAt: any;
  updatedAt: any;
  reviewedBy?: string;
  reviewedAt?: any;
}

export interface LessonProgress {
  id?: string;
  userId: string;
  lessonId: string;
  moduleId: string;
  status: 'nao_iniciada' | 'em_andamento' | 'concluida';
  percent: number;
  startedAt?: any;
  completedAt?: any;
  updatedAt?: any;
}

export interface DevotionalProgress {
  id?: string;
  userId: string;
  devotionalId: string;
  lessonId: string;
  status: 'pendente' | 'respondido' | 'concluido';
  answeredAt?: any;
  completedAt?: any;
  updatedAt?: any;
}

export interface SupportMaterial {
  id?: string;
  lessonId?: string;
  moduleId?: string;
  title: string;
  description?: string;
  type: 'youtube' | 'podcast' | 'article' | 'pdf' | 'drive' | 'presentation' | 'other';
  url: string;
  youtubeVideoId?: string;
  required: boolean;
  visibility: 'servos' | 'lideres' | 'admins';
  order: number;
  active: boolean;
  createdAt: any;
}

export interface WeeklyMeeting {
  id?: string;
  title: string;
  description: string;
  relatedLessonId?: string;
  relatedModuleId?: string;
  startAt: string; // date-time string
  endAt?: string; // date-time string
  type: 'youtube_live' | 'google_meet' | 'both' | 'in_person';
  googleMeetUrl?: string;
  youtubeLiveUrl?: string;
  youtubeVideoId?: string;
  recordingUrl?: string;
  calendarEventId?: string;
  status: 'agendada' | 'ao_vivo' | 'encerrada' | 'cancelada';
  createdBy?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface MeetingAttendance {
  id?: string;
  meetingId: string;
  userId: string;
  userEmail: string;
  status: 'confirmado' | 'presente' | 'ausente';
  confirmedAt?: any;
  markedBy?: string;
  markedAt?: any;
}

export interface LeaderNote {
  id?: string;
  userId: string; // Target servo
  leaderId: string; // ShepId
  lessonId?: string;
  devotionalAnswerId?: string;
  note: string;
  visibility: 'lideres_admins';
  createdAt: any;
  updatedAt?: any;
}

export interface PlatformSettings {
  name: string;
  mainPhrase: string;
  supportPhrase: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  contactEmail: string;
}
