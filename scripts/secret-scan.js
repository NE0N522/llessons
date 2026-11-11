const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const ignoredDirectories = new Set(['.git', 'node_modules', 'data', 'backups', 'work']);
const textExtensions = new Set(['.js', '.cjs', '.mjs', '.json', '.html', '.css', '.md', '.txt', '.yml', '.yaml', '.sql', '.sh', '.bat', '.ps1']);
const patterns = [
  ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/],
  ['Slack token', /\bxox[baprs]-[0-9A-Za-z-]{20,}\b/],
  ['PostgreSQL URL with embedded credentials', /\bpostgres(?:ql)?:\/\/[^\s:/]+:[^\s@/]+@[^\s/]+/i]
];

async function listTextFiles(directory, relative = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const childRelative = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) files.push(...await listTextFiles(path.join(directory, entry.name), childRelative));
      continue;
    }
    if (!entry.isFile() || entry.name === '.env' || (entry.name.startsWith('.env.') && entry.name !== '.env.example')) continue;
    if (entry.name.endsWith('.zip') || entry.name.endsWith('.db') || entry.name.endsWith('.db-shm') || entry.name.endsWith('.db-wal')) continue;
    if (textExtensions.has(path.extname(entry.name).toLowerCase())) files.push({ absolute: path.join(directory, entry.name), relative: childRelative });
  }
  return files;
}

async function main() {
  const files = await listTextFiles(root);
  const findings = [];
  for (const file of files) {
    const content = await fs.readFile(file.absolute, 'utf8');
    for (const [label, pattern] of patterns) {
      const match = pattern.exec(content);
      if (match) {
        const line = content.slice(0, match.index).split('\n').length;
        findings.push({ file: path.relative(root, file.absolute), line, label });
      }
    }
  }
  const ignore = await fs.readFile(path.join(root, '.gitignore'), 'utf8');
  const requiredIgnores = ['node_modules/', '.env', 'data/', 'backups/'];
  const missingIgnores = requiredIgnores.filter(value => !ignore.split(/\r?\n/).includes(value));
  console.log(`Проверено текстовых файлов: ${files.length}. Локальные .env, базы, node_modules, backups и work исключены.`);
  if (missingIgnores.length) console.error(`В .gitignore нет обязательных исключений: ${missingIgnores.join(', ')}.`);
  for (const finding of findings) console.error(`Найден шаблон ${finding.label}: ${finding.file}:${finding.line}`);
  if (findings.length || missingIgnores.length) process.exitCode = 1;
  else console.log('Подозрительных ключей, токенов и PostgreSQL URL с паролем не найдено; .gitignore содержит обязательные исключения.');
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
