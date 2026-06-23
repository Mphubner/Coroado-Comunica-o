import React from 'react';
import { ExternalLink, Play } from 'lucide-react';

interface VideoPlayerProps {
  youtubeUrl?: string;
  youtubeVideoId?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ youtubeUrl, youtubeVideoId }) => {
  // Helper to extract clean Video ID from generic URL strings
  const extractId = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch {
      return null;
    }
  };

  const id = youtubeVideoId || (youtubeUrl ? extractId(youtubeUrl) : null);

  if (!id) {
    return (
      <div className="flex flex-col items-center justify-center bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center h-64 shadow-inner">
        <svg className="w-12 h-12 text-zinc-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h4 className="text-zinc-400 font-medium text-sm">Aula sem Vídeo do YouTube</h4>
        <p className="text-xs text-zinc-500 max-w-xs mt-1">Essa aula é pautada em leitura doutrinária, meditação sobre texto bíblico e materiais complementares.</p>
      </div>
    );
  }

  const directUrl = youtubeUrl || `https://www.youtube.com/watch?v=${id}`;

  return (
    <div className="space-y-3 font-sans">
      <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-lg border border-zinc-200">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={`https://www.youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#FBF9F6] border border-[#F0EDEA] p-3.5 rounded-2xl">
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-[#2D2926] flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
            Problemas para carregar? (Erro 153 ou vídeo indisponível)
          </p>
          <p className="text-[11px] text-[#8C847C] font-semibold leading-relaxed">
            Se estiver em um ambiente de pré-visualização, navegadores restringem cookies. 
            <strong className="text-[#1A2E44]"> Abra esta plataforma em uma nova aba</strong> ou clique ao lado para assistir diretamente no YouTube.
          </p>
        </div>
        <a
          href={directUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#C5A059] hover:bg-[#1A2E44] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm whitespace-nowrap"
        >
          <Play size={12} className="fill-white" />
          <span>Assistir no YouTube</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};
