const crypto = require('node:crypto');
const { assert } = require('../lib/errors');

const FORMAT = 'kod-po-polochkam-postgres-backup';
const TABLES = [
  'users', 'classes', 'user_settings', 'assignments', 'assignment_targets', 'submissions', 'submission_versions',
  'lesson_progress', 'lesson_notes', 'student_activity_days', 'sessions', 'login_attempts', 'login_events', 'audit_log',
  'activity_events', 'assignment_hint_opens', 'assignment_due_extensions', 'assignment_line_comments',
  'teacher_comment_templates', 'class_announcements', 'assignment_questions', 'assignment_similarity'
];
const OPTIONAL_LEGACY_TABLES = new Set([
  'user_settings', 'lesson_notes', 'student_activity_days', 'assignment_hint_opens', 'assignment_due_extensions',
  'assignment_line_comments', 'teacher_comment_templates', 'class_announcements', 'assignment_questions', 'assignment_similarity'
]);
const RESTORE_ORDER = [
  'user_settings', 'assignments', 'assignment_targets', 'submissions', 'submission_versions', 'lesson_progress',
  'lesson_notes', 'student_activity_days', 'sessions', 'login_attempts', 'login_events', 'audit_log', 'activity_events',
  'assignment_hint_opens', 'assignment_due_extensions', 'assignment_line_comments', 'teacher_comment_templates',
  'class_announcements', 'assignment_questions', 'assignment_similarity'
];

async function createBackup(db) {
  return db.tx(async () => {
    const migrations = (await db.query('SELECT version,name,applied_at FROM schema_migrations ORDER BY version')).rows;
    const data = {};
    for (const table of TABLES) data[table] = (await db.query(`SELECT * FROM ${table} ORDER BY 1`)).rows;
    return { format: FORMAT, backup_version: 1, created_at: new Date().toISOString(), checksum: null, schema_migrations: migrations, data };
  });
}

function validateBackup(backup) {
  assert(backup && backup.format === FORMAT && backup.backup_version === 1 && backup.data && typeof backup.data === 'object', 400, 'Файл не распознан как резервная копия курса.');
  for (const table of TABLES) {
    if (!Array.isArray(backup.data[table]) && OPTIONAL_LEGACY_TABLES.has(table)) backup.data[table] = [];
    assert(Array.isArray(backup.data[table]), 400, `В резервной копии отсутствует таблица ${table}.`);
  }
}

async function restoreBackup(db, backup, { force = false } = {}) {
  validateBackup(backup);
  const count = Number((await db.query('SELECT COUNT(*) AS n FROM users')).rows[0].n);
  assert(!count || force, 409, 'База не пустая. Для явной замены данных нужен параметр --force и подтверждение.');
  const available = (await db.query(`SELECT version FROM schema_migrations ORDER BY version`)).rows.map((row) => row.version);
  const backupVersions = (backup.schema_migrations || []).map((row) => row.version);
  assert(backupVersions.every((version) => available.includes(version)), 400, 'Резервная копия создана более новой версией схемы. Обнови приложение перед восстановлением.');
  return db.tx(async () => {
    for (const table of [...TABLES].reverse()) await db.query(`DELETE FROM ${table}`);
    for (const table of ['users']) {
      const rows = backup.data[table].map((row) => ({ ...row, class_id: null }));
      await insertRows(db, table, rows);
    }
    const classes = backup.data.classes.map((row) => ({ ...row, rollover_class_id: null }));
    await insertRows(db, 'classes', classes);
    await db.query('UPDATE classes c SET rollover_class_id=source.rollover_class_id FROM (SELECT id,rollover_class_id FROM jsonb_to_recordset($1::jsonb) AS x(id integer,rollover_class_id integer)) AS source WHERE c.id=source.id', [JSON.stringify(backup.data.classes.map((row) => ({ id: row.id, rollover_class_id: row.rollover_class_id ?? null })))]);
    await db.query('UPDATE users u SET class_id=source.class_id FROM (SELECT id,class_id FROM jsonb_to_recordset($1::jsonb) AS x(id integer,class_id integer)) AS source WHERE u.id=source.id', [JSON.stringify(backup.data.users)]);
    for (const table of RESTORE_ORDER) await insertRows(db, table, backup.data[table]);
    for (const table of ['users', 'classes', 'assignments', 'submissions', 'submission_versions', 'login_events', 'audit_log', 'activity_events', 'assignment_line_comments', 'teacher_comment_templates', 'class_announcements', 'assignment_questions']) {
      await db.query(`SELECT setval(pg_get_serial_sequence('${table}','id'), COALESCE((SELECT MAX(id) FROM ${table}),1), EXISTS(SELECT 1 FROM ${table}))`);
    }
    return { restored_tables: TABLES.length, restored_rows: TABLES.reduce((sum, table) => sum + backup.data[table].length, 0) };
  });
}

async function insertRows(db, table, rows) {
  if (!rows.length) return;
  const columns = Object.keys(rows[0]);
  const allowed = (await db.query('SELECT column_name FROM information_schema.columns WHERE table_name=$1', [table])).rows.map((row) => row.column_name);
  assert(columns.every((column) => allowed.includes(column)), 400, `В копии таблицы ${table} есть неизвестные столбцы.`);
  const quoted = columns.map((column) => `"${column}"`).join(',');
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(',');
  const sql = `INSERT INTO "${table}"(${quoted}) VALUES(${placeholders})`;
  for (const row of rows) await db.query(sql, columns.map((column) => row[column]));
}

function safeName(value = '') { return String(value).replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80); }
function signature(backup, secret) {
  const payload = JSON.stringify({ ...backup, checksum: null });
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

module.exports = { FORMAT, TABLES, createBackup, restoreBackup, validateBackup, safeName, signature };
