(() => {
  const table = document.querySelector('#check-results tbody');
  const summary = document.querySelector('#check-summary');
  const course = window.COURSE;
  const only = Number(new URLSearchParams(window.location.search).get('only')) || 0;
  const errors = new Map();
  const loaded = new Map();
  const stopWords = new Set('это этот эта эти для или что как где когда зачем при без между после перед если чтобы внутри через тогда также всего один одна одно все свои свой которая который которое можно нужно очень'.split(' '));
  const allowedMarkup = new Set('p strong em b i code pre a ul ol li br span'.split(' '));
  const boilerplate = [
    /^сначала найди в примере часть, о которой говорит/i,
    /^проверь [^.!?]{0,80} на реальном содержимом/i,
    /^если результат отличается от ожидания, сравни структуру html/i,
    /^проверь, можешь ли ты объяснить правило без чтения кода/i,
    /^для [^.!?]{0,60} полезно сравнить два варианта рядом/i,
    /^сохрани рабочее состояние, прежде чем экспериментировать/i,
    /^проверяй закрывающие теги и вложенность/i,
    /^проверяй документ в браузере после каждого небольшого изменения/i,
    /^на этом шаге применим [^.!?]{0,70} в законченном интерфейсе/i
  ];
  const add = (id, message) => { if (!errors.has(id)) errors.set(id, []); errors.get(id).push(message); };
  const clean = (value = '') => String(value).replace(/<[^>]*>/g, ' ').replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, ' ').replace(/\s+/g, ' ').trim();
  const normalize = (value = '') => clean(value).toLocaleLowerCase('ru').replace(/ё/g, 'е').replace(/[«»“”"„]/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const plainWords = (value = '') => clean(value).split(/\s+/).filter(Boolean);
  const sourceSnippets = (lesson) => {
    const snippets = [];
    (lesson.steps || []).forEach((s) => { if (s.try) snippets.push({ value: s.try, base: 'lesson-view.html' }); (s.examples || []).forEach((value) => snippets.push({ value, base: 'lesson-view.html' })); });
    (lesson.stages || []).forEach((s) => { if (s.try) snippets.push({ value: s.try, base: 'lesson-view.html' }); (s.examples || []).forEach((value) => snippets.push({ value, base: 'lesson-view.html' })); });
    if (lesson.practice?.solution) snippets.push({ value: lesson.practice.solution, base: 'lesson-view.html' });
    if (lesson.sample) snippets.push({ value: lesson.sample, base: 'lesson-view.html' });
    (lesson.projects || []).forEach((p) => { if (p.example) snippets.push({ value: p.example, base: 'examples/view.html' }); });
    return snippets;
  };
  const imageErrors = (lesson) => {
    const paths = new Set();
    sourceSnippets(lesson).forEach(({ value: snippet, base }) => {
      const holder = document.createElement('template'); holder.innerHTML = snippet.html || '';
      const baseHref = holder.content.querySelector('base[href]')?.getAttribute('href') || '';
      const resolvedBase = new URL(baseHref, new URL(base, window.location.href)).href;
      holder.content.querySelectorAll('img[src], [poster]').forEach((el) => {
        const src = el.getAttribute(el.tagName === 'IMG' ? 'src' : 'poster');
        if (src && !/^(?:https?:|data:|blob:|\/\/)/i.test(src)) paths.add(`${resolvedBase}\u0000${src}`);
      });
    });
    return Promise.all([...paths].map((entry) => new Promise((resolve) => {
      const [base, src] = entry.split('\u0000');
      const image = new Image(); const timer = window.setTimeout(() => resolve(`изображение не загрузилось: ${src}`), 4000);
      image.onload = () => { window.clearTimeout(timer); resolve(''); };
      image.onerror = () => { window.clearTimeout(timer); resolve(`нет изображения: ${src}`); };
      image.src = new URL(src, base).href;
    }))).then((list) => list.filter(Boolean));
  };
  const termMatch = (term, blob) => {
    const key = term.toLocaleLowerCase('ru').replace(/ё/g, 'е');
    const prefix = key.slice(0, Math.min(key.length, 5));
    return blob.some((word) => word.startsWith(prefix) || prefix.startsWith(word.slice(0, Math.min(word.length, 5))));
  };
  const textMatchesTitle = (step) => {
    const snippets = [step.text, step.try?.html, step.try?.css, ...(step.examples || []).flatMap((x) => [x.html, x.css])].filter(Boolean).join(' ');
    const blob = clean(snippets).toLocaleLowerCase('ru').replace(/ё/g, 'е').split(/[^a-zа-я0-9-]+/).filter(Boolean);
    const terms = clean(step.title).toLocaleLowerCase('ru').split(/[^a-zа-я0-9-]+/).filter((word) => word.length > 3 && !stopWords.has(word));
    if (!terms.length) return true;
    return terms.filter((term) => termMatch(term, blob)).length / terms.length >= .4;
  };
  const checkRawTags = (id, label, text, field) => {
    const pattern = /<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi;
    for (const match of String(text || '').matchAll(pattern)) {
      if (!allowedMarkup.has(match[1].toLowerCase())) add(id, `${label}: неэкранированный тег <${match[1]}> в поле ${field}`);
    }
  };
  const canonicalParagraph = (value) => normalize(String(value).replace(/«[^»]*»|“[^”]*”|"[^"]*"|„[^“]*“/g, ' X ')).replace(/\s+/g, ' ').trim();
  const paragraphOwners = new Map();
  const courseSignatureOwners = new Map();
  const proseWarnings = /в файле|в обеих версиях|qwerty|CSS-файл/i;
  const checkProse = (id, label, value, field) => {
    const text = String(value || '');
    if (proseWarnings.test(text)) add(id, `${label}: упоминание невидимого файла или версии в поле ${field}`);
    if (field === 'text') checkRawTags(id, label, text, field);
  };
  const checkLesson = (item, lesson) => {
    const id = item.id, label = `Урок ${item.number} «${item.title}»`, teacher = lesson.teacher || {};
    if (!Array.isArray(item.topics) || item.topics.length < 3 || item.topics.length > 8) add(id, 'карточка должна показывать 3–8 тем или свойств');
    if (!Array.isArray(lesson.learn) || lesson.learn.length !== 3) add(id, 'learn должен содержать ровно 3 пункта');
    if (!Array.isArray(lesson.can) || lesson.can.length < 3 || lesson.can.length > 5) add(id, 'can должен содержать 3–5 действий');
    const planMinutes = (teacher.plan || []).reduce((sum, part) => sum + Number(part.minutes || 0), 0);
    if (!teacher.plan?.length || planMinutes !== 120) add(id, `план преподавателя должен занимать 120 минут (сейчас ${planMinutes})`);
    if (teacher.review?.length !== 4) add(id, 'teacher.review должен содержать 4 вопроса с ответами');
    if (teacher.tips?.length < 3 || teacher.tips?.length > 4) add(id, 'teacher.tips должен содержать 3–4 подсказки');
    if (!teacher.answers || !/<pre><code>/.test(teacher.answers)) add(id, 'нет реального HTML/CSS ориентира в ответе преподавателя');
    if (item.type === 'lesson') {
      const steps = lesson.steps || [];
      if (steps.length < 5 || steps.length > 9) add(id, 'steps должен содержать 5–9 шагов');
      const seenIds = new Set(), seenRemember = new Set();
      steps.forEach((step, index) => {
        const where = `${label}, шаг ${index + 1} «${step.title}»`;
        if (!/^[a-z][a-z0-9-]*$/.test(step.id || '') || seenIds.has(step.id)) add(id, `${where}: step.id отсутствует, повторяется или не является slug`);
        seenIds.add(step.id);
        if (/^[a-z]+(?:-[a-z]+)*$/.test(step.title || '')) add(id, `${where}: заголовок состоит только из латиницы и дефисов`);
        if (!step.text || !step.try?.html) add(id, `${where}: не хватает объяснения или HTML-примера`);
        const wordCount = plainWords(step.text || '').length;
        if (id !== 23 && (wordCount < 80 || wordCount > 150)) add(id, `${where}: объяснение содержит ${wordCount} слов (ожидается 80–150)`);
        if ((step.text?.match(/<p\b/gi) || []).length < 2 || (step.text?.match(/<p\b/gi) || []).length > 4) add(id, `${where}: текст должен быть разбит на 2–4 абзаца`);
        if (id !== 23 && !textMatchesTitle(step)) add(id, `${where}: объяснение и код не соответствуют заголовку`);
        if (!step.remember) add(id, `${where}: отсутствует правило для запоминания`);
        else { const key = normalize(step.remember); if (seenRemember.has(key)) add(id, `${where}: повторяется remember в этом уроке`); seenRemember.add(key); }
        if (!step.mistake?.bad || !step.mistake?.good || !step.mistake?.why) add(id, `${where}: нужна ошибка новичка, исправление и причина`);
        if ((step.examples || []).length !== 2) add(id, `${where}: должно быть два переключаемых примера`);
        const holder = document.createElement('template'); holder.innerHTML = step.text || '';
        [...holder.content.querySelectorAll('p')].forEach((paragraph) => {
          const phrase = paragraph.textContent || '', canonical = canonicalParagraph(phrase);
          if (boilerplate.some((pattern) => pattern.test(phrase.trim()))) add(id, `${where}: шаблонная фраза в объяснении`);
          if (canonical.length > 45) { if (!paragraphOwners.has(canonical)) paragraphOwners.set(canonical, new Set()); paragraphOwners.get(canonical).add(id); }
        });
        checkProse(id, where, step.text, 'text'); checkProse(id, where, step.remember, 'remember'); checkProse(id, where, step.mistake?.why, 'mistake.why');
      });
      if (!Array.isArray(lesson.practice?.stages) || lesson.practice.stages.length !== 4) add(id, 'практика должна содержать 4 тематических этапа');
      (lesson.practice?.stages || []).forEach((stage, index) => { if (!stage.task || !stage.check) add(id, `этап практики ${index + 1}: нет задания или контрольной точки`); });
      if (!lesson.practice?.solution?.html || !lesson.practice?.solution?.css) add(id, 'у практики нет полного HTML/CSS ответа');
    } else {
      if (!lesson.stages?.length || !lesson.solution?.html || !lesson.solution?.css) add(id, 'практикуму нужен план этапов и полный образец HTML/CSS');
      (lesson.stages || []).forEach((stage, index) => {
        if (!stage.task || !stage.check) add(id, `этап ${index + 1}: нет задания или контрольной точки`);
        if ([16, 18, 19].includes(id)) {
          if (stage.actions?.length < 3 || stage.actions?.length > 5) add(id, `этап ${index + 1}: нужно 3–5 конкретных действий`);
          for (const field of ['outcome', 'verify', 'hint']) if (!stage[field]) add(id, `этап ${index + 1}: нет поля ${field}`);
        }
        checkProse(id, label, stage.task, 'stage.task'); checkProse(id, label, stage.check, 'stage.check');
      });
    }
    if (lesson.projects?.length !== 2 || lesson.projects.some((p) => !p.example?.html || !p.example?.css)) add(id, 'нужно два проектных образца с HTML и CSS');
    (lesson.practice?.stages || []).forEach((s) => { checkProse(id, label, s.task, 'practice.task'); checkProse(id, label, s.check, 'practice.check'); });
    (lesson.projects || []).forEach((p) => { [...(p.steps || []), ...(p.done || []), p.stretch].filter(Boolean).forEach((x) => checkProse(id, label, x, 'project')); });
    if (/(?:в архиве|из архива|архив курса|исходник курса|исходный код курса)/i.test(JSON.stringify({ steps: lesson.steps, practice: lesson.practice, projects: lesson.projects, stages: lesson.stages }))) add(id, 'ученический текст упоминает архив или исходный код курса');
    const signatures = { review: teacher.review, tips: teacher.tips, practice: lesson.practice?.stages };
    Object.entries(signatures).forEach(([kind, value]) => {
      if (!value?.length) return;
      const key = `${kind}:${JSON.stringify(value)}`;
      if (courseSignatureOwners.has(key)) { add(id, `${kind} полностью повторяется в уроке ${courseSignatureOwners.get(key)}`); add(courseSignatureOwners.get(key), `${kind} полностью повторяется в уроке ${id}`); }
      else courseSignatureOwners.set(key, id);
    });
  };
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const loadLesson = (item) => new Promise((resolve) => {
    const script = document.createElement('script'); script.src = `assets/lessons/lesson-${item.id}.js`;
    script.onload = () => { const lesson = window.LESSONS?.[item.id]; if (lesson) loaded.set(item.id, lesson); else add(item.id, 'файл загружен, но window.LESSONS[id] отсутствует'); script.remove(); resolve(); };
    script.onerror = () => { add(item.id, 'файл урока не загрузился'); script.remove(); resolve(); };
    document.head.append(script);
  });
  const existsAnchor = (lesson, id) => Boolean(lesson?.steps?.some((step) => step.id === id) || lesson?.stages?.some((stage) => stage.id === id));
  const renderRow = (item) => {
    const issues = errors.get(item.id) || [], row = document.createElement('tr');
    row.className = issues.length ? 'check-fail' : 'check-pass';
    row.innerHTML = `<th scope="row">${String(item.number).padStart(2, '0')} · ${esc(item.title)}</th><td>${issues.length ? 'Ошибки' : 'Готово'}</td><td>${issues.length ? issues.map(esc).join(' · ') : 'Структура, содержание, ссылки, практика и локальные медиа проверены.'}</td>`;
    table.append(row);
  };
  const run = async () => {
    if (!course?.lessons?.length) { summary.textContent = 'Не удалось загрузить карту курса.'; summary.dataset.state = 'fail'; return; }
    summary.textContent = `Загружаю ${course.lessons.length} уроков и проверяю текст, код, ссылки и медиа…`;
    for (const item of course.lessons) await loadLesson(item);
    for (const item of course.lessons) { const lesson = loaded.get(item.id); if (lesson) checkLesson(item, lesson); }
    paragraphOwners.forEach((owners, phrase) => {
      if (owners.size < 2) return;
      owners.forEach((id) => add(id, 'абзац в объяснениях повторяется между уроками'));
    });
    Object.entries(course.redirects || {}).forEach(([oldId, route]) => {
      if (!existsAnchor(loaded.get(route.lesson), route.hash)) add(route.lesson, `редирект ${oldId} ведёт к отсутствующему якорю #${route.hash}`);
    });
    (window.COURSE_REFERENCE || []).forEach((record) => (record.refs || []).forEach((ref) => {
      if (ref.step && !existsAnchor(loaded.get(ref.id), ref.step)) add(ref.id, `справочник ссылается на отсутствующий шаг #${ref.step}`);
    }));
    for (const item of course.lessons) { const lesson = loaded.get(item.id); if (lesson) (await imageErrors(lesson)).forEach((problem) => add(item.id, problem)); }
    const shown = only ? course.lessons.filter((item) => item.id === only) : course.lessons;
    table.replaceChildren(); shown.forEach(renderRow);
    const failing = shown.filter((item) => (errors.get(item.id) || []).length).length;
    const globalOnly = (only ? (errors.get(only) || []).length : [...errors.values()].reduce((sum, list) => sum + list.length, 0));
    summary.textContent = only ? `Проверен урок ${only}. В нём ${globalOnly} ошибок; ссылки и повторы также сверены по всему курсу.` : `Итог: ${shown.length} уроков проверено, ${failing} с ошибками, ${[...errors.values()].reduce((sum, list) => sum + list.length, 0)} замечаний.`;
    summary.dataset.state = errors.size ? 'fail' : 'pass';
  };
  run().catch((error) => { summary.textContent = `Проверка прервана: ${error.message}`; summary.dataset.state = 'fail'; });
})();
