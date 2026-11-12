(() => {
  const A = window.CourseAccounts;
  const root = document.querySelector('[data-assignment-root]');
  if (!A || !root) return;
  if('serviceWorker'in navigator)navigator.serviceWorker.register('./offline-service-worker.js',{scope:'./'}).catch(()=>{});

  const params = new URLSearchParams(location.search);
  const id = Number(params.get('id'));
  const $ = (selector) => root.querySelector(selector);
  const $$ = (selector) => [...root.querySelectorAll(selector)];
  const esc = A.escapeHtml;
  let data;
  let user;
  let htmlEditor;
  let cssEditor;
  let frame;
  let checkFrame;
  let timer;
  let checkTimer;
  let retryTimer;
  let fontTimer;
  let saving = Promise.resolve();
  let dirty = false;
  let editable = false;
  let fontSize = 15;
  let draftRevision = 0;
  let retryDelay = 5000;
  let cachedAssignmentData = null;
  let lastSent = '';
  let pendingSubmit = false;
  let transmittingSubmit = false;
  let submitClickedAt = null;
  let queuedQuizAnswers = null;
  let localWrite=Promise.resolve();
  const draftKey = () => `student:${user?.id || 'unknown'}:assignment:${id}`;

  function openDraftDb(){return new Promise((resolve,reject)=>{const request=indexedDB.open('course-classroom-offline',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('drafts'))request.result.createObjectStore('drafts',{keyPath:'key'});};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
  async function localDraft(){try{const db=await openDraftDb();return await new Promise((resolve,reject)=>{const request=db.transaction('drafts').objectStore('drafts').get(draftKey());request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>reject(request.error);});}catch{return null;}}
  function storeLocalDraft(extra={}){if(!htmlEditor||!cssEditor)return Promise.resolve();const record={key:draftKey(),userId:user.id,assignmentId:id,revision:Date.now(),serverRevision:draftRevision,...codeValues(),quizAnswers:data?.assignment?.task_type==='quiz'?quizAnswers():queuedQuizAnswers,pendingSubmit:extra.pendingSubmit??pendingSubmit,clientSubmittedAt:extra.clientSubmittedAt??submitClickedAt,updatedAt:new Date().toISOString(),assignmentData:cachedAssignmentData};localWrite=localWrite.then(async()=>{const db=await openDraftDb();await new Promise((resolve,reject)=>{const request=db.transaction('drafts','readwrite').objectStore('drafts').put(record);request.onsuccess=resolve;request.onerror=()=>reject(request.error);});return record;}).catch(()=>{message('Не удалось сохранить черновик на этом устройстве. Проверь свободное место браузера.');});return localWrite;}
  async function clearLocalDraft(){try{const db=await openDraftDb();await new Promise((resolve,reject)=>{const request=db.transaction('drafts','readwrite').objectStore('drafts').delete(draftKey());request.onsuccess=resolve;request.onerror=()=>reject(request.error);});}catch{}}

  async function showConflict(server){
    return new Promise(resolve=>{const dialog=document.createElement('dialog');dialog.className='account-dialog';const local=codeValues();dialog.innerHTML=`<div class="account-dialog-inner"><h2>Черновик изменён на другом устройстве</h2><p>Открой обе версии и выбери, какую продолжить. Ничего не будет перезаписано без выбора.</p><div class="account-conflict-versions"><section><h3>На этом устройстве</h3><pre>${esc(local.html.slice(0,5000))}</pre><pre>${esc(local.css.slice(0,3000))}</pre></section><section><h3>На сервере</h3><pre>${esc(server.html.slice(0,5000))}</pre><pre>${esc(server.css.slice(0,3000))}</pre></section></div><div class="account-dialog-actions"><button type="button" data-choice="server" class="account-small-button">Продолжить с серверной версией</button><button type="button" data-choice="local" class="v3-button">Оставить версию этого устройства</button></div></div>`;document.body.append(dialog);dialog.showModal();dialog.querySelectorAll('[data-choice]').forEach(button=>button.addEventListener('click',()=>{const choice=button.dataset.choice;dialog.close();dialog.remove();resolve(choice);}));});
  }

  const lessonLabel = (lessonId) => {
    const lesson = window.COURSE?.lessons.find((item) => item.id === Number(lessonId));
    return lesson ? `Урок ${lesson.number} · ${lesson.title}` : `Урок ${lessonId}`;
  };
  const codeValues = () => ({ html: htmlEditor?.getValue() || '', css: cssEditor?.getValue() || '' });
  const quizAnswers = () => (data?.quiz||data?.assignment?.quiz||[]).map((_,index)=>$$(`input[name="quiz-question-${index}"]:checked`).map(input=>Number(input.value)));
  const message = (text, kind = 'error') => A.setMessage($('[data-editor-message]'), text, kind);
  const changeFontSize = (next) => {
    fontSize = Math.max(12, Math.min(24, Number(next) || 15));
    htmlEditor?.setFontSize(fontSize);
    cssEditor?.setFontSize(fontSize);
    $('[data-font-label]').textContent = `${fontSize} px`;
    $('[data-font-minus]').disabled = fontSize <= 12;
    $('[data-font-plus]').disabled = fontSize >= 24;
  };

  function preview() {
    if (frame) A.showPreview(frame, ...Object.values(codeValues()));
    const box = $('[data-check-results]');
    if (!box || !htmlEditor || !data?.assignment.checks?.length) return;
    const { html, css } = codeValues();
    if(checkFrame){checkFrame.setAttribute('sandbox','allow-same-origin');checkFrame.srcdoc=A.previewDocument(html,css);clearTimeout(checkTimer);checkTimer=setTimeout(()=>{try{const results=A.evaluateChecks(html,css,data.assignment.checks,checkFrame.contentDocument,checkFrame.contentWindow);data.latestCheckResults=results;box.hidden=false;box.innerHTML=`<div class="account-check-results-heading"><strong>Самопроверка</strong><span>${results.filter(item=>item.passed).length} из ${results.length} выполнено</span></div><ul>${results.map(item=>`<li data-passed="${item.passed}"><span aria-hidden="true">${item.passed?'✓':'○'}</span><span>${esc(item.label)}</span><strong>${item.passed?'Готово':'Проверь'}</strong></li>`).join('')}</ul><p class="account-muted">Проверка выполняется в браузере и помогает заметить требования. Итоговую работу оценивает учитель.</p>`;}catch{/* The sandbox may still be loading; the next edit reruns checks. */}},300);}
  }

  function scheduleSave() {
    dirty = true;
    preview();
    void storeLocalDraft();
    clearTimeout(timer);
    const status = $('[data-save-status]');
    if (status) status.textContent = 'Есть несохранённые изменения';
    timer = setTimeout(saveDraft, 5000);
  }

  async function saveDraft() {
    if (!editable || !dirty) return saving;
    clearTimeout(timer);
    const body = codeValues();
    const fingerprint=JSON.stringify(body);
    if(fingerprint===lastSent){dirty=false;return saving;}
    if(!navigator.onLine){await storeLocalDraft();const status=$('[data-save-status]');if(status)status.textContent='Нет связи, сохранено на устройстве';return saving;}
    const status = $('[data-save-status]');
    if (status) status.textContent = 'Сохраняю…';
    saving = A.api(`/api/student/assignments/${id}/draft`, { method: 'PUT', body: JSON.stringify({...body,client_revision:draftRevision}) })
      .then(async(result) => { draftRevision=Number(result.revision||draftRevision);lastSent=fingerprint;retryDelay=5000;dirty=JSON.stringify(codeValues())!==fingerprint;if(pendingSubmit&&!dirty){await transmitPendingSubmit();return;}if(!dirty)await clearLocalDraft();else void storeLocalDraft();if(status)status.textContent=dirty?'Сохраняются новые изменения…':`Сохранено · ${A.formatDate(result.saved_at)}`; })
      .catch(async(error) => { dirty = true;if(error.conflict){const choice=await showConflict(error.server_draft||{html:'',css:''});draftRevision=Number(error.draft_revision||draftRevision);if(choice==='server'){htmlEditor.setValue(error.server_draft?.html||'');cssEditor.setValue(error.server_draft?.css||'');lastSent=JSON.stringify(codeValues());dirty=false;await storeLocalDraft();if(status)status.textContent='Загружена версия с сервера';return;}clearTimeout(retryTimer);void saveDraft();return;}if(status)status.textContent=navigator.onLine?'Не удалось сохранить. Повторяю…':'Нет связи, сохранено на устройстве';await storeLocalDraft();clearTimeout(retryTimer);retryTimer=setTimeout(()=>{if(dirty)void saveDraft();},retryDelay);retryDelay=Math.min(retryDelay*2,60000); });
    return saving;
  }

  function historyMarkup(versions = []) {
    if (!versions.length) return '';
    return `<details class="account-version-history" data-version-history><summary>История версий (${versions.length})</summary><ol>${versions.map((version) => {
      const label = version.kind === 'submitted' ? 'Отправленная версия' : version.kind === 'backup' ? 'Копия перед сбросом' : 'Черновик';
      const previewButton = version.kind === 'submitted' || version.kind === 'backup' ? `<button type="button" class="account-small-button" data-view-version="${version.id}">Показать код</button>` : '';
      const restoreButton = editable && version.kind === 'backup' ? `<button type="button" class="account-small-button" data-restore-version="${version.id}">Вернуть эту версию</button>` : '';
      return `<li><strong>${label}</strong> · ${A.formatDate(version.created_at)} ${previewButton} ${restoreButton}</li>`;
    }).join('')}</ol></details>`;
  }

  function render(dataValue) {
    data = dataValue;
    const assignment = data.assignment;
    const submission = data.submission;
    const versions = data.versions || [];
    const latest = versions[0] || data.draft || null;
    editable = !Number(assignment.archived) && (!submission || submission.status === 'draft' || (submission.can_edit && ['returned', 'accepted'].includes(submission.status)));
    const initialHtml = latest?.html ?? assignment.starter_html ?? '';
    const initialCss = latest?.css ?? assignment.starter_css ?? '';
    const hasHints = !Boolean(Number(assignment.no_hints));
    const statusText = Number(assignment.archived) ? 'Класс в архиве: работа и оценка доступны только для просмотра' : editable ? 'Черновик сохранится автоматически' : submission?.status === 'accepted' ? 'Работа проверена и заблокирована' : 'Работа отправлена и доступна только для просмотра';
    const taskLabels={build:'Собери с нуля',fix:'Найди и исправь ошибки',complete:'Допиши код',model:'Повтори по образцу',quiz:'Небольшой тест'};
    const savedAnswers=Array.isArray(submission?.quiz_answers_json)?submission.quiz_answers_json:typeof submission?.quiz_answers_json==='string'?(()=>{try{return JSON.parse(submission.quiz_answers_json)}catch{return[]}})():[];
    const quizMarkup=assignment.task_type==='quiz'?`<section class="account-panel account-quiz" data-quiz><div class="account-eyebrow">${esc(taskLabels[assignment.task_type]||'ТЕСТ')}</div><h2>Ответь на вопросы</h2><p class="account-muted">Выбери один или несколько вариантов. После отправки сайт покажет результат и объяснение.</p>${(data.quiz||assignment.quiz||[]).map((question,index)=>`<fieldset class="account-quiz-card"><legend>${index+1}. ${esc(question.prompt)}</legend>${question.options.map((option,optionIndex)=>{const inputType=question.multiple?'checkbox':'radio',checked=(savedAnswers[index]||[]).includes(optionIndex),feedback=data.quiz_feedback?.[index];return `<label class="account-quiz-answer ${feedback?(feedback.passed?'is-correct':'is-reviewed'):''}"><input type="${inputType}" name="quiz-question-${index}" value="${optionIndex}" ${checked?'checked':''} ${editable?'':'disabled'}><span>${esc(option)}</span></label>`}).join('')}${data.quiz_feedback?.[index]?`<p class="account-muted">${data.quiz_feedback[index].passed?'Верно.':'Ответ записан.'} ${esc(data.quiz_feedback[index].explanation||'')}</p>`:''}</fieldset>`).join('')||'<p class="account-warning">Учитель ещё не добавил вопросы в тест.</p>'}${submission?.score!=null?`<p class="account-quiz-score">Результат: <strong>${submission.score} / ${assignment.max_score}</strong></p>`:''}</section>`:'';
    const hintsMarkup=hasHints&&assignment.hints?`<section class="account-panel account-hints"><h2>Подсказки по шагам</h2><p class="account-muted">${Number(assignment.archived)?'Открытые подсказки можно посмотреть. Новые в архиве недоступны.':'Открывай подсказки по порядку. Учитель увидит, сколько подсказок ты использовал.'}</p><div class="account-hint-list">${Array.from({length:Math.min(3,Number(assignment.hints)||0)},(_,index)=>{const opened=(data.opened_hints||[]).some(item=>Number(item.hint_index)===index);return `<article data-hint-card="${index}"><button type="button" class="account-small-button" data-open-hint="${index}" ${Number(assignment.archived)||opened||index>(data.opened_hints||[]).length?'disabled':''}>${opened?`Подсказка ${index+1} открыта`:Number(assignment.archived)?`Не открывалась в этом учебном году`:`Открыть подсказку ${index+1}`}</button><p data-hint-text ${opened?'':'hidden'}>${esc(data.opened_hints?.find(item=>Number(item.hint_index)===index)?.text||'После открытия появится подсказка.')}</p></article>`}).join('')}</div></section>`:'';
    const modelMarkup=assignment.task_type==='model'?`<section class="account-panel"><h2>Образец результата</h2><p class="account-muted">Сверься с тем, как должна выглядеть готовая страница. Код образца ученику не показывается.</p>${assignment.model_preview?`<img class="account-model-preview" src="${esc(assignment.model_preview)}" alt="Визуальный образец задания">`:'<p class="account-warning">Учитель ещё не добавил изображение образца.</p>'}</section>`:'';
    const lineCommentsMarkup=(data.line_comments||[]).length?`<section class="account-panel"><h2>Замечания к строкам кода</h2><ol class="account-line-comments">${data.line_comments.map(item=>`<li><strong>${item.language.toUpperCase()}, строка ${item.line_number}</strong><pre>${esc(item.excerpt||'')}</pre><p>${esc(item.comment)}</p>${item.resolved_at?'<span class="account-status" data-status="accepted">Исправлено</span>':editable?`<button type="button" class="account-small-button" data-resolve-comment="${item.id}">Отметить «исправил»</button>`:'<span class="account-muted">Ожидает исправления</span>'}</li>`).join('')}</ol></section>`:'';
    const questionMarkup=`<section class="account-panel account-question-panel"><h2>${Number(assignment.archived)?'Вопросы по заданию':'Вопрос учителю'}</h2><p class="account-muted">${Number(assignment.archived)?'Архив: история доступна для просмотра, новые вопросы отправить нельзя.':'Здесь видны только твои вопросы и ответы, которые учитель разрешил показать классу.'}</p>${editable?'<form data-question-form><label>Короткий вопрос<textarea name="question" maxlength="2000" required placeholder="Что именно непонятно в задании?"></textarea></label><button class="account-small-button" type="submit">Отправить вопрос</button></form>':''}<div data-question-list><p class="account-muted">Загружаю вопросы…</p></div></section>`;

    root.innerHTML = `<nav class="account-breadcrumb"><a href="index.html">← К заданиям</a>${assignment.lesson_id ? `<span>${esc(lessonLabel(assignment.lesson_id))}</span>` : ''}</nav>${Number(assignment.archived)?'<div class="account-warning account-archive-notice"><strong>Этот класс закрыт.</strong> Здесь можно посмотреть работу и оценку. Изменять код, отправлять ответы и задавать новые вопросы нельзя.</div>':''}
      <header class="account-page-heading"><div><div class="account-eyebrow">${esc(taskLabels[assignment.task_type]||'ПРАКТИЧЕСКОЕ ЗАДАНИЕ')}${assignment.lesson_id ? ` · ${esc(lessonLabel(assignment.lesson_id))}` : ''}</div><h1>${esc(assignment.title)}</h1><div class="account-description">${A.formatDescription(assignment.description || 'Учитель пока не добавил инструкцию.')}</div><p class="account-muted">${assignment.due_at ? `Срок сдачи: ${A.formatDueDate(assignment.due_at)}` : 'Срок сдачи не установлен'} · Максимум: ${assignment.max_score} баллов</p>${Number(assignment.late_penalty_percent_per_day)>0?`<p class="account-warning">При опоздании балл уменьшается на ${assignment.late_penalty_percent_per_day}% за день, не больше ${assignment.late_penalty_max_percent}%.</p>`:''}${submission?.late_penalty_percent?`<p class="account-muted">Учитель применил штраф ${submission.late_penalty_percent}%.</p>`:''}</div><span class="account-status" data-status="${submission?.status || 'not_started'}">${Number(assignment.archived)?'Архив · просмотр':({ draft: 'Черновик', submitted: 'Отправлено на проверку', returned: 'Нужно доработать', accepted: 'Проверено' })[submission?.status] || 'Новое задание'}</span></header>
      <nav class="account-assignment-tabs" data-assignment-tabs aria-label="Разделы задания" hidden><button type="button" data-assignment-tab="condition" aria-pressed="false">Условие</button><button type="button" data-assignment-tab="code" aria-pressed="true">Код</button><button type="button" data-assignment-tab="result" aria-pressed="false">Результат</button></nav>
      <iframe hidden aria-hidden="true" tabindex="-1" data-check-frame sandbox="allow-same-origin" title="Изолированная самопроверка"></iframe>
      <div class="account-assignment-condition" data-assignment-pane="condition">${submission?.teacher_comment ? `<section class="account-panel account-teacher-feedback"><div class="account-eyebrow">ОТВЕТ УЧИТЕЛЯ</div><p>${esc(submission.teacher_comment)}</p>${submission.score != null ? `<strong>Оценка: ${submission.score} / ${assignment.max_score}</strong>` : ''}</section>` : ''}${lineCommentsMarkup}</div>
      <div class="account-message" data-editor-message role="status" aria-live="polite" hidden></div>
      <div class="account-editor-toolbar" data-assignment-pane="code"><div><strong>Рабочее место</strong><span data-save-status>${statusText}</span></div><div class="account-actions"><div class="editor-font-controls" role="group" aria-label="Размер текста редактора"><button type="button" data-font-minus aria-label="Уменьшить шрифт редактора">−</button><output data-font-label>15 px</output><button type="button" data-font-plus aria-label="Увеличить шрифт редактора">+</button></div><button type="button" class="account-small-button" data-fullscreen>Предпросмотр на весь экран</button>${editable ? '<button type="button" class="account-small-button" data-save>Сохранить сейчас</button>' : ''}</div></div>
      <div class="account-assignment-condition" data-assignment-pane="condition">${assignment.no_hints ? '<p class="account-warning" data-hints-warning>Учитель отключил подсказки редактора. Номера строк и форматирование остаются доступными.</p>' : ''}${hintsMarkup}${modelMarkup}${quizMarkup}${questionMarkup}${assignment.checks?.length ? '<section class="account-check-results" data-check-results aria-live="polite"></section>' : ''}</div>
      <section class="account-editor-layout"><div class="account-editor-column" data-assignment-pane="code">
        <div class="account-editor-label"><span>01</span>HTML <small>Структура страницы</small><div class="editor-touch-tools">${editable && hasHints ? '<button type="button" class="editor-touch-button" data-editor-command="suggestions" data-editor-language="html">✦ Подсказки</button><button type="button" class="editor-touch-button" data-editor-command="indent" data-editor-language="html">↦ Отступ</button>' : ''}</div><button type="button" class="account-small-button" data-format="html" ${editable ? '' : 'hidden'}>Форматировать</button></div><div data-editor-host="html"></div>
        <div class="account-editor-label"><span>02</span>CSS <small>Внешний вид</small><div class="editor-touch-tools">${editable && hasHints ? '<button type="button" class="editor-touch-button" data-editor-command="suggestions" data-editor-language="css">✦ Подсказки</button><button type="button" class="editor-touch-button" data-editor-command="indent" data-editor-language="css">↦ Отступ</button>' : ''}</div><button type="button" class="account-small-button" data-format="css" ${editable ? '' : 'hidden'}>Форматировать</button></div><div data-editor-host="css"></div>
        <p class="account-muted account-editor-help">${hasHints ? 'Подсказки появляются при вводе. Enter или Tab вставляют выбранный вариант; Tab без списка делает отступ. Ctrl+Space открывает список вручную; на телефоне используй кнопки рядом с редактором.' : 'Подсказки отключены учителем. Tab делает отступ, Shift+Tab уменьшает его. Форматирование остаётся доступным.'}</p>
        ${editable ? '<div class="account-actions account-editor-actions"><button type="button" class="account-small-button" data-format-both>Форматировать HTML и CSS</button><button type="button" class="account-small-button" data-reset-starter>Сбросить к стартовому коду</button></div>' : ''}
      </div><div class="account-preview-column" data-assignment-pane="result"><div class="account-editor-label"><span>03</span>Предпросмотр <small>Скрипты и внешние запросы отключены</small></div><iframe class="account-preview" title="Предпросмотр задания" sandbox="" referrerpolicy="no-referrer"></iframe><p class="account-muted account-preview-help">Измени HTML или CSS слева — результат появится здесь. Это безопасная изолированная область.</p></div></section>
      ${editable ? `<section class="account-submit-panel"><div><h2>${submission?.status === 'returned' ? 'Исправь работу и отправь ещё раз' : 'Когда работа будет готова'}</h2><p class="account-muted">Перед отправкой проверь предпросмотр. После отправки редактирование временно закроется до ответа учителя.</p></div><button class="v3-button" data-submit>Отправить работу учителю <span aria-hidden="true">→</span></button></section>` : submission?.status === 'returned' ? '<section class="account-submit-panel"><div><h2>Учитель пока не разрешил пересдачу</h2><p class="account-muted">Обратись к учителю, если хочешь внести исправления.</p></div></section>' : `<section class="account-submit-panel"><div><h2>${Number(assignment.archived)?'Учебный год закрыт':submission?.status === 'accepted' ? 'Работа проверена' : 'Работа отправлена'}</h2><p class="account-muted">${Number(assignment.archived)?'Работа и оценки сохранены в архиве. Новая отправка в этом учебном году отключена.':submission?.status === 'accepted' ? 'Учитель принял работу.' : 'Учитель скоро проверит её и оставит комментарий.'}</p></div><a class="v3-button v3-button-secondary" href="profile.html">Моя история</a></section>`}
      ${historyMarkup(versions)}`;

    const assignmentTabs = $('[data-assignment-tabs]');
    const assignmentTabButtons = $$('[data-assignment-tab]');
    const assignmentPanes = $$('[data-assignment-pane]');
    const compactLayout = window.matchMedia('(max-width: 900px)');
    const phoneLayout = window.matchMedia('(max-width: 600px)');
    let activeAssignmentPane = phoneLayout.matches ? 'code' : 'condition';
    const updateAssignmentTabs = () => {
      if (assignment.task_type === 'quiz') {
        assignmentTabs.hidden = true;
        assignmentPanes.forEach((pane) => { pane.hidden = false; });
        return;
      }
      const compact = compactLayout.matches;
      const phone = phoneLayout.matches;
      assignmentTabs.hidden = !compact;
      if (!compact) {
        assignmentPanes.forEach((pane) => { pane.hidden = false; });
        return;
      }
      const availablePanes = phone ? ['code', 'result'] : ['condition', 'code', 'result'];
      if (!availablePanes.includes(activeAssignmentPane)) activeAssignmentPane = phone ? 'code' : 'condition';
      assignmentTabButtons.forEach((button) => {
        button.hidden = phone && button.dataset.assignmentTab === 'condition';
        button.setAttribute('aria-pressed', String(button.dataset.assignmentTab === activeAssignmentPane));
      });
      assignmentPanes.forEach((pane) => {
        const paneName = pane.dataset.assignmentPane;
        pane.hidden = phone && paneName === 'condition' ? false : paneName !== activeAssignmentPane;
      });
      if (activeAssignmentPane === 'code') requestAnimationFrame(() => { htmlEditor?.refresh?.(); cssEditor?.refresh?.(); });
    };
    assignmentTabButtons.forEach((button) => button.addEventListener('click', () => {
      activeAssignmentPane = button.dataset.assignmentTab;
      updateAssignmentTabs();
      const pane = assignmentPanes.find((item) => item.dataset.assignmentPane === activeAssignmentPane);
      pane?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }));
    compactLayout.addEventListener?.('change', updateAssignmentTabs);
    phoneLayout.addEventListener?.('change', updateAssignmentTabs);
    window.addEventListener('resize', updateAssignmentTabs, { passive: true });
    updateAssignmentTabs();

    frame = $('.account-preview');checkFrame=$('[data-check-frame]');
    if(assignment.task_type==='quiz'){const toolbar=$('.account-editor-toolbar'),layout=$('.account-editor-layout'),checkResults=$('[data-check-results]');if(toolbar)toolbar.hidden=true;if(layout)layout.hidden=true;if(checkResults)checkResults.hidden=true;const title=$('.account-submit-panel h2'),copy=$('.account-submit-panel p'),submitButton=$('[data-submit]');if(title)title.textContent=submission?'Тест отправлен':'Проверь ответы';if(copy)copy.textContent=submission?`Результат рассчитан автоматически: ${submission.score??0} из ${assignment.max_score} баллов.`:'После отправки ответы проверятся автоматически, учитель увидит результат.';if(submitButton)submitButton.textContent='Отправить ответы';}
    $$('[data-open-hint]').forEach(button=>button.addEventListener('click',async()=>{const index=Number(button.dataset.openHint),confirmed=await A.confirmDialog({title:`Открыть подсказку ${index+1}?`,message:'Учитель увидит, что эта подсказка была открыта.',confirmLabel:'Открыть подсказку'});if(!confirmed)return;try{const result=await A.api(`/api/student/assignments/${id}/hints/${index}`,{method:'POST',body:JSON.stringify({})});data.opened_hints=[...(data.opened_hints||[]),{hint_index:index,text:result.hint,opened_at:result.opened_at}];const card=$(`[data-hint-card="${index}"]`);card.querySelector('[data-hint-text]').textContent=result.hint;card.querySelector('[data-hint-text]').hidden=false;button.disabled=true;button.textContent=`Подсказка ${index+1} открыта`;const next=$(`[data-open-hint="${index+1}"]`);if(next)next.disabled=false;}catch(error){message(error.message);}}));
    $$('[data-resolve-comment]').forEach(button=>button.addEventListener('click',async()=>{try{await A.api(`/api/student/line-comments/${button.dataset.resolveComment}/resolve`,{method:'PATCH',body:JSON.stringify({resolved:true})});button.replaceWith(Object.assign(document.createElement('span'),{className:'account-status',textContent:'Отмечено как исправленное'}));}catch(error){message(error.message);}}));
    const questionList=$('[data-question-list]'),questionForm=$('[data-question-form]');async function loadQuestions(){if(!questionList)return;try{const response=await A.api(`/api/student/assignments/${id}/questions`);questionList.innerHTML=response.questions.length?`<ol class="account-question-list">${response.questions.map(item=>`<li><p><strong>Твой вопрос</strong><br>${esc(item.question)}</p>${item.teacher_reply?`<div class="account-question-reply"><strong>Ответ учителя</strong><p>${esc(item.teacher_reply)}</p></div>`:'<span class="account-muted">Ждёт ответа учителя</span>'}</li>`).join('')}</ol>`:'<p class="account-muted">Вопросов пока нет.</p>';}catch(error){questionList.textContent=error.message;}}void loadQuestions();questionForm?.addEventListener('submit',async event=>{event.preventDefault();try{await A.api(`/api/student/assignments/${id}/questions`,{method:'POST',body:JSON.stringify({question:questionForm.elements.question.value})});questionForm.reset();await loadQuestions();message('Вопрос отправлен учителю.','success');}catch(error){message(error.message);}});
    preview();
    window.loadCourseCodeEditor().then((api) => {
      htmlEditor?.destroy();
      cssEditor?.destroy();
      const change = () => scheduleSave();
      const hints = hasHints && editable;
      htmlEditor = api.createEditor($('[data-editor-host="html"]'), { value: initialHtml, language: 'html', hints, readOnly: !editable, fontSize, onChange: change });
      cssEditor = api.createEditor($('[data-editor-host="css"]'), { value: initialCss, language: 'css', hints, readOnly: !editable, fontSize, onChange: change });
      changeFontSize(fontSize);
      preview();
    }).catch((error) => message(error.message));

    $('[data-font-minus]').addEventListener('click', () => window.setCourseEditorFontSize?.(fontSize - 1));
    $('[data-font-plus]').addEventListener('click', () => window.setCourseEditorFontSize?.(fontSize + 1));
    window.addEventListener('course-editor-font-size-change', (event) => changeFontSize(event.detail?.fontSize));
    $('[data-format-both]')?.addEventListener('click', () => { htmlEditor?.format(); cssEditor?.format(); message('HTML и CSS отформатированы. Их можно вернуть сочетанием Ctrl+Z.', 'success'); });
    $$('[data-format]').forEach((button) => button.addEventListener('click', () => {
      const editor = button.dataset.format === 'css' ? cssEditor : htmlEditor;
      if (editor?.format()) message(`${button.dataset.format.toUpperCase()} отформатирован. Изменение можно отменить сочетанием Ctrl+Z.`, 'success');
      else message('Локальный форматтер пока недоступен.');
    }));
    $$('[data-editor-command]').forEach((button) => button.addEventListener('click', () => {
      const editor = button.dataset.editorLanguage === 'css' ? cssEditor : htmlEditor;
      if (button.dataset.editorCommand === 'suggestions') editor?.showCompletions();
      else editor?.indent();
    }));
    $('[data-reset-starter]')?.addEventListener('click', resetToStarter);
    $('[data-save]')?.addEventListener('click', async () => { await saveDraft(); message(dirty ? 'Не удалось сохранить черновик.' : 'Черновик сохранён.', dirty ? 'error' : 'success'); });
    $('[data-fullscreen]')?.addEventListener('click', async () => {
      try { if (frame.requestFullscreen) await frame.requestFullscreen(); else message('Полноэкранный режим недоступен в этом браузере.'); }
      catch { message('Браузер не разрешил полноэкранный режим.'); }
    });
    $('[data-submit]')?.addEventListener('click', submitWork);
    root.addEventListener('click', handleHistoryAction);
    document.addEventListener('visibilitychange', () => { if (document.hidden && dirty) saveDraft(); }, { once: true });
    window.addEventListener('pagehide', saveOnPageHide, { once: true });
  }

  async function resetToStarter() {
    const confirmed = await A.confirmDialog({ title: 'Сбросить код к стартовому?', message: 'Текущая версия сначала сохранится в истории, чтобы её можно было вернуть.', confirmLabel: 'Сохранить копию и сбросить' });
    if (!confirmed) return;
    try {
      if (dirty) await saveDraft();
      if (dirty) throw new Error('Текущая версия не сохранилась. Проверь соединение и попробуй ещё раз.');
      const current = codeValues();
      const starter = { html: data.assignment.starter_html || '', css: data.assignment.starter_css || '' };
      const changed = current.html !== starter.html || current.css !== starter.css;
      if (changed) {
        const saved = await A.api(`/api/student/assignments/${id}/draft/backup`, { method: 'POST', body: JSON.stringify(current) });
        data.versions = [{ ...saved, ...current }, ...(data.versions || [])];
        const history = $('[data-version-history]');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = historyMarkup(data.versions);
        if (history) history.replaceWith(wrapper.firstElementChild);
        else $('[data-submit]')?.closest('.account-submit-panel')?.insertAdjacentHTML('beforebegin', historyMarkup(data.versions));
      }
      htmlEditor.setValue(starter.html, { silent: true });
      cssEditor.setValue(starter.css, { silent: true });
      scheduleSave();
      message(changed ? 'Стартовый код восстановлен. Текущая версия сохранена в истории.' : 'Код уже совпадает со стартовым.', 'success');
    } catch (error) { message(error.message); }
  }

  async function handleHistoryAction(event) {
    const viewButton = event.target.closest('[data-view-version]');
    const restoreButton = event.target.closest('[data-restore-version]');
    if (!viewButton && !restoreButton) return;
    const versionId = Number((viewButton || restoreButton).dataset.viewVersion || (viewButton || restoreButton).dataset.restoreVersion);
    const version = data.versions.find((item) => item.id === versionId);
    if (!version) return;
    if (restoreButton) {
      const confirmed = await A.confirmDialog({ title: 'Вернуть сохранённую версию?', message: 'Текущий код останется в черновике, а выбранная копия станет рабочей.', confirmLabel: 'Вернуть версию' });
      if (!confirmed) return;
      htmlEditor.setValue(version.html);
      cssEditor.setValue(version.css);
      scheduleSave();
      message('Сохранённая версия восстановлена в редакторе.', 'success');
      return;
    }
    const modal = document.createElement('dialog');
    modal.className = 'account-dialog';
    modal.innerHTML = `<div class="account-dialog-inner"><h2>${version.kind === 'backup' ? 'Копия перед сбросом' : 'Отправленная версия'} · ${A.formatDate(version.created_at)}</h2><h3>HTML</h3><pre class="account-code-view"><code>${esc(version.html)}</code></pre><h3>CSS</h3><pre class="account-code-view"><code>${esc(version.css)}</code></pre><div class="account-dialog-actions"><button class="v3-button" type="button">Закрыть</button></div></div>`;
    document.body.append(modal);
    modal.showModal();
    modal.querySelector('button').addEventListener('click', () => { modal.close(); modal.remove(); });
  }

  async function submitWork(event) {
    const button = event.currentTarget;
    if(data.assignment.task_type==='quiz'&&quizAnswers().some(answer=>!answer.length)){message('Ответь на каждый вопрос перед отправкой.');return;}
    const confirmed = await A.confirmDialog({ title: 'Отправить работу учителю?', message: 'После отправки редактирование будет закрыто до ответа учителя.', confirmLabel: 'Отправить работу' });
    if (!confirmed) return;
    if(data.assignment.checks?.length){preview();await new Promise(resolve=>setTimeout(resolve,350));}
    button.disabled = true;
    button.textContent = 'Сохраняю отправку…';
    try {
      clearTimeout(timer);
      pendingSubmit=true;submitClickedAt=new Date().toISOString();await storeLocalDraft({pendingSubmit:true,clientSubmittedAt:submitClickedAt});
      if(!navigator.onLine){const status=$('[data-save-status]');if(status)status.textContent='Нет связи. Отправка сохранена на устройстве';message('Нет связи. Работа сохранена на устройстве и отправится автоматически после восстановления соединения.','success');button.disabled=false;button.textContent='Отправка сохранена';return;}
      await saving;if(dirty)await saveDraft();if(dirty)throw new Error('Черновик пока не удалось сохранить. Отправка останется в очереди и повторится автоматически.');await transmitPendingSubmit();
    } catch (error) {
      button.disabled = false;
      button.innerHTML = 'Отправить работу учителю <span aria-hidden="true">→</span>';
      if(!navigator.onLine){const status=$('[data-save-status]');if(status)status.textContent='Нет связи. Отправка сохранена на устройстве';message('Нет связи. Работа сохранена на устройстве и отправится автоматически после восстановления соединения.','success');}else message(error.message);
    }
  }

  async function transmitPendingSubmit(){
    if(!pendingSubmit||!navigator.onLine||transmittingSubmit)return;
    if(!htmlEditor||!cssEditor){clearTimeout(retryTimer);retryTimer=setTimeout(()=>void transmitPendingSubmit(),300);return;}
    const button=$('[data-submit]'),status=$('[data-save-status]');if(button){button.disabled=true;button.textContent='Отправляю…';}
    transmittingSubmit=true;
    try{const response=await A.api(`/api/student/assignments/${id}/submit`,{method:'POST',body:JSON.stringify({...codeValues(),...(data.assignment.task_type==='quiz'?{answers:quizAnswers()}:{}),client_submitted_at:submitClickedAt,check_results:data?.latestCheckResults||[]})});pendingSubmit=false;dirty=false;await clearLocalDraft();if(status)status.textContent='Отправлено после восстановления связи';if(response.auto_score!=null)message(`Автоматический результат: ${response.auto_score} из ${response.max_score||data.assignment.max_score} баллов.`,'success');else message('Работа отправлена учителю.','success');setTimeout(()=>location.replace(`assignment.html?id=${id}`),500);}catch(error){
      if(error.status===409&&navigator.onLine){try{const latest=await A.api(`/api/student/assignments/${id}`);if(['submitted','accepted'].includes(latest.submission?.status)){pendingSubmit=false;dirty=false;await clearLocalDraft();if(status)status.textContent='Отправлено после восстановления связи';setTimeout(()=>location.replace(`assignment.html?id=${id}`),250);return;}}catch{/* Keep the local queue and retry if the status cannot be confirmed. */}}
      if(button){button.disabled=false;button.innerHTML=data.assignment.task_type==='quiz'?'Отправить ответы':'Отправить работу учителю <span aria-hidden="true">→</span>';}await storeLocalDraft({pendingSubmit:true,clientSubmittedAt:submitClickedAt});if(status)status.textContent=navigator.onLine?'Отправка не удалась. Повторяю…':'Нет связи. Отправка сохранена на устройстве';clearTimeout(retryTimer);retryTimer=setTimeout(()=>void transmitPendingSubmit(),retryDelay);retryDelay=Math.min(retryDelay*2,60000);
    }finally{transmittingSubmit=false;}
  }

  function saveOnPageHide() {
    if (!dirty || !navigator.sendBeacon || !navigator.onLine) return;
    void storeLocalDraft();
    const payload = new Blob([JSON.stringify({...codeValues(),client_revision:draftRevision})], { type: 'application/json' });
    if (navigator.sendBeacon(`/api/student/assignments/${id}/draft/beacon`, payload)) { dirty = false; clearTimeout(timer); }
  }

  window.addEventListener('online',()=>{const status=$('[data-save-status]');if(status)status.textContent='Связь восстановлена. Отправляю изменения…';retryDelay=5000;if(pendingSubmit)void transmitPendingSubmit();else if(dirty)void saveDraft();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&navigator.onLine){if(pendingSubmit)void transmitPendingSubmit();else if(dirty)void saveDraft();}});

  async function load() {
    const local=await localDraft();let assignment;
    try{assignment=await A.api(`/api/student/assignments/${id}`);cachedAssignmentData=assignment;draftRevision=Number(assignment.draft_revision||0);}
    catch(error){if(!local?.assignmentData)throw error;assignment=local.assignmentData;cachedAssignmentData=assignment;draftRevision=Number(local.serverRevision||0);pendingSubmit=Boolean(local.pendingSubmit);submitClickedAt=local.clientSubmittedAt||null;}
    const savedFontSize=await (window.loadCourseEditorFontSize?.()??Promise.resolve(15));
    fontSize = savedFontSize;
    if(navigator.onLine){await A.api(`/api/student/assignments/${id}/read`, { method: 'POST', body: JSON.stringify({}) });void A.api('/api/student/journey', { method: 'PUT', body: JSON.stringify({ kind: 'assignment', assignment_id: id }) }).catch(() => {});}
    const serverDraft=assignment.draft||assignment.versions?.find(item=>item.kind==='draft'),serverCode={html:serverDraft?.html??assignment.assignment?.starter_html??'',css:serverDraft?.css??assignment.assignment?.starter_css??''};lastSent=JSON.stringify(serverCode);
    if(local){pendingSubmit=Boolean(local.pendingSubmit);submitClickedAt=local.clientSubmittedAt||null;queuedQuizAnswers=local.quizAnswers||null;if(local.html!==serverCode.html||local.css!==serverCode.css){assignment.draft={html:local.html,css:local.css,created_at:local.updatedAt,kind:'draft'};dirty=true;}}
    render(assignment);
    if(queuedQuizAnswers){queuedQuizAnswers.forEach((selected,index)=>selected.forEach(option=>{const input=$(`input[name="quiz-question-${index}"][value="${Number(option)}"]`);if(input)input.checked=true;}));}
    if(pendingSubmit){const status=$('[data-save-status]');if(status)status.textContent=navigator.onLine?'Отправляю сохранённую работу…':'Нет связи. Отправка сохранена на устройстве';if(navigator.onLine)void transmitPendingSubmit();}
    else if(dirty){const status=$('[data-save-status]');if(status)status.textContent='Восстановлен локальный черновик';if(navigator.onLine)void saveDraft();}
  }

  async function init() {
    user = await A.guard('student');
    if (!user) return;
    if (!Number.isInteger(id) || id < 1) {
      root.innerHTML = '<section class="account-empty"><h1>Задание не найдено</h1><a class="v3-button" href="index.html">К списку заданий</a></section>';
      return;
    }
    try { await load(); } catch (error) { A.showLoadError(root, error, load); }
  }
  init();
})();
