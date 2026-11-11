const { getConfig } = require('../config');
const { openDatabase } = require('../db');

async function main() {
  const config = getConfig();
  if (!config.databaseUrl) throw new Error('DATABASE_URL не задан. Команда проверяет только удалённый PostgreSQL.');
  if (!config.migrationsDatabaseUrl) throw new Error('MIGRATIONS_DATABASE_URL не задан. Укажи прямой endpoint без -pooler, чтобы проверка применила схему вне connection pooler.');
  const db = await openDatabase(config);
  try {
    const version = (await db.query('SHOW server_version')).rows[0].server_version;
    const migrations = (await db.query('SELECT version,name,applied_at FROM schema_migrations ORDER BY version')).rows;
    const privileges = await db.query("SELECT has_table_privilege(current_user,'users','SELECT,INSERT,UPDATE,DELETE') AS users_rw");
    if (!privileges.rows[0].users_rw) throw new Error('Пользователю DATABASE_URL не хватает прав чтения и записи в таблицу users.');
    console.log(`PostgreSQL подключён: ${version}`);
    console.log(`Миграции применены: ${migrations.map((item) => item.name).join(', ') || 'нет'}`);
    console.log('Права чтения и записи проверены.');
  } finally { await db.close(); }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
