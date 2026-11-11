((root, factory) => {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CourseAccountUtils = api;
})(typeof window !== 'undefined' ? window : globalThis, () => {
  function asDate(value) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDate(value, options = {}) {
    const date = asDate(value);
    if (!date) return '—';
    const dateOptions = {
      day: '2-digit', month: '2-digit', year: 'numeric',
      ...(options.includeTime === false ? {} : { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
      ...(options.timeZone ? { timeZone: options.timeZone } : {})
    };
    return new Intl.DateTimeFormat('ru-RU', dateOptions).format(date).replace(',', '');
  }

  function formatDueDate(value, options = {}) {
    const date = asDate(value);
    if (!date) return 'Без срока';
    const dateOptions = {
      day: 'numeric', month: 'long', year: 'numeric',
      ...(options.timeZone ? { timeZone: options.timeZone } : {})
    };
    const timeOptions = {
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      ...(options.timeZone ? { timeZone: options.timeZone } : {})
    };
    const dateLabel = new Intl.DateTimeFormat('ru-RU', dateOptions).format(date).replace(',', '');
    const timeLabel = new Intl.DateTimeFormat('ru-RU', timeOptions).format(date);
    return `${dateLabel} · ${timeLabel}`;
  }

  function setMessage(element, message, kind = 'error') {
    if (!element) return false;
    const value = String(message ?? '').trim();
    element.textContent = value;
    element.dataset.kind = kind;
    element.hidden = value.length === 0;
    return element.hidden;
  }

  return { formatDate, formatDueDate, setMessage };
});
