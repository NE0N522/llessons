const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createApp, isPublicPath } = require('../server/app');
const { hashPassword } = require('../server/auth');
const { chromium } = require('playwright');

test('Stage 7: teacher lesson guides are returned to teachers only', async () => {
  const app = await createApp({ pgliteDir: ':memory:', sessionSecret: 'stage7-guide-test-secret-with-more-than-32-chars', nodeEnv: 'development', skipEnv: true });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const stamp = new Date().toISOString();
    const teacherHash = await hashPassword('Stage7GuideTeacher#2026');
    const studentHash = await hashPassword('Stage7GuideStudent#2026');
    const teacherId = (await app.locals.db.query("INSERT INTO users(role,login,password_hash,full_name,created_at) VALUES('teacher','stage7.guide.teacher',$1,'Учитель материалов',$2) RETURNING id", [teacherHash, stamp])).rows[0].id;
    const classId = (await app.locals.db.query('INSERT INTO classes(teacher_id,name,created_at) VALUES($1,$2,$3) RETURNING id', [teacherId, 'Класс материалов', stamp])).rows[0].id;
    await app.locals.db.query("INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at) VALUES('student','stage7.guide.student',$1,'Ученик материалов',$2,0,$3)", [studentHash, classId, stamp]);
    const login = async (name, password) => {
      const response = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { origin: base, 'content-type': 'application/json' }, body: JSON.stringify({ login: name, password }) });
      assert.equal(response.status, 200);
      return response.headers.get('set-cookie')?.split(';')[0];
    };
    const [teacherCookie, studentCookie] = await Promise.all([login('stage7.guide.teacher', 'Stage7GuideTeacher#2026'), login('stage7.guide.student', 'Stage7GuideStudent#2026')]);
    assert.equal((await fetch(`${base}/api/teacher/lessons/29/guide`)).status, 401, 'anonymous requests cannot read answers');
    const denied = await fetch(`${base}/api/teacher/lessons/29/guide`, { headers: { cookie: studentCookie } });
    assert.equal(denied.status, 403, 'students cannot read answers');
    const allowed = await fetch(`${base}/api/teacher/lessons/29/guide`, { headers: { cookie: teacherCookie } });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.headers.get('cache-control'), 'no-store');
    const guide = await allowed.json();
    assert.ok(guide.plan?.length && guide.review?.length && guide.answers, 'teacher lesson materials are present');
    const publicLesson = await fetch(`${base}/assets/lessons/lesson-29.js`);
    assert.equal(publicLesson.status, 200);
    assert.doesNotMatch(await publicLesson.text(), /"teacher"\s*:/, 'public lesson data does not contain teacher-only answers');
    assert.equal((await fetch(`${base}/server/lesson-guides/lesson-29.json`)).status, 404, 'guide files are not public static assets');
  } finally {
    clearInterval(app.locals.maintenanceTimer);
    await new Promise(resolve => server.close(resolve));
    await app.locals.db.close();
  }
});

test('Stage 7: privacy page and contact are public and linked from every page', async () => {
  const contact = '<img src=x onerror=alert(1)> · teacher@example.invalid';
  const app = await createApp({ pgliteDir: ':memory:', sessionSecret: 'stage7-privacy-test-secret-with-more-than-32-chars', privacyContact: contact, skipEnv: true });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal(isPublicPath('/privacy.html'), true);
    const page = await fetch(`${base}/privacy.html`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /data-teacher-contact/);
    const publicContact = await fetch(`${base}/api/public/privacy-contact`);
    assert.equal(publicContact.status, 200);
    assert.equal(publicContact.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await publicContact.json(), { contact });

    const outputs = path.join(__dirname, '..', 'outputs');
    const htmlFiles = [];
    const collect = dir => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const target = path.join(dir, entry.name);
        if (entry.isDirectory()) collect(target);
        else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(target);
      }
    };
    collect(outputs);
    for (const filename of htmlFiles) {
      const relative = path.relative(outputs, filename).replaceAll(path.sep, '/');
      const html = fs.readFileSync(filename, 'utf8');
      assert.match(html, /site-privacy-link/, `${relative} contains a privacy footer link`);
      const route = relative === 'setup.html' ? '/setup' : `/${relative}`;
      const response = await fetch(`${base}${route}`);
      assert.equal(response.status, 200, `${route} is served`);
    }
    assert.ok(htmlFiles.length >= 15, `expected all app/course pages, found ${htmlFiles.length}`);
  } finally {
    clearInterval(app.locals.maintenanceTimer);
    await new Promise(resolve => server.close(resolve));
    await app.locals.db.close();
  }
});

test('Stage 7: student assignment switches between condition, code and result responsively', async () => {
  const app = await createApp({ pgliteDir: ':memory:', sessionSecret: 'stage7-tabs-test-secret-with-more-than-32-chars', nodeEnv: 'development', skipEnv: true });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    const db = app.locals.db;
    const stamp = new Date().toISOString();
    const teacherHash = await hashPassword('Stage7Teacher#2026');
    const studentHash = await hashPassword('Stage7Student#2026');
    const teacherId = (await db.query("INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES('teacher','stage7.tabs.teacher',$1,'Учитель вкладок',1,$2) RETURNING id", [teacherHash, stamp])).rows[0].id;
    const classId = (await db.query('INSERT INTO classes(teacher_id,name,school_year,created_at) VALUES($1,$2,$3,$4) RETURNING id', [teacherId, 'Тест вкладок', '2026–2027', stamp])).rows[0].id;
    await db.query("INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at) VALUES('student','stage7.tabs.student',$1,'Ученик вкладок',$2,0,$3)", [studentHash, classId, stamp]);
    const assignmentId = (await db.query("INSERT INTO assignments(class_id,title,description,status,task_type,checks_json,hints_json,starter_html,starter_css,created_at,updated_at) VALUES($1,'Переключение экранов','Выполни задание и посмотри результат.','published','build','[]','[\"Начни с основного контейнера.\"]'::jsonb,'<main><h1>Пример</h1></main>','main { padding: 1rem; }',$2,$2) RETURNING id", [classId, stamp])).rows[0].id;
    const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { origin: base, 'content-type': 'application/json' }, body: JSON.stringify({ login: 'stage7.tabs.student', password: 'Stage7Student#2026' }) });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie')?.split(';')[0];
    assert.ok(cookie, 'student login returns a session cookie');

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 375, height: 900 } });
    const cookieSeparator = cookie.indexOf('=');
    await context.addCookies([{ name: cookie.slice(0, cookieSeparator), value: cookie.slice(cookieSeparator + 1), url: base, httpOnly: true, sameSite: 'Lax' }]);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(`${base}/student/assignment.html?id=${assignmentId}`, { waitUntil: 'load' });
    await page.locator('[data-editor-host="html"] .cm-editor').waitFor({ state: 'visible', timeout: 15000 });

    const tabs = page.locator('[data-assignment-tabs]');
    const conditionTab = page.locator('[data-assignment-tab="condition"]');
    const codeTab = page.locator('[data-assignment-tab="code"]');
    const resultTab = page.locator('[data-assignment-tab="result"]');
    const codePane = page.locator('[data-assignment-pane="code"]').last();
    const resultPane = page.locator('[data-assignment-pane="result"]');
    assert.equal(await tabs.isVisible(), true);
    assert.equal(await page.locator('[data-assignment-tab]:visible').count(), 2);
    assert.equal(await conditionTab.isVisible(), false);
    assert.equal(await codeTab.getAttribute('aria-pressed'), 'true');
    assert.equal(await codePane.isVisible(), true);
    assert.equal(await resultPane.isVisible(), false);
    const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(mobileOverflow, false, '375 px assignment has no horizontal overflow');

    await resultTab.focus();
    await resultTab.press('Enter');
    assert.equal(await resultTab.getAttribute('aria-pressed'), 'true');
    assert.equal(await resultPane.isVisible(), true);
    assert.equal(await codePane.isVisible(), false);

    await page.setViewportSize({ width: 768, height: 900 });
    await conditionTab.waitFor({ state: 'visible' });
    assert.equal(await conditionTab.isVisible(), true);
    assert.equal(await page.locator('[data-assignment-tab]:visible').count(), 3);
    await conditionTab.click();
    assert.equal(await conditionTab.getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('.account-question-panel').isVisible(), true);
    assert.equal(await codePane.isVisible(), false);
    const tabletOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(tabletOverflow, false, '768 px assignment has no horizontal overflow');

    await codeTab.click();
    assert.equal(await codePane.isVisible(), true);
    assert.equal(await page.locator('[data-editor-host="html"] .cm-editor').isVisible(), true);
    await page.setViewportSize({ width: 1280, height: 900 });
    await tabs.waitFor({ state: 'hidden' });
    assert.equal(await tabs.isVisible(), false);
    assert.equal(await codePane.isVisible(), true);
    assert.equal(await resultPane.isVisible(), true);
    const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(desktopOverflow, false, '1280 px assignment has no horizontal overflow');
    assert.deepEqual(errors, []);
    await context.close();
  } finally {
    if (browser) await browser.close();
    clearInterval(app.locals.maintenanceTimer);
    await new Promise(resolve => server.close(resolve));
    await app.locals.db.close();
  }
});
