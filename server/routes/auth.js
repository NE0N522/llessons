const express = require('express');
const crypto = require('node:crypto');
const {
  rateLimit,
  ipKeyGenerator
} = require('express-rate-limit');
const {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession
} = require('../auth');
const {
  now
} = require('../db');
const {
  assert
} = require('../lib/errors');
const {
  login: validateLogin,
  text
} = require('../lib/validation');
const dummyHash = hashPassword(crypto.randomBytes(32).toString('hex'));
const genericLoginError = {
  error: 'Неверный логин или пароль.'
};
function isLoopback(ip = '') {
  return ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.') || ip === '::ffff:0:127.0.0.1';
}
function createAuthRouter(db, config) {
  const router = express.Router();
  const ipLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 1000,
    keyGenerator: req => ipKeyGenerator(req.ip || '127.0.0.1'),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Слишком много попыток с этой сети. Попробуй позже.'
    }
  });
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 12,
    keyGenerator: req => `${ipKeyGenerator(req.ip || '127.0.0.1')}:${String(req.body?.login || '').trim().toLowerCase().slice(0, 40)}`,
    standardHeaders: true,
    legacyHeaders: false,
    message: genericLoginError
  });
  router.get('/me', async (req, res) => {
    if (!req.user) return res.status(401).json({
      error: 'Войди в аккаунт.'
    });
    const classRow = req.user.class_id ? await db.prepare('SELECT id,name,school_year FROM classes WHERE id=$1').get(req.user.class_id) : null;
    res.json({
      user: {
        ...req.user,
        class: classRow || null
      }
    });
  });
  router.post('/cloudinary-avatar-signature', (req, res) => {
    assert(req.user, 401, 'Войди в аккаунт.');
    assert(!req.user.must_change_password, 403, 'Сначала задай новый пароль.');
    const cloudName = config.cloudinaryCloudName;
    const apiKey = config.cloudinaryApiKey;
    const apiSecret = config.cloudinaryApiSecret;
    assert(cloudName && apiKey && apiSecret, 503, 'Загрузка фото пока не настроена. Можно вставить ссылку на изображение.');
    assert(/^[a-z0-9-]{1,100}$/i.test(cloudName) && /^[a-z0-9]{5,100}$/i.test(apiKey), 503, 'Настройки Cloudinary заполнены неверно.');
    const timestamp = String(Math.floor(Date.now() / 1000));
    const fields = {
      overwrite: 'true',
      public_id: `kod-po-polochkam/users/${req.user.id}/avatar`,
      timestamp
    };
    const toSign = Object.keys(fields).sort().map(key => `${key}=${fields[key]}`).join('&');
    const signature = crypto.createHash('sha1').update(`${toSign}${apiSecret}`).digest('hex');
    res.json({ cloud_name: cloudName, api_key: apiKey, signature, ...fields });
  });
  router.patch('/profile', async (req, res) => {
    assert(req.user, 401, 'Войди в аккаунт.');
    assert(!req.user.must_change_password, 403, 'Сначала задай новый пароль.');
    const avatarUrl = String(req.body?.avatar_url ?? '').trim();
    const avatarPublicId = String(req.body?.avatar_public_id ?? '').trim();
    const profileStatus = String(req.body?.profile_status ?? '').trim();
    const profileTheme = String(req.body?.profile_theme ?? 'ocean').trim();
    assert(avatarUrl.length <= 2048, 400, 'Ссылка на изображение слишком длинная.');
    assert(profileStatus.length <= 80, 400, 'Статус должен быть не длиннее 80 символов.');
    assert(['ocean', 'lavender', 'sunset', 'forest', 'graphite'].includes(profileTheme), 400, 'Выбери оформление из списка.');
    if (avatarUrl) {
      let parsed;
      try { parsed = new URL(avatarUrl); } catch { assert(false, 400, 'Вставь полную ссылку на изображение.'); }
      assert(parsed.protocol === 'https:' && !parsed.username && !parsed.password, 400, 'Ссылка должна начинаться с https://.');
    }
    const expectedPublicId = `kod-po-polochkam/users/${req.user.id}/avatar`;
    if (avatarPublicId) {
      let parsed;
      try { parsed = new URL(avatarUrl); } catch { assert(false, 400, 'После загрузки фото обнови профиль ещё раз.'); }
      assert(avatarPublicId === expectedPublicId && parsed.hostname === 'res.cloudinary.com' && parsed.pathname.includes(`/${expectedPublicId}.`), 400, 'Не удалось проверить загруженное фото.');
    }
    await db.prepare('UPDATE users SET avatar_url=$1,avatar_public_id=$2,profile_theme=$3,profile_status=$4 WHERE id=$5').run(avatarUrl, avatarPublicId, profileTheme, profileStatus, req.user.id);
    res.json({ avatar_url: avatarUrl, avatar_public_id: avatarPublicId, profile_theme: profileTheme, profile_status: profileStatus });
  });
  router.get('/status', (req, res) => {
    if (!req.user) return res.json({ user: null });
    res.json({
      user: {
        id: req.user.id,
        role: req.user.role,
        full_name: req.user.full_name,
        must_change_password: Boolean(req.user.must_change_password)
      }
    });
  });
  router.post('/setup', ipLimiter, async (req, res) => {
    const teacherCount = Number((await db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='teacher'").get()).n);
    if (teacherCount > 0) return res.status(404).json({
      error: 'Страница настройки не найдена.'
    });
    if (config.production) {
      const supplied = typeof req.body?.setup_token === 'string' ? req.body.setup_token : '';
      const a = Buffer.from(supplied),
        b = Buffer.from(config.setupToken);
      if (!config.setupToken || a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(403).json({
        error: 'Для первой настройки нужен ключ владельца.'
      });
    } else if (!isLoopback(req.ip || '')) return res.status(403).json({
      error: 'Первого учителя можно создать только на этом компьютере.'
    });
    const fullName = text(req.body?.full_name, 'ФИО', 100);
    const username = validateLogin(req.body?.login);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    assert(password.length >= 12 && /[A-Za-z]/.test(password) && /\d/.test(password), 400, 'Пароль должен содержать не менее 12 символов, буквы и цифры.');
    const passwordHash = await hashPassword(password);
    try {
      const teacher = await db.tx(async () => {
        const count = Number((await db.prepare("SELECT COUNT(*) AS n FROM users WHERE role='teacher'").get()).n);
        if (count) return null;
        return await db.prepare("INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES('teacher',$1,$2,$3,1,$4)").run(username, passwordHash, fullName, now());
      });
      if (!teacher) return res.status(404).json({
        error: 'Страница настройки не найдена.'
      });
    } catch (error) {
      if (error.code === '23505') return res.status(409).json({
        error: 'Этот логин уже занят.'
      });
      throw error;
    }
    res.status(201).json({
      ok: true
    });
  });
  router.post('/login', ipLimiter, loginLimiter, async (req, res) => {
    const rawLogin = typeof req.body?.login === 'string' ? req.body.login.trim().toLowerCase().slice(0, 40) : '';
    let normalized = '';
    try {
      normalized = validateLogin(rawLogin);
    } catch {
      normalized = rawLogin;
    }
    const ip = String(req.ip || 'unknown').slice(0, 100);
    const timestamp = now();
    await db.prepare("DELETE FROM login_attempts WHERE updated_at < now() - interval '30 days'").run();
    await db.prepare("DELETE FROM login_events WHERE occurred_at < now() - interval '90 days'").run();
    const attempt = await db.prepare('SELECT failures,lock_level,blocked_until FROM login_attempts WHERE normalized_login=$1 AND ip_address=$2').get(normalized, ip);
    if (attempt?.blocked_until && Date.parse(attempt.blocked_until) > Date.now()) {
      await db.prepare('INSERT INTO login_events(occurred_at,login,success,ip_address,user_agent) VALUES($1,$2,0,$3,$4)').run(timestamp, normalized, ip, String(req.get('user-agent') || '').slice(0, 500));
      return res.status(401).json(genericLoginError);
    }
    const user = await db.prepare('SELECT * FROM users WHERE lower(login)=lower($1)').get(normalized);
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const valid = user ? await verifyPassword(password, user.password_hash) : await dummyHash.then(hash => verifyPassword(password, hash));
    if (!user || !valid || !user.active) {
      let failures = attempt?.blocked_until && Date.parse(attempt.blocked_until) <= Date.now() ? 0 : Number(attempt?.failures || 0);
      let lockLevel = Number(attempt?.lock_level || 0);
      failures += 1;
      let blockedUntil = null;
      if (failures >= 5) {
        lockLevel += 1;
        blockedUntil = new Date(Date.now() + Math.min(60_000 * 2 ** (lockLevel - 1), 60 * 60 * 1000)).toISOString();
        failures = 0;
      }
      await db.prepare(`INSERT INTO login_attempts(normalized_login,ip_address,failures,lock_level,blocked_until,updated_at)
        VALUES($1,$2,$3,$4,$5,$6)
        ON CONFLICT(normalized_login,ip_address) DO UPDATE SET failures=excluded.failures,lock_level=excluded.lock_level,blocked_until=excluded.blocked_until,updated_at=excluded.updated_at`).run(normalized, ip, failures, lockLevel, blockedUntil, timestamp);
      await db.prepare('INSERT INTO login_events(occurred_at,user_id,login,success,ip_address,user_agent) VALUES($1,$2,$3,0,$4,$5)').run(timestamp, user?.id ?? null, normalized, ip, String(req.get('user-agent') || '').slice(0, 500));
      return res.status(401).json(genericLoginError);
    }
    await db.prepare('DELETE FROM login_attempts WHERE normalized_login=$1 AND ip_address=$2').run(normalized, ip);
    await db.prepare('UPDATE users SET last_login_at=$1 WHERE id=$2').run(timestamp, user.id);
    await db.prepare('INSERT INTO login_events(occurred_at,user_id,login,success,ip_address,user_agent) VALUES($1,$2,$3,1,$4,$5)').run(timestamp, user.id, normalized, ip, String(req.get('user-agent') || '').slice(0, 500));
    await createSession(db, res, req, user.id, Boolean(req.body?.remember), config.sessionSecret);
    res.json({
      user: {
        id: user.id,
        role: user.role,
        login: user.login,
        full_name: user.full_name,
        must_change_password: Boolean(user.must_change_password)
      }
    });
  });
  router.get('/login-events', async (req, res) => {
    assert(req.user, 401, 'Войди в аккаунт.');
    const events = await db.prepare('SELECT occurred_at,success,ip_address,user_agent FROM login_events WHERE user_id=$1 ORDER BY occurred_at DESC LIMIT 25').all(req.user.id);
    res.json({
      events
    });
  });
  router.post('/logout', async (req, res) => {
    await destroySession(db, req, res);
    res.json({
      ok: true
    });
  });
  router.post('/logout-all', async (req, res) => {
    assert(req.user, 401, 'Войди в аккаунт.');
    await db.prepare('DELETE FROM sessions WHERE user_id=$1').run(req.user.id);
    res.clearCookie('kod_session', {
      httpOnly: true,
      sameSite: 'lax',
      secure: req.secure,
      path: '/'
    });
    res.json({
      ok: true
    });
  });
  router.post('/password', async (req, res) => {
    assert(req.user, 401, 'Войди в аккаунт.');
    const current = typeof req.body?.current_password === 'string' ? req.body.current_password : '';
    const next = typeof req.body?.new_password === 'string' ? req.body.new_password : '';
    const user = await db.prepare('SELECT password_hash FROM users WHERE id=$1 AND active=1').get(req.user.id);
    assert(user && (await verifyPassword(current, user.password_hash)), 400, 'Текущий пароль не подошёл.');
    const passwordHash = await hashPassword(next);
    await db.prepare('UPDATE users SET password_hash=$1,must_change_password=0 WHERE id=$2').run(passwordHash, req.user.id);
    await db.prepare('DELETE FROM sessions WHERE user_id=$1 AND id<>$2').run(req.user.id, req.sessionId || '');
    res.json({
      ok: true
    });
  });
  return router;
}
module.exports = {
  createAuthRouter,
  isLoopback
};
