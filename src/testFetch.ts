import { writeFileSync } from 'fs';

async function main() {
  const url = 'https://drive.google.com/drive/folders/10rxaxcm5z6W64iiNwtoJhEaiObP1Xe1M?usp=drive_link';
  try {
    console.log('Fetching', url);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log('Status:', res.status);
    const html = await res.text();
    console.log('HTML Length:', html.length);
    console.log('Searching for typical initial data variables...');
    const hasInitialData = html.includes('_INITIAL_DATA_');
    const hasInitCallback = html.includes('AF_initDataCallback');
    const hasBootstrap = html.includes('BOOTSTRAP_DATA');
    console.log('Has _INITIAL_DATA_:', hasInitialData);
    console.log('Has AF_initDataCallback:', hasInitCallback);
    console.log('Has BOOTSTRAP_DATA:', hasBootstrap);
    
    // Let's write the first 5000 characters to a test file
    writeFileSync('drive_start.html', html.substring(0, 10000));
    console.log('Saved snippet to drive_start.html');
  } catch (err) {
    console.error('Error fetching:', err);
  }
}

main();
