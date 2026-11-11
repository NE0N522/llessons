(() => {
  const A=window.CourseAccounts,form=document.querySelector('[data-change-password]');if(!A||!form)return;
  const message=form.querySelector('[data-message]');
  A.currentUser().then(user=>{document.querySelectorAll('[data-user-name]').forEach(el=>el.textContent=user.full_name);}).catch(()=>location.replace('/login.html'));
  form.addEventListener('submit',async event=>{event.preventDefault();const submit=form.querySelector('[type="submit"]');A.setMessage(message,'');
    if(form.elements.new_password.value!==form.elements.confirm_password.value){A.setMessage(message,'Новые пароли не совпадают.');return;}
    submit.disabled=true;try{await A.api('/api/auth/password',{method:'POST',body:JSON.stringify({current_password:form.elements.current_password.value,new_password:form.elements.new_password.value})});const user=await A.currentUser();location.replace(user.role==='teacher'?'/teacher/index.html':'/student/index.html');}
    catch(error){A.setMessage(message,error.message);submit.disabled=false;}
  });
})();
