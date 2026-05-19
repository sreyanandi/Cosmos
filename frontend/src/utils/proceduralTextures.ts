import * as THREE from 'three';

// Simple pseudo-random noise helper
function noise(x: number, y: number, seed: number = 0): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.3) * 43758.5453;
  return n - Math.floor(n);
}

// Smooth fractal noise (FBM)
function fbm(x: number, y: number, octaves: number = 5, seed: number = 0): number {
  let val = 0, amp = 0.5, freq = 1, max = 0;
  for (let i = 0; i < octaves; i++) {
    val += (noise(x * freq, y * freq, seed + i) * 2 - 1) * amp;
    max += amp;
    amp *= 0.5;
    freq *= 2.1;
  }
  return val / max;
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// Texture cache so each planet is only generated once across component mounts
const textureCache = new Map<string, THREE.CanvasTexture>();

export function createProceduralTexture(name: string, _baseColorStr: string): THREE.CanvasTexture {
  const cacheKey = name;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey)!;

  // Reduced resolution: 512×256 — 4× fewer pixels, ~75% faster, indistinguishable at planet scale
  const W = 512, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  const d = img.data;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H;
      const idx = (y * W + x) * 4;
      let r = 0, g = 0, b = 0, a = 255;

      if (name === 'Earth') {
        const n = fbm(u * 4, v * 4, 5, 1);
        const lat = Math.abs(v - 0.5) * 2;
        const isPole = lat > 0.85;
        const isLand = n > 0.05;
        const isShallow = n > -0.1 && n <= 0.05;

        if (isPole) {
          const blend = clamp((lat - 0.85) / 0.15, 0, 1);
          r = lerp(isLand ? 80 : 30, 240, blend);
          g = lerp(isLand ? 100 : 80, 248, blend);
          b = lerp(isLand ? 80 : 180, 255, blend);
        } else if (isLand) {
          const elev = clamp((n - 0.05) / 0.45, 0, 1);
          const isTropical = lat < 0.25;
          if (elev > 0.75) { r = 160; g = 145; b = 130; }
          else if (elev > 0.5) { r = 100; g = 115; b = 80; }
          else if (isTropical) { r = 30; g = 110; b = 50; }
          else { r = 55; g = 130; b = 65; }
          if (lat > 0.28 && lat < 0.5 && n > 0.15) { r = 195; g = 165; b = 100; }
        } else if (isShallow) {
          r = 25; g = 100; b = 165;
        } else {
          const depth = clamp((-n - 0.1) / 0.5, 0, 1);
          r = lerp(18, 5, depth); g = lerp(60, 20, depth); b = lerp(160, 80, depth);
        }

      } else if (name === 'Mars') {
        const n = fbm(u * 3.5, v * 3.5, 4, 2);
        const n2 = fbm(u * 8, v * 8, 3, 99);
        const lat = Math.abs(v - 0.5) * 2;
        if (lat > 0.88) { r = 210; g = 200; b = 200; }
        else {
          const base = 185 + n * 40;
          r = clamp(base, 120, 220);
          g = clamp(80 + n * 25 + n2 * 10, 40, 120);
          b = clamp(40 + n * 10, 20, 70);
          if (n < -0.2) { r -= 40; g -= 20; }
        }

      } else if (name === 'Jupiter') {
        const band = Math.sin(v * Math.PI * 14 + fbm(u * 2, v * 0.5, 3, 5) * 1.2) * 0.5 + 0.5;
        const turb = fbm(u * 5, v * 5, 3, 6) * 0.3;
        const gx = (u - 0.6) * 3, gy = (v - 0.68) * 6;
        const spot = Math.exp(-(gx*gx + gy*gy) * 4);
        if (band > 0.6) { r = 230; g = 210; b = 180; }
        else if (band > 0.35) { r = 190; g = 145; b = 100; }
        else { r = 130; g = 80; b = 50; }
        r = clamp(r + turb * 30, 0, 255);
        g = clamp(g + turb * 20, 0, 255);
        b = clamp(b + turb * 15, 0, 255);
        r = lerp(r, 160, spot * 0.9); g = lerp(g, 60, spot * 0.9); b = lerp(b, 50, spot * 0.9);

      } else if (name === 'Saturn') {
        const band = Math.sin(v * Math.PI * 10 + fbm(u * 1.5, v * 0.3, 3, 7) * 0.8) * 0.5 + 0.5;
        if (band > 0.55) { r = 235; g = 215; b = 175; }
        else if (band > 0.3) { r = 200; g = 175; b = 130; }
        else { r = 175; g = 148; b = 105; }

      } else if (name === 'Uranus') {
        const n = fbm(u * 2, v * 2, 3, 8) * 0.15;
        r = Math.round((130 + n * 30) * 0.75); g = Math.round(190 + n * 20); b = Math.round(210 + n * 15);

      } else if (name === 'Neptune') {
        const n = fbm(u * 3, v * 3, 3, 9) * 0.2;
        const gx = (u - 0.4) * 4, gy = (v - 0.5) * 6;
        const spot = Math.exp(-(gx*gx + gy*gy) * 3);
        r = Math.round(20 + n * 20); g = Math.round(55 + n * 30); b = Math.round(180 + n * 40);
        r = lerp(r, 5, spot * 0.85); g = lerp(g, 10, spot * 0.85);

      } else if (name === 'Mercury') {
        const n = fbm(u * 4, v * 4, 3, 3);
        const base = 100 + n * 50;
        r = g = b = clamp(base, 55, 175);
        for (let i = 0; i < 20; i++) {
          const cx = noise(i * 3.1, 0, 10), cy = noise(0, i * 2.7, 10);
          const dist = Math.sqrt((u - cx) ** 2 + (v - cy) ** 2);
          if (dist < 0.025) { const cr = dist / 0.025; r = g = b = lerp(50, 160, cr); }
        }

      } else if (name === 'Venus') {
        const n = fbm(u * 2, v * 2, 3, 4);
        const swirl = Math.sin((u + n * 0.5) * Math.PI * 6 + fbm(u * 3, v * 3, 3, 40) * 2);
        r = clamp(200 + swirl * 20, 160, 240);
        g = clamp(155 + swirl * 15 + n * 20, 110, 200);
        b = clamp(60 + n * 20, 30, 100);

      } else if (name === 'Sun') {
        const n = fbm(u * 5, v * 5, 3, 0);
        r = 255; g = clamp(160 + n * 80, 100, 240); b = clamp(n * 40, 0, 60);
        for (let i = 0; i < 6; i++) {
          const sx = noise(i * 4.1, 1, 20), sy = noise(1, i * 3.7, 20);
          const dist = Math.sqrt((u - sx) ** 2 + (v - sy) ** 2);
          if (dist < 0.04) { const t = dist / 0.04; r = lerp(30, r, t); g = lerp(10, g, t); b = lerp(5, b, t); }
        }

      } else if (name === 'Moon') {
        const n = fbm(u * 3, v * 3, 4, 11);
        const base = 130 + n * 60;
        r = g = b = clamp(base, 60, 210);
        const m1 = Math.sqrt((u - 0.25) ** 2 + (v - 0.45) ** 2);
        const m2 = Math.sqrt((u - 0.65) ** 2 + (v - 0.38) ** 2);
        if (m1 < 0.1) { const t = m1 / 0.1; r = g = b = lerp(70, r as number, t); }
        if (m2 < 0.07) { const t = m2 / 0.07; r = g = b = lerp(75, r as number, t); }
      }

      d[idx] = clamp(Math.round(r as number), 0, 255);
      d[idx+1] = clamp(Math.round(g as number), 0, 255);
      d[idx+2] = clamp(Math.round(b as number), 0, 255);
      d[idx+3] = a;
    }
  }

  ctx.putImageData(img, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Realistic Saturn ring texture with Cassini division, B-ring density, and dust lanes.
 */
export function createRingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 1;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(1024, 1);
  const d = img.data;

  for (let x = 0; x < 1024; x++) {
    const t = x / 1023; // 0=inner, 1=outer
    let opacity = 0;
    let ri = 200, gi = 180, bi = 150; // base ring color

    // C ring (faint inner)
    if (t < 0.28) { opacity = t / 0.28 * 0.3; ri = 160; gi = 140; bi = 115; }
    // B ring (dense, bright)
    else if (t < 0.56) { opacity = 0.7 + Math.sin((t - 0.28) / 0.28 * Math.PI * 8) * 0.15; ri = 230; gi = 210; bi = 175; }
    // Cassini Division (gap)
    else if (t < 0.62) { opacity = Math.max(0, 0.05 - (t - 0.56) / 0.06 * 0.05); }
    // A ring
    else if (t < 0.62) { opacity = 0; }
    else if (t < 0.88) {
      const local = (t - 0.62) / 0.26;
      // Encke gap
      const encke = Math.abs(local - 0.42) < 0.04 ? 0 : 1;
      opacity = 0.55 * encke * (1 - local * 0.3);
      ri = 195; gi = 170; bi = 140;
    }
    // F ring (thin outer)
    else if (t < 0.95) { opacity = 0.25 * (1 - (t - 0.88) / 0.07); }
    else { opacity = 0; }

    const idx = x * 4;
    d[idx] = ri; d[idx+1] = gi; d[idx+2] = bi;
    d[idx+3] = Math.round(clamp(opacity, 0, 1) * 255);
  }

  ctx.putImageData(img, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
