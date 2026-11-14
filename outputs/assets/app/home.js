(() => {
  const root = document.querySelector('[data-course-root]');
  const search = document.querySelector('[data-home-search]');
  if (!root || !window.COURSE) return;
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const durationLabel = (value) => { const minutes = Number(value) || 120; if (minutes % 60) return `${minutes} минут`; const hours = minutes / 60; const suffix = hours % 10 === 1 && hours % 100 !== 11 ? 'час' : hours % 10 >= 2 && hours % 10 <= 4 && (hours % 100 < 12 || hours % 100 > 14) ? 'часа' : 'часов'; return `${hours} ${suffix}`; };
  const typeNames = { lesson: 'Урок', practicum: 'Практикум', project: 'Проект' };
  const lessons = window.COURSE.lessons;
  const blocks = window.COURSE.blocks;
  document.querySelector('[data-course-lessons]')?.replaceChildren(String(lessons.length));
  document.querySelector('[data-course-blocks]')?.replaceChildren(String(blocks.length));
  root.innerHTML = blocks.map((block, blockIndex) => {
    const list = lessons.filter((item) => item.block === block.id);
    return `<section class="home-block" aria-labelledby="block-${block.id}"><header class="home-block-heading"><span class="home-block-number">${String(blockIndex + 1).padStart(2, '0')}</span><div><h3 id="block-${block.id}">${esc(block.title)}</h3><p>${esc(block.goal)}</p></div></header><div class="home-cards">${list.map((item) => `<a class="home-card" data-home-card data-lesson-id="${item.id}" data-type="${item.type}" href="lesson-view.html?lesson=${item.id}"><div class="home-card-top"><span class="home-card-number">УРОК ${String(item.number).padStart(2, '0')}</span><span class="home-card-type">${typeNames[item.type] || 'Урок'}</span></div><h4>${esc(item.title)}</h4><p>${esc(item.goal)}</p><div class="home-card-topics" aria-label="Ключевые теги и свойства"><span class="home-card-topics-label">Разберём</span><span class="home-card-topic-list">${(item.topics || []).map((topic) => `<code>${esc(topic)}</code>`).join('')}</span></div><div class="home-card-bottom"><span>≈ ${durationLabel(item.minutes)}</span><span class="home-card-status todo" data-card-status>Не начат</span></div></a>`).join('')}</div></section>`;
  }).join('');

  const cards = [...root.querySelectorAll('[data-home-card]')];
  const bar = document.querySelector('[data-progress-bar]');
  const count = document.querySelector('[data-progress-count]');
  const copy = document.querySelector('[data-progress-copy]');
  const continueLink = document.querySelector('[data-continue-link]');
  const empty = document.querySelector('[data-home-empty]');

  const updateProgress = () => {
    const done = cards.filter((card) => window.courseProgress?.isComplete(Number(card.dataset.lessonId))).length;
    const total = cards.length;
    const percent = total ? (done / total) * 100 : 0;
    if (bar) { bar.style.width = `${percent}%`; bar.parentElement?.setAttribute('aria-valuenow', String(Math.round(percent))); }
    if (count) count.textContent = `${done} из ${total} уроков пройдено`;
    const firstTodo = cards.find((card) => !window.courseProgress?.isComplete(Number(card.dataset.lessonId)));
    const next = firstTodo || cards[0];
    let last = '';
    try { last = window.localStorage.getItem('course-v3-last-opened') || ''; } catch { /* progress is optional */ }
    const lastCard = cards.find((card) => card.dataset.lessonId === last && !window.courseProgress?.isComplete(Number(last)));
    const target = lastCard || next;
    if (target && continueLink) {
      continueLink.href = target.href;
      continueLink.innerHTML = done === total && total > 0 ? 'Повторить первый урок <span aria-hidden="true">→</span>' : `Урок ${String(window.COURSE.lessons.find((item) => item.id === Number(target.dataset.lessonId)).number).padStart(2, '0')} · продолжить <span aria-hidden="true">→</span>`;
    }
    if (copy) copy.textContent = done === 0 ? 'Выбери урок, чтобы начать. Отметки о прохождении хранятся в этом браузере.' : `${target ? 'Продолжай с подходящего урока.' : 'Курс пройден.'} Отметки сохраняются в этом браузере.`;
    cards.forEach((card) => {
      const status = card.querySelector('[data-card-status]');
      const complete = window.courseProgress?.isComplete(Number(card.dataset.lessonId));
      status.textContent = complete ? 'Пройден' : 'Не начат';
      status.classList.toggle('todo', !complete);
    });
  };

  search?.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase('ru');
    let visible = 0;
    cards.forEach((card) => { card.hidden = !card.textContent.toLocaleLowerCase('ru').includes(query); if (!card.hidden) visible += 1; });
    root.querySelectorAll('.home-block').forEach((block) => { block.hidden = !block.querySelector('[data-home-card]:not([hidden])'); });
    if (empty) empty.hidden = visible > 0;
  });

  const dialog = document.querySelector('[data-quick-search]');
  const quickInput = dialog?.querySelector('[data-quick-search-input]');
  const quickResults = dialog?.querySelector('[data-quick-search-results]');
  const quickHint = dialog?.querySelector('[data-quick-search-hint]');
  const lessonLoads = new Map();
  const openQuickSearch = () => {
    if (!dialog || dialog.open) return;
    dialog.showModal();
    quickInput.value = '';
    renderQuickResults();
    quickInput.focus();
    if (quickHint) quickHint.textContent = 'Загружаю шаги уроков для поиска…';
    void loadStepIndex().then(() => {
      if (dialog.open) { renderQuickResults(); quickHint.textContent = 'Поиск охватывает уроки, шаги и справочник.'; }
    });
  };
  const loadStepIndex = async () => {
    window.LESSONS = window.LESSONS || {};
    await Promise.all(lessons.map((item) => {
      if (window.LESSONS[item.id]) return Promise.resolve();
      if (lessonLoads.has(item.id)) return lessonLoads.get(item.id);
      const pending = new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = `assets/lessons/lesson-${item.id}.js`;
        script.onload = () => { script.remove(); resolve(); };
        script.onerror = () => { script.remove(); resolve(); };
        document.head.append(script);
      });
      lessonLoads.set(item.id, pending);
      return pending;
    }));
  };
  const renderQuickResults = () => {
    if (!quickResults) return;
    const query = (quickInput?.value || '').trim().toLocaleLowerCase('ru');
    const entries = [];
    for (const item of lessons) {
      const lessonHref = `lesson-view.html?lesson=${item.id}`;
      entries.push({ type: typeNames[item.type] || 'Урок', title: item.title, detail: item.goal, href: lessonHref, text: `${item.title} ${item.goal} ${(item.topics || []).join(' ')}` });
      for (const topic of item.topics || []) entries.push({ type: 'Тема урока', title: topic, detail: item.title, href: lessonHref, text: `${topic} ${item.title}` });
      for (const step of window.LESSONS?.[item.id]?.steps || []) entries.push({ type: 'Шаг', title: step.title, detail: item.title, href: `${lessonHref}#${encodeURIComponent(step.id)}`, text: `${step.title} ${step.text || ''} ${step.remember || ''}` });
    }
    for (const record of window.COURSE_REFERENCE || []) {
      const ref = record.refs?.[0];
      entries.push({ type: 'Справочник', title: record.name, detail: record.description, href: ref ? `lesson-view.html?lesson=${ref.id}#${encodeURIComponent(ref.step || '')}` : `reference.html?search=${encodeURIComponent(record.name)}`, text: `${record.name} ${record.description} ${(record.examples || []).join(' ')}` });
    }
    const matches = entries.filter((entry) => !query || entry.text.toLocaleLowerCase('ru').includes(query)).slice(0, 12);
    quickResults.innerHTML = matches.map((entry) => `<li><a href="${esc(entry.href)}" role="option"><span>${esc(entry.type)}</span><strong>${esc(entry.title)}</strong><small>${esc(entry.detail)}</small></a></li>`).join('');
    if (quickHint && quickInput?.value.trim()) quickHint.textContent = matches.length ? `Найдено ${matches.length}${matches.length === 12 ? ' или больше' : ''}.` : 'Ничего не найдено. Попробуй другое название или свойство.';
  };
  dialog?.querySelector('[data-close-quick-search]')?.addEventListener('click', () => dialog.close());
  document.querySelector('[data-open-quick-search]')?.addEventListener('click', openQuickSearch);
  quickInput?.addEventListener('input', renderQuickResults);
  quickInput?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); quickResults?.querySelector('a')?.focus(); }
    if (event.key === 'Enter') { const first = quickResults?.querySelector('a'); if (first) { event.preventDefault(); first.click(); } }
  });
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openQuickSearch();
    }
  });
  const shelfCard = document.querySelector('.home-progress-card');
  if (shelfCard && !matchMedia('(prefers-reduced-motion: reduce)').matches) shelfCard.addEventListener('pointermove', (event) => {
    const bounds = shelfCard.getBoundingClientRect();
    const x = Math.round((event.clientX - bounds.left - bounds.width / 2) / bounds.width * 4);
    const y = Math.round((event.clientY - bounds.top - bounds.height / 2) / bounds.height * 4);
    shelfCard.style.setProperty('--shelf-x', `${x}px`);
    shelfCard.style.setProperty('--shelf-y', `${y}px`);
  });
  shelfCard?.addEventListener('pointerleave', () => { shelfCard.style.setProperty('--shelf-x', '0px'); shelfCard.style.setProperty('--shelf-y', '0px'); });
  updateProgress();
  window.addEventListener('course-progress-updated', updateProgress);
})();
