(() => {
  const root = document.querySelector('[data-course-root]');
  const search = document.querySelector('[data-home-search]');
  if (!root || !window.COURSE) return;
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const durationLabel = (value) => { const minutes = Number(value) || 120; if (minutes % 60) return `${minutes} минут`; const hours = minutes / 60; const suffix = hours % 10 === 1 && hours % 100 !== 11 ? 'час' : hours % 10 >= 2 && hours % 10 <= 4 && (hours % 100 < 12 || hours % 100 > 14) ? 'часа' : 'часов'; return `${hours} ${suffix}`; };
  const typeNames = { lesson: 'Урок', practicum: 'Практикум', project: 'Проект' };
  const lessons = window.COURSE.lessons;
  const blocks = window.COURSE.blocks;
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
    if (bar) bar.style.width = `${percent}%`;
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
  updateProgress();
  window.addEventListener('course-progress-updated', updateProgress);
})();
