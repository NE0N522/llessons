(() => {
  const root = document.querySelector('#lesson-root');
  const query = new URLSearchParams(window.location.search);
  const id = Number(query.get('lesson'));
  const map = window.COURSE;
  const lessonPage = 'lesson-view.html';
  const examplePage = 'examples/view.html';
  const lessonMap = new Map((map?.lessons || []).map((item) => [item.id, item]));

  const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const durationLabel = (value) => { const minutes = Number(value) || 120; if (minutes % 60) return `${minutes} минут`; const hours = minutes / 60; const suffix = hours % 10 === 1 && hours % 100 !== 11 ? 'час' : hours % 10 >= 2 && hours % 10 <= 4 && (hours % 100 < 12 || hours % 100 > 14) ? 'часа' : 'часов'; return `${hours} ${suffix}`; };
  const encoded = (value = '') => encodeURIComponent(value);
  const textList = (items = []) => items.map((item) => `<li>${esc(item)}</li>`).join('');
  const menuName = (item) => lessonMap.get(item.id)?.title || item.title;
  const linkForLesson = (targetId) => `lesson-view.html?lesson=${targetId}`;
  const focusFor = (title = '') => String(title).replace(/^(?:начни\s+с|добавь|добавляем|добавьте|создай|создаём|создаем|собираем|соберите|настрой|настраиваем|проверяем|разбираем|работаем\s+с|управляем|строим|выбираем|показываем|пишем|оформляем)\s+/i, '').split(/\s*[:—–]\s*/)[0].trim() || title;

  const showMessage = (title, body, href = 'index.html', linkText = 'К программе') => {
    document.title = `${title} — Код по полочкам`;
    if (root) root.innerHTML = `<section class="v3-message"><p class="v3-block-label">КОД ПО ПОЛОЧКАМ</p><h1>${esc(title)}</h1><p>${body}</p><a class="v3-button" href="${href}">${esc(linkText)}</a></section>`;
  };

  const renderTeacher = (teacher, steps, solution = null, fallbackAnchor = '#practice') => {
    if (!teacher) return '';
    const plan = (teacher.plan || []).map((item) => {
      const refs = item.steps?.length ? item.steps.map((number) => {
        const step = steps[number - 1];
        return step ? `<a href="#${esc(step.id)}">${esc(step.title)}</a>` : '';
      }).filter(Boolean).join(', ') : `<a href="${fallbackAnchor}">Практика и вопросы</a>`;
      return `<li><span>${esc(item.title)} — ${refs}</span><time>${Number(item.minutes)} мин</time></li>`;
    }).join('');
    const review = (teacher.review || []).map((item) => `<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`).join('');
    const hints = teacher.hints?.length ? `<h3>Подсказки к этапам</h3><ol>${textList(teacher.hints)}</ol>` : '';
    const solutionBlock = solution?.html && solution?.css ? `<details class="v3-solution"><summary>Эталон проектной работы</summary><div class="v3-solution-body"><h4>HTML</h4><pre><code>${esc(solution.html)}</code></pre><h4>CSS</h4><pre><code>${esc(solution.css)}</code></pre></div></details>` : '';
    return `<details class="v3-teacher" id="teacher"><summary>Для преподавателя <span>План на 120 минут · повторение · подсказки · ответы</span></summary><div class="v3-teacher-body">
      <h3>План занятия</h3><ol class="v3-plan">${plan}</ol>
      <h3>Повторение с ответами</h3><div class="v3-review-list">${review}</div>
      <h3>Как вести объяснение</h3><ul>${textList(teacher.tips || [])}</ul>${hints}
      <h3>Ответы и эталон практики</h3><div class="v3-teacher-answer">${teacher.answers || '<p>Эталон решения собран в блоке практики ниже.</p>'}</div>${solutionBlock}
    </div></details>`;
  };

  const playground = (demo, stepId, examples = []) => {
    if (!demo) return '';
    const samples = examples.length ? examples : [demo];
    return `<div class="playground" data-playground data-step="${esc(stepId)}" data-html="${encoded(demo.html)}" data-css="${encoded(demo.css || '')}" data-examples="${encoded(JSON.stringify(samples))}" data-height="${Number(demo.height) || 260}"></div>`;
  };

  const renderMistake = (mistake) => mistake ? `<aside class="v3-mistake"><strong>Ошибка</strong><p><del><code>${esc(mistake.bad)}</code></del></p><strong>Как правильно</strong><p><code>${esc(mistake.good)}</code></p><p>${esc(mistake.why)}</p></aside>` : '';

  const renderStep = (step, index) => `<section class="v3-step" id="${esc(step.id)}"><div class="v3-step-number">Шаг ${String(index + 1).padStart(2, '0')}</div><h2>${esc(step.title)}</h2><p class="v3-step-focus"><span>Ключевой фокус</span><strong>${esc(step.focus || focusFor(step.title))}</strong></p><div class="v3-step-copy">${step.text}</div>${playground(step.try, step.id, step.examples || [])}${step.code ? `<div class="v3-source-block"><h3>Код шага</h3><pre><code>${esc(step.code.source)}</code></pre></div>` : ''}${step.remember ? `<p class="v3-remember"><strong>Запомни:</strong> ${esc(step.remember)}</p>` : ''}${renderMistake(step.mistake)}</section>`;

  const renderCheatsheet = (data) => {
    const formattedCode = data.lang === 'html'
      ? (window.courseCodeFormat?.html(data.code) ?? data.code)
      : data.lang === 'css'
        ? (window.courseCodeFormat?.css(data.code) ?? data.code)
        : data.code;
    return `<section class="v3-info-section v3-cheatsheet" id="cheatsheet"><h2>Шпаргалка</h2><p>Короткий набор правил, к которому можно вернуться во время практики.</p><pre><code>${esc(formattedCode)}</code></pre><button class="v3-button v3-button-secondary" type="button" data-copy-block="${encoded(formattedCode)}">Копировать шпаргалку</button></section>`;
  };

  const renderPractice = (practice) => {
    const stages = practice.stages.map((stage) => `<li><h3>${esc(stage.title)}</h3><p>${esc(stage.task)}</p><p class="v3-stage-check"><strong>${esc(stage.check)}</strong></p></li>`).join('');
    const hints = (practice.hints || []).map((hint, index) => `<div class="v3-hint-card" data-hint="${index}" hidden><strong>Подсказка ${index + 1}.</strong> ${esc(hint)}</div>`).join('');
    const error = practice.findError ? `<details class="v3-solution"><summary>Найди ошибку в коде</summary><div class="v3-solution-body"><pre><code>${esc(practice.findError.code)}</code></pre>${practice.findError.solution}</div></details>` : '';
    return `<section class="v3-info-section v3-practice" id="practice"><h2>Практика: шаг за шагом</h2><p class="v3-practice-intro">${esc(practice.intro)}</p><ol class="v3-stage-list">${stages}</ol>${error}<div class="v3-hints" data-hint-box>${hints}<button type="button" data-hint-next data-hint-total="${(practice.hints || []).length}" data-solution-target="practice-solution">Показать подсказку 1</button></div>
      <details class="v3-solution" id="practice-solution"><summary>Открыть полный рабочий вариант</summary><div class="v3-solution-body"><h3>HTML</h3><pre><code>${esc(practice.solution.html)}</code></pre><h3>CSS</h3><pre><code>${esc(practice.solution.css)}</code></pre></div></details></section>`;
  };

  const renderProjects = (projects) => `<section class="v3-info-section" id="projects"><h2>Проект на выбор</h2><p>Выбери один вариант. Сначала попробуй собрать его самостоятельно, затем сверь результат с образцом.</p><div class="v3-project-list">${projects.map((project, index) => `<details class="v3-project"><summary><span>Вариант ${String.fromCharCode(65 + index)} · ${esc(project.title)}</span></summary><div class="v3-project-body"><p>${esc(project.about)}</p><h3>Этапы</h3><ol>${textList(project.steps)}</ol><h3>Готово, если</h3><ul>${textList(project.done)}</ul><p><strong>Усложнение:</strong> ${esc(project.stretch)}</p><div class="v3-project-actions"><a class="v3-button" href="${examplePage}?lesson=${id}&amp;project=${index}">Открыть образец</a></div></div></details>`).join('')}</div></section>`;

  const renderCan = (can) => `<section class="v3-info-section" id="can"><h2>Я умею</h2><p>Отметь, что уже получается. Отметки сохраняются на этом устройстве.</p><ul class="v3-can-list">${can.map((item, index) => `<li><input type="checkbox" id="can-${id}-${index}" data-can-check><label for="can-${id}-${index}">${esc(item)}</label></li>`).join('')}</ul><button class="v3-button" type="button" data-mark-complete aria-pressed="false">Отметить урок пройденным</button></section>`;

  const renderLesson = (lesson, item) => {
    const position = item.number;
    const block = map.blocks.find((part) => part.id === item.block);
    const index = map.lessons.findIndex((part) => part.id === id);
    const previous = map.lessons[index - 1];
    const next = map.lessons[index + 1];
    const learn = `<section class="v3-learn" aria-labelledby="learn-title"><h2 id="learn-title">Что узнаешь</h2><ul class="v3-learn-list">${textList(lesson.learn)}</ul></section>`;
    const links = [
      ...lesson.steps.map((step) => ({ href: `#${step.id}`, label: step.title })),
      { href: '#cheatsheet', label: 'Шпаргалка' }, { href: '#practice', label: 'Практика' },
      { href: '#can', label: 'Я умею' }, { href: '#projects', label: 'Проект на выбор' }
    ];
    const contents = `<details class="v3-contents" data-contents><summary>Содержание</summary><nav class="v3-contents-nav" aria-label="Содержание урока">${links.map((link) => `<a href="${link.href}">${esc(link.label)}</a>`).join('')}</nav></details>`;
    const nav = `<nav class="v3-bottom-nav" aria-label="Переход между уроками">${previous ? `<a class="v3-button v3-button-secondary" href="${lessonPage}?lesson=${previous.id}">← ${String(previous.number).padStart(2, '0')}. ${esc(menuName(previous))}</a>` : '<span></span>'}<a class="v3-button v3-button-secondary" href="index.html">К программе курса</a>${next ? `<a class="v3-button" href="${lessonPage}?lesson=${next.id}">${String(next.number).padStart(2, '0')}. ${esc(menuName(next))} →</a>` : '<span></span>'}</nav>`;
    document.title = `${item.title} — Код по полочкам`;
    root.dataset.lessonId = String(id);
    root.innerHTML = `<div class="v3-container" data-lesson-id="${id}"><nav class="v3-breadcrumbs"><a href="index.html">Главная</a><span>/</span><a href="index.html#lessons">${esc(block.title)}</a><span>/</span><span>Урок ${String(position).padStart(2, '0')}</span></nav>
      <header class="v3-hero"><span class="v3-block-label">Блок ${item.block} · ${esc(block.title)}</span><h1>${esc(item.title)}</h1><p class="v3-goal">${esc(item.goal)}</p><div class="v3-chips"><span class="v3-chip">Урок · около ${durationLabel(item.minutes)}</span><span class="v3-chip">${lesson.steps.length} шагов</span></div></header>
      ${learn}${renderTeacher(lesson.teacher, lesson.steps)}<div class="v3-lesson-layout">${contents}<article class="v3-lesson-body">${lesson.steps.map(renderStep).join('')}${renderCheatsheet(lesson.cheatsheet)}${renderPractice(lesson.practice)}${renderCan(lesson.can)}${renderProjects(lesson.projects)}${nav}</article></div></div>`;
    if (window.matchMedia('(min-width: 960px)').matches) root.querySelector('[data-contents]').open = true;
      window.courseCodeFormat?.blocks(root);
    window.initPlaygrounds?.(root);
    window.initLessonProgress?.(root);
    window.initStudentLessonTools?.(root, id);
    initHintSequence(root);
    initCopyButtons(root);
  };

  const renderPracticum = (lesson, item) => {
    const block = map.blocks.find((part) => part.id === item.block);
    const stages = lesson.stages || [];
    const pseudoSteps = stages.map((stage) => ({ id: stage.id || `stage-${stage.number}`, title: stage.title }));
    const previousIndex = map.lessons.findIndex((part) => part.id === id) - 1;
    const nextIndex = previousIndex + 2;
    const previous = map.lessons[previousIndex];
    const next = map.lessons[nextIndex];
    const learn = lesson.learn || [item.goal, 'Разделить проект на последовательные этапы.', 'Проверить результат по критериям и адаптивности.'];
    const links = [...pseudoSteps.map((step) => ({ href: `#${step.id}`, label: step.title })), { href: '#sample', label: 'Образец' }, { href: '#criteria', label: 'Критерии' }, { href: '#can', label: 'Я умею' }, { href: '#projects', label: 'Примеры проектов' }];
    const nav = `<nav class="v3-bottom-nav" aria-label="Переход между уроками">${previous ? `<a class="v3-button v3-button-secondary" href="${lessonPage}?lesson=${previous.id}">← ${esc(menuName(previous))}</a>` : '<span></span>'}<a class="v3-button v3-button-secondary" href="index.html">К программе курса</a>${next ? `<a class="v3-button" href="${lessonPage}?lesson=${next.id}">${esc(menuName(next))} →</a>` : '<span></span>'}</nav>`;
    const stageCards = stages.map((stage, i) => `<section class="v3-step" id="${esc(pseudoSteps[i].id)}"><div class="v3-step-number">Этап ${String(i + 1).padStart(2, '0')}</div><h2>${esc(stage.title)}</h2><p class="v3-step-focus"><span>Ключевой фокус</span><strong>${esc(stage.focus || focusFor(stage.title))}</strong></p><div class="v3-step-copy"><p>${esc(stage.task)}</p>${stage.actions?.length ? `<ol class="v3-stage-actions">${textList(stage.actions)}</ol>` : ''}${stage.outcome ? `<p class="v3-stage-outcome"><strong>Фрагмент результата</strong><code>${esc(stage.outcome)}</code></p>` : ''}<p class="v3-stage-check"><strong>Контрольная точка:</strong> ${esc(stage.check)}</p>${stage.verify ? `<p class="v3-stage-verify"><strong>Как проверить:</strong> ${esc(stage.verify)}</p>` : ''}${stage.hint ? `<p class="v3-stage-hint"><strong>Подсказка:</strong> ${esc(stage.hint)}</p>` : ''}</div>${stage.try ? playground(stage.try, pseudoSteps[i].id, stage.examples || []) : ''}</section>`).join('');
    const starter = lesson.starter?.length ? `<section class="v3-info-section"><h2>Стартовый набор</h2><ul>${textList(lesson.starter)}</ul></section>` : '';
    const sample = lesson.sample ? `<section class="v3-info-section" id="sample"><h2>Образец результата</h2>${playground(lesson.sample, 'sample')}</section>` : '';
    const criteria = `<section class="v3-info-section" id="criteria"><h2>Готово, если</h2><ul>${textList(lesson.criteria || [])}</ul>${lesson.stretch ? `<p><strong>Усложнение:</strong> ${esc(lesson.stretch)}</p>` : ''}</section>`;
    const can = lesson.can ? renderCan(lesson.can) : '';
    const projectSamples = lesson.projects?.length ? renderProjects(lesson.projects) : '';
    document.title = `${item.title} — Код по полочкам`;
      root.innerHTML = `<div class="v3-container" data-lesson-id="${id}"><nav class="v3-breadcrumbs"><a href="index.html">Главная</a><span>/</span><a href="index.html#lessons">${esc(block.title)}</a><span>/</span><span>Практикум</span></nav><header class="v3-hero"><span class="v3-block-label">Блок ${item.block} · ${esc(block.title)}</span><h1>${esc(item.title)}</h1><p class="v3-goal">${esc(lesson.goal || item.goal)}</p><div class="v3-chips"><span class="v3-chip">${item.type === 'project' ? 'Итоговый проект' : 'Практикум'} · около ${durationLabel(item.minutes)}</span><span class="v3-chip">${stages.length} этапов</span></div></header><section class="v3-learn"><h2>Что получится</h2><ul class="v3-learn-list">${textList(learn)}</ul></section>${renderTeacher(lesson.teacher, pseudoSteps, lesson.solution, '#criteria')}<div class="v3-lesson-layout"><details class="v3-contents" data-contents><summary>Содержание</summary><nav class="v3-contents-nav" aria-label="Содержание практикума">${links.map((link) => `<a href="${link.href}">${esc(link.label)}</a>`).join('')}</nav></details><article class="v3-lesson-body">${starter}${stageCards}${sample}${criteria}${can}${projectSamples}${nav}</article></div></div>`;
    if (window.matchMedia('(min-width: 960px)').matches) root.querySelector('[data-contents]').open = true;
      window.courseCodeFormat?.blocks(root);
    window.initPlaygrounds?.(root);
    window.initLessonProgress?.(root);
    window.initStudentLessonTools?.(root, id);
  };

  function initHintSequence(scope) {
    const button = scope.querySelector('[data-hint-next]');
    if (!button) return;
    const hints = [...scope.querySelectorAll('[data-hint]')];
    let next = 0;
    button.addEventListener('click', () => {
      if (next < hints.length) {
        hints[next].hidden = false;
        hints[next].focus?.();
        next += 1;
        button.textContent = next < hints.length ? `Показать подсказку ${next + 1}` : 'Показать полный вариант';
        return;
      }
      const solution = scope.querySelector(`#${button.dataset.solutionTarget}`);
      if (solution) {
        solution.open = true;
        solution.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      button.disabled = true;
      button.textContent = 'Вариант открыт ниже';
    });
  }

  function initCopyButtons(scope) {
    scope.querySelectorAll('[data-copy-block]').forEach((button) => button.addEventListener('click', async () => {
      const status = document.createElement('span');
      status.className = 'v3-copy-status';
      status.setAttribute('aria-live', 'polite');
      let copied = false;
      const value = decodeURIComponent(button.dataset.copyBlock || '');
      try {
        if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(value); copied = true; }
      } catch { /* file:// may disable clipboard permissions */ }
      if (!copied) {
        const field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.append(field);
        field.select();
        try { copied = document.execCommand('copy'); } catch { copied = false; }
        field.remove();
      }
      status.textContent = copied ? 'Шпаргалка скопирована.' : 'Копирование недоступно. Выдели код в шпаргалке вручную.';
      button.after(status);
      window.setTimeout(() => status.remove(), 3000);
    }));
  }

  if (!root) return;
  if (!id) {
    showMessage('Укажи номер урока', 'В адресе страницы выбери параметр lesson, например lesson-view.html?lesson=23.');
    return;
  }
  if (map?.redirects?.[id]) {
    const redirect = map.redirects[id];
    const hash = redirect.hash ? `#${redirect.hash}` : '';
    const target = linkForLesson(redirect.lesson) + hash;
    window.location.replace(target);
    return;
  }
  const item = lessonMap.get(id);
  if (!item) {
    showMessage('Урок не найден', 'Вернись к программе и выбери урок из списка.');
    return;
  }
  window.courseProgress?.setLastOpened(id);
  if (typeof window.LESSONS === 'undefined') window.LESSONS = {};
  const renderLoaded = () => {
    const lesson = window.LESSONS[id];
    if (!lesson) {
      showMessage('Не получилось открыть урок', 'Файл урока не содержит ожидаемых данных. Вернись к программе и выбери другой урок.');
      return;
    }
    if (item.type === 'lesson') renderLesson(lesson, item);
    else renderPracticum(lesson, item);
  };
  const script = document.createElement('script');
  script.src = `assets/lessons/lesson-${id}.js`;
  script.onload = renderLoaded;
  script.onerror = () => {
    showMessage('Файл урока не найден', 'Вернись к программе и выбери урок из списка. Если файл курса переместили, восстанови папку assets/lessons целиком.');
  };
  document.head.append(script);
})();
