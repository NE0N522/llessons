(() => {
  const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const copy = async (text) => {
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
    } catch { /* Clipboard may be unavailable in an embedded or offline context. */ }
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

  window.initFlexLab = (scope = document) => {
    scope.querySelectorAll('[data-flex-lab]').forEach((lab) => {
      if (lab.dataset.ready === 'true') return;
      lab.dataset.ready = 'true';
      const preview = lab.querySelector('[data-lab-preview]');
      const code = lab.querySelector('[data-lab-code]');
      const status = lab.querySelector('[data-lab-status]');
      const read = (name) => lab.querySelector(`[data-lab-control="${name}"]`).value;
      const update = () => {
        const values = { direction: read('direction'), justify: read('justify'), align: read('align'), wrap: read('wrap'), gap: read('gap') };
        preview.style.flexDirection = values.direction;
        preview.style.justifyContent = values.justify;
        preview.style.alignItems = values.align;
        preview.style.flexWrap = values.wrap;
        preview.style.gap = values.gap;
        code.textContent = `.lab-preview {\n  display: flex;\n  flex-direction: ${values.direction};\n  justify-content: ${values.justify};\n  align-items: ${values.align};\n  flex-wrap: ${values.wrap};\n  gap: ${values.gap};\n}\n\n.lab-preview > * {\n  flex: 1 1 8rem;\n}`;
      };
      lab.querySelectorAll('[data-lab-control]').forEach((control) => control.addEventListener('change', update));
      lab.querySelectorAll('[data-lab-width]').forEach((button) => button.addEventListener('click', () => {
        const width = Number(button.dataset.labWidth);
        preview.style.width = `${width}px`;
        preview.dataset.width = String(width);
        lab.querySelectorAll('[data-lab-width]').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
        status.textContent = `Ширина предпросмотра: ${width} пикселей.`;
      }));
      lab.querySelector('[data-lab-copy]')?.addEventListener('click', async () => {
        status.textContent = await copy(code.textContent) ? 'CSS скопирован.' : 'Не удалось скопировать. Выдели CSS вручную.';
      });
      preview.style.width = '1280px';
      update();
    });
  };
})();
