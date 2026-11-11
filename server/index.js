const os = require('node:os');
const path = require('node:path');
const { createApp } = require('./app');
const { getConfig } = require('./config');
const { saveBackup } = require('./scripts/backup');

function localAddresses() {
  return Object.values(os.networkInterfaces()).flat().filter((item) => item && item.family === 'IPv4' && !item.internal).map((item) => item.address);
}

async function start() {
  const config = getConfig();
  const app = await createApp(config);
  let backupTimer = null;
  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`Код по полочкам запущен: http://localhost:${config.port}/start`);
    if (!config.databaseUrl) console.log(`Локальная база PGlite: ${config.pgliteDir}`);
    const addresses = localAddresses();
    if (addresses.length) console.log(`В локальной сети откройте: ${addresses.map((ip) => `http://${ip}:${config.port}/start`).join(', ')}`);
    if (!config.production && !config.databaseUrl) {
      const saveDaily = () => saveBackup(app.locals.db, path.join(config.root, 'backups'), config.sessionSecret, { daily: true }).catch((error) => console.error('Не удалось создать ежедневную копию:', error.message));
      void saveDaily();
      backupTimer = setInterval(saveDaily, 24 * 60 * 60 * 1000);
      backupTimer.unref();
    }
  });
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    clearInterval(app.locals.maintenanceTimer);
    if (backupTimer) clearInterval(backupTimer);
    server.close(async () => {
      try { await app.locals.db.close(); process.exit(0); }
      catch (error) { console.error('Не удалось штатно закрыть базу:', error.message); process.exit(1); }
    });
    const timeout = setTimeout(() => server.closeAllConnections(), 20_000);
    timeout.unref();
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  server.on('error', async (error) => { console.error(error.message); await app.locals.db.close(); process.exitCode = 1; });
  return { app, server, stop };
}

if (require.main === module) start().catch((error) => { console.error(error.message); process.exitCode = 1; });

module.exports = { start, localAddresses };
