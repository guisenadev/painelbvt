import { generateHTML } from './template.js';

const getAllowedDomains = (env) => {
  try { return JSON.parse(env.ALLOWED_DOMAINS || '[]'); } catch { return []; }
};

const getDefaultDomain = (env) => getAllowedDomains(env)[0] || 'fluxiamf.com.br';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const randomId = () => crypto.randomUUID();

const toSiteName = (name) =>
  name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    .replace(/^-|-$/g, '').substring(0, 28);

const parseFbVerification = (val = '') => {
  if (!val) return '';
  const match = val.match(/content=["']([^"']+)["']/);
  return match ? match[1] : val.trim();
};

const parseDnsTxt = (val = '') => {
  if (!val) return '';
  const s = val.trim();
  const match = s.match(/facebook-domain-verification=([a-z0-9]+)/i);
  return match ? match[1] : s;
};

// ── Auth helpers ────────────────────────────────────────────────
async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(salt + password));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSessionUser(request, env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const session = await env.DB.prepare(
    `SELECT s.user_id, s.expires_at, u.username, u.role, u.nome, u.email_addr, u.telefone
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ?`
  ).bind(token).first();
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  return session;
}

// ── Cloudflare Pages (pages.dev) ────────────────────────────────
function toBase64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function safeJson(response) {
  const text = await response.text();
  if (!text || !text.trim()) throw new Error(`HTTP ${response.status} — resposta vazia`);
  try { return JSON.parse(text); }
  catch { throw new Error(`HTTP ${response.status} — não é JSON: ${text.substring(0, 200)}`); }
}

async function cfPagesCreateProject(projectName, accountId, apiToken) {
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`,
    { method: 'POST', headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: projectName, production_branch: 'main' }),
      signal: AbortSignal.timeout(25000) }
  );
  const data = await safeJson(r);
  if (!data.success) throw new Error('CF Pages create failed: ' + JSON.stringify(data.errors));
}

async function cfPagesDeploy(projectName, html, accountId, apiToken, fbVerification = '') {
  const encoder = new TextEncoder();
  const htmlBytes = encoder.encode(html);
  const hashBuffer = await crypto.subtle.digest('SHA-256', htmlBytes);
  const hash = Array.from(new Uint8Array(hashBuffer)).slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');

  let verifHash = null, verifBytes = null, redirectsHash = null, redirectsBytes = null;
  if (fbVerification) {
    verifBytes = encoder.encode(fbVerification);
    const vBuf = await crypto.subtle.digest('SHA-256', verifBytes);
    verifHash = Array.from(new Uint8Array(vBuf)).slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
    redirectsBytes = encoder.encode(`/${fbVerification}.html /${fbVerification} 200\n`);
    const rBuf = await crypto.subtle.digest('SHA-256', redirectsBytes);
    redirectsHash = Array.from(new Uint8Array(rBuf)).slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const tokenR = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/upload-token`,
    { headers: { Authorization: `Bearer ${apiToken}` }, signal: AbortSignal.timeout(25000) }
  );
  const { result: { jwt } } = await safeJson(tokenR);

  const allHashes = [hash, ...(verifHash ? [verifHash, redirectsHash] : [])];
  const missingR = await fetch('https://api.cloudflare.com/client/v4/pages/assets/check-missing', {
    method: 'POST', headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ hashes: allHashes }), signal: AbortSignal.timeout(25000),
  });
  const { result: missing } = await safeJson(missingR);

  const filesToUpload = [];
  if ((missing || []).includes(hash)) filesToUpload.push({ key: hash, value: toBase64(htmlBytes), metadata: { contentType: 'text/html; charset=utf-8' }, base64: true });
  if (verifHash && (missing || []).includes(verifHash)) filesToUpload.push({ key: verifHash, value: toBase64(verifBytes), metadata: { contentType: 'text/html; charset=utf-8' }, base64: true });
  if (redirectsHash && (missing || []).includes(redirectsHash)) filesToUpload.push({ key: redirectsHash, value: toBase64(redirectsBytes), metadata: { contentType: 'text/plain' }, base64: true });

  if (filesToUpload.length > 0) {
    await fetch('https://api.cloudflare.com/client/v4/pages/assets/upload', {
      method: 'POST', headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(filesToUpload), signal: AbortSignal.timeout(25000),
    });
  }
  await fetch('https://api.cloudflare.com/client/v4/pages/assets/upsert-hashes', {
    method: 'POST', headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ hashes: allHashes }), signal: AbortSignal.timeout(25000),
  });

  const boundary = '----CFDeploy' + Math.random().toString(36).substring(2);
  const enc = new TextEncoder();
  const manifest = { '/index.html': hash };
  if (verifHash) { manifest[`/${fbVerification}.html`] = verifHash; manifest['/_redirects'] = redirectsHash; }
  const mpBody = enc.encode(`--${boundary}\r\nContent-Disposition: form-data; name="manifest"\r\n\r\n${JSON.stringify(manifest)}\r\n--${boundary}--\r\n`);
  const deployR = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`,
    { method: 'POST', headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body: mpBody, signal: AbortSignal.timeout(25000) }
  );
  const deployData = await safeJson(deployR);
  if (!deployData.success) throw new Error('deploy failed: ' + JSON.stringify(deployData.errors));
}

async function deleteCFPagesSite(projectName, accountId, apiToken) {
  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${apiToken}` }, signal: AbortSignal.timeout(25000) }
  );
}

// ── Cloudflare Workers (workers.dev) ────────────────────────────
async function cfWorkerDeploy(slug, siteData, accountId, apiToken, workersSubdomain) {
  const html = generateHTML(siteData);
  const fbVerif = siteData.fb_verification || '';

  const workerScript = `const HTML=${JSON.stringify(html)};const FB=${JSON.stringify(fbVerif)};export default{fetch(r){const u=new URL(r.url),p=u.pathname;if(FB&&p!=='/'&&p!=='/index.html'){const c=p.replace(/^\\//, '').replace(/\\.html$/,'');if(c===FB)return new Response(FB,{headers:{'Content-Type':'text/html;charset=utf-8'}});}return new Response(HTML,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'public,max-age=3600'}});}}`;

  const enc = new TextEncoder();
  const boundary = '----CFWorkerDeploy' + Math.random().toString(36).substring(2);
  const metadata = JSON.stringify({ main_module: 'worker.js', compatibility_date: '2024-01-01' });
  const body = [
    `--${boundary}\r\nContent-Disposition: form-data; name="metadata"\r\nContent-Type: application/json\r\n\r\n${metadata}\r\n`,
    `--${boundary}\r\nContent-Disposition: form-data; name="worker.js"; filename="worker.js"\r\nContent-Type: application/javascript+module\r\n\r\n${workerScript}\r\n`,
    `--${boundary}--\r\n`,
  ].join('');

  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${slug}`,
    { method: 'PUT', headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body: enc.encode(body), signal: AbortSignal.timeout(25000) }
  );
  const data = await safeJson(r);
  if (!data.success) throw new Error('Worker deploy failed: ' + JSON.stringify(data.errors));

  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${slug}/subdomain`,
    { method: 'POST', headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: true }), signal: AbortSignal.timeout(10000) }
  );

  return `https://${slug}.${workersSubdomain}.workers.dev`;
}

async function cfWorkerDelete(slug, accountId, apiToken) {
  await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${slug}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${apiToken}` }, signal: AbortSignal.timeout(25000) }
  );
}

// ── KV Site storage ─────────────────────────────────────────────
async function saveSiteToKV(slug, siteData, env) {
  const html = generateHTML(siteData);
  await env.SITES_KV.put(`site:${slug}`, html);
  const fbVerif = siteData.fb_verification;
  if (fbVerif) {
    await env.SITES_KV.put(`site:${slug}:${fbVerif}`, fbVerif);
  }
}

async function deleteSiteFromKV(slug, env) {
  try {
    const listed = await env.SITES_KV.list({ prefix: `site:${slug}` });
    await Promise.all(listed.keys.map(k => env.SITES_KV.delete(k.name)));
  } catch (err) {
    console.error(`KV delete failed for ${slug}:`, err.message);
  }
}

// ── Serve site from KV (custom domain requests) ─────────────────
async function serveSite(request, env, url, slug) {
  const pathname = url.pathname;

  // Try verification file for non-root paths
  if (pathname !== '/' && pathname !== '/index.html') {
    const code = pathname.replace(/^\//, '').replace(/\.html$/, '');
    if (code) {
      const verifContent = await env.SITES_KV.get(`site:${slug}:${code}`);
      if (verifContent !== null) {
        return new Response(verifContent, {
          headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
        });
      }
    }
  }

  const html = await env.SITES_KV.get(`site:${slug}`);
  if (!html) {
    return new Response('Site não encontrado', { status: 404, headers: { 'Content-Type': 'text/plain' } });
  }
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}

// ── Força o Facebookbot a crawlear o site ────────────────────────
async function triggerFacebookScrape(siteUrl, fbVerification) {
  const urls = [siteUrl];
  if (fbVerification) urls.push(`${siteUrl}/${fbVerification}`);
  for (const url of urls) {
    try {
      const r = await fetch(
        `https://graph.facebook.com/?id=${encodeURIComponent(url)}&scrape=true`,
        { method: 'POST', signal: AbortSignal.timeout(15000) }
      );
      console.log(`FB scrape ${url}: HTTP ${r.status}`);
    } catch (err) {
      console.log(`FB scrape ${url}: falhou (${err.message})`);
    }
  }
}

// ── Cron: limpa sessões e reprocessa sites travados ─────────────
async function processPending(env) {
  const { results } = await env.DB.prepare(
    `SELECT * FROM sites WHERE status IN ('processing','updating') ORDER BY created_at ASC LIMIT 5`
  ).all();

  for (const site of results) {
    try {
      if (!site.repo_name) {
        await env.DB.prepare(`UPDATE sites SET status='error' WHERE id=?`).bind(site.id).run();
        continue;
      }
      const html = generateHTML(site);
      if (site.domain === 'pages.dev') {
        const accountId = env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = env.CLOUDFLARE_API_TOKEN;
        if (site.status === 'processing') {
          await cfPagesCreateProject(site.repo_name, accountId, apiToken);
        }
        await cfPagesDeploy(site.repo_name, html, accountId, apiToken, site.fb_verification || '');
        const siteUrl = `https://${site.repo_name}.pages.dev`;
        await env.DB.prepare(`UPDATE sites SET site_url=?, repo_url=?, status='live' WHERE id=?`).bind(siteUrl, siteUrl, site.id).run();
        await triggerFacebookScrape(siteUrl, site.fb_verification || '');
      } else {
        await saveSiteToKV(site.repo_name, site, env);
        await env.DB.prepare(`UPDATE sites SET status='live' WHERE id=?`).bind(site.id).run();
      }
      console.log('Site recovered:', site.repo_name);
    } catch (err) {
      console.error(`Erro ao reprocessar ${site.id}:`, err.message);
      await env.DB.prepare(`UPDATE sites SET status='error' WHERE id=?`).bind(site.id).run();
    }
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`DELETE FROM sessions WHERE expires_at < ?`).bind(now).run();
}

// ── Email parsing helpers ────────────────────────────────────────
function getHeader(headers, name) {
  const re = new RegExp(`^${name}:\\s*(.+?)(?=\\r?\\n[^\\t ]|$)`, 'ims');
  const m = headers.match(re);
  return m ? m[1].replace(/\r?\n\t/g, ' ').trim() : '';
}

function decodeTransfer(body, enc) {
  if (enc === 'base64') {
    try { return atob(body.replace(/\s+/g, '')); } catch { return body; }
  }
  if (enc === 'quoted-printable') {
    return body.replace(/=\r?\n/g, '').replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
  return body;
}

function stripHtmlTags(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<\/div>/gi, '\n')
    .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/\n{3,}/g, '\n\n').trim();
}

function extractPart(hdr, body) {
  const ct = getHeader(hdr, 'Content-Type') || 'text/plain';
  const ctL = ct.toLowerCase();
  const enc = getHeader(hdr, 'Content-Transfer-Encoding').toLowerCase();
  if (ctL.startsWith('text/plain')) return decodeTransfer(body, enc);
  if (ctL.startsWith('text/html')) return stripHtmlTags(decodeTransfer(body, enc));
  if (ctL.startsWith('multipart/')) {
    const bm = ct.match(/boundary=["']?([^"'\s;]+)["']?/i);
    if (!bm) return '';
    const boundary = bm[1];
    const parts = body.split('--' + boundary).slice(1).filter(p => !p.startsWith('--'));
    const tryType = (type) => {
      for (const p of parts) {
        const si = p.indexOf('\r\n\r\n') !== -1 ? p.indexOf('\r\n\r\n') : p.indexOf('\n\n');
        if (si === -1) continue;
        const ph = p.substring(0, si); const pb = p.substring(si + (p.indexOf('\r\n\r\n') !== -1 ? 4 : 2));
        const pct = getHeader(ph, 'Content-Type') || '';
        if (pct.toLowerCase().startsWith(type)) { const r = extractPart(ph, pb); if (r.trim()) return r; }
      }
      return null;
    };
    return tryType('text/plain') || tryType('text/html') || tryType('multipart/') || '';
  }
  return '';
}

function parseEmailBody(raw) {
  const crlf = raw.includes('\r\n\r\n');
  const sep = crlf ? '\r\n\r\n' : '\n\n';
  const si = raw.indexOf(sep);
  if (si === -1) return raw.trim();
  return extractPart(raw.substring(0, si), raw.substring(si + sep.length));
}

function randomEmailPrefix() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => chars[b % chars.length]).join('');
}

export default {
  async email(message, env, ctx) {
    try {
      const to = message.to;
      const from = message.from;
      const subject = message.headers.get('subject') || '(sem assunto)';

      const addr = await env.DB.prepare('SELECT id FROM temp_email_addresses WHERE address=?').bind(to).first();
      if (!addr) return;

      const rawText = await new Response(message.raw).text();
      const bodyText = parseEmailBody(rawText).substring(0, 50000);
      const emailId = randomId();
      const now = new Date().toISOString();
      await env.DB.prepare(
        'INSERT INTO received_emails (id, address, from_addr, subject, body_text, received_at) VALUES (?,?,?,?,?,?)'
      ).bind(emailId, to, from, subject, bodyText, now).run();
    } catch (err) {
      console.error('Email handler error:', err.message);
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(processPending(env));
  },

  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (err) {
      console.error('Unhandled error:', err.message, err.stack?.substring(0, 300));
      return json({ error: 'Erro interno do servidor', detail: err.message }, 500);
    }
  },
};

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const host = request.headers.get('Host') || '';

  // Serve site pages via custom domain (*.dominio.com.br)
  const allowedDomains = getAllowedDomains(env);
  const matchedDomain = allowedDomains.find(d => host.endsWith(`.${d}`));
  if (matchedDomain) {
    const slug = host.slice(0, -(matchedDomain.length + 1));
    if (slug && !slug.includes('.')) return serveSite(request, env, url, slug);
  }

  if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // ── Serve site via workers.dev path (/s/{slug}) ─────────────
  if (method === 'GET' && path.startsWith('/s/')) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const slug = parts[1];
      const subPath = parts.length > 2 ? '/' + parts.slice(2).join('/') : '/';
      const subUrl = new URL(request.url);
      subUrl.pathname = subPath;
      return serveSite(request, env, subUrl, slug);
    }
  }

  // ── Domínios disponíveis (público) ──────────────────────────
  if (method === 'GET' && path === '/api/domains') {
    return json(getAllowedDomains(env));
  }

  // ── Auth (público) ───────────────────────────────────────────
  if (method === 'POST' && path === '/api/auth/login') {
    const { username, password } = await request.json();
    if (!username || !password) return json({ error: 'username e password obrigatórios' }, 400);
    const user = await env.DB.prepare('SELECT * FROM users WHERE username=?').bind(username).first();
    if (!user) return json({ error: 'Usuário ou senha inválidos' }, 401);
    const hash = await hashPassword(password, user.salt);
    if (hash !== user.password_hash) return json({ error: 'Usuário ou senha inválidos' }, 401);
    const token = randomId();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await env.DB.prepare(`INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)`).bind(token, user.id, expires).run();
    return json({ token, username: user.username, role: user.role, nome: user.nome || '', email: user.email_addr || '', telefone: user.telefone || '' });
  }

  if (method === 'POST' && path === '/api/auth/register') {
    return json({ error: 'Cadastro desativado. Solicite acesso ao administrador.' }, 403);
  }

  if (method === 'POST' && path === '/api/auth/logout') {
    const auth = request.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (token) await env.DB.prepare('DELETE FROM sessions WHERE token=?').bind(token).run();
    return json({ ok: true });
  }

  if (method === 'GET' && path === '/api/auth/me') {
    const user = await getSessionUser(request, env);
    if (!user) return json({ error: 'Não autenticado' }, 401);
    return json({ username: user.username, role: user.role, nome: user.nome || '', email: user.email_addr || '', telefone: user.telefone || '' });
  }

  // ── Requer auth ──────────────────────────────────────────────
  const user = await getSessionUser(request, env);

  // ── Perfil do usuário ────────────────────────────────────────
  if (method === 'PATCH' && path === '/api/auth/profile') {
    if (!user) return json({ error: 'Não autenticado' }, 401);
    const body = await request.json();
    const { nome, email, telefone, newPassword, currentPassword } = body;

    if (newPassword) {
      const u = await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(user.user_id).first();
      if (!u) return json({ error: 'Usuário não encontrado' }, 404);
      const currentHash = await hashPassword(currentPassword || '', u.salt);
      if (currentHash !== u.password_hash) return json({ error: 'Senha atual incorreta' }, 403);
      const newSalt = randomId();
      const newHash = await hashPassword(newPassword, newSalt);
      await env.DB.prepare('UPDATE users SET password_hash=?, salt=? WHERE id=?').bind(newHash, newSalt, user.user_id).run();
    }

    await env.DB.prepare('UPDATE users SET nome=?, email_addr=?, telefone=? WHERE id=?')
      .bind(nome ?? user.nome ?? '', email ?? user.email_addr ?? '', telefone ?? user.telefone ?? '', user.user_id).run();

    return json({ ok: true, nome: nome || '', email: email || '', telefone: telefone || '' });
  }

  // ── Admin ────────────────────────────────────────────────────
  if (path.startsWith('/api/admin')) {
    if (!user) return json({ error: 'Não autenticado' }, 401);
    if (user.role !== 'admin') return json({ error: 'Acesso negado' }, 403);

    if (method === 'GET' && path === '/api/admin/users') {
      const { results } = await env.DB.prepare(
        `SELECT id, username, nome, email_addr, telefone, role, created_at FROM users ORDER BY created_at DESC`
      ).all();
      return json(results);
    }

    if (method === 'POST' && path === '/api/admin/users') {
      const { username, password, nome, email, telefone, role } = await request.json();
      if (!username || !password) return json({ error: 'username e password obrigatórios' }, 400);
      if (username.length < 3) return json({ error: 'username precisa ter pelo menos 3 caracteres' }, 400);
      if (password.length < 6) return json({ error: 'senha precisa ter pelo menos 6 caracteres' }, 400);
      if (!/^[a-z0-9_]+$/i.test(username)) return json({ error: 'username só pode ter letras, números e _' }, 400);
      const existing = await env.DB.prepare('SELECT id FROM users WHERE username=?').bind(username).first();
      if (existing) return json({ error: 'Username já está em uso' }, 409);
      const salt = randomId();
      const hash = await hashPassword(password, salt);
      const userId = randomId();
      await env.DB.prepare(
        `INSERT INTO users (id, username, password_hash, salt, role, nome, email_addr, telefone) VALUES (?,?,?,?,?,?,?,?)`
      ).bind(userId, username, hash, salt, role || 'client', nome || '', email || '', telefone || '').run();
      return json({ ok: true, username, role: role || 'client' }, 201);
    }

    if (method === 'PATCH' && path.startsWith('/api/admin/users/')) {
      const userId = path.split('/')[4];
      const { nome, email, telefone, role, password } = await request.json();
      if (role && !['client', 'admin'].includes(role)) return json({ error: 'Role inválido' }, 400);
      if (password) {
        const newSalt = randomId();
        const newHash = await hashPassword(password, newSalt);
        await env.DB.prepare('UPDATE users SET password_hash=?, salt=? WHERE id=?').bind(newHash, newSalt, userId).run();
      }
      await env.DB.prepare('UPDATE users SET nome=?, email_addr=?, telefone=?, role=? WHERE id=?')
        .bind(nome ?? '', email ?? '', telefone ?? '', role ?? 'client', userId).run();
      return json({ ok: true });
    }

    if (method === 'DELETE' && path.startsWith('/api/admin/users/')) {
      const userId = path.split('/')[4];
      const { results: userSites } = await env.DB.prepare('SELECT repo_name, domain FROM sites WHERE user_id=?').bind(userId).all();
      for (const site of userSites) {
        if (!site.repo_name) continue;
        if (site.domain === 'pages.dev') {
          try { await deleteCFPagesSite(site.repo_name, env.CLOUDFLARE_ACCOUNT_ID, env.CLOUDFLARE_API_TOKEN); } catch {}
        } else {
          await deleteSiteFromKV(site.repo_name, env);
        }
      }
      await env.DB.prepare('DELETE FROM sites WHERE user_id=?').bind(userId).run();
      await env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(userId).run();
      await env.DB.prepare('DELETE FROM users WHERE id=?').bind(userId).run();
      return json({ deleted: true });
    }

    if (method === 'GET' && path === '/api/admin/stats') {
      const { results: usersStats } = await env.DB.prepare('SELECT COUNT(*) as total FROM users').all();
      const { results: sitesStats } = await env.DB.prepare("SELECT COUNT(*) as total FROM sites WHERE status='live'").all();
      return json({ users: usersStats[0], sites: sitesStats[0] });
    }
  }

  // ── Sites ────────────────────────────────────────────────────
  if (path.startsWith('/api/sites')) {
    if (!user) return json({ error: 'Não autenticado' }, 401);

    if (method === 'GET' && path === '/api/sites') {
      if (user.role === 'admin') {
        const { results } = await env.DB.prepare(
          `SELECT s.*, u.username as owner_username FROM sites s
           LEFT JOIN users u ON u.id = s.user_id
           ORDER BY s.created_at DESC`
        ).all();
        return json(results);
      }
      const { results } = await env.DB.prepare('SELECT * FROM sites WHERE user_id=? ORDER BY created_at DESC').bind(user.user_id).all();
      return json(results);
    }

    if (method === 'POST' && path === '/api/sites') {
      const body = await request.json();
      const { razao_social, cnpj } = body;
      if (!razao_social || !cnpj) return json({ error: 'razao_social e cnpj obrigatórios' }, 400);

      const siteId = randomId();
      const now = new Date().toISOString();
      const suffix = siteId.replace(/-/g, '').substring(0, 6);
      const slug = (toSiteName(razao_social) + '-' + suffix).substring(0, 63);
      const allowed = getAllowedDomains(env);
      const chosenDomain = (body.domain && allowed.includes(body.domain)) ? body.domain : getDefaultDomain(env);
      const workersSubdomain = env.WORKERS_SUBDOMAIN || 'viraloficial9';
      const siteUrl = chosenDomain === 'workers.dev'
        ? `https://${slug}.${workersSubdomain}.workers.dev`
        : `https://${slug}.${chosenDomain}`;
      const fbVerif = parseFbVerification(body.fb_verification);
      const dnsTxt = parseDnsTxt(body.dns_txt_verification);

      const siteData = {
        id: siteId, razao_social, cnpj,
        endereco: body.endereco || '', bairro: body.bairro || '',
        cidade: body.cidade || '', estado: body.estado || '',
        cep: body.cep || '', telefone: body.telefone || '',
        email: body.email || '', nome_topo: body.nome_topo || '',
        foto_url: body.foto_url || '', fb_verification: fbVerif,
        atividade_principal: body.atividade_principal || '',
        data_abertura: body.data_abertura || '', descricao: body.descricao || '',
      };

      await env.DB.prepare(
        `INSERT INTO sites (id,user_id,razao_social,cnpj,endereco,bairro,cidade,estado,cep,telefone,email,nome_topo,foto_url,fb_verification,dns_txt_verification,atividade_principal,data_abertura,descricao,repo_name,repo_url,site_url,domain,status,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'processing',?)`
      ).bind(siteId, user.user_id, razao_social, cnpj, siteData.endereco, siteData.bairro,
             siteData.cidade, siteData.estado, siteData.cep, siteData.telefone, siteData.email,
             siteData.nome_topo, siteData.foto_url, fbVerif, dnsTxt,
             siteData.atividade_principal, siteData.data_abertura, siteData.descricao,
             slug, siteUrl, siteUrl, chosenDomain, now).run();

      try {
        if (chosenDomain === 'pages.dev') {
          // CF Pages: processamento assíncrono via cron
          ctx.waitUntil(processPending(env));
          return json({ siteId, status: 'processing' }, 202);
        } else if (chosenDomain === 'workers.dev') {
          await cfWorkerDeploy(slug, siteData, env.CLOUDFLARE_ACCOUNT_ID, env.CLOUDFLARE_API_TOKEN, workersSubdomain);
          await env.DB.prepare(`UPDATE sites SET status='live' WHERE id=?`).bind(siteId).run();
          ctx.waitUntil(triggerFacebookScrape(siteUrl, fbVerif));
          return json({ siteId, status: 'live', site_url: siteUrl }, 201);
        } else {
          await saveSiteToKV(slug, siteData, env);
          await env.DB.prepare(`UPDATE sites SET status='live' WHERE id=?`).bind(siteId).run();
          ctx.waitUntil(triggerFacebookScrape(siteUrl, fbVerif));
          return json({ siteId, status: 'live', site_url: siteUrl }, 201);
        }
      } catch (err) {
        console.error('Site create failed:', err.message);
        return json({ siteId, status: 'processing' }, 202);
      }
    }

    if (method === 'GET' && path.startsWith('/api/sites/')) {
      const id = path.split('/')[3];
      const site = await env.DB.prepare('SELECT * FROM sites WHERE id=?').bind(id).first();
      if (!site) return json({ error: 'Not found' }, 404);
      return json(site);
    }

    if (method === 'PATCH' && path.startsWith('/api/sites/')) {
      const id = path.split('/')[3];
      const body = await request.json();
      const existing = user.role === 'admin'
        ? await env.DB.prepare('SELECT * FROM sites WHERE id=?').bind(id).first()
        : await env.DB.prepare('SELECT * FROM sites WHERE id=? AND user_id=?').bind(id, user.user_id).first();
      if (!existing) return json({ error: 'Not found' }, 404);

      const updated = { ...existing, ...body };
      const fbVerif = parseFbVerification(updated.fb_verification);
      const dnsTxt = parseDnsTxt(updated.dns_txt_verification);

      await env.DB.prepare(
        `UPDATE sites SET razao_social=?,cnpj=?,endereco=?,bairro=?,cidade=?,estado=?,
         cep=?,telefone=?,email=?,nome_topo=?,foto_url=?,fb_verification=?,dns_txt_verification=?,
         atividade_principal=?,data_abertura=?,descricao=?,status='updating' WHERE id=?`
      ).bind(updated.razao_social, updated.cnpj, updated.endereco, updated.bairro,
             updated.cidade, updated.estado, updated.cep, updated.telefone,
             updated.email, updated.nome_topo, updated.foto_url, fbVerif, dnsTxt,
             updated.atividade_principal || '', updated.data_abertura || '', updated.descricao || '', id).run();

      try {
        if (existing.repo_name) {
          if (existing.domain === 'workers.dev') {
            const workersSubdomain = env.WORKERS_SUBDOMAIN || 'viraloficial9';
            await cfWorkerDeploy(existing.repo_name, { ...updated, fb_verification: fbVerif }, env.CLOUDFLARE_ACCOUNT_ID, env.CLOUDFLARE_API_TOKEN, workersSubdomain);
          } else {
            await saveSiteToKV(existing.repo_name, { ...updated, fb_verification: fbVerif }, env);
          }
        }
        await env.DB.prepare(`UPDATE sites SET status='live' WHERE id=?`).bind(id).run();
        return json({ id, status: 'live' });
      } catch (err) {
        console.error('Site update failed:', err.message);
        return json({ id, status: 'updating' });
      }
    }

    if (method === 'DELETE' && path.startsWith('/api/sites/')) {
      const id = path.split('/')[3];
      const site = user.role === 'admin'
        ? await env.DB.prepare('SELECT repo_name, domain FROM sites WHERE id=?').bind(id).first()
        : await env.DB.prepare('SELECT repo_name, domain FROM sites WHERE id=? AND user_id=?').bind(id, user.user_id).first();
      if (site?.repo_name) {
        if (site.domain === 'pages.dev') {
          try { await deleteCFPagesSite(site.repo_name, env.CLOUDFLARE_ACCOUNT_ID, env.CLOUDFLARE_API_TOKEN); } catch {}
        } else if (site.domain === 'workers.dev') {
          try { await cfWorkerDelete(site.repo_name, env.CLOUDFLARE_ACCOUNT_ID, env.CLOUDFLARE_API_TOKEN); } catch {}
        } else {
          await deleteSiteFromKV(site.repo_name, env);
        }
      }
      await env.DB.prepare('DELETE FROM sites WHERE id=?').bind(id).run();
      return json({ deleted: true });
    }
  }

  // ── Emails temporários ───────────────────────────────────────
  if (path.startsWith('/api/emails')) {
    if (!user) return json({ error: 'Não autenticado' }, 401);

    // GET /api/emails — lista endereços do usuário com contagem
    if (method === 'GET' && path === '/api/emails') {
      const { results: addrs } = await env.DB.prepare(
        'SELECT id, address, domain, created_at FROM temp_email_addresses WHERE user_id=? ORDER BY created_at DESC'
      ).bind(user.user_id).all();

      const withCounts = await Promise.all(addrs.map(async a => {
        const cnt = await env.DB.prepare('SELECT COUNT(*) as c FROM received_emails WHERE address=?').bind(a.address).first();
        return { ...a, unread_count: cnt?.c || 0 };
      }));
      return json(withCounts);
    }

    // POST /api/emails/generate — gera novo endereço
    if (method === 'POST' && path === '/api/emails/generate') {
      const body = await request.json().catch(() => ({}));
      const allowed = getAllowedDomains(env).filter(d => !d.includes('pages.dev') && !d.includes('workers.dev'));
      const emailDomain = (body.domain && allowed.includes(body.domain))
        ? body.domain
        : (env.EMAIL_DOMAIN || allowed[0] || 'metaparceirosbr.com.br');

      let prefix = (body.prefix || '').toLowerCase().replace(/[^a-z0-9._-]/g, '').substring(0, 30).replace(/^[.-]+|[.-]+$/g, '');
      if (!prefix) prefix = randomEmailPrefix();

      const address = `${prefix}@${emailDomain}`;
      const existing = await env.DB.prepare('SELECT id FROM temp_email_addresses WHERE address=?').bind(address).first();
      if (existing) return json({ error: 'Esse endereço já está em uso' }, 409);

      const id = randomId();
      const now = new Date().toISOString();
      await env.DB.prepare(
        'INSERT INTO temp_email_addresses (id, user_id, address, domain, created_at) VALUES (?,?,?,?,?)'
      ).bind(id, user.user_id, address, emailDomain, now).run();
      return json({ id, address, domain: emailDomain, created_at: now, unread_count: 0 }, 201);
    }

    // GET /api/emails/inbox/:address — emails recebidos no endereço
    if (method === 'GET' && path.startsWith('/api/emails/inbox/')) {
      const address = decodeURIComponent(path.split('/api/emails/inbox/')[1]);
      const own = await env.DB.prepare('SELECT id FROM temp_email_addresses WHERE address=? AND user_id=?').bind(address, user.user_id).first();
      if (!own) return json({ error: 'Endereço não encontrado' }, 404);
      const { results } = await env.DB.prepare(
        'SELECT id, address, from_addr, subject, body_text, received_at FROM received_emails WHERE address=? ORDER BY received_at DESC LIMIT 100'
      ).bind(address).all();
      return json(results);
    }

    // DELETE /api/emails/address/:address — deleta endereço + todos emails
    if (method === 'DELETE' && path.startsWith('/api/emails/address/')) {
      const address = decodeURIComponent(path.split('/api/emails/address/')[1]);
      const own = user.role === 'admin'
        ? await env.DB.prepare('SELECT id FROM temp_email_addresses WHERE address=?').bind(address).first()
        : await env.DB.prepare('SELECT id FROM temp_email_addresses WHERE address=? AND user_id=?').bind(address, user.user_id).first();
      if (!own) return json({ error: 'Endereço não encontrado' }, 404);
      await env.DB.prepare('DELETE FROM received_emails WHERE address=?').bind(address).run();
      await env.DB.prepare('DELETE FROM temp_email_addresses WHERE address=?').bind(address).run();
      return json({ deleted: true });
    }

    // DELETE /api/emails/message/:id — deleta email específico
    if (method === 'DELETE' && path.startsWith('/api/emails/message/')) {
      const emailId = path.split('/api/emails/message/')[1];
      const msg = await env.DB.prepare('SELECT re.id, re.address FROM received_emails re JOIN temp_email_addresses ta ON ta.address=re.address WHERE re.id=? AND ta.user_id=?').bind(emailId, user.user_id).first();
      if (!msg && user.role !== 'admin') return json({ error: 'Email não encontrado' }, 404);
      await env.DB.prepare('DELETE FROM received_emails WHERE id=?').bind(emailId).run();
      return json({ deleted: true });
    }
  }

  return json({ error: 'Not found' }, 404);
}
