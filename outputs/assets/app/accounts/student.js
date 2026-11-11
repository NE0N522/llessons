(() => {
  const A = window.CourseAccounts, root = document.querySelector('[data-assignment-list]');
  if (!A || !root) return;
  const $ = selector => document.querySelector(selector), esc = A.escapeHtml;
  const state = { assignments: [], announcements: [], filter: 'all', weeklyGoal: 3, weeklyDone: 0, location: '', archived: false };
  const lessonLabel = id => { const lesson = window.COURSE?.lessons.find(item => item.id === Number(id)); return lesson ? `Урок ${lesson.number} · ${lesson.title}` : `Урок ${id}`; };
  const labels = { ...A.strings.status, returned: 'На доработке', accepted: 'Готово' };
  const messages = { not_started: 'Начни работу и сохрани черновик.', draft: 'Черновик сохранён. Можно продолжить в любое время.', submitted: 'Работа отправлена учителю. Дождись проверки.', returned: 'Учитель оставил комментарий. Исправь работу и отправь снова.', accepted: 'Работа принята учителем.' };
  const category = status => ['not_started', 'draft', 'returned'].includes(status) ? 'todo' : status === 'submitted' ? 'review' : 'done';

  function renderDashboard() {
    const dashboard = $('[data-student-dashboard]');
    if (!dashboard) return;
    const assignments = state.assignments;
    const todo = assignments.filter(item => category(item.status) === 'todo').length;
    const review = assignments.filter(item => item.status === 'submitted').length;
    const done = assignments.filter(item => item.status === 'accepted').length;
    const returned = assignments.filter(item => item.status === 'returned').length;
    const now = Date.now();
    const nextDue = assignments.filter(item => item.due_at && Date.parse(item.due_at) >= now && Date.parse(item.due_at) <= now + 3 * 86400000).sort((a, b) => Date.parse(a.due_at) - Date.parse(b.due_at))[0];
    const continuePath = /^\/lesson-view\.html\?lesson=\d+(?:#[a-z0-9_-]+)?$/i.test(state.location) || /^\/student\/assignment\.html\?id=\d+$/.test(state.location) ? state.location : '';
    const continueLink = continuePath ? `<a class="v3-button v3-button-secondary" href="${esc(continuePath)}">Продолжить с места остановки <span aria-hidden="true">→</span></a>` : '<a class="v3-button v3-button-secondary" href="../index.html#lessons">Выбрать урок курса</a>';
    dashboard.innerHTML = `${state.archived?'<div class="account-warning account-archive-notice"><strong>Класс в архиве.</strong> Ты можешь входить и смотреть свои работы и оценки. Новые ответы и отправки для этого класса закрыты.</div>':''}<section class="account-student-welcome"><div><div class="account-eyebrow">ТВОЙ ПЛАН</div><h2>Продолжай в своём темпе</h2><p>Можно вернуться к последнему месту в уроке или задании.</p>${continueLink}</div><div class="account-weekly-goal"><strong>Цель на неделю</strong><span><b>${state.weeklyDone}</b> из ${state.weeklyGoal} заданий</span><div class="account-goal-progress" role="progressbar" aria-label="Выполнение недельной цели" aria-valuemin="0" aria-valuemax="${state.weeklyGoal}" aria-valuenow="${Math.min(state.weeklyDone, state.weeklyGoal)}"><span style="width:${Math.min(100, Math.round(state.weeklyDone / Math.max(1, state.weeklyGoal) * 100))}%"></span></div><form data-goal-form><label for="weekly-goal">Заданий в неделю</label><select id="weekly-goal" name="weekly_goal">${Array.from({ length: 10 }, (_, index) => index + 1).map(value => `<option value="${value}" ${value === state.weeklyGoal ? 'selected' : ''}>${value}</option>`).join('')}</select><button type="submit" class="account-small-button">Сохранить цель</button><span data-goal-status class="account-muted" role="status"></span></form></div></section>
      ${state.announcements.length?`<section class="account-announcements"><div class="account-panel-heading"><div><div class="account-eyebrow">ОТ КЛАССА</div><h2>Объявления</h2></div><span class="account-new-review">Новое</span></div><div class="account-announcement-list">${state.announcements.map(item=>`<article><h3>${esc(item.title)}${item.pinned?'<span class="account-pin">Закреплено</span>':''}</h3><p>${esc(item.body)}</p><time>${A.formatDate(item.created_at)}</time></article>`).join('')}</div></section>`:''}
      ${returned ? `<div class="account-returned-banner"><strong>${returned} ${returned === 1 ? 'работа ждёт' : 'работы ждут'} доработки.</strong> Открой комментарий учителя и посмотри, что улучшить.</div>` : ''}
      ${nextDue ? `<div class="account-due-banner"><strong>Срок скоро:</strong> ${esc(nextDue.title)} · ${A.formatDueDate(nextDue.due_at)} <a href="assignment.html?id=${nextDue.id}">Открыть задание →</a></div>` : ''}
      <nav class="account-student-groups" data-student-groups aria-label="Задания по состоянию"><button type="button" data-filter="todo" aria-pressed="${state.filter === 'todo'}"><span>Сделать</span><strong>${todo}</strong></button><button type="button" data-filter="submitted" aria-pressed="${state.filter === 'submitted'}"><span>На проверке</span><strong>${review}</strong></button><button type="button" data-filter="accepted" aria-pressed="${state.filter === 'accepted'}"><span>Готово</span><strong>${done}</strong></button><a href="profile.html">Мой профиль и история →</a></nav>`;
  }

  function render() {
    const items = state.assignments.filter(item => state.filter === 'all' || item.status === state.filter || state.filter === 'todo' && category(item.status) === 'todo');
    root.innerHTML = items.length ? items.map(item => `<article class="account-assignment-card"><div class="account-assignment-meta"><span class="account-eyebrow">${item.lesson_id ? esc(lessonLabel(item.lesson_id)) : 'ЗАДАНИЕ'}</span><div class="account-actions">${item.unread_review ? '<span class="account-new-review">Новый ответ учителя</span>' : ''}<span class="account-status" data-status="${item.status}">${labels[item.status] || item.status}</span></div></div><h2>${esc(item.title)}</h2><div class="account-description">${A.formatDescription(item.description || 'Описание пока не добавлено.')}</div><div class="account-class-counts"><span class="account-count-pill">${item.score == null ? 'Баллы появятся после проверки' : `${item.score} баллов`}</span><span class="account-count-pill">${item.due_at ? `Срок: ${A.formatDueDate(item.due_at)}` : 'Без срока'}</span>${item.overdue ? '<span class="account-status" data-status="returned">Срок прошёл</span>' : ''}</div><p class="account-muted">${messages[item.status] || ''}${item.teacher_comment ? `<br><strong>Комментарий учителя:</strong> ${esc(item.teacher_comment)}` : ''}</p><footer><span class="account-muted">${item.submitted_at ? `Отправлено: ${A.formatDate(item.submitted_at)}` : state.archived?'Только просмотр':'Можно сохранить черновик'}</span><a class="v3-button ${item.status === 'submitted' ? 'v3-button-secondary' : ''}" href="assignment.html?id=${item.id}">${state.archived?'Посмотреть':item.status === 'not_started' ? 'Начать' : item.status === 'submitted' ? 'Открыть' : item.status === 'accepted' ? 'Посмотреть' : 'Продолжить'} <span aria-hidden="true">→</span></a></footer></article>`).join('') : `<div class="account-empty"><h2>${state.filter === 'all' ? 'Новых заданий пока нет' : 'В этой группе пока нет заданий'}</h2><p>${state.filter === 'all' ? 'Когда учитель опубликует задание, оно появится здесь. Пока можно продолжить урок курса.' : 'Выбери другую группу или загляни сюда позже.'}</p>${state.filter === 'all' ? '<a class="v3-button v3-button-secondary" href="../index.html#lessons">Продолжить курс</a>' : ''}</div>`;
  }

  async function init() {
    const user = await A.guard('student');
    if (!user) return;
    try {
      const [result, learning] = await Promise.all([A.api('/api/student/assignments'), A.api('/api/student/settings/learning')]);
      state.assignments = result.assignments;state.announcements=result.announcements||[];state.archived=Boolean(Number(result.class.archived));
      state.weeklyGoal = learning.weekly_goal;
      state.location = learning.last_course_location;
      const monday = new Date(); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
      state.weeklyDone = state.assignments.filter(item => item.submitted_at && Date.parse(item.submitted_at) >= monday.getTime() && ['submitted', 'returned', 'accepted'].includes(item.status)).length;
      const label = $('[data-class-name]');
      if (label) label.textContent = `· ${result.class.class_name}${result.class.school_year ? ` · ${result.class.school_year}` : ''}`;
      const newReviews = $('[data-new-review]');
      if (newReviews && result.unread_reviews) { newReviews.textContent = `${result.unread_reviews} новых оценок`; newReviews.hidden = false; }
      if(newReviews&&result.unread_questions){newReviews.textContent=[result.unread_reviews?`${result.unread_reviews} новых оценок`:'',`${result.unread_questions} ответов учителя`].filter(Boolean).join(' · ');newReviews.hidden=false;}
      const filters = $('[data-assignment-filters]');
      const counts = { all: state.assignments.length, not_started: 0, draft: 0, submitted: 0, returned: 0, accepted: 0 };
      for (const item of state.assignments) counts[item.status] = (counts[item.status] || 0) + 1;
      filters.innerHTML = [['all', 'Все'], ['todo', 'Сделать'], ['not_started', 'Новые'], ['draft', 'В работе'], ['submitted', 'На проверке'], ['returned', 'Доработать'], ['accepted', 'Готово']].map(([id, label]) => `<button class="account-filter" data-filter="${id}" aria-pressed="${state.filter === id}">${label} <span>${id === 'todo' ? counts.not_started + counts.draft + counts.returned : counts[id] || 0}</span></button>`).join('');
      filters.addEventListener('click', event => { const button = event.target.closest('[data-filter]'); if (!button) return; state.filter = button.dataset.filter; filters.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); document.querySelectorAll('[data-student-groups] [data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.filter === state.filter))); render(); });
      const dashboard = $('[data-student-dashboard]');
      dashboard.addEventListener('click', event => { const button = event.target.closest('[data-filter]'); if (!button) return; state.filter = button.dataset.filter; filters.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); dashboard.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button))); render(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      dashboard.addEventListener('submit', async event => { if (!event.target.matches('[data-goal-form]')) return; event.preventDefault(); const status = $('[data-goal-status]', event.target); status.textContent = 'Сохраняю…'; try { const saved = await A.api('/api/student/settings/learning', { method: 'PUT', body: JSON.stringify({ weekly_goal: Number(event.target.elements.weekly_goal.value) }) }); state.weeklyGoal = saved.weekly_goal; renderDashboard(); status.textContent = 'Цель сохранена.'; } catch (error) { status.textContent = error.message; } });
      $('[data-user-name]').textContent = user.full_name;
      renderDashboard(); render();
    } catch (error) { A.showLoadError(root, error, init); }
  }
  init();
})();
