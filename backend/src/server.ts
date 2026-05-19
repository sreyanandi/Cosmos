import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import Database from 'better-sqlite3';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize Database
const db = new Database('cosmos.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    planetName TEXT UNIQUE NOT NULL
  )
`);

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper: generate content with retry on 429 (rate-limit)
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
        // Extract retryDelay from error details if available
        let waitMs = 5000 * (attempt + 1); // default backoff: 5s, 10s, 15s
        try {
          const body = JSON.parse(err.message);
          const retryInfo = body?.error?.details?.find(
            (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
          );
          if (retryInfo?.retryDelay) {
            const seconds = parseInt(retryInfo.retryDelay.replace('s', ''), 10);
            if (!isNaN(seconds)) waitMs = seconds * 1000 + 500;
          }
        } catch {}
        console.warn(`Rate limited (429). Retrying in ${waitMs / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitMs));
      } else {
        throw err; // non-429 errors bubble up immediately
      }
    }
  }
  throw lastError;
}

// Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const reply = await generateWithRetry(
      'gemini-flash-latest',
      `You are ORACLE, an AI Space Guide for an interactive cosmos journey. Keep answers concise, engaging, and scientifically accurate. User says: ${message}`
    );
    res.json({ reply });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    if (error?.status === 429) {
      return res.status(429).json({ error: 'API quota exceeded. Please try again in a moment.' });
    }
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.get('/api/fact', async (req, res) => {
  try {
    const fact = await generateWithRetry(
      'gemini-flash-latest',
      `You are an AI space guide. Give me one random, mind-blowing fact about space. Make it exactly one concise sentence.`
    );
    res.json({ fact });
  } catch (error: any) {
    console.error('Fact API Error:', error);
    if (error?.status === 429) {
      return res.status(429).json({ error: 'API quota exceeded.' });
    }
    res.status(500).json({ error: 'Failed to generate fact' });
  }
});

app.get('/api/favorites', (req, res) => {
  try {
    const favorites = db.prepare('SELECT planetName FROM favorites').all();
    res.json(favorites.map((f: any) => f.planetName));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

app.post('/api/favorites', (req, res) => {
  try {
    const { planetName } = req.body;
    if (!planetName) return res.status(400).json({ error: 'planetName is required' });

    db.prepare('INSERT OR IGNORE INTO favorites (planetName) VALUES (?)').run(planetName);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save favorite' });
  }
});

app.listen(PORT, () => {
  console.log(`Cosmos Backend running on port ${PORT}`);
});
// trigger restart
