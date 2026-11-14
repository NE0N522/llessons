const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
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
  assert.deepEqual(migrations.rows.map((row) => row.version), ['001', '002', '003', '004', '005', '006', '007']);
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

test('Stage 1: lesson 23 progress and notes are preserved when Flexbox moves to lesson 29', async () => {
  const db = app.locals.db;
  const stamp = '2026-11-14T00:00:00.000Z';
  const teacher = (await db.query("INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES('teacher','migration.teacher','hash','Учитель миграции',0,$1) RETURNING id", [stamp])).rows[0].id;
  const classId = (await db.query('INSERT INTO classes(teacher_id,name,created_at) VALUES($1,$2,$3) RETURNING id', [teacher, 'Класс миграции', stamp])).rows[0].id;
  const student = (await db.query("INSERT INTO users(role,login,password_hash,full_name,class_id,created_at) VALUES('student','migration.student','hash','Ученик миграции',$1,$2) RETURNING id", [classId, stamp])).rows[0].id;
  const marks = ['lesson-complete', 'can-0', 'can-1', 'can-2', 'can-3', 'axes', 'alignment', 'spacing-wrap', 'flex-values', 'cards', 'interface'];
  for (const stepId of marks) await db.query('INSERT INTO lesson_progress(student_id,lesson_id,step_id,done_at) VALUES($1,23,$2,$3)', [student, stepId, stamp]);
  await db.query('INSERT INTO lesson_notes(user_id,lesson_id,note,updated_at,revision) VALUES($1,23,$2,$3,4)', [student, 'Заметка к старому смешанному уроку', stamp]);
  const migration = fs.readFileSync(path.join(__dirname, '..', 'server', 'db', 'migrations', '007_split_flexbox_lesson.sql'), 'utf8');
  for (const statement of migration.split(';').map(value => value.trim()).filter(Boolean)) await db.query(statement);
  const rows = (await db.query('SELECT lesson_id,step_id FROM lesson_progress WHERE student_id=$1 ORDER BY lesson_id,step_id', [student])).rows;
  assert.ok(rows.some((row) => row.lesson_id === 23 && row.step_id === 'can-0'), 'the former Grid self-check stays in lesson 23');
  assert.ok(rows.some((row) => row.lesson_id === 29 && row.step_id === 'can-0'), 'Flexbox self-checks move to lesson 29');
  assert.ok(rows.some((row) => row.lesson_id === 23 && row.step_id === 'lesson-complete'));
  assert.ok(rows.some((row) => row.lesson_id === 29 && row.step_id === 'lesson-complete'));
  for (const stepId of ['axes', 'alignment', 'spacing-wrap', 'flex-values', 'cards', 'interface']) assert.ok(rows.some((row) => row.lesson_id === 29 && row.step_id === stepId), `${stepId} moves to lesson 29`);
  assert.equal(rows.some((row) => row.lesson_id === 23 && row.step_id === 'can-3'), false);
  const notes = (await db.query('SELECT lesson_id,note,revision FROM lesson_notes WHERE user_id=$1 ORDER BY lesson_id', [student])).rows;
  assert.deepEqual(notes.map((row) => [row.lesson_id, row.note, row.revision]), [[23, 'Заметка к старому смешанному уроку', 4], [29, 'Заметка к старому смешанному уроку', 4]]);
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
