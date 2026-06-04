import { spawn } from 'node:child_process';

const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8080';
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 10000);
const shouldAutostart = !process.env.SMOKE_BASE_URL && process.env.SMOKE_AUTOSTART !== '0';

const paths = ['/', '/healthz', '/api/status', '/api/projects', '/robots.txt', '/sitemap.xml'];
const compressionPaths = ['/'];
let server;

async function fetchWithTimeout(url, timeout = timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function isReachable() {
  try {
    const response = await fetchWithTimeout(`${base}/healthz`, 1200);
    await response.arrayBuffer();
    return response.ok;
  } catch {
    return false;
  }
}

async function startServerIfNeeded() {
  if (await isReachable()) return;
  if (!shouldAutostart) {
    throw new Error(
      `${base} is not reachable. Start the server first or set SMOKE_BASE_URL to a live deployment.`,
    );
  }

  server = spawn(process.execPath, ['server.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, NODE_ENV: 'production', PORT: new URL(base).port || '8080' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  server.stdout.on('data', (chunk) => process.stdout.write(`[server] ${chunk}`));
  server.stderr.on('data', (chunk) => process.stderr.write(`[server] ${chunk}`));

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isReachable()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for local server at ${base}`);
}

try {
  await startServerIfNeeded();

  for (const path of paths) {
    const response = await fetchWithTimeout(`${base}${path}`);
    await response.arrayBuffer();

    if (!response.ok) {
      throw new Error(`${path} returned HTTP ${response.status}`);
    }

    console.log(`${path} -> ${response.status}`);
  }

  for (const path of compressionPaths) {
    const response = await fetchWithTimeout(`${base}${path}`);
    await response.arrayBuffer();
    const encoding = response.headers.get('content-encoding');

    if (!['br', 'gzip'].includes(encoding)) {
      throw new Error(`${path} was not compressed; content-encoding=${encoding ?? 'none'}`);
    }

    console.log(`${path} compression -> ${encoding}`);
  }
} finally {
  if (server) {
    server.kill('SIGTERM');
  }
}
