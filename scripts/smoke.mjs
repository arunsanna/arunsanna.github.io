const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8080';
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 10000);

for (const path of ['/', '/healthz', '/api/status', '/api/projects']) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${base}${path}`, {
      signal: controller.signal,
    });
    await response.arrayBuffer();

    if (!response.ok) {
      throw new Error(`${path} returned HTTP ${response.status}`);
    }

    console.log(`${path} -> ${response.status}`);
  } finally {
    clearTimeout(timeout);
  }
}

process.exit(0);
