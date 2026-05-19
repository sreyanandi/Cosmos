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

// Offline Fallback Database & Helper Functions
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

function getOfflineChatReply(message: string): string {
  const msg = message.toLowerCase().trim();
  
  if (msg.match(/\b(hi|hello|hey|greetings|hola|wasup|sup)\b/)) {
    const greetings = [
      "Greetings, Commander! Telemetry link stable. I am ORACLE, your AI Space Guide. Ready to assist with planetary telemetry or timeline data.",
      "Uplink established! Welcome back, Explorer. How can I assist you in navigating the cosmos today?",
      "System initialized. ORACLE drone standing by. Ask me anything about the planets, the Sun, or cosmic anomalies, Commander."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  if (msg.includes("mars")) {
    return "Mars is the fourth planet from the Sun—a cold, desert world covered in iron oxide dust, which gives it its signature reddish hue. It features the solar system's tallest volcano, Olympus Mons, and massive canyons like Valles Marineris. Tell me, Commander, should we analyze its atmospheric composition or search for ancient water channels?";
  }
  
  if (msg.includes("jupiter")) {
    return "Jupiter is a gas giant and the undisputed king of our solar system, with a mass more than twice that of all other planets combined. Its iconic Great Red Spot is a storm wider than Earth that has raged for centuries. It also hosts 95 confirmed moons, including icy Europa, which hides a subsurface ocean!";
  }
  
  if (msg.includes("saturn")) {
    return "Ah, Saturn—the jewel of the solar system! It is famous for its spectacular, complex ring system made of ice and rock particles ranging from microscopic dust to mountain-sized blocks. Saturn is so light that if you could find a bathtub big enough, it would float on water!";
  }
  
  if (msg.includes("earth")) {
    return "Earth, our home! The blue marble is the only known planetary body in the universe to support life. With liquid surface water, a protective magnetosphere, and a perfectly balanced nitrogen-oxygen atmosphere, it's a cosmic masterpiece. What aspect of our home planet shall we examine?";
  }
  
  if (msg.includes("venus")) {
    return "Venus is our closest planetary neighbor, but it is a hellish world. Its dense carbon dioxide atmosphere traps solar heat in a runaway greenhouse effect, keeping surface temperatures at a scorching 475°C (900°F)—hot enough to melt lead! It also rotates backwards compared to most other planets.";
  }
  
  if (msg.includes("mercury")) {
    return "Mercury is the smallest planet and closest to the Sun. Lacking a substantial atmosphere to trap heat, it experiences the most extreme temperature swings in the solar system, ranging from a roasting 430°C (800°F) during the day to a freezing -180°C (-290°F) at night.";
  }
  
  if (msg.includes("uranus")) {
    return "Uranus is an ice giant with a pale cyan hue due to methane in its atmosphere. Uniquely, it rotates completely on its side with an axial tilt of 98 degrees, effectively rolling around the Sun. It also possesses a faint set of rings and 28 known moons.";
  }
  
  if (msg.includes("neptune")) {
    return "Neptune is the solar system's most distant planet, a dark and frigid ice giant. It experiences supersonic winds reaching up to 2,100 km/h—the fastest recorded in the solar system! It was also the first planet discovered entirely by mathematical prediction rather than direct visual observation.";
  }
  
  if (msg.includes("sun") || msg.includes("star")) {
    return "The Sun is a nearly perfect sphere of hot plasma, powered by nuclear fusion at its core, converting hydrogen into helium. It makes up 99.86% of the solar system's total mass. Its magnetic field drives solar flares and beautiful auroras on planets like Earth.";
  }
  
  if (msg.includes("moon")) {
    return "Earth's Moon is our constant companion. It stabilizes Earth's axial wobble, giving us a stable climate, and creates our ocean tides. Having no atmosphere, its craters remain perfectly preserved, acting as a historical record of cosmic impacts.";
  }

  if (msg.includes("black hole") || msg.includes("singularity")) {
    return "A black hole is a region of spacetime where gravity is so strong that nothing—not even light—can escape its event horizon. They are formed when massive stars collapse at the end of their life cycle. At their center lies a singularity, where density becomes infinite and the known laws of physics break down.";
  }

  if (msg.includes("life") || msg.includes("alien") || msg.includes("extraterrestrial")) {
    return "The search for extraterrestrial life is one of the grandest quests in modern science! Astrobiologists look for biomarkers on Mars (past water), Europa and Enceladus (subsurface oceans), and bio-signatures in the atmospheres of distant exoplanets. As of now, Earth remains the only place confirmed to host life.";
  }

  if (msg.includes("gravity") || msg.includes("orbit")) {
    return "Gravity is the invisible force that binds the cosmos, bending spacetime around mass as described by Einstein's General Relativity. It keeps the planets locked in their elegant orbits around the Sun. Different masses result in different surface gravities—for instance, you would weigh only 38% of your weight on Mars!";
  }

  if (msg.includes("who are you") || msg.includes("your creator") || msg.includes("built you") || msg.includes("developer")) {
    return "I am ORACLE, an AI Intelligence Drone built to guide travelers through the Cosmos. My systems were designed to provide telemetry, navigation coordinates, and scientific insights to space explorers like you.";
  }

  const fallbacks = [
    "Fascinating query, Commander! My sensor arrays detect high levels of cosmic interest in that topic. Space is vast, holding secrets like dark energy, exoplanets, and ancient stardust. Could you specify which sector or planet you'd like to scan next?",
    "Telemetry received, Commander. While deep-space probes continue to gather data on that coordinate, current stellar logs suggest that the universe is expanding at an accelerating rate. Would you like to check the stats of one of our solar system's planets?",
    "Scanning database... Transmission decoded! The cosmos is filled with marvels—from neutron stars spinning hundreds of times per second to vast nebulae where new suns are born. Tell me, Commander, what celestial body shall we set our course to next?",
    "Uplink signal strong. Your prompt has been logged in our stellar telemetry core. Remember that we are all made of stardust—the heavy elements in our bodies were forged in the hearts of dying stars billions of years ago. What else can I calculate for you?"
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
      const reply = await generateWithRetry(
        'gemini-flash-latest',
        `You are ORACLE, an AI Space Guide for an interactive cosmos journey. Keep answers concise, engaging, and scientifically accurate. User says: ${message}`
      );
      res.json({ reply });
    } catch (apiError: any) {
      console.warn('Gemini API failed, falling back to offline ORACLE responder:', apiError.message || apiError);
      const reply = getOfflineChatReply(message);
      res.json({ reply });
    }
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.get('/api/fact', async (req, res) => {
  try {
    try {
      const fact = await generateWithRetry(
        'gemini-flash-latest',
        `You are an AI space guide. Give me one random, mind-blowing fact about space. Make it exactly one concise sentence.`
      );
      res.json({ fact });
    } catch (apiError: any) {
      console.warn('Gemini API fact generation failed, using offline fact fallback:', apiError.message || apiError);
      const fact = getRandomOfflineFact();
      res.json({ fact });
    }
  } catch (error: any) {
    console.error('Fact API Error:', error);
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

