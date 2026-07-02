CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client',
  balance REAL NOT NULL DEFAULT 0,
  nome TEXT DEFAULT '',
  email_addr TEXT DEFAULT '',
  telefone TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  razao_social TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  endereco TEXT DEFAULT '',
  bairro TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  estado TEXT DEFAULT '',
  cep TEXT DEFAULT '',
  telefone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  nome_topo TEXT DEFAULT '',
  foto_url TEXT DEFAULT '',
  fb_verification TEXT DEFAULT '',
  dns_txt_verification TEXT DEFAULT '',
  atividade_principal TEXT DEFAULT '',
  data_abertura TEXT DEFAULT '',
  descricao TEXT DEFAULT '',
  repo_name TEXT,
  repo_url TEXT,
  site_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);

CREATE TABLE IF NOT EXISTS temp_email_addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  address TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS received_emails (
  id TEXT PRIMARY KEY,
  address TEXT NOT NULL,
  from_addr TEXT NOT NULL,
  subject TEXT DEFAULT '',
  body_text TEXT DEFAULT '',
  received_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_temp_addrs_user ON temp_email_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_received_emails_addr ON received_emails(address);
