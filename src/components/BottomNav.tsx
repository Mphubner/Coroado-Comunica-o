import React from 'react';
import { Home, BookOpen, Heart, Video, User, Users, FileText, Settings } from 'lucide-react';
import { UserProfile } from '../types';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, userProfile }) => {
  if (!userProfile) return null;

  const isLider = userProfile.role === 'lider' || userProfile.role === 'admin';
  const isAdmin = userProfile.role === 'admin';

  return (
    <>
      {/* Laptop & Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-sidebar text-white min-h-screen p-6 border-r border-white/10 shrink-0">
        <div className="mb-8 mt-2 scroll-py-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-black/15">
              <img src="/coroa-circulo-branca.png" alt="Coroa" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <div>
              <img src="/coroado-texto-branco.png" alt="Coroado" className="h-4 object-contain mb-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 ml-1 leading-none">Formação</p>
            </div>
          </div>
        </div>

        {/* User Mini Profile */}
        <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            {userProfile.photoURL ? (
              <img src={userProfile.photoURL} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-accent-gold flex items-center justify-center font-bold text-sm text-sidebar">
                {userProfile.displayName?.charAt(0) || 'S'}
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{userProfile.displayName}</p>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/10 text-white/80 capitalize border border-white/5 font-mono">
                {userProfile.role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="space-y-1.5 flex-1">
          <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Caminhada</p>
          <button
            onClick={() => setActiveTab('inicio')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === 'inicio' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Home size={18} className={activeTab === 'inicio' ? 'text-accent-gold' : 'text-white/55'} />
            <span className="font-sans">Início</span>
          </button>
          <button
            onClick={() => setActiveTab('trilha')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === 'trilha' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <BookOpen size={18} className={activeTab === 'trilha' ? 'text-accent-gold' : 'text-white/55'} />
            <span className="font-sans">Trilha de Estudo</span>
          </button>
          <button
            onClick={() => setActiveTab('devocionais')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === 'devocionais' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Heart size={18} className={activeTab === 'devocionais' ? 'text-accent-gold' : 'text-white/55'} />
            <span className="font-sans">Devocional</span>
          </button>
          <button
            onClick={() => setActiveTab('reunioes')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === 'reunioes' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Video size={18} className={activeTab === 'reunioes' ? 'text-accent-gold' : 'text-white/55'} />
            <span className="font-sans">Reuniões Ao Vivo</span>
          </button>
          <button
            onClick={() => setActiveTab('perfil')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
              activeTab === 'perfil' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <User size={18} className={activeTab === 'perfil' ? 'text-accent-gold' : 'text-white/55'} />
            <span className="font-sans">Meu Perfil</span>
          </button>

          {/* Leader Sections */}
          {isLider && (
            <div className="pt-6 space-y-1.5">
              <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Painel Líder</p>
              <button
                onClick={() => setActiveTab('lider-servos')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'lider-servos' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Users size={18} className={activeTab === 'lider-servos' ? 'text-accent-gold' : 'text-white/55'} />
                <span className="font-sans">Lista de Servos</span>
              </button>
              <button
                onClick={() => setActiveTab('lider-respostas')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'lider-respostas' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <FileText size={18} className={activeTab === 'lider-respostas' ? 'text-accent-gold' : 'text-white/55'} />
                <span className="font-sans">Respostas Devocionais</span>
              </button>
            </div>
          )}

          {/* Admin Tools */}
          {isAdmin && (
            <div className="pt-4 space-y-1.5">
              <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">Administração</p>
              <button
                onClick={() => setActiveTab('admin-config')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admin-config' ? 'bg-white/10 text-white shadow-sm border border-white/5' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Settings size={18} className={activeTab === 'admin-config' ? 'text-accent-gold' : 'text-white/55'} />
                <span className="font-sans">Configurações</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Bar navigation (Strictly bottom anchored) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-sidebar border-t border-white/10 flex items-center justify-around px-2 py-1 md:hidden z-50">
        <button
          onClick={() => setActiveTab('inicio')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'inicio' ? 'text-accent-gold scale-105 font-semibold' : 'text-white/60 hover:text-white'
          }`}
        >
          <Home size={20} />
          <span className="text-[10px] font-medium tracking-tight mt-1">Início</span>
        </button>
        <button
          onClick={() => setActiveTab('trilha')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'trilha' ? 'text-accent-gold scale-105 font-semibold' : 'text-white/60 hover:text-white'
          }`}
        >
          <BookOpen size={20} />
          <span className="text-[10px] font-medium tracking-tight mt-1">Trilha</span>
        </button>
        <button
          onClick={() => setActiveTab('devocionais')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'devocionais' ? 'text-accent-gold scale-105 font-semibold' : 'text-white/60 hover:text-white'
          }`}
        >
          <Heart size={20} />
          <span className="text-[10px] font-medium tracking-tight mt-1">Devocional</span>
        </button>
        <button
          onClick={() => setActiveTab('reunioes')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'reunioes' ? 'text-accent-gold scale-105 font-semibold' : 'text-white/60 hover:text-white'
          }`}
        >
          <Video size={20} />
          <span className="text-[10px] font-medium tracking-tight mt-1">Reuniões</span>
        </button>
        <button
          onClick={() => setActiveTab('perfil')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'perfil' ? 'text-accent-gold scale-105 font-semibold' : 'text-white/60 hover:text-white'
          }`}
        >
          <User size={20} className={activeTab === 'perfil' ? 'text-accent-gold' : ''} />
          <span className="text-[10px] font-medium tracking-tight mt-1">Perfil</span>
        </button>

        {/* Dynamic menu button or icon for leaders/admins which toggles leaders sections easily */}
        {isLider && (
          <button
            onClick={() => setActiveTab(activeTab.startsWith('lider-') || activeTab === 'admin-config' ? 'inicio' : 'lider-servos')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
              activeTab.startsWith('lider-') || activeTab === 'admin-config' ? 'text-accent-gold scale-105 font-semibold' : 'text-white/60'
            }`}
          >
            <Users size={20} />
            <span className="text-[10px] font-medium tracking-tight mt-1">Líder</span>
          </button>
        )}
      </nav>
    </>
  );
};
