const { assert } = require('./errors');

function text(value, field, max = 200) {
  assert(typeof value === 'string', 400, `Проверь поле «${field}».`);
  const normalized = value.trim();
  assert(normalized.length > 0 && normalized.length <= max, 400, `Поле «${field}» обязательно; максимум ${max} символов.`);
  return normalized;
}

function optionalText(value, field, max = 10000) {
  if (value == null || value === '') return '';
  assert(typeof value === 'string' && value.length <= max, 400, `Поле «${field}» слишком длинное.`);
  return value.trim();
}

function code(value, field) {
  const normalized = value == null ? '' : value;
  assert(typeof normalized === 'string' && Buffer.byteLength(normalized, 'utf8') <= 200 * 1024, 413, `Код ${field} не должен превышать 200 КБ.`);
  return normalized;
}

function login(value) {
  assert(typeof value === 'string', 400, 'Укажи логин.');
  const normalized = value.trim().toLowerCase();
  assert(/^[a-z0-9][a-z0-9._-]{2,39}$/.test(normalized), 400, 'Логин: латиница, цифры, точка, дефис или подчёркивание; 3–40 символов.');
  return normalized;
}

function isoDate(value, optional = true) {
  if (!value) {
    assert(optional, 400, 'Укажи срок сдачи.');
    return null;
  }
  const date = new Date(value);
  assert(!Number.isNaN(date.getTime()), 400, 'Проверь дату срока.');
  return date.toISOString();
}

module.exports = { text, optionalText, code, login, isoDate };
