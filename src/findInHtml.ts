import { readFileSync } from 'fs';

function main() {
  const html = readFileSync('drive_full.html', 'utf8');
  console.log('Total file length:', html.length);
  
  // Search for occurrence of "Aulas" or "estudos" or "devocionais" or file structures
  const searchKWs = ['aula', 'estudo', 'devocional', 'comunicacao', 'video', 'pdf', 'doc', 'simbolo', 'logo', 'texto'];
  for (const kw of searchKWs) {
    const regex = new RegExp(kw, 'gi');
    const matches = html.match(regex);
    console.log(`Keyword "${kw}": ${matches ? matches.length : 0} occurrences`);
  }
  
  // Let's find any Google Drive file IDs (typically 33 characters, alphanumeric plus underscores/hyphens)
  // Let's find IDs in strings that are within script tags with data.
  // E.g., looking for strings that are 33-44 chars inside script tags.
  // Let's look for known files or see where we can find title names.
  // Often folder names are inside a big JSON chunk.
  // Let's see if we can find typical Google Drive IDs or substrings
}

main();
