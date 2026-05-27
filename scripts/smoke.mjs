const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8080';

for (const path of ['/', '/healthz', '/api/status', '/api/projects']) {
  const response = await fetch(`${base}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`);
  }
  console.log(`${path} -> ${response.status}`);
}
