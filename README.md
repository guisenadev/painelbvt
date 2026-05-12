# ⚡ Site Factory — Cloudflare (100% gratuito)

Painel para criar sites automaticamente via GitHub + Cloudflare Pages.
Backend no Cloudflare Worker + banco D1. Frontend no Cloudflare Pages.

---

## Pré-requisitos

- Node.js instalado no seu PC
- Conta no Cloudflare (grátis)
- Conta no GitHub

---

## PASSO A PASSO COMPLETO

### 1. Instalar Wrangler (CLI do Cloudflare)

```bash
npm install -g wrangler
wrangler login
```

### 2. Criar o banco D1

```bash
cd worker
npm install
wrangler d1 create site-factory-db
```

Copie o `database_id` que aparecer e cole no `wrangler.toml`:
```toml
database_id = "COLE_O_ID_AQUI"
```

### 3. Criar o schema no banco

```bash
wrangler d1 execute site-factory-db --file=./schema.sql
```

### 4. Configurar as secrets (tokens)

```bash
wrangler secret put GITHUB_TOKEN
# Cole seu token do GitHub (github.com/settings/tokens → repo permission)

wrangler secret put CLOUDFLARE_API_TOKEN
# Cole seu token do Cloudflare (dash.cloudflare.com/profile/api-tokens → Cloudflare Pages Edit)

wrangler secret put CLOUDFLARE_ACCOUNT_ID
# Cole seu Account ID (visível em Workers & Pages no painel)
```

### 5. Editar wrangler.toml

Troque `SEU_USUARIO_GITHUB` pelo seu usuário real do GitHub.

### 6. Deploy do Worker

```bash
wrangler deploy
```

Vai aparecer a URL do worker, algo como:
`https://site-factory-worker.SEU_USUARIO.workers.dev`

### 7. Configurar o Frontend

Edite `frontend/src/App.js` linha 4:
```js
const API = 'https://site-factory-worker.SEU_USUARIO.workers.dev/api';
```

### 8. Build e deploy do Frontend (Cloudflare Pages)

```bash
cd ../frontend
npm install
npm run build
```

No painel do Cloudflare:
1. Workers & Pages → Create → Pages → Upload assets
2. Faça upload da pasta `build/`
3. Seu painel fica em: `https://site-factory-panel.pages.dev`

Pronto! Compartilhe o link do painel com sua equipe.

---

## Atualizações futuras

Quando quiser atualizar o painel:
```bash
cd frontend
npm run build
# Faça upload da pasta build/ novamente no Cloudflare Pages
```

Quando quiser atualizar o worker:
```bash
cd worker
wrangler deploy
```

---

## Estrutura

```
/site-factory-cf
  /worker
    wrangler.toml          → Config do Cloudflare Worker
    schema.sql             → Cria tabela no D1
    src/index.js           → API completa (CRUD + automação)
    src/template.js        → Gerador de HTML
  /frontend
    src/App.js             → Painel React completo
    public/index.html
```

## Limites gratuitos Cloudflare

| Recurso | Gratuito |
|---------|----------|
| Worker requests | 100k/dia |
| D1 reads | 5M/dia |
| D1 writes | 100k/dia |
| Pages deploys | Ilimitado |

Para 5 pessoas criando sites, está longe do limite.
