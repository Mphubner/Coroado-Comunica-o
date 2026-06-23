import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

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
  const query = "What are the files, documents and folders in the Google Drive folder '10rxaxcm5z6W64iiNwtoJhEaiObP1Xe1M'? Can you list their names and titles?";
  console.log('Sending query with search grounding:', query);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    console.log('\n--- GEMINI RESPONSE WITH SEARCH GROUNDING ---');
    console.log(response.text);
    console.log('---------------------------------------------');
    
    // Check if grounding metadata exists
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      console.log('\nGrounding Chunks/Sources:');
      console.log(JSON.stringify(chunks, null, 2));
    }
  } catch (err) {
    console.error('Error running search grounding query:', err);
  }
}

main();
