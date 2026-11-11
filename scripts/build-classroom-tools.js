const path = require('node:path');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');

build({
  entryPoints: [path.join(root, 'classroom-src', 'tools.js')],
  outfile: path.join(root, 'outputs', 'assets', 'vendor', 'classroom-tools.js'),
  bundle: true,
  minify: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2020'],
  globalName: 'CourseClassroomTools',
  legalComments: 'eof',
  sourcemap: false,
}).then(() => console.log('Локальные инструменты кабинета собраны в outputs/assets/vendor/classroom-tools.js.'))
  .catch((error) => { console.error(error); process.exitCode = 1; });
