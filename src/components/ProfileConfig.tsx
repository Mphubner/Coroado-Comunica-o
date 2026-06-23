import React, { useState } from 'react';
import { UserProfile, LessonProgress, DevotionalAnswer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, MapPin, Phone, Bookmark, CheckCircle, Award, 
  Send, Shield, Check, Info, AlertCircle, ExternalLink 
} from 'lucide-react';

interface ProfileConfigProps {
  userProfile: UserProfile;
  progress: LessonProgress[];
  answers: DevotionalAnswer[];
}

export const ProfileConfig: React.FC<ProfileConfigProps> = ({
  userProfile,
  progress,
  answers
}) => {
  const { updateProfileDetails } = useAuth();

  // Form states
  const [displayName, setDisplayName] = useState(userProfile.displayName || '');
  const [celula, setCelula] = useState(userProfile.celula || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [endereco, setEndereco] = useState(userProfile.endereco || '');
  const [areaInteresse, setAreaInteresse] = useState(userProfile.areaInteresse || '');

  // UI state
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  // Statistics
  const completedLessons = progress.filter(p => p.status === 'concluida').length;
  const totalLessonsCount = 15; // Set curriculum size standard
  const completedPercent = Math.round((completedLessons / totalLessonsCount) * 100);
  const answeredDevotionalsCount = answers.length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await updateProfileDetails({
        displayName,
        celula,
        phone,
        endereco,
        areaInteresse
      });
      setSuccessMsg('Seu perfil foi atualizado com sucesso no banco de dados!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setErrorMsg('Ocorreu um erro ao atualizar os seus dados. Tente novamente.');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const isEligibleForCertificate = completedLessons >= totalLessonsCount;

  return (
    <div className="space-y-8 select-none animate-fade-in pb-24 text-[#2D2926]">
      
      <div className="space-y-1.5">
        <h1 className="text-[#2D2926] font-serif font-bold text-2xl md:text-3xl tracking-tight leading-snug">Meu Perfil & Configurações</h1>
        <p className="text-[#8C847C] text-sm font-sans">Atualize seus dados ministeriais de contato, confira suas estatísticas de caminhada e emita seu certificado.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-250 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-800 border border-red-250 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: User Statistics & Profile Badge */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#F0EDEA] p-6 card-shadow text-center space-y-5">
            <div className="relative inline-block">
              {userProfile.photoURL ? (
                <img 
                  src={userProfile.photoURL} 
                  alt={userProfile.displayName || 'Servo'} 
                  className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-[#C5A059]" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#1A2E44] mx-auto flex items-center justify-center text-white font-serif font-bold text-2xl">
                  {userProfile.displayName?.charAt(0) || 'S'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 bg-[#C5A059] text-white p-1 rounded-full text-[10px] shadow-md">
                <Shield size={12} />
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-[#2D2926] font-serif font-bold text-lg leading-snug">{userProfile.displayName}</h3>
              <p className="text-[#8C847C] text-xs font-mono">{userProfile.email}</p>
              <div className="pt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F5F2ED] text-[#B45309] border border-[#EEEAE5]">
                  Função: {userProfile.role}
                </span>
              </div>
            </div>

            <div className="border-t border-[#F0EDEA] pt-4 grid grid-cols-2 gap-2 text-left">
              <div className="bg-[#F5F2ED]/50 p-3 rounded-2xl border border-[#EEEAE5] text-center">
                <p className="text-[10px] text-[#8C847C] font-bold uppercase tracking-wider">Aulas</p>
                <p className="text-lg font-extrabold text-[#2D2926] font-mono mt-0.5">{completedLessons}/{totalLessonsCount}</p>
              </div>
              <div className="bg-[#F5F2ED]/50 p-3 rounded-2xl border border-[#EEEAE5] text-center">
                <p className="text-[10px] text-[#8C847C] font-bold uppercase tracking-wider">Devocionais</p>
                <p className="text-lg font-extrabold text-[#2D2926] font-mono mt-0.5">{answeredDevotionalsCount}/{totalLessonsCount}</p>
              </div>
            </div>

            {/* Curriculum Progress Fill Bar */}
            <div className="space-y-1.5 text-left text-xs">
              <div className="flex justify-between font-semibold">
                <span className="text-[#8C847C]">Progresso Acadêmico</span>
                <span className="text-[#1A2E44]">{completedPercent}%</span>
              </div>
              <div className="w-full bg-[#F5F2ED] h-2 rounded-full overflow-hidden border border-[#EEEAE5]">
                <div 
                  className="bg-[#C5A059] h-full rounded-full transition-all duration-500"
                  style={{ width: `${completedPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Certificate reward card */}
          <div className="bg-[#1A2E44] rounded-3xl p-6 border border-[#2D2926]/40 text-white space-y-4 shadow-lg">
            <div className="w-10 h-10 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
              <Award size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-[#F5F2ED] text-md">Certificação de Formação Coroado</h4>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                Conclua as 15 aulas da trilha e preencha os respectivos devocionais para consolidar seu aprendizado e desbloquear seu Certificado de Conclusão Ministerial.
              </p>
            </div>

            {isEligibleForCertificate ? (
              <button
                onClick={() => setShowCertificate(true)}
                className="w-full bg-[#C5A059] hover:bg-opacity-95 text-[#1A2E44] font-extrabold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Visualizar meu Certificado</span>
                <ExternalLink size={12} />
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 p-3 rounded-2xl text-[11px] leading-snug text-stone-300 w-full font-sans font-medium">
                <Info size={14} className="text-[#C5A059] shrink-0" />
                <span>Status: Mais de {totalLessonsCount - completedLessons} lições necessárias para liberação.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Interactive Profile update Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-[#F0EDEA] p-6 md:p-8 card-shadow space-y-6">
            <div className="border-b border-[#F0EDEA] pb-3">
              <h3 className="text-[#2D2926] font-serif font-bold text-lg">Dados Cadastrais e de Contato</h3>
              <p className="text-[#8C847C] text-xs font-sans mt-0.5">Mantenha seus dados atualizados para que a coordenação do ministério possa entrar em contato.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-5 text-xs font-sans">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. displayName */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#8C847C] uppercase tracking-wider flex items-center gap-1.5">
                    <User size={13} className="text-[#C5A059]" />
                    <span>Seu Nome Completo</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Ex: Ana Souza"
                    className="w-full font-semibold bg-[#F5F2ED]/50 outline-none border border-[#EEEAE5] rounded-2xl px-4 py-3 focus:bg-white focus:border-[#C5A059] transition-all text-[#2D2926]"
                  />
                </div>

                {/* 2. celula */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#8C847C] uppercase tracking-wider flex items-center gap-1.5">
                    <Bookmark size={13} className="text-[#C5A059]" />
                    <span>Nome ou Número da Célula</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={celula}
                    onChange={e => setCelula(e.target.value)}
                    placeholder="Ex: Célula Betel"
                    className="w-full font-semibold bg-[#F5F2ED]/50 outline-none border border-[#EEEAE5] rounded-2xl px-4 py-3 focus:bg-white focus:border-[#C5A059] transition-all text-[#2D2926]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 font-sans">
                {/* 3. phone */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#8C847C] uppercase tracking-wider flex items-center gap-1.5">
                    <Phone size={13} className="text-[#C5A059]" />
                    <span>Telefone / WhatsApp</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Ex: (47) 99999-9999"
                    className="w-full font-semibold bg-[#F5F2ED]/50 outline-none border border-[#EEEAE5] rounded-2xl px-4 py-3 focus:bg-white focus:border-[#C5A059] transition-all text-[#2D2926]"
                  />
                </div>

                {/* 4. areaInteresse */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-[#8C847C] uppercase tracking-wider flex items-center gap-1.5">
                    <Bookmark size={13} className="text-[#C5A059]" />
                    <span>Segmento Ministerial de Trabalho</span>
                  </label>
                  <select
                    value={areaInteresse}
                    onChange={e => setAreaInteresse(e.target.value)}
                    className="w-full font-semibold bg-[#F5F2ED]/50 outline-none border border-[#EEEAE5] rounded-2xl px-4 py-3 focus:bg-white focus:border-[#C5A059] transition-all text-[#2D2926]"
                  >
                    <option value="">Selecione um segmento...</option>
                    <option value="Midias Sociais">Mídias Sociais / Redes</option>
                    <option value="Fotografia">Fotografia / Imagem</option>
                    <option value="Sonorizacao">Sonorização / Áudio</option>
                    <option value="Projecao">Projeção / Letras / Mídia local</option>
                    <option value="Design Grafico">Design / Identidade Visual</option>
                    <option value="Transmissao">Transmissão Online / Live</option>
                    <option value="Lideranca">Liderança Geral / Coordenação</option>
                  </select>
                </div>
              </div>

              {/* 5. endereco */}
              <div className="space-y-1.5 font-sans">
                <label className="block font-bold text-[#8C847C] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#C5A059]" />
                  <span>Seu Endereço Residencial</span>
                </label>
                <input
                  type="text"
                  required
                  value={endereco}
                  onChange={e => setEndereco(e.target.value)}
                  placeholder="Ex: Rua, Número, Bairro, Cidade"
                  className="w-full font-semibold bg-[#F5F2ED]/50 outline-none border border-[#EEEAE5] rounded-2xl px-4 py-3 focus:bg-white focus:border-[#C5A059] transition-all text-[#2D2926]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 bg-[#1A2E44] hover:bg-opacity-95 disabled:bg-stone-400 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  <span>{saving ? 'Gravando Alterações...' : 'Salvar Dados Cadastrais'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>

      {/* --- PREMIUM DIPLOMA MODAL OVERLAY --- */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowCertificate(false)}>
          <div 
            className="w-full max-w-2xl bg-[#F5F2ED] border-4 border-[#C5A059] rounded-[40px] p-6 md:p-12 text-center text-[#1A2E44] relative shadow-2xl space-y-8 select-none border-double"
            onClick={e => e.stopPropagation()}
          >
            {/* Certificate Header details */}
            <div className="space-y-2">
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center p-1.5">
                <img src="/coroa-circulo-branca.png" alt="Coroa" className="w-full h-full object-contain invert" />
              </div>
              <p className="text-[#8C847C] font-semibold text-[10px] uppercase tracking-[0.2em] font-sans">IGREJA COROADO</p>
              <h2 className="text-2xl md:text-4xl font-serif font-extrabold tracking-tight text-[#1A2E44]">CERTIFICADO</h2>
              <p className="text-[#C5A059] font-serif italic text-xs md:text-sm font-medium">De Conclusão do Curso Ministerial de Comunicação</p>
            </div>

            {/* Main Statement body */}
            <div className="space-y-4 max-w-lg mx-auto font-serif">
              <p className="text-xs md:text-sm text-[#8C847C] uppercase tracking-wider">Certifica-se com honra que</p>
              <h3 className="text-xl md:text-3xl font-extrabold text-[#1A2E44] tracking-tight">{userProfile.displayName}</h3>
              <p className="text-xs text-[#2D2926] leading-relaxed">
                dedicou-se diligentemente à formação pedagógica e devocional diária, completando com louvor todas as **15 aulas** curriculares do Ministério de Comunicação. Reconhecemos a sua maturidade, capacitação ministerial e serviço voluntário de excelência para a expansão do Reino.
              </p>
            </div>

            {/* Date Details and Pastor Line signatures */}
            <div className="border-t border-[#C5A059]/30 pt-6 grid grid-cols-2 gap-4 max-w-md mx-auto text-[10px] font-sans">
              <div className="space-y-1">
                <p className="font-extrabold uppercase text-[#1A2E44] border-b border-[#2D2926]/20 pb-1.5 mx-auto max-w-[140px] font-mono">
                  {new Date().toLocaleDateString('pt-BR')}
                </p>
                <p className="text-[#8C847C] font-semibold">Data de Conclusão</p>
              </div>
              <div className="space-y-1">
                <p className="font-serif italic font-semibold text-[#1A2E44] border-b border-[#2D2926]/20 pb-1 mx-auto max-w-[140px]">
                  Marcos P. Hübner
                </p>
                <p className="text-[#8C847C] font-semibold">Coordenação Geral</p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="mt-4 bg-[#1A2E44] hover:bg-opacity-95 text-white font-bold text-xs px-6 py-2.5 rounded-full transition-colors cursor-pointer"
            >
              Imprimir Certificado (PDF)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
