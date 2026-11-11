const fs = require('node:fs');
const path = require('node:path');
const { AsyncLocalStorage } = require('node:async_hooks');
const { PGlite } = require('@electric-sql/pglite');
const { Pool } = require('pg');

const migrationsDir = path.join(__dirname, 'migrations');
const transactionContext = new AsyncLocalStorage();
const idTables = new Set(['users', 'classes', 'assignments', 'submissions', 'submission_versions', 'audit_log', 'activity_events', 'login_events', 'assignment_line_comments', 'teacher_comment_templates', 'class_announcements', 'assignment_questions']);

function now() { return new Date().toISOString(); }

function convertSql(text) {
  let sql = String(text).replace(/INSERT\s+OR\s+IGNORE\s+INTO/i, 'INSERT INTO');
  sql = sql.replace(/([\w.]+)\s*=\s*(\$\d+|\?)\s+COLLATE\s+NOCASE/gi, 'LOWER($1) = LOWER($2)');
  sql = sql.replace(/([\w.]+)\s+COLLATE\s+NOCASE/gi, 'LOWER($1)');
  let output = '', index = 0, quote = null;
  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    if (quote) {
      output += char;
      if (char === quote && sql[i + 1] === quote) { output += sql[++i]; continue; }
      if (char === quote) quote = null;
      continue;
    }
    if (char === "'" || char === '"') { quote = char; output += char; continue; }
    if (char === '?') { index += 1; output += `$${index}`; continue; }
    output += char;
  }
  if (/INSERT\s+INTO/i.test(output) && /INSERT\s+OR\s+IGNORE/i.test(text)) output += ' ON CONFLICT DO NOTHING';
  return output;
}

function normalizeResult(result) {
  const rows = result.rows || [];
  return { rows, rowCount: result.rowCount ?? result.affectedRows ?? rows.length };
}

function createDatabase(driver, kind) {
  const db = {
    kind,
    async query(text, params = []) {
      const client = transactionContext.getStore();
      const sql = convertSql(text);
      const result = kind === 'pglite'
        ? await (client || driver).query(sql, params)
        : await (client || driver).query(sql, params);
      return normalizeResult(result);
    },
    async tx(fn) {
      if (kind === 'pglite') {
        return driver.transaction(async (tx) => transactionContext.run(tx, () => fn(db)));
      }
      const client = await driver.connect();
      try {
        await client.query('BEGIN');
        const result = await transactionContext.run(client, () => fn(db));
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally { client.release(); }
    },
    async close() { return kind === 'pglite' ? driver.close() : driver.end(); },
    // Small transition facade; it executes parameterized PostgreSQL through query().
    prepare(text) {
      const table = /^\s*INSERT\s+(?:OR\s+IGNORE\s+)?INTO\s+([\w]+)/i.exec(text)?.[1]?.toLowerCase();
      let sql = text;
      if (table && idTables.has(table) && !/\bRETURNING\b/i.test(sql)) sql = `${sql.trim().replace(/;$/, '')} RETURNING id`;
      const execute = async (params) => {
        const result = await db.query(sql, params);
        return { changes: result.rowCount, lastInsertRowid: result.rows[0]?.id ?? 0, rows: result.rows };
      };
      return {
        async get(...params) { return (await execute(params)).rows[0]; },
        async all(...params) { return (await execute(params)).rows; },
        async run(...params) { const result = await execute(params); return { changes: result.changes, lastInsertRowid: result.lastInsertRowid }; }
      };
    },
    transaction(fn) { return (...args) => db.tx(() => fn(...args)); }
  };
  return db;
}

async function applyMigrations(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version text PRIMARY KEY,
    name text NOT NULL,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const files = fs.readdirSync(migrationsDir).filter((name) => name.endsWith('.sql')).sort();
  for (const name of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, name), 'utf8');
    await db.tx(async () => {
      const version = name.slice(0, 3);
      if (db.kind === 'postgres') await db.query('SELECT pg_advisory_xact_lock($1::integer,$2::integer)', [1836016745, Number(version)]);
      const existing = (await db.query('SELECT 1 FROM schema_migrations WHERE version = $1', [version])).rows[0];
      if (existing) return;
      for (const statement of sql.split(/;\s*(?:\r?\n|$)/).map((item) => item.trim()).filter(Boolean)) await db.query(statement);
      await db.query('INSERT INTO schema_migrations(version, name) VALUES ($1, $2)', [version, name]);
    });
  }
}

function postgresPool(connectionString, max) {
  const pool = new Pool({
    connectionString,
    max,
    ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? undefined : { rejectUnauthorized: true },
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    maxLifetimeSeconds: 300
  });
  pool.on('error', (error) => console.error(`Ошибка свободного соединения PostgreSQL (${error.code || 'без кода'}).`));
  return pool;
}

async function connectWithRetries(db, migrate) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await db.query('SELECT 1');
      if (migrate) await applyMigrations(db);
      return;
    } catch (error) {
      lastError = error;
      if (attempt === 4) break;
      await new Promise((resolve) => setTimeout(resolve, Math.min(1000 * (2 ** attempt), 8000)));
    }
  }
  throw new Error(`Не удалось подключиться к PostgreSQL и применить миграции: ${lastError?.message || 'неизвестная ошибка'}`);
}

async function openDatabase(config = {}) {
  let db;
  if (config.databaseUrl) {
    const runtimeDriver = postgresPool(config.databaseUrl, 5);
    db = createDatabase(runtimeDriver, 'postgres');
    const migrationsUrl = config.migrationsDatabaseUrl || config.databaseUrl;
    let migrationsDb = null;
    try {
      if (migrationsUrl !== config.databaseUrl) {
        migrationsDb = createDatabase(postgresPool(migrationsUrl, 1), 'postgres');
        await connectWithRetries(migrationsDb, true);
        await migrationsDb.close();
        migrationsDb = null;
        await connectWithRetries(db, false);
      } else {
        await connectWithRetries(db, true);
      }
      return db;
    } catch (error) {
      await migrationsDb?.close().catch(() => {});
      await db.close().catch(() => {});
      throw error;
    }
  } else {
    const dataDir = config.pgliteDir || path.resolve(__dirname, '../../data/pglite');
    if (dataDir !== ':memory:') fs.mkdirSync(dataDir, { recursive: true });
    const driver = dataDir === ':memory:' ? new PGlite() : new PGlite(dataDir);
    await driver.waitReady;
    db = createDatabase(driver, 'pglite');
  }
  try { await connectWithRetries(db, true); return db; }
  catch (error) { await db.close().catch(() => {}); throw error; }
}

async function one(db, sql, ...params) { return (await db.query(sql, params)).rows[0] || null; }
async function many(db, sql, ...params) { return (await db.query(sql, params)).rows; }
async function exec(db, sql, ...params) { return db.query(sql, params); }

module.exports = { openDatabase, applyMigrations, createDatabase, now, one, many, exec };
