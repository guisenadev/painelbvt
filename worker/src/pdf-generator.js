import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { PDF_TEMPLATE_B64 } from './pdf-template.js';

function formatCnpj(raw) {
  const d = (raw || '').replace(/\D/g, '');
  if (d.length !== 14) return raw || '';
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12)}`;
}

function formatCep(raw) {
  const d = (raw || '').replace(/\D/g, '');
  if (d.length !== 8) return raw || '';
  return `${d.slice(0,5)}-${d.slice(5)}`;
}

function formatDate(s) {
  if (!s) return '';
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : String(s);
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// site: row from DB; apiData: response from publica.cnpj.ws (can be null)
export async function generateCnpjPdf(site, apiData) {
  const templateBytes = b64ToBytes(PDF_TEMPLATE_B64);
  const doc = await PDFDocument.load(templateBytes);
  const page = doc.getPages()[0];

  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bld = await doc.embedFont(StandardFonts.HelveticaBold);
  const BLK = rgb(0, 0, 0);
  const SZ = 8;

  // API response: top-level fields + nested under "estabelecimento"
  const a = apiData || {};
  const est = a.estabelecimento || {};

  function txt(x, y, value, opts = {}) {
    if (!value) return;
    page.drawText(String(value), {
      x, y,
      size: opts.size || SZ,
      font: opts.bold ? bld : reg,
      color: BLK,
      maxWidth: opts.maxWidth || 200,
    });
  }

  // Row 1: NÚMERO DE INSCRIÇÃO | DATA DE ABERTURA
  txt(37,  700, formatCnpj(est.cnpj || site.cnpj));
  txt(415, 700, formatDate(est.data_inicio_atividade));

  // Row 2: NOME EMPRESARIAL
  txt(37, 660, a.razao_social || site.razao_social, { maxWidth: 516 });

  // Row 3: TÍTULO DO ESTABELECIMENTO | PORTE
  // Whitewash template asterisks then write actual value
  page.drawRectangle({ x: 37, y: 620, width: 393, height: 22, color: rgb(1, 1, 1) });
  txt(37,  625, est.nome_fantasia || '', { maxWidth: 392 });
  txt(440, 625, a.porte?.descricao || '', { maxWidth: 52, size: 7 });

  // Row 4: ATIVIDADE ECONÔMICA PRINCIPAL
  const atP = est.atividade_principal
    ? `${est.atividade_principal.subclasse || est.atividade_principal.id} - ${est.atividade_principal.descricao}`
    : '';
  txt(37, 588, atP, { maxWidth: 516 });

  // Row 5: ATIVIDADES ECONÔMICAS SECUNDÁRIAS (2 lines)
  const secs = est.atividades_secundarias || [];
  if (secs[0]) txt(37, 548, `${secs[0].subclasse || secs[0].id} - ${secs[0].descricao}`, { maxWidth: 516 });
  if (secs[1]) txt(37, 534, `${secs[1].subclasse || secs[1].id} - ${secs[1].descricao}`, { maxWidth: 516 });

  // Row 6: NATUREZA JURÍDICA
  const nat = a.natureza_juridica
    ? `${a.natureza_juridica.id || ''} - ${a.natureza_juridica.descricao || ''}`
    : '';
  txt(37, 496, nat, { maxWidth: 516 });

  // Row 7: LOGRADOURO | NÚMERO | COMPLEMENTO
  const logradouro = [est.tipo_logradouro, est.logradouro].filter(Boolean).join(' ') || site.endereco || '';
  txt(37,  459, logradouro, { maxWidth: 265 });
  txt(312, 459, est.numero || '', { maxWidth: 78 });
  txt(400, 459, est.complemento || '', { maxWidth: 150 });

  // Row 8: CEP | BAIRRO/DISTRITO | MUNICÍPIO | UF
  txt(37,  423, formatCep(est.cep || site.cep || ''), { maxWidth: 70 });
  txt(112, 423, est.bairro || site.bairro || '', { maxWidth: 118 });
  txt(238, 423, est.cidade?.nome || site.cidade || '', { maxWidth: 230 });
  txt(476, 423, est.estado?.sigla || site.estado || '', { maxWidth: 40 });

  // Row 9: ENDEREÇO ELETRÔNICO | TELEFONE (phone from site, not API)
  txt(37,  388, est.email || site.email || '', { maxWidth: 265 });
  txt(312, 388, site.telefone || '', { maxWidth: 240 });

  // Row 10: ENTE FEDERATIVO RESPONSÁVEL (EFR) — whitewash template asterisks
  page.drawRectangle({ x: 37, y: 358, width: 516, height: 22, color: rgb(1, 1, 1) });
  txt(37, 363, a.responsavel_federativo || '', { maxWidth: 516 });

  // Row 11: SITUAÇÃO CADASTRAL | DATA DA SITUAÇÃO CADASTRAL
  // Template already has "ATIVA" pre-printed; only draw if status differs
  const situacao = est.situacao_cadastral || 'ATIVA';
  if (situacao.toUpperCase() !== 'ATIVA') {
    page.drawRectangle({ x: 37, y: 306, width: 160, height: 14, color: rgb(1,1,1) });
    txt(37, 309, situacao, { bold: true, size: 9 });
  }
  txt(385, 312, formatDate(est.data_situacao_cadastral), { maxWidth: 162 });

  // Row 12: MOTIVO DE SITUAÇÃO CADASTRAL
  txt(37, 279, est.motivo_situacao_cadastral || '', { maxWidth: 516 });

  // Row 13: SITUAÇÃO ESPECIAL | DATA DA SITUAÇÃO ESPECIAL — whitewash template asterisks
  page.drawRectangle({ x: 37, y: 268, width: 340, height: 20, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 381, y: 268, width: 172, height: 20, color: rgb(1, 1, 1) });
  txt(37,  271, est.situacao_especial || '', { maxWidth: 330 });
  txt(385, 271, est.data_situacao_especial ? formatDate(est.data_situacao_especial) : '', { maxWidth: 162 });

  return doc.save();
}
