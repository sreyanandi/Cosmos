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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
      const reply = await generateWithRetry(
        'gemini-flash-latest',
        `You are ORACLE, an AI Space Guide for an interactive cosmos journey. Keep answers concise, engaging, and scientifically accurate. User says: ${message}`
      );
      return res.status(200).json({ reply });
    } catch (apiError: any) {
      console.warn('Gemini API serverless failed, falling back to offline ORACLE responder:', apiError.message || apiError);
      const reply = getOfflineChatReply(message);
      return res.status(200).json({ reply });
    }
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
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

