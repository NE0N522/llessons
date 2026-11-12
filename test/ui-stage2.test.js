const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { formatDate, formatDueDate, setMessage } = require('../outputs/assets/app/accounts/ui-utils');
const { createApp, isPublicPath } = require('../server/app');

test('Stage 2: account dates use numeric day-month-year and a 24-hour clock', () => {
  const instant = '2026-03-02T04:05:00.000Z';
  assert.equal(formatDate(instant, { timeZone: 'UTC' }), '02.03.2026 04:05');
  assert.equal(formatDate(instant, { timeZone: 'UTC', includeTime: false }), '02.03.2026');
  assert.match(formatDueDate('2026-11-15T19:30:00.000Z', { timeZone: 'UTC' }), /15.*ноября.*2026.*19:30/);
  assert.equal(formatDate('not a date'), '—');
  assert.equal(formatDueDate(null), 'Без срока');
});

test('Stage 2: empty inline message is hidden and has no visible copy', () => {
  const element = { textContent: '', hidden: false, dataset: {} };
  assert.equal(setMessage(element, '  \n  ', 'error'), true);
  assert.equal(element.textContent, '');
  assert.equal(element.hidden, true);
  assert.equal(setMessage(element, 'Готово', 'success'), false);
  assert.equal(element.hidden, false);
});

test('Stage 2: account UI has no native popups and uses layered theme tokens', () => {
  const root = path.join(__dirname, '..', 'outputs', 'assets', 'app', 'accounts');
  const scripts = fs.readdirSync(root).filter((name) => name.endsWith('.js'));
  for (const script of scripts) {
    const source = fs.readFileSync(path.join(root, script), 'utf8');
    assert.doesNotMatch(source, /window\.(?:confirm|alert|prompt)\s*\(/, `${script} should use the shared dialog`);
  }
  const stylesheet = fs.readFileSync(path.join(root, 'accounts.css'), 'utf8');
  assert.match(stylesheet, /@layer account\.tokens, account\.base, account\.components, account\.pages/);
  assert.match(stylesheet, /--account-accent:/, 'the accent palette should live in the token layer');
  assert.doesNotMatch(stylesheet, /var\(--v3-/, 'account pages should not depend on course theme variables');
  const componentStyles = stylesheet.slice(stylesheet.indexOf('@layer account.base'));
  assert.match(componentStyles, /var\(--account-(?:surface|ink|line|accent)(?:-[\w-]+)?\)/, 'account components should use the standalone palette');
  assert.equal(fs.existsSync(path.join(root, 'setup.css')), false, 'setup styles should be merged into accounts.css');
  assert.equal(isPublicPath('/ui-kit.html'), false, 'the component catalog must not enter the public static allowlist');
});

test('Stage 2: UI kit is available in development and hidden in production', async () => {
  const db = { query: async () => ({ rows: [] }) };
  const run = async (nodeEnv) => {
    const app = await createApp({ db, nodeEnv, databaseUrl: nodeEnv === 'production' ? 'postgres://unused-pooler' : '', migrationsDatabaseUrl: nodeEnv === 'production' ? 'postgres://unused-direct' : '', sessionSecret: 'stage-two-ui-kit-secret-at-least-32-chars' });
    const server = app.listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    try {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/ui-kit.html`);
      return { status: response.status, body: await response.text() };
    } finally {
      clearInterval(app.locals.maintenanceTimer);
      await new Promise((resolve) => server.close(resolve));
    }
  };
  const development = await run('development');
  assert.equal(development.status, 200);
  assert.match(development.body, /Библиотека компонентов/);
  const production = await run('production');
  assert.equal(production.status, 404);
});

test('Stage 2: HTML is never cached and versioned account assets are immutable', async () => {
  const db = { query: async () => ({ rows: [] }) };
  const app = await createApp({ db, nodeEnv: 'production', databaseUrl: 'postgres://unused-pooler', migrationsDatabaseUrl: 'postgres://unused-direct', sessionSecret: 'stage-two-cache-secret-at-least-32-characters' });
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const html = await fetch(`${base}/login.html`);
    const css = await fetch(`${base}/assets/app/accounts/accounts.css?v=test-version`);
    assert.equal(html.headers.get('cache-control'), 'no-store');
    assert.equal(css.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  } finally {
    clearInterval(app.locals.maintenanceTimer);
    await new Promise((resolve) => server.close(resolve));
  }
});
