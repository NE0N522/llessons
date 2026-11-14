const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createApp } = require('../server/app');
const { hashPassword } = require('../server/auth');
const { normalizeCodeForSimilarity, shingleSimilarity } = require('../server/routes/teacher');
const { chromium } = require('playwright');

const reportDir=path.join(__dirname,'..','report','stage-5');
async function captureViewportThemeMatrix(page,label){
  fs.mkdirSync(reportDir,{recursive:true});
  for(const theme of ['light','dark'])for(const width of [1280,375]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(value=>{localStorage.setItem('course-color-theme',value);document.documentElement.dataset.theme=value;document.documentElement.style.colorScheme=value;},theme);
    await page.waitForTimeout(80);
    const dimensions=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
    assert.ok(dimensions.scrollWidth<=dimensions.width,`${label} ${theme}/${width}px should not overflow horizontally: ${JSON.stringify(dimensions)}`);
    if(label==='проверка-учителем'){const columns=await page.evaluate(()=>getComputedStyle(document.querySelector('.account-review-workspace')).gridTemplateColumns.trim().split(/\s+/).length);assert.equal(columns,width<=760?1:2,`${label} should use ${width<=760?'one':'two'} column(s) at ${width}px`);}
    await page.screenshot({path:path.join(reportDir,`${label}-${theme}-${width}.png`),fullPage:true,animations:'disabled'});
  }
  await page.setViewportSize({width:1280,height:900});
}

test('Stage 5: assignment types, privacy, versions, hints, questions, due dates and review workflow', { timeout: 120000 }, async () => {
  const app = await createApp({ pgliteDir: ':memory:', sessionSecret: 'stage5-integration-secret-at-least-thirty-two-chars' });
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (route, { method = 'GET', cookie, body } = {}) => {
    const headers = { origin: base };
    if (cookie) headers.cookie = cookie;
    if (body !== undefined) headers['content-type'] = 'application/json';
    const response = await fetch(`${base}${route}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const json = response.headers.get('content-type')?.includes('application/json');
    return { response, data: json ? await response.json() : await response.text(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
  };
  try {
    const db = app.locals.db, timestamp = new Date().toISOString();
    const teacherId = (await db.query("INSERT INTO users(role,login,password_hash,full_name,is_owner,created_at) VALUES('teacher','stage5.teacher',$1,'Учитель этапа 5',1,$2) RETURNING id", [await hashPassword('TeacherStage5#41'), timestamp])).rows[0].id;
    const classId = (await db.query('INSERT INTO classes(teacher_id,name,created_at) VALUES($1,$2,$3) RETURNING id', [teacherId, 'Этап 5', timestamp])).rows[0].id;
    const learnerIds = [];
    for (const [login,name] of [['stage5.student','Ученик этапа 5'],['stage5.copy','Второй ученик']]) learnerIds.push((await db.query("INSERT INTO users(role,login,password_hash,full_name,class_id,must_change_password,created_at) VALUES('student',$1,$2,$3,$4,0,$5) RETURNING id", [login, await hashPassword('StudentStage5#41'), name, classId, timestamp])).rows[0].id);
    const teacherLogin = await request('/api/auth/login', { method: 'POST', body: { login: 'stage5.teacher', password: 'TeacherStage5#41' } });
    const studentLogin = await request('/api/auth/login', { method: 'POST', body: { login: 'stage5.student', password: 'StudentStage5#41' } });
    const secondLogin = await request('/api/auth/login', { method: 'POST', body: { login: 'stage5.copy', password: 'StudentStage5#41' } });
    const sameStudentDevice = await request('/api/auth/login', { method: 'POST', body: { login: 'stage5.student', password: 'StudentStage5#41' } });
    assert.equal(teacherLogin.response.status, 200); assert.equal(studentLogin.response.status, 200); assert.equal(secondLogin.response.status, 200); assert.equal(sameStudentDevice.response.status,200);
    const teacherCookie = teacherLogin.cookie, studentCookie = studentLogin.cookie, secondCookie = secondLogin.cookie, sameStudentDeviceCookie=sameStudentDevice.cookie;

    const defaults = await request(`/api/teacher/classes/${classId}/similarity`, { cookie: teacherCookie });
    assert.deepEqual(defaults.data, { enabled: false, threshold: 75 });
    const quizCreated = await request(`/api/teacher/classes/${classId}/assignments`, { method: 'POST', cookie: teacherCookie, body: {
      title: 'Мини-тест по доступности', description: 'Выбери ответы.', task_type: 'quiz', publish: true,
      due_at: null, max_score: 10, allow_resubmit: true, student_ids: [],
      quiz: [{ prompt: 'Что нужно изображению?', options: ['alt', 'Только width'], correct: [0], explanation: 'alt описывает изображение.' }],
      checks: [], hints: ['Проверь семантические атрибуты.']
    } });
    assert.equal(quizCreated.response.status, 201, JSON.stringify(quizCreated.data));
    const quizId = quizCreated.data.assignment_id;
    const quizForStudent = await request(`/api/student/assignments/${quizId}`, { cookie: studentCookie });
    assert.equal(quizForStudent.response.status, 200, JSON.stringify(quizForStudent.data));
    assert.equal(quizForStudent.data.assignment.task_type, 'quiz');
    assert.deepEqual(quizForStudent.data.quiz[0], { prompt: 'Что нужно изображению?', options: ['alt', 'Только width'], multiple: false });
    assert.equal(JSON.stringify(quizForStudent.data).includes('correct'), false, 'answer keys and explanations stay private before submission');
    const scoredQuiz = await request(`/api/student/assignments/${quizId}/quiz/grade`, { method: 'POST', cookie: studentCookie, body: { answers: [[0]] } });
    assert.equal(scoredQuiz.response.status, 200); assert.equal(scoredQuiz.data.score, 10); assert.equal(scoredQuiz.data.results[0].passed, true);
    const quizSubmit = await request(`/api/student/assignments/${quizId}/submit`, { method: 'POST', cookie: studentCookie, body: { answers: [[1]], client_submitted_at: new Date(Date.now() - 5000).toISOString() } });
    assert.equal(quizSubmit.response.status, 200); assert.equal(quizSubmit.data.auto_score, 0);
    const quizAfter = await request(`/api/student/assignments/${quizId}`, { cookie: studentCookie });
    assert.equal(quizAfter.data.submission.status, 'accepted'); assert.equal(quizAfter.data.quiz_feedback[0].passed, false); assert.equal(quizAfter.data.quiz_feedback[0].explanation, 'alt описывает изображение.');
    const modelPreview='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p5kAAAAASUVORK5CYII=';
    for(const taskType of ['fix','complete','model']){
      const created=await request(`/api/teacher/classes/${classId}/assignments`,{method:'POST',cookie:teacherCookie,body:{title:`Демо: ${taskType}`,description:'Проверь тип задания.',task_type:taskType,publish:true,due_at:null,max_score:10,allow_resubmit:true,student_ids:[],starter_html:taskType==='fix'?'<main><h1>Исправь структуру</h1></main>':taskType==='complete'?'<main><!-- добавь содержимое --></main>':'<main><h1>Образец</h1></main>',starter_css:'',model_preview:taskType==='model'?modelPreview:'',model_html:'TEACHER_ONLY_MODEL_HTML',model_css:'TEACHER_ONLY_MODEL_CSS',hints:[]}});
      assert.equal(created.response.status,201,`${taskType} assignment: ${JSON.stringify(created.data)}`);
      const learnerView=await request(`/api/student/assignments/${created.data.assignment_id}`,{cookie:studentCookie});
      assert.equal(learnerView.response.status,200);assert.equal(learnerView.data.assignment.task_type,taskType);
      assert.equal(JSON.stringify(learnerView.data).includes('TEACHER_ONLY_MODEL'),false,'reference source code is not sent to learners');
      if(taskType==='model')assert.equal(learnerView.data.assignment.model_preview,modelPreview);
      const completed=await request(`/api/student/assignments/${created.data.assignment_id}/submit`,{method:'POST',cookie:studentCookie,body:{html:'<main><h1>Выполненная работа</h1></main>',css:'main { padding: 1rem; }'}});
      assert.equal(completed.response.status,200,`${taskType} assignment submission`);
    }
    const noHintsTask=await request(`/api/teacher/classes/${classId}/assignments`,{method:'POST',cookie:teacherCookie,body:{title:'Без подсказок',description:'Самостоятельная работа.',task_type:'build',publish:true,due_at:null,max_score:10,allow_resubmit:true,no_hints:true,student_ids:[],starter_html:'<main></main>',starter_css:'',hints:['Эта подсказка скрыта.']}});
    assert.equal(noHintsTask.response.status,201);
    assert.equal((await request(`/api/student/assignments/${noHintsTask.data.assignment_id}/hints/0`,{method:'POST',cookie:studentCookie,body:{}})).response.status,403,'the no-hints setting is enforced on the server');

    const pastDue = new Date(Date.now() - 3 * 86400000).toISOString();
    const assignmentCreated = await request(`/api/teacher/classes/${classId}/assignments`, { method: 'POST', cookie: teacherCookie, body: {
      title: 'Страница профиля', description: 'Собери страницу.', task_type: 'build', publish: true,
      due_at: pastDue, max_score: 10, allow_resubmit: true, student_ids: [], starter_html: '<main><h1>Стартовый блок</h1></main>', starter_css: '',
      no_hints: false, checklist_autograde: true, late_penalty_percent_per_day: 10, late_penalty_max_percent: 30,
      checks: [{ type: 'semantic', tag: 'main', label: 'Есть основной раздел' }, { type: 'link', selector: 'a[href]', label: 'Есть ссылка' }, { type: 'class_id', attribute: 'class', value: 'profile-card', label: 'Есть класс карточки' }],
      hints: ['Сначала выдели основное содержимое.', 'Добавь заголовок.', 'Проверь ссылку.']
    } });
    assert.equal(assignmentCreated.response.status, 201, JSON.stringify(assignmentCreated.data));
    const assignmentId = assignmentCreated.data.assignment_id;
    const assignmentForStudent = await request(`/api/student/assignments/${assignmentId}`, { cookie: studentCookie });
    assert.equal(assignmentForStudent.response.status, 200);
    assert.equal(assignmentForStudent.data.assignment.hints, 3);
    assert.equal(assignmentForStudent.data.assignment.checks.length, 3);
    assert.equal(assignmentForStudent.data.assignment.model_html, undefined);
    const blockedHint = await request(`/api/student/assignments/${assignmentId}/hints/1`, { method: 'POST', cookie: studentCookie, body: {} });
    assert.equal(blockedHint.response.status, 400);
    const hint0 = await request(`/api/student/assignments/${assignmentId}/hints/0`, { method: 'POST', cookie: studentCookie, body: {} });
    assert.equal(hint0.response.status, 200); assert.equal(hint0.data.hint, 'Сначала выдели основное содержимое.');
    assert.equal((await request(`/api/student/assignments/${assignmentId}/hints/1`, { method: 'POST', cookie: studentCookie, body: {} })).response.status, 200);
    assert.equal((await request(`/api/teacher/submissions?status=all`, { cookie: studentCookie })).response.status, 403);

    const firstDraft = await request(`/api/student/assignments/${assignmentId}/draft`, { method: 'PUT', cookie: studentCookie, body: { html: '<main><h1>Мой профиль</h1></main>', css: '', client_revision: 0 } });
    assert.equal(firstDraft.response.status, 200, JSON.stringify(firstDraft.data)); assert.equal(firstDraft.data.revision, 1);
    const conflict = await request(`/api/student/assignments/${assignmentId}/draft`, { method: 'PUT', cookie: sameStudentDeviceCookie, body: { html: '<h1>Другая версия</h1>', css: '', client_revision: 0 } });
    assert.equal(conflict.response.status, 409); assert.equal(conflict.data.conflict, true); assert.match(conflict.data.server_draft.html, /Мой профиль/);
    const submittedAtClient = new Date(Date.now() - 4 * 86400000).toISOString();
    const submitted = await request(`/api/student/assignments/${assignmentId}/submit`, { method: 'POST', cookie: studentCookie, body: {
      html: '<main><article class="profile-card"><h1>Мой профиль</h1><a href="/lessons">Уроки</a></article></main>',
      css: '.profile-card { color: rgb(0, 0, 0); }', client_submitted_at: submittedAtClient,
      check_results: [{ label: 'Есть основной раздел', passed: true }, { label: 'Есть ссылка', passed: true }]
    } });
    assert.equal(submitted.response.status, 200, JSON.stringify(submitted.data));
    const review = await request(`/api/teacher/submissions/${submitted.data.submission_id}`, { cookie: teacherCookie });
    assert.equal(review.response.status, 200, JSON.stringify(review.data));
    assert.equal(review.data.submission.client_submitted_at, submittedAtClient);
    assert.ok(Date.parse(review.data.submission.submitted_at) > Date.parse(submittedAtClient));
    assert.deepEqual(review.data.versions[0].auto_checks_json, [{ label: 'Есть основной раздел', passed: true }, { label: 'Есть ссылка', passed: true }]);
    assert.equal(review.data.opened_hints.length, 2);
    assert.equal(review.data.similarity.length, 0);
    assert.equal((await request(`/api/teacher/submissions/${submitted.data.submission_id}`, { cookie: secondCookie })).response.status, 403);
    const missingReturnComment = await request(`/api/teacher/submissions/${submitted.data.submission_id}/review`, { method: 'POST', cookie: teacherCookie, body: { status: 'returned', comment: ' ', score: null } });
    assert.equal(missingReturnComment.response.status, 400);
    const returned = await request(`/api/teacher/submissions/${submitted.data.submission_id}/review`, { method: 'POST', cookie: teacherCookie, body: { status: 'returned', comment: 'Исправь контраст текста.', score: null } });
    assert.equal(returned.response.status, 200);
    const comment = await request(`/api/teacher/versions/${submitted.data.version_id}/comments`, { method: 'POST', cookie: teacherCookie, body: { language: 'html', line_number: 1, comment: 'Добавь alt к изображению.' } });
    assert.equal(comment.response.status, 201, JSON.stringify(comment.data));
    const studentView = await request(`/api/student/assignments/${assignmentId}`, { cookie: studentCookie });
    assert.equal(studentView.data.line_comments.length, 1);
    assert.equal((await request(`/api/student/line-comments/${comment.data.id}/resolve`, { method: 'PATCH', cookie: secondCookie, body: { resolved: true } })).response.status, 404);
    assert.equal((await request(`/api/student/line-comments/${comment.data.id}/resolve`, { method: 'PATCH', cookie: studentCookie, body: { resolved: true } })).response.status, 200);
    const resubmitted = await request(`/api/student/assignments/${assignmentId}/submit`, { method: 'POST', cookie: studentCookie, body: { html: '<main><article class="profile-card"><h1>Мой профиль</h1><img src="x.png" alt="Портрет"><a href="/lessons">Уроки</a></article></main>', css: '' } });
    assert.equal(resubmitted.response.status, 200, JSON.stringify(resubmitted.data));
    const afterResubmit = await request(`/api/teacher/submissions/${submitted.data.submission_id}`, { cookie: teacherCookie });
    assert.equal(afterResubmit.data.versions.filter(item=>item.kind==='submitted').length, 2);
    const acceptedLate=await request(`/api/teacher/submissions/${submitted.data.submission_id}/review`,{method:'POST',cookie:teacherCookie,body:{status:'accepted',comment:'Принято.',score:10}});
    assert.equal(acceptedLate.response.status,200);assert.ok(acceptedLate.data.late_penalty_percent>0,'a late submission receives the configured penalty');
    const lateRow=(await db.query('SELECT score,late_penalty_percent,late_penalty_waived FROM submissions WHERE id=$1',[submitted.data.submission_id])).rows[0];assert.ok(Number(lateRow.score)<10);assert.equal(Number(lateRow.late_penalty_waived),0);

    const extension = await request(`/api/teacher/assignments/${assignmentId}/students/${learnerIds[0]}/due`, { method: 'PUT', cookie: teacherCookie, body: { due_at: new Date(Date.now() + 86400000).toISOString() } });
    assert.equal(extension.response.status, 200);
    const announcements = await request(`/api/teacher/classes/${classId}/announcements`, { method: 'POST', cookie: teacherCookie, body: { title: 'На этой неделе', body: 'Повторяем формы.', pinned: true } });
    assert.equal(announcements.response.status, 201);
    const studentHome = await request('/api/student/assignments', { cookie: studentCookie });
    assert.equal(studentHome.response.status, 200); assert.equal(studentHome.data.announcements[0].title, 'На этой неделе');
    const question = await request(`/api/student/assignments/${assignmentId}/questions`, { method: 'POST', cookie: studentCookie, body: { question: 'Можно ли использовать grid?' } });
    assert.equal(question.response.status, 201);
    const teacherQuestions = await request(`/api/teacher/assignments/${assignmentId}/questions`, { cookie: teacherCookie });
    assert.equal(teacherQuestions.data.questions.length, 1);
    const reply = await request(`/api/teacher/questions/${question.data.id}/reply`, { method: 'POST', cookie: teacherCookie, body: { reply: 'Да, если это пройдено на уроке.', reply_public: true } });
    assert.equal(reply.response.status, 200);
    assert.equal((await request(`/api/student/assignments/${assignmentId}/questions`, { cookie: secondCookie })).data.questions.some(item=>item.teacher_reply.includes('Да, если')), true);
    const template = await request('/api/teacher/comment-templates', { method: 'POST', cookie: teacherCookie, body: { title: 'Проверь alt', body: 'Добавь альтернативный текст изображения.' } });
    assert.equal(template.response.status, 201);
    assert.equal((await request('/api/teacher/comment-templates', { cookie: teacherCookie })).data.templates[0].title, 'Проверь alt');

    const similarity = await request(`/api/teacher/classes/${classId}/similarity`, { method: 'PATCH', cookie: teacherCookie, body: { enabled: true, threshold: 25 } });
    assert.equal(similarity.response.status, 200); assert.equal(similarity.data.enabled, true);
    const copiedWork=await request(`/api/student/assignments/${assignmentId}/submit`,{method:'POST',cookie:secondCookie,body:{html:'<main><article class="profile-card"><h1>Мой профиль</h1><img src="x.png" alt="Портрет"><a href="/lessons">Уроки</a></article></main>',css:''}});
    assert.equal(copiedWork.response.status,200,JSON.stringify(copiedWork.data));
    const teacherSimilarity=await request(`/api/teacher/submissions/${copiedWork.data.submission_id}`,{cookie:teacherCookie});
    assert.ok(teacherSimilarity.data.similarity.some(item=>item.score>=75),'teacher can see a high similarity hint for a copied submission');
    const waived=await request(`/api/teacher/submissions/${copiedWork.data.submission_id}/review`,{method:'POST',cookie:teacherCookie,body:{status:'accepted',comment:'Принято без штрафа.',score:10,waive_late_penalty:true}});
    assert.equal(waived.response.status,200);assert.equal(waived.data.late_penalty_percent,0);
    const waivedRow=(await db.query('SELECT score,late_penalty_percent,late_penalty_waived FROM submissions WHERE id=$1',[copiedWork.data.submission_id])).rows[0];assert.equal(Number(waivedRow.score),10);assert.equal(Number(waivedRow.late_penalty_waived),1);
    assert.equal((await request(`/api/student/submissions/${copiedWork.data.submission_id}`,{cookie:studentCookie})).response.status,404,'a learner cannot view another learner submission');
    const left = normalizeCodeForSimilarity('<main><!--starter--><h1>Работа ученика</h1></main>', 'main { color: red; }', '<main><!--starter--></main>', '');
    const right = normalizeCodeForSimilarity('<main><h1>РАБОТА   УЧЕНИКА</h1></main>', 'main{color:red}', '<main></main>', '');
    assert.ok(shingleSimilarity(left, right) >= 25, 'normalized matching work is flagged with a useful shingle overlap');
    const starterOnly=normalizeCodeForSimilarity('<main><p>Начальный код</p></main>','', '<main><p>Начальный код</p></main>','');
    assert.equal(shingleSimilarity(starterOnly,starterOnly),0,'starter code alone does not produce a similarity warning');
    assert.equal((await request(`/api/teacher/classes/${classId}/similarity`, { cookie: secondCookie })).response.status, 403);

    const offlineAssignment=await request(`/api/teacher/classes/${classId}/assignments`,{method:'POST',cookie:teacherCookie,body:{title:'Работа без сети',description:'Сохрани код даже при обрыве интернета.',task_type:'build',publish:true,due_at:null,max_score:10,allow_resubmit:true,student_ids:[],starter_html:'<main>Старт</main>',starter_css:'main { padding: 1rem; }',checks:[{type:'exists',selector:'main',label:'Есть основной раздел'},{type:'style',selector:'main',property:'padding',value:'16px',label:'Есть внутренний отступ'}],hints:[]}});
    assert.equal(offlineAssignment.response.status,201,JSON.stringify(offlineAssignment.data));
    const offlineId=offlineAssignment.data.assignment_id,browser=await chromium.launch({headless:true});
    try{
      const context=await browser.newContext({viewport:{width:1280,height:900}}),[cookieName,...cookieParts]=studentCookie.split('='),cookieValue=cookieParts.join('=');
      await context.addCookies([{name:cookieName,value:cookieValue,url:base}]);
      let page=await context.newPage();
      await page.goto(`${base}/student/assignment.html?id=${offlineId}`);
      await page.locator('[data-editor-host="html"] .cm-content').waitFor();
      await page.waitForFunction(()=>{const rows=[...document.querySelectorAll('[data-check-results] li')];return rows.length===2&&rows.every(row=>row.dataset.passed==='true');});
      await page.evaluate(()=>navigator.serviceWorker.ready);
      await page.reload();
      await page.locator('[data-editor-host="html"] .cm-content').waitFor();
      assert.equal(await page.evaluate(()=>Boolean(navigator.serviceWorker.controller)),true,'the assignment shell is controlled by its offline worker');
      const allRuleResults=await page.evaluate(()=>{const html='<main><article id="card" class="card"><h1>Учебная карточка</h1><p>Проверяем текст.</p><img src="/image.png" alt="Иллюстрация"><a href="/next">Дальше</a></article></main>',checks=[{type:'exists',selector:'.card'},{type:'count',selector:'article',min:1,max:1},{type:'text',selector:'h1',text:'Учебная карточка'},{type:'alt',selector:'img'},{type:'link',selector:'a[href]',href:'/next'},{type:'semantic',tag:'main'},{type:'no_inline'},{type:'class_id',attribute:'class',value:'card'}];return window.CourseAccounts.evaluateChecks(html,'',checks);});
      assert.equal(allRuleResults.length,8);assert.ok(allRuleResults.every(item=>item.passed),`all eight DOM-based click-built rules pass against the demo result: ${JSON.stringify(allRuleResults)}`);
      await captureViewportThemeMatrix(page,'задание-ученика');
      await context.setOffline(true);
      const editor=page.locator('[data-editor-host="html"] .cm-content').first();
      await editor.click();await page.keyboard.press('Control+A');await page.keyboard.insertText('<main><h1>Черновик офлайн</h1></main>');
      await page.waitForFunction(async(assignmentId)=>{const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('course-classroom-offline',1);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});return await new Promise(resolve=>{const request=db.transaction('drafts').objectStore('drafts').get(`student:${JSON.parse(localStorage.getItem('course-offline-user-v1')).id}:assignment:${assignmentId}`);request.onsuccess=()=>resolve(request.result?.html?.includes('Черновик офлайн'));request.onerror=()=>resolve(false);});},offlineId);
      await editor.click();await page.keyboard.press('Control+A');await page.keyboard.insertText('<main><h1>Восстановленная работа</h1></main>');
      await page.waitForFunction(async(assignmentId)=>{const db=await new Promise(resolve=>{const request=indexedDB.open('course-classroom-offline',1);request.onsuccess=()=>resolve(request.result)});return await new Promise(resolve=>{const request=db.transaction('drafts').objectStore('drafts').get(`student:${JSON.parse(localStorage.getItem('course-offline-user-v1')).id}:assignment:${assignmentId}`);request.onsuccess=()=>resolve(request.result?.html?.includes('Восстановленная работа'));});},offlineId);
      let failedAttempts=0;const networkEvents=[];page.on('response',response=>{if(response.url().includes(`/api/student/assignments/${offlineId}/draft`))networkEvents.push(`response:${response.status()}`)});page.on('requestfailed',request=>{if(request.url().includes(`/api/student/assignments/${offlineId}/draft`))networkEvents.push(`failed:${request.failure()?.errorText}`)});
      await page.evaluate(()=>{window.__onlineEvents=0;window.addEventListener('online',()=>window.__onlineEvents+=1);});
      await context.route(`${base}/api/student/assignments/${offlineId}/draft`,async route=>{failedAttempts+=1;if(failedAttempts===1)return route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:'Проверочная ошибка сервера'})});if(failedAttempts===2)return route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:'Проверочный лимит запросов'})});return route.continue();});
      await context.setOffline(false);
            try{await page.waitForFunction(()=>document.querySelector('[data-save-status]')?.textContent.includes('Сохранено'),null,{timeout:20000});}catch{const row=(await db.query('SELECT status,draft_revision FROM submissions WHERE assignment_id=$1 AND student_id=$2',[offlineId,learnerIds[0]])).rows[0];throw new Error(`Offline draft did not sync: ${JSON.stringify(await page.evaluate(()=>({online:navigator.onLine,onlineEvents:window.__onlineEvents,status:document.querySelector('[data-save-status]')?.textContent})))}; attempts=${failedAttempts}; events=${networkEvents}; db=${JSON.stringify(row)}`);}
      assert.ok(failedAttempts>=3,'autosave retries after both 500 and 429, then succeeds');
      const savedOffline=(await db.query("SELECT v.html FROM submissions s JOIN submission_versions v ON v.submission_id=s.id WHERE s.assignment_id=$1 AND s.student_id=$2 AND v.kind='draft'",[offlineId,learnerIds[0]])).rows[0];
      assert.match(savedOffline.html,/Восстановленная работа/);
      await context.unrouteAll({behavior:'wait'});
      await context.setOffline(true);
      await page.locator('[data-submit]').click();
      await page.getByRole('button',{name:'Отправить работу',exact:true}).click();
      await page.waitForFunction(()=>document.querySelector('[data-save-status]')?.textContent.includes('сохранена на устройстве'));
      const submitEvents=[];page.on('response',response=>{if(response.url().includes(`/api/student/assignments/${offlineId}/submit`))submitEvents.push(`response:${response.status()}`)});page.on('requestfailed',request=>{if(request.url().includes(`/api/student/assignments/${offlineId}/submit`))submitEvents.push(`failed:${request.failure()?.errorText}`)});page.on('console',message=>{if(message.type()==='error')submitEvents.push(`console:${message.text()}`)});
      await context.setOffline(false);
      await page.waitForURL(new RegExp(`/student/assignment\\.html\\?id=${offlineId}`),{timeout:20000});
      try{await page.waitForFunction(()=>document.querySelector('[data-status="submitted"]')||document.querySelector('[data-status="accepted"]'),null,{timeout:20000});}catch{const row=(await db.query('SELECT submitted_at,client_submitted_at,status,draft_revision FROM submissions WHERE assignment_id=$1 AND student_id=$2',[offlineId,learnerIds[0]])).rows[0];const local=await page.evaluate(async()=>{const req=indexedDB.open('course-classroom-offline',1);const db=await new Promise(resolve=>{req.onsuccess=()=>resolve(req.result)});return await new Promise(resolve=>{const r=db.transaction('drafts').objectStore('drafts').get(`student:${JSON.parse(localStorage.getItem('course-offline-user-v1')).id}:assignment:${new URLSearchParams(location.search).get('id')}`);r.onsuccess=()=>resolve(r.result&&{pendingSubmit:r.result.pendingSubmit,clientSubmittedAt:r.result.clientSubmittedAt,html:r.result.html?.slice(0,80)});});});throw new Error(`Offline queued submit did not sync: ${JSON.stringify(await page.evaluate(()=>({online:navigator.onLine,status:document.querySelector('[data-save-status]')?.textContent,button:document.querySelector('[data-submit]')?.textContent})))}; events=${submitEvents}; local=${JSON.stringify(local)}; db=${JSON.stringify(row)}`);}
      const submittedOffline=(await db.query('SELECT submitted_at,client_submitted_at,status FROM submissions WHERE assignment_id=$1 AND student_id=$2',[offlineId,learnerIds[0]])).rows[0];
      assert.equal(submittedOffline.status,'submitted');assert.ok(submittedOffline.client_submitted_at);assert.ok(Date.parse(submittedOffline.submitted_at)>=Date.parse(submittedOffline.client_submitted_at));
      await page.goto(`${base}/lesson-view.html?lesson=1`);await page.locator('.account-lesson-notes summary').waitFor();await page.locator('.account-lesson-notes summary').click();await page.locator('[data-lesson-note]').waitFor();await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.locator('.account-lesson-notes summary').waitFor();await page.locator('.account-lesson-notes summary').click();await page.locator('[data-lesson-note]').waitFor();
      await context.setOffline(true);await page.locator('[data-lesson-note]').fill('Повторить семантическую разметку офлайн.');
      await page.waitForFunction(async(lessonId)=>{const db=await new Promise(resolve=>{const request=indexedDB.open('course-classroom-notes',1);request.onsuccess=()=>resolve(request.result)});return await new Promise(resolve=>{const request=db.transaction('notes').objectStore('notes').get(`student:${JSON.parse(localStorage.getItem('course-offline-user-v1')).id}:lesson:${lessonId}`);request.onsuccess=()=>resolve(request.result?.note?.includes('семантическую разметку'));});},1);
      await context.setOffline(false);await page.waitForFunction(()=>document.querySelector('[data-lesson-note-status]')?.textContent.includes('Сохранено'),null,{timeout:15000});
      const savedNote=(await db.query('SELECT note FROM lesson_notes WHERE user_id=$1 AND lesson_id=1',[learnerIds[0]])).rows[0];assert.match(savedNote.note,/семантическую разметку/);
      for(const [index,cookie] of [studentCookie,secondCookie,studentCookie].entries()){
        const task=await request(`/api/teacher/classes/${classId}/assignments`,{method:'POST',cookie:teacherCookie,body:{title:`Очередь проверки ${index+1}`,description:'Проверка перехода между работами.',task_type:'build',publish:true,due_at:null,max_score:10,allow_resubmit:true,student_ids:[],starter_html:'<main></main>',starter_css:'',hints:[]}});
        assert.equal(task.response.status,201);
        const work=await request(`/api/student/assignments/${task.data.assignment_id}/submit`,{method:'POST',cookie,body:{html:`<main><h1>Очередь ${index+1}</h1></main>`,css:''}});
        assert.equal(work.response.status,200);
      }
      const reviewQueue=await request(`/api/teacher/classes/${classId}/submissions?status=submitted`,{cookie:teacherCookie});assert.equal(reviewQueue.response.status,200);assert.ok(reviewQueue.data.submissions.length>=3);
      const queueIds=reviewQueue.data.submissions.map(item=>Number(item.id)),firstQueueId=queueIds[0],secondQueueId=queueIds.find(value=>value!==firstQueueId),thirdQueueId=queueIds.find(value=>value!==firstQueueId&&value!==secondQueueId);
      const teacherContext=await browser.newContext({viewport:{width:1280,height:900}}),[teacherCookieName,...teacherCookieParts]=teacherCookie.split('='),teacherCookieValue=teacherCookieParts.join('=');
      try{
        await teacherContext.addCookies([{name:teacherCookieName,value:teacherCookieValue,url:base}]);
        const teacherPage=await teacherContext.newPage();
        await teacherPage.goto(`${base}/teacher/index.html?class=${classId}&view=submissions`);
        await teacherPage.locator(`[data-open-submission="${firstQueueId}"]`).waitFor();
        await teacherPage.locator(`[data-open-submission="${firstQueueId}"]`).click();
        await teacherPage.locator('[data-review-code="html"] .cm-content').waitFor();
        const helpPrevented=await teacherPage.evaluate(()=>!document.querySelector('dialog[data-dialog]').dispatchEvent(new KeyboardEvent('keydown',{key:'?',bubbles:true,cancelable:true})));
        assert.equal(helpPrevented,true,'the ? shortcut is handled inside the review dialog');
        await teacherPage.locator('[data-app-message]').filter({hasText:'Alt + →'}).waitFor();
        await teacherPage.locator('[data-next-submission]').click();
        await teacherPage.getByRole('heading',{name:new RegExp(reviewQueue.data.submissions.find(item=>Number(item.id)===secondQueueId).full_name)}).waitFor();
        const nextPrevented=await teacherPage.evaluate(()=>!document.querySelector('dialog[data-dialog]').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',altKey:true,bubbles:true,cancelable:true})));
        assert.equal(nextPrevented,true,'Alt + → prevents its browser default and advances the review queue');
        await teacherPage.getByRole('heading',{name:new RegExp(reviewQueue.data.submissions.find(item=>Number(item.id)===thirdQueueId).full_name)}).waitFor();
        await teacherPage.locator('[data-review-code="html"] .cm-scroller').evaluate(element=>{element.scrollTop=0;});
        const firstLineNumber=teacherPage.locator('[data-review-code="html"] .cm-lineNumbers .cm-gutterElement').filter({hasText:/^1$/}).first();
        await firstLineNumber.waitFor({state:'visible'});
        await firstLineNumber.click();
        await teacherPage.locator('[data-line-compose]').waitFor({state:'visible'});
        await teacherPage.locator('[data-line-comment-text]').fill('Хороший заголовок; проверь семантику блока.');
        await teacherPage.locator('[data-save-line-comment]').click();
        await teacherPage.locator('.account-line-comments li').filter({hasText:'Хороший заголовок'}).waitFor();
        await teacherPage.locator('[data-close-dialog]').click();
        await teacherPage.locator('[data-filter="accepted"]').click();
        await teacherPage.locator(`[data-open-submission="${submitted.data.submission_id}"]`).waitFor();
        await teacherPage.locator(`[data-open-submission="${submitted.data.submission_id}"]`).click();
        await teacherPage.locator('[data-review-code="html"] .cm-content').waitFor();
        await teacherPage.locator('[data-version-diff]').click();
        await teacherPage.getByRole('heading',{name:/Сравнение версий/}).waitFor();
        assert.match(await teacherPage.locator('dialog[open]').last().innerText(),/[−+]/,'the diff view shows removed and added code lines');
        await teacherPage.keyboard.press('Escape');
        await captureViewportThemeMatrix(teacherPage,'проверка-учителем');
      }
      finally{await teacherContext.close();}
    }finally{await browser.close();}
  } finally {
    await new Promise(resolve => server.close(resolve));
    await app.locals.db.close();
  }
});
