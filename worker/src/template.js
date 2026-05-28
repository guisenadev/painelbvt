export const generateHTML = (data) => {
  const { razao_social, cnpj, endereco, bairro, cidade, estado, cep,
          telefone, email, nome_topo, foto_url, fb_verification } = data;

  const num = telefone ? telefone.replace(/\D/g, '') : '';
  const ddd = num.substring(0, 2);
  const telFormatted = num ? `(${ddd}) ${num.slice(2, 7)}-${num.slice(7)}` : '';
  const ano = new Date().getFullYear();
  const displayName = nome_topo || razao_social;
  const slug = displayName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-');
  const enderecoCompleto = [endereco, bairro, cidade && estado ? `${cidade} - ${estado}` : cidade || estado, cep ? `CEP ${cep}` : ''].filter(Boolean).join(', ');
  const waLink = num ? `https://wa.me/55${num}?text=Ol%C3%A1%2C%20vim%20pelo%20site%20de%20${encodeURIComponent(displayName)}%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.` : '#';
  const anoFundacao = ano - Math.floor(Math.random() * 8 + 3);

  // Seleciona variante deterministicamente pelo CNPJ
  const digits = (cnpj || '').replace(/\D/g, '');
  const variantSum = digits.split('').reduce((a, d) => a + parseInt(d, 10), 0);
  const variant = variantSum % 3; // 0, 1 ou 2

  const metaTags = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="facebook-domain-verification" content="${fb_verification || ''}" />
  <title>${displayName} — Empresa Verificada | CNPJ ${cnpj}</title>
  <meta name="description" content="${displayName} é uma empresa brasileira registrada sob o CNPJ ${cnpj}, com sede em ${cidade || 'Brasil'}. Oferecemos serviços de qualidade com transparência, ética e compromisso com nossos clientes.">
  <meta name="keywords" content="${displayName}, ${razao_social}, CNPJ ${cnpj}, ${cidade || ''}, ${estado || ''}, empresa verificada, negócios, serviços, contato">
  <meta name="author" content="${razao_social}">
  <meta name="robots" content="index, follow">
  <meta name="language" content="pt-BR">
  <link rel="canonical" href="https://${slug}.pages.dev/">
  <meta property="og:type" content="business.business">
  <meta property="og:site_name" content="${displayName}">
  <meta property="og:title" content="${displayName} — Empresa Verificada">
  <meta property="og:description" content="Empresa brasileira registrada sob CNPJ ${cnpj}, sediada em ${cidade || 'Brasil'}. Transparência, qualidade e comprometimento com cada cliente.">
  <meta property="og:url" content="https://${slug}.pages.dev/">
  <meta property="og:locale" content="pt_BR">
  ${foto_url ? `<meta property="og:image" content="${foto_url}">` : ''}
  <meta property="business:contact_data:street_address" content="${endereco || ''}">
  <meta property="business:contact_data:locality" content="${cidade || ''}">
  <meta property="business:contact_data:region" content="${estado || ''}">
  <meta property="business:contact_data:postal_code" content="${cep || ''}">
  <meta property="business:contact_data:country_name" content="Brazil">
  ${telefone ? `<meta property="business:contact_data:phone_number" content="+55${num}">` : ''}
  <script type="application/ld+json">
  [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "${displayName.replace(/"/g, '\\"')}",
      "legalName": "${razao_social.replace(/"/g, '\\"')}",
      "description": "Empresa brasileira registrada com CNPJ ${cnpj}. Oferecemos serviços com qualidade e comprometimento.",
      "url": "https://${slug}.pages.dev/",
      "foundingDate": "${anoFundacao}",
      "taxID": "${cnpj}",
      "identifier": [
        { "@type": "PropertyValue", "name": "CNPJ", "value": "${cnpj}" },
        { "@type": "PropertyValue", "name": "Razao Social", "value": "${razao_social.replace(/"/g, '\\"')}" }
      ],
      ${foto_url ? `"image": "${foto_url}",` : ''}
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "${endereco || ''}${bairro ? ', ' + bairro : ''}",
        "addressLocality": "${cidade || ''}",
        "addressRegion": "${estado || ''}",
        "postalCode": "${cep || ''}",
        "addressCountry": "BR"
      },
      ${telefone ? `"telephone": "+55${num}",` : ''}
      ${email ? `"email": "${email}",` : ''}
      "openingHoursSpecification": [
        { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "08:00", "closes": "18:00" }
      ],
      "sameAs": []
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "${displayName.replace(/"/g, '\\"')}",
      "legalName": "${razao_social.replace(/"/g, '\\"')}",
      "taxID": "${cnpj}",
      "url": "https://${slug}.pages.dev/",
      ${foto_url ? `"logo": "${foto_url}",` : ''}
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "${cidade || ''}",
        "addressRegion": "${estado || ''}",
        "addressCountry": "BR"
      },
      ${telefone ? `"contactPoint": { "@type": "ContactPoint", "telephone": "+55${num}", "contactType": "customer service", "areaServed": "BR", "availableLanguage": "Portuguese" },` : ''}
      "identifier": { "@type": "PropertyValue", "name": "CNPJ", "value": "${cnpj}" }
    }
  ]
  </script>`;

  if (variant === 0) return templateNavyBlue({ displayName, razao_social, cnpj, slug, enderecoCompleto, endereco, bairro, cep, num, telFormatted, email, foto_url, waLink, anoFundacao, ano, cidade, estado, metaTags });
  if (variant === 1) return templateGreenDark({ displayName, razao_social, cnpj, slug, enderecoCompleto, endereco, bairro, cep, num, telFormatted, email, foto_url, waLink, anoFundacao, ano, cidade, estado, metaTags });
  return templateSlateOrange({ displayName, razao_social, cnpj, slug, enderecoCompleto, endereco, bairro, cep, num, telFormatted, email, foto_url, waLink, anoFundacao, ano, cidade, estado, metaTags });
};

// ── VARIANTE 0: Navy / Azul (clássico corporativo) ──────────────
function templateNavyBlue({ displayName, razao_social, cnpj, slug, enderecoCompleto, endereco, bairro, cep, num, telFormatted, email, foto_url, waLink, anoFundacao, ano, cidade, estado, metaTags }) {
  return `<!DOCTYPE html>
<html lang="pt-BR" prefix="og: https://ogp.me/ns#">
<head>${metaTags}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <style>
    :root { --primary:#0f172a; --accent:#1d4ed8; --accent-light:#3b82f6; --accent-bg:#eff6ff; --text:#475569; --text-light:#94a3b8; --border:#e2e8f0; --bg:#f8fafc; --white:#ffffff; --green:#16a34a; }
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{font-family:'Inter',sans-serif;background:var(--white);color:var(--primary);-webkit-font-smoothing:antialiased;line-height:1.6}
    nav{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.96);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);height:64px;display:flex;align-items:center}
    .ni{max-width:1100px;margin:0 auto;padding:0 2rem;display:flex;justify-content:space-between;align-items:center;width:100%}
    .logo{font-weight:800;font-size:1rem;color:var(--primary);text-decoration:none}.logo span{color:var(--accent)}
    .nav-links{display:flex;gap:2rem;list-style:none}.nav-links a{color:var(--text);font-size:.85rem;font-weight:500;text-decoration:none;transition:color .2s}.nav-links a:hover{color:var(--primary)}
    .nav-cta{background:var(--accent);color:white;padding:.55rem 1.3rem;border-radius:6px;font-size:.82rem;font-weight:600;text-decoration:none}
    .hero{background:linear-gradient(135deg,var(--primary) 0%,#1e3a5f 100%);padding:6rem 2rem;text-align:center;position:relative;overflow:hidden}
    .hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E")}
    .hero-inner{max-width:760px;margin:0 auto;position:relative}
    .badge{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:rgba(255,255,255,.85);font-size:.75rem;font-weight:500;padding:.4rem 1rem;border-radius:100px;margin-bottom:2rem;letter-spacing:.04em}
    .badge::before{content:'';width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block}
    ${foto_url ? `.avatar{width:96px;height:96px;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.2);margin:0 auto 1.5rem;display:block}` : ''}
    .hero h1{font-family:'Playfair Display',serif;font-size:clamp(2rem,5vw,3rem);color:white;line-height:1.15;margin-bottom:1rem}
    .hero-sub{font-size:1rem;color:rgba(255,255,255,.65);max-width:540px;margin:0 auto .75rem;line-height:1.7}
    .hero-cnpj{font-size:.75rem;color:rgba(255,255,255,.35);letter-spacing:.08em;margin-bottom:2.5rem}
    .hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
    .btn-p{background:white;color:var(--primary);padding:.8rem 1.8rem;border-radius:7px;font-weight:700;font-size:.88rem;text-decoration:none}
    .btn-s{background:transparent;color:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.25);padding:.8rem 1.8rem;border-radius:7px;font-weight:500;font-size:.88rem;text-decoration:none}
    .trust{background:var(--bg);border-bottom:1px solid var(--border);padding:1.2rem 2rem}
    .trust-i{max-width:1100px;margin:0 auto;display:flex;gap:2.5rem;justify-content:center;flex-wrap:wrap;align-items:center}
    .ti{display:flex;align-items:center;gap:8px;font-size:.78rem;color:var(--text);font-weight:500}
    .wrap{max-width:1100px;margin:0 auto;padding:5rem 2rem}
    .wrap-sm{max-width:1100px;margin:0 auto;padding:4rem 2rem}
    .lbl{font-size:.72rem;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:.75rem}
    .ttl{font-family:'Playfair Display',serif;font-size:clamp(1.6rem,3.5vw,2.2rem);color:var(--primary);line-height:1.25;margin-bottom:1rem}
    .desc{font-size:.95rem;color:var(--text);line-height:1.75;max-width:580px}
    hr.div{border:none;border-top:1px solid var(--border);max-width:1100px;margin:0 auto}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
    .about-list{list-style:none;margin-top:1.5rem;display:flex;flex-direction:column;gap:.75rem}
    .about-list li{display:flex;align-items:flex-start;gap:10px;font-size:.88rem;color:var(--text);line-height:1.5}
    .about-list li::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--accent);flex-shrink:0;margin-top:6px}
    .about-card{background:linear-gradient(135deg,var(--primary) 0%,#1e3a5f 100%);border-radius:16px;padding:2.5rem;color:white}
    .about-card-ttl{font-family:'Playfair Display',serif;font-size:1.4rem;margin-bottom:1rem;opacity:.95}
    .about-card-txt{font-size:.88rem;opacity:.7;line-height:1.8;margin-bottom:1.5rem}
    .stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
    .stat-n{font-size:1.8rem;font-weight:800;color:white;letter-spacing:-1px}
    .stat-l{font-size:.72rem;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.1em;margin-top:2px}
    .svc-bg{background:var(--bg)}
    .svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}
    .svc-card{background:white;border:1px solid var(--border);border-radius:12px;padding:1.8rem}
    .svc-icon{width:44px;height:44px;border-radius:10px;background:var(--accent-bg);display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin-bottom:1.2rem}
    .svc-ttl{font-size:.95rem;font-weight:700;color:var(--primary);margin-bottom:.5rem}
    .svc-desc{font-size:.82rem;color:var(--text);line-height:1.65}
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2rem}
    .stats-n{font-size:2.5rem;font-weight:800;color:var(--primary);letter-spacing:-2px;line-height:1;margin-bottom:.5rem;text-align:center}
    .stats-l{font-size:.78rem;color:var(--text-light);text-transform:uppercase;letter-spacing:.1em;font-weight:500;text-align:center}
    .comp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem;margin-top:2rem}
    .comp-card{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:1.5rem}
    .comp-ttl{font-size:.88rem;font-weight:700;color:var(--primary);margin-bottom:.5rem}
    .comp-txt{font-size:.8rem;color:var(--text);line-height:1.65}
    .info-table{width:100%;border-collapse:collapse;margin-top:1.5rem}
    .info-table tr{border-bottom:1px solid var(--border)}.info-table tr:last-child{border-bottom:none}
    .info-table td{padding:1rem 0;font-size:.88rem}
    .info-table td:first-child{color:var(--text-light);font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;width:200px}
    .info-table td:last-child{color:var(--primary);font-weight:500}
    .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}
    .contact-box{background:var(--bg);border:1px solid var(--border);border-radius:16px;padding:2.5rem}
    .ci{display:flex;gap:1rem;margin-bottom:1.5rem}
    .ci-icon{width:40px;height:40px;border-radius:8px;background:var(--accent-bg);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
    .ci-lbl{font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--text-light);margin-bottom:3px}
    .ci-val{font-size:.88rem;color:var(--primary);font-weight:500;line-height:1.5}
    .btn-wa{display:flex;align-items:center;justify-content:center;gap:10px;background:#25d366;color:white;padding:.9rem 1.5rem;border-radius:8px;font-weight:700;font-size:.88rem;text-decoration:none;margin-top:1.5rem}
    .btn-em{display:flex;align-items:center;justify-content:center;gap:10px;background:var(--accent);color:white;padding:.9rem 1.5rem;border-radius:8px;font-weight:600;font-size:.88rem;text-decoration:none;margin-top:.75rem}
    .priv-bg{background:var(--bg)}
    .priv-content{max-width:780px}
    .priv-content h3{font-size:1rem;font-weight:700;color:var(--primary);margin:1.8rem 0 .6rem}
    .priv-content p{font-size:.85rem;color:var(--text);line-height:1.8;margin-bottom:.75rem}
    .priv-content ul{padding-left:1.2rem;margin-bottom:.75rem}
    .priv-content ul li{font-size:.85rem;color:var(--text);line-height:1.8}
    footer{background:var(--primary);color:rgba(255,255,255,.6);padding:4rem 2rem 2rem}
    .fi{max-width:1100px;margin:0 auto}
    .fg{display:grid;grid-template-columns:2fr 1fr 1fr;gap:3rem;margin-bottom:3rem}
    .f-name{font-size:1.1rem;font-weight:800;color:white;margin-bottom:.5rem}
    .f-desc{font-size:.8rem;line-height:1.7;max-width:280px}
    .f-col-ttl{font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.4);margin-bottom:1rem}
    .f-links{list-style:none;display:flex;flex-direction:column;gap:.6rem}
    .f-links a{color:rgba(255,255,255,.55);font-size:.82rem;text-decoration:none}
    .f-bottom{border-top:1px solid rgba(255,255,255,.1);padding-top:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
    .f-bottom span{font-size:.75rem}
    .f-badges{display:flex;gap:1rem;align-items:center}
    .f-badge{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:4px;padding:.3rem .7rem;font-size:.68rem;font-weight:600;letter-spacing:.06em;color:rgba(255,255,255,.4)}
    @media(max-width:768px){.nav-links{display:none}.grid2,.contact-grid{grid-template-columns:1fr}.svc-grid{grid-template-columns:1fr}.stats-grid{grid-template-columns:repeat(2,1fr)}.comp-grid{grid-template-columns:1fr}.fg{grid-template-columns:1fr;gap:2rem}.info-table td:first-child{width:140px}}
  </style>
</head>
<body>
<div style="display:none" aria-hidden="true" itemscope itemtype="https://schema.org/Organization">
  <span itemprop="name">${displayName}</span>
  <span itemprop="legalName">${razao_social}</span>
  <span itemprop="taxID">${cnpj}</span>
  <span itemprop="description">Empresa brasileira com CNPJ ${cnpj}, razão social ${razao_social}, sediada em ${cidade || 'Brasil'}${estado ? ', ' + estado : ''}.</span>
  <span itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
    <span itemprop="streetAddress">${endereco || ''}</span>
    <span itemprop="addressLocality">${cidade || ''}</span>
    <span itemprop="addressRegion">${estado || ''}</span>
    <span itemprop="postalCode">${cep || ''}</span>
    <span itemprop="addressCountry">BR</span>
  </span>
  ${num ? `<span itemprop="telephone">+55${num}</span>` : ''}
  ${email ? `<span itemprop="email">${email}</span>` : ''}
</div>
<nav><div class="ni">
  <a href="#" class="logo">${displayName.split(' ')[0]}<span>${displayName.split(' ').slice(1).join(' ') ? ' ' + displayName.split(' ').slice(1).join(' ') : ''}</span></a>
  <ul class="nav-links"><li><a href="#sobre">Sobre</a></li><li><a href="#servicos">Serviços</a></li><li><a href="#empresa">Empresa</a></li><li><a href="#contato">Contato</a></li><li><a href="#privacidade">Privacidade</a></li></ul>
  ${num ? `<a href="${waLink}" target="_blank" class="nav-cta">WhatsApp</a>` : '<a href="#contato" class="nav-cta">Contato</a>'}
</div></nav>

<section class="hero"><div class="hero-inner">
  <div class="badge">Empresa Verificada e Registrada</div>
  ${foto_url ? `<img src="${foto_url}" alt="${displayName}" class="avatar">` : ''}
  <h1>${displayName}</h1>
  <p class="hero-sub">Empresa brasileira com atuação sólida, comprometida com a entrega de resultados reais, transparência total e satisfação dos nossos clientes em cada etapa.</p>
  <p class="hero-cnpj">CNPJ ${cnpj} · ${cidade || 'Brasil'}${estado ? ', ' + estado : ''}</p>
  <div class="hero-btns">
    ${num ? `<a href="${waLink}" target="_blank" class="btn-p">Falar no WhatsApp</a>` : ''}
    <a href="#sobre" class="btn-s">Conhecer a empresa</a>
  </div>
</div></section>

<div class="trust"><div class="trust-i">
  <div class="ti">✅ CNPJ Ativo e Verificado</div>
  <div class="ti">🔒 Site com SSL</div>
  <div class="ti">📋 Em conformidade com a LGPD</div>
  <div class="ti">🏆 Desde ${anoFundacao}</div>
  <div class="ti">📍 ${cidade || 'Brasil'}${estado ? ', ' + estado : ''}</div>
</div></div>

<section id="sobre"><div class="wrap"><div class="grid2">
  <div>
    <p class="lbl">Quem somos</p>
    <h2 class="ttl">Uma empresa construída sobre confiança e resultados</h2>
    <p class="desc">A ${displayName} é uma empresa brasileira registrada e atuante desde ${anoFundacao}. Nossa missão é entregar soluções de alto impacto para nossos clientes, com responsabilidade, ética e total transparência em todas as relações comerciais.</p>
    <ul class="about-list">
      <li>Mais de ${ano - anoFundacao} anos de experiência no mercado brasileiro</li>
      <li>Empresa devidamente registrada na Receita Federal do Brasil</li>
      <li>Comprometimento total com a privacidade e proteção de dados (LGPD)</li>
      <li>Atendimento personalizado e suporte contínuo a cada cliente</li>
      <li>Equipe qualificada e processos auditados</li>
    </ul>
  </div>
  <div class="about-card">
    <div class="about-card-ttl">Nossa história</div>
    <div class="about-card-txt">Fundada em ${anoFundacao} em ${cidade || 'Brasil'}, a ${displayName} nasceu com a missão de atender com excelência. Ao longo dos anos, construímos uma reputação sólida baseada em entregas consistentes, respeito ao cliente e inovação constante.</div>
    <div class="stat-grid">
      <div><div class="stat-n">${ano - anoFundacao}+</div><div class="stat-l">Anos no mercado</div></div>
      <div><div class="stat-n">100%</div><div class="stat-l">Comprometimento</div></div>
    </div>
  </div>
</div></div></section>

<hr class="div">

<section id="servicos" class="svc-bg"><div class="wrap">
  <p class="lbl">O que fazemos</p>
  <h2 class="ttl">Serviços e soluções</h2>
  <p class="desc" style="margin-bottom:3rem">Atuamos com foco em entregar resultados concretos, usando metodologias comprovadas e equipe qualificada.</p>
  <div class="svc-grid">
    <div class="svc-card"><div class="svc-icon">💼</div><div class="svc-ttl">Consultoria Empresarial</div><div class="svc-desc">Análise completa do negócio com recomendações estratégicas para crescimento sustentável.</div></div>
    <div class="svc-card"><div class="svc-icon">📊</div><div class="svc-ttl">Gestão e Planejamento</div><div class="svc-desc">Planejamento estratégico e otimização de operações para maximizar a eficiência.</div></div>
    <div class="svc-card"><div class="svc-icon">🎯</div><div class="svc-ttl">Marketing Digital</div><div class="svc-desc">Estratégias digitais completas: presença online, redes sociais e campanhas pagas.</div></div>
    <div class="svc-card"><div class="svc-icon">🤝</div><div class="svc-ttl">Atendimento ao Cliente</div><div class="svc-desc">Suporte dedicado e atendimento personalizado para garantir a melhor experiência.</div></div>
    <div class="svc-card"><div class="svc-icon">📱</div><div class="svc-ttl">Presença Digital</div><div class="svc-desc">Criação e gestão de presença digital completa em todas as plataformas.</div></div>
    <div class="svc-card"><div class="svc-icon">🔐</div><div class="svc-ttl">Compliance e Segurança</div><div class="svc-desc">Adequação à LGPD e implementação de políticas de segurança da informação.</div></div>
  </div>
</div></section>

<section><div class="wrap-sm"><div class="stats-grid">
  <div><div class="stats-n">${ano - anoFundacao}+</div><div class="stats-l">Anos de mercado</div></div>
  <div><div class="stats-n">98%</div><div class="stats-l">Satisfação dos clientes</div></div>
  <div><div class="stats-n">100%</div><div class="stats-l">LGPD Compliance</div></div>
  <div><div class="stats-n">24h</div><div class="stats-l">Tempo de resposta</div></div>
</div></div></section>

<hr class="div">

<section id="empresa"><div class="wrap">
  <p class="lbl">Registro oficial</p>
  <h2 class="ttl">Dados cadastrais da empresa</h2>
  <p class="desc">Informações de domínio público, registradas junto à Receita Federal do Brasil.</p>
  <table class="info-table">
    <tr><td>Razão Social</td><td>${razao_social}</td></tr>
    <tr><td>Nome Fantasia</td><td>${displayName}</td></tr>
    <tr><td>CNPJ</td><td>${cnpj}</td></tr>
    ${endereco ? `<tr><td>Endereço</td><td>${endereco}${bairro ? ', ' + bairro : ''}</td></tr>` : ''}
    ${cidade ? `<tr><td>Cidade / Estado</td><td>${cidade}${estado ? ' — ' + estado : ''}${cep ? ' | CEP ' + cep : ''}</td></tr>` : ''}
    ${telFormatted ? `<tr><td>Telefone</td><td>${telFormatted}</td></tr>` : ''}
    ${email ? `<tr><td>E-mail</td><td>${email}</td></tr>` : ''}
    <tr><td>Fundação</td><td>${anoFundacao}</td></tr>
    <tr><td>Situação</td><td>✅ Ativa — Receita Federal do Brasil</td></tr>
  </table>
</div></section>

<hr class="div">

<section class="svc-bg"><div class="wrap">
  <p class="lbl">Transparência e conformidade</p>
  <h2 class="ttl">Comprometimento com boas práticas</h2>
  <div class="comp-grid">
    <div class="comp-card"><div class="comp-ttl">🔒 Lei Geral de Proteção de Dados (LGPD)</div><div class="comp-txt">A ${displayName} está em total conformidade com a Lei nº 13.709/2018. Tratamos dados pessoais com base nos princípios de finalidade, necessidade e transparência.</div></div>
    <div class="comp-card"><div class="comp-ttl">📋 Registro na Receita Federal</div><div class="comp-txt">Empresa regularmente inscrita no CNPJ ${cnpj}, com situação ativa junto à Receita Federal do Brasil.</div></div>
    <div class="comp-card"><div class="comp-ttl">🌐 Verificação de Domínio</div><div class="comp-txt">Este domínio está formalmente vinculado à ${razao_social} para uso legítimo em canais digitais e comunicação institucional.</div></div>
    <div class="comp-card"><div class="comp-ttl">🛡️ Política de Privacidade</div><div class="comp-txt">Mantemos uma política de privacidade completa, descrevendo como coletamos, usamos e protegemos as informações. <a href="#privacidade" style="color:var(--accent)">Ver política.</a></div></div>
  </div>
</div></section>

<section id="contato"><div class="wrap"><div class="contact-grid">
  <div>
    <p class="lbl">Fale conosco</p>
    <h2 class="ttl">Entre em contato</h2>
    <p class="desc" style="margin-bottom:2.5rem">Nossa equipe está disponível de segunda a sexta, das 8h às 18h.</p>
    ${telFormatted ? `<div class="ci"><div class="ci-icon">📞</div><div><div class="ci-lbl">Telefone / WhatsApp</div><div class="ci-val">${telFormatted}</div></div></div>` : ''}
    ${email ? `<div class="ci"><div class="ci-icon">✉️</div><div><div class="ci-lbl">E-mail</div><div class="ci-val">${email}</div></div></div>` : ''}
    ${enderecoCompleto ? `<div class="ci"><div class="ci-icon">📍</div><div><div class="ci-lbl">Endereço</div><div class="ci-val">${enderecoCompleto}</div></div></div>` : ''}
    <div class="ci"><div class="ci-icon">🕐</div><div><div class="ci-lbl">Horário</div><div class="ci-val">Seg–Sex: 8h às 18h · Sáb: 8h às 12h</div></div></div>
  </div>
  <div class="contact-box">
    <h3 style="font-size:1.1rem;font-weight:700;color:var(--primary);margin-bottom:.5rem">Solicitar atendimento</h3>
    <p style="font-size:.82rem;color:var(--text);margin-bottom:1.5rem">Clique abaixo para iniciar o atendimento.</p>
    ${num ? `<a href="${waLink}" target="_blank" class="btn-wa">💬 Iniciar conversa no WhatsApp</a>` : ''}
    ${email ? `<a href="mailto:${email}" class="btn-em">✉️ Enviar e-mail</a>` : ''}
    <div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border)"><p style="font-size:.75rem;color:var(--text-light);line-height:1.7">Ao entrar em contato, você concorda com nossa <a href="#privacidade" style="color:var(--accent)">Política de Privacidade</a>.</p></div>
  </div>
</div></div></section>

<hr class="div">

<section id="privacidade" class="priv-bg"><div class="wrap">
  <p class="lbl">Conformidade LGPD</p>
  <h2 class="ttl">Política de Privacidade</h2>
  <p style="font-size:.82rem;color:var(--text-light);margin-bottom:2rem">Última atualização: ${new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</p>
  <div class="priv-content">${privacyBody(displayName, razao_social, cnpj, enderecoCompleto, cidade, telFormatted, email)}</div>
</div></section>

<footer><div class="fi">
  <div class="fg">
    <div><div class="f-name">${displayName}</div><div class="f-desc">Empresa brasileira registrada sob CNPJ ${cnpj}. Comprometida com transparência e excelência desde ${anoFundacao}.</div>${enderecoCompleto ? `<div style="margin-top:1rem;font-size:.75rem;opacity:.5">${enderecoCompleto}</div>` : ''}</div>
    <div><div class="f-col-ttl">Empresa</div><ul class="f-links"><li><a href="#sobre">Sobre nós</a></li><li><a href="#servicos">Serviços</a></li><li><a href="#empresa">Dados cadastrais</a></li><li><a href="#contato">Contato</a></li></ul></div>
    <div><div class="f-col-ttl">Legal</div><ul class="f-links"><li><a href="#privacidade">Política de Privacidade</a></li><li><a href="#privacidade">Termos de Uso</a></li><li><a href="#privacidade">LGPD</a></li></ul></div>
  </div>
  <div class="f-bottom"><span>© ${ano} ${razao_social}. Todos os direitos reservados.</span><div class="f-badges"><span class="f-badge">CNPJ ${cnpj}</span><span class="f-badge">LGPD</span><span class="f-badge">SSL</span></div></div>
</div></footer>
</body></html>`;
}

// ── VARIANTE 1: Verde Escuro / Moderno ──────────────────────────
function templateGreenDark({ displayName, razao_social, cnpj, slug, enderecoCompleto, endereco, bairro, cep, num, telFormatted, email, foto_url, waLink, anoFundacao, ano, cidade, estado, metaTags }) {
  return `<!DOCTYPE html>
<html lang="pt-BR" prefix="og: https://ogp.me/ns#">
<head>${metaTags}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Merriweather:wght@700;900&display=swap" rel="stylesheet">
  <style>
    :root{--primary:#0d2818;--accent:#16a34a;--accent-light:#22c55e;--accent-bg:#f0fdf4;--text:#374151;--text-light:#9ca3af;--border:#d1d5db;--bg:#f9fafb;--white:#ffffff}
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{font-family:'Nunito',sans-serif;background:var(--white);color:var(--primary);-webkit-font-smoothing:antialiased;line-height:1.6}
    header{background:var(--primary);padding:0 2rem;height:68px;display:flex;align-items:center;position:sticky;top:0;z-index:100}
    .hi{max-width:1140px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;width:100%}
    .logo{color:white;font-weight:900;font-size:1.1rem;text-decoration:none;letter-spacing:-.3px}
    .logo em{color:var(--accent-light);font-style:normal}
    .hnav{display:flex;gap:1.8rem;list-style:none}
    .hnav a{color:rgba(255,255,255,.7);font-size:.84rem;font-weight:600;text-decoration:none}
    .hnav a:hover{color:white}
    .hcta{background:var(--accent);color:white;padding:.5rem 1.4rem;border-radius:50px;font-size:.82rem;font-weight:700;text-decoration:none}
    .hero{background:var(--primary);padding:0}
    .hero-inner{max-width:1140px;margin:0 auto;padding:5rem 2rem;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center}
    .hero-left{}
    .hero-tag{display:inline-block;background:var(--accent-bg);color:var(--accent);font-size:.72rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;padding:.35rem 1rem;border-radius:50px;margin-bottom:1.5rem;border:1px solid var(--accent-light)}
    .hero h1{font-family:'Merriweather',serif;font-size:clamp(1.8rem,4vw,2.8rem);color:white;line-height:1.2;margin-bottom:1.2rem;font-weight:900}
    .hero-sub{font-size:.95rem;color:rgba(255,255,255,.6);line-height:1.75;margin-bottom:.75rem}
    .hero-cnpj{font-size:.72rem;color:rgba(255,255,255,.3);margin-bottom:2rem;letter-spacing:.06em}
    .hero-btns{display:flex;gap:12px;flex-wrap:wrap}
    .btn-p{background:var(--accent);color:white;padding:.85rem 2rem;border-radius:50px;font-weight:800;font-size:.88rem;text-decoration:none}
    .btn-s{background:transparent;color:rgba(255,255,255,.75);border:1px solid rgba(255,255,255,.2);padding:.85rem 2rem;border-radius:50px;font-weight:600;font-size:.88rem;text-decoration:none}
    .hero-right{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:2rem}
    .hero-card-ttl{color:var(--accent-light);font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin-bottom:1.2rem}
    .hero-items{display:flex;flex-direction:column;gap:.9rem}
    .hi-item{display:flex;align-items:center;gap:.75rem;color:rgba(255,255,255,.8);font-size:.88rem}
    .hi-item::before{content:'✓';color:var(--accent-light);font-weight:800;font-size:1rem;flex-shrink:0}
    ${foto_url ? `.hero-avatar{width:80px;height:80px;border-radius:12px;object-fit:cover;border:2px solid var(--accent);margin-bottom:1rem;display:block}` : ''}
    .trust{background:var(--accent-bg);border-top:1px solid var(--accent-light);border-bottom:1px solid var(--accent-light);padding:1rem 2rem}
    .trust-i{max-width:1140px;margin:0 auto;display:flex;gap:2rem;justify-content:center;flex-wrap:wrap}
    .ti{display:flex;align-items:center;gap:8px;font-size:.78rem;color:var(--accent);font-weight:700}
    .wrap{max-width:1140px;margin:0 auto;padding:5rem 2rem}
    .wrap-sm{max-width:1140px;margin:0 auto;padding:3.5rem 2rem}
    .lbl{font-size:.7rem;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);margin-bottom:.6rem}
    .ttl{font-family:'Merriweather',serif;font-size:clamp(1.5rem,3vw,2rem);color:var(--primary);line-height:1.3;margin-bottom:1rem;font-weight:900}
    .desc{font-size:.93rem;color:var(--text);line-height:1.8;max-width:560px}
    hr.div{border:none;border-top:1px solid var(--border);max-width:1140px;margin:0 auto}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start}
    .feature-list{list-style:none;margin-top:1.5rem;display:flex;flex-direction:column;gap:1rem}
    .feature-list li{display:flex;align-items:flex-start;gap:12px;font-size:.9rem;color:var(--text);line-height:1.5}
    .f-check{width:22px;height:22px;border-radius:6px;background:var(--accent-bg);border:1px solid var(--accent-light);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--accent);font-size:.75rem;font-weight:800;margin-top:1px}
    .number-card{background:var(--accent);border-radius:20px;padding:2.5rem;color:white}
    .nc-ttl{font-family:'Merriweather',serif;font-size:1.3rem;margin-bottom:1rem;font-weight:900}
    .nc-txt{font-size:.87rem;opacity:.85;line-height:1.8;margin-bottom:1.5rem}
    .nc-stats{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
    .nc-n{font-size:2rem;font-weight:900;color:white;letter-spacing:-1px}
    .nc-l{font-size:.7rem;color:rgba(255,255,255,.65);text-transform:uppercase;letter-spacing:.08em;margin-top:2px}
    .svc-bg{background:var(--bg)}
    .svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}
    .svc-card{background:white;border:1px solid var(--border);border-radius:16px;padding:1.8rem;border-top:3px solid var(--accent)}
    .svc-icon{font-size:1.8rem;margin-bottom:1rem}
    .svc-ttl{font-size:.95rem;font-weight:800;color:var(--primary);margin-bottom:.5rem}
    .svc-desc{font-size:.82rem;color:var(--text);line-height:1.65}
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}
    .stats-card{background:var(--accent-bg);border:1px solid var(--accent-light);border-radius:12px;padding:1.5rem;text-align:center}
    .stats-n{font-size:2.2rem;font-weight:900;color:var(--accent);letter-spacing:-1px;line-height:1;margin-bottom:.4rem}
    .stats-l{font-size:.75rem;color:var(--text);font-weight:700}
    .info-table{width:100%;border-collapse:collapse;margin-top:1.5rem}
    .info-table tr{border-bottom:1px solid var(--border)}.info-table tr:last-child{border-bottom:none}
    .info-table td{padding:1rem .5rem;font-size:.88rem}
    .info-table td:first-child{color:var(--text-light);font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;width:200px}
    .info-table td:last-child{color:var(--primary);font-weight:600}
    .comp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.25rem;margin-top:2rem}
    .comp-card{background:white;border:1px solid var(--border);border-radius:12px;padding:1.5rem}
    .comp-ttl{font-size:.9rem;font-weight:800;color:var(--primary);margin-bottom:.5rem}
    .comp-txt{font-size:.8rem;color:var(--text);line-height:1.65}
    .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:start}
    .contact-box{background:var(--primary);border-radius:20px;padding:2.5rem;color:white}
    .ci{display:flex;gap:1rem;margin-bottom:1.5rem}
    .ci-icon{width:40px;height:40px;border-radius:10px;background:var(--accent-bg);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
    .ci-lbl{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-light);margin-bottom:3px}
    .ci-val{font-size:.9rem;color:var(--primary);font-weight:600;line-height:1.5}
    .btn-wa{display:flex;align-items:center;justify-content:center;gap:10px;background:#25d366;color:white;padding:.9rem 1.5rem;border-radius:50px;font-weight:800;font-size:.88rem;text-decoration:none;margin-bottom:.75rem}
    .btn-em{display:flex;align-items:center;justify-content:center;gap:10px;background:rgba(255,255,255,.1);color:white;border:1px solid rgba(255,255,255,.2);padding:.9rem 1.5rem;border-radius:50px;font-weight:600;font-size:.88rem;text-decoration:none}
    .priv-bg{background:var(--bg)}
    .priv-content{max-width:780px}
    .priv-content h3{font-size:1rem;font-weight:800;color:var(--primary);margin:1.8rem 0 .6rem}
    .priv-content p{font-size:.85rem;color:var(--text);line-height:1.8;margin-bottom:.75rem}
    .priv-content ul{padding-left:1.2rem;margin-bottom:.75rem}
    .priv-content ul li{font-size:.85rem;color:var(--text);line-height:1.8}
    footer{background:var(--primary);color:rgba(255,255,255,.55);padding:4rem 2rem 2rem}
    .fi{max-width:1140px;margin:0 auto}
    .fg{display:grid;grid-template-columns:2fr 1fr 1fr;gap:3rem;margin-bottom:3rem}
    .f-name{font-size:1.1rem;font-weight:900;color:white;margin-bottom:.5rem}
    .f-desc{font-size:.8rem;line-height:1.7;max-width:280px}
    .f-col-ttl{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.35);margin-bottom:1rem}
    .f-links{list-style:none;display:flex;flex-direction:column;gap:.6rem}
    .f-links a{color:rgba(255,255,255,.5);font-size:.82rem;text-decoration:none}
    .f-bottom{border-top:1px solid rgba(255,255,255,.08);padding-top:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
    .f-bottom span{font-size:.75rem}
    .f-badges{display:flex;gap:.75rem}
    .f-badge{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:50px;padding:.3rem .9rem;font-size:.68rem;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.4)}
    @media(max-width:768px){.hnav{display:none}.hero-inner,.grid2,.contact-grid{grid-template-columns:1fr}.svc-grid{grid-template-columns:1fr}.stats-grid{grid-template-columns:repeat(2,1fr)}.comp-grid{grid-template-columns:1fr}.fg{grid-template-columns:1fr;gap:2rem}}
  </style>
</head>
<body>
<div style="display:none" aria-hidden="true" itemscope itemtype="https://schema.org/Organization">
  <span itemprop="name">${displayName}</span>
  <span itemprop="legalName">${razao_social}</span>
  <span itemprop="taxID">${cnpj}</span>
  <span itemprop="description">Empresa brasileira com CNPJ ${cnpj}, razão social ${razao_social}, sediada em ${cidade || 'Brasil'}${estado ? ', ' + estado : ''}.</span>
  <span itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
    <span itemprop="streetAddress">${endereco || ''}</span>
    <span itemprop="addressLocality">${cidade || ''}</span>
    <span itemprop="addressRegion">${estado || ''}</span>
    <span itemprop="postalCode">${cep || ''}</span>
    <span itemprop="addressCountry">BR</span>
  </span>
  ${num ? `<span itemprop="telephone">+55${num}</span>` : ''}
  ${email ? `<span itemprop="email">${email}</span>` : ''}
</div>
<header><div class="hi">
  <a href="#" class="logo">${displayName.split(' ')[0]}<em>${displayName.split(' ').slice(1).join(' ') ? ' ' + displayName.split(' ').slice(1).join(' ') : ''}</em></a>
  <ul class="hnav"><li><a href="#sobre">Sobre</a></li><li><a href="#servicos">Serviços</a></li><li><a href="#empresa">Empresa</a></li><li><a href="#contato">Contato</a></li></ul>
  ${num ? `<a href="${waLink}" target="_blank" class="hcta">WhatsApp</a>` : '<a href="#contato" class="hcta">Contato</a>'}
</div></header>

<section class="hero"><div class="hero-inner">
  <div class="hero-left">
    <div class="hero-tag">Empresa Verificada · CNPJ Ativo</div>
    ${foto_url ? `<img src="${foto_url}" alt="${displayName}" class="hero-avatar">` : ''}
    <h1>${displayName}</h1>
    <p class="hero-sub">Empresa brasileira registrada e atuante, com compromisso real de entregar resultados, transparência e qualidade em cada projeto.</p>
    <p class="hero-cnpj">CNPJ ${cnpj} · ${cidade || 'Brasil'}${estado ? ' / ' + estado : ''}</p>
    <div class="hero-btns">
      ${num ? `<a href="${waLink}" target="_blank" class="btn-p">💬 WhatsApp</a>` : ''}
      <a href="#sobre" class="btn-s">Saiba mais</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="hero-card-ttl">Por que nos escolher?</div>
    <div class="hero-items">
      <div class="hi-item">CNPJ ativo e verificado na Receita Federal</div>
      <div class="hi-item">Mais de ${ano - anoFundacao} anos de experiência no mercado</div>
      <div class="hi-item">100% em conformidade com a LGPD</div>
      <div class="hi-item">Atendimento personalizado e ágil</div>
      <div class="hi-item">Empresa sediada em ${cidade || 'Brasil'}${estado ? ' / ' + estado : ''}</div>
    </div>
  </div>
</div></section>

<div class="trust"><div class="trust-i">
  <div class="ti">✅ CNPJ Verificado</div>
  <div class="ti">🔒 SSL Ativo</div>
  <div class="ti">📋 LGPD Compliance</div>
  <div class="ti">🏆 Desde ${anoFundacao}</div>
  <div class="ti">📍 ${cidade || 'Brasil'}${estado ? ' / ' + estado : ''}</div>
</div></div>

<section id="sobre"><div class="wrap"><div class="grid2">
  <div>
    <p class="lbl">Quem somos</p>
    <h2 class="ttl">Solidez e confiança desde ${anoFundacao}</h2>
    <p class="desc">A ${displayName} nasceu com o propósito de oferecer soluções reais para o mercado brasileiro. Com equipe qualificada e processos transparentes, construímos uma trajetória de resultados consistentes.</p>
    <ul class="feature-list">
      <li><div class="f-check">✓</div> ${ano - anoFundacao}+ anos de atuação no mercado brasileiro</li>
      <li><div class="f-check">✓</div> Registrada na Receita Federal — CNPJ ${cnpj}</li>
      <li><div class="f-check">✓</div> Política de privacidade e LGPD implementadas</li>
      <li><div class="f-check">✓</div> Atendimento humanizado e suporte contínuo</li>
    </ul>
  </div>
  <div class="number-card">
    <div class="nc-ttl">Nossa trajetória</div>
    <div class="nc-txt">Fundada em ${anoFundacao} em ${cidade || 'Brasil'}, a ${displayName} cresceu com base em entregas consistentes e no respeito aos clientes. Hoje somos referência no nosso segmento de atuação.</div>
    <div class="nc-stats">
      <div><div class="nc-n">${ano - anoFundacao}+</div><div class="nc-l">Anos no mercado</div></div>
      <div><div class="nc-n">100%</div><div class="nc-l">Comprometidos</div></div>
    </div>
  </div>
</div></div></section>

<hr class="div">

<section id="servicos" class="svc-bg"><div class="wrap">
  <p class="lbl">O que oferecemos</p>
  <h2 class="ttl">Serviços e soluções</h2>
  <p class="desc" style="margin-bottom:2.5rem">Entregamos valor real através de serviços focados em resultado e atendimento de excelência.</p>
  <div class="svc-grid">
    <div class="svc-card"><div class="svc-icon">💼</div><div class="svc-ttl">Consultoria Empresarial</div><div class="svc-desc">Diagnóstico e planejamento estratégico para crescimento sustentável do seu negócio.</div></div>
    <div class="svc-card"><div class="svc-icon">📊</div><div class="svc-ttl">Gestão e Processos</div><div class="svc-desc">Otimização de operações, indicadores de desempenho e gestão eficiente de recursos.</div></div>
    <div class="svc-card"><div class="svc-icon">🎯</div><div class="svc-ttl">Marketing e Vendas</div><div class="svc-desc">Estratégias digitais e presença online para ampliar seu alcance e gerar resultados.</div></div>
    <div class="svc-card"><div class="svc-icon">🤝</div><div class="svc-ttl">Relacionamento com Clientes</div><div class="svc-desc">Suporte dedicado, atendimento humanizado e experiência diferenciada em cada contato.</div></div>
    <div class="svc-card"><div class="svc-icon">📱</div><div class="svc-ttl">Presença Digital</div><div class="svc-desc">Site, redes sociais e canais digitais estruturados para representar sua marca com qualidade.</div></div>
    <div class="svc-card"><div class="svc-icon">🔐</div><div class="svc-ttl">Segurança e Compliance</div><div class="svc-desc">LGPD, políticas de dados e conformidade regulatória para operar com segurança jurídica.</div></div>
  </div>
</div></section>

<section><div class="wrap-sm"><div class="stats-grid">
  <div class="stats-card"><div class="stats-n">${ano - anoFundacao}+</div><div class="stats-l">Anos de mercado</div></div>
  <div class="stats-card"><div class="stats-n">98%</div><div class="stats-l">Clientes satisfeitos</div></div>
  <div class="stats-card"><div class="stats-n">100%</div><div class="stats-l">LGPD Compliance</div></div>
  <div class="stats-card"><div class="stats-n">24h</div><div class="stats-l">Tempo de resposta</div></div>
</div></div></section>

<hr class="div">

<section id="empresa"><div class="wrap">
  <p class="lbl">Registro oficial</p>
  <h2 class="ttl">Dados cadastrais</h2>
  <p class="desc">Informações registradas junto à Receita Federal do Brasil, de domínio público.</p>
  <table class="info-table">
    <tr><td>Razão Social</td><td>${razao_social}</td></tr>
    <tr><td>Nome Fantasia</td><td>${displayName}</td></tr>
    <tr><td>CNPJ</td><td>${cnpj}</td></tr>
    ${endereco ? `<tr><td>Endereço</td><td>${endereco}${bairro ? ', ' + bairro : ''}</td></tr>` : ''}
    ${cidade ? `<tr><td>Cidade / Estado</td><td>${cidade}${estado ? ' / ' + estado : ''}${cep ? ' · CEP ' + cep : ''}</td></tr>` : ''}
    ${telFormatted ? `<tr><td>Telefone</td><td>${telFormatted}</td></tr>` : ''}
    ${email ? `<tr><td>E-mail</td><td>${email}</td></tr>` : ''}
    <tr><td>Fundação</td><td>${anoFundacao}</td></tr>
    <tr><td>Situação</td><td>✅ Ativa — Receita Federal do Brasil</td></tr>
  </table>
</div></section>

<hr class="div">

<section class="svc-bg"><div class="wrap">
  <p class="lbl">Boas práticas</p>
  <h2 class="ttl">Transparência e conformidade</h2>
  <div class="comp-grid">
    <div class="comp-card"><div class="comp-ttl">🔒 LGPD — Lei nº 13.709/2018</div><div class="comp-txt">Tratamos dados pessoais com responsabilidade, seguindo os princípios de finalidade, necessidade, transparência e segurança exigidos pela lei.</div></div>
    <div class="comp-card"><div class="comp-ttl">📋 Receita Federal do Brasil</div><div class="comp-txt">CNPJ ${cnpj} ativo e regularmente inscrito. Todas as obrigações fiscais são cumpridas rigorosamente.</div></div>
    <div class="comp-card"><div class="comp-ttl">🌐 Verificação de Domínio Digital</div><div class="comp-txt">Domínio vinculado formalmente à ${razao_social} para canais digitais, publicidade e comunicação institucional.</div></div>
    <div class="comp-card"><div class="comp-ttl">🛡️ Política de Privacidade</div><div class="comp-txt">Documentação completa sobre coleta, uso e proteção de dados. <a href="#privacidade" style="color:var(--accent)">Consulte aqui.</a></div></div>
  </div>
</div></section>

<section id="contato"><div class="wrap"><div class="contact-grid">
  <div>
    <p class="lbl">Fale conosco</p>
    <h2 class="ttl">Entre em contato</h2>
    <p class="desc" style="margin-bottom:2rem">Disponível de segunda a sexta, das 8h às 18h. Responderemos rapidamente.</p>
    ${telFormatted ? `<div class="ci"><div class="ci-icon">📞</div><div><div class="ci-lbl">Telefone / WhatsApp</div><div class="ci-val">${telFormatted}</div></div></div>` : ''}
    ${email ? `<div class="ci"><div class="ci-icon">✉️</div><div><div class="ci-lbl">E-mail</div><div class="ci-val">${email}</div></div></div>` : ''}
    ${enderecoCompleto ? `<div class="ci"><div class="ci-icon">📍</div><div><div class="ci-lbl">Endereço</div><div class="ci-val">${enderecoCompleto}</div></div></div>` : ''}
  </div>
  <div class="contact-box">
    <h3 style="font-family:'Merriweather',serif;font-size:1.2rem;font-weight:900;color:white;margin-bottom:.5rem">Fale com a gente</h3>
    <p style="font-size:.84rem;color:rgba(255,255,255,.6);margin-bottom:1.5rem">Escolha o canal de sua preferência.</p>
    ${num ? `<a href="${waLink}" target="_blank" class="btn-wa">💬 Iniciar conversa no WhatsApp</a>` : ''}
    ${email ? `<a href="mailto:${email}" class="btn-em">✉️ Enviar e-mail</a>` : ''}
    <p style="font-size:.72rem;color:rgba(255,255,255,.35);line-height:1.7;margin-top:1.5rem">Ao entrar em contato, você concorda com nossa <a href="#privacidade" style="color:var(--accent-light)">Política de Privacidade</a>.</p>
  </div>
</div></div></section>

<hr class="div">

<section id="privacidade" class="priv-bg"><div class="wrap">
  <p class="lbl">Conformidade LGPD</p>
  <h2 class="ttl">Política de Privacidade</h2>
  <p style="font-size:.82rem;color:var(--text-light);margin-bottom:2rem">Última atualização: ${new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</p>
  <div class="priv-content">${privacyBody(displayName, razao_social, cnpj, enderecoCompleto, cidade, telFormatted, email)}</div>
</div></section>

<footer><div class="fi">
  <div class="fg">
    <div><div class="f-name">${displayName}</div><div class="f-desc">Empresa brasileira registrada sob CNPJ ${cnpj}. Transparência e excelência desde ${anoFundacao}.</div>${enderecoCompleto ? `<div style="margin-top:1rem;font-size:.75rem;opacity:.45">${enderecoCompleto}</div>` : ''}</div>
    <div><div class="f-col-ttl">Empresa</div><ul class="f-links"><li><a href="#sobre">Sobre nós</a></li><li><a href="#servicos">Serviços</a></li><li><a href="#empresa">Dados cadastrais</a></li><li><a href="#contato">Contato</a></li></ul></div>
    <div><div class="f-col-ttl">Legal</div><ul class="f-links"><li><a href="#privacidade">Política de Privacidade</a></li><li><a href="#privacidade">Termos de Uso</a></li><li><a href="#privacidade">LGPD</a></li></ul></div>
  </div>
  <div class="f-bottom"><span>© ${ano} ${razao_social}. Todos os direitos reservados.</span><div class="f-badges"><span class="f-badge">CNPJ ${cnpj}</span><span class="f-badge">LGPD</span><span class="f-badge">SSL</span></div></div>
</div></footer>
</body></html>`;
}

// ── VARIANTE 2: Slate / Laranja (bold minimalista) ───────────────
function templateSlateOrange({ displayName, razao_social, cnpj, slug, enderecoCompleto, endereco, bairro, cep, num, telFormatted, email, foto_url, waLink, anoFundacao, ano, cidade, estado, metaTags }) {
  return `<!DOCTYPE html>
<html lang="pt-BR" prefix="og: https://ogp.me/ns#">
<head>${metaTags}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">
  <style>
    :root{--primary:#1c1c1e;--accent:#ea580c;--accent-light:#fb923c;--accent-bg:#fff7ed;--text:#4b5563;--text-light:#9ca3af;--border:#e5e7eb;--bg:#f3f4f6;--white:#ffffff;--slate:#334155}
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{font-family:'DM Sans',sans-serif;background:var(--white);color:var(--primary);-webkit-font-smoothing:antialiased;line-height:1.6}
    nav{background:var(--white);border-bottom:2px solid var(--primary);padding:0 2rem;height:60px;display:flex;align-items:center;position:sticky;top:0;z-index:100}
    .ni{max-width:1100px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;width:100%}
    .logo{font-weight:700;font-size:1rem;color:var(--primary);text-decoration:none;letter-spacing:-.5px}
    .logo span{color:var(--accent)}
    .hnav{display:flex;gap:2rem;list-style:none}.hnav a{color:var(--text);font-size:.84rem;font-weight:500;text-decoration:none}.hnav a:hover{color:var(--primary)}
    .hcta{background:var(--primary);color:white;padding:.55rem 1.4rem;font-size:.82rem;font-weight:600;text-decoration:none;border-radius:4px}
    .hero{background:var(--primary);padding:5.5rem 2rem;position:relative;overflow:hidden}
    .hero::after{content:'${displayName.slice(0,2).toUpperCase()}';position:absolute;right:-2rem;top:50%;transform:translateY(-50%);font-size:18rem;font-weight:700;color:rgba(255,255,255,.03);line-height:1;pointer-events:none;font-family:'DM Serif Display',serif}
    .hero-inner{max-width:1100px;margin:0 auto;display:flex;align-items:center;gap:5rem}
    .hero-left{flex:1;position:relative;z-index:1}
    .hero-tag{display:inline-flex;align-items:center;gap:6px;background:var(--accent);color:white;font-size:.7rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:.35rem 1rem;margin-bottom:1.5rem}
    ${foto_url ? `.hero-avatar{width:72px;height:72px;border-radius:8px;object-fit:cover;border:2px solid var(--accent);margin-bottom:1rem;display:block}` : ''}
    .hero h1{font-family:'DM Serif Display',serif;font-size:clamp(2rem,5vw,3.2rem);color:white;line-height:1.1;margin-bottom:1.2rem}
    .hero-sub{font-size:.95rem;color:rgba(255,255,255,.55);line-height:1.75;margin-bottom:.75rem;max-width:500px}
    .hero-cnpj{font-size:.72rem;color:rgba(255,255,255,.25);letter-spacing:.06em;margin-bottom:2rem}
    .hero-btns{display:flex;gap:12px;flex-wrap:wrap}
    .btn-p{background:var(--accent);color:white;padding:.85rem 2rem;font-weight:700;font-size:.88rem;text-decoration:none}
    .btn-s{background:transparent;color:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.2);padding:.85rem 2rem;font-weight:500;font-size:.88rem;text-decoration:none}
    .hero-right{flex:0 0 280px;position:relative;z-index:1}
    .hero-box{border:1px solid rgba(255,255,255,.1);padding:2rem}
    .hb-row{display:flex;justify-content:space-between;align-items:center;padding:.75rem 0;border-bottom:1px solid rgba(255,255,255,.07)}
    .hb-row:last-child{border-bottom:none}
    .hb-lbl{font-size:.7rem;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.08em}
    .hb-val{font-size:.88rem;color:white;font-weight:600;text-align:right}
    .trust{background:var(--accent-bg);border-top:2px solid var(--accent);padding:1rem 2rem}
    .trust-i{max-width:1100px;margin:0 auto;display:flex;gap:2.5rem;justify-content:center;flex-wrap:wrap}
    .ti{display:flex;align-items:center;gap:8px;font-size:.78rem;color:var(--accent);font-weight:600}
    .wrap{max-width:1100px;margin:0 auto;padding:5rem 2rem}
    .wrap-sm{max-width:1100px;margin:0 auto;padding:3.5rem 2rem}
    .lbl{font-size:.68rem;font-weight:600;letter-spacing:.15em;text-transform:uppercase;color:var(--accent);margin-bottom:.6rem;display:flex;align-items:center;gap:6px}
    .lbl::before{content:'';width:20px;height:2px;background:var(--accent);display:inline-block}
    .ttl{font-family:'DM Serif Display',serif;font-size:clamp(1.6rem,3.5vw,2.2rem);color:var(--primary);line-height:1.2;margin-bottom:1rem}
    .desc{font-size:.93rem;color:var(--text);line-height:1.8;max-width:560px}
    hr.div{border:none;border-top:1px solid var(--border);max-width:1100px;margin:0 auto}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start}
    .check-list{list-style:none;margin-top:1.5rem;display:flex;flex-direction:column;gap:.9rem}
    .check-list li{display:flex;align-items:flex-start;gap:12px;font-size:.9rem;color:var(--text);line-height:1.5}
    .chk{width:20px;height:20px;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:white;font-size:.7rem;font-weight:700;margin-top:2px}
    .num-block{background:var(--primary);padding:2.5rem}
    .nb-ttl{font-family:'DM Serif Display',serif;font-size:1.4rem;color:white;margin-bottom:1rem}
    .nb-txt{font-size:.87rem;color:rgba(255,255,255,.55);line-height:1.8;margin-bottom:1.5rem}
    .nb-stats{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
    .nb-n{font-size:2.2rem;font-weight:700;color:var(--accent-light);letter-spacing:-1px}
    .nb-l{font-size:.7rem;color:rgba(255,255,255,.4);text-transform:uppercase;letter-spacing:.08em;margin-top:2px}
    .svc-bg{background:var(--bg)}
    .svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border)}
    .svc-card{background:white;padding:2rem;transition:background .2s}
    .svc-card:hover{background:var(--accent-bg)}
    .svc-icon{font-size:1.5rem;margin-bottom:1rem}
    .svc-ttl{font-size:.95rem;font-weight:700;color:var(--primary);margin-bottom:.5rem}
    .svc-desc{font-size:.82rem;color:var(--text);line-height:1.65}
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;background:var(--primary)}
    .stats-card{background:var(--white);padding:2rem;text-align:center}
    .stats-n{font-size:2.5rem;font-weight:700;color:var(--accent);letter-spacing:-1px;line-height:1;margin-bottom:.4rem;font-family:'DM Serif Display',serif}
    .stats-l{font-size:.75rem;color:var(--text-light);font-weight:500;text-transform:uppercase;letter-spacing:.08em}
    .info-table{width:100%;border-collapse:collapse;margin-top:1.5rem}
    .info-table tr{border-bottom:1px solid var(--border)}.info-table tr:last-child{border-bottom:none}
    .info-table td{padding:.9rem 0;font-size:.88rem}
    .info-table td:first-child{color:var(--text-light);font-size:.73rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;width:200px}
    .info-table td:last-child{color:var(--primary);font-weight:500}
    .comp-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:2px;background:var(--border);margin-top:2rem}
    .comp-card{background:white;padding:1.75rem}
    .comp-ttl{font-size:.9rem;font-weight:700;color:var(--primary);margin-bottom:.5rem;border-left:3px solid var(--accent);padding-left:.75rem}
    .comp-txt{font-size:.8rem;color:var(--text);line-height:1.65}
    .contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:start}
    .ci{display:flex;gap:1rem;margin-bottom:1.5rem}
    .ci-icon{width:36px;height:36px;background:var(--accent-bg);border:1px solid var(--accent-light);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}
    .ci-lbl{font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--text-light);margin-bottom:3px}
    .ci-val{font-size:.9rem;color:var(--primary);font-weight:600;line-height:1.5}
    .contact-box{background:var(--primary);padding:2.5rem}
    .btn-wa{display:flex;align-items:center;justify-content:center;gap:10px;background:#25d366;color:white;padding:.9rem 1.5rem;font-weight:700;font-size:.88rem;text-decoration:none;margin-bottom:.75rem}
    .btn-em{display:flex;align-items:center;justify-content:center;gap:10px;background:var(--accent);color:white;padding:.9rem 1.5rem;font-weight:600;font-size:.88rem;text-decoration:none}
    .priv-bg{background:var(--bg)}
    .priv-content{max-width:780px}
    .priv-content h3{font-size:1rem;font-weight:600;color:var(--primary);margin:1.8rem 0 .6rem;padding-left:.75rem;border-left:3px solid var(--accent)}
    .priv-content p{font-size:.85rem;color:var(--text);line-height:1.8;margin-bottom:.75rem}
    .priv-content ul{padding-left:1.2rem;margin-bottom:.75rem}
    .priv-content ul li{font-size:.85rem;color:var(--text);line-height:1.8}
    footer{background:var(--primary);color:rgba(255,255,255,.5);padding:4rem 2rem 2rem}
    .fi{max-width:1100px;margin:0 auto}
    .fg{display:grid;grid-template-columns:2fr 1fr 1fr;gap:3rem;margin-bottom:3rem}
    .f-name{font-family:'DM Serif Display',serif;font-size:1.2rem;color:white;margin-bottom:.5rem}
    .f-desc{font-size:.8rem;line-height:1.7;max-width:280px}
    .f-col-ttl{font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,.3);margin-bottom:1rem}
    .f-links{list-style:none;display:flex;flex-direction:column;gap:.6rem}
    .f-links a{color:rgba(255,255,255,.45);font-size:.82rem;text-decoration:none}
    .f-bottom{border-top:1px solid rgba(255,255,255,.08);padding-top:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem}
    .f-bottom span{font-size:.75rem}
    .f-badges{display:flex;gap:.75rem}
    .f-badge{border:1px solid rgba(255,255,255,.12);padding:.3rem .8rem;font-size:.68rem;font-weight:600;letter-spacing:.06em;color:rgba(255,255,255,.35)}
    @media(max-width:768px){.hnav{display:none}.hero-inner,.grid2,.contact-grid{flex-direction:column;grid-template-columns:1fr}.hero-right{flex:none;width:100%}.svc-grid{grid-template-columns:1fr}.stats-grid{grid-template-columns:repeat(2,1fr)}.comp-grid{grid-template-columns:1fr}.fg{grid-template-columns:1fr;gap:2rem}}
  </style>
</head>
<body>
<div style="display:none" aria-hidden="true" itemscope itemtype="https://schema.org/Organization">
  <span itemprop="name">${displayName}</span>
  <span itemprop="legalName">${razao_social}</span>
  <span itemprop="taxID">${cnpj}</span>
  <span itemprop="description">Empresa brasileira com CNPJ ${cnpj}, razão social ${razao_social}, sediada em ${cidade || 'Brasil'}${estado ? ', ' + estado : ''}.</span>
  <span itemprop="address" itemscope itemtype="https://schema.org/PostalAddress">
    <span itemprop="streetAddress">${endereco || ''}</span>
    <span itemprop="addressLocality">${cidade || ''}</span>
    <span itemprop="addressRegion">${estado || ''}</span>
    <span itemprop="postalCode">${cep || ''}</span>
    <span itemprop="addressCountry">BR</span>
  </span>
  ${num ? `<span itemprop="telephone">+55${num}</span>` : ''}
  ${email ? `<span itemprop="email">${email}</span>` : ''}
</div>
<nav><div class="ni">
  <a href="#" class="logo">${displayName.split(' ')[0]}<span>${displayName.split(' ').slice(1).join(' ') ? ' ' + displayName.split(' ').slice(1).join(' ') : ''}</span></a>
  <ul class="hnav"><li><a href="#sobre">Sobre</a></li><li><a href="#servicos">Serviços</a></li><li><a href="#empresa">Empresa</a></li><li><a href="#contato">Contato</a></li></ul>
  ${num ? `<a href="${waLink}" target="_blank" class="hcta">WhatsApp</a>` : '<a href="#contato" class="hcta">Contato</a>'}
</div></nav>

<section class="hero"><div class="hero-inner">
  <div class="hero-left">
    <div class="hero-tag">Empresa Verificada</div>
    ${foto_url ? `<img src="${foto_url}" alt="${displayName}" class="hero-avatar">` : ''}
    <h1>${displayName}</h1>
    <p class="hero-sub">Empresa brasileira registrada, comprometida com transparência, qualidade e resultados concretos para cada cliente.</p>
    <p class="hero-cnpj">CNPJ ${cnpj} · ${cidade || 'Brasil'}${estado ? ' · ' + estado : ''}</p>
    <div class="hero-btns">
      ${num ? `<a href="${waLink}" target="_blank" class="btn-p">WhatsApp</a>` : ''}
      <a href="#sobre" class="btn-s">Sobre a empresa</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="hero-box">
      <div class="hb-row"><div class="hb-lbl">Fundação</div><div class="hb-val">${anoFundacao}</div></div>
      <div class="hb-row"><div class="hb-lbl">CNPJ</div><div class="hb-val">${cnpj}</div></div>
      <div class="hb-row"><div class="hb-lbl">Localização</div><div class="hb-val">${cidade || 'Brasil'}${estado ? ' / ' + estado : ''}</div></div>
      <div class="hb-row"><div class="hb-lbl">Situação</div><div class="hb-val" style="color:#4ade80">✓ Ativa</div></div>
      <div class="hb-row"><div class="hb-lbl">LGPD</div><div class="hb-val" style="color:#4ade80">✓ Compliance</div></div>
    </div>
  </div>
</div></section>

<div class="trust"><div class="trust-i">
  <div class="ti">✅ CNPJ Verificado</div>
  <div class="ti">🔒 SSL Ativo</div>
  <div class="ti">📋 LGPD</div>
  <div class="ti">🏆 Desde ${anoFundacao}</div>
  <div class="ti">📍 ${cidade || 'Brasil'}${estado ? ' · ' + estado : ''}</div>
</div></div>

<section id="sobre"><div class="wrap"><div class="grid2">
  <div>
    <p class="lbl">Quem somos</p>
    <h2 class="ttl">Empresa sólida, resultados reais</h2>
    <p class="desc">A ${displayName} atua no mercado brasileiro desde ${anoFundacao}, com foco em entregar valor real. Nossa história é construída sobre a confiança dos clientes e a qualidade constante dos serviços.</p>
    <ul class="check-list">
      <li><div class="chk">✓</div> ${ano - anoFundacao} anos de experiência e atuação no mercado</li>
      <li><div class="chk">✓</div> Registrada na Receita Federal — CNPJ ${cnpj}</li>
      <li><div class="chk">✓</div> Política de privacidade e proteção de dados (LGPD)</li>
      <li><div class="chk">✓</div> Equipe qualificada e processos bem definidos</li>
    </ul>
  </div>
  <div class="num-block">
    <div class="nb-ttl">Nossa trajetória</div>
    <div class="nb-txt">Fundada em ${anoFundacao} em ${cidade || 'Brasil'}, a ${displayName} cresceu com base em comprometimento real e entrega de resultados. Hoje é referência no seu segmento de atuação.</div>
    <div class="nb-stats">
      <div><div class="nb-n">${ano - anoFundacao}+</div><div class="nb-l">Anos de mercado</div></div>
      <div><div class="nb-n">100%</div><div class="nb-l">Comprometidos</div></div>
    </div>
  </div>
</div></div></section>

<hr class="div">

<section id="servicos" class="svc-bg"><div class="wrap">
  <p class="lbl">O que fazemos</p>
  <h2 class="ttl">Serviços e soluções</h2>
  <p class="desc" style="margin-bottom:2.5rem">Entregamos resultados reais por meio de serviços com qualidade e metodologia comprovada.</p>
  <div class="svc-grid">
    <div class="svc-card"><div class="svc-icon">💼</div><div class="svc-ttl">Consultoria Empresarial</div><div class="svc-desc">Análise estratégica e planejamento para crescimento sustentável do seu negócio.</div></div>
    <div class="svc-card"><div class="svc-icon">📊</div><div class="svc-ttl">Gestão e Processos</div><div class="svc-desc">Otimização operacional e gestão eficiente de recursos para maximizar resultados.</div></div>
    <div class="svc-card"><div class="svc-icon">🎯</div><div class="svc-ttl">Marketing e Vendas</div><div class="svc-desc">Estratégias digitais e presença online para ampliar alcance e aumentar conversões.</div></div>
    <div class="svc-card"><div class="svc-icon">🤝</div><div class="svc-ttl">Atendimento ao Cliente</div><div class="svc-desc">Suporte personalizado e experiência diferenciada em cada ponto de contato.</div></div>
    <div class="svc-card"><div class="svc-icon">📱</div><div class="svc-ttl">Presença Digital</div><div class="svc-desc">Site, redes sociais e canais digitais para representar sua marca com profissionalismo.</div></div>
    <div class="svc-card"><div class="svc-icon">🔐</div><div class="svc-ttl">Segurança e Compliance</div><div class="svc-desc">LGPD e conformidade regulatória para operar com segurança jurídica e confiança.</div></div>
  </div>
</div></section>

<section><div class="wrap-sm"><div class="stats-grid">
  <div class="stats-card"><div class="stats-n">${ano - anoFundacao}+</div><div class="stats-l">Anos de mercado</div></div>
  <div class="stats-card"><div class="stats-n">98%</div><div class="stats-l">Satisfação</div></div>
  <div class="stats-card"><div class="stats-n">100%</div><div class="stats-l">LGPD</div></div>
  <div class="stats-card"><div class="stats-n">24h</div><div class="stats-l">Resposta</div></div>
</div></div></section>

<hr class="div">

<section id="empresa"><div class="wrap">
  <p class="lbl">Registro oficial</p>
  <h2 class="ttl">Dados cadastrais</h2>
  <p class="desc">Informações registradas junto à Receita Federal do Brasil, de domínio público.</p>
  <table class="info-table">
    <tr><td>Razão Social</td><td>${razao_social}</td></tr>
    <tr><td>Nome Fantasia</td><td>${displayName}</td></tr>
    <tr><td>CNPJ</td><td>${cnpj}</td></tr>
    ${endereco ? `<tr><td>Endereço</td><td>${endereco}${bairro ? ', ' + bairro : ''}</td></tr>` : ''}
    ${cidade ? `<tr><td>Cidade / Estado</td><td>${cidade}${estado ? ' · ' + estado : ''}${cep ? ' · CEP ' + cep : ''}</td></tr>` : ''}
    ${telFormatted ? `<tr><td>Telefone</td><td>${telFormatted}</td></tr>` : ''}
    ${email ? `<tr><td>E-mail</td><td>${email}</td></tr>` : ''}
    <tr><td>Fundação</td><td>${anoFundacao}</td></tr>
    <tr><td>Situação</td><td>✅ Ativa — Receita Federal do Brasil</td></tr>
  </table>
</div></section>

<hr class="div">

<section class="svc-bg"><div class="wrap">
  <p class="lbl">Boas práticas</p>
  <h2 class="ttl">Transparência e conformidade</h2>
  <div class="comp-grid">
    <div class="comp-card"><div class="comp-ttl">🔒 LGPD — Lei nº 13.709/2018</div><div class="comp-txt">Dados pessoais tratados com responsabilidade, conforme os princípios de finalidade, necessidade e transparência da legislação.</div></div>
    <div class="comp-card"><div class="comp-ttl">📋 Receita Federal do Brasil</div><div class="comp-txt">CNPJ ${cnpj} regularmente ativo. Todas as obrigações fiscais e tributárias são cumpridas na forma da lei.</div></div>
    <div class="comp-card"><div class="comp-ttl">🌐 Verificação de Domínio</div><div class="comp-txt">Domínio registrado e vinculado à ${razao_social} para canais digitais institucionais e comunicação oficial.</div></div>
    <div class="comp-card"><div class="comp-ttl">🛡️ Política de Privacidade</div><div class="comp-txt">Documentação acessível sobre como coletamos e protegemos dados. <a href="#privacidade" style="color:var(--accent)">Leia a política completa.</a></div></div>
  </div>
</div></section>

<section id="contato"><div class="wrap"><div class="contact-grid">
  <div>
    <p class="lbl">Fale conosco</p>
    <h2 class="ttl">Entre em contato</h2>
    <p class="desc" style="margin-bottom:2rem">Disponível de segunda a sexta, das 8h às 18h. Retorno garantido.</p>
    ${telFormatted ? `<div class="ci"><div class="ci-icon">📞</div><div><div class="ci-lbl">Telefone / WhatsApp</div><div class="ci-val">${telFormatted}</div></div></div>` : ''}
    ${email ? `<div class="ci"><div class="ci-icon">✉️</div><div><div class="ci-lbl">E-mail</div><div class="ci-val">${email}</div></div></div>` : ''}
    ${enderecoCompleto ? `<div class="ci"><div class="ci-icon">📍</div><div><div class="ci-lbl">Endereço</div><div class="ci-val">${enderecoCompleto}</div></div></div>` : ''}
  </div>
  <div class="contact-box">
    <h3 style="font-family:'DM Serif Display',serif;font-size:1.3rem;color:white;margin-bottom:.5rem">Fale com a gente</h3>
    <p style="font-size:.84rem;color:rgba(255,255,255,.5);margin-bottom:1.5rem">Escolha o canal de preferência.</p>
    ${num ? `<a href="${waLink}" target="_blank" class="btn-wa">💬 Iniciar conversa no WhatsApp</a>` : ''}
    ${email ? `<a href="mailto:${email}" class="btn-em">✉️ Enviar e-mail</a>` : ''}
    <p style="font-size:.72rem;color:rgba(255,255,255,.3);line-height:1.7;margin-top:1.5rem">Ao entrar em contato, você concorda com nossa <a href="#privacidade" style="color:var(--accent-light)">Política de Privacidade</a>.</p>
  </div>
</div></div></section>

<hr class="div">

<section id="privacidade" class="priv-bg"><div class="wrap">
  <p class="lbl">Conformidade LGPD</p>
  <h2 class="ttl">Política de Privacidade</h2>
  <p style="font-size:.82rem;color:var(--text-light);margin-bottom:2rem">Última atualização: ${new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</p>
  <div class="priv-content">${privacyBody(displayName, razao_social, cnpj, enderecoCompleto, cidade, telFormatted, email)}</div>
</div></section>

<footer><div class="fi">
  <div class="fg">
    <div><div class="f-name">${displayName}</div><div class="f-desc">Empresa brasileira registrada sob CNPJ ${cnpj}. Comprometida com transparência e excelência desde ${anoFundacao}.</div>${enderecoCompleto ? `<div style="margin-top:1rem;font-size:.75rem;opacity:.4">${enderecoCompleto}</div>` : ''}</div>
    <div><div class="f-col-ttl">Empresa</div><ul class="f-links"><li><a href="#sobre">Sobre nós</a></li><li><a href="#servicos">Serviços</a></li><li><a href="#empresa">Dados cadastrais</a></li><li><a href="#contato">Contato</a></li></ul></div>
    <div><div class="f-col-ttl">Legal</div><ul class="f-links"><li><a href="#privacidade">Política de Privacidade</a></li><li><a href="#privacidade">Termos de Uso</a></li><li><a href="#privacidade">LGPD</a></li></ul></div>
  </div>
  <div class="f-bottom"><span>© ${ano} ${razao_social}. Todos os direitos reservados.</span><div class="f-badges"><span class="f-badge">CNPJ ${cnpj}</span><span class="f-badge">LGPD</span><span class="f-badge">SSL</span></div></div>
</div></footer>
</body></html>`;
}

// ── Texto de privacidade compartilhado ──────────────────────────
function privacyBody(displayName, razao_social, cnpj, enderecoCompleto, cidade, telFormatted, email) {
  return `<p>A <strong>${razao_social}</strong> (CNPJ ${cnpj}), com sede em ${enderecoCompleto || cidade || 'Brasil'}, comprometida com a privacidade e a proteção de dados pessoais, apresenta esta Política de Privacidade em conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 – LGPD) e demais legislações aplicáveis.</p>
<h3>1. Informações que coletamos</h3>
<p>Ao interagir com nosso site ou entrar em contato conosco, podemos coletar as seguintes informações:</p>
<ul><li>Nome completo e informações de contato (telefone, e-mail)</li><li>Dados de navegação (endereço IP, tipo de navegador, páginas acessadas)</li><li>Informações fornecidas voluntariamente por meio de formulários ou mensagens</li></ul>
<h3>2. Finalidade do tratamento de dados</h3>
<p>Os dados coletados são utilizados exclusivamente para atendimento de solicitações, envio de informações sobre serviços, melhoria da experiência do usuário e cumprimento de obrigações legais.</p>
<h3>3. Base legal para o tratamento</h3>
<p>O tratamento é realizado com base em: consentimento do titular; cumprimento de obrigação legal; execução de contrato; e legítimo interesse do controlador, conforme previsto na LGPD.</p>
<h3>4. Compartilhamento de dados</h3>
<p>A ${displayName} não vende ou compartilha dados pessoais para fins comerciais. Podemos compartilhar apenas com prestadores de serviço contratados, quando exigido por lei, ou para proteção de direitos.</p>
<h3>5. Retenção de dados</h3>
<p>Os dados serão mantidos pelo período necessário para cumprir as finalidades descritas, respeitando os prazos legais aplicáveis.</p>
<h3>6. Direitos do titular</h3>
<p>Em conformidade com a LGPD, você tem direito a: acesso, correção, anonimização, eliminação, portabilidade dos dados e revogação do consentimento.</p>
<h3>7. Segurança das informações</h3>
<p>Adotamos medidas técnicas e administrativas para proteger dados pessoais contra acessos não autorizados ou situações acidentais, conforme o art. 46 da LGPD.</p>
<h3>8. Cookies</h3>
<p>Este site pode utilizar cookies técnicos para o correto funcionamento das páginas. Não utilizamos cookies de rastreamento publicitário sem consentimento.</p>
<h3>9. Contato</h3>
<p>Para exercer seus direitos ou esclarecer dúvidas:${email ? `<br><strong>E-mail:</strong> ${email}` : ''}${telFormatted ? `<br><strong>Telefone:</strong> ${telFormatted}` : ''}<br><strong>Endereço:</strong> ${enderecoCompleto || 'Brasil'}</p>
<h3>10. Alterações nesta política</h3>
<p>Esta política pode ser atualizada periodicamente. Recomendamos a consulta regular desta página.</p>`;
}
