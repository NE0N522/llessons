(() => {
  const storageKey = 'course-color-theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let manualChoice = false;
  let currentTheme = media.matches ? 'dark' : 'light';

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'dark' || stored === 'light') {
      currentTheme = stored;
      manualChoice = true;
    }
  } catch { /* Theme still follows the system if browser storage is unavailable. */ }

  const sunIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="3.7"></circle><path d="M12 2.5v2.1m0 14.8v2.1M4.6 4.6l1.5 1.5m11.8 11.8 1.5 1.5M2.5 12h2.1m14.8 0h2.1M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5"></path></svg>';
  const moonIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.1 15.2A8.5 8.5 0 0 1 8.8 3.9a8.7 8.7 0 1 0 11.3 11.3Z"></path></svg>';

  const applyTheme = (theme) => {
    currentTheme = theme;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const dark = theme === 'dark';
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Светлая тема' : 'Тёмная тема');
      button.title = dark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему';
      const label = button.querySelector('[data-theme-label]');
      const icon = button.querySelector('[data-theme-icon]');
      if (label) label.textContent = dark ? 'Светлая тема' : 'Тёмная тема';
      if (icon) icon.innerHTML = dark ? sunIcon : moonIcon;
    });
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = darkThemeColor(theme);
  };

  const darkThemeColor = () => getComputedStyle(document.documentElement).getPropertyValue('--v3-canvas').trim() || document.querySelector('meta[name="theme-color"]')?.content || '';
  applyTheme(currentTheme);

  const bindControls = () => {
    applyTheme(currentTheme);
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      if (button.dataset.themeReady === 'true') return;
      button.dataset.themeReady = 'true';
      button.addEventListener('click', () => {
        const next = currentTheme === 'dark' ? 'light' : 'dark';
        manualChoice = true;
        applyTheme(next);
        try { localStorage.setItem(storageKey, next); } catch { /* The current page still keeps the selected theme. */ }
      });
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindControls, { once: true });
  else bindControls();

  const followSystem = (event) => {
    if (!manualChoice) applyTheme(event.matches ? 'dark' : 'light');
  };
  if (media.addEventListener) media.addEventListener('change', followSystem);
  else if (media.addListener) media.addListener(followSystem);
})();
