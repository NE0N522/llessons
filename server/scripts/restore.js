const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { openDatabase } = require('../db');
const { getConfig } = require('../config');
const { restoreBackup, signature, validateBackup } = require('../backup');
const { ask } = require('./prompt');

async function main() {
  const args = process.argv.slice(2);
  const filename = args.find((item) => !item.startsWith('--'));
  if (!filename) throw new Error('Использование: npm run restore -- путь-к-файлу.json [--force]');
  const config = getConfig();
  const backup = JSON.parse(await fs.readFile(path.resolve(filename), 'utf8'));
  validateBackup(backup);
  const expected = signature(backup, config.sessionSecret);
  if (backup.checksum) {
    const a = Buffer.from(expected), b = Buffer.from(backup.checksum);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error('Контрольная подпись резервной копии не совпадает.');
  }
  const db = await openDatabase(config);
  try {
    const force = args.includes('--force');
    if (force) {
      const confirm = await ask('Это заменит текущие данные. Для продолжения введи ВОССТАНОВИТЬ: ');
      if (confirm !== 'ВОССТАНОВИТЬ') throw new Error('Восстановление отменено.');
    }
    const result = await restoreBackup(db, backup, { force });
    console.log(`Данные восстановлены: ${result.restored_rows} записей в ${result.restored_tables} таблицах.`);
  } finally { await db.close(); }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
