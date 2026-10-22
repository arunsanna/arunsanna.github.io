// Generates raster icons + the social OG image from SVG sources using sharp.
// Run once with `npm run gen:assets`; the PNGs are committed to public/ so the
// Docker build stays simple (no generation step in the image).
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, '..', 'public');

const faviconSvg = await readFile(path.join(pub, 'favicon.svg'));

// --- Raster favicons / app icons ---
await sharp(faviconSvg).resize(32, 32).png().toFile(path.join(pub, 'favicon-32.png'));
await sharp(faviconSvg).resize(180, 180).png().toFile(path.join(pub, 'apple-touch-icon.png'));

// --- Social OG image (1200x630) ---
const og = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="20%" cy="0%" r="90%">
      <stop offset="0%" stop-color="#06d7f2" stop-opacity="0.16"/>
      <stop offset="60%" stop-color="#06d7f2" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0e14"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="6" fill="#06d7f2"/>
  <text x="80" y="130" font-family="monospace" font-size="34" font-weight="700" fill="#06d7f2" letter-spacing="2">AS_</text>
  <text x="80" y="300" font-family="sans-serif" font-size="104" font-weight="800" fill="#f2f6fb" letter-spacing="-3">Arun Sanna</text>
  <text x="80" y="372" font-family="sans-serif" font-size="44" font-weight="600" fill="#06d7f2">Enterprise AI Architect &amp; Forward Deployed Engineer</text>
  <text x="80" y="452" font-family="sans-serif" font-size="30" fill="#aab4c0">Secure AI platforms for the DoD, federal, and frontier teams.</text>
  <text x="80" y="556" font-family="monospace" font-size="26" fill="#6b7785">Platform One  ·  CMS  ·  USAF  ·  400+ apps  ·  124K lives supported</text>
</svg>`;

await sharp(Buffer.from(og)).png().toFile(path.join(pub, 'og-image.png'));

console.log('Generated: favicon-32.png, apple-touch-icon.png, og-image.png');
