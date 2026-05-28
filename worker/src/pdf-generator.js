import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Brasão da República Federativa do Brasil — extraído do template oficial Receita Federal
const BRASAO_B64 = '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';


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
  '00': '', '01': 'ME', '03': 'EPP', '05': 'DEMAIS',
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

  // Brasão da República
  const brasaoBytes = Uint8Array.from(atob(BRASAO_B64), c => c.charCodeAt(0));
  const brasaoImg = await doc.embedPng(brasaoBytes);

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
  const BRASO_W = 48, BRASO_H = 50;
  const BRASO_X = 44;
  const BRASO_Y = HDR_Y - 22; // alinha verticalmente com as duas linhas de texto
  page.drawImage(brasaoImg, { x: BRASO_X, y: BRASO_Y, width: BRASO_W, height: BRASO_H });

  const t1 = 'REPÚBLICA FEDERATIVA DO BRASIL';
  const t2 = 'CADASTRO NACIONAL DA PESSOA JURÍDICA';
  // centra o texto no espaço à direita do brasão
  const TX = BRASO_X + BRASO_W + 6;
  const TW = MR - TX;
  page.drawText(t1, { x: TX + (TW - helvB.widthOfTextAtSize(t1, 11)) / 2, y: HDR_Y,      size: 11, font: helvB, color: BLK });
  page.drawText(t2, { x: TX + (TW - helvB.widthOfTextAtSize(t2, 10)) / 2, y: HDR_Y - 16, size: 10, font: helvB, color: BLK });

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
