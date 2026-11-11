const esbuild = require('esbuild');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'outputs', 'assets', 'vendor');
fs.mkdirSync(out, { recursive: true });
esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'main.js')],
  outfile: path.join(out, 'code-editor.js'),
  bundle: true,
  minify: true,
  sourcemap: false,
  format: 'iife',
  target: ['es2020'],
  legalComments: 'none',
  treeShaking: true,
  platform: 'browser',
});
const size = fs.statSync(path.join(out, 'code-editor.js')).size;
console.log(`Сборка CodeMirror 6 завершена: outputs/assets/vendor/code-editor.js (${(size / 1024).toFixed(1)} КБ)`);
