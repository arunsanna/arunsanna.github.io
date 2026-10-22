import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyCompress from '@fastify/compress';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || '0.0.0.0';

// Astro builds static HTML/CSS/JS into dist/. This server's job is now narrow:
// serve dist/ and answer a small set of dynamic endpoints.
const distDir = path.join(__dirname, 'dist');
const projectsFile = path.join(__dirname, 'assets', 'projects.json');

const app = Fastify({ logger: true });

await app.register(fastifyCompress, {
  global: true,
  encodings: ['br', 'gzip'],
});

if (!existsSync(distDir)) {
  app.log.warn(`dist/ not found at ${distDir} — run "npm run build" (Astro) before starting.`);
}

// Content Security Policy. The v2 build emits same-origin scripts (no inline
// handlers), so script-src is now 'self' only. Fonts come from Google + cdnjs;
// Astro inlines small <style> blocks, so style-src keeps 'unsafe-inline'.
const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self'",
    "connect-src 'self'",
    'upgrade-insecure-requests',
  ].join('; '),
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

app.addHook('onRequest', async (_request, reply) => {
  for (const [name, value] of Object.entries(securityHeaders)) {
    reply.header(name, value);
  }
  reply.header('X-ArunLabs-Site', 'arunsanna-site');
});

// --- Dynamic endpoints (the ~5% that isn't static) ---
app.get('/healthz', async () => ({ ok: true }));

app.get('/api/status', async () => ({
  ok: true,
  service: 'arunsanna-site',
  stack: 'astro+fastify',
}));

app.get('/api/projects', async (_request, reply) => {
  try {
    const raw = await fs.readFile(projectsFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    app.log.error({ error }, 'failed to read projects.json');
    return reply.code(500).send({ ok: false, error: 'projects_unavailable' });
  }
});

// --- Static: serve the Astro build ---
app.register(fastifyStatic, {
  root: distDir,
  index: ['index.html'],
  // Own Cache-Control entirely (cacheControl:false stops @fastify/static from
  // overriding): content-hashed _astro assets are immutable; HTML revalidates.
  cacheControl: false,
  setHeaders(res, filePath) {
    if (filePath.includes(`${path.sep}_astro${path.sep}`)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  },
});

// Resolve a request path to a built HTML file within dist/, guarding against
// path traversal. Astro (build.format:'file') emits /projects.html, /work/x.html.
const resolveHtml = (rawUrl) => {
  let p;
  try {
    p = decodeURIComponent(rawUrl.split('?')[0]);
  } catch {
    p = rawUrl.split('?')[0];
  }
  p = p.replace(/\/+$/, '');
  if (!p || path.extname(p)) return null;
  const base = path.resolve(distDir) + path.sep;
  for (const candidate of [`${p}.html`, path.join(p, 'index.html')]) {
    const file = path.resolve(path.join(distDir, candidate));
    if (file.startsWith(base) && existsSync(file)) return file;
  }
  return null;
};

app.setNotFoundHandler(async (request, reply) => {
  if (request.url.startsWith('/api/')) {
    return reply.code(404).send({ ok: false, error: 'not_found' });
  }
  // Multi-page static: map extensionless routes (/projects, /work/:slug) to their
  // built HTML before 404ing — Astro's dev router does this; Fastify must too.
  const html = resolveHtml(request.url);
  if (html) {
    return reply
      .code(200)
      .header('Cache-Control', 'public, max-age=0, must-revalidate')
      .type('text/html; charset=utf-8')
      .send(await fs.readFile(html, 'utf8'));
  }
  // Serve the 404 page if Astro produced one, else a minimal fallback.
  const notFound = path.join(distDir, '404.html');
  if (existsSync(notFound)) {
    return reply.code(404).type('text/html; charset=utf-8').send(await fs.readFile(notFound, 'utf8'));
  }
  return reply.code(404).type('text/html; charset=utf-8').send('<h1>404 — Not found</h1>');
});

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
