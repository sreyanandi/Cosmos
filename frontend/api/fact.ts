import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateWithRetry(
  model: string,
  contents: string,
  maxRetries = 3
): Promise<string> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({ model, contents });
      return response.text ?? '';
    } catch (err: any) {
      lastError = err;
      if (err?.status === 429) {
        const waitMs = 5000 * (attempt + 1);
        console.warn(`Rate limited (429). Retrying in ${waitMs / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
      } else {
        throw err;
      }
    }
  }
  throw lastError;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const fact = await generateWithRetry(
      'gemini-flash-latest',
      `You are an AI space guide. Give me one random, mind-blowing fact about space. Make it exactly one concise sentence.`
    );
    return res.status(200).json({ fact });
  } catch (error: any) {
    console.error('Fact API Error:', error);
    if (error?.status === 429) {
      return res.status(429).json({ error: 'API quota exceeded.' });
    }
    return res.status(500).json({ error: 'Failed to generate fact' });
  }
}
