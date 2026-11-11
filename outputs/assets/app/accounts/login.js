(() => {
  const A=window.CourseAccounts,form=document.querySelector('[data-login-form]');
  if(!A||!form)return;
  const message=form.querySelector('[data-login-message]'),serverNote=document.querySelector('[data-server-message]'),submit=form.querySelector('[type="submit"]');
  if(A.fileMode){serverNote.hidden=false;form.hidden=true;return;}
  const toggle=form.querySelector('[data-password-toggle]');
  toggle.addEventListener('click',()=>{const input=form.elements.password;const visible=input.type==='password';input.type=visible?'text':'password';toggle.textContent=visible?'Скрыть':'Показать';toggle.setAttribute('aria-label',visible?'Скрыть пароль':'Показать пароль');input.focus();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();A.setMessage(message,'');submit.disabled=true;submit.textContent='Проверяю…';
    try{const result=await A.api('/api/auth/login',{method:'POST',body:JSON.stringify({login:form.elements.login.value,password:form.elements.password.value,remember:form.elements.remember.checked})});location.replace(A.redirectFor(result.user));}
    catch(error){A.setMessage(message,error.message);submit.disabled=false;submit.innerHTML='Войти <span aria-hidden="true">→</span>';}
  });
})();
