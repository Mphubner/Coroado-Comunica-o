import { readFileSync } from 'fs';

function main() {
  const html = readFileSync('drive_full.html', 'utf8');
  console.log('HTML Length:', html.length);
  
  // Find "pdf" occurrences
  const pdfTerm = 'pdf';
  let index = html.indexOf(pdfTerm);
  let count = 0;
  while (index !== -1 && count < 20) {
    console.log(`\n--- Match ${count + 1} for 'pdf' (index ${index}) ---`);
    const start = Math.max(0, index - 200);
    const end = Math.min(html.length, index + 200);
    console.log(html.substring(start, end));
    index = html.indexOf(pdfTerm, index + 1);
    count++;
  }

  // Find "doc" occurrences
  const docTerm = 'doc';
  index = html.indexOf(docTerm);
  count = 0;
  while (index !== -1 && count < 10) {
    console.log(`\n--- Match ${count + 1} for 'doc' (index ${index}) ---`);
    const start = Math.max(0, index - 100);
    const end = Math.min(html.length, index + 100);
    console.log(html.substring(start, end));
    index = html.indexOf(docTerm, index + 1);
    count++;
  }
}

main();
