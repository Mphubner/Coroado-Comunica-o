import { GoogleGenAI, Type } from "@google/genai";
import { writeFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables if needed
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function main() {
  const url = 'https://drive.google.com/drive/folders/10rxaxcm5z6W64iiNwtoJhEaiObP1Xe1M?usp=drive_link';
  try {
    console.log('Fetching', url);
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const html = await res.text();
    console.log('Fetched HTML length:', html.length);
    
    // Find all AF_initDataCallback calls
    const callbackRegex = /AF_initDataCallback\s*\(\s*\{[\s\S]*?\}\s*\)\s*;/g;
    const matches: string[] = [];
    let match;
    while ((match = callbackRegex.exec(html)) !== null) {
      matches.push(match[0]);
    }
    
    console.log(`Found ${matches.length} AF_initDataCallback blocks`);
    
    if (matches.length === 0) {
      console.log('No AF_initDataCallback blocks found inside script tags.');
      return;
    }
    
    // Filter blocks that might have file listings. Big blocks usually have 'data' inside.
    const relevantBlocks = matches.filter(m => m.length > 2000); 
    console.log(`Filtered to ${relevantBlocks.length} large blocks containing actual data`);
    
    const dataContext = relevantBlocks.join('\n\n');
    console.log('Total characters of relevant blocks:', dataContext.length);
    
    console.log('Prompting Gemini to parse files...');
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          text: `You are a Google Drive HTML parser. Analyze these AF_initDataCallback payloads from a public Google Drive folder page.
Identify all the files and folders listed inside this folder.
For each item, extract:
- name (the clear title/name of the file or folder, e.g., "Aula 1", "Devocional", etc.)
- id (the Google Drive file or folder ID, which is a alphanumeric string like "1zyLAC7...")
- mimeType (the specific mimeType, e.g. "application/vnd.google-apps.folder", "video/mp4", "application/vnd.google-apps.document", etc.)
- type ("folder", "document", "presentation", "video", "sheet", or "other")

Return the parsed list strictly as a JSON array of objects.
Do not wrap in Markdown, just return raw JSON so it can be parsed.`
        },
        {
          text: dataContext.substring(0, 500000) // safety limit
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              id: { type: Type.STRING },
              mimeType: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["name", "id", "mimeType", "type"]
          }
        }
      }
    });
    
    const parsedText = response.text || '';
    console.log('Gemini Parsed Response Status: Success');
    writeFileSync('drive_files.json', parsedText);
    console.log('Saved parsed files list as drive_files.json');
    console.log('Parsed JSON preview:');
    const items = JSON.parse(parsedText);
    console.log(items);
  } catch (err) {
    console.error('Error in extractCallbacks:', err);
  }
}

main();
