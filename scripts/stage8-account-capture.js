const fs = require('node:fs/promises');
const path = require('node:path');
const { createApp } = require('../server/app');
const { hashPassword } = require('../server/auth');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const phase = process.argv.includes('--after') ? 'after' : 'before';
const reportDir = path.join(root, 'report', 'stage-8', phase);

async function login(base, username, password) {
  const response = await fetch(`${base}/api/auth/login`, {
    method: 'POST', headers: { origin: base, 'content-type': 'application/json' },
    body: JSON.stringify({ login: username, password })
  });
  if (!response.ok) throw new Error(`Login failed (${response.status})`);
  return response.headers.get('set-cookie')?.split(';')[0];
}

async function addCookie(context, base, cookie) {
  const separator = cookie.indexOf('=');
  await context.addCookies([{ name: cookie.slice(0, separator), value: cookie.slice(separator + 1), url: base, httpOnly: true, sameSite: 'Lax' }]);
}

async function main() {
  await fs.mkdir(reportDir, { recursive: true });
  const app = await createApp({ pgliteDir: ':memory:', sessionSecret: 'stage8-account-screenshot-secret-32-chars-minimum', privacyContact: 'teacher@example.invalid', nodeEnv: 'development', skipEnv: true });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    const db = app.locals.db;
    const stamp = new Date().toISOString();
    const teacherHash = await hashPassword('Stage8Teacher#2026');
    const studentHash = await hashPassword('Stage8Student#2026');
    const teacherId = (await db.query("INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES('teacher','stage8.teacher',$1,'Учитель курса',1,$2) RETURNING id", [teacherHash, stamp])).rows[0].id;
    const classId = (await db.query('INSERT INTO classes(teacher_id,name,school_year,created_at) VALUES($1,$2,$3,$4) RETURNING id', [teacherId, 'Демонстрационный класс', '2026–2027', stamp])).rows[0].id;
    const studentId = (await db.query("INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at) VALUES('student','stage8.student',$1,'Алия Садыкова',$2,0,$3) RETURNING id", [studentHash, classId, stamp])).rows[0].id;
    const assignmentId = (await db.query("INSERT INTO assignments(class_id,title,description,status,task_type,checks_json,hints_json,starter_html,starter_css,created_at,updated_at) VALUES($1,'Карточка-портфолио','Собери аккуратную карточку о себе.','published','build','[]','[]','<main><h1>Привет!</h1><p>Я изучаю HTML и CSS.</p></main>','main { padding: 1rem; }',$2,$2) RETURNING id", [classId, stamp])).rows[0].id;
    const submissionId=(await db.query("INSERT INTO submissions(assignment_id,student_id,status,submitted_at,created_at,updated_at) VALUES($1,$2,'submitted',$3,$3,$3) RETURNING id",[assignmentId,studentId,stamp])).rows[0].id;
    await db.query("INSERT INTO submission_versions(submission_id,html,css,kind,created_at) VALUES($1,'<main>'||chr(10)||'  <h1>Моя страница</h1>'||chr(10)||'  <p>Учусь создавать сайты.</p>'||chr(10)||'</main>','main { max-width: 42rem; margin: 2rem auto; padding: 1rem; }','submitted',$2)",[submissionId,stamp]);
    const teacherCookie = await login(base, 'stage8.teacher', 'Stage8Teacher#2026');
    const studentCookie = await login(base, 'stage8.student', 'Stage8Student#2026');
    browser = await chromium.launch({ headless: true });
    const teacherContext = await browser.newContext();
    const studentContext = await browser.newContext();
    await addCookie(teacherContext, base, teacherCookie);
    await addCookie(studentContext, base, studentCookie);

    const pages = [
      ...['overview', 'students', 'assignments', 'submissions', 'gradebook', 'analytics', 'audit'].map(view => ({ name: `teacher-${view}`, path: `/teacher/index.html?class=${classId}&view=${view}`, context: teacherContext })),
      { name: 'teacher-classes', path: '/teacher/index.html', context: teacherContext },
      { name: 'student-home', path: '/student/index.html', context: studentContext },
      { name: 'student-profile', path: '/student/profile.html', context: studentContext },
      { name: 'student-assignment', path: `/student/assignment.html?id=${assignmentId}`, context: studentContext },
      { name: 'ui-kit', path: '/ui-kit.html', context: teacherContext },
      { name: 'login', path: '/login.html', context: await browser.newContext() },
      { name: 'change-password', path: '/change-password.html', context: studentContext }
    ];
    const themes = ['light', 'dark'];
    const widths = [1280, 768, 375];
    const reviewOnly = process.argv.includes('--review-only'), kitOnly = process.argv.includes('--kit-only');
    if (!reviewOnly) {
      for (const item of pages.filter(item => !kitOnly || item.name === 'ui-kit')) for (const theme of themes) for (const width of widths) {
        const page = await item.context.newPage();
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript(value => localStorage.setItem('course-color-theme', value), theme);
        await page.goto(`${base}${item.path}`, { waitUntil: 'load', timeout: 30000 });
        await page.waitForTimeout(700);
        await page.screenshot({ path: path.join(reportDir, `${item.name}-${theme}-${width}.png`), animations: 'disabled', fullPage: item.name === 'ui-kit' });
        await page.close();
      }
    }
    if (!kitOnly) for (const theme of themes) for (const width of widths) {
      const page = await teacherContext.newPage();
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(value => localStorage.setItem('course-color-theme', value), theme);
      await page.goto(`${base}/teacher/index.html?class=${classId}&view=submissions`, { waitUntil: 'load', timeout: 30000 });
      await page.locator('[data-open-submission]').first().waitFor({ state: 'visible', timeout: 15000 });
      await page.locator('[data-open-submission]').first().click();
      await page.locator('.account-review-shell').waitFor({ state: 'visible', timeout: 15000 });
      await page.waitForTimeout(350);
      await page.screenshot({ path: path.join(reportDir, `teacher-review-${theme}-${width}.png`), animations: 'disabled' });
      await page.close();
    }
    await browser.close();
  } finally {
    if (browser) await browser.close().catch(() => {});
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
