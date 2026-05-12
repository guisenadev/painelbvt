import { generateHTML } from './template.js';
import { generateCnpjPdf } from './pdf-generator.js';

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
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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

async function safeJson(response) {
  const text = await response.text();
  console.log(`[HTTP ${response.status}] body: ${text.substring(0, 500)}`);
  if (!text || !text.trim()) throw new Error(`HTTP ${response.status} — resposta vazia`);
  try { return JSON.parse(text); }
  catch { throw new Error(`HTTP ${response.status} — não é JSON: ${text.substring(0, 200)}`); }
}

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

// ── Cloudflare Pages ────────────────────────────────────────────
function toBase64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function cfPagesCreateProject(projectName, accountId, apiToken) {
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: projectName, production_branch: 'main' }),
      signal: AbortSignal.timeout(25000),
    }
  );
  const data = await safeJson(r);
  if (!data.success) throw new Error('CF Pages create project failed: ' + JSON.stringify(data.errors));
  return data.result;
}

async function cfPagesDeploy(projectName, html, accountId, apiToken, fbVerification = '') {
  const encoder = new TextEncoder();

  const htmlBytes = encoder.encode(html);
  const hashBuffer = await crypto.subtle.digest('SHA-256', htmlBytes);
  const hash = Array.from(new Uint8Array(hashBuffer)).slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');

  let verifHash = null;
  let verifBytes = null;
  let redirectsHash = null;
  let redirectsBytes = null;
  if (fbVerification) {
    verifBytes = encoder.encode(fbVerification);
    const vBuf = await crypto.subtle.digest('SHA-256', verifBytes);
    verifHash = Array.from(new Uint8Array(vBuf)).slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');

    // _redirects: serve /{code}.html direto sem redirect 308 do CF Pages
    redirectsBytes = encoder.encode(`/${fbVerification}.html /${fbVerification} 200\n`);
    const rBuf = await crypto.subtle.digest('SHA-256', redirectsBytes);
    redirectsHash = Array.from(new Uint8Array(rBuf)).slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const tokenR = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/upload-token`,
    { headers: { Authorization: `Bearer ${apiToken}` }, signal: AbortSignal.timeout(25000) }
  );
  const tokenData = await safeJson(tokenR);
  if (!tokenData.success) throw new Error('upload-token failed: ' + JSON.stringify(tokenData.errors));
  const jwt = tokenData.result.jwt;

  const allHashes = [hash, ...(verifHash ? [verifHash, redirectsHash] : [])];
  const missingR = await fetch('https://api.cloudflare.com/client/v4/pages/assets/check-missing', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ hashes: allHashes }),
    signal: AbortSignal.timeout(25000),
  });
  const missingData = await safeJson(missingR);
  if (!missingData.success) throw new Error('check-missing failed: ' + JSON.stringify(missingData.errors));
  const missing = missingData.result || [];

  const filesToUpload = [];
  if (missing.includes(hash)) filesToUpload.push({ key: hash, value: toBase64(htmlBytes), metadata: { contentType: 'text/html; charset=utf-8' }, base64: true });
  if (verifHash && missing.includes(verifHash)) filesToUpload.push({ key: verifHash, value: toBase64(verifBytes), metadata: { contentType: 'text/html; charset=utf-8' }, base64: true });
  if (redirectsHash && missing.includes(redirectsHash)) filesToUpload.push({ key: redirectsHash, value: toBase64(redirectsBytes), metadata: { contentType: 'text/plain' }, base64: true });

  if (filesToUpload.length > 0) {
    const uploadR = await fetch('https://api.cloudflare.com/client/v4/pages/assets/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(filesToUpload),
      signal: AbortSignal.timeout(25000),
    });
    const uploadData = await safeJson(uploadR);
    if (!uploadData.success) throw new Error('upload failed: ' + JSON.stringify(uploadData.errors));
  }

  await fetch('https://api.cloudflare.com/client/v4/pages/assets/upsert-hashes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ hashes: allHashes }),
    signal: AbortSignal.timeout(25000),
  });

  const boundary = '----CFDeploy' + Math.random().toString(36).substring(2);
  const enc = new TextEncoder();
  const manifest = { '/index.html': hash };
  if (verifHash) {
    manifest[`/${fbVerification}.html`] = verifHash;
    manifest['/_redirects'] = redirectsHash;
  }
  const manifestJson = JSON.stringify(manifest);
  const mpBody = enc.encode(
    `--${boundary}\r\nContent-Disposition: form-data; name="manifest"\r\n\r\n${manifestJson}\r\n--${boundary}--\r\n`
  );
  const deployR = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}/deployments`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body: mpBody,
      signal: AbortSignal.timeout(25000),
    }
  );
  const deployData = await safeJson(deployR);
  if (!deployData.success) throw new Error('deploy failed: ' + JSON.stringify(deployData.errors));
  console.log(`CF Pages deployed: ${projectName}`);
  return deployData.result;
}

async function createCFPagesSite(projectName, html, accountId, apiToken, fbVerification = '') {
  await cfPagesCreateProject(projectName, accountId, apiToken);
  await cfPagesDeploy(projectName, html, accountId, apiToken, fbVerification);
  return { siteId: projectName, siteUrl: `https://${projectName}.pages.dev` };
}

async function updateCFPagesSite(projectName, html, accountId, apiToken, fbVerification = '') {
  await cfPagesDeploy(projectName, html, accountId, apiToken, fbVerification);
}

async function deleteCFPagesSite(projectName, accountId, apiToken) {
  const r = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${apiToken}` }, signal: AbortSignal.timeout(25000) }
  );
  console.log(`CF Pages delete ${projectName}: HTTP ${r.status}`);
}

// ── Cron ────────────────────────────────────────────────────────
async function processPending(env) {
  console.log('Cron started...');

  const { results } = await env.DB.prepare(
    `SELECT * FROM sites WHERE status IN ('processing','updating') ORDER BY created_at ASC LIMIT 3`
  ).all();

  for (const site of results) {
    try {
      const html = generateHTML(site);
      const accountId = env.CLOUDFLARE_ACCOUNT_ID;
      const apiToken = env.CLOUDFLARE_API_TOKEN;

      if (site.status === 'processing') {
        const suffix = site.id.replace(/-/g, '').substring(0, 6);
        const projectName = (toSiteName(site.razao_social) + '-' + suffix).substring(0, 63);
        const { siteId, siteUrl } = await createCFPagesSite(projectName, html, accountId, apiToken, site.fb_verification || '');
        await env.DB.prepare(
          `UPDATE sites SET repo_name=?, repo_url=?, site_url=?, status='live' WHERE id=?`
        ).bind(siteId, siteUrl, siteUrl, site.id).run();
        console.log('Site live:', siteUrl);
      } else if (site.status === 'updating' && site.repo_name) {
        await updateCFPagesSite(site.repo_name, html, accountId, apiToken, site.fb_verification || '');
        await env.DB.prepare(`UPDATE sites SET status='live' WHERE id=?`).bind(site.id).run();
      } else {
        await env.DB.prepare(`UPDATE sites SET status='error' WHERE id=?`).bind(site.id).run();
      }
    } catch (err) {
      console.error(`Erro ao processar ${site.id}:`, err.message);
      await env.DB.prepare(`UPDATE sites SET status='error' WHERE id=?`).bind(site.id).run();
    }
  }

  const now = new Date().toISOString();
  await env.DB.prepare(`DELETE FROM sessions WHERE expires_at < ?`).bind(now).run();
  console.log('Cron finished');
}

export default {
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

  if (method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

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
    const { username, password, nome } = await request.json();
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
      `INSERT INTO users (id, username, password_hash, salt, role, balance, nome, email_addr, telefone) VALUES (?,?,?,?,?,?,?,?,?)`
    ).bind(userId, username, hash, salt, 'client', 0, nome || '', '', '').run();
    const token = randomId();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await env.DB.prepare(`INSERT INTO sessions (token, user_id, expires_at) VALUES (?,?,?)`).bind(token, userId, expires).run();
    return json({ token, username, role: 'client', nome: nome || '', email: '', telefone: '' });
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
    if (!user || user.role !== 'admin') return json({ error: 'Acesso negado' }, 403);

    if (method === 'GET' && path === '/api/admin/users') {
      const { results } = await env.DB.prepare(
        `SELECT id, username, nome, email_addr, telefone, role, created_at FROM users ORDER BY created_at DESC`
      ).all();
      return json(results);
    }

    if (method === 'PATCH' && path.startsWith('/api/admin/users/') && path.endsWith('/role')) {
      const userId = path.split('/')[4];
      const { role } = await request.json();
      if (!['client', 'admin'].includes(role)) return json({ error: 'Role inválido' }, 400);
      await env.DB.prepare('UPDATE users SET role=? WHERE id=?').bind(role, userId).run();
      return json({ ok: true });
    }

    if (method === 'DELETE' && path.startsWith('/api/admin/users/')) {
      const userId = path.split('/')[4];
      await env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(userId).run();
      await env.DB.prepare('DELETE FROM users WHERE id=?').bind(userId).run();
      return json({ deleted: true });
    }

    if (method === 'GET' && path === '/api/admin/stats') {
      const { results: users } = await env.DB.prepare('SELECT COUNT(*) as total FROM users').all();
      const { results: sites } = await env.DB.prepare("SELECT COUNT(*) as total FROM sites WHERE status='live'").all();
      return json({ users: users[0], sites: sites[0] });
    }
  }

  // ── Sites ────────────────────────────────────────────────────
  if (path.startsWith('/api/sites')) {
    if (!user) return json({ error: 'Não autenticado' }, 401);

    if (method === 'GET' && path === '/api/sites') {
      const { results } = await env.DB.prepare('SELECT * FROM sites WHERE user_id=? ORDER BY created_at DESC').bind(user.user_id).all();
      return json(results);
    }

    if (method === 'POST' && path === '/api/sites') {
      const body = await request.json();
      const { razao_social, cnpj } = body;
      if (!razao_social || !cnpj) return json({ error: 'razao_social e cnpj obrigatórios' }, 400);
      const siteId = randomId();
      const now = new Date().toISOString();
      await env.DB.prepare(
        `INSERT INTO sites (id,user_id,razao_social,cnpj,endereco,bairro,cidade,estado,cep,telefone,email,nome_topo,foto_url,fb_verification,dns_txt_verification,status,created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'processing',?)`
      ).bind(siteId, user.user_id, razao_social, cnpj, body.endereco||'', body.bairro||'', body.cidade||'',
             body.estado||'', body.cep||'', body.telefone||'', body.email||'',
             body.nome_topo||'', body.foto_url||'', parseFbVerification(body.fb_verification),
             parseDnsTxt(body.dns_txt_verification), now).run();
      ctx.waitUntil(processPending(env));
      return json({ siteId, status: 'processing' }, 202);
    }

    if (method === 'GET' && path.startsWith('/api/sites/') && path.endsWith('/pdf')) {
      const id = path.split('/')[3];
      const site = await env.DB.prepare('SELECT * FROM sites WHERE id=? AND user_id=?').bind(id, user.user_id).first();
      if (!site) return json({ error: 'Not found' }, 404);
      let cnpjApiData = null;
      try {
        const cleanCnpj = site.cnpj.replace(/\D/g, '');
        const r = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`);
        if (r.ok) cnpjApiData = await r.json();
      } catch {}
      const pdfBytes = await generateCnpjPdf(site, cnpjApiData);
      const slug = site.razao_social.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').substring(0, 40);
      return new Response(pdfBytes, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="comprovante-${slug}.pdf"`,
        },
      });
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
      const existing = await env.DB.prepare('SELECT * FROM sites WHERE id=?').bind(id).first();
      if (!existing) return json({ error: 'Not found' }, 404);
      const updated = { ...existing, ...body };
      await env.DB.prepare(
        `UPDATE sites SET razao_social=?,cnpj=?,endereco=?,bairro=?,cidade=?,estado=?,
         cep=?,telefone=?,email=?,nome_topo=?,foto_url=?,fb_verification=?,dns_txt_verification=?,status='updating' WHERE id=?`
      ).bind(updated.razao_social, updated.cnpj, updated.endereco, updated.bairro,
             updated.cidade, updated.estado, updated.cep, updated.telefone,
             updated.email, updated.nome_topo, updated.foto_url, parseFbVerification(updated.fb_verification),
             parseDnsTxt(updated.dns_txt_verification), id).run();
      ctx.waitUntil(processPending(env));
      return json({ id, status: 'updating' });
    }

    if (method === 'DELETE' && path.startsWith('/api/sites/')) {
      const id = path.split('/')[3];
      const site = await env.DB.prepare('SELECT repo_name FROM sites WHERE id=?').bind(id).first();
      if (site?.repo_name) {
        await deleteCFPagesSite(site.repo_name, env.CLOUDFLARE_ACCOUNT_ID, env.CLOUDFLARE_API_TOKEN);
      }
      await env.DB.prepare('DELETE FROM sites WHERE id=?').bind(id).run();
      return json({ deleted: true });
    }
  }

  return json({ error: 'Not found' }, 404);
}
