(() => {
  const root = document.querySelector('#example-root');
  const query = new URLSearchParams(window.location.search);
  const lessonId = Number(query.get('lesson'));
  const projectIndex = Number(query.get('project')) || 0;
  const lessonPage = '../lesson-view.html';
  const examplePage = 'view.html';

  const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const numberedCode = (value) => value.split('\n').map((line, index) => `<span class="v3-code-line"><i aria-hidden="true">${index + 1}</i><span>${esc(line) || ' '}</span></span>`).join('');
  const srcdoc = (html, css) => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css.replace(/<\/style/gi, '<\\/style')}</style></head><body>${html}</body></html>`;
  const copy = async (text) => {
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
    } catch { /* clipboard permission can be unavailable on file:// */ }
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    field.remove();
    return copied;
  };

  const showMessage = (title, message) => {
    document.title = `${title} — Код по полочкам`;
    root.innerHTML = `<section class="v3-message"><p class="v3-block-label">ОБРАЗЕЦ ПРОЕКТА</p><h1>${esc(title)}</h1><p>${message}</p><a class="v3-button" href="../lesson-view.html?lesson=${lessonId}#projects">Вернуться к проектам</a></section>`;
  };

  const render = (lesson) => {
    const project = lesson.projects?.[projectIndex];
    if (!project?.example) {
    showMessage('Образец не найден', 'Вернись к проекту и выбери один из готовых образцов.');
      return;
    }
    const sample = project.example;
    const formatter = window.courseCodeFormat;
    const htmlCode = formatter?.html(sample.html) ?? sample.html;
    const cssCode = formatter?.css(sample.css) ?? sample.css;
    const projects = lesson.projects;
    const previous = projectIndex > 0
      ? `<a class="v3-sample-switch" href="${examplePage}?lesson=${lessonId}&amp;project=${projectIndex - 1}"><span>← Предыдущий образец</span><strong>${esc(projects[projectIndex - 1].title)}</strong></a>`
      : `<a class="v3-sample-switch" href="${lessonPage}?lesson=${lessonId}#projects"><span>← Назад к уроку</span><strong>Выбрать проект</strong></a>`;
    const next = projectIndex < projects.length - 1
      ? `<a class="v3-sample-switch v3-sample-next" href="${examplePage}?lesson=${lessonId}&amp;project=${projectIndex + 1}"><span>Следующий образец →</span><strong>${esc(projects[projectIndex + 1].title)}</strong></a>`
      : `<a class="v3-sample-switch v3-sample-next" href="${lessonPage}?lesson=${lessonId}#projects"><span>К заданиям →</span><strong>Выбрать проект</strong></a>`;
    document.title = `${sample.title} — урок ${lessonId} | Код по полочкам`;
    root.innerHTML = `<div class="v3-container"><nav class="v3-breadcrumbs"><a href="../index.html">Главная</a><span>/</span><a href="${lessonPage}?lesson=${lessonId}#projects">Урок ${String(window.COURSE.lessons.find((item) => item.id === lessonId).number).padStart(2, '0')}</a><span>/</span><span>${esc(sample.title)}</span></nav>
      <header class="v3-hero v3-sample-hero"><span class="v3-block-label">УРОК ${String(window.COURSE.lessons.find((item) => item.id === lessonId).number).padStart(2, '0')} · ОБРАЗЕЦ ПРОЕКТА ${String.fromCharCode(65 + projectIndex)}</span><h1>${esc(sample.title)}</h1><p class="v3-goal">${esc(sample.description)}</p><aside class="v3-sample-note"><strong>Один из вариантов решения</strong><span>Сначала предложи ученику выполнить проект самостоятельно. Затем можно сравнить структуру, содержимое и оформление с этим образцом.</span></aside></header>
      <section class="v3-sample-panel"><div class="v3-sample-panel-head"><div><h2>Как выглядит страница</h2><p>Предпросмотр работает локально и не запускает JavaScript внутри примера.</p></div><div class="v3-sample-actions"><button class="v3-button v3-button-secondary" type="button" data-fullscreen>Во весь экран</button><button class="v3-button" type="button" data-open>Открыть отдельно</button></div></div><div class="v3-sample-frame-wrap" id="sample-stage"><iframe class="v3-sample-frame" title="Предпросмотр: ${esc(sample.title)}" sandbox="allow-same-origin" data-sample-frame></iframe></div><p class="v3-sample-status" aria-live="polite" data-status></p></section>
      <nav class="v3-sample-switcher" aria-label="Переключение образцов">${previous}<span class="v3-sample-count">${String(projectIndex + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}</span>${next}</nav>
      <details class="v3-code-panel" open><summary>Полный код образца</summary><div class="v3-code-tabs" role="tablist" aria-label="Выбор кода"><button role="tab" type="button" aria-selected="true" id="sample-html-tab" aria-controls="sample-html-panel" data-code-tab="html">HTML</button><button role="tab" type="button" aria-selected="false" id="sample-css-tab" aria-controls="sample-css-panel" data-code-tab="css">CSS</button></div><section id="sample-html-panel" role="tabpanel" aria-labelledby="sample-html-tab" data-code-panel="html"><header><h2>HTML · index.html</h2><button class="v3-button v3-button-secondary" type="button" data-copy="html">Копировать HTML</button></header><pre class="v3-code-source" tabindex="0"><code data-html-source>${numberedCode(htmlCode)}</code></pre></section><section id="sample-css-panel" role="tabpanel" aria-labelledby="sample-css-tab" data-code-panel="css" hidden><header><h2>CSS · style.css</h2><button class="v3-button v3-button-secondary" type="button" data-copy="css">Копировать CSS</button></header><pre class="v3-code-source" tabindex="0"><code data-css-source>${numberedCode(cssCode)}</code></pre></section><p class="v3-sample-status" aria-live="polite" data-copy-status></p></details>
      <div class="v3-bottom-nav"><a class="v3-button v3-button-secondary" href="${lessonPage}?lesson=${lessonId}#projects">← К заданию</a><a class="v3-button v3-button-secondary" href="../index.html#lessons">К программе курса</a></div></div>`;

    const frame = root.querySelector('[data-sample-frame]');
    const stage = root.querySelector('#sample-stage');
    const html = htmlCode;
    const css = cssCode;
    const preview = srcdoc(html, css);
    frame.srcdoc = preview;
    const fullscreenButton = root.querySelector('[data-fullscreen]');
    fullscreenButton.setAttribute('aria-pressed', 'false');
    fullscreenButton.addEventListener('click', async () => {
      const status = root.querySelector('[data-status]');
      try {
        if (document.fullscreenElement === stage) await document.exitFullscreen();
        else await stage.requestFullscreen();
      } catch { status.textContent = 'Во весь экран перейти не удалось. Можно открыть отдельную вкладку.'; }
    });
    document.addEventListener('fullscreenchange', () => {
      const expanded = document.fullscreenElement === stage;
      fullscreenButton.textContent = expanded ? 'Свернуть' : 'Во весь экран';
      fullscreenButton.setAttribute('aria-pressed', String(expanded));
    });
    root.querySelector('[data-open]').addEventListener('click', () => {
      const tab = window.open(URL.createObjectURL(new Blob([preview], { type: 'text/html;charset=utf-8' })), '_blank');
      if (tab) { tab.opener = null; root.querySelector('[data-status]').textContent = 'Пример открыт в отдельной вкладке.'; }
      else root.querySelector('[data-status]').textContent = 'Браузер заблокировал новую вкладку. Разреши её или используй полный экран.';
    });
    const tabs = [...root.querySelectorAll('[data-code-tab]')];
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      const selected = tab.dataset.codeTab;
      tabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
      root.querySelectorAll('[data-code-panel]').forEach((panel) => { panel.hidden = panel.dataset.codePanel !== selected; });
    }));
    root.querySelectorAll('[data-copy]').forEach((button) => button.addEventListener('click', async () => {
      const text = button.dataset.copy === 'html' ? html : css;
      const status = root.querySelector('[data-copy-status]');
      const copied = await copy(text);
      status.textContent = copied ? `${button.dataset.copy.toUpperCase()} скопирован.` : 'Копирование недоступно; можно выделить текст в коде.';
    }));
  };

  const redirect = window.COURSE?.redirects?.[lessonId];
  if (redirect) {
    window.location.replace(`../lesson-view.html?lesson=${redirect.lesson}${redirect.hash ? `#${redirect.hash}` : ''}`);
    return;
  }
  const script = document.createElement('script');
  script.src = `../assets/lessons/lesson-${lessonId}.js`;
  script.onload = () => {
    const lesson = window.LESSONS?.[lessonId];
    if (lesson) render(lesson);
    else showMessage('Образец не найден', 'Для этого урока образцы ещё не перенесены в новый формат.');
  };
  script.onerror = () => showMessage('Файл образца не найден', 'Вернись к уроку и выбери другой пример.');
  document.head.append(script);
})();
