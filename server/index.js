import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { timingSafeEqual } from 'node:crypto';
import { createServer as createViteServer } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT || 8080);
const API = 'https://api.geny.io/cloud';
const sessions = new Map();

function json(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(JSON.stringify(data));
}
function sameSecret(a, b) {
  if (!a || !b) return false;
  const aa = Buffer.from(a); const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 32768) { reject(new Error('Request body too large')); req.destroy(); } });
    req.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Invalid JSON body')); } });
    req.on('error', reject);
  });
}
function requireAccess(req) {
  return sameSecret(req.headers['x-device-access-key'], process.env.DEVICE_API_ACCESS_KEY);
}
function providerConfigured(provider, type) {
  if (provider === 'managed') {
    return Boolean(process.env.GENYMOTION_API_TOKEN && (type === 'cloud-phone' ? process.env.GENYMOTION_PHONE_RECIPE_UUID : process.env.GENYMOTION_EMULATOR_RECIPE_UUID));
  }
  return Boolean(process.env.SELF_HOSTED_DEVICE_API_URL && process.env.SELF_HOSTED_DEVICE_API_TOKEN);
}
async function genymotion(pathname, options = {}) {
  const token = process.env.GENYMOTION_API_TOKEN;
  if (!token) { const e = new Error('Genymotion is not configured. Add GENYMOTION_API_TOKEN in deployment environment.'); e.status = 503; throw e; }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(API + pathname, {
      ...options, signal: controller.signal,
      headers: { 'x-api-token': token, 'content-type': 'application/json', ...(options.headers || {}) }
    });
    const text = await response.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; } catch { data = { message: 'Genymotion returned an unexpected response.' }; }
    if (!response.ok) {
      const e = new Error(data.message || data.detail || 'Genymotion API returned HTTP ' + response.status);
      e.status = response.status === 401 || response.status === 403 ? 502 : (response.status === 404 ? 404 : 503);
      throw e;
    }
    return data;
  } finally { clearTimeout(timer); }
}
async function createGenymotionSession(type) {
  const recipe = type === 'cloud-phone' ? process.env.GENYMOTION_PHONE_RECIPE_UUID : process.env.GENYMOTION_EMULATOR_RECIPE_UUID;
  if (!recipe) { const e = new Error('Set ' + (type === 'cloud-phone' ? 'GENYMOTION_PHONE_RECIPE_UUID' : 'GENYMOTION_EMULATOR_RECIPE_UUID') + ' to a ready Genymotion recipe UUID.'); e.status = 503; throw e; }
  const created = await genymotion('/v1/recipes/' + encodeURIComponent(recipe) + '/start-disposable', {
    method: 'POST',
    body: JSON.stringify({ instance_name: 'masterstudio-' + type + '-' + Date.now(), rename_on_conflict: true, timeouts: { global: 60, inactivity: 15 } })
  });
  if (!created.uuid) { const e = new Error('Genymotion did not return an instance UUID.'); e.status = 502; throw e; }
  sessions.set(created.uuid, { provider: 'managed', type });
  try {
    const tokenData = await genymotion('/v1/instances/access-token', { method: 'POST', body: JSON.stringify({ instance_uuid: created.uuid }) });
    if (!tokenData.access_token || !created.webrtc_url) throw new Error('Instance started but the player connection details were not returned. Stop the instance and check the Genymotion API response.');
    return {
      sessionId: created.uuid, status: created.state || 'CREATING',
      webrtcUrl: created.webrtc_url, accessToken: tokenData.access_token,
      instanceUrl: 'https://cloud.geny.io/instance/' + encodeURIComponent(created.uuid)
    };
  } catch (error) {
    try { await genymotion('/v1/instances/' + encodeURIComponent(created.uuid) + '/stop-disposable', { method: 'POST', body: '{}' }); } catch {}
    sessions.delete(created.uuid);
    throw error;
  }
}
async function stopGenymotionSession(id) {
  const data = await genymotion('/v1/instances/' + encodeURIComponent(id) + '/stop-disposable', { method: 'POST', body: '{}' });
  sessions.delete(id);
  return { ended: true, sessionId: id, status: data.state || 'STOPPING' };
}
async function api(req, res, url) {
  if (url.pathname === '/api/health' && req.method === 'GET') return json(res, 200, { ok: true, service: 'masterstudio-device-api' });
  if (url.pathname === '/api/devices/providers' && req.method === 'GET') {
    return json(res, 200, {
      managed: { configured: providerConfigured('managed', 'cloud-phone') && providerConfigured('managed', 'android-emulator'), provider: 'Genymotion SaaS', docs: 'https://docs.genymotion.com/tools/saas/http_api/' },
      phone: { configured: providerConfigured('managed', 'cloud-phone') },
      emulator: { configured: providerConfigured('managed', 'android-emulator') },
      selfHosted: { configured: providerConfigured('self-hosted') }
    });
  }
  if (url.pathname.startsWith('/api/devices/') && !requireAccess(req)) {
    return json(res, process.env.DEVICE_API_ACCESS_KEY ? 401 : 503, { error: process.env.DEVICE_API_ACCESS_KEY ? 'Invalid device access key.' : 'Set DEVICE_API_ACCESS_KEY in the server environment before creating or stopping sessions.' });
  }
  if (url.pathname === '/api/devices/sessions' && req.method === 'POST') {
    let body;
    try { body = await readBody(req); } catch (e) { return json(res, 400, { error: e.message }); }
    const { type, provider = 'managed' } = body;
    if (!['cloud-phone', 'android-emulator'].includes(type)) return json(res, 400, { error: 'Unsupported device type.' });
    if (provider !== 'managed') return json(res, 503, { error: 'Self-hosted runtime is a future adapter and is not enabled yet.' });
    try { return json(res, 201, await createGenymotionSession(type)); }
    catch (e) { return json(res, e.status || 503, { error: e.name === 'AbortError' ? 'Genymotion API request timed out.' : e.message }); }
  }
  const stopMatch = url.pathname.match(/^\/api\/devices\/sessions\/([0-9a-f-]{36})$/i);
  if (stopMatch && req.method === 'DELETE') {
    const id = stopMatch[1];
    if (!sessions.has(id)) return json(res, 404, { error: 'Session is not tracked by this running Master Studio server. It may already be stopped or created by another server instance.' });
    try { return json(res, 200, await stopGenymotionSession(id)); }
    catch (e) { return json(res, e.status || 503, { error: e.name === 'AbortError' ? 'Genymotion API request timed out.' : e.message }); }
  }
  return json(res, 404, { error: 'API route not found.' });
}

const vite = isProduction ? null : await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname.startsWith('/api/')) return api(req, res, url);
  if (!isProduction) return vite.middlewares(req, res, async () => { res.statusCode = 404; res.end('Not found'); });
  let file = path.resolve(root, 'dist', '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(path.resolve(root, 'dist'))) { res.writeHead(403); return res.end('Forbidden'); }
  try {
    let info = await stat(file);
    if (info.isDirectory()) file = path.join(file, 'index.html');
    const data = await readFile(file);
    const ext = path.extname(file);
    const types = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json' };
    res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream', 'x-content-type-options':'nosniff' });
    return res.end(data);
  } catch {
    try { return res.writeHead(200, { 'content-type':'text/html; charset=utf-8' }).end(await readFile(path.join(root,'dist','index.html'))); }
    catch { return json(res, 500, { error: 'Production build is missing. Run npm run build first.' }); }
  }
});
server.listen(port, '0.0.0.0', () => console.log('Master Studio listening on port ' + port + (isProduction ? ' (production)' : ' (development)')));
