(() => {
  document.querySelector('[data-kit-toast]')?.addEventListener('click',()=>CourseAccounts.toast('Изменения сохранены.'));
  document.querySelector('[data-kit-confirm]')?.addEventListener('click',()=>CourseAccounts.confirmDialog({title:'Опубликовать задание?',message:'Задание станет видно ученикам выбранного класса.',confirmLabel:'Опубликовать'}));
  document.querySelector('[data-kit-error-button]')?.addEventListener('click',()=>CourseAccounts.showLoadError(document.querySelector('[data-kit-error]'),new Error('Проверьте подключение к сети.'),async()=>CourseAccounts.toast('Загрузка повторена.')));
  document.querySelector('[data-kit-offline]')?.addEventListener('click',()=>{const banner=document.querySelector('.account-offline-banner');banner.hidden=false;});
})();
