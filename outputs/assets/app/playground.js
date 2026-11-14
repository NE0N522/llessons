(() => {
  const decode = (value) => {
    try { return decodeURIComponent(value || ''); } catch { return ''; }
  };
  const policy = "default-src 'none'; script-src 'none'; connect-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; media-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'";
  const withPolicy = (html) => {
    const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}">`;
    if (/<head\b[^>]*>/i.test(html)) return html.replace(/<head\b[^>]*>/i, (head) => `${head}${meta}`);
    if (/<html\b[^>]*>/i.test(html)) return html.replace(/<html\b[^>]*>/i, (tag) => `${tag}<head>${meta}</head>`);
    return `<!doctype html><html lang="ru"><head><meta charset="utf-8">${meta}</head><body>${html}</body></html>`;
  };
  const buildDocument = (html, css, mode = 'browser') => {
    const safeCss = String(css || '').replace(/<\/style/gi, '<\\/style');
    const baseCss = mode === 'clean' ? '*,*::before,*::after{box-sizing:border-box}html{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#243348;background:#f8fafc}body{min-height:100vh;margin:0;padding:1rem;font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;color:#243348;background:#f8fafc}button,input,select,textarea{font:inherit}img{max-width:100%;height:auto}' : '';
    if (/^\s*<!doctype\s+html/i.test(html)) {
      const style = `<style>${baseCss}\n${safeCss}</style>`;
      const document = /<\/head\s*>/i.test(html) ? html.replace(/<\/head\s*>/i, `${style}</head>`) : html.replace(/<html\b[^>]*>/i, (tag) => `${tag}<head>${style}</head>`);
      return withPolicy(document);
    }
    return withPolicy(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${baseCss}\n${safeCss}</style></head><body>${html}</body></html>`);
  };
  const formatHtml = (value) => window.courseCodeFormat?.html(value) ?? value;
  const formatCss = (value) => window.courseCodeFormat?.css(value) ?? value;
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const fontSize = () => window.loadCourseEditorFontSize?.() ?? Promise.resolve(15);

  const copyText = async (value) => {
    if (navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(value); return true; } catch { /* Use the local fallback below. */ }
    }
    const field = document.createElement('textarea');
    field.value = value;
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

  window.initPlaygrounds = (scope = document) => {
    scope.querySelectorAll('[data-playground]').forEach((host, index) => {
      if (host.dataset.ready === 'true') return;
      host.dataset.ready = 'true';
      let examples = [];
      try { examples = JSON.parse(decode(host.dataset.examples) || '[]'); } catch { examples = []; }
      if (!examples.length) examples = [{ title: 'Пример', html: decode(host.dataset.fallbackHtml), css: decode(host.dataset.fallbackCss), previewMode: host.dataset.previewMode }];
      let selectedExample = 0;
      let activeExample = null;
      let htmlEditor = null;
      let cssEditor = null;
      let mounted = false;
      let mountPromise = null;
      let observer = null;
      let editorApi = null;
      let currentFontSize = 15;
      let debounce;
      const formatExample = (example) => ({ html: formatHtml(example.html || ''), css: formatCss(example.css || ''), title: example.title || 'Пример', note: example.note || 'Посмотри, какое правило управляет расположением и поведением элементов.', previewMode: example.previewMode || host.dataset.previewMode || 'browser' });
      activeExample = formatExample(examples[0]);
      const height = Math.max(180, Math.min(520, Number(host.dataset.height) || 260));
      const uid = `play-${host.dataset.step || index}`.replace(/[^a-zA-Z0-9_-]/g, '-');
      const exampleControls = examples.slice(0, 6).map((example, exampleIndex) => {
        const title = String(example.title || '').replace(/^\d+\.\s*/, '') || `Вариант ${exampleIndex + 1}`;
        return `<button type="button" class="playground-example-button" data-example-index="${exampleIndex}" aria-pressed="${exampleIndex === 0}">Пример ${exampleIndex + 1}<span>${escapeHtml(title)}</span></button>`;
      }).join('');
      const deviceControls = host.dataset.devicePreview === 'true' ? '<div class="playground-device-controls" role="group" aria-label="Ширина предпросмотра"><span>Ширина примера</span><button type="button" data-preview-width="320" aria-pressed="false">320</button><button type="button" data-preview-width="768" aria-pressed="false">768</button><button type="button" data-preview-width="1280" aria-pressed="true">1280</button></div>' : '';
      host.innerHTML = `<div class="playground-toolbar"><div><strong>Попробуй сам</strong><span data-example-title>${escapeHtml(activeExample.title)}</span><span class="playground-example-note" data-example-note>${escapeHtml(activeExample.note)}</span></div><div class="playground-actions"><div class="editor-font-controls" role="group" aria-label="Размер текста редактора"><button type="button" data-font-minus aria-label="Уменьшить шрифт редактора">−</button><output data-font-label>15 px</output><button type="button" data-font-plus aria-label="Увеличить шрифт редактора">+</button></div><button type="button" class="quiet-button" data-reset>Сбросить</button><button type="button" class="quiet-button" data-copy>Копировать</button></div></div>
        <div class="playground-example-switcher" role="group" aria-label="Примеры к шагу">${exampleControls}</div>
        <div class="playground-tabs" role="tablist" aria-label="Редактор кода"><button type="button" role="tab" id="${uid}-tab-html" aria-controls="${uid}-panel-html" aria-selected="true" data-tab="html">HTML</button><button type="button" role="tab" id="${uid}-tab-css" aria-controls="${uid}-panel-css" aria-selected="false" data-tab="css">CSS</button></div>
        <div class="playground-mobile-switcher" role="group" aria-label="Показать код или результат"><button type="button" data-mobile-mode="code" aria-pressed="true">Код</button><button type="button" data-mobile-mode="result" aria-pressed="false">Результат</button></div>
        ${deviceControls}<div class="playground-grid" data-mobile-view="code"><section class="playground-editor" role="tabpanel" id="${uid}-panel-html" aria-labelledby="${uid}-tab-html" data-panel="html"><div class="editor-panel-heading"><label>HTML-код</label><div class="editor-touch-tools"><button type="button" class="editor-touch-button" data-editor-command="suggestions" data-editor-language="html">Подсказки</button><button type="button" class="editor-touch-button" data-editor-command="indent" data-editor-language="html">Отступ</button></div></div><div class="code-editor-host" data-editor-host="html"><span class="playground-skeleton" aria-hidden="true"></span></div></section>
        <section class="playground-editor" role="tabpanel" id="${uid}-panel-css" aria-labelledby="${uid}-tab-css" data-panel="css" hidden><div class="editor-panel-heading"><label>CSS-код</label><div class="editor-touch-tools"><button type="button" class="editor-touch-button" data-editor-command="suggestions" data-editor-language="css">Подсказки</button><button type="button" class="editor-touch-button" data-editor-command="indent" data-editor-language="css">Отступ</button></div></div><div class="code-editor-host" data-editor-host="css"><span class="playground-skeleton" aria-hidden="true"></span></div></section>
        <div class="playground-result"><div class="result-heading"><span>Результат</span><span class="safe-label">изолированная песочница</span></div><div class="playground-result-viewport"><span class="playground-preview-skeleton" data-preview-skeleton>Подготавливаю предпросмотр…</span><iframe title="Живой результат примера" sandbox="allow-same-origin" referrerpolicy="no-referrer" style="height:${height}px" data-result></iframe></div></div></div><p class="playground-status" aria-live="polite" data-status></p>`;
      const htmlHost = host.querySelector('[data-editor-host="html"]');
      const cssHost = host.querySelector('[data-editor-host="css"]');
      const frame = host.querySelector('[data-result]');
      const resultViewport = host.querySelector('.playground-result-viewport');
      const previewSkeleton = host.querySelector('[data-preview-skeleton]');
      const status = host.querySelector('[data-status]');
      const tabs = [...host.querySelectorAll('[role="tab"]')];
      const panels = [...host.querySelectorAll('[role="tabpanel"]')];
      host.querySelectorAll('[data-editor-command]').forEach((button) => button.addEventListener('click', async () => {
        await mount();
        const editor = button.dataset.editorLanguage === 'css' ? cssEditor : htmlEditor;
        if (button.dataset.editorCommand === 'suggestions') editor?.showCompletions();
        else editor?.indent();
      }));
      const render = () => {
        const html = htmlEditor?.getValue() ?? activeExample.html;
        const css = cssEditor?.getValue() ?? activeExample.css;
        previewSkeleton.hidden = false;
        frame.srcdoc = buildDocument(html, css, activeExample.previewMode);
      };
      frame.addEventListener('load', () => { previewSkeleton.hidden = true; });
      const updateFontControls = () => {
        host.querySelector('[data-font-label]').textContent = `${currentFontSize} px`;
        host.querySelector('[data-font-minus]').disabled = currentFontSize <= 12;
        host.querySelector('[data-font-plus]').disabled = currentFontSize >= 24;
      };
      const applyFontSize = (size) => {
        currentFontSize = Math.max(12, Math.min(24, Number(size) || 15));
        htmlEditor?.setFontSize(currentFontSize);
        cssEditor?.setFontSize(currentFontSize);
        updateFontControls();
      };
      const loadExample = (nextIndex, announce = false) => {
        selectedExample = nextIndex;
        activeExample = formatExample(examples[nextIndex]);
        htmlEditor?.setValue(activeExample.html, { silent: true });
        cssEditor?.setValue(activeExample.css, { silent: true });
        host.querySelector('[data-example-title]').textContent = activeExample.title;
        host.querySelector('[data-example-note]').textContent = activeExample.note;
        host.querySelectorAll('[data-example-index]').forEach((button) => button.setAttribute('aria-pressed', String(Number(button.dataset.exampleIndex) === nextIndex)));
        const hasCss = Boolean(activeExample.css);
        host.querySelector('[data-tab="css"]').hidden = !hasCss;
        const selectedTab = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true')?.dataset.tab || 'html';
        const visibleTab = selectedTab === 'css' && hasCss ? 'css' : 'html';
        tabs.forEach((tab) => tab.setAttribute('aria-selected', String(tab.dataset.tab === visibleTab)));
        panels.forEach((panel) => { panel.hidden = panel.dataset.panel !== visibleTab; });
        if (announce) status.textContent = `Открыт пример ${nextIndex + 1}: ${activeExample.title}.`;
        render();
      };
      const mount = () => {
        if (mountPromise) return mountPromise;
        mounted = true;
        observer?.disconnect();
        mountPromise = (async () => {
          try {
            [editorApi, currentFontSize] = await Promise.all([window.loadCourseCodeEditor(), fontSize()]);
            if (!host.isConnected) return;
            htmlHost.querySelector('.playground-skeleton')?.remove();
            cssHost.querySelector('.playground-skeleton')?.remove();
            const handleChange = () => {
              window.clearTimeout(debounce);
              debounce = window.setTimeout(render, 180);
            };
            htmlEditor = editorApi.createEditor(htmlHost, { value: activeExample.html, language: 'html', fontSize: currentFontSize, onChange: handleChange, onStatus: (message) => { status.textContent = message; } });
            cssEditor = editorApi.createEditor(cssHost, { value: activeExample.css, language: 'css', fontSize: currentFontSize, onChange: handleChange, onStatus: (message) => { status.textContent = message; } });
            htmlEditor.view.scrollDOM.tabIndex = 0;
            cssEditor.view.scrollDOM.tabIndex = 0;
            updateFontControls();
            render();
          } catch (error) {
            status.textContent = error.message || 'Не удалось загрузить редактор.';
            htmlHost.textContent = 'Редактор сейчас недоступен. Обнови страницу.';
          }
        })();
        return mountPromise;
      };

      if (!activeExample.css) {
        host.querySelector('[data-tab="css"]').hidden = true;
        host.querySelector('[data-panel="css"]').hidden = true;
      }
      host.querySelectorAll('[data-example-index]').forEach((button) => button.addEventListener('click', () => { loadExample(Number(button.dataset.exampleIndex), true); if (!mounted) mount(); }));
      host.querySelector('[data-font-minus]').addEventListener('click', () => window.setCourseEditorFontSize?.(currentFontSize - 1));
      host.querySelector('[data-font-plus]').addEventListener('click', () => window.setCourseEditorFontSize?.(currentFontSize + 1));
      host.querySelectorAll('[data-tab]').forEach((tab) => tab.addEventListener('click', () => {
        const selected = tab.dataset.tab;
        tabs.forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
        panels.forEach((panel) => { panel.hidden = panel.dataset.panel !== selected; });
        if (!mounted) mount();
        window.setTimeout(() => {
          const editor = selected === 'css' ? cssEditor : htmlEditor;
          editor?.refresh();
          editor?.focus();
        }, 0);
      }));
      host.querySelectorAll('[data-mobile-mode]').forEach((button) => button.addEventListener('click', () => {
        host.querySelector('.playground-grid').dataset.mobileView = button.dataset.mobileMode;
        host.querySelector('.playground-tabs').hidden = button.dataset.mobileMode === 'result';
        host.querySelectorAll('[data-mobile-mode]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        if (button.dataset.mobileMode === 'code' && !mounted) void mount();
        if (button.dataset.mobileMode === 'code') window.setTimeout(() => {
          const selected = host.querySelector('[data-tab][aria-selected="true"]')?.dataset.tab;
          (selected === 'css' ? cssEditor : htmlEditor)?.refresh();
        }, 0);
      }));
      host.querySelectorAll('[data-preview-width]').forEach((button) => button.addEventListener('click', () => {
        frame.style.width = `${button.dataset.previewWidth}px`;
        host.querySelectorAll('[data-preview-width]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        resultViewport.dataset.width = button.dataset.previewWidth;
        status.textContent = `Ширина предпросмотра: ${button.dataset.previewWidth} пикселей.`;
      }));
      host.querySelector('[data-reset]').addEventListener('click', () => loadExample(selectedExample, false));
      host.querySelector('[data-copy]').addEventListener('click', async () => {
        const useCss = host.querySelector('[data-tab="css"][aria-selected="true"]');
        const selected = useCss ? cssEditor : htmlEditor;
        const text = selected?.getValue() ?? (useCss ? activeExample.css : activeExample.html);
        try {
          const copied = await copyText(text);
          status.textContent = copied ? `${useCss ? 'CSS' : 'HTML'} скопирован.` : 'Не удалось скопировать код. Выдели его вручную.';
        } catch { status.textContent = 'Не удалось скопировать код. Выдели его вручную.'; }
      });
      frame.style.width = host.dataset.devicePreview === 'true' ? '1280px' : '100%';
      if (host.dataset.devicePreview === 'true') resultViewport.dataset.width = '1280';
      render();
      window.addEventListener('course-editor-font-size-change', (event) => applyFontSize(event.detail?.fontSize));
      fontSize().then(applyFontSize);
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) mount(); }, { rootMargin: '420px 0px' });
        observer.observe(host);
      } else mount();
    });
  };
})();
