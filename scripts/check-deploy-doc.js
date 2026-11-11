const fs = require('node:fs');
const path = require('node:path');
const packageJson = require('../package.json');

const root = path.resolve(__dirname, '..');
const deployPath = path.join(root, 'docs', 'DEPLOY.md');
const deploy = fs.readFileSync(deployPath, 'utf8');
const checks = [];
function check(label, condition) {
  checks.push({ label, ok: Boolean(condition) });
}
function exists(relative) { return fs.existsSync(path.join(root, relative)); }

for (const file of ['.env.example', 'package-lock.json', 'render.yaml', 'server/index.js', 'server/scripts/check-db.js', 'server/scripts/create-teacher.js', 'outputs/privacy.html']) {
  check(`Файл ${file}`, exists(file));
}
for (const script of ['db:check', 'backup', 'restore']) {
  check(`npm run ${script}`, Boolean(packageJson.scripts?.[script]));
}
check('npm ci (package-lock.json)', exists('package.json') && exists('package-lock.json'));
check('Render startCommand указывает на сервер', /startCommand:\s*node server\/index\.js/.test(fs.readFileSync(path.join(root, 'render.yaml'), 'utf8')));
check('Render healthCheckPath существует в приложении', /healthCheckPath:\s*\/healthz/.test(fs.readFileSync(path.join(root, 'render.yaml'), 'utf8')) && /app\.get\('\/healthz'/.test(fs.readFileSync(path.join(root, 'server', 'app.js'), 'utf8')));
check('Pooled DATABASE_URL и direct MIGRATIONS_DATABASE_URL описаны для Neon', /DATABASE_URL/.test(deploy) && /MIGRATIONS_DATABASE_URL/.test(deploy) && /sslmode=require/.test(deploy));
check('Render Blueprint запрашивает оба PostgreSQL endpoint', /key:\s*DATABASE_URL/.test(fs.readFileSync(path.join(root, 'render.yaml'), 'utf8')) && /key:\s*MIGRATIONS_DATABASE_URL/.test(fs.readFileSync(path.join(root, 'render.yaml'), 'utf8')));
check('Production требует прямой URL для миграций, а db:check отказывается без него', /MIGRATIONS_DATABASE_URL/.test(fs.readFileSync(path.join(root, 'server', 'config.js'), 'utf8')) && /MIGRATIONS_DATABASE_URL/.test(fs.readFileSync(path.join(root, 'server', 'scripts', 'check-db.js'), 'utf8')));
check('PRIVACY_CONTACT доступен через страницу данных', /PRIVACY_CONTACT/.test(deploy) && /privacy-contact/.test(fs.readFileSync(path.join(root, 'server', 'app.js'), 'utf8')));
check('Render Blueprint запрашивает контакт учителя для страницы данных', /key:\s*PRIVACY_CONTACT/.test(fs.readFileSync(path.join(root, 'render.yaml'), 'utf8')));

const missingLinks = [];
for (const [relative, content] of [['docs/DEPLOY.md', deploy], ['README.md', fs.readFileSync(path.join(root, 'README.md'), 'utf8')]]) {
  const docDir = path.dirname(path.join(root, relative));
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0].split('?')[0];
    if (!target || /^[a-z]+:\/\//i.test(target) || target.startsWith('mailto:')) continue;
    if (!fs.existsSync(path.resolve(docDir, target))) missingLinks.push(`${relative} → ${target}`);
  }
}
check('Локальные ссылки DEPLOY.md и README.md', missingLinks.length === 0);

const failed = checks.filter(item => !item.ok);
for (const item of checks) console.log(`${item.ok ? 'OK' : 'FAIL'} ${item.label}`);
if (missingLinks.length) console.error(`Ссылки не найдены: ${missingLinks.join(', ')}`);
console.log(`Проверка руководства: ${checks.length - failed.length}/${checks.length} пунктов пройдено.`);
if (failed.length) process.exitCode = 1;
