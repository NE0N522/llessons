(() => {
  const variants=[['primary','Основная'],['secondary','Вторичная'],['ghost','Без фона'],['danger','Опасное действие'],['ghost-danger','Опасное меню']];
  const sizes=[['sm','Малая · 32'],['md','Средняя · 40'],['lg','Крупная · 48']];
  const states=[['default','Обычная'],['disabled','Недоступна'],['loading','Загрузка']];
  document.querySelectorAll('[data-button-matrix]').forEach(matrix=>{
    matrix.innerHTML=variants.map(([variant,label])=>`<section class="account-button-variant"><h3>${label}</h3>${sizes.map(([size,sizeLabel])=>`<div class="account-button-size"><strong>${sizeLabel}</strong><div>${states.map(([state,stateLabel])=>{const extra=size==='md'?'':` btn--${size}`,kind=variant==='secondary'?' btn--secondary':variant==='ghost-danger'?' btn--ghost btn--ghost-danger':` btn--${variant}`,stateClass=state==='loading'?' is-loading':'',disabled=state==='disabled'||state==='loading'?' disabled':'',busy=state==='loading'?' aria-busy="true"':'';return `<button class="btn${kind}${extra}${stateClass}" type="button"${disabled}${busy}>${state==='loading'?'Загрузка':stateLabel}</button>`;}).join('')}</div></div>`).join('')}</section>`).join('');
  });
  document.querySelector('[data-kit-toast]')?.addEventListener('click',()=>CourseAccounts.toast('Изменения сохранены.'));
  document.querySelector('[data-kit-confirm]')?.addEventListener('click',()=>CourseAccounts.confirmDialog({title:'Опубликовать задание?',message:'Задание станет видно ученикам выбранного класса.',confirmLabel:'Опубликовать'}));
  document.querySelector('[data-kit-error-button]')?.addEventListener('click',()=>CourseAccounts.showLoadError(document.querySelector('[data-kit-error]'),new Error('Проверьте подключение к сети.'),async()=>CourseAccounts.toast('Загрузка повторена.')));
  document.querySelector('[data-kit-offline]')?.addEventListener('click',()=>{const banner=document.querySelector('.account-offline-banner');banner.hidden=false;});
})();
