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
  const buildDocument = (html, css) => {
    const safeCss = String(css || '').replace(/<\/style/gi, '<\\/style');
    if (/^\s*<!doctype\s+html/i.test(html)) {
      const style = `<style>${safeCss}</style>`;
      const document = /<\/head\s*>/i.test(html) ? html.replace(/<\/head\s*>/i, `${style}</head>`) : html.replace(/<html\b[^>]*>/i, (tag) => `${tag}<head>${style}</head>`);
      return withPolicy(document);
    }
    return withPolicy(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${safeCss}</style></head><body>${html}</body></html>`);
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
      if (!examples.length) examples = [{ title: 'Пример', html: decode(host.dataset.html), css: decode(host.dataset.css) }];
      let selectedExample = 0;
      let activeExample = null;
      let htmlEditor = null;
      let cssEditor = null;
      let mounted = false;
      let observer = null;
      let editorApi = null;
      let currentFontSize = 15;
      let debounce;
      const formatExample = (example) => ({ html: formatHtml(example.html || ''), css: formatCss(example.css || ''), title: example.title || 'Пример' });
      activeExample = formatExample(examples[0]);
      const height = Math.max(180, Math.min(520, Number(host.dataset.height) || 260));
      const uid = `play-${host.dataset.step || index}`.replace(/[^a-zA-Z0-9_-]/g, '-');
      const exampleControls = examples.slice(0, 2).map((example, exampleIndex) => {
        const title = String(example.title || '').replace(/^\d+\.\s*/, '') || `Вариант ${exampleIndex + 1}`;
        return `<button type="button" class="playground-example-button" data-example-index="${exampleIndex}" aria-label="Открыть пример ${exampleIndex + 1}: ${escapeHtml(title)}" aria-pressed="${exampleIndex === 0}">Пример ${exampleIndex + 1}<span>${escapeHtml(title)}</span></button>`;
      }).join('');
      host.innerHTML = `<div class="playground-toolbar"><div><strong>Попробуй сам</strong><span data-example-title>${escapeHtml(activeExample.title)} · измени код и сравни</span></div><div class="playground-actions"><div class="editor-font-controls" role="group" aria-label="Размер текста редактора"><button type="button" data-font-minus aria-label="Уменьшить шрифт редактора">−</button><output data-font-label>15 px</output><button type="button" data-font-plus aria-label="Увеличить шрифт редактора">+</button></div><button type="button" class="quiet-button" data-reset>Сбросить</button><button type="button" class="quiet-button" data-copy>Копировать</button></div></div>
        <div class="playground-example-switcher" role="group" aria-label="Два примера к шагу">${exampleControls}</div>
        <div class="playground-tabs" role="tablist" aria-label="Редактор кода"><button type="button" role="tab" id="${uid}-tab-html" aria-controls="${uid}-panel-html" aria-selected="true" data-tab="html">HTML</button><button type="button" role="tab" id="${uid}-tab-css" aria-controls="${uid}-panel-css" aria-selected="false" data-tab="css">CSS</button></div>
        <div class="playground-grid"><section class="playground-editor" role="tabpanel" id="${uid}-panel-html" aria-labelledby="${uid}-tab-html" data-panel="html"><label>HTML-код</label><div class="code-editor-host" data-editor-host="html"></div><p class="editor-hint">Редактор работает с клавиатуры. Нажми Esc, затем Tab, чтобы перейти дальше. Скрипты в образце не запускаются.</p></section>
        <section class="playground-editor" role="tabpanel" id="${uid}-panel-css" aria-labelledby="${uid}-tab-css" data-panel="css" hidden><label>CSS-код</label><div class="code-editor-host" data-editor-host="css"></div><p class="editor-hint">CSS меняет оформление HTML в изолированной песочнице.</p></section>
        <div class="playground-result"><div class="result-heading"><span>Результат</span><span class="safe-label">изолированная песочница</span></div><iframe title="Живой результат примера" sandbox="allow-same-origin" referrerpolicy="no-referrer" style="height:${height}px" data-result></iframe></div></div><p class="playground-status" aria-live="polite" data-status></p>`;
      const htmlHost = host.querySelector('[data-editor-host="html"]');
      const cssHost = host.querySelector('[data-editor-host="css"]');
      const frame = host.querySelector('[data-result]');
      const status = host.querySelector('[data-status]');
      const tabs = [...host.querySelectorAll('[role="tab"]')];
      const panels = [...host.querySelectorAll('[role="tabpanel"]')];
      const render = () => {
        const html = htmlEditor?.getValue() ?? activeExample.html;
        const css = cssEditor?.getValue() ?? activeExample.css;
        frame.srcdoc = buildDocument(html, css);
      };
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
        host.querySelector('[data-example-title]').textContent = `${activeExample.title} · измени код и сравни`;
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
      const mount = async () => {
        if (mounted) return;
        mounted = true;
        observer?.disconnect();
        try {
          [editorApi, currentFontSize] = await Promise.all([window.loadCourseCodeEditor(), fontSize()]);
          if (!host.isConnected) return;
          const handleChange = () => {
            window.clearTimeout(debounce);
            debounce = window.setTimeout(render, 180);
          };
          htmlEditor = editorApi.createEditor(htmlHost, { value: activeExample.html, language: 'html', fontSize: currentFontSize, onChange: handleChange, onStatus: (message) => { status.textContent = message; } });
          cssEditor = editorApi.createEditor(cssHost, { value: activeExample.css, language: 'css', fontSize: currentFontSize, onChange: handleChange, onStatus: (message) => { status.textContent = message; } });
          updateFontControls();
          render();
        } catch (error) {
          status.textContent = error.message || 'Не удалось загрузить редактор.';
          htmlHost.textContent = 'Редактор сейчас недоступен. Обнови страницу.';
        }
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
      window.addEventListener('course-editor-font-size-change', (event) => applyFontSize(event.detail?.fontSize));
      fontSize().then(applyFontSize);
      if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) mount(); }, { rootMargin: '420px 0px' });
        observer.observe(host);
      } else mount();
    });
  };
})();
