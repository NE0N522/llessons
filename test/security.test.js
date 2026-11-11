const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server/app');
const { openDatabase } = require('../server/db');
const { hashPassword, verifySessionToken } = require('../server/auth');
const { getConfig } = require('../server/config');

test('Stage 1: production configuration requires secure session, pooled runtime and direct migration database URLs', () => {
  assert.throws(() => getConfig({ nodeEnv: 'production', sessionSecret: 'too-short', databaseUrl: '' }), /SESSION_SECRET/);
  assert.throws(() => getConfig({ nodeEnv: 'production', sessionSecret: 'valid-session-secret-that-is-at-least-32-characters', databaseUrl: '' }), /DATABASE_URL/);
  assert.throws(() => getConfig({ nodeEnv: 'production', sessionSecret: 'valid-session-secret-that-is-at-least-32-characters', databaseUrl: 'postgres://runtime/db' }), /MIGRATIONS_DATABASE_URL/);
  assert.throws(() => getConfig({ nodeEnv: 'production', sessionSecret: 'valid-session-secret-that-is-at-least-32-characters', databaseUrl: 'postgres://runtime/db', migrationsDatabaseUrl: 'postgres://host-pooler.region.neon.tech/db?sslmode=require' }), /без -pooler/);
  const config = getConfig({ nodeEnv: 'production', sessionSecret: 'valid-session-secret-that-is-at-least-32-characters', databaseUrl: 'postgres://runtime-pooler.region.neon.tech/db?sslmode=require', migrationsDatabaseUrl: 'postgres://direct.region.neon.tech/db?sslmode=require' });
  assert.equal(config.migrationsDatabaseUrl, 'postgres://direct.region.neon.tech/db?sslmode=require');
});

test('Stage 1: forwarded HTTPS sets a Secure session cookie and HMAC token is verifiable', async () => {
  const db = await openDatabase({ pgliteDir: ':memory:' });
  const secret = 'trusted-proxy-session-secret-at-least-32-chars';
  const password = 'ProxyTeacherSecure#2026';
  await db.query("INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES('teacher','proxy.teacher',$1,'Учитель прокси',1,now())", [await hashPassword(password)]);
  const app = await createApp({ db, nodeEnv: 'production', databaseUrl: 'postgres://unused-pooler', migrationsDatabaseUrl: 'postgres://unused-direct', sessionSecret: secret, trustProxy: '1' });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const host = `127.0.0.1:${server.address().port}`;
  try {
    const response = await fetch(`http://${host}/api/auth/login`, {
      method: 'POST',
      headers: { origin: `https://${host}`, 'x-forwarded-proto': 'https', 'content-type': 'application/json' },
      body: JSON.stringify({ login: 'proxy.teacher', password })
    });
    assert.equal(response.status, 200);
    const cookie = response.headers.get('set-cookie');
    assert.match(cookie, /Secure/i);
    const token = cookie.match(/kod_session=([^;]+)/)[1];
    assert.match(token, /^[0-9a-f-]{36}\.[A-Za-z0-9_-]{43}$/i);
    const id = verifySessionToken(decodeURIComponent(token), secret);
    assert.ok(id);
    const me = await fetch(`http://${host}/api/auth/me`, { headers: { cookie: `kod_session=${token}`, 'x-forwarded-proto': 'https' } });
    assert.equal(me.status, 200);
  } finally { await new Promise((resolve) => server.close(resolve)); clearInterval(app.locals.maintenanceTimer); await db.close(); }
});
