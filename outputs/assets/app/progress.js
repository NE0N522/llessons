(() => {
  const keyForLesson = (id) => `course-v3-lesson-${id}`;
  const keyForStep = (id, stepId) => `${keyForLesson(id)}-step-${stepId}`;
  const storage = {
    read(key) {
      try { return window.localStorage.getItem(key); } catch { return null; }
    },
    write(key, value) {
      try { window.localStorage.setItem(key, value); return true; } catch { return false; }
    },
    remove(key) {
      try { window.localStorage.removeItem(key); } catch { /* A storage restriction must not block the lesson. */ }
    }
  };
  const splitLesson23Progress = () => {
    const migrationKey = 'course-v3-migration-lesson23-flex-grid-v1';
    if (storage.read(migrationKey) === 'done') return;
    if (storage.read(keyForLesson(23)) === 'done') storage.write(keyForLesson(29), 'done');
    for (let index = 0; index < 3; index += 1) {
      const oldKey = `${keyForLesson(23)}-can-${index}`;
      if (storage.read(oldKey) === 'yes') storage.write(`${keyForLesson(29)}-can-${index}`, 'yes');
      storage.remove(oldKey);
    }
    const oldGridCheck = `${keyForLesson(23)}-can-3`;
    if (storage.read(oldGridCheck) === 'yes') storage.write(`${keyForLesson(23)}-can-0`, 'yes');
    storage.remove(oldGridCheck);
    storage.write(migrationKey, 'done');
  };
  splitLesson23Progress();
  let studentSessionPromise = null;
  let remoteProgressPromise = null;
  let progressWriteQueue = Promise.resolve();
  const hasStudentSession = () => {
    if (window.location.protocol === 'file:') return Promise.resolve(false);
    if (!studentSessionPromise) studentSessionPromise = fetch('/api/auth/status', { credentials: 'same-origin', cache: 'no-store' })
      .then(async response => response.ok && (await response.json()).user?.role === 'student')
      .catch(() => false);
    return studentSessionPromise;
  };
  const readRemoteProgress = async () => {
    if (!(await hasStudentSession())) return null;
    if (!remoteProgressPromise) remoteProgressPromise = fetch('/api/student/progress', { credentials: 'same-origin', cache: 'no-store' })
      .then(async response => response.ok ? (await response.json()).progress || [] : null)
      .catch(() => null);
    return remoteProgressPromise;
  };

  window.courseProgress = {
    isComplete(id) { return storage.read(keyForLesson(id)) === 'done'; },
    markComplete(id, complete = true) { return storage.write(keyForLesson(id), complete ? 'done' : ''); },
    isStepComplete(id, stepId) { return storage.read(keyForStep(id, stepId)) === 'yes'; },
    markStepComplete(id, stepId, complete = true) {
      storage.write(keyForStep(id, stepId), complete ? 'yes' : 'no');
      this.sync(id, stepId, complete);
    },
    setLastOpened(id) { return storage.write('course-v3-last-opened', String(id)); },
    lastOpened() { return Number(storage.read('course-v3-last-opened')) || 0; },
    async hydrate() {
      const progress = await readRemoteProgress();
      if (progress) {
        const completedLessons = new Set(progress.filter(item => item.step_id === 'lesson-complete').map(item => item.lesson_id));
        for (const item of progress) {
          if (item.step_id === 'lesson-complete') storage.write(keyForLesson(item.lesson_id), 'done');
          else if (!item.step_id.startsWith('can-')) storage.write(keyForStep(item.lesson_id, item.step_id), 'yes');
        }
        for (const lesson of window.COURSE?.lessons || []) {
          if (!completedLessons.has(lesson.id) && storage.read(keyForLesson(lesson.id)) === 'done') window.courseProgress.sync(lesson.id, 'lesson-complete', true);
        }
        window.dispatchEvent(new CustomEvent('course-progress-updated'));
      }
      return progress;
    },
    sync(id, stepId, done) {
      progressWriteQueue = progressWriteQueue.then(async () => {
        if (!(await hasStudentSession())) return;
        try { await fetch('/api/student/progress', { method: 'PUT', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lesson_id: id, step_id: stepId, done }) }); }
        catch { /* Progress remains available in this browser when offline. */ }
      });
    }
  };

  window.initLessonProgress = (root = document) => {
    const id = Number(root.querySelector('[data-lesson-id]')?.dataset.lessonId);
    if (!id) return;
    const checks = [...root.querySelectorAll('[data-can-check]')];
    const button = root.querySelector('[data-mark-complete]');
    const updateButton = () => {
      if (!button) return;
      const complete = window.courseProgress.isComplete(id);
      button.setAttribute('aria-pressed', String(complete));
      button.textContent = complete ? 'Урок отмечен пройденным' : 'Отметить урок пройденным';
    };
    checks.forEach((check, index) => {
      check.checked = storage.read(`${keyForLesson(id)}-can-${index}`) === 'yes';
      check.addEventListener('change', () => {
        storage.write(`${keyForLesson(id)}-can-${index}`, check.checked ? 'yes' : 'no');
        window.courseProgress.sync(id, `can-${index}`, check.checked);
      });
    });
    if (button) button.addEventListener('click', () => {
      const nextState = !window.courseProgress.isComplete(id);
      window.courseProgress.markComplete(id, nextState);
      window.courseProgress.sync(id, 'lesson-complete', nextState);
      updateButton();
    });
    updateButton();
    window.courseProgress.hydrate().then(progress => {
      if (!progress) return;
      const completed = new Set(progress.filter(item => item.lesson_id === id).map(item => item.step_id));
      checks.forEach((check, index) => {
        const stepId=`can-${index}`;
        if(completed.has(stepId)){check.checked=true;storage.write(`${keyForLesson(id)}-${stepId}`,'yes');}
        else{check.checked=storage.read(`${keyForLesson(id)}-${stepId}`)==='yes';if(check.checked)window.courseProgress.sync(id,stepId,true);}
      });
      updateButton();
    });
  };
  window.courseProgress.hydrate();
})();
