(() => {
  const loaderSource = document.currentScript?.src;
  const editorSource = loaderSource ? new URL('../vendor/code-editor.js?v=account-ui-20261112', loaderSource).href : 'assets/vendor/code-editor.js?v=account-ui-20261112';
  const fontKey = 'course-code-editor-font-size';
  let modulePromise;
  let userPromise;
  let settingPromise;

  const clamp = (value) => Math.max(12, Math.min(24, Math.round(Number(value) || 15)));
  const readLocal = () => {
    try { return clamp(localStorage.getItem(fontKey) || 15); } catch { return 15; }
  };
  const writeLocal = (value) => {
    try { localStorage.setItem(fontKey, String(clamp(value))); } catch { /* Keep the current-page value when storage is unavailable. */ }
  };
  const signedInStudent = async () => {
    if (location.protocol === 'file:') return false;
    if (!userPromise) userPromise = fetch('/api/auth/status', { credentials: 'same-origin', cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((body) => body?.user?.role === 'student')
      .catch(() => false);
    return userPromise;
  };
  window.loadCourseCodeEditor = () => {
    if (window.CourseCodeEditor) return Promise.resolve(window.CourseCodeEditor);
    if (!modulePromise) modulePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = editorSource;
      script.async = true;
      script.onload = () => window.CourseCodeEditor ? resolve(window.CourseCodeEditor) : reject(new Error('Библиотека редактора не загрузилась.'));
      script.onerror = () => reject(new Error('Не удалось загрузить редактор. Перезагрузи страницу.'));
      document.head.append(script);
    });
    return modulePromise;
  };

  window.loadCourseEditorFontSize = () => {
    if (!settingPromise) settingPromise = (async () => {
      const localSize = readLocal();
      if (!(await signedInStudent())) return localSize;
      try {
        const response = await fetch('/api/student/settings/editor', { credentials: 'same-origin', cache: 'no-store' });
        if (!response.ok) return localSize;
        const body = await response.json();
        const size = clamp(body.font_size);
        writeLocal(size);
        return size;
      } catch { return localSize; }
    })();
    return settingPromise;
  };

  window.setCourseEditorFontSize = async (size) => {
    const next = clamp(size);
    writeLocal(next);
    settingPromise = Promise.resolve(next);
    window.dispatchEvent(new CustomEvent('course-editor-font-size-change', { detail: { fontSize: next } }));
    if (!(await signedInStudent())) return next;
    try {
      const response = await fetch('/api/student/settings/editor', {
        method: 'PUT', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ font_size: next }),
      });
      return response.ok ? next : null;
    } catch { return null; }
  };
})();
