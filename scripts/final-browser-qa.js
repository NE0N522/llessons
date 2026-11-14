const fs = require('node:fs/promises');
const path = require('node:path');
const { createApp } = require('../server/app');
const { hashPassword } = require('../server/auth');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const reportDir = path.join(root, 'report', 'stage-7', 'browser');
const contact = 'Напишите учителю курса: teacher@example.invalid';
const smoke = process.argv.includes('--smoke');

async function login(base, username, password) {
  const response = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { origin: base, 'content-type': 'application/json' },
    body: JSON.stringify({ login: username, password })
  });
  if (!response.ok) throw new Error(`Не удалось войти как ${username}: HTTP ${response.status}.`);
  return response.headers.get('set-cookie')?.split(';')[0];
}

async function addCookie(context, base, cookie) {
  const separator = cookie.indexOf('=');
  await context.addCookies([{ name: cookie.slice(0, separator), value: cookie.slice(separator + 1), url: base, httpOnly: true, sameSite: 'Lax' }]);
}

function safeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-|-$/g, '').slice(0, 90) || 'page';
}

async function main() {
  const axeScript = await fs.readFile(require.resolve('axe-core'), 'utf8');
  await fs.mkdir(reportDir, { recursive: true });
  for (const entry of await fs.readdir(reportDir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.png')) await fs.unlink(path.join(reportDir, entry.name));
  }
  const app = await createApp({ pgliteDir: ':memory:', sessionSecret: 'stage7-browser-qa-secret-with-at-least-32-chars', privacyContact: contact, nodeEnv: 'development', skipEnv: true });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    const db = app.locals.db;
    browser = await chromium.launch({ headless: true });
    const guest = await browser.newContext();
    const failures = [];
    const runs = [];
    const themes = ['light', 'dark'];
    const widths = [1280, 375];

    const checkPage = async ({ label, url, context = guest, expectedText, expectedSelector, expectedContact = false }) => {
      for (const theme of themes) for (const width of widths) {
        const page = await context.newPage({ viewport: { width, height: 900 } });
        const pageErrors = [], warnings = [], failedRequests = [], externalRequests = [];
        const auditAccessibility = url === '/' || /^\/lesson-view\.html\?lesson=(23|29)(?:#|&|$)/.test(url) || /^\/examples\/view\.html\?lesson=(23|29)(?:&|$)/.test(url) || /^\/(?:teacher|student)\//.test(url) || /^\/(?:login|change-password|ui-kit)\.html/.test(url);
        if (auditAccessibility) await page.addInitScript({ content: `if (window === window.top) {\n${axeScript}\n}` });
        page.on('pageerror', error => pageErrors.push(error.message));
        page.on('console', message => {
          if (message.type() === 'error') pageErrors.push(message.text());
          // A sandboxed srcdoc preview has an opaque origin; suppress only Chromium's blocked host-origin postMessage warning.
          else if (message.type() === 'warning' && !/Failed to execute 'postMessage' on 'DOMWindow'.*recipient window's origin \('null'\)\./.test(message.text())) warnings.push(message.text());
        });
        page.on('requestfailed', request => failedRequests.push(`${request.url()} (${request.failure()?.errorText || 'failed'})`));
        page.on('request', request => { if (new URL(request.url()).origin !== base) externalRequests.push(request.url()); });
        page.on('response', response => {
          if (response.status() >= 400 && !new URL(response.url()).pathname.endsWith('/favicon.ico')) pageErrors.push(`HTTP ${response.status()}: ${response.url()}`);
        });
        await page.addInitScript(value => { if (window === window.top) localStorage.setItem('course-color-theme', value); }, theme);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${base}${url}`, { waitUntil: 'load', timeout: 30000 });
        if (expectedSelector) await page.locator(expectedSelector).first().waitFor({ state: 'visible', timeout: 10000 });
        else if (expectedText) await page.locator('main h1, main h2, main h3').filter({ hasText: expectedText }).first().waitFor({ state: 'visible', timeout: 10000 });
        if (expectedContact) await page.waitForFunction(value => document.querySelector('[data-teacher-contact]')?.textContent === value, contact, { timeout: 10000 });
        let accessibility = null;
        if (auditAccessibility) {
          await page.waitForFunction(() => Boolean(window.axe));
          accessibility = await page.evaluate(async () => {
            const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
            return result.violations.map(item => ({ id: item.id, impact: item.impact, targets: item.nodes.map(node => node.target), nodes: item.nodes.map(node => ({ html: node.html, failureSummary: node.failureSummary })) }));
          });
          if (accessibility.length) failures.push(`${label} ${theme}/${width}: axe violations ${JSON.stringify(accessibility)}`);
        }
        await page.waitForTimeout(80);
        const state = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          title: document.title,
          images: [...document.images].filter(image => image.complete && image.naturalWidth === 0).map(image => image.currentSrc || image.src),
          theme: document.documentElement.dataset.theme || document.documentElement.style.colorScheme || 'unset',
          footerPrivacy: Boolean(document.querySelector('.site-privacy-link')),
          bareAccountButtons: (/^\/(?:teacher|student)\//.test(location.pathname) || /^\/(?:login|change-password|ui-kit)\.html/.test(location.pathname)) ? [...document.querySelectorAll('button')].filter(button => !button.classList.contains('btn') && !button.closest('.cm-editor')).map(button => button.getAttribute('aria-label') || button.textContent.trim().slice(0, 50)) : []
        }));
        const result = { label, url, theme, viewport: width, ...state, accessibility, pageErrors, warnings, failedRequests, externalRequests };
        if (state.scrollWidth > state.width) failures.push(`${label} ${theme}/${width}: horizontal overflow ${state.scrollWidth} > ${state.width}`);
        if (pageErrors.length) failures.push(`${label} ${theme}/${width}: ${pageErrors.join(' | ')}`);
        if (warnings.length) failures.push(`${label} ${theme}/${width}: console warnings ${warnings.join(' | ')}`);
        if (failedRequests.length) failures.push(`${label} ${theme}/${width}: failed requests ${failedRequests.join(' | ')}`);
        if (externalRequests.length) failures.push(`${label} ${theme}/${width}: external requests ${externalRequests.join(' | ')}`);
        if (state.images.length) failures.push(`${label} ${theme}/${width}: broken images ${state.images.join(' | ')}`);
        if (state.bareAccountButtons.length) failures.push(`${label} ${theme}/${width}: buttons missing the shared .btn class ${state.bareAccountButtons.join(' | ')}`);
        if (!state.footerPrivacy) failures.push(`${label} ${theme}/${width}: privacy link missing from page footer`);
        runs.push(result);
        await page.screenshot({ path: path.join(reportDir, `${String(runs.length).padStart(3, '0')}-${safeName(label)}-${theme}-${width}.png`), fullPage: true, animations: 'disabled' });
        await page.close();
      }
    };

    await checkPage({ label: 'первая настройка', url: '/setup', expectedText: 'Создайте аккаунт учителя' });
    const stamp = new Date().toISOString();
    const teacherHash = await hashPassword('Stage7Teacher#2026');
    const studentHash = await hashPassword('Stage7Student#2026');
    const teacherId = (await db.query("INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES('teacher','stage7.teacher',$1,'Учитель выпуска',1,$2) RETURNING id", [teacherHash, stamp])).rows[0].id;
    const classId = (await db.query('INSERT INTO classes(teacher_id,name,school_year,created_at) VALUES($1,$2,$3,$4) RETURNING id', [teacherId, 'Демонстрационный класс', '2026–2027', stamp])).rows[0].id;
    const studentId = (await db.query("INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at) VALUES('student','stage7.student',$1,'Ученик выпуска',$2,0,$3) RETURNING id", [studentHash, classId, stamp])).rows[0].id;
    const assignmentId = (await db.query("INSERT INTO assignments(class_id,title,description,status,task_type,checks_json,hints_json,starter_html,starter_css,created_at,updated_at) VALUES($1,'Проверочная карточка','Собери небольшую карточку.','published','build','[]','[\"Начни с контейнера страницы.\"]'::jsonb,'<main><h1>Начни здесь</h1></main>','main { padding: 1rem; }',$2,$2) RETURNING id", [classId, stamp])).rows[0].id;
    const teacherCookie = await login(base, 'stage7.teacher', 'Stage7Teacher#2026');
    const studentCookie = await login(base, 'stage7.student', 'Stage7Student#2026');
    const teacherContext = await browser.newContext();
    const studentContext = await browser.newContext();
    await addCookie(teacherContext, base, teacherCookie);
    await addCookie(studentContext, base, studentCookie);

    const basicPages = [
      { label: 'главная курса', url: '/', expectedText: 'Понятный путь от первой страницы' },
      { label: 'устаревший адрес урока', url: '/lesson-01.html', expectedSelector: 'main h1' },
      { label: 'справочник', url: '/reference.html', expectedText: 'Справочник' },
      { label: 'проверка курса', url: '/check.html', expectedText: 'Проверка структуры и содержания' },
      { label: 'страница данных', url: '/privacy.html', expectedText: 'Какие данные мы храним', expectedContact: true },
      { label: 'вход', url: '/login.html', expectedText: 'Вход' },
      { label: 'смена пароля', url: '/change-password.html', context: studentContext, expectedText: 'Обнови пароль' },
      { label: 'кабинет учителя', url: `/teacher/index.html?class=${classId}&view=overview`, context: teacherContext, expectedText: 'Обзор' },
      { label: 'кабинет ученика', url: '/student/index.html', context: studentContext, expectedText: 'Мои задания' },
      { label: 'профиль ученика', url: '/student/profile.html', context: studentContext, expectedText: 'История активности' },
      { label: 'задание ученика', url: `/student/assignment.html?id=${assignmentId}`, context: studentContext, expectedText: 'Проверочная карточка' },
      { label: 'каталог компонентов', url: '/ui-kit.html', context: teacherContext, expectedText: 'Библиотека компонентов' }
    ];
    for (const page of smoke ? basicPages.filter(item => ['главная курса', 'страница данных', 'кабинет учителя', 'задание ученика', 'каталог компонентов'].includes(item.label)) : basicPages) await checkPage(page);

    const interactionChecks = [];
    if (!smoke) {
      const tabsPage = await studentContext.newPage();
      const verifyTabState = (label, ok) => {
        interactionChecks.push({ label, passed: Boolean(ok) });
        if (!ok) failures.push(`Переключение разделов задания: ${label}`);
      };
      await tabsPage.setViewportSize({ width: 375, height: 900 });
      await tabsPage.goto(`${base}/student/assignment.html?id=${assignmentId}`, { waitUntil: 'load' });
      const tabs = tabsPage.locator('[data-assignment-tabs]');
      const codeTab = tabsPage.locator('[data-assignment-tab="code"]');
      const resultTab = tabsPage.locator('[data-assignment-tab="result"]');
      const codePane = tabsPage.locator('[data-assignment-pane="code"]').last();
      const resultPane = tabsPage.locator('[data-assignment-pane="result"]');
      await tabsPage.locator('[data-editor-host="html"] .cm-editor').waitFor({ state: 'visible', timeout: 15000 });
      verifyTabState('375 px показывает вкладки «Код» и «Результат»; условие остаётся прочитать выше', await tabs.isVisible() && await tabsPage.locator('[data-assignment-tab]:visible').count() === 2 && !(await tabsPage.locator('[data-assignment-tab="condition"]').isVisible()));
      verifyTabState('«Код» выбран при открытии, редактор виден, предпросмотр скрыт', await codeTab.getAttribute('aria-selected') === 'true' && await codePane.isVisible() && !(await resultPane.isVisible()));
      const mobileTargets = await tabsPage.locator('[data-assignment-tab]:visible').evaluateAll(buttons => buttons.map(button => ({ height: button.getBoundingClientRect().height, gap: parseFloat(getComputedStyle(button.parentElement).gap) || 0 })));
      verifyTabState('кнопки на телефоне не ниже 44 px и разделены интервалом', mobileTargets.length === 2 && mobileTargets.every(item => item.height >= 44 && item.gap >= 8));
      await resultTab.focus();
      await resultTab.press('Enter');
      verifyTabState('клавиша Enter открывает предпросмотр', await resultTab.getAttribute('aria-selected') === 'true' && await resultPane.isVisible() && !(await codePane.isVisible()));

      await tabsPage.setViewportSize({ width: 768, height: 900 });
      const conditionTab = tabsPage.locator('[data-assignment-tab="condition"]');
      await conditionTab.waitFor({ state: 'visible' });
      verifyTabState('768 px показывает три раздела', await conditionTab.isVisible() && await tabsPage.locator('[data-assignment-tab]:visible').count() === 3);
      await conditionTab.click();
      verifyTabState('раздел «Условие» открывает вопрос и прочие инструкции', await conditionTab.getAttribute('aria-selected') === 'true' && await tabsPage.locator('.account-question-panel').isVisible() && !(await codePane.isVisible()));
      await codeTab.click();
      verifyTabState('раздел «Код» возвращает редактор на планшете', await codePane.isVisible() && await tabsPage.locator('[data-editor-host="html"] .cm-editor').isVisible());

      await tabsPage.setViewportSize({ width: 1280, height: 900 });
      await tabs.waitFor({ state: 'hidden' });
      await codePane.waitFor({ state: 'visible' });
      await resultPane.waitFor({ state: 'visible' });
      verifyTabState('1280 px показывает код и результат рядом, переключатель скрыт', !(await tabs.isVisible()) && await tabsPage.locator('[data-assignment-pane="code"]').last().isVisible() && await resultPane.isVisible());
      for (const width of [375, 768, 1280]) {
        await tabsPage.setViewportSize({ width, height: 900 });
        const dimension = await tabsPage.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
        verifyTabState(`${width} px без горизонтального переполнения`, dimension.scrollWidth <= dimension.width);
      }
      await tabsPage.close();

      const searchPage = await guest.newPage();
      await searchPage.setViewportSize({ width: 375, height: 900 });
      await searchPage.goto(`${base}/`, { waitUntil: 'load' });
      await searchPage.keyboard.press('Control+k');
      await searchPage.locator('[data-quick-search][open]').waitFor();
      await searchPage.locator('[data-quick-search-input]').fill('Переносим элементы на новую строку');
      const searchHit = searchPage.locator('[data-quick-search-results] a').filter({ hasText: 'Переносим элементы на новую строку' }).first();
      await searchHit.waitFor();
      verifyTabState('Ctrl+K ищет конкретные шаги курса', (await searchHit.getAttribute('href'))?.includes('lesson=29#spacing-wrap'));
      await searchHit.click();
      await searchPage.waitForURL(/lesson=29#spacing-wrap/);
      verifyTabState('быстрый поиск открывает найденный шаг урока', await searchPage.locator('#spacing-wrap').isVisible());
      await searchPage.close();

      const flexPage = await guest.newPage();
      await flexPage.setViewportSize({ width: 375, height: 900 });
      await flexPage.goto(`${base}/lesson-view.html?lesson=29`, { waitUntil: 'load' });
      await flexPage.locator('[data-step-navigation]').waitFor();
      verifyTabState('Flexbox показывает 14 шагов по одному', await flexPage.locator('[data-step-panel]:visible').count() === 1 && await flexPage.locator('[data-step-panel]').count() === 14);
      const playground = flexPage.locator('.playground').first();
      await playground.scrollIntoViewIfNeeded();
      const resultMode = playground.locator('[data-mobile-mode="result"]');
      await resultMode.waitFor({ state: 'visible' });
      await resultMode.click();
      verifyTabState('375 px переключает код и результат отдельными вкладками', await playground.locator('.playground-result').isVisible() && await playground.locator('.playground-editor:visible').count() === 0);
      await playground.locator('[data-mobile-mode="code"]').click();
      await playground.locator('[data-editor-host="html"] .cm-editor').waitFor({ state: 'visible', timeout: 15000 });
      await playground.locator('[data-tab="css"]').click();
      verifyTabState('мобильный редактор переключается между HTML и CSS', await playground.locator('[data-panel="css"]').isVisible() && !(await playground.locator('[data-panel="html"]').isVisible()));
      await playground.locator('[data-mobile-mode="result"]').click();
      await flexPage.locator('[data-step-next]').click();
      verifyTabState('переход к следующему шагу сохраняет отметку в оглавлении', await flexPage.locator('[data-step-link="axes"]').evaluate(link => link.classList.contains('is-complete')) && (await flexPage.locator('[data-step-counter]').textContent()).includes('2 из 14'));
      const flexWidth = await flexPage.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
      verifyTabState('Flexbox без горизонтального переполнения на 375 px', flexWidth.scrollWidth <= flexWidth.width);
      await flexPage.setViewportSize({ width: 1280, height: 900 });
      const desktopPlayground = flexPage.locator('.v3-step:visible .playground').first();
      verifyTabState('1280 px показывает редактор и результат рядом', await desktopPlayground.locator('.playground-editor:visible').count() === 1 && await desktopPlayground.locator('.playground-result').isVisible() && !(await desktopPlayground.locator('.playground-mobile-switcher').isVisible()));
      await flexPage.close();

      const offlineLesson = await studentContext.newPage();
      await offlineLesson.setViewportSize({ width: 375, height: 900 });
      await offlineLesson.goto(`${base}/lesson-view.html?lesson=29`, { waitUntil: 'load' });
      await offlineLesson.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 15000 });
      await offlineLesson.evaluate(() => navigator.serviceWorker.ready);
      await offlineLesson.context().setOffline(true);
      await offlineLesson.reload({ waitUntil: 'load' });
      await offlineLesson.locator('[data-step-navigation]').waitFor({ timeout: 10000 });
      verifyTabState('Flexbox загружается офлайн после открытия один раз', await offlineLesson.locator('main h1').textContent().then(text => text.includes('Flexbox')) && await offlineLesson.locator('[data-step-panel]:visible').count() === 1);
      await offlineLesson.context().setOffline(false);
      await offlineLesson.close();
    }

    const lessonFiles = (await fs.readdir(path.join(root, 'outputs', 'assets', 'lessons'))).filter(file => /^lesson-\d+\.js$/.test(file));
    const lessonIds = lessonFiles.map(file => Number(file.match(/^lesson-(\d+)\.js$/)[1])).sort((a, b) => a - b);
    for (const id of (smoke ? lessonIds.slice(0, 1) : lessonIds)) {
      await checkPage({ label: `урок ${id}`, url: `/lesson-view.html?lesson=${id}`, expectedSelector: 'main h1' });
      for (const project of (smoke ? [0] : [0, 1])) await checkPage({ label: `урок ${id} · проект ${project + 1}`, url: `/examples/view.html?lesson=${id}&project=${project}`, expectedSelector: 'main h1' });
    }

    const teacherPage = await teacherContext.newPage({ viewport: { width: 1280, height: 900 } });
    await teacherPage.goto(`${base}/teacher/index.html?class=${classId}&view=overview`);
    for (const tab of ['overview', 'students', 'assignments', 'submissions', 'gradebook', 'analytics', 'audit']) {
      const tabButton = teacherPage.locator(`.account-workspace-sidebar [data-tab="${tab}"], .account-teacher-mobile-tabs [data-tab="${tab}"]`).first();
      if (await tabButton.count()) {
        await tabButton.click();
        await teacherPage.waitForTimeout(80);
        const dimension = await teacherPage.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
        if (dimension.scrollWidth > dimension.width) failures.push(`Раздел учителя ${tab}: горизонтальное переполнение ${dimension.scrollWidth} > ${dimension.width}`);
      }
    }
    await teacherPage.close();

    const accessibilityRuns = runs.filter(run => Array.isArray(run.accessibility));
    const result = {
      date: new Date().toISOString(),
      pages: [...new Set(runs.map(run => run.label))].length,
      checks: runs.length,
      accessibility_audits: accessibilityRuns.length,
      accessibility_violations: accessibilityRuns.reduce((sum, run) => sum + run.accessibility.length, 0),
      lesson_ids: lessonIds,
      variants: ['light/1280', 'light/375', 'dark/1280', 'dark/375'],
      interaction_checks: interactionChecks,
      failures,
      runs
    };
    await fs.writeFile(path.join(root, 'report', 'stage-7', 'browser-qa.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.log(`Браузерная приёмка: ${result.pages} страниц, ${result.checks} сочетаний страницы/темы/ширины, ${result.accessibility_audits} axe-проверок, нарушений ${result.accessibility_violations}, ошибок ${failures.length}. Скриншоты: report/stage-7/browser/; данные: report/stage-7/browser-qa.json.`);
    if (failures.length) {
      for (const failure of failures.slice(0, 40)) console.error(`FAIL ${failure}`);
      process.exitCode = 1;
    }
    await Promise.all([teacherContext.close(), studentContext.close(), guest.close()]);
  } finally {
    if (browser) await browser.close();
    clearInterval(app.locals.maintenanceTimer);
    await new Promise(resolve => server.close(resolve));
    await app.locals.db.close();
  }
}

main().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
