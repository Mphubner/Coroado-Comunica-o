import { readFileSync } from 'fs';

async function main() {
  const html = readFileSync('drive_start.html', 'utf8');
  console.log('HTML Length:', html.length);
  
  // Search for the presence of words like "Aula", "estudo", "devocional", "Tema", "Video", or similar
  const keywords = ['Aula', 'estudo', 'devocional', 'Tema', 'Video', 'comunicacao', 'Coroado', 'pdf', 'mp4', 'doc'];
  for (const kw of keywords) {
    const regex = new RegExp(kw, 'gi');
    const matches = html.match(regex);
    console.log(`Keyword "${kw}": ${matches ? matches.length : 0} occurrences`);
  }
}

main();
