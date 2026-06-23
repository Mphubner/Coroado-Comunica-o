import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { Module, Lesson, Devotional } from '../types';
import { parseStudyText, parseDevotionalText, extractYouTubeId } from '../utils/driveParser';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { 
  Cloud, 
  Check, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  Download, 
  Edit, 
  RefreshCw,
  FolderMinus,
  ArrowRight,
  BookOpen
} from 'lucide-react';

interface DriveCourseImporterProps {
  modules: Module[];
  onRefreshAll: () => void;
}

interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
}

interface SelectedFileContent {
  folderName: string;
  lessonDoc?: DriveItem;
  devotionalDoc?: DriveItem;
  lessonParsed?: ReturnType<typeof parseStudyText>;
  devotionalParsed?: ReturnType<typeof parseDevotionalText>;
  isLoaded: boolean;
  isLoading: boolean;
}

export const DriveCourseImporter: React.FC<DriveCourseImporterProps> = ({
  modules,
  onRefreshAll
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [folderId, setFolderId] = useState('10rxaxcm5z6W64iiNwtoJhEaiObP1Xe1M');
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [folders, setFolders] = useState<DriveItem[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected Target Module for importations
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');

  // Active loaded folder state
  const [folderContents, setFolderContents] = useState<Record<string, SelectedFileContent>>({});
  const [activeTab, setActiveTab] = useState<string | null>(null); // current folder ID to inspect

  useEffect(() => {
    if (modules.length > 0 && !selectedModuleId) {
      setSelectedModuleId(modules[0].id || '');
    }
  }, [modules]);

  // Connects with Google requested Drive + Docs scopes
  const handleConnectGoogle = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.readonly');
      provider.addScope('https://www.googleapis.com/auth/documents.readonly');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
        setSuccessMsg("Conta Google conectada com permissão para leitura de documentos e pastas com sucesso!");
      } else {
        setErrorMsg("Não foi possível obter o token de acesso da conta Google.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Erro na autenticação Google: ${err.message || String(err)}`);
    }
  };

  // Lists all sub-folders inside the specified Google Drive folder directory
  const handleLoadDriveFolders = async () => {
    if (!accessToken) {
      setErrorMsg("Por favor, conecte sua conta Google primeiro.");
      return;
    }
    setLoadingFolders(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setFolders([]);

    try {
      // Fetch child folders of folderId
      const q = encodeURIComponent(`'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType)&orderBy=name&key=`;
      
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || `Erro de resposta HTTP: ${res.status}`);
      }

      const data = await res.json();
      setFolders(data.files || []);
      
      // Initialize contents state for each folder
      const initialContents: Record<string, SelectedFileContent> = {};
      (data.files || []).forEach((f: DriveItem) => {
        initialContents[f.id] = {
          folderName: f.name,
          isLoaded: false,
          isLoading: false
        };
      });
      setFolderContents(initialContents);

      setSuccessMsg(`Encontrado ${data.files?.length || 0} pastas de estudos do curso em seu Google Drive!`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Falha ao ler pastas do Drive: ${err.message || String(err)}`);
    } finally {
      setLoadingFolders(false);
    }
  };

  // Fetch Docs inside a specific sub-folder, export as plaintext, and parse
  const handleFetchAndParseFolder = async (folder: DriveItem) => {
    if (!accessToken) return;
    
    // Update loading state for this specific folder
    setFolderContents(prev => ({
      ...prev,
      [folder.id]: {
        ...prev[folder.id],
        isLoading: true
      }
    }));

    try {
      // 1. List all files in this specific study subfolder
      const q = encodeURIComponent(`'${folder.id}' in parents and trashed = false`);
      const listUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType)`;
      const listRes = await fetch(listUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!listRes.ok) throw new Error(`Falha ao listar arquivos na pasta ${folder.name}`);
      const listData = await listRes.json();
      const files: DriveItem[] = listData.files || [];

      // Find primary lesson doc and devotional doc
      const lessonDoc = files.find(f => f.mimeType === 'application/vnd.google-apps.document' && !f.name.toLowerCase().includes('devocional'));
      const devotionalDoc = files.find(f => f.mimeType === 'application/vnd.google-apps.document' && f.name.toLowerCase().includes('devocional'));

      let lessonParsed: SelectedFileContent['lessonParsed'] = undefined;
      let devotionalParsed: SelectedFileContent['devotionalParsed'] = undefined;

      // 2. Fetch and parse lesson plain text
      if (lessonDoc) {
        const exportUrl = `https://www.googleapis.com/drive/v3/files/${lessonDoc.id}/export?mimeType=text/plain`;
        const exportRes = await fetch(exportUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (exportRes.ok) {
          const text = await exportRes.text();
          lessonParsed = parseStudyText(text, folder.name);
        }
      }

      // 3. Fetch and parse devotional plain text
      if (devotionalDoc) {
        const exportUrl = `https://www.googleapis.com/drive/v3/files/${devotionalDoc.id}/export?mimeType=text/plain`;
        const exportRes = await fetch(exportUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (exportRes.ok) {
          const text = await exportRes.text();
          devotionalParsed = parseDevotionalText(text, `Devocional - ${folder.name}`);
        }
      }

      // If no lesson doc found but there is text inside a file, or create structured defaults if missing
      if (!lessonParsed) {
        lessonParsed = parseStudyText('', folder.name);
      }
      if (!devotionalParsed) {
        devotionalParsed = parseDevotionalText('', `Devocional - ${folder.name}`);
      }

      setFolderContents(prev => ({
        ...prev,
        [folder.id]: {
          ...prev[folder.id],
          lessonDoc,
          devotionalDoc,
          lessonParsed,
          devotionalParsed,
          isLoaded: true,
          isLoading: false
        }
      }));
      setActiveTab(folder.id);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Erro ao sincronizar pasta ${folder.name}: ${err.message || String(err)}`);
      setFolderContents(prev => ({
        ...prev,
        [folder.id]: {
          ...prev[folder.id],
          isLoading: false
        }
      }));
    }
  };

  // Commit the current parsed preview to Firebase Firestore
  const handleSaveToFirestore = async (folderId: string) => {
    const content = folderContents[folderId];
    if (!content || !content.isLoaded || !content.lessonParsed || !content.devotionalParsed) {
      setErrorMsg("O conteúdo deste estudo precisa ser carregado primeiro.");
      return;
    }

    if (!selectedModuleId) {
      setErrorMsg("Selecione qual Tema (Módulo) do curso esta aula pertence.");
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);

      // 1. Get order - intelligently extract the sequence number from folder or document name (e.g., "Aula 01" -> 1)
      const lessonsSnap = await getDocs(collection(db, 'lessons'));
      const activeLessons = lessonsSnap.docs.map(d => d.data() as Lesson).filter(l => l.moduleId === selectedModuleId);
      
      let nextOrder = activeLessons.length + 1;
      const folderWordMatch = content.folderName.match(/aula\s*0*([0-9]+)/i) || 
                              content.folderName.match(/0*([0-9]+)/);
      if (folderWordMatch) {
        const parsedNum = parseInt(folderWordMatch[1], 10);
        if (!isNaN(parsedNum)) {
          nextOrder = parsedNum;
        }
      } else {
        const titleMatch = content.lessonParsed.title.match(/(?:aula|tema|devocional)?\s*0*([0-9]+)/i);
        if (titleMatch) {
          const parsedNum = parseInt(titleMatch[1], 10);
          if (!isNaN(parsedNum)) {
            nextOrder = parsedNum;
          }
        }
      }

      // 2. Add Lesson
      const lessonPayload: Lesson = {
        moduleId: selectedModuleId,
        title: content.lessonParsed.title,
        order: nextOrder,
        objective: content.lessonParsed.objective,
        bibleReferences: content.lessonParsed.bibleReferences,
        openingQuestion: content.lessonParsed.openingQuestion,
        summary: content.lessonParsed.summary,
        youtubeUrl: content.lessonParsed.youtubeUrl,
        youtubeVideoId: content.lessonParsed.youtubeVideoId,
        driveDocUrl: content.lessonDoc ? `https://docs.google.com/document/d/${content.lessonDoc.id}` : "",
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const lessonRef = await addDoc(collection(db, 'lessons'), lessonPayload);
      const lessonId = lessonRef.id;

      // 3. Add Associated Devotional
      const devotionalPayload: Devotional = {
        lessonId,
        title: content.devotionalParsed.title,
        bibleReference: content.devotionalParsed.bibleReference,
        readingInstruction: content.devotionalParsed.readingInstruction,
        guidedMeditation: content.devotionalParsed.guidedMeditation,
        suggestedPrayer: content.devotionalParsed.suggestedPrayer,
        weeklyPractice: content.devotionalParsed.weeklyPractice,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'devotionals'), devotionalPayload);

      // 4. Create support material
      await addDoc(collection(db, 'supportMaterials'), {
        lessonId,
        moduleId: selectedModuleId,
        title: `Material Ministerial - ${content.lessonParsed.title}`,
        description: `Material de preleção e estudos importado diretamente do Google Drive oficial da Comunidade Coroado.`,
        type: "drive",
        url: content.lessonDoc ? `https://docs.google.com/document/d/${content.lessonDoc.id}` : "https://drive.google.com",
        required: true,
        visibility: "servos",
        order: 1,
        active: true,
        createdAt: new Date().toISOString()
      });

      setSuccessMsg(`Estudo "${content.lessonParsed.title}" importado e integrado ao Firestore com sucesso! Fila de materiais e devocional anexados.`);
      
      // Update folder status to "Imported" optionally
      onRefreshAll();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Falha ao gravar no Firebase: ${err.message || String(err)}`);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#F0EDEA] p-6 md:p-8 card-shadow space-y-6 text-[#2D2926]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0EDEA] pb-4">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 bg-[#1A2E44] text-white font-extrabold text-[9px] tracking-widest px-2.5 py-1 rounded-full uppercase border border-[#C5A059]/30">
            🤖 CONECTOR GOOGLE WORKSPACE
          </span>
          <h3 className="text-[#2D2926] font-serif font-bold text-lg flex items-center gap-2">
            <Cloud size={18} className="text-[#C5A059]" />
            <span>Sincronizador Inteligente Google Drive</span>
          </h3>
          <p className="text-[#8C847C] text-xs max-w-xl font-sans font-medium pr-2">
            Importe e processe materiais apostólicos do drive de treinamento pastoral. O robô varre os documentos, extrai passagens bíblicas, questionários, vídeos e preleções devocionais de modo estruturado para as tabelas.
          </p>
        </div>

        <div>
          {accessToken ? (
            <div className="flex items-center gap-1.5 bg-[#F5F2ED] text-[#B45309] font-bold text-xs px-4 py-2.5 rounded-2xl border border-[#EEEAE5]">
              <CheckCircle2 size={14} className="text-[#C5A059]" />
              <span>Conexão Google Ativa</span>
            </div>
          ) : (
            <button
              onClick={handleConnectGoogle}
              className="inline-flex items-center gap-2 bg-[#C5A059] hover:bg-opacity-90 text-[#1A2E44] font-extrabold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-md"
            >
              <Cloud size={14} />
              <span>Conectar Conta Google</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs flex items-center gap-2 border border-red-200 shadow-sm font-sans">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-[#1A2E44] text-white p-4 rounded-2xl text-xs flex items-center gap-2 border border-[#C5A059]/40 shadow-sm font-sans font-semibold">
          <Sparkles size={16} className="shrink-0 text-[#C5A059]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* DRIVER PATH SETTINGS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
        <div className="md:col-span-2 space-y-1.5">
          <label className="block font-bold text-[#8C847C] uppercase tracking-wider">ID da Pasta no Google Drive</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={folderId}
              onChange={e => setFolderId(e.target.value)}
              placeholder="Cole o ID da pasta do drive..."
              className="flex-1 text-xs font-semibold bg-[#F5F2ED]/50 outline-none border border-[#EEEAE5] rounded-2xl px-4 py-3 focus:bg-white focus:border-[#C5A059] transition-all text-[#2D2926]"
            />
            <button
              onClick={handleLoadDriveFolders}
              disabled={!accessToken || loadingFolders}
              className="inline-flex items-center gap-1.5 bg-[#1A2E44] hover:bg-opacity-95 text-white font-bold px-5 py-3 rounded-2xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={12} className={loadingFolders ? "animate-spin" : ""} />
              <span>Listar Pastas</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block font-bold text-[#8C847C] uppercase tracking-wider">Vincular ao Tema (Módulo)</label>
          <select
            value={selectedModuleId}
            onChange={e => setSelectedModuleId(e.target.value)}
            className="w-full text-xs font-semibold bg-[#F5F2ED]/50 outline-none border border-[#EEEAE5] rounded-2xl px-4 py-[13px] focus:bg-white focus:border-[#C5A059] transition-all text-[#2D2926]"
          >
            <option value="">Selecione um tema...</option>
            {modules.map(m => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* DIRECTORY LESSONS ACCORDION LIST */}
      {folders.length > 0 && (
        <div className="space-y-5 pt-3">
          <div className="flex items-center justify-between pl-1">
            <h4 className="text-[#8C847C] font-semibold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
              <span>Pastas de Estudo Encontradas</span>
              <span className="bg-[#F5F2ED] text-[#B45309] border border-[#EEEAE5] px-2 py-0.5 rounded-full font-mono">{folders.length}</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[300px]">
            {/* Sidebar Folder list */}
            <div className="lg:col-span-4 space-y-2 max-h-[460px] overflow-y-auto pr-2">
              {folders.map(f => {
                const state = folderContents[f.id];
                const isActive = activeTab === f.id;
                return (
                  <div
                    key={f.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                      isActive 
                        ? "bg-[#1A2E44] border-[#C5A059] text-white shadow-md font-bold" 
                        : "bg-[#F5F2ED]/40 border-[#F0EDEA] hover:bg-[#F5F2ED] text-[#2D2926]"
                    }`}
                    onClick={() => {
                      if (state?.isLoaded) {
                        setActiveTab(f.id);
                      } else {
                        handleFetchAndParseFolder(f);
                      }
                    }}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate font-sans font-semibold text-xs">{f.name}</p>
                      <p className={`text-[9px] font-mono mt-0.5 ${isActive ? "text-[#C5A059]" : "text-[#8C847C]"}`}>
                        ID: {f.id.substring(0, 9)}...
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFetchAndParseFolder(f);
                      }}
                      disabled={state?.isLoading}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                        isActive 
                          ? "border-[#C5A059] text-[#C5A059] hover:bg-white/10"
                          : "border-[#EEEAE5] text-[#8C847C] hover:bg-white"
                      }`}
                    >
                      {state?.isLoading ? (
                        <RefreshCw size={10} className="animate-spin" />
                      ) : state?.isLoaded ? (
                        <Check size={10} />
                      ) : (
                        <Download size={10} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Main Interactive Parser Window */}
            <div className="lg:col-span-8 bg-[#F5F2ED]/30 border border-[#F0EDEA] rounded-3xl p-5 md:p-6 space-y-5">
              {activeTab && folderContents[activeTab]?.isLoaded ? (
                (() => {
                  const content = folderContents[activeTab];
                  const lp = content.lessonParsed!;
                  const dp = content.devotionalParsed!;
                  
                  return (
                    <div className="space-y-6 text-xs animate-fade-in">
                      {/* Sub-Header Folder title card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEEAE5] pb-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-[#C5A059] uppercase">Dados Extraídos da Pasta</span>
                          <h4 className="font-serif font-bold text-md text-[#2D2926] leading-snug">{content.folderName}</h4>
                        </div>
                        <button
                          onClick={() => handleSaveToFirestore(activeTab)}
                          className="bg-[#C5A059] hover:bg-opacity-90 text-[#1A2E44] font-extrabold text-[10px] px-4 py-2 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={12} />
                          <span>Gravar Estudos no Firestore</span>
                        </button>
                      </div>

                      {/* Side-by-Side Editor Panels */}
                      <div className="space-y-5">
                        {/* 1. SEÇÃO DA AULA */}
                        <div className="bg-white p-5 rounded-2xl border border-[#EEEAE5] space-y-4">
                          <span className="inline-flex items-center gap-1 text-[9px] bg-red-50 text-red-700 font-extrabold px-2 py-0.5 rounded-full uppercase">
                            🎓 CONTEÚDO DA AULA / ESTUDO
                          </span>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-[#8C847C] font-sans">Título da Aula</label>
                              <input
                                type="text"
                                value={lp.title}
                                onChange={e => {
                                  const val = e.target.value;
                                  setFolderContents(prev => {
                                    const copy = { ...prev };
                                    copy[activeTab].lessonParsed!.title = val;
                                    return copy;
                                  });
                                }}
                                className="w-full text-xs font-semibold bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-[#8C847C] font-sans">Texto-Base Bíblico (NVI)</label>
                              <input
                                type="text"
                                value={lp.bibleReferences}
                                onChange={e => {
                                  const val = e.target.value;
                                  setFolderContents(prev => {
                                    const copy = { ...prev };
                                    copy[activeTab].lessonParsed!.bibleReferences = val;
                                    return copy;
                                  });
                                }}
                                className="w-full text-xs font-semibold bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-[#8C847C] block font-sans">Objetivo da Aula (Alvo)</label>
                            <input
                              type="text"
                              value={lp.objective}
                              onChange={e => {
                                const val = e.target.value;
                                setFolderContents(prev => {
                                  const copy = { ...prev };
                                  copy[activeTab].lessonParsed!.objective = val;
                                  return copy;
                                });
                              }}
                              className="w-full text-xs font-semibold bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-[#8C847C] block font-sans">Pergunta Inicial (Reflexão de Entrada)</label>
                            <input
                              type="text"
                              value={lp.openingQuestion}
                              onChange={e => {
                                const val = e.target.value;
                                setFolderContents(prev => {
                                  const copy = { ...prev };
                                  copy[activeTab].lessonParsed!.openingQuestion = val;
                                  return copy;
                                });
                              }}
                              className="w-full text-xs font-semibold bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059]"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-[#8C847C] font-sans">Link do Vídeo YouTube</label>
                              <input
                                type="text"
                                value={lp.youtubeUrl}
                                onChange={e => {
                                  const val = e.target.value;
                                  setFolderContents(prev => {
                                    const copy = { ...prev };
                                    copy[activeTab].lessonParsed!.youtubeUrl = val;
                                    copy[activeTab].lessonParsed!.youtubeVideoId = extractYouTubeId(val);
                                    return copy;
                                  });
                                }}
                                className="w-full text-xs font-semibold bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-[#8C847C] font-sans">Video ID Extraído</label>
                              <input
                                type="text"
                                disabled
                                value={lp.youtubeVideoId}
                                className="w-full text-xs font-mono bg-zinc-100 border border-[#EEEAE5] rounded-xl px-3 py-2 text-[#8C847C]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-[#8C847C] block font-sans">Resumo Doutrinário (Material de Leitura)</label>
                            <textarea
                              value={lp.summary}
                              rows={5}
                              onChange={e => {
                                const val = e.target.value;
                                setFolderContents(prev => {
                                  const copy = { ...prev };
                                  copy[activeTab].lessonParsed!.summary = val;
                                  return copy;
                                });
                              }}
                              className="w-full text-xs bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059] leading-relaxed"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-[#8C847C] block font-sans">Perguntas Finais de Estudo (Uma por linha)</label>
                            <textarea
                              value={lp.finalQuestions}
                              rows={3}
                              onChange={e => {
                                const val = e.target.value;
                                setFolderContents(prev => {
                                  const copy = { ...prev };
                                  copy[activeTab].lessonParsed!.finalQuestions = val;
                                  return copy;
                                });
                              }}
                              className="w-full text-xs bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059]"
                            />
                          </div>
                        </div>

                        {/* 2. SEÇÃO DEVOCIONAL */}
                        <div className="bg-white p-5 rounded-2xl border border-[#EEEAE5] space-y-4">
                          <span className="inline-flex items-center gap-1 text-[9px] bg-amber-50 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                            ⭐ MEDITAÇÃO DEVOCIONAL ASSOCIADA
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-[#8C847C] font-sans">Título Devocional</label>
                              <input
                                type="text"
                                value={dp.title}
                                onChange={e => {
                                  const val = e.target.value;
                                  setFolderContents(prev => {
                                    const copy = { ...prev };
                                    copy[activeTab].devotionalParsed!.title = val;
                                    return copy;
                                  });
                                }}
                                className="w-full text-xs font-semibold bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-[#8C847C] font-sans">Referência Bíblica</label>
                              <input
                                type="text"
                                value={dp.bibleReference}
                                onChange={e => {
                                  const val = e.target.value;
                                  setFolderContents(prev => {
                                    const copy = { ...prev };
                                    copy[activeTab].devotionalParsed!.bibleReference = val;
                                    return copy;
                                  });
                                }}
                                className="w-full text-xs font-semibold bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-[#8C847C] block font-sans">Instrução de Leitura Teológica</label>
                            <input
                              type="text"
                              value={dp.readingInstruction}
                              onChange={e => {
                                const val = e.target.value;
                                setFolderContents(prev => {
                                  const copy = { ...prev };
                                  copy[activeTab].devotionalParsed!.readingInstruction = val;
                                  return copy;
                                });
                              }}
                              className="w-full text-xs font-semibold bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-bold text-[#8C847C] block font-sans">Meditação Guiada</label>
                            <textarea
                              value={dp.guidedMeditation}
                              rows={4}
                              onChange={e => {
                                const val = e.target.value;
                                setFolderContents(prev => {
                                  const copy = { ...prev };
                                  copy[activeTab].devotionalParsed!.guidedMeditation = val;
                                  return copy;
                                });
                              }}
                              className="w-full text-xs bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059] leading-relaxed"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="font-bold text-[#8C847C] font-sans">Oração Proposta</label>
                              <textarea
                                value={dp.suggestedPrayer}
                                rows={2}
                                onChange={e => {
                                  const val = e.target.value;
                                  setFolderContents(prev => {
                                    const copy = { ...prev };
                                    copy[activeTab].devotionalParsed!.suggestedPrayer = val;
                                    return copy;
                                  });
                                }}
                                className="w-full text-xs bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059]"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="font-bold text-[#8C847C] font-sans">Prática Pastoral do Servo</label>
                              <textarea
                                value={dp.weeklyPractice}
                                rows={2}
                                onChange={e => {
                                  const val = e.target.value;
                                  setFolderContents(prev => {
                                    const copy = { ...prev };
                                    copy[activeTab].devotionalParsed!.weeklyPractice = val;
                                    return copy;
                                  });
                                }}
                                className="w-full text-xs bg-[#F5F2ED]/50 border border-[#EEEAE5] rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-[#C5A059]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : activeTab && folderContents[activeTab]?.isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
                  <RefreshCw size={24} className="text-[#C5A059] animate-spin" />
                  <div>
                    <p className="font-bold font-serif text-sm text-[#2D2926]">Sincronizando com o Google Docs...</p>
                    <p className="text-[10px] text-[#8C847C] font-mono mt-0.5">Exportando texto puro em lote e estruturando metadados.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400 gap-3 border border-dashed border-[#EEEAE5] rounded-3xl bg-white/50">
                  <BookOpen size={24} className="text-zinc-300" />
                  <div>
                    <h5 className="font-bold font-serif text-sm text-[#8C847C]">Nenhum Estudo Selecionado</h5>
                    <p className="text-[10px] text-[#8C847C] max-w-sm mx-auto leading-relaxed mt-1 font-sans">
                      Selecione uma pasta de estudos na barra lateral para ler, estruturar e pré-visualizar antes de integrá-la às lições da Comunidade Coroado e devocionais.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
