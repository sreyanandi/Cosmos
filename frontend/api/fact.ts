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
    try {
      const fact = await generateWithRetry(
        'gemini-flash-latest',
        `You are an AI space guide. Give me one random, mind-blowing fact about space. Make it exactly one concise sentence.`
      );
      return res.status(200).json({ fact });
    } catch (apiError: any) {
      console.warn('Gemini API fact serverless failed, falling back to offline fact generator:', apiError.message || apiError);
      const fact = getRandomOfflineFact();
      return res.status(200).json({ fact });
    }
  } catch (error: any) {
    console.error('Fact API Error:', error);
    return res.status(500).json({ error: 'Failed to generate fact' });
  }
}

const OFFLINE_FACTS = [
  "One day on Venus is longer than one year on Venus; it takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.",
  "Neutron stars are so dense that a single teaspoon of their material would weigh about 6 billion tons on Earth.",
  "Because there is no atmosphere or wind on the Moon, the footprints left by the Apollo astronauts will stay there for at least 100 million years.",
  "There is a giant cloud of alcohol in Sagittarius B2, a gas cloud near the center of the Milky Way, containing octillions of liters of ethanol.",
  "If two pieces of the same type of metal touch in space, they will permanently bond together through a process called cold welding.",
  "Jupiter's Great Red Spot is a colossal storm that has been raging for at least 350 years, and it is large enough to swallow the entire Earth.",
  "The Sun is so massive that it accounts for 99.86% of all the mass in our entire solar system.",
  "There are more trees on Earth (about 3 trillion) than there are stars in the Milky Way galaxy (about 100 to 400 billion).",
  "Mars has the tallest known volcano in the solar system, Olympus Mons, which stands three times higher than Mount Everest.",
  "Light from the Sun takes approximately 8 minutes and 20 seconds to travel the 93 million miles to Earth.",
  "Saturn's rings are not solid structures; they are made up of billions of individual particles of ice, rocky debris, and dust, ranging in size from tiny grains to mountain-sized chunks.",
  "Neptune's winds are the fastest in the solar system, reaching supersonic speeds of up to 1,500 miles per hour (2,400 km/h).",
  "Space is not a complete vacuum; it contains a very low density of particles, mostly hydrogen plasma, as well as electromagnetic radiation.",
  "A day on Saturn is only 10.7 hours long, but its year is about 29 Earth years due to its distant orbit.",
  "Mercury is the closest planet to the Sun, but Venus is actually the hottest planet in the solar system due to its thick runaway greenhouse atmosphere.",
  "Uranus rolls on its side as it orbits the Sun, with an axial tilt of 97.7 degrees, possibly caused by a massive collision in its early history.",
  "The Voyager 1 spacecraft, launched in 1977, is the farthest human-made object from Earth and has entered interstellar space.",
  "Sunset on Mars appears blue to human eyes because fine dust particles let blue light penetrate the atmosphere more efficiently than longer-wavelength colors."
];

function getRandomOfflineFact(): string {
  return OFFLINE_FACTS[Math.floor(Math.random() * OFFLINE_FACTS.length)];
}

