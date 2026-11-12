(() => {
  const link=document.querySelector('[data-account-nav]');
  if(!link||location.protocol==='file:')return;
  link.hidden=false;
  link.href='/login.html';
  link.textContent='Войти';
  fetch('/api/auth/status',{credentials:'same-origin',cache:'no-store'}).then(async response=>{
    const user=response.ok?(await response.json()).user:null;
    if(user){link.href=user.must_change_password?'/change-password.html':user.role==='teacher'?'/teacher/index.html':'/student/index.html';link.textContent=user.must_change_password?'Сменить пароль':'Мой кабинет';}
    else{link.href='/login.html';link.textContent='Войти';}
  }).catch(()=>{});
})();
