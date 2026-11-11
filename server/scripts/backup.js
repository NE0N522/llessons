const fs = require('node:fs/promises');
const path = require('node:path');
const { openDatabase } = require('../db');
const { getConfig } = require('../config');
const { createBackup, signature } = require('../backup');

async function saveBackup(db, directory, secret, { daily = false, retention = 14 } = {}) {
  await fs.mkdir(directory, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const name = daily ? `classroom-${date}.json` : `classroom-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const filename = path.join(directory, name);
  const backup = await createBackup(db);
  backup.checksum = signature(backup, secret);
  await fs.writeFile(filename, `${JSON.stringify(backup, null, 2)}\n`, { flag: daily ? 'wx' : 'w' }).catch((error) => {
    if (daily && error.code === 'EEXIST') return;
    throw error;
  });
  const files = (await fs.readdir(directory)).filter((file) => /^classroom-\d{4}-\d{2}-\d{2}\.json$/.test(file)).sort();
  await Promise.all(files.slice(0, Math.max(0, files.length - retention)).map((file) => fs.unlink(path.join(directory, file))));
  return filename;
}

async function main() {
  const config = getConfig();
  const db = await openDatabase(config);
  try {
    const filename = await saveBackup(db, path.resolve(config.root, 'backups'), config.sessionSecret);
    console.log(`Резервная копия создана: ${filename}`);
  } finally { await db.close(); }
}

if (require.main === module) main().catch((error) => { console.error(error.message); process.exitCode = 1; });
module.exports = { saveBackup };
