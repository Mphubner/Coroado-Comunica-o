import { writeFileSync } from 'fs';

async function main() {
  const url = 'https://drive.google.com/drive/folders/10rxaxcm5z6W64iiNwtoJhEaiObP1Xe1M?usp=drive_link';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    writeFileSync('drive_full.html', html);
    console.log('Saved full HTML to drive_full.html, size:', html.length);
  } catch (err) {
    console.error(err);
  }
}

main();
