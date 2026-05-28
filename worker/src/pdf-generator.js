import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function fmtCnpj(s) {
  const d = (s || '').replace(/\D/g, '');
  if (d.length !== 14) return s || '';
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}
function fmtCep(s) {
  const d = (s || '').replace(/\D/g, '');
  if (d.length !== 8) return s || '';
  return `${d.slice(0,5)}-${d.slice(5)}`;
}
function fmtDate(s) {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(s);
}
function fmtPhone(s) {
  if (!s) return '';
  const d = s.replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return s;
}

const PORTE_ABREV = {
  'ME': 'ME', 'MICRO EMPRESA': 'ME', 'MICRO_EMPRESA': 'ME',
  'EPP': 'EPP', 'EMPRESA DE PEQUENO PORTE': 'EPP', 'PEQUENO_PORTE': 'EPP',
  'DEMAIS': 'DEMAIS', 'NAO_INFORMADO': '', 'NÃO INFORMADO': '',
};

export async function generateCnpjPdf(site, apiData) {
  const doc = await PDFDocument.create();
  const W = 595.28, H = 841.89;
  const page = doc.addPage([W, H]);

  const helv  = await doc.embedFont(StandardFonts.Helvetica);
  const helvB = await doc.embedFont(StandardFonts.HelveticaBold);
  const BLK = rgb(0, 0, 0);
  const GRY = rgb(0.35, 0.35, 0.35);

  const a   = apiData || {};
  const est = a.estabelecimento || {};

  // ── dados ───────────────────────────────────────────────────────
  const cnpj        = fmtCnpj(est.cnpj || site.cnpj);
  const tipo        = est.tipo === 'FILIAL' ? 'FILIAL' : 'MATRIZ';
  const dataAb      = fmtDate(est.data_inicio_atividade);
  // API de MEI prefixia razão social com o CNPJ — remove
  const razao       = (a.razao_social || site.razao_social || '')
                        .replace(/^\d{2}\.\d{3}\.\d{3}[/\-\d]*\s+/, '')
                        .replace(/^\d{8,14}\s+/, '');
  const fantasia    = est.nome_fantasia || '';
  const porteRaw    = ((a.porte?.id || a.porte?.descricao || '')).toUpperCase().trim();
  const porte       = PORTE_ABREV[porteRaw] ?? a.porte?.id ?? porteRaw;
  const atPrinc     = est.atividade_principal
    ? `${est.atividade_principal.subclasse || est.atividade_principal.id} - ${est.atividade_principal.descricao}`
    : '';
  const atSec       = (est.atividades_secundarias || []).slice(0, 4).map(
    at => `${at.subclasse || at.id} - ${at.descricao}`
  );
  const natJur      = a.natureza_juridica
    ? `${a.natureza_juridica.id} - ${a.natureza_juridica.descricao}` : '';
  const logradouro  = [est.tipo_logradouro, est.logradouro].filter(Boolean).join(' ') || site.endereco || '';
  const numero      = est.numero || '';
  const complemento = est.complemento || '';
  const cep         = fmtCep(est.cep || site.cep || '');
  const bairro      = est.bairro || site.bairro || '';
  const municipio   = est.cidade?.nome || site.cidade || '';
  const uf          = est.estado?.sigla || site.estado || '';
  const email       = est.email || site.email || '';
  const telefone    = fmtPhone(site.telefone || '');
  const efr         = a.responsavel_federativo || '*****';
  const situacao    = (est.situacao_cadastral || 'ATIVA').toUpperCase();
  const dataSit     = fmtDate(est.data_situacao_cadastral);
  const motivo      = est.motivo_situacao_cadastral || '';
  const sitEsp      = est.situacao_especial || '********';
  const dataSitEsp  = est.data_situacao_especial ? fmtDate(est.data_situacao_especial) : '********';

  // ── helpers de desenho ──────────────────────────────────────────
  const ML = 28, MR = W - 28;
  const CW = MR - ML;

  const lbl = (x, y, text, mw) =>
    page.drawText(text, { x, y, size: 5.5, font: helv, color: GRY, maxWidth: mw || (MR - x - 2) });

  const val = (x, y, text, opts = {}) => {
    if (!text && text !== 0) return;
    page.drawText(String(text), {
      x, y, size: opts.size || 8.5,
      font: opts.slim ? helv : helvB,  // tudo bold por padrão, igual ao original
      color: BLK, maxWidth: opts.mw || (MR - x - 2),
    });
  };

  const hl = (y, x1, x2) => page.drawLine({
    start: { x: x1 ?? ML, y }, end: { x: x2 ?? MR, y },
    thickness: 0.4, color: BLK,
  });
  const vl = (x, y1, y2) => page.drawLine({
    start: { x, y: y1 }, end: { x, y: y2 },
    thickness: 0.4, color: BLK,
  });

  // ── cabeçalho ───────────────────────────────────────────────────
  const HDR_Y = 762;
  const t1 = 'REPÚBLICA FEDERATIVA DO BRASIL';
  const t2 = 'CADASTRO NACIONAL DA PESSOA JURÍDICA';
  page.drawText(t1, { x: ML + (CW - helvB.widthOfTextAtSize(t1, 12)) / 2, y: HDR_Y,      size: 12, font: helvB, color: BLK });
  page.drawText(t2, { x: ML + (CW - helvB.widthOfTextAtSize(t2, 11)) / 2, y: HDR_Y - 18, size: 11, font: helvB, color: BLK });

  // ── linhas e colunas de cada linha ──────────────────────────────
  // Cada linha: [ top_y, height ]  — construímos de cima pra baixo
  const CARD_TOP = HDR_Y - 36; // 726

  // Row heights
  const RH = 28;
  const SEC_H = Math.max(RH, 14 + atSec.length * 11); // altura das secundárias

  let y = CARD_TOP; // cursor vertical

  // helper: inicia uma nova linha, desenha a separação horizontal, retorna posição do label e do valor
  const row = (h) => {
    const top = y;
    y -= h;
    hl(y); // linha inferior da linha
    return { top, bot: y };
  };

  // ── ROW 1: NÚMERO / COMPROVANTE / DATA ABERTURA ─────────────────
  const R1 = row(50);
  const R1_V1 = ML + 160, R1_V2 = ML + 398;
  vl(R1_V1, R1.bot, R1.top);
  vl(R1_V2, R1.bot, R1.top);
  lbl(ML + 2, R1.top - 8,  'NÚMERO DE INSCRIÇÃO');
  val(ML + 2, R1.top - 19, cnpj);
  val(ML + 2, R1.top - 30, tipo, { size: 8 });
  // título central
  const rt1 = 'COMPROVANTE DE INSCRIÇÃO E DE SITUAÇÃO';
  const rt2 = 'CADASTRAL';
  const cx = R1_V1 + (R1_V2 - R1_V1) / 2;
  page.drawText(rt1, { x: cx - helvB.widthOfTextAtSize(rt1, 9) / 2, y: R1.top - 19, size: 9, font: helvB, color: BLK });
  page.drawText(rt2, { x: cx - helvB.widthOfTextAtSize(rt2, 9) / 2, y: R1.top - 31, size: 9, font: helvB, color: BLK });
  lbl(R1_V2 + 2, R1.top - 8,  'DATA DE ABERTURA');
  val(R1_V2 + 2, R1.top - 19, dataAb);

  // ── ROW 2: NOME EMPRESARIAL ──────────────────────────────────────
  const R2 = row(RH);
  lbl(ML + 2, R2.top - 8,  'NOME EMPRESARIAL');
  val(ML + 2, R2.top - 19, razao, { mw: CW - 4 });

  // ── ROW 3: TÍTULO / PORTE ────────────────────────────────────────
  const R3 = row(RH);
  const PORTE_X = MR - 52;
  vl(PORTE_X, R3.bot, R3.top);
  lbl(ML + 2,     R3.top - 8,  'TÍTULO DO ESTABELECIMENTO (NOME DE FANTASIA)');
  val(ML + 2,     R3.top - 19, fantasia,  { mw: PORTE_X - ML - 4 });
  lbl(PORTE_X + 2, R3.top - 8, 'PORTE');
  val(PORTE_X + 2, R3.top - 19, porte,   { bold: true });

  // ── ROW 4: ATIVIDADE PRINCIPAL ───────────────────────────────────
  const R4 = row(RH);
  lbl(ML + 2, R4.top - 8,  'CÓDIGO E DESCRIÇÃO DA ATIVIDADE ECONÔMICA PRINCIPAL');
  val(ML + 2, R4.top - 19, atPrinc, { mw: CW - 4 });

  // ── ROW 5: ATIVIDADES SECUNDÁRIAS ────────────────────────────────
  const R5 = row(SEC_H);
  lbl(ML + 2, R5.top - 8,  'CÓDIGO E DESCRIÇÃO DAS ATIVIDADES ECONÔMICAS SECUNDÁRIAS');
  atSec.forEach((at, i) => val(ML + 2, R5.top - 19 - i * 11, at, { size: 8, mw: CW - 4 }));

  // ── ROW 6: NATUREZA JURÍDICA ──────────────────────────────────────
  const R6 = row(RH);
  lbl(ML + 2, R6.top - 8,  'CÓDIGO E DESCRIÇÃO DA NATUREZA JURÍDICA');
  val(ML + 2, R6.top - 19, natJur, { mw: CW - 4 });

  // ── ROW 7: LOGRADOURO / NÚMERO / COMPLEMENTO ─────────────────────
  const R7 = row(RH);
  const NUM_X = ML + 285, COMP_X = ML + 368;
  vl(NUM_X,  R7.bot, R7.top);
  vl(COMP_X, R7.bot, R7.top);
  lbl(ML + 2,     R7.top - 8,  'LOGRADOURO');
  val(ML + 2,     R7.top - 19, logradouro,              { mw: NUM_X - ML - 4 });
  lbl(NUM_X + 2,  R7.top - 8,  'NÚMERO');
  val(NUM_X + 2,  R7.top - 19, numero,                  { mw: COMP_X - NUM_X - 4 });
  lbl(COMP_X + 2, R7.top - 8,  'COMPLEMENTO');
  val(COMP_X + 2, R7.top - 19, complemento || '********', { mw: MR - COMP_X - 4 });

  // ── ROW 8: CEP / BAIRRO / MUNICÍPIO / UF ─────────────────────────
  const R8 = row(RH);
  const BAI_X = ML + 78, MUN_X = ML + 210, UF_X = MR - 38;
  vl(BAI_X, R8.bot, R8.top);
  vl(MUN_X, R8.bot, R8.top);
  vl(UF_X,  R8.bot, R8.top);
  lbl(ML + 2,    R8.top - 8,  'CEP');
  val(ML + 2,    R8.top - 19, cep,      { mw: BAI_X - ML - 4 });
  lbl(BAI_X + 2, R8.top - 8,  'BAIRRO/DISTRITO');
  val(BAI_X + 2, R8.top - 19, bairro,   { mw: MUN_X - BAI_X - 4 });
  lbl(MUN_X + 2, R8.top - 8,  'MUNICÍPIO');
  val(MUN_X + 2, R8.top - 19, municipio, { mw: UF_X - MUN_X - 4 });
  lbl(UF_X + 2,  R8.top - 8,  'UF');
  val(UF_X + 2,  R8.top - 19, uf);

  // ── ROW 9: EMAIL / TELEFONE ───────────────────────────────────────
  const R9 = row(RH);
  const TEL_X = ML + 285;
  vl(TEL_X, R9.bot, R9.top);
  lbl(ML + 2,    R9.top - 8,  'ENDEREÇO ELETRÔNICO');
  val(ML + 2,    R9.top - 19, email,    { mw: TEL_X - ML - 4 });
  lbl(TEL_X + 2, R9.top - 8,  'TELEFONE');
  val(TEL_X + 2, R9.top - 19, telefone, { mw: MR - TEL_X - 4 });

  // ── ROW 10: EFR ───────────────────────────────────────────────────
  const R10 = row(RH);
  lbl(ML + 2, R10.top - 8,  'ENTE FEDERATIVO RESPONSÁVEL (EFR)');
  val(ML + 2, R10.top - 19, efr, { mw: CW - 4 });

  // ── ROW 11: SITUAÇÃO / DATA DA SITUAÇÃO ───────────────────────────
  const R11 = row(RH);
  const DTSIT_X = ML + 285;
  vl(DTSIT_X, R11.bot, R11.top);
  lbl(ML + 2,      R11.top - 8,  'SITUAÇÃO CADASTRAL');
  val(ML + 2,      R11.top - 19, situacao, { size: 9 });
  lbl(DTSIT_X + 2, R11.top - 8,  'DATA DA SITUAÇÃO CADASTRAL');
  val(DTSIT_X + 2, R11.top - 19, dataSit);

  // ── ROW 12: MOTIVO ────────────────────────────────────────────────
  const R12 = row(RH);
  lbl(ML + 2, R12.top - 8,  'MOTIVO DE SITUAÇÃO CADASTRAL');
  val(ML + 2, R12.top - 19, motivo, { mw: CW - 4 });

  // ── ROW 13: SITUAÇÃO ESPECIAL / DATA ──────────────────────────────
  const R13 = row(RH);
  const DTSE_X = ML + 285;
  vl(DTSE_X, R13.bot, R13.top);
  lbl(ML + 2,      R13.top - 8,  'SITUAÇÃO ESPECIAL');
  val(ML + 2,      R13.top - 19, sitEsp,     { mw: DTSE_X - ML - 4 });
  lbl(DTSE_X + 2,  R13.top - 8,  'DATA DA SITUAÇÃO ESPECIAL');
  val(DTSE_X + 2,  R13.top - 19, dataSitEsp);

  // ── borda externa do cartão ───────────────────────────────────────
  const CARD_BOT = y; // y atual após todos os rows
  hl(CARD_TOP, ML, MR); // linha do topo (abaixo do cabeçalho)
  page.drawRectangle({
    x: ML, y: CARD_BOT,
    width: CW, height: CARD_TOP - CARD_BOT,
    borderColor: BLK, borderWidth: 0.5,
  });

  // ── rodapé ────────────────────────────────────────────────────────
  const now = new Date();
  const br = { timeZone: 'America/Sao_Paulo' };
  const dayStr  = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', ...br });
  const timeStr = now.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit', ...br });

  const foot1 = 'Aprovado pela Instrução Normativa RFB nº 2.119, de 06 de dezembro de 2022.';
  const foot2a = 'Emitido no dia ';
  const foot2b = `${dayStr} às ${timeStr}`;
  const foot2c = ' (data e hora de Brasília).';
  const FY = CARD_BOT - 18;
  page.drawText(foot1, { x: ML, y: FY,      size: 8, font: helv,  color: BLK });
  page.drawText(foot2a,{ x: ML, y: FY - 14, size: 8, font: helv,  color: BLK });
  const f2aW = helv.widthOfTextAtSize(foot2a, 8);
  page.drawText(foot2b, { x: ML + f2aW, y: FY - 14, size: 8, font: helvB, color: BLK });
  const f2bW = helvB.widthOfTextAtSize(foot2b, 8);
  page.drawText(foot2c, { x: ML + f2aW + f2bW, y: FY - 14, size: 8, font: helv, color: BLK });

  return doc.save();
}
