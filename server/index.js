import express from 'express';
import { createServer as createViteServer } from 'vite';
import { timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

const providers = {
  managed: { url: process.env.MANAGED_DEVICE_API_URL, token: process.env.MANAGED_DEVICE_API_TOKEN },
  'self-hosted': { url: process.env.SELF_HOSTED_DEVICE_API_URL, token: process.env.SELF_HOSTED_DEVICE_API_TOKEN }
};

function sameSecret(a, b) {
  if (!a || !b) return false;
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
function requireDeviceAccess(req, res, next) {
  const expected = process.env.DEVICE_API_ACCESS_KEY;
  if (!expected) return res.status(503).json({ error: 'Device API is locked until DEVICE_API_ACCESS_KEY is configured on the server.' });
  if (!sameSecret(req.get('x-device-access-key') || '', expected)) {
    return res.status(401).json({ error: 'Invalid device access key.' });
  }
  next();
}
function providerFor(name) {
  if (!Object.hasOwn(providers, name)) return null;
  const p = providers[name];
  if (!p.url || !p.token) return null;
  try {
    const u = new URL(p.url);
    if (process.env.NODE_ENV === 'production' && u.protocol !== 'https:') return null;
  } catch { return null; }
  return p;
}
async function providerRequest(provider, pathname, options = {}) {
  const p = providerFor(provider);
  if (!p) {
    const e = new Error(provider === 'self-hosted'
      ? 'Self-hosted bridge is not configured. Set SELF_HOSTED_DEVICE_API_URL and SELF_HOSTED_DEVICE_API_TOKEN.'
      : 'Managed device provider is not configured. Set MANAGED_DEVICE_API_URL and MANAGED_DEVICE_API_TOKEN.');
    e.status = 503;
    throw e;
  }
  const base = p.url.replace(/\/+$/, '');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(base + pathname, {
      ...options,
      signal: controller.signal,
      headers: {
        authorization: 'Bearer ' + p.token,
        'content-type': 'application/json',
        ...(options.headers || {})
      }
    });
    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = { error: 'Provider returned a non-JSON response.' }; }
    if (!response.ok) {
      const e = new Error(data.error || data.message || 'Provider request failed with HTTP ' + response.status);
      e.status = response.status >= 400 && response.status < 500 ? 502 : 503;
      throw e;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'masterstudio-device-api' }));
app.get('/api/devices/providers', (_req, res) => {
  res.json({
    managed: { configured: Boolean(providerFor('managed')), label: 'Managed provider' },
    selfHosted: { configured: Boolean(providerFor('self-hosted')), label: 'Self-hosted bridge' }
  });
});
app.post('/api/devices/sessions', requireDeviceAccess, async (req, res) => {
  const { type, provider, profile, appTarget } = req.body || {};
  if (!['cloud-phone', 'android-emulator'].includes(type)) return res.status(400).json({ error: 'Unsupported device type.' });
  if (!['managed', 'self-hosted'].includes(provider)) return res.status(400).json({ error: 'Unsupported provider route.' });
  if (!['pixel-8', 'pixel-tablet', 'custom'].includes(profile)) return res.status(400).json({ error: 'Unsupported device profile.' });
  if (typeof appTarget !== 'string' || appTarget.length > 180 || /[\r\n]/.test(appTarget)) return res.status(400).json({ error: 'Invalid app launch target.' });
  try {
    const data = await providerRequest(provider, '/api/sessions', {
      method: 'POST',
      body: JSON.stringify({ type, profile, appTarget: appTarget.trim() || null, requestedBy: 'masterstudio' })
    });
    if (!data.sessionId || typeof data.sessionId !== 'string') {
      return res.status(502).json({ error: 'Provider response is missing sessionId. No active session was reported to Master Studio.' });
    }
    let launchUrl = null;
    if (data.launchUrl) {
      try {
        const u = new URL(data.launchUrl);
        if (u.protocol === 'https:') launchUrl = u.href;
      } catch {}
    }
    return res.status(201).json({
      sessionId: data.sessionId,
      status: typeof data.status === 'string' ? data.status : 'created',
      launchUrl,
      deviceName: typeof data.deviceName === 'string' ? data.deviceName : undefined,
      expiresAt: typeof data.expiresAt === 'string' ? data.expiresAt : undefined
    });
  } catch (e) {
    return res.status(e.status || 503).json({ error: e.name === 'AbortError' ? 'Provider request timed out.' : (e.message || 'Unable to create provider session.') });
  }
});
app.delete('/api/devices/sessions/:sessionId', requireDeviceAccess, async (req, res) => {
  const provider = req.body?.provider;
  if (!['managed', 'self-hosted'].includes(provider)) return res.status(400).json({ error: 'Unsupported provider route.' });
  const id = req.params.sessionId;
  if (!id || id.length > 180 || !/^[A-Za-z0-9._:-]+$/.test(id)) return res.status(400).json({ error: 'Invalid session ID.' });
  try {
    const data = await providerRequest(provider, '/api/sessions/' + encodeURIComponent(id), { method: 'DELETE' });
    return res.json({ ended: true, sessionId: id, status: data.status || 'ended' });
  } catch (e) {
    return res.status(e.status || 503).json({ error: e.name === 'AbortError' ? 'Provider request timed out.' : (e.message || 'Unable to end provider session.') });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
  app.use(vite.middlewares);
} else {
  const dist = path.resolve(__dirname, '../dist');
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const port = Number(process.env.PORT || 8080);
app.listen(port, '0.0.0.0', () => {
  console.log('Master Studio listening on port ' + port);
  console.log('Device adapters are available only when provider URL/token and DEVICE_API_ACCESS_KEY are configured.');
});
