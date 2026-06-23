/**
 * Utility to parse plain text export of Google Docs into structured Lesson and Devotional data.
 * The parser searches for Brazilian Portuguese headings (e.g., "Texto Bíblico", "Pergunta Inicial", "A Aula", "Perguntas Finais").
 */

interface ParsedLesson {
  title: string;
  objective: string;
  bibleReferences: string;
  openingQuestion: string;
  summary: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  finalQuestions: string;
}

interface ParsedDevotional {
  title: string;
  bibleReference: string;
  readingInstruction: string;
  guidedMeditation: string;
  suggestedPrayer: string;
  weeklyPractice: string;
}

// Extract YouTube video ID from URL
export function extractYouTubeId(url: string | undefined): string {
  if (!url) return "dQw4w9WgXcQ"; // Default fallback lesson video
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "dQw4w9WgXcQ";
}

// Parses study document text
export function parseStudyText(text: string, defaultTitle: string = "Aula Importada"): ParsedLesson {
  let objective = "";
  let bibleReferences = "";
  let openingQuestion = "";
  let summary = "";
  let youtubeUrl = "";
  let finalQuestions = "";

  // Clean lines and normalize line breaks
  const lines = text.split('\n').map(l => l.trim());

  // Search for lines mentioning sections
  let currentSection: 'objectives' | 'bible' | 'initQuestion' | 'body' | 'finalQuestions' | null = null;
  const summaryParagraphs: string[] = [];
  const finalQuestionLines: string[] = [];

  // Match YouTube URLs inside text
  const ytRegex = /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_\-]{11})/i;
  const ytMatch = text.match(ytRegex);
  if (ytMatch) {
    youtubeUrl = ytMatch[0];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const lowerLine = line.toLowerCase();

    // Section transitions
    if (lowerLine.includes('alvo da aula') || lowerLine.includes('objetivo')) {
      currentSection = 'objectives';
      continue;
    } else if (lowerLine.includes('texto-base bíblico') || lowerLine.includes('texto bíblico') || lowerLine.includes('leitura bíblica') || lowerLine.includes('texto base')) {
      currentSection = 'bible';
      continue;
    } else if (lowerLine.includes('pergunta inicial') || lowerLine.includes('reflexão inicial') || lowerLine.includes('pergunta de entrada')) {
      currentSection = 'initQuestion';
      continue;
    } else if (lowerLine.includes('a aula') || lowerLine.includes('resumo doutrinário') || lowerLine.includes('desenvolvimento') || lowerLine.includes('resumo da aula')) {
      currentSection = 'body';
      continue;
    } else if (lowerLine.includes('perguntas finais') || lowerLine.includes('perguntas de fechamento') || lowerLine.includes('exercício') || lowerLine.includes('aplicação prática')) {
      currentSection = 'finalQuestions';
      continue;
    }

    // Accumulate data
    if (currentSection === 'objectives') {
      objective += (objective ? " " : "") + line;
    } else if (currentSection === 'bible') {
      bibleReferences += (bibleReferences ? ", " : "") + line;
    } else if (currentSection === 'initQuestion') {
      openingQuestion += (openingQuestion ? " " : "") + line;
    } else if (currentSection === 'body') {
      summaryParagraphs.push(line);
    } else if (currentSection === 'finalQuestions') {
      finalQuestionLines.push(line);
    } else {
      // If we don't have a specific header yet but we have text, assume it's part of the summary if it is long
      if (line.length > 50 && summaryParagraphs.length === 0) {
        summaryParagraphs.push(line);
      }
    }
  }

  // Fallbacks
  summary = summaryParagraphs.join('\n\n');
  finalQuestions = finalQuestionLines.join('\n');

  if (!objective) {
    objective = "Estudo formativo e técnico focado na maturidade espiritual e excelência no serviço ministerial.";
  }
  if (!bibleReferences) {
    bibleReferences = "Leitura recomendada diretamente na bíblia pastoral.";
  }
  if (!openingQuestion) {
    openingQuestion = "Reflita sobre como este ensinamento se aplica ao seu coração ministerial esta semana.";
  }
  if (!summary) {
    summary = text; // Fallback to full doc contents
  }
  if (!finalQuestions) {
    finalQuestions = "1. Qual o principal aprendizado dessa aula?\n2. Como você aplicará esse conhecimento tecnicamente em seu serviço local esta semana?";
  }

  return {
    title: defaultTitle,
    objective,
    bibleReferences,
    openingQuestion,
    summary,
    youtubeUrl: youtubeUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeVideoId: extractYouTubeId(youtubeUrl),
    finalQuestions
  };
}

// Parses devotional document text
export function parseDevotionalText(text: string, defaultTitle: string = "Devocional Importado"): ParsedDevotional {
  let bibleReference = "";
  let readingInstruction = "";
  let guidedMeditation = "";
  let suggestedPrayer = "";
  let weeklyPractice = "";

  const lines = text.split('\n').map(l => l.trim());
  let currentSection: 'bible' | 'reading' | 'meditation' | 'prayer' | 'practice' | null = null;
  const meditationParagraphs: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const lowerLine = line.toLowerCase();

    if (lowerLine.includes('leitura bíblica') || lowerLine.includes('referência') || lowerLine.includes('texto bíblico')) {
      currentSection = 'bible';
      continue;
    } else if (lowerLine.includes('instrução de leitura') || lowerLine.includes('como ler') || lowerLine.includes('instruções')) {
      currentSection = 'reading';
      continue;
    } else if (lowerLine.includes('meditação guiada') || lowerLine.includes('meditação') || lowerLine.includes('reflexão')) {
      currentSection = 'meditation';
      continue;
    } else if (lowerLine.includes('oração sugerida') || lowerLine.includes('oração de fechamento') || lowerLine.includes('oração')) {
      currentSection = 'prayer';
      continue;
    } else if (lowerLine.includes('prática semanal') || lowerLine.includes('aplicação prática') || lowerLine.includes('prática recomendada') || lowerLine.includes('desafio')) {
      currentSection = 'practice';
      continue;
    }

    if (currentSection === 'bible') {
      bibleReference += (bibleReference ? " " : "") + line;
    } else if (currentSection === 'reading') {
      readingInstruction += (readingInstruction ? " " : "") + line;
    } else if (currentSection === 'meditation') {
      meditationParagraphs.push(line);
    } else if (currentSection === 'prayer') {
      suggestedPrayer += (suggestedPrayer ? " " : "") + line;
    } else if (currentSection === 'practice') {
      weeklyPractice += (weeklyPractice ? " " : "") + line;
    }
  }

  guidedMeditation = meditationParagraphs.join('\n\n');

  if (!bibleReference) {
    bibleReference = "João 15:1-5";
  }
  if (!readingInstruction) {
    readingInstruction = "Abra sua Bíblia, faça uma leitura silenciosa e anote as palavras que mais tocarem o seu coração.";
  }
  if (!guidedMeditation) {
    guidedMeditation = text || "Medite no amor gracioso do Pai, que nos chamou e nos capacita no secreto.";
  }
  if (!suggestedPrayer) {
    suggestedPrayer = "Senhor, santifica meu caminhar criativo. Que meus dons apontem somente para Ti. Amém.";
  }
  if (!weeklyPractice) {
    weeklyPractice = "Passe 10 minutos de silêncio e escuta todos os dias esta semana.";
  }

  return {
    title: defaultTitle,
    bibleReference,
    readingInstruction,
    guidedMeditation,
    suggestedPrayer,
    weeklyPractice
  };
}
