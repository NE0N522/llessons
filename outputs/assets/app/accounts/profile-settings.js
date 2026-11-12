(() => {
  if (window.CourseProfileSettingsLoaded) return;
  window.CourseProfileSettingsLoaded = true;
  const A = window.CourseAccounts;
  if (!A) return;
  const esc = A.escapeHtml;
  const themes = { ocean: 'Океан', lavender: 'Лаванда', sunset: 'Закат', forest: 'Лес', graphite: 'Графит' };
  const initials = name => A.initials(name || '');

  function imageUrl(value) {
    if (!value || !/^https:\/\//i.test(value)) return value;
    try { return new URL(value).hostname === 'res.cloudinary.com' ? value.replace('/image/upload/', '/image/upload/c_fill,g_face,w_240,h_240,f_auto,q_auto/') : value; } catch { return value; }
  }
  function checkImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Изображение не открылось. Проверь ссылку или выбери другой файл.'));
      image.referrerPolicy = 'no-referrer';
      image.src = url;
    });
  }
  async function upload(file, status) {
    const signed = await A.api('/api/auth/cloudinary-avatar-signature', { method: 'POST', body: JSON.stringify({}) });
    const data = new FormData();
    for (const key of ['timestamp', 'public_id', 'overwrite', 'api_key', 'signature']) data.append(key, signed[key]);
    data.append('file', file);
    status.textContent = 'Загружаю фото…';
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloud_name)}/image/upload`, { method: 'POST', body: data });
    let result = {};
    try { result = await response.json(); } catch { /* Cloudinary returned no JSON. */ }
    if (!response.ok || !result.secure_url || !result.public_id) throw new Error(result.error?.message || 'Cloudinary не принял изображение. Попробуй ещё раз.');
    return { url: result.secure_url, publicId: result.public_id };
  }

  function open(user) {
    const old = document.querySelector('[data-profile-editor]');
    old?.remove();
    const dialog = document.createElement('dialog');
    dialog.className = 'account-dialog account-profile-dialog';
    dialog.dataset.profileEditor = '';
    const selectedTheme = themes[user.profile_theme] ? user.profile_theme : 'ocean';
    dialog.innerHTML = `<form method="dialog" class="account-dialog-inner"><div class="account-eyebrow">НАСТРОЙКИ ПРОФИЛЯ</div><h2>Фото и оформление</h2><div class="account-profile-editor-preview"><span data-avatar-preview data-theme="${selectedTheme}">${user.avatar_url ? `<img src="${esc(imageUrl(user.avatar_url))}" alt="" referrerpolicy="no-referrer">` : esc(initials(user.full_name))}</span><div><strong>${esc(user.full_name)}</strong><p class="account-muted">Без фото показываем инициалы.</p></div></div><div class="account-dialog-form"><label>Ссылка на картинку<input type="url" data-avatar-url maxlength="2048" placeholder="https://…" value="${esc(user.avatar_url || '')}" autocomplete="url"><small>Нужна прямая HTTPS-ссылка на изображение. Предпросмотр сразу покажет, открывается ли она.</small></label><label>Или загрузи фото<input type="file" data-avatar-file accept="image/png,image/jpeg,image/webp"><small>PNG, JPG или WebP, до 5 МБ. Файл хранится в Cloudinary.</small></label><label>Цвет профиля<select data-profile-theme>${Object.entries(themes).map(([value, label]) => `<option value="${value}" ${selectedTheme === value ? 'selected' : ''}>${label}</option>`).join('')}</select></label><label>Короткий статус<input data-profile-status maxlength="80" value="${esc(user.profile_status || '')}" placeholder="Например, изучаю CSS"></label><div class="account-profile-editor-status" data-avatar-status role="status" aria-live="polite">Предпросмотр использует ссылку только в этом окне.</div><button type="button" class="account-small-button account-small-button-danger" data-remove-avatar>Убрать фото</button></div><div class="account-dialog-actions"><button type="button" class="account-button account-button-secondary" data-profile-cancel>Отмена</button><button type="submit" class="account-button" data-profile-save>Сохранить</button></div></form>`;
    document.body.append(dialog);
    const form = dialog.querySelector('form'), urlInput = dialog.querySelector('[data-avatar-url]'), fileInput = dialog.querySelector('[data-avatar-file]'), preview = dialog.querySelector('[data-avatar-preview]'), status = dialog.querySelector('[data-avatar-status]'), themeInput = dialog.querySelector('[data-profile-theme]');
    let imageOkay = !user.avatar_url, filePreviewUrl = '';
    const initialImage=preview.querySelector('img');if(initialImage){imageOkay=false;status.textContent='Проверяю сохранённую ссылку…';initialImage.onload=()=>{imageOkay=true;status.textContent='Предпросмотр готов. Изображение открывается.';};initialImage.onerror=()=>{imageOkay=false;status.textContent='Сохранённая ссылка больше не открывает изображение.';};}
    const showImage = (url) => {
      preview.replaceChildren();
      const image = document.createElement('img'); image.width = 56; image.height = 56; image.src = url; image.alt = ''; image.referrerPolicy = 'no-referrer'; preview.append(image);
      image.onload = () => { imageOkay = true; status.textContent = 'Предпросмотр готов. Изображение открывается.'; };
      image.onerror = () => { imageOkay = false; status.textContent = 'Не удалось открыть изображение. Проверь ссылку.'; };
    };
    const resetPreview = () => { preview.textContent = initials(user.full_name); imageOkay = true; status.textContent = 'Фото удалится после сохранения. Будут показаны инициалы.'; };
    themeInput.addEventListener('change', () => { preview.dataset.theme = themeInput.value; });
    urlInput.addEventListener('input', () => {
      fileInput.value = '';
      if (!urlInput.value.trim()) { resetPreview(); return; }
      if (!/^https:\/\//i.test(urlInput.value.trim())) { imageOkay = false; preview.replaceChildren();preview.textContent=initials(user.full_name);status.textContent = 'Ссылка должна начинаться с https://.'; return; }
      imageOkay = false; status.textContent = 'Проверяю ссылку…'; showImage(urlInput.value.trim());
    });
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0]; if (!file) return;
      urlInput.value = '';
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { fileInput.value = ''; imageOkay = false; status.textContent = 'Выбери PNG, JPG или WebP размером до 5 МБ.'; return; }
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
      filePreviewUrl = URL.createObjectURL(file); imageOkay = false; status.textContent = 'Проверяю файл…'; showImage(filePreviewUrl);
    });
    dialog.querySelector('[data-remove-avatar]').addEventListener('click', () => { urlInput.value = ''; fileInput.value = ''; resetPreview(); });
    dialog.querySelector('[data-profile-cancel]').addEventListener('click', () => dialog.close());
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const button = dialog.querySelector('[data-profile-save]'); button.disabled = true;
      try {
        let avatarUrl = urlInput.value.trim(), avatarPublicId = user.avatar_public_id && avatarUrl === user.avatar_url ? user.avatar_public_id : '';
        if (fileInput.files?.[0]) { const uploaded = await upload(fileInput.files[0], status); avatarUrl = uploaded.url; avatarPublicId = uploaded.publicId; }
        if (avatarUrl) {
          if (!/^https:\/\//i.test(avatarUrl)) throw new Error('Ссылка должна начинаться с https://.');
          if (!imageOkay) { await checkImage(avatarUrl); imageOkay = true; }
        }
        status.textContent = 'Сохраняю профиль…';
        const saved = await A.api('/api/auth/profile', { method: 'PATCH', body: JSON.stringify({ avatar_url: avatarUrl, avatar_public_id: avatarPublicId, profile_theme: themeInput.value, profile_status: dialog.querySelector('[data-profile-status]').value.trim() }) });
        user = { ...user, ...saved };
        A.paintProfileAvatar?.(user);
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: user }));
        dialog.close();
        A.toast('Настройки профиля сохранены.', 'success');
      } catch (error) { status.textContent = error.message; button.disabled = false; }
    });
    dialog.addEventListener('close', () => { if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl); dialog.remove(); });
    dialog.showModal();
  }

  document.addEventListener('click', async event => {
    if (!event.target.closest('[data-profile-settings]')) return;
    try { open(await A.currentUser()); } catch (error) { A.toast(error.message, 'error'); }
  });
})();
