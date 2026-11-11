(() => {
  const target = document.querySelector('[data-teacher-contact]');
  if (!target) return;
  fetch('/api/public/privacy-contact', { headers: { accept: 'application/json' } })
    .then(response => response.ok ? response.json() : null)
    .then(data => { if (data?.contact) target.textContent = data.contact; })
    .catch(() => {});
})();
