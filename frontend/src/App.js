import React, { useState, useEffect, useCallback, useRef } from 'react';

const API = 'https://site-factory-worker.viraloficial9.workers.dev/api';

const MAINTENANCE = false;

// ── Palette ──────────────────────────────────────────────────────
const P = {
  bg:        '#0d1117',
  surface:   '#161b22',
  surface2:  '#21262d',
  border:    '#30363d',
  accent:    '#58a6ff',
  accentDim: '#1f3a5f',
  text:      '#e6edf3',
  textMuted: '#8b949e',
  textDim:   '#484f58',
  green:     '#3fb950',
  greenDim:  '#0f2a14',
  red:       '#f85149',
  redDim:    '#2a0f0f',
  yellow:    '#d29922',
  yellowDim: '#2a1f00',
};

// ── API hook ─────────────────────────────────────────────────────
function useApi() {
  const getToken = () => localStorage.getItem('bvt_token');
  return useCallback(async (path, method = 'GET', body) => {
    const token = getToken();
    const r = await fetch(`${API}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return r.json();
  }, []);
}

const saveAuth = (data) => {
  localStorage.setItem('bvt_token', data.token);
  localStorage.setItem('bvt_user', data.username);
  localStorage.setItem('bvt_role', data.role);
  localStorage.setItem('bvt_balance', String(data.balance || 0));
  localStorage.setItem('bvt_nome', data.nome || '');
  localStorage.setItem('bvt_email', data.email || '');
  localStorage.setItem('bvt_telefone', data.telefone || '');
};
const clearAuth = () => {
  ['bvt_token','bvt_user','bvt_role','bvt_balance','bvt_nome','bvt_email','bvt_telefone'].forEach(k => localStorage.removeItem(k));
};

// ── Maintenance ──────────────────────────────────────────────────
function MaintenancePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif', padding: 24 }}>
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 16, padding: '48px 40px', maxWidth: 420, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
        <div style={{ color: '#e6edf3', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Sistema em Atualização</div>
        <div style={{ color: '#8b949e', fontSize: 14, lineHeight: 1.6 }}>
          Estamos realizando melhorias no painel.<br />
          Voltamos em breve!
        </div>
        <div style={{ marginTop: 28, padding: '10px 20px', background: '#1f3a5f', border: '1px solid #58a6ff', borderRadius: 8, color: '#58a6ff', fontSize: 12, fontFamily: 'monospace' }}>
          Painel BVT — em manutenção
        </div>
      </div>
    </div>
  );
}

// ── SVG Logo ─────────────────────────────────────────────────────
function BvtLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* head */}
      <circle cx="20" cy="8" r="4.5" stroke={P.accent} strokeWidth="2"/>
      {/* body */}
      <line x1="20" y1="13" x2="20" y2="25" stroke={P.accent} strokeWidth="2"/>
      {/* left arm → keyboard */}
      <line x1="20" y1="17" x2="11" y2="22" stroke={P.accent} strokeWidth="2"/>
      <line x1="11" y1="22" x2="9" y2="20" stroke={P.accent} strokeWidth="1.5"/>
      {/* right arm → keyboard */}
      <line x1="20" y1="17" x2="29" y2="22" stroke={P.accent} strokeWidth="2"/>
      <line x1="29" y1="22" x2="31" y2="20" stroke={P.accent} strokeWidth="1.5"/>
      {/* legs */}
      <line x1="20" y1="25" x2="14" y2="36" stroke={P.accent} strokeWidth="2"/>
      <line x1="20" y1="25" x2="26" y2="36" stroke={P.accent} strokeWidth="2"/>
      {/* code brackets on chest */}
      <text x="20" y="22" textAnchor="middle" fontSize="5" fill={P.accent} fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>
    </svg>
  );
}

// ── Home ──────────────────────────────────────────────────────────
function TutorialStep({ n, title, children }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
      <div style={{ width: 32, height: 32, borderRadius: 6, background: P.accentDim, border: `1px solid ${P.accent}`, color: P.accent, fontFamily: 'monospace', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{n}</div>
      <div>
        <div style={{ color: P.text, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{title}</div>
        <div style={{ color: P.textMuted, fontSize: 13, lineHeight: 1.75 }}>{children}</div>
      </div>
    </div>
  );
}

function TipBox({ children }) {
  return (
    <div style={{ background: P.accentDim, border: `1px solid ${P.accent}`, borderRadius: 6, padding: '12px 16px', color: P.accent, fontSize: 12, fontFamily: 'monospace', lineHeight: 1.7, marginTop: 10 }}>
      💡 {children}
    </div>
  );
}

function HomePage({ onStart }) {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 32px 60px', boxSizing: 'border-box' }}>

      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', padding: '52px 0 44px', borderBottom: `1px solid ${P.border}` }}>
        <BvtLogo size={44} />
        <h1 style={{ color: P.text, fontSize: 28, fontWeight: 800, fontFamily: 'monospace', margin: '16px 0 10px', letterSpacing: '-1px', lineHeight: 1.2 }}>
          Painel BVT
        </h1>
        <p style={{ color: P.textMuted, fontSize: 14, margin: '0 auto 28px', maxWidth: 480, lineHeight: 1.7 }}>
          Ferramenta gratuita para criar sites de verificação de Business Manager do Facebook. Leia o tutorial abaixo antes de começar.
        </p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['✅ 100% gratuito', '✅ Site no ar em 1 min', '✅ Layout único por CNPJ'].map(t => (
            <span key={t} style={{ color: P.textMuted, fontSize: 12, fontFamily: 'monospace' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── TUTORIAL ── */}
      <div style={{ padding: '44px 0' }}>
        <div style={{ color: P.accent, fontFamily: 'monospace', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24 }}>// tutorial — como verificar sua BM</div>

        <TutorialStep n="01" title="Crie uma conta e faça login">
          Clique em "Entrar" no topo da página, crie sua conta com usuário e senha. Depois de entrar, você vai para o painel com o menu lateral.
        </TutorialStep>

        <TutorialStep n="02" title={'Vá em "meus sites" e clique em "+ criar site"'}>
          No menu esquerdo, clique em <strong style={{ color: P.text }}>meus sites</strong>. Depois clique no botão <strong style={{ color: P.text }}>+ criar site</strong> no canto superior direito.
        </TutorialStep>

        <TutorialStep n="03" title="Digite o CNPJ">
          Informe o CNPJ da empresa que você quer verificar. O sistema preenche automaticamente razão social, endereço, cidade e estado direto da Receita Federal — você não precisa digitar nada além do CNPJ.
          <TipBox>Use um CNPJ ativo. CNPJs inativos ou inexistentes não passam pela verificação do Meta.</TipBox>
        </TutorialStep>

        <TutorialStep n="04" title="Nome no site e foto (campo importante!)">
          O campo <strong style={{ color: P.text }}>"nome no site"</strong> e <strong style={{ color: P.text }}>"url da foto"</strong> têm um propósito específico na estratégia de verificação:
          <br /><br />
          Quando você vai verificar a BM no Meta, ele pede um número de WhatsApp. <strong style={{ color: P.text }}>Use um número diferente do número principal da BM</strong> — um número "limpo", sem histórico de bloqueio.
          <br /><br />
          Para isso:
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>No campo <strong style={{ color: P.text }}>nome no site</strong>, coloque o nome que vai aparecer como empresa/perfil no topo do site — pode ser o nome da empresa ou da marca.</li>
            <li>No campo <strong style={{ color: P.text }}>url da foto</strong>, coloque o link de uma foto de perfil que vai aparecer no site. Essa foto deve ser a mesma que você vai usar no WhatsApp que vai conectar ao Meta.</li>
          </ul>
          <TipBox>A ideia: o verificador do Meta vai ver o site e o número de WA com a mesma identidade visual (foto + nome), o que passa mais credibilidade e aumenta a chance de aprovação.</TipBox>
        </TutorialStep>

        <TutorialStep n="05" title="Cole o código de verificação de domínio do Facebook">
          No campo <strong style={{ color: P.text }}>facebook domain verification</strong>, cole o código ou a metatag que o Meta fornece. Para pegar esse código:
          <ol style={{ paddingLeft: 20, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <li>Acesse o <strong style={{ color: P.text }}>Meta Business Suite</strong></li>
            <li>Vá em <strong style={{ color: P.text }}>Configurações → Marca e presença → Domínios</strong></li>
            <li>Clique em <strong style={{ color: P.text }}>Adicionar domínio</strong></li>
            <li>O Meta vai gerar uma metatag — copie e cole aqui</li>
          </ol>
          <TipBox>Você pode criar o site primeiro e adicionar o código depois clicando em ✎ editar. O site fica no ar normalmente sem o código — você só precisa dele na hora de verificar no Meta.</TipBox>
        </TutorialStep>

        <TutorialStep n="06" title={'Clique em "iniciar verificação" e aguarde'}>
          Após enviar o formulário, o site é publicado automaticamente em até 1 minuto em um subdomínio <strong style={{ color: P.text }}>*.pages.dev</strong> com HTTPS. O status aparece como <span style={{ color: P.yellow, fontFamily: 'monospace', fontSize: 11 }}>criando...</span> e muda para <span style={{ color: P.green, fontFamily: 'monospace', fontSize: 11 }}>live</span> quando estiver no ar.
        </TutorialStep>

        <TutorialStep n="07" title="Use o domínio gerado no Meta">
          Quando o site estiver <span style={{ color: P.green, fontFamily: 'monospace', fontSize: 11 }}>live</span>, copie a URL (ex: <span style={{ color: P.accent, fontFamily: 'monospace', fontSize: 12 }}>empresa-tal.pages.dev</span>) e cole no campo de domínio do Meta Business Suite para concluir a verificação.
          <TipBox>Cada site gerado tem um layout visual único baseado no CNPJ — cores, fontes e estrutura diferentes — para evitar que o Meta detecte um padrão entre os sites.</TipBox>
        </TutorialStep>

        {/* Disparos */}
        <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 8, padding: '28px 28px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 22 }}>📲</span>
            <div>
              <div style={{ color: P.text, fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>Agora que seu BM está verificado — o que fazer com ele?</div>
              <div style={{ color: P.textMuted, fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>Disparar mensagens em massa pelo WhatsApp oficial da sua empresa</div>
            </div>
          </div>
          <div style={{ color: P.textMuted, fontSize: 12, fontFamily: 'monospace', lineHeight: 1.8, marginBottom: 16 }}>
            Com o BM verificado e o limite subindo, você pode usar a <strong style={{ color: P.text }}>API oficial do WhatsApp</strong> para mandar mensagens em massa — imagens, botões, links — direto para sua lista de contatos, com <strong style={{ color: P.text }}>98% de taxa de abertura</strong> e sem risco de banimento permanente, porque cada mensagem é autorizada pela própria Meta.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { icon: '✅', label: 'API oficial Meta', sub: 'sem risco de banimento' },
              { icon: '⚡', label: 'Começa no mesmo dia', sub: 'sem burocracia' },
              { icon: '💸', label: 'A partir de R$0,20/msg', sub: 'sem mínimo de envios' },
              { icon: '📊', label: 'Relatório em tempo real', sub: 'entregas, aberturas e cliques' },
            ].map(({ icon, label, sub }) => (
              <div key={label} style={{ background: P.surface2, border: `1px solid ${P.border}`, borderRadius: 6, padding: '12px 14px' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                <div style={{ color: P.text, fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{label}</div>
                <div style={{ color: P.textMuted, fontSize: 10, fontFamily: 'monospace', marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{ background: P.accentDim, border: `1px solid ${P.accent}`, borderRadius: 6, padding: '12px 16px', marginBottom: 18, fontFamily: 'monospace', fontSize: 11 }}>
            <span style={{ color: P.accent, fontWeight: 700 }}>Como funciona: </span>
            <span style={{ color: P.textMuted }}>Conecta o BM verificado → aprova um template de mensagem → importa sua lista → dispara com 1 clique. Aceita Cloud API e WhatsApp coexistência.</span>
          </div>
          <a href="https://bevits.com/pt-br/whatsapp-campaign/" target="_blank" rel="noreferrer"
            style={{ display: 'inline-block', background: '#25D366', color: '#fff', borderRadius: 6, padding: '10px 22px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textDecoration: 'none' }}>
            Fazer disparos com API oficial →
          </a>
        </div>

        {/* Discord */}
        <div style={{ background: '#5865F2' + '22', border: '1px solid #5865F2', borderRadius: 8, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ color: P.text, fontWeight: 700, fontFamily: 'monospace', fontSize: 13, marginBottom: 4 }}>
              💬 Entre na comunidade
            </div>
            <div style={{ color: P.textMuted, fontSize: 12, fontFamily: 'monospace' }}>
              Tire dúvidas, compartilhe resultados e fique por dentro das novidades no nosso Discord.
            </div>
          </div>
          <a href="https://discord.gg/mkJE89mBUj" target="_blank" rel="noreferrer" style={{ background: '#5865F2', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 22px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Entrar no Discord →
          </a>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8 }}>
          <Btn primary onClick={onStart} style={{ fontSize: 14, padding: '12px 32px' }}>
            Entrar no painel →
          </Btn>
        </div>
      </div>

    </div>
  );
}

// ── Meus Sites ───────────────────────────────────────────────────
const STATUS_CFG = {
  live:       { label: 'live',         color: P.green,  bg: P.greenDim,  border: P.green },
  processing: { label: 'criando...',   color: P.yellow, bg: P.yellowDim, border: P.yellow },
  updating:   { label: 'atualizando', color: P.accent, bg: P.accentDim, border: P.accent },
  error:      { label: 'erro',         color: P.red,    bg: P.redDim,    border: P.red },
};

function VerificarPage({ api }) {
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ razao_social:'', cnpj:'', endereco:'', bairro:'', cidade:'', estado:'', cep:'', telefone:'', email:'', nome_topo:'', foto_url:'', fb_verification:'', dns_txt_verification:'' });
  const [error, setError] = useState('');
  const [cnpjLoading, setCnpjLoading] = useState(false);
  const [sites, setSites] = useState([]);
  const sitesRef = useRef(null);

  const loadSites = useCallback(async () => {
    try { const d = await api('/sites'); if (Array.isArray(d)) setSites(d); } catch {}
  }, [api]);

  useEffect(() => {
    loadSites();
    sitesRef.current = setInterval(loadSites, 6000);
    return () => clearInterval(sitesRef.current);
  }, [loadSites]);

  const fetchCNPJ = async (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length !== 14) return;
    setCnpjLoading(true);
    try {
      const r = await fetch(`https://publica.cnpj.ws/cnpj/${digits}`);
      if (!r.ok) return;
      const d = await r.json();
      const end = d.estabelecimento;
      const logradouro = end.tipo_logradouro
        ? `${end.tipo_logradouro} ${end.logradouro}${end.numero ? ', ' + end.numero : ''}`
        : `${end.logradouro}${end.numero ? ', ' + end.numero : ''}`;
      setForm(p => ({
        ...p, razao_social: d.razao_social || p.razao_social, cnpj: raw,
        endereco: logradouro || p.endereco, bairro: end.bairro || p.bairro,
        cidade: end.cidade?.nome || p.cidade, estado: end.estado?.sigla || p.estado,
        cep: end.cep ? end.cep.replace(/(\d{5})(\d{3})/, '$1-$2') : p.cep,
      }));
    } catch {}
    finally { setCnpjLoading(false); }
  };

  const resetForm = () => setForm({ razao_social:'', cnpj:'', endereco:'', bairro:'', cidade:'', estado:'', cep:'', telefone:'', email:'', nome_topo:'', foto_url:'', fb_verification:'', dns_txt_verification:'' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true); setError('');
    try {
      if (editingId) {
        const d = await api(`/sites/${editingId}`, 'PATCH', form);
        if (d.error) { setError(d.error); setSending(false); return; }
        setEditingId(null); setShowForm(false); resetForm(); loadSites();
      } else {
        const d = await api('/sites', 'POST', form);
        if (d.error) { setError(d.error); setSending(false); return; }
        setShowForm(false); resetForm(); loadSites();
      }
    } catch {
      setError('Erro ao processar. Tente novamente.');
    }
    setSending(false);
  };

  const handleEdit = (site) => {
    setEditingId(site.id);
    setForm({ razao_social: site.razao_social||'', cnpj: site.cnpj||'', endereco: site.endereco||'', bairro: site.bairro||'', cidade: site.cidade||'', estado: site.estado||'', cep: site.cep||'', telefone: site.telefone||'', email: site.email||'', nome_topo: site.nome_topo||'', foto_url: site.foto_url||'', fb_verification: site.fb_verification||'', dns_txt_verification: site.dns_txt_verification||'' });
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deletar "${name}"?`)) return;
    await api(`/sites/${id}`, 'DELETE');
    loadSites();
  };

  return (
    <PageWrap>

      {/* Header com botão criar site */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ color: P.text, fontSize: 16, fontWeight: 700, fontFamily: 'monospace', margin: 0 }}>meus sites</h1>
          <div style={{ color: P.textMuted, fontSize: 11, fontFamily: 'monospace', marginTop: 3 }}>
            {sites.length} site{sites.length !== 1 ? 's' : ''} criado{sites.length !== 1 ? 's' : ''}
          </div>
        </div>
        <Btn primary onClick={() => { setShowForm(p => !p); setEditingId(null); setError(''); if (showForm) setForm({ razao_social:'', cnpj:'', endereco:'', bairro:'', cidade:'', estado:'', cep:'', telefone:'', email:'', nome_topo:'', foto_url:'', fb_verification:'', dns_txt_verification:'' }); }}>
          {showForm ? '✕ cancelar' : '+ criar site'}
        </Btn>
      </div>

      {/* Formulário (colapsável) */}
      {showForm && (
        <Card style={{ marginBottom: 20 }}>
          {editingId && (
            <div style={{ background: P.accentDim, border: `1px solid ${P.accent}`, borderRadius: 4, padding: '8px 12px', color: P.accent, fontSize: 12, fontFamily: 'monospace', marginBottom: 14 }}>
              // editando site existente
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <Field label={cnpjLoading ? 'buscando dados...' : 'cnpj *'} value={form.cnpj}
              onChange={v => { f('cnpj')(v); if (v.replace(/\D/g,'').length === 14) fetchCNPJ(v); }}
              placeholder="00.000.000/0001-00" />
            <div style={{ color: P.textDim, fontSize: 11, fontFamily: 'monospace', marginTop: -8, marginBottom: 14 }}>// preenche automaticamente com dados da receita federal</div>

            <Divider />
            <Grid2>
              <Field label="razão social *" value={form.razao_social} onChange={f('razao_social')} required />
              <Field label="nome no site" value={form.nome_topo} onChange={f('nome_topo')} placeholder="Ex: Sávio Soluções" />
              <Field label="endereço" value={form.endereco} onChange={f('endereco')} />
              <Field label="bairro" value={form.bairro} onChange={f('bairro')} />
              <Field label="cidade" value={form.cidade} onChange={f('cidade')} />
              <Field label="estado" value={form.estado} onChange={f('estado')} maxLength={2} placeholder="SP" />
              <Field label="telefone" value={form.telefone} onChange={f('telefone')} placeholder="11999999999" />
              <Field label="e-mail" type="email" value={form.email} onChange={f('email')} />
            </Grid2>

            <Divider />
            <div style={{ marginBottom: 6, fontSize: 11, color: P.textMuted, fontFamily: 'monospace' }}>// verificação de domínio do facebook</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ flex: 1 }}>
                <Field label="código de verificação" value={form.fb_verification} onChange={f('fb_verification')} placeholder="Cole o código ou a metatag completa" />
              </div>
              <div style={{ paddingTop: 22 }}>
                <input type="file" accept=".html" id="fb-html-upload" style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const code = file.name.replace(/\.html$/i, '');
                    f('fb_verification')(code);
                    e.target.value = '';
                  }}
                />
                <label htmlFor="fb-html-upload" style={{ display: 'inline-block', cursor: 'pointer', background: P.surface2, border: `1px solid ${P.border}`, borderRadius: 4, padding: '7px 12px', fontSize: 12, color: P.textMuted, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  + subir arquivo .html
                </label>
              </div>
            </div>
            <div style={{ color: P.textDim, fontSize: 11, fontFamily: 'monospace', marginBottom: 14 }}>// cole o código manualmente ou suba o arquivo .html baixado do Facebook — metatag + arquivo html serão gerados automaticamente</div>
            <Field label="url da foto (opcional)" value={form.foto_url} onChange={f('foto_url')} placeholder="https://i.postimg.cc/..." />
            {form.foto_url && /postimg\.cc\/[^/]+$/.test(form.foto_url) && !/^https?:\/\/i\.postimg\.cc/.test(form.foto_url) && (
              <div style={{ background: P.yellowDim, border: `1px solid ${P.yellow}`, color: P.yellow, borderRadius: 4, padding: '8px 12px', fontSize: 12, fontFamily: 'monospace', marginTop: -8, marginBottom: 14 }}>
                ⚠ essa é a página da galeria, não a imagem direta. No postimg, clique com botão direito na foto → "copiar endereço da imagem" para pegar a URL que começa com i.postimg.cc/...
              </div>
            )}

            {error && <ErrBox>{error}</ErrBox>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${P.border}` }}>
              <Btn type="submit" primary disabled={sending}>
                {sending ? 'processando...' : editingId ? 'salvar alterações →' : 'iniciar verificação →'}
              </Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Cards dos sites */}
      {sites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: P.textDim, fontFamily: 'monospace', fontSize: 13 }}>
          // nenhum site criado ainda — clique em "+ criar site" para começar
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {sites.map(s => {
            const st = STATUS_CFG[s.status] || STATUS_CFG.error;
            return (
              <div key={s.id} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}`, borderRadius: 3, fontSize: 10, fontFamily: 'monospace', padding: '2px 7px' }}>
                    {st.label}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={{ background: 'transparent', border: 'none', color: P.textMuted, cursor: 'pointer', fontSize: 12, padding: '0 4px' }} title="editar" onClick={() => handleEdit(s)}>✎</button>
                    <button style={{ background: 'transparent', border: 'none', color: P.textDim, cursor: 'pointer', fontSize: 12, padding: '0 4px' }} title="deletar" onClick={() => handleDelete(s.id, s.razao_social)}>✕</button>
                  </div>
                </div>
<div style={{ color: P.text, fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{s.nome_topo || s.razao_social}</div>
                <div style={{ color: P.textMuted, fontSize: 11, fontFamily: 'monospace' }}>{s.cnpj}</div>
                {s.cidade && <div style={{ color: P.textDim, fontSize: 11 }}>{s.cidade} / {s.estado}</div>}
                {s.site_url ? (
                  <a href={s.site_url} target="_blank" rel="noreferrer" style={{ color: P.accent, fontSize: 11, fontFamily: 'monospace', textDecoration: 'none', marginTop: 2 }}>
                    {s.site_url.replace('https://', '')} ↗
                  </a>
                ) : (
                  <div style={{ color: P.textDim, fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>publicando em ~1 minuto...</div>
                )}
                {s.fb_verification && (
                  <div style={{ color: P.green, fontSize: 10, fontFamily: 'monospace' }}>✓ verificação configurada</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageWrap>
  );
}

// ── Minha Conta ───────────────────────────────────────────────────
function ContaPage({ api, auth, onUpdate }) {
  const [form, setForm] = useState({ nome: auth.nome || '', email: auth.email || '', telefone: auth.telefone || '' });
  const [pwd, setPwd] = useState({ current: '', new: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(''); setErr('');
    try {
      const body = { nome: form.nome, email: form.email, telefone: form.telefone };
      if (pwd.new) {
        if (pwd.new !== pwd.confirm) { setErr('senhas não coincidem'); setSaving(false); return; }
        if (pwd.new.length < 6) { setErr('senha precisa ter pelo menos 6 caracteres'); setSaving(false); return; }
        body.currentPassword = pwd.current;
        body.newPassword = pwd.new;
      }
      const d = await api('/auth/profile', 'PATCH', body);
      if (d.error) { setErr(d.error); }
      else {
        setMsg('perfil atualizado!');
        setPwd({ current: '', new: '', confirm: '' });
        onUpdate({ ...auth, nome: form.nome, email: form.email, telefone: form.telefone });
        setTimeout(() => setMsg(''), 3000);
      }
    } catch { setErr('erro ao salvar'); }
    finally { setSaving(false); }
  };

  return (
    <PageWrap>
      <PageHeader title="minha conta" sub="// gerencie seu perfil e senha" />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: P.textMuted, marginBottom: 20, borderBottom: `1px solid ${P.border}`, paddingBottom: 12 }}>
          $ user <span style={{ color: P.accent }}>{auth.username}</span> <span style={{ color: P.textDim }}>· {auth.role}</span>
        </div>
        <form onSubmit={saveProfile}>
          <SectionLabel>informações</SectionLabel>
          <Field label="nome completo" value={form.nome} onChange={v => setForm(p => ({...p, nome: v}))} placeholder="Seu nome" />
          <Field label="e-mail" type="email" value={form.email} onChange={v => setForm(p => ({...p, email: v}))} placeholder="seu@email.com" />
          <Field label="telefone / whatsapp" value={form.telefone} onChange={v => setForm(p => ({...p, telefone: v}))} placeholder="11999999999" />

          <Divider />
          <SectionLabel>alterar senha (opcional)</SectionLabel>
          <Field label="senha atual" type="password" value={pwd.current} onChange={v => setPwd(p => ({...p, current: v}))} placeholder="deixe em branco para não alterar" />
          <Grid2>
            <Field label="nova senha" type="password" value={pwd.new} onChange={v => setPwd(p => ({...p, new: v}))} placeholder="mínimo 6 caracteres" />
            <Field label="confirmar nova senha" type="password" value={pwd.confirm} onChange={v => setPwd(p => ({...p, confirm: v}))} />
          </Grid2>

          {err && <ErrBox>{err}</ErrBox>}
          {msg && <div style={{ background: P.greenDim, border: `1px solid ${P.green}`, color: P.green, borderRadius: 4, padding: '8px 12px', fontSize: 12, fontFamily: 'monospace', marginBottom: 12 }}>✓ {msg}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn type="submit" primary disabled={saving}>{saving ? 'salvando...' : 'salvar alterações'}</Btn>
          </div>
        </form>
      </Card>

    </PageWrap>
  );
}

// ── Admin ─────────────────────────────────────────────────────────
function AdminPage({ api }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', nome: '', email: '', telefone: '', role: 'client' });
  const [editUser, setEditUser] = useState(null);
  const [toast, setToast] = useState('');

  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(async () => {
    try {
      const [u, s] = await Promise.all([api('/admin/users'), api('/admin/stats')]);
      if (Array.isArray(u)) setUsers(u);
      if (s && s.users) setStats(s);
    } catch {}
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const d = await api('/admin/users', 'POST', newUser);
    if (d.error) { notify('Erro: ' + d.error, false); return; }
    notify(`✓ usuário ${d.username} criado`);
    setNewUser({ username: '', password: '', nome: '', email: '', telefone: '', role: 'client' });
    setShowCreate(false);
    load();
  };

  const handleDelete = async (userId, username) => {
    if (!window.confirm(`Deletar usuário "${username}"?`)) return;
    await api(`/admin/users/${userId}`, 'DELETE');
    notify(`${username} removido`);
    load();
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    const body = { nome: editUser.nome, email: editUser.email_addr, telefone: editUser.telefone, role: editUser.role };
    if (editUser._newPassword) body.password = editUser._newPassword;
    const d = await api(`/admin/users/${editUser.id}`, 'PATCH', body);
    if (d.ok) { notify('✓ usuário atualizado'); setEditUser(null); load(); }
    else notify('Erro ao salvar', false);
  };

  return (
    <PageWrap style={{ maxWidth: 1000 }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: toast.ok ? P.greenDim : P.redDim, border: `1px solid ${toast.ok ? P.green : P.red}`, color: toast.ok ? P.green : P.red, padding: '10px 16px', borderRadius: 4, fontFamily: 'monospace', fontSize: 12, zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}

      <PageHeader title="admin" sub={`// ${users.length} usuário${users.length !== 1 ? 's' : ''} cadastrado${users.length !== 1 ? 's' : ''}`}>
        <Btn primary onClick={() => setShowCreate(p => !p)}>{showCreate ? 'cancelar' : '+ novo usuário'}</Btn>
      </PageHeader>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { num: stats.users?.total || 0, lbl: 'usuários' },
            { num: stats.sites?.total || 0, lbl: 'sites live' },
          ].map((s, i) => (
            <div key={i} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 4, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ color: P.text, fontSize: 22, fontFamily: 'monospace', fontWeight: 700 }}>{s.num}</div>
              <div style={{ color: P.textMuted, fontSize: 10, fontFamily: 'monospace', marginTop: 3 }}>{s.lbl}</div>
            </div>
          ))}
        </div>
      )}

      {/* Criar usuário */}
      {showCreate && (
        <Card style={{ marginBottom: 16 }}>
          <SectionLabel>novo usuário</SectionLabel>
          <form onSubmit={handleCreate}>
            <Grid2>
              <Field label="username *" value={newUser.username} onChange={v => setNewUser(p => ({...p, username: v}))} required />
              <Field label="senha *" type="password" value={newUser.password} onChange={v => setNewUser(p => ({...p, password: v}))} required />
              <Field label="nome completo" value={newUser.nome} onChange={v => setNewUser(p => ({...p, nome: v}))} />
              <Field label="telefone" value={newUser.telefone} onChange={v => setNewUser(p => ({...p, telefone: v}))} placeholder="11999999999" />
              <Field label="e-mail" type="email" value={newUser.email} onChange={v => setNewUser(p => ({...p, email: v}))} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={S.lbl}>perfil</label>
                <select style={S.inp} value={newUser.role} onChange={e => setNewUser(p => ({...p, role: e.target.value}))}>
                  <option value="client">cliente</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </Grid2>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
              <Btn onClick={() => setShowCreate(false)}>cancelar</Btn>
              <Btn type="submit" primary>criar usuário</Btn>
            </div>
          </form>
        </Card>
      )}

      {/* Tabela de usuários */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${P.border}`, display: 'grid', gridTemplateColumns: '1fr 120px 160px 70px 180px', gap: 8 }}>
          {['cliente','telefone','e-mail','perfil','ações'].map(h => (
            <div key={h} style={{ color: P.textDim, fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
          ))}
        </div>
        {users.map((u, i) => (
          <div key={u.id} style={{ padding: '12px 16px', borderBottom: i < users.length - 1 ? `1px solid ${P.border}` : 'none', display: 'grid', gridTemplateColumns: '1fr 120px 160px 70px 180px', gap: 8, alignItems: 'center', background: i % 2 === 0 ? 'transparent' : P.surface2 }}>
            {/* cliente */}
            <div>
              <div style={{ color: P.text, fontSize: 13, fontWeight: 600 }}>{u.nome || u.username}</div>
              <div style={{ color: P.textDim, fontSize: 11, fontFamily: 'monospace' }}>@{u.username}</div>
            </div>
            {/* telefone */}
            <div style={{ color: P.textMuted, fontSize: 12, fontFamily: 'monospace' }}>{u.telefone || '—'}</div>
            {/* email */}
            <div style={{ color: P.textMuted, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email_addr || '—'}</div>
            {/* perfil */}
            <div style={{ color: u.role === 'admin' ? P.yellow : P.textMuted, fontSize: 11, fontFamily: 'monospace' }}>{u.role}</div>
            {/* ações */}
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button style={{ ...S.smBtn, color: P.textMuted, border: `1px solid ${P.border}`, cursor: 'pointer', fontSize: 10 }} onClick={() => setEditUser({...u})}>✎</button>
              <button style={{ ...S.smBtn, color: P.red, border: `1px solid ${P.redDim}`, cursor: 'pointer', fontSize: 10 }} onClick={() => handleDelete(u.id, u.username)}>✕ remover</button>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: P.textDim, fontFamily: 'monospace', fontSize: 12 }}>// nenhum usuário</div>
        )}
      </Card>

      {/* Modal editar usuário */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={e => e.target === e.currentTarget && setEditUser(null)}>
          <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, padding: 24, width: '100%', maxWidth: 480 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: P.textMuted, marginBottom: 16, borderBottom: `1px solid ${P.border}`, paddingBottom: 12 }}>
              $ edit <span style={{ color: P.accent }}>@{editUser.username}</span>
            </div>
            <Grid2>
              <Field label="nome" value={editUser.nome || ''} onChange={v => setEditUser(p => ({...p, nome: v}))} />
              <Field label="telefone" value={editUser.telefone || ''} onChange={v => setEditUser(p => ({...p, telefone: v}))} />
              <Field label="e-mail" value={editUser.email_addr || ''} onChange={v => setEditUser(p => ({...p, email_addr: v}))} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={S.lbl}>perfil</label>
                <select style={S.inp} value={editUser.role} onChange={e => setEditUser(p => ({...p, role: e.target.value}))}>
                  <option value="client">cliente</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <Field label="nova senha (opcional)" type="password" value={editUser._newPassword || ''} onChange={v => setEditUser(p => ({...p, _newPassword: v}))} placeholder="deixe em branco para não alterar" />
            </Grid2>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Btn onClick={() => setEditUser(null)}>cancelar</Btn>
              <Btn primary onClick={handleSaveEdit}>salvar</Btn>
            </div>
          </div>
        </div>
      )}
    </PageWrap>
  );
}

// ── Modal Auth (login) ────────────────────────────────────────────
function AuthModal({ onLogin, onClose }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const f = k => v => { setForm(p => ({...p, [k]: v})); setError(''); };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const r = await fetch(`${API}/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.token) { saveAuth(d); onLogin(d); }
      else setError(d.error || 'Usuário ou senha inválidos');
    } catch { setError('Erro de conexão'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, width: '100%', maxWidth: 360, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BvtLogo size={20} />
            <span style={{ color: P.textMuted, fontFamily: 'monospace', fontSize: 11 }}>Painel BVT</span>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: P.textDim, cursor: 'pointer', fontSize: 20, lineHeight: 1 }} onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} style={{ padding: '0 20px 24px' }}>
          <Field label="usuário" value={form.username} onChange={f('username')} autoFocus required />
          <Field label="senha" type="password" value={form.password} onChange={f('password')} required />
          {error && <ErrBox>{error}</ErrBox>}
          <Btn type="submit" primary fullWidth disabled={loading} style={{ marginTop: 4 }}>
            {loading ? 'entrando...' : '→ entrar'}
          </Btn>
        </form>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('bvt_token');
    if (!token) return null;
    return {
      token,
      username: localStorage.getItem('bvt_user') || '',
      role: localStorage.getItem('bvt_role') || 'client',
      nome: localStorage.getItem('bvt_nome') || '',
      email: localStorage.getItem('bvt_email') || '',
      telefone: localStorage.getItem('bvt_telefone') || '',
    };
  });
  const [page, setPage] = useState('home');
  const [authModal, setAuthModal] = useState(null);
  const api = useApi();

  if (MAINTENANCE) return <MaintenancePage />;

  const handleLogin = (d) => {
    saveAuth(d);
    setAuth({ ...d, nome: d.nome||'', email: d.email||'', telefone: d.telefone||'' });
    setAuthModal(null);
    setPage('sites');
  };

  const handleLogout = async () => {
    try { await api('/auth/logout', 'POST'); } catch {}
    clearAuth(); setAuth(null); setPage('home');
  };

  // ── NÃO LOGADO: home pública com topbar ──
  if (!auth) {
    return (
      <div style={{ minHeight: '100vh', background: P.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Topbar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, background: P.surface, borderBottom: `1px solid ${P.border}`, padding: '12px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BvtLogo size={24} />
            <span style={{ color: P.text, fontWeight: 700, fontFamily: 'monospace', fontSize: 14 }}>Painel BVT</span>
          </div>
          <Btn primary onClick={() => setAuthModal('login')} style={{ fontSize: 12, padding: '7px 18px' }}>Entrar →</Btn>
        </div>

        <HomePage onStart={() => setAuthModal('login')} />

        {authModal && <AuthModal onLogin={handleLogin} onClose={() => setAuthModal(null)} />}
      </div>
    );
  }

  // ── LOGADO ──
  const isAdmin = auth.role === 'admin';
  const displayName = auth.nome || auth.username;

  const navItems = [
    { id: 'home',      label: 'início',       icon: '⌂' },
    { id: 'sites',     label: 'meus sites',   icon: '◈' },
    { id: 'disparos',  label: 'disparos',     icon: '📲' },
    { id: 'conta',     label: 'minha conta',  icon: '◎' },
    ...(isAdmin ? [{ id: 'admin', label: 'admin', icon: '⬡' }] : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: P.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Sidebar */}
      <nav style={{ width: 210, background: P.surface, borderRight: `1px solid ${P.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 0', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        <div>
          {/* Logo */}
          <div style={{ padding: '0 20px 20px', borderBottom: `1px solid ${P.border}`, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BvtLogo size={28} />
              <div>
                <div style={{ color: P.text, fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>Painel BVT</div>
                <div style={{ color: P.textDim, fontSize: 9, fontFamily: 'monospace' }}>v2.0</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ padding: '0 8px' }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => setPage(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                background: page === item.id ? P.surface2 : 'transparent',
                color: page === item.id ? P.text : P.textMuted,
                border: 'none',
                borderLeft: page === item.id ? `2px solid ${P.accent}` : '2px solid transparent',
                padding: '9px 12px', cursor: 'pointer',
                fontSize: 12, fontFamily: 'monospace', textAlign: 'left',
                borderRadius: '0 4px 4px 0',
                marginBottom: 2,
              }}>
                <span style={{ fontSize: 14, color: page === item.id ? P.accent : P.textDim }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: P.yellow, flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ padding: '16px 20px', borderTop: `1px solid ${P.border}` }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 4, background: P.surface2, border: `1px solid ${P.border}`, color: P.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, fontFamily: 'monospace', flexShrink: 0 }}>
              {displayName[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: P.text, fontSize: 11, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
              <div style={{ color: P.textDim, fontSize: 9, fontFamily: 'monospace' }}>{auth.role}</div>
            </div>
          </div>
          <a href="https://discord.gg/mkJE89mBUj" target="_blank" rel="noreferrer" style={{ display: 'block', color: '#5865F2', fontSize: 11, fontFamily: 'monospace', marginBottom: 8, textDecoration: 'none' }}>
            💬 discord
          </a>
          <button style={{ background: 'transparent', border: 'none', color: P.textDim, cursor: 'pointer', fontSize: 11, fontFamily: 'monospace', padding: 0 }} onClick={handleLogout}>
            $ logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        {page === 'home'    && <HomePage onStart={() => setPage('sites')} />}
        {page === 'sites'    && <VerificarPage api={api} />}
        {page === 'disparos' && <DisparosPage />}
        {page === 'conta'     && <ContaPage api={api} auth={auth} onUpdate={updated => {
          setAuth(updated);
          localStorage.setItem('bvt_nome', updated.nome || '');
          localStorage.setItem('bvt_email', updated.email || '');
          localStorage.setItem('bvt_telefone', updated.telefone || '');
        }} />}
        {page === 'admin'     && isAdmin && <AdminPage api={api} />}
      </main>
    </div>
  );
}

// ── Disparos ─────────────────────────────────────────────────────
function DisparosPage() {
  const steps = [
    { n: '01', title: 'Verifique seu BM', body: 'Use o painel (aba "meus sites") para criar o site com o CNPJ da empresa. Depois vá no Meta Business Suite → Configurações → Domínios → adicione a URL gerada. Em seguida vá em Centro de Segurança → Verificar empresa e envie o CNPJ + cartão CNPJ. Isso sobe seu limite de 250 → 2.000 disparos/dia.' },
    { n: '02', title: 'Acesse a Bevits e conecte o BM', body: 'Acesse bevits.com e conecte o BM verificado. A plataforma aceita dois tipos de conexão: Cloud API (número dedicado a disparos, gerenciado pela Meta na nuvem) ou Coexistência (mantém o app no celular funcionando ao mesmo tempo).' },
    { n: '03', title: 'Aprove um template de mensagem', body: 'Crie a mensagem que vai enviar — pode incluir texto, imagem, botões e links. Submeta para aprovação da Meta. Normalmente aprovado em minutos. Use variáveis como {{1}} para personalizar com o nome de cada contato.' },
    { n: '04', title: 'Importe sua lista e dispare', body: 'Importe o arquivo .csv ou .xlsx com os contatos, selecione o template aprovado e dispare com 1 clique. Acompanhe entregas, aberturas e cliques em tempo real no painel da Bevits.' },
  ];

  return (
    <PageWrap>
      <PageHeader title="📲 disparos whatsapp" sub="API oficial Meta — sem risco de banimento" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { icon: '✅', label: 'API oficial Meta', sub: 'cada msg autorizada pela Meta' },
          { icon: '📶', label: 'Tiers de limite', sub: '250 → 2k → 10k → 100k → ∞' },
          { icon: '💸', label: 'A partir de R$0,20', sub: 'sem mínimo de envios' },
          { icon: '📊', label: 'Relatório em tempo real', sub: 'entregas, aberturas e cliques' },
        ].map(({ icon, label, sub }) => (
          <div key={label} style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, padding: '14px 16px' }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
            <div style={{ color: P.text, fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{label}</div>
            <div style={{ color: P.textMuted, fontSize: 10, fontFamily: 'monospace', marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ color: P.text, fontWeight: 700, fontFamily: 'monospace', fontSize: 13, marginBottom: 16 }}>Passo a passo</div>
        {steps.map(({ n, title, body }) => (
          <div key={n} style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ width: 28, height: 28, borderRadius: 4, background: P.accentDim, border: `1px solid ${P.accent}`, color: P.accent, fontFamily: 'monospace', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>{n}</div>
            <div>
              <div style={{ color: P.text, fontWeight: 700, fontFamily: 'monospace', fontSize: 12, marginBottom: 4 }}>{title}</div>
              <div style={{ color: P.textMuted, fontSize: 12, fontFamily: 'monospace', lineHeight: 1.7 }}>{body}</div>
            </div>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ color: P.text, fontWeight: 700, fontFamily: 'monospace', fontSize: 13, marginBottom: 12 }}>Cloud API vs Coexistência</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {['', 'Cloud API', 'Coexistência'].map(h => (
                  <th key={h} style={{ padding: '6px 12px', color: P.textMuted, fontWeight: 700, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['App no celular', '❌ Desativa', '✅ Continua funcionando'],
                ['Estabilidade', '✅ Máxima', '✅ Muito boa'],
                ['Indicado para', 'Número dedicado a disparos', 'Número que usa no dia a dia'],
              ].map(([label, a, b]) => (
                <tr key={label} style={{ borderBottom: `1px solid ${P.border}` }}>
                  <td style={{ padding: '8px 12px', color: P.textMuted }}>{label}</td>
                  <td style={{ padding: '8px 12px', color: P.text }}>{a}</td>
                  <td style={{ padding: '8px 12px', color: P.text }}>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ background: '#25D36622', border: '1px solid #25D366', borderRadius: 8, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: P.text, fontWeight: 700, fontFamily: 'monospace', fontSize: 13, marginBottom: 4 }}>Pronto para disparar?</div>
          <div style={{ color: P.textMuted, fontSize: 11, fontFamily: 'monospace' }}>Conecte seu BM verificado e comece no mesmo dia. A partir de R$0,20 por mensagem, sem mínimo.</div>
        </div>
        <a href="https://bevits.com/pt-br/whatsapp-campaign/" target="_blank" rel="noreferrer"
          style={{ background: '#25D366', color: '#fff', borderRadius: 6, padding: '10px 22px', fontSize: 12, fontWeight: 700, fontFamily: 'monospace', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
          Acessar Bevits →
        </a>
      </div>
    </PageWrap>
  );
}

// ── Shared components ─────────────────────────────────────────────
function PageWrap({ children, style }) {
  return <div style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto', boxSizing: 'border-box', ...style }}>{children}</div>;
}

function PageHeader({ title, sub, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
      <div>
        <h1 style={{ color: P.text, fontSize: 16, fontWeight: 700, fontFamily: 'monospace', margin: 0 }}>{title}</h1>
        {sub && <div style={{ color: P.textMuted, fontSize: 11, fontFamily: 'monospace', marginTop: 3 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: P.surface, border: `1px solid ${P.border}`, borderRadius: 6, padding: 20, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ color: P.textDim, fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{children}</div>;
}

function Divider() {
  return <div style={{ borderTop: `1px solid ${P.border}`, margin: '16px 0' }} />;
}

function ErrBox({ children }) {
  return <div style={{ background: P.redDim, border: `1px solid ${P.red}`, color: P.red, borderRadius: 4, padding: '8px 12px', fontSize: 12, fontFamily: 'monospace', marginBottom: 12 }}>{children}</div>;
}

function Grid2({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>{children}</div>;
}

function Field({ label, value, onChange, type = 'text', placeholder, required, autoFocus, maxLength }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={S.lbl}>{label}</label>
      <input
        style={S.inp}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        maxLength={maxLength}
      />
    </div>
  );
}

function Btn({ children, onClick, type = 'button', primary, disabled, fullWidth, style }) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      background: primary ? P.accent : 'transparent',
      color: primary ? '#0d1117' : P.textMuted,
      border: primary ? 'none' : `1px solid ${P.border}`,
      borderRadius: 4,
      padding: '8px 16px',
      cursor: disabled ? 'default' : 'pointer',
      fontSize: 12,
      fontWeight: primary ? 700 : 400,
      fontFamily: 'monospace',
      width: fullWidth ? '100%' : undefined,
      opacity: disabled ? 0.5 : 1,
      ...style,
    }}>{children}</button>
  );
}

// ── Styles ────────────────────────────────────────────────────────
const S = {
  lbl: { display: 'block', color: P.textDim, fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 },
  inp: { width: '100%', background: P.surface2, border: `1px solid ${P.border}`, borderRadius: 4, padding: '8px 10px', color: P.text, fontSize: 13, outline: 'none', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' },
  smBtn: { background: 'transparent', padding: '4px 8px', borderRadius: 3, fontSize: 11, fontFamily: 'monospace', flexShrink: 0 },
  searchInput: { width: '100%', background: P.surface, border: `1px solid ${P.border}`, borderRadius: 4, padding: '8px 12px', color: P.text, fontSize: 12, outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box', marginBottom: 12 },
};

// CSS keyframe for spinner (inject once)
if (!document.getElementById('bvt-spin-style')) {
  const style = document.createElement('style');
  style.id = 'bvt-spin-style';
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}
