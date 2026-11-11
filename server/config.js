const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function loadEnv(file = path.join(root, '.env')) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index < 1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function getConfig(overrides = {}) {
  if (!overrides.skipEnv) loadEnv(overrides.envFile);
  const nodeEnv = overrides.nodeEnv ?? process.env.NODE_ENV ?? 'development';
  const port = Number(overrides.port ?? process.env.PORT ?? 3000);
  const sessionSecret = overrides.sessionSecret ?? process.env.SESSION_SECRET ?? '';
  const databaseUrl = overrides.databaseUrl ?? process.env.DATABASE_URL ?? '';
  const migrationsDatabaseUrl = overrides.migrationsDatabaseUrl ?? process.env.MIGRATIONS_DATABASE_URL ?? '';
  const production = nodeEnv === 'production';
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT должен быть целым числом от 1 до 65535.');
  if (production && sessionSecret.length < 32) throw new Error('Production запуск остановлен: задайте SESSION_SECRET длиной не менее 32 символов.');
  if (production && !databaseUrl) throw new Error('Production запуск остановлен: задайте DATABASE_URL к внешней базе PostgreSQL, например Neon.');
  if (production && !migrationsDatabaseUrl) throw new Error('Production запуск остановлен: задайте MIGRATIONS_DATABASE_URL — прямое подключение PostgreSQL без пулера для миграций.');
  if (production && migrationsDatabaseUrl) {
    let migrationHost = '';
    try { migrationHost = new URL(migrationsDatabaseUrl).hostname; }
    catch { throw new Error('MIGRATIONS_DATABASE_URL должен быть корректной PostgreSQL-строкой подключения.'); }
    if (migrationHost.includes('-pooler.')) throw new Error('MIGRATIONS_DATABASE_URL должен использовать прямой endpoint без -pooler.');
  }
  if (!production && !sessionSecret && !overrides.allowGeneratedSecret) throw new Error('SESSION_SECRET не задан. Скопируйте .env.example в .env или запустите start.bat/start.sh.');
  return {
    root,
    publicDir: path.join(root, 'outputs'),
    port,
    nodeEnv,
    production,
    databaseUrl,
    migrationsDatabaseUrl,
    pgliteDir: overrides.pgliteDir || path.resolve(root, process.env.PGLITE_DIR || './data/pglite'),
    sessionSecret,
    setupToken: overrides.setupToken ?? process.env.SETUP_TOKEN ?? '',
    privacyContact: String(overrides.privacyContact ?? process.env.PRIVACY_CONTACT ?? '').trim().slice(0, 240),
    allowedOrigins: String(overrides.allowedOrigins ?? process.env.ALLOWED_ORIGINS ?? '').split(',').map((value) => value.trim()).filter(Boolean),
    trustProxy: String(overrides.trustProxy ?? process.env.TRUST_PROXY ?? '0') === '1'
  };
}

module.exports = { getConfig, loadEnv };
