import { unzipSync } from 'fflate';
import QRCode from 'qrcode';

const decode = (bytes) => new TextDecoder().decode(bytes);
const localName = (node) => node.localName || node.nodeName.split(':').pop();
const descendants = (node, name) => [...node.getElementsByTagName('*')].filter((item) => localName(item) === name);

function parseCsv(text) {
  const sample = String(text || '').replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0] || '';
  const separators = [',', ';', '\t'];
  const delimiter = separators.map((value) => ({ value, count: sample.split(value).length - 1 })).sort((a, b) => b.count - a.count)[0].value;
  const rows = [];
  let row = [], value = '', quoted = false;
  const source = String(text || '').replace(/^\uFEFF/, '');
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (char === '"') {
      if (quoted && source[index + 1] === '"') { value += '"'; index += 1; }
      else quoted = !quoted;
    } else if (char === delimiter && !quoted) { row.push(value); value = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && source[index + 1] === '\n') index += 1;
      row.push(value); rows.push(row); row = []; value = '';
    } else value += char;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  return rows;
}

function parseXlsx(buffer) {
  const files = unzipSync(new Uint8Array(buffer));
  const workbook = files['xl/workbook.xml'];
  const rels = files['xl/_rels/workbook.xml.rels'];
  if (!workbook || !rels) throw new Error('В книге Excel не найден первый лист.');
  const workbookDoc = new DOMParser().parseFromString(decode(workbook), 'application/xml');
  const relsDoc = new DOMParser().parseFromString(decode(rels), 'application/xml');
  if (workbookDoc.querySelector('parsererror') || relsDoc.querySelector('parsererror')) throw new Error('Не удалось прочитать структуру файла Excel.');
  const firstSheet = descendants(workbookDoc, 'sheet')[0];
  if (!firstSheet) throw new Error('В книге Excel нет листов.');
  const relationshipId = firstSheet.getAttribute('r:id') || firstSheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
  const relationship = descendants(relsDoc, 'Relationship').find((item) => item.getAttribute('Id') === relationshipId);
  if (!relationship) throw new Error('Не удалось найти первый лист Excel.');
  const target = relationship.getAttribute('Target') || '';
  const sheetPath = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
  const sheetBytes = files[sheetPath.replace(/^xl\/\.\.\//, '')];
  if (!sheetBytes) throw new Error('Не удалось открыть первый лист Excel.');
  const sharedBytes = files['xl/sharedStrings.xml'];
  const shared = sharedBytes ? descendants(new DOMParser().parseFromString(decode(sharedBytes), 'application/xml'), 'si').map((item) => descendants(item, 't').map(text => text.textContent).join('')) : [];
  const sheet = new DOMParser().parseFromString(decode(sheetBytes), 'application/xml');
  if (sheet.querySelector('parsererror')) throw new Error('Не удалось прочитать строки первого листа Excel.');
  const columnNumber = (reference) => [...reference.matchAll(/[A-Z]+/g)].reduce((total, match) => total * 26 + match[0].charCodeAt(0) - 64, 0) - 1;
  return descendants(sheet, 'row').map((rowNode) => {
    const row = [];
    for (const cell of descendants(rowNode, 'c')) {
      const column = columnNumber(cell.getAttribute('r') || 'A1');
      const type = cell.getAttribute('t');
      const valueNode = descendants(cell, type === 'inlineStr' ? 't' : 'v')[0];
      const raw = valueNode?.textContent || '';
      row[column] = type === 's' ? shared[Number(raw)] || '' : raw;
    }
    return row.map(value => value || '');
  });
}

function normalizeRosterRows(rows) {
  const first = (rows[0] || []).map(value => String(value || '').trim().toLocaleLowerCase('ru'));
  const nameHeaders = new Set(['фио', 'фио ученика', 'ученик', 'имя', 'имя ученика', 'фамилия имя', 'full name', 'fullname', 'name', 'student']);
  const loginHeaders = new Set(['логин', 'login', 'username', 'имя пользователя']);
  let nameIndex = first.findIndex(value => nameHeaders.has(value));
  let loginIndex = first.findIndex(value => loginHeaders.has(value));
  let start = 0;
  if (nameIndex >= 0) start = 1;
  else { nameIndex = 0; loginIndex = 1; }
  return rows.slice(start).map(row => ({ full_name: String(row[nameIndex] || '').trim(), login: loginIndex >= 0 ? String(row[loginIndex] || '').trim() : '' }));
}

export async function parseRosterFile(file) {
  if (!file || file.size > 5 * 1024 * 1024) throw new Error('Файл должен быть меньше 5 МБ.');
  const name = String(file.name || '').toLocaleLowerCase('ru');
  let rows;
  if (name.endsWith('.csv') || name.endsWith('.tsv') || name.endsWith('.txt')) rows = parseCsv(await file.text());
  else if (name.endsWith('.xlsx')) rows = parseXlsx(await file.arrayBuffer());
  else throw new Error('Выбери файл CSV или XLSX.');
  return normalizeRosterRows(rows).filter(row => row.full_name || row.login);
}

export function qrDataUrl(text) {
  return QRCode.toDataURL(String(text), { errorCorrectionLevel: 'M', margin: 2, width: 160, color: { dark: '#111827', light: '#ffffff' } });
}
