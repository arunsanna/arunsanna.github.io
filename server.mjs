import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || '0.0.0.0';
const startedAt = new Date().toISOString();

const app = Fastify({
  logger: true,
});

async function readProjects() {
  const raw = await fs.readFile(path.join(__dirname, 'assets', 'projects.json'), 'utf8');
  return JSON.parse(raw);
}

app.get('/healthz', async () => ({ ok: true, service: 'arunsanna-site', startedAt }));

app.get('/api/status', async () => ({
  ok: true,
  service: 'arunsanna-site',
  mode: process.env.NODE_ENV || 'development',
  dynamic: true,
  startedAt,
}));

app.get('/api/projects', async (_request, reply) => {
  try {
    return await readProjects();
  } catch (error) {
    app.log.error({ error }, 'failed to read projects.json');
    return reply.code(500).send({ ok: false, error: 'projects_unavailable' });
  }
});

app.register(fastifyStatic, {
  root: __dirname,
  index: 'index.html',
  decorateReply: false,
  setHeaders(res) {
    res.setHeader('X-ArunLabs-Site', 'arunsanna-site');
  },
});

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
