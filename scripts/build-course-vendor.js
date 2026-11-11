const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'node_modules', 'bootstrap');
const target = path.join(root, 'outputs', 'assets', 'vendor');

async function main() {
  await fs.mkdir(target, { recursive: true });
  await Promise.all([
    fs.copyFile(path.join(source, 'dist', 'css', 'bootstrap.min.css'), path.join(target, 'bootstrap.min.css')),
    fs.copyFile(path.join(source, 'LICENSE'), path.join(target, 'bootstrap-LICENSE.txt')),
  ]);
  console.log('Локальные файлы Bootstrap скопированы в outputs/assets/vendor.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
