const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const ExcelJS = require('exceljs');
const { createCanvas } = require('@napi-rs/canvas');
const { createApp } = require('../server/app');
const { hashPassword } = require('../server/auth');
const { chromium } = require('playwright');

const reportDir = path.join(__dirname, '..', 'report', 'stage-6');

async function renderPdfPreview(buffer, pngPath) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer), disableWorker: true, useSystemFonts: true, isEvalSupported: false });
  const document = await loadingTask.promise;
  const page = await document.getPage(1);
  const viewport = page.getViewport({ scale: 1.4 });
  const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
  fs.writeFileSync(pngPath, canvas.toBuffer('image/png'));
  const text = [];
  for (let pageIndex = 1; pageIndex <= document.numPages; pageIndex += 1) {
    const current = await document.getPage(pageIndex);
    const content = await current.getTextContent();
    text.push(content.items.map(item => item.str).join(' '));
  }
  const pages = document.numPages;
  await loadingTask.destroy();
  return { text: text.join('\n'), pages };
}

test('Stage 6: analytics, Excel/PDF reports and end-of-year archive/rollover', { timeout: 180000 }, async () => {
  fs.mkdirSync(reportDir, { recursive: true });
  const app = await createApp({ pgliteDir: ':memory:', sessionSecret: 'stage6-integration-secret-at-least-thirty-two-chars' });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (route, { method = 'GET', cookie, body } = {}) => {
    const headers = { origin: base };
    if (cookie) headers.cookie = cookie;
    if (body !== undefined) headers['content-type'] = 'application/json';
    const response = await fetch(`${base}${route}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const type = response.headers.get('content-type') || '';
    const data = type.includes('application/json') ? await response.json() : Buffer.from(await response.arrayBuffer());
    return { response, data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
  };
  let browser;
  try {
    const db = app.locals.db, timestamp = new Date().toISOString();
    const teacherHash = await hashPassword('TeacherStage6#41');
    const studentHash = await hashPassword('StudentStage6#41');
    const teacherId = (await db.query("INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES('teacher','stage6.teacher',$1,'Учитель этапа 6',1,$2) RETURNING id", [teacherHash, timestamp])).rows[0].id;
    const otherTeacherId = (await db.query("INSERT INTO users(role,login,password_hash,full_name,created_at) VALUES('teacher','stage6.other',$1,'Другой учитель',$2) RETURNING id", [teacherHash, timestamp])).rows[0].id;
    const classId = (await db.query('INSERT INTO classes(teacher_id,name,school_year,created_at) VALUES($1,$2,$3,$4) RETURNING id', [teacherId, '7А · этап 6', '2026–2027', timestamp])).rows[0].id;
    const otherClassId = (await db.query('INSERT INTO classes(teacher_id,name,school_year,created_at) VALUES($1,$2,$3,$4) RETURNING id', [otherTeacherId, 'Чужой класс', '2026–2027', timestamp])).rows[0].id;
    const students = [];
    for (let index = 1; index <= 30; index += 1) {
      const id = (await db.query("INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at) VALUES('student',$1,$2,$3,$4,0,$5) RETURNING id", [`stage6.student${String(index).padStart(2, '0')}`, studentHash, `Ученик этапа 6 №${String(index).padStart(2, '0')}`, classId, timestamp])).rows[0].id;
      students.push(id);
    }
    const privateStudent = (await db.query("INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at) VALUES('student','stage6.private',$1,'Ученица с приватностью',$2,0,$3) RETURNING id", [studentHash, otherClassId, timestamp])).rows[0].id;
    const makeAssignment = async (title, type = 'build', hints = []) => Number((await db.query(`INSERT INTO assignments(class_id,title,description,due_at,max_score,target_all,status,task_type,quiz_json,hints_json,checks_json,created_at,updated_at)
      VALUES($1,$2,$3,$4,$5,1,'published',$6,$7::jsonb,$8::jsonb,'[]'::jsonb,$9,$9) RETURNING id`, [classId, title, `Задание ${title}`, new Date(Date.now() + 86400000).toISOString(), type === 'quiz' ? 5 : 10, type, JSON.stringify(type === 'quiz' ? [{ prompt: 'Какой элемент задаёт заголовок?', options: ['h1', 'div'], correct: [0], explanation: 'h1 — заголовок первого уровня.' }] : []), JSON.stringify(hints), timestamp])).rows[0].id);
    const assignment1 = await makeAssignment('Карточка профиля');
    const assignment2 = await makeAssignment('Блок контактов', 'build', ['Начни с семантического контейнера.']);
    const quizId = await makeAssignment('HTML мини-тест', 'quiz');
    await db.query(`INSERT INTO submissions(assignment_id,student_id,status,score,auto_checks_json,submitted_at,graded_at,created_at,updated_at)
      VALUES($1,$2,'accepted',7,'[{"label":"Есть заголовок","passed":true}]'::jsonb,$3,$3,$3,$3)`, [assignment1, students[2], timestamp]);
    await db.query(`INSERT INTO submissions(assignment_id,student_id,status,auto_checks_json,submitted_at,created_at,updated_at)
      VALUES($1,$2,'submitted','[{"label":"Есть заголовок","passed":false},{"label":"У изображения есть alt","passed":false}]'::jsonb,$3,$3,$3)`, [assignment1, students[1], timestamp]);
    await db.query(`INSERT INTO submissions(assignment_id,student_id,status,score,auto_checks_json,submitted_at,graded_at,created_at,updated_at)
      VALUES($1,$2,'accepted',9,'[]'::jsonb,$3,$3,$3,$3)`, [assignment2, students[2], timestamp]);
    await db.query('INSERT INTO student_activity_days(user_id,active_on) VALUES($1,CURRENT_DATE - 40)', [students[29]]);
    const teacherLogin = await request('/api/auth/login', { method: 'POST', body: { login: 'stage6.teacher', password: 'TeacherStage6#41' } });
    const otherLogin = await request('/api/auth/login', { method: 'POST', body: { login: 'stage6.other', password: 'TeacherStage6#41' } });
    assert.equal(teacherLogin.response.status, 200);
    const teacherCookie = teacherLogin.cookie;
    const otherCookie = otherLogin.cookie;

    const analytics = await request(`/api/teacher/classes/${classId}/analytics?inactivity_days=14&missing_min=2`, { cookie: teacherCookie });
    assert.equal(analytics.response.status, 200, JSON.stringify(analytics.data));
    assert.equal(analytics.data.students.length, 30);
    assert.equal(analytics.data.assignments.length, 3);
    assert.equal(analytics.data.cells.length, 3);
    assert.ok(analytics.data.cells.some(cell => Number(cell.id) > 0));
    assert.ok(analytics.data.at_risk.some(item => Number(item.id) === students[29] && item.inactive));
    assert.ok(analytics.data.frequent_errors.some(item => item.check_label === 'Есть заголовок' && Number(item.students_count) === 1));
    assert.ok(analytics.data.timings_ms.total < 5000, `Class analytics took ${analytics.data.timings_ms.total}ms`);
    assert.equal((await request(`/api/teacher/classes/${classId}/analytics`, { cookie: otherCookie })).response.status, 404, 'teachers cannot inspect another teacher’s class');

    const memoryBeforeReports = process.memoryUsage();
    const xlsxStarted = performance.now();
    const xlsx = await request(`/api/teacher/classes/${classId}/export?format=xlsx`, { cookie: teacherCookie });
    const xlsxMs = performance.now() - xlsxStarted;
    assert.equal(xlsx.response.status, 200);
    assert.match(xlsx.response.headers.get('content-type') || '', /spreadsheetml/);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(xlsx.data);
    const journal = workbook.getWorksheet('Журнал');
    const deadlines = workbook.getWorksheet('Сроки и сдачи');
    assert.ok(journal && deadlines, 'both workbook sheets are present');
    assert.equal(journal.rowCount, 32, 'journal has metadata, header and 30 students');
    assert.match(journal.getCell(3, 5).formula, /AVERAGE\(B3:D3\)/);
    assert.equal(journal.views[0].state, 'frozen');
    assert.equal(deadlines.getCell(2, 3).numFmt, 'dd.mm.yyyy');
    assert.equal(deadlines.getCell(2, 4).numFmt, 'dd.mm.yyyy hh:mm');
    fs.writeFileSync(path.join(reportDir, 'class-journal.xlsx'), xlsx.data);
    const csv = await request(`/api/teacher/classes/${classId}/export?format=csv`, { cookie: teacherCookie });
    assert.equal(csv.response.status, 200);
    assert.match(csv.response.headers.get('content-type') || '', /text\/csv/);
    assert.ok(csv.data.toString('utf8').startsWith('\ufeff'), 'CSV keeps its UTF-8 BOM for spreadsheet apps');
    const jsonBackup = await request(`/api/teacher/classes/${classId}/export?format=json`, { cookie: teacherCookie });
    assert.equal(jsonBackup.response.status, 200);
    assert.equal(jsonBackup.data.class.id, classId);
    assert.equal(jsonBackup.data.students.length, 30);
    const memoryAfterXlsx = process.memoryUsage();

    const pdfStarted = performance.now();
    const pdf = await request(`/api/teacher/students/${students[2]}/report.pdf?from=2026-01-01&to=2026-12-31`, { cookie: teacherCookie });
    const pdfMs = performance.now() - pdfStarted;
    assert.equal(pdf.response.status, 200);
    assert.match(pdf.response.headers.get('content-type') || '', /application\/pdf/);
    fs.writeFileSync(path.join(reportDir, 'student-report-preview.pdf'), pdf.data);
    const rendered = await renderPdfPreview(pdf.data, path.join(reportDir, 'student-report-preview.png'));
    assert.match(rendered.text, /Ученик этапа 6 №03/, 'PDF text extraction preserves Cyrillic student name');
    assert.match(rendered.text, /2026–2027/, 'PDF text extraction preserves Russian school year');
    assert.match(rendered.text, /Карточка профиля/);
    assert.equal((await request(`/api/teacher/students/${students[2]}/report.pdf?from=2026-12-31&to=2026-01-01`, { cookie: teacherCookie })).response.status, 400);
    assert.equal((await request(`/api/teacher/students/${students[2]}/report.pdf`, { cookie: otherCookie })).response.status, 404);
    const memoryAfterPdf = process.memoryUsage();

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const [cookieName, cookieValue] = teacherCookie.split('=');
    await context.addCookies([{ name: cookieName, value: cookieValue, domain: '127.0.0.1', path: '/', httpOnly: true, sameSite: 'Lax' }]);
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') pageErrors.push(message.text()); });
    for (const theme of ['light', 'dark']) {
      for (const width of [1280, 375]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${base}/teacher/index.html?class=${classId}&view=analytics`);
        await page.evaluate(value => { localStorage.setItem('course-color-theme', value); document.documentElement.dataset.theme = value; document.documentElement.style.colorScheme = value; }, theme);
        await page.reload();
        await page.locator('.account-heatmap').waitFor();
        const dimensions = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
        assert.ok(dimensions.scrollWidth <= dimensions.width, `analytics ${theme}/${width}px does not overflow: ${JSON.stringify(dimensions)}`);
        await page.screenshot({ path: path.join(reportDir, `analytics-${theme}-${width}.png`), fullPage: true, animations: 'disabled' });
      }
    }
    await db.query("UPDATE submissions SET status='accepted',score=6,graded_at=$1,updated_at=$1 WHERE assignment_id=$2 AND student_id=$3", [timestamp, assignment1, students[1]]);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${base}/teacher/index.html?class=${classId}&view=analytics`);
    await page.locator('[data-close-year]').click();
    const dialog = page.locator('dialog[open]');
    await dialog.locator('[data-close-action]').waitFor();
    const rolloverInput = dialog.locator('[data-close-action]');
    await rolloverInput.selectOption('rollover');
    await dialog.locator('input[name="new_school_year"]').fill('2027–2028');
    await dialog.locator('[data-year-graduate]').first().check();
    await dialog.locator('[data-year-transfer]').nth(1).uncheck();
    await dialog.locator('[data-anonymize]').check();
    await dialog.locator('input[name="confirm_personal_data_deletion"]').fill('УДАЛИТЬ ДАННЫЕ');
    for (const theme of ['light', 'dark']) {
      for (const width of [1280, 375]) {
        await page.setViewportSize({ width, height: 900 });
        await page.evaluate(value => { localStorage.setItem('course-color-theme', value); document.documentElement.dataset.theme = value; document.documentElement.style.colorScheme = value; }, theme);
        await page.waitForTimeout(60);
        const dimensions = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
        assert.ok(dimensions.scrollWidth <= dimensions.width, `close-year dialog ${theme}/${width}px does not overflow: ${JSON.stringify(dimensions)}`);
        await page.screenshot({ path: path.join(reportDir, `close-year-${theme}-${width}.png`), fullPage: true, animations: 'disabled' });
      }
    }
    await page.setViewportSize({ width: 1280, height: 900 });
    await dialog.locator('button[type="submit"]').click();
    await dialog.waitFor({ state: 'hidden' });
    await page.locator('[data-app-message]').filter({ hasText: 'Год закрыт.' }).waitFor();
    assert.equal(pageErrors.length, 0, `teacher browser has no console errors: ${pageErrors.join(' | ')}`);

    const newClass = (await db.query('SELECT id,name,school_year FROM classes WHERE teacher_id=$1 AND id<>$2 AND archived=0 ORDER BY id DESC LIMIT 1', [teacherId, classId])).rows[0];
    assert.ok(newClass && newClass.school_year === '2027–2028');
    const rosterAfter = await db.query('SELECT id,class_id,active,full_name,login FROM users WHERE role=\'student\' AND id=ANY($1::integer[]) ORDER BY id', [students]);
    assert.equal(rosterAfter.rows.filter(row => Number(row.class_id) === Number(newClass.id)).length, 28);
    assert.equal(Number(rosterAfter.rows.find(row => Number(row.id) === Number(students[0])).active), 0, 'graduate account is disabled');
    assert.equal(rosterAfter.rows.find(row => Number(row.id) === Number(students[0])).full_name, `Выпускник №${students[0]}`, 'explicit anonymization replaces personal name');
    assert.equal(Number(rosterAfter.rows.find(row => Number(row.id) === Number(students[1])).class_id), Number(classId), 'untransferred learner remains in archived class');

    const oldStudentLogin = await request('/api/auth/login', { method: 'POST', body: { login: 'stage6.student02', password: 'StudentStage6#41' } });
    assert.equal(oldStudentLogin.response.status, 200);
    const archivedAssignments = await request('/api/student/assignments', { cookie: oldStudentLogin.cookie });
    assert.equal(archivedAssignments.data.class.archived, 1);
    const archivedView = await request(`/api/student/assignments/${assignment2}`, { cookie: oldStudentLogin.cookie });
    assert.equal(archivedView.response.status, 200);
    assert.equal(archivedView.data.assignment.archived, 1);
    assert.equal(archivedView.data.submission, null);
    assert.equal((await request(`/api/student/assignments/${assignment2}/draft`, { method: 'PUT', cookie: oldStudentLogin.cookie, body: { html: '<main></main>', css: '' } })).response.status, 403);
    assert.equal((await request(`/api/student/assignments/${assignment2}/submit`, { method: 'POST', cookie: oldStudentLogin.cookie, body: { html: '<main></main>', css: '' } })).response.status, 403);
    assert.equal((await request(`/api/student/assignments/${quizId}/quiz/grade`, { method: 'POST', cookie: oldStudentLogin.cookie, body: { answers: [[0]] } })).response.status, 403);
    const learnerContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const [learnerCookieName, learnerCookieValue] = oldStudentLogin.cookie.split('=');
    await learnerContext.addCookies([{ name: learnerCookieName, value: learnerCookieValue, domain: '127.0.0.1', path: '/', httpOnly: true, sameSite: 'Lax' }]);
    const learnerPage = await learnerContext.newPage();
    const learnerErrors = [];
    learnerPage.on('pageerror', error => learnerErrors.push(error.message));
    learnerPage.on('console', message => { if (message.type() === 'error') learnerErrors.push(message.text()); });
    for (const theme of ['light', 'dark']) {
      for (const width of [1280, 375]) {
        await learnerPage.setViewportSize({ width, height: 900 });
        await learnerPage.goto(`${base}/student/assignment.html?id=${assignment2}`);
        await learnerPage.evaluate(value => { localStorage.setItem('course-color-theme', value); document.documentElement.dataset.theme = value; document.documentElement.style.colorScheme = value; }, theme);
        await learnerPage.reload();
        await learnerPage.locator('.account-archive-notice').waitFor();
        await learnerPage.locator('[data-editor-host="html"] .cm-editor').waitFor();
        assert.match(await learnerPage.locator('.account-submit-panel h2').textContent(), /Учебный год закрыт/);
        assert.equal(await learnerPage.locator('[data-open-hint]').innerText(), 'Не открывалась в этом учебном году');
        assert.equal(await learnerPage.locator('[data-submit]').count(), 0, 'archived student cannot submit from the editor');
        assert.equal(await learnerPage.locator('[data-editor-host="html"] .cm-content').getAttribute('contenteditable'), 'false', 'archived editor is read-only');
        const dimensions = await learnerPage.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
        assert.ok(dimensions.scrollWidth <= dimensions.width, `archived student ${theme}/${width}px does not overflow: ${JSON.stringify(dimensions)}`);
        await learnerPage.screenshot({ path: path.join(reportDir, `archived-student-${theme}-${width}.png`), fullPage: true, animations: 'disabled' });
      }
    }
    assert.equal(learnerErrors.length, 0, `archived student browser has no console errors: ${learnerErrors.join(' | ')}`);
    await learnerContext.close();
    const archivedProfile = await request('/api/student/profile', { cookie: oldStudentLogin.cookie });
    assert.ok(archivedProfile.data.grades.some(grade => grade.school_year === '2026–2027' && grade.title === 'Карточка профиля'), 'archived learner can still read grades');
    const transferredLogin = await request('/api/auth/login', { method: 'POST', body: { login: 'stage6.student03', password: 'StudentStage6#41' } });
    assert.equal(transferredLogin.response.status, 200);
    const transferredProfile = await request('/api/student/profile', { cookie: transferredLogin.cookie });
    assert.ok(transferredProfile.data.grades.some(grade => grade.school_year === '2026–2027' && grade.title === 'Карточка профиля'), 'grades remain attached to the learner and retain the original school year');
    assert.equal((await request('/api/auth/login', { method: 'POST', body: { login: 'stage6.student01', password: 'StudentStage6#41' } })).response.status, 401);

    const privacyClass = (await db.query('INSERT INTO classes(teacher_id,name,school_year,created_at) VALUES($1,$2,$3,$4) RETURNING id', [teacherId, 'Выпускной тест', '2026–2027', timestamp])).rows[0].id;
    const privateLearner = (await db.query("INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at) VALUES('student','stage6.scrub',$1,'Имя для удаления',$2,0,$3) RETURNING id", [studentHash, privacyClass, timestamp])).rows[0].id;
    const privateAssignment = (await db.query("INSERT INTO assignments(class_id,title,max_score,target_all,status,created_at,updated_at) VALUES($1,'Работа выпускника',10,1,'published',$2,$2) RETURNING id", [privacyClass, timestamp])).rows[0].id;
    await db.query("INSERT INTO submissions(assignment_id,student_id,status,score,submitted_at,graded_at,created_at,updated_at) VALUES($1,$2,'accepted',8,$3,$3,$3,$3)", [privateAssignment, privateLearner, timestamp]);
    const privacyCloseBody = { action: 'graduate', student_ids: [privateLearner], anonymize_personal_data: true };
    assert.equal((await request(`/api/teacher/classes/${privacyClass}/close-year`, { method: 'POST', cookie: teacherCookie, body: privacyCloseBody })).response.status, 400, 'anonymization requires the exact confirmation phrase');
    const anonymized = await request(`/api/teacher/classes/${privacyClass}/close-year`, { method: 'POST', cookie: teacherCookie, body: { ...privacyCloseBody, confirm_personal_data_deletion: 'УДАЛИТЬ ДАННЫЕ' } });
    assert.equal(anonymized.response.status, 200);
    const anonymizedStudent = (await db.query('SELECT full_name,login,active FROM users WHERE id=$1', [privateLearner])).rows[0];
    assert.equal(anonymizedStudent.full_name, `Выпускник №${privateLearner}`);
    assert.equal(anonymizedStudent.login, `graduate-${privateLearner}`);
    assert.equal(Number(anonymizedStudent.active), 0);
    const retainedPrivateGrade = await db.prepare('SELECT score FROM submissions WHERE student_id=$1 AND assignment_id=$2').get(privateLearner, privateAssignment);
    assert.equal(Number(retainedPrivateGrade.score), 8, 'profile anonymization keeps historical grades');

    const metrics = {
      class_size: 30, assignment_count: 3,
      analytics_ms: analytics.data.timings_ms.total,
      xlsx_ms: Math.round(xlsxMs * 100) / 100,
      xlsx_bytes: xlsx.data.length,
      pdf_ms: Math.round(pdfMs * 100) / 100,
      pdf_bytes: pdf.data.length,
      pdf_pages: rendered.pages,
      memory: {
        heap_used_before_reports: memoryBeforeReports.heapUsed,
        heap_used_after_xlsx: memoryAfterXlsx.heapUsed,
        heap_used_after_pdf: memoryAfterPdf.heapUsed,
        rss_before_reports: memoryBeforeReports.rss,
        rss_after_pdf: memoryAfterPdf.rss
      }
    };
    fs.writeFileSync(path.join(reportDir, 'performance.json'), `${JSON.stringify(metrics, null, 2)}\n`);
    assert.ok(metrics.xlsx_bytes > 1000 && metrics.pdf_bytes > 1000);
  } finally {
    if (browser) await browser.close();
    clearInterval(app.locals.maintenanceTimer);
    await new Promise(resolve => server.close(resolve));
    await app.locals.db.close();
  }
});
