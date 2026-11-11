const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server/app');

let app, server, base;
before(async () => {
  app = await createApp({ pgliteDir: ':memory:', sessionSecret: 'stage0-test-secret-at-least-thirty-two-chars' });
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await app?.locals.db.close();
});

test('Stage 1: the course is served from the application root', async () => {
  const response = await fetch(`${base}/`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Понятный путь от первой страницы/);
  assert.ok(response.headers.get('content-security-policy'));
});

test('Stage 1: health endpoints separate process health from database readiness', async () => {
  const [health, ready] = await Promise.all([fetch(`${base}/healthz`), fetch(`${base}/readyz`)]);
  assert.equal(health.status, 200);
  assert.equal(await health.text(), 'ok');
  assert.equal(ready.status, 200);
  assert.deepEqual(await ready.json(), { ready: true });
});

test('Stage 1: private source and database paths are not public', async () => {
  for (const route of ['/server/index.js', '/data/app.db', '/.env', '/node_modules/express/package.json', '/server/db/migrations/001_initial.sql']) {
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 404, `${route} should return 404`);
  }
});

test('Stage 1: PostgreSQL-compatible migrations create the current schema', async () => {
  const migrations = await app.locals.db.query('SELECT version,name FROM schema_migrations ORDER BY version');
  assert.deepEqual(migrations.rows.map((row) => row.version), ['001', '002', '003', '004', '005']);
  const types = await app.locals.db.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='assignments'");
  assert.equal(types.rows.find((row) => row.column_name === 'checks_json').data_type, 'jsonb');
  assert.equal(types.rows.find((row) => row.column_name === 'due_at').data_type, 'timestamp with time zone');
  assert.equal(types.rows.find((row) => row.column_name === 'no_hints').data_type, 'smallint');
  const settings = await app.locals.db.query("SELECT column_name,data_type FROM information_schema.columns WHERE table_name='user_settings'");
  assert.equal(settings.rows.find((row) => row.column_name === 'font_size').data_type, 'integer');
  assert.equal(settings.rows.find((row) => row.column_name === 'weekly_goal').data_type, 'integer');
  const stage4Tables = await app.locals.db.query("SELECT table_name FROM information_schema.tables WHERE table_name IN ('student_activity_days','lesson_notes') ORDER BY table_name");
  assert.deepEqual(stage4Tables.rows.map((row) => row.table_name), ['lesson_notes', 'student_activity_days']);
  const classColumns = await app.locals.db.query("SELECT column_name FROM information_schema.columns WHERE table_name='classes'");
  assert.ok(classColumns.rows.some((row) => row.column_name === 'closed_at'));
  assert.ok(classColumns.rows.some((row) => row.column_name === 'rollover_class_id'));
  assert.ok(classColumns.rows.some((row) => row.column_name === 'close_action'));
});

test('Stage 1: anonymous requests are denied and writes require same-origin JSON', async () => {
  const status = await fetch(`${base}/api/auth/status`);
  assert.equal(status.status, 200);
  assert.deepEqual(await status.json(), { user: null });
  const me = await fetch(`${base}/api/auth/me`);
  assert.equal(me.status, 401);
  const anonymous = await fetch(`${base}/api/teacher/classes`);
  assert.equal(anonymous.status, 401);
  const foreignOrigin = await fetch(`${base}/api/teacher/classes`, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://attacker.example' }, body: JSON.stringify({ name: 'Чужой класс' }) });
  assert.equal(foreignOrigin.status, 403);
});
