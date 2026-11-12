(() => {
  const A = window.CourseAccounts;
  const form = document.querySelector('[data-setup-form]');
  if (!A || !form) return;
  const message = document.querySelector('[data-setup-message]');
  const submit = form.querySelector('[type="submit"]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    A.setMessage(message, '');
    submit.disabled = true;
    submit.textContent = 'Создаём аккаунт…';
    try {
      await A.api('/api/auth/setup', {
        method: 'POST',
        body: JSON.stringify({
          full_name: form.elements.full_name.value,
          login: form.elements.login.value,
          password: form.elements.password.value,
          setup_token: form.elements.setup_token.value
        })
      });
      form.hidden = true;
      A.setMessage(message, 'Аккаунт создан. Теперь войдите с выбранными логином и паролем.', 'success');
      const link = document.createElement('a');
      link.className = 'account-button';
      link.href = '/login.html';
      link.textContent = 'Перейти ко входу';
      message.after(link);
    } catch (error) {
      A.setMessage(message, error.message);
      submit.disabled = false;
      submit.textContent = 'Создать аккаунт';
    }
  });
})();
