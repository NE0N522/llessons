const crypto = require('node:crypto');
const {
  promisify
} = require('node:util');
const {
  HttpError,
  assert
} = require('./lib/errors');
const {
  now
} = require('./db');
const scrypt = promisify(crypto.scrypt);
const SESSION_COOKIE = 'kod_session';
const SESSION_MS = 12 * 60 * 60 * 1000;
const REMEMBER_MS = 30 * 24 * 60 * 60 * 1000;
async function hashPassword(password) {
  assert(typeof password === 'string' && password.length >= 10 && password.length <= 200, 400, 'Пароль должен содержать от 10 до 200 символов.');
  const salt = crypto.randomBytes(16);
  const derived = await scrypt(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  });
  return `scrypt$16384$8$1$${salt.toString('base64url')}$${Buffer.from(derived).toString('base64url')}`;
}
async function verifyPassword(password, stored) {
  try {
    const [algorithm, n, r, p, saltText, hashText] = String(stored).split('$');
    if (algorithm !== 'scrypt' || n !== '16384' || r !== '8' || p !== '1') return false;
    const salt = Buffer.from(saltText, 'base64url');
    const expected = Buffer.from(hashText, 'base64url');
    if (salt.length !== 16 || expected.length !== 64) return false;
    const actual = Buffer.from(await scrypt(String(password), salt, expected.length, {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024
    }));
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
function signSessionId(id, secret) {
  assert(typeof secret === 'string' && secret.length >= 32, 500, 'Секрет сессии не настроен.');
  return crypto.createHmac('sha256', secret).update(`session:${id}`).digest('base64url');
}
function tokenHash(token, secret) {
  assert(typeof secret === 'string' && secret.length >= 32, 500, 'Секрет сессии не настроен.');
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}
function verifySessionToken(token, secret) {
  if (typeof token !== 'string' || token.length > 120) return null;
  const [id, signature, extra] = token.split('.');
  if (extra || !/^[0-9a-f-]{36}$/i.test(id || '') || !signature) return null;
  const expected = Buffer.from(signSessionId(id, secret));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected) ? id : null;
}
function cookieOptions(req, maxAge) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    path: '/',
    ...(maxAge ? {
      maxAge
    } : {})
  };
}
function parseCookies(header = '') {
  const result = Object.create(null);
  for (const part of header.split(';')) {
    const index = part.indexOf('=');
    if (index <= 0) continue;
    const key = part.slice(0, index).trim();
    try {
      result[key] = decodeURIComponent(part.slice(index + 1).trim());
    } catch {/* Ignore malformed cookies. */}
  }
  return result;
}
function attachSession(db, sessionSecret) {
  return async (req, res, next) => {
    try {
      const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
      const sessionId = verifySessionToken(token, sessionSecret);
      if (!sessionId) return next();
      const hash = tokenHash(token, sessionSecret);
      const row = await db.prepare(`SELECT s.id,s.token_hash,s.expires_at,s.remember,u.id AS user_id,u.role,u.login,u.full_name,
          u.class_id,u.active,u.must_change_password,u.is_owner,u.avatar_url,u.avatar_public_id,u.profile_theme,u.profile_status
        FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=$1 AND s.token_hash=$2`).get(sessionId, hash);
      if (!row) return next();
      if (!row.active || Date.parse(row.expires_at) <= Date.now()) {
        await db.prepare('DELETE FROM sessions WHERE id=$1').run(sessionId);
        res.clearCookie(SESSION_COOKIE, cookieOptions(req));
        return next();
      }
      const expiry = new Date(Date.now() + (row.remember ? REMEMBER_MS : SESSION_MS)).toISOString();
      await db.prepare('UPDATE sessions SET last_activity_at=$1,expires_at=$2 WHERE id=$3').run(now(), expiry, sessionId);
      req.sessionId = sessionId;
      req.sessionTokenHash = hash;
      req.sessionRemember = Boolean(row.remember);
      req.user = {
        id: row.user_id,
        role: row.role,
        login: row.login,
        full_name: row.full_name,
        class_id: row.class_id,
        active: Boolean(row.active),
        is_owner: Boolean(row.is_owner),
        must_change_password: Boolean(row.must_change_password),
        avatar_url: row.avatar_url || '',
        avatar_public_id: row.avatar_public_id || '',
        profile_theme: row.profile_theme || 'ocean',
        profile_status: row.profile_status || ''
      };
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({
    error: 'Войди в аккаунт, чтобы продолжить.'
  });
  return next();
}
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({
      error: 'Войди в аккаунт, чтобы продолжить.'
    });
    if (req.user.role !== role) return res.status(403).json({
      error: 'Для этого действия недостаточно прав.'
    });
    if (req.user.must_change_password && req.path !== '/password') return res.status(403).json({
      error: 'Сначала задай новый пароль.',
      code: 'PASSWORD_CHANGE_REQUIRED'
    });
    return next();
  };
}
function checkOrigin(req, allowedOrigins = []) {
  const origin = req.get('origin');
  const expected = `${req.protocol}://${req.get('host')}`;
  if (!origin || origin !== expected && !allowedOrigins.includes(origin)) throw new HttpError(403, 'Запрос отклонён. Обнови страницу и повтори действие.');
}
function requireJsonAndOrigin(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  try {
    checkOrigin(req, req.app.locals.config.allowedOrigins);
    if (!req.is('application/json')) throw new HttpError(415, 'Ожидается запрос JSON.');
    return next();
  } catch (error) {
    return next(error);
  }
}
async function createSession(db, res, req, userId, remember, sessionSecret) {
  const sessionId = crypto.randomUUID();
  const token = `${sessionId}.${signSessionId(sessionId, sessionSecret)}`;
  const lifetime = remember ? REMEMBER_MS : SESSION_MS;
  const created = now();
  const expires = new Date(Date.now() + lifetime).toISOString();
  await db.prepare('INSERT INTO sessions(id,token_hash,user_id,created_at,last_activity_at,expires_at,user_agent,remember) VALUES($1,$2,$3,$4,$4,$5,$6,$7)').run(sessionId, tokenHash(token, sessionSecret), userId, created, expires, String(req.get('user-agent') || '').slice(0, 500), remember ? 1 : 0);
  res.cookie(SESSION_COOKIE, token, cookieOptions(req, remember ? lifetime : undefined));
}
async function destroySession(db, req, res) {
  if (req.sessionId) await db.prepare('DELETE FROM sessions WHERE id=$1').run(req.sessionId);
  res.clearCookie(SESSION_COOKIE, cookieOptions(req));
}
async function recordAudit(db, {
  userId,
  classId = null,
  action,
  target = '',
  details = {}
}) {
  await db.prepare('INSERT INTO audit_log(user_id,class_id,action,target,details_json,created_at) VALUES($1,$2,$3,$4,$5,$6)').run(userId ?? null, classId, action, String(target), JSON.stringify(details), now());
}
module.exports = {
  SESSION_COOKIE,
  hashPassword,
  verifyPassword,
  tokenHash,
  verifySessionToken,
  attachSession,
  requireAuth,
  requireRole,
  requireJsonAndOrigin,
  checkOrigin,
  createSession,
  destroySession,
  recordAudit,
  parseCookies
};
