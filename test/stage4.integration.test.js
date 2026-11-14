const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('playwright');
const { zipSync, strToU8 } = require('fflate');
const jsQR = require('jsqr');
const { createApp } = require('../server/app');
const { hashPassword } = require('../server/auth');

const teacherLogin = 'stage4.teacher';
const teacherPassword = 'Stage4Teacher#2026';
const studentLogin = 'stage4.student';
const studentPassword = 'Stage4Student#2026';

function makeRosterXlsx() {
  const shared = ['ФИО', 'Логин', 'Ученица XLSX', 'xlsx.student'];
  const sharedXml = `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="4" uniqueCount="4">${shared.map(value => `<si><t>${value}</t></si>`).join('')}</sst>`;
  const sheetXml = `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row><row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2" t="s"><v>3</v></c></row></sheetData></worksheet>`;
  return zipSync({
    '[Content_Types].xml': strToU8('<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>'),
    'xl/workbook.xml': strToU8('<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Roster" sheetId="1" r:id="rId1"/></sheets></workbook>'),
    'xl/_rels/workbook.xml.rels': strToU8('<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'),
    'xl/sharedStrings.xml': strToU8(sharedXml),
    'xl/worksheets/sheet1.xml': strToU8(sheetXml),
  });
}

async function signIn(page, base, login, password) {
  await page.goto(`${base}/login.html`);
  await page.locator('[name="login"]').fill(login);
  await page.locator('[name="password"]').fill(password);
  await page.locator('[data-login-form] button[type="submit"]').click();
  await page.waitForURL(url => !url.pathname.endsWith('/login.html'), { timeout: 10000 });
}

async function checkAccessibility(page, label) {
  if (!(await page.evaluate(() => Boolean(window.axe)))) {
    await page.addInitScript({ path: require.resolve('axe-core') });
    await page.reload();
    await page.waitForFunction(() => Boolean(window.axe));
  }
  await page.waitForTimeout(200);
  const results = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
  const serious = results.violations.filter(item => ['serious', 'critical'].includes(item.impact));
  const theme = await page.evaluate(() => { const node = document.querySelector('[data-theme-label]'), style = node && getComputedStyle(node); return node ? { theme: document.documentElement.dataset.theme, text: node.textContent, color: style.color, background: style.backgroundColor, button: getComputedStyle(node.closest('button')).backgroundColor } : null; });
  const details = serious.map(item => ({ rule: item.id, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary, checks: node.any })) }));
  assert.deepEqual(details, [], `${label} should have no serious accessibility violations: ${JSON.stringify({ theme, details })}`);
}

async function printCredentialCards(page) {
  await page.evaluate(() => {
    window.__printedCredentials = '';
    window.open = () => ({
      document: { open() {}, write(markup) { window.__printedCredentials = markup; }, close() {}, getElementById() { return { addEventListener() {} }; } },
      print() {}, set opener(value) { void value; }
    });
  });
  await page.getByRole('button', { name: 'Распечатать карточки' }).click();
  await page.waitForFunction(() => window.__printedCredentials.includes('Карточки для входа'));
  const markup = await page.evaluate(() => window.__printedCredentials);
  assert.match(markup, /@page\{size:A4 portrait/);
  assert.match(markup, /<article class="card">/);
  assert.match(markup, /data:image\/png;base64/);
  await page.keyboard.press('Escape');
}

test('Stage 4: teacher workflow, roster imports and QR cards work across desktop and mobile', { timeout: 120000 }, async () => {
  fs.mkdirSync('report/stage-4', { recursive: true });
  const app = await createApp({ pgliteDir: ':memory:', sessionSecret: 'stage4-browser-test-session-secret-at-least-32' });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  const errors = [];
  try {
    const db = app.locals.db, timestamp = new Date().toISOString();
    const teacherId = (await db.query("INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES('teacher',$1,$2,'Учитель этапа 4',1,$3) RETURNING id", [teacherLogin, await hashPassword(teacherPassword), timestamp])).rows[0].id;
    const classId = (await db.query('INSERT INTO classes(teacher_id,name,school_year,created_at) VALUES($1,$2,$3,$4) RETURNING id', [teacherId, '8А', '2026–2027', timestamp])).rows[0].id;
    const studentId = (await db.query("INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at) VALUES('student',$1,$2,'Ученик этапа 4',$3,0,$4) RETURNING id", [studentLogin, await hashPassword(studentPassword), classId, timestamp])).rows[0].id;
    const future = new Date(Date.now() + 2 * 86400000).toISOString();
    for (const [title, status] of [['Сделать проект', null], ['На проверке', 'submitted'], ['Исправить страницу', 'returned'], ['Готовая работа', 'accepted']]) {
      const taskId = (await db.query("INSERT INTO assignments(class_id,title,description,starter_html,starter_css,allow_resubmit,no_hints,status,checks_json,target_all,due_at,created_at,updated_at) VALUES($1,$2,'Собери страницу.','<main><h1>Пример</h1></main>','main { padding: 1rem; }',1,0,'published','[]',1,$3,$4,$4) RETURNING id", [classId, title, future, timestamp])).rows[0].id;
      if (status) {
        const submissionId = (await db.query('INSERT INTO submissions(assignment_id,student_id,status,submitted_at,created_at,updated_at) VALUES($1,$2,$3,$4,$4,$4) RETURNING id', [taskId, studentId, status, timestamp])).rows[0].id;
        await db.query("INSERT INTO submission_versions(submission_id,html,css,kind,created_at) VALUES($1,'<main><h1>Моя работа</h1></main>','main { padding: 1rem; }','submitted',$2)", [submissionId, timestamp]);
        if (status === 'returned') await db.query("UPDATE submissions SET teacher_comment='Добавь заголовок и проверь отступы.' WHERE id=$1", [submissionId]);
        if (status === 'accepted') await db.query('UPDATE submissions SET score=8,graded_at=$1 WHERE id=$2', [timestamp, submissionId]);
      }
    }
    const past = new Date(Date.now() - 2 * 86400000).toISOString();
    await db.query("INSERT INTO assignments(class_id,title,description,allow_resubmit,no_hints,status,checks_json,target_all,due_at,created_at,updated_at) VALUES($1,'Просроченное задание','Отправь работу.',1,0,'published','[]',1,$2,$3,$3)", [classId, past, timestamp]);
    await db.query("INSERT INTO user_settings(user_id,weekly_goal,last_course_location,updated_at) VALUES($1,4,$2,$3)", [studentId, '/lesson-view.html?lesson=1#first-step', timestamp]);
    await db.query('INSERT INTO student_activity_days(user_id,active_on) VALUES($1,CURRENT_DATE),($1,CURRENT_DATE-1)', [studentId]);

    browser = await chromium.launch({ headless: true });
    const teacher = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });
    teacher.on('pageerror', error => errors.push(error.message));
    teacher.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    teacher.on('request', request => { if (new URL(request.url()).origin !== base) errors.push(`external request: ${request.url()}`); });
    await signIn(teacher, base, teacherLogin, teacherPassword);
    await teacher.locator('[data-open-class]').first().click();
    await teacher.waitForURL(url => url.searchParams.get('class') === String(classId));
    await teacher.locator('[data-overview-stats]').waitFor();
    assert.match(await teacher.locator('[data-overview-stats]').innerText(), /Срок в ближайшие 3 дня/);
    await checkAccessibility(teacher, 'teacher overview');
    await teacher.screenshot({ path: 'report/stage-4/teacher-overview-desktop-light.png', fullPage: true });
    await teacher.locator('.account-workspace-sidebar [data-tab="students"]').click();
    await teacher.waitForURL(url => url.searchParams.get('view') === 'students');
    await teacher.locator('select[data-student-filter]').selectOption('overdue');
    assert.match(await teacher.locator('[data-tab-panel]').innerText(), /1 просрочено/);
    await teacher.locator('[data-student-search]').fill('Ученик этапа');
    await teacher.locator('[data-student-search]').fill('');
    await checkAccessibility(teacher, 'teacher students list');
    await teacher.goBack();
    await teacher.waitForURL(url => url.searchParams.get('view') === 'overview');
    await teacher.goForward();
    await teacher.waitForURL(url => url.searchParams.get('view') === 'students');

    await teacher.locator('[data-action="import-students"]').click();
    await teacher.locator('input[type="file"]').setInputFiles({ name: 'class.csv', mimeType: 'text/csv', buffer: Buffer.from('ФИО;Логин\r\nУченица CSV;csv.student\r\n') });
    await teacher.locator('[data-import-row]').waitFor();
    assert.equal(await teacher.locator('[data-import-login]').inputValue(), 'csv.student');
    await teacher.locator('[data-import-status]').getByText(/Проверено строк/).waitFor();
    const importResponsePromise = teacher.waitForResponse(response => new URL(response.url()).pathname.endsWith('/students/import'));
    await teacher.locator('[data-dialog] button[type="submit"]').click();
    const importedResponse = await (await importResponsePromise).json();
    await teacher.waitForFunction(() => document.querySelector('[data-credential-qr]')?.complete && document.querySelector('[data-credential-qr]')?.naturalWidth > 0);
    assert.equal(importedResponse.credentials[0].login, 'csv.student');
    await teacher.locator('[data-credential-qr]').waitFor();
    assert.equal(new URL(await teacher.locator('[data-credential-qr]').getAttribute('data-credential-qr')).searchParams.get('login'), 'csv.student');
    await teacher.locator('[data-credential-qr]').evaluate(image => image.decode());
    const qrImage = await teacher.locator('[data-credential-qr]').evaluate(image => {
      const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
      const value = context.getImageData(0, 0, canvas.width, canvas.height);
      return { width: canvas.width, height: canvas.height, data: Array.from(value.data) };
    });
    const decodedQr = jsQR(new Uint8ClampedArray(qrImage.data), qrImage.width, qrImage.height);
    assert.ok(decodedQr, 'the student login QR must decode');
    const qrUrl = new URL(decodedQr.data);
    assert.equal(qrUrl.pathname, '/login.html');
    assert.equal(qrUrl.searchParams.get('login'), 'csv.student', decodedQr.data);
    assert.equal(qrUrl.searchParams.has('password'), false);
    await printCredentialCards(teacher);
    const pagination = await teacher.evaluate(() => {
      window.__printedCredentials = '';
      window.open = () => ({ document: { open() {}, write(markup) { window.__printedCredentials = markup; }, close() {}, getElementById() { return { addEventListener() {} }; } }, print() {}, set opener(value) { void value; } });
      const cards = Array.from({ length: 9 }, (_, index) => ({ full_name: `Ученик ${index + 1}`, login: `learner.${index + 1}`, password: 'Temporary#2026', qr_url: 'data:image/png;base64,AAAA' }));
      window.CourseAccounts.printCredentials(cards);
      const markup = window.__printedCredentials;
      return { pages: (markup.match(/<section class="page">/g) || []).length, cards: (markup.match(/<article class="card">/g) || []).length, paper: /@page\{size:A4 portrait/.test(markup) };
    });
    assert.deepEqual(pagination, { pages: 2, cards: 9, paper: true }, 'print cards should use two A4 pages for nine students');

    await teacher.locator('[data-action="import-students"]').click();
    await teacher.locator('input[type="file"]').setInputFiles({ name: 'class.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from(makeRosterXlsx()) });
    await teacher.locator('[data-import-row]').waitFor();
    assert.equal(await teacher.locator('[data-import-name]').inputValue(), 'Ученица XLSX');
    await teacher.screenshot({ path: 'report/stage-4/import-preview-desktop-light.png', fullPage: true });
    await teacher.locator('[data-dialog] button[type="submit"]').click();
    await teacher.locator('[data-credential-qr]').waitFor();
    await printCredentialCards(teacher);

    await teacher.setViewportSize({ width: 375, height: 812 });
    await teacher.locator('.account-teacher-mobile-tabs [data-tab="students"]').click();
    await teacher.locator('select[data-student-filter]').selectOption('all');
    assert.equal(await teacher.locator('.account-teacher-mobile-tabs button').count(), 7, 'all class sections, including analytics, are available in mobile navigation');
    assert.equal(await teacher.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'teacher workspace should not overflow horizontally on mobile');
    await teacher.locator('[data-theme-toggle]').click();
    await teacher.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await checkAccessibility(teacher, 'teacher mobile dark mode');
    await teacher.screenshot({ path: 'report/stage-4/teacher-students-mobile-dark.png' });
    await teacher.locator('.account-teacher-mobile-tabs [data-tab="audit"]').click();
    await teacher.locator('h3').filter({ hasText: 'История действий учителя' }).waitFor();

    const student = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: 'light' });
    student.on('pageerror', error => errors.push(error.message));
    student.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    student.on('request', request => { if (new URL(request.url()).origin !== base) errors.push(`external request: ${request.url()}`); });
    await signIn(student, base, studentLogin, studentPassword);
    await student.waitForSelector('[data-student-dashboard]');
    assert.match(await student.locator('[data-student-dashboard]').innerText(), /доработки/i);
    assert.match(await student.locator('[data-student-dashboard]').innerText(), /цель на неделю/i);
    await checkAccessibility(student, 'student home');
    await student.screenshot({ path: 'report/stage-4/student-home-desktop-light.png', fullPage: true });
    await student.setViewportSize({ width: 375, height: 812 });
    assert.equal(await student.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'student home should not overflow horizontally on mobile');
    await student.locator('[data-theme-toggle]').click();
    await student.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    await checkAccessibility(student, 'student mobile dark mode');
    await student.screenshot({ path: 'report/stage-4/student-home-mobile-dark.png' });
    await student.goto(`${base}/student/profile.html`);
    await student.locator('.account-grade-chart').waitFor();
    await student.getByText('Таблица значений графика').click();
    assert.ok(await student.locator('.account-grade-chart').locator('xpath=following-sibling::details//table').count());
    await checkAccessibility(student, 'student profile with chart table');
    await student.screenshot({ path: 'report/stage-4/student-profile-mobile-dark.png' });
    await student.goto(`${base}/lesson-view.html?lesson=1`);
    await student.getByText('Мои заметки').click();
    await student.locator('[data-lesson-note]').waitFor();
    await student.locator('[data-lesson-note]').fill('Сохранённая личная заметка');
    await student.waitForFunction(() => document.querySelector('[data-lesson-note-status]')?.textContent.includes('Сохранено'), null, { timeout: 10000 });
    await student.reload();
    await student.waitForFunction(() => document.querySelector('[data-lesson-note]')?.value === 'Сохранённая личная заметка');
    assert.equal(await student.locator('[data-lesson-note]').inputValue(), 'Сохранённая личная заметка');
    assert.deepEqual(errors, [], `browser errors and external requests: ${errors.join('; ')}`);
    fs.writeFileSync('report/stage-4/browser-check.json', JSON.stringify({
      result: 'passed',
      imports: ['CSV', 'XLSX'],
      qr: { decoded: true, includesLogin: true, includesPassword: false },
      print: { pagesForNineStudents: pagination.pages, cards: pagination.cards, paper: 'A4' },
      viewports: [1280, 375],
      colorSchemes: ['light', 'dark'],
      accessibility: 'No serious or critical WCAG 2.1 A/AA violations in tested views.',
      lessonNotes: 'Saved through the student session and restored after reload.',
      browserErrors: errors
    }, null, 2), 'utf8');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
    await app.locals.db.close();
  }
});
