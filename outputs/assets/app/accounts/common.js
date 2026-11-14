(() => {
  const iconPaths={
    plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',check:'<path d="m5 12 4 4L19 6"/>',x:'<path d="m18 6-12 12M6 6l12 12"/>',
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>',trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/>',
    copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    'arrow-left':'<path d="m12 19-7-7 7-7M5 12h14"/>','arrow-right':'<path d="M5 12h14m-7-7 7 7-7 7"/>',
    'chevron-down':'<path d="m6 9 6 6 6-6"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    'log-out':'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5m5 5H9"/>',
    user:'<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/>',image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
    moon:'<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert:'<path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/>',send:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    save:'<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5.5 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.5-3"/>',
    'more-horizontal':'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    filter:'<path d="M4 7h16M7 12h10m-7 5h4"/>',calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    'file-code':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M10 13l-2 2 2 2m4-4 2 2-2 2"/>',
    'book-open':'<path d="M12 7v14m0-14C10 5 7 4 3 4v14c4 0 7 1 9 3m0-14c2-2 5-3 9-3v14c-4 0-7 1-9 3"/>',
    'bar-chart':'<path d="M3 3v18h18"/><path d="M18 17V9m-5 8V5m-5 12v-4"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    'clipboard-check':'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M8 13l2.5 2.5L16 10"/>'
  };
  function installIconSprite(){
    if(document.getElementById('account-icon-sprite'))return;
    const sprite=document.createElementNS('http://www.w3.org/2000/svg','svg');sprite.id='account-icon-sprite';sprite.setAttribute('aria-hidden','true');sprite.setAttribute('focusable','false');sprite.classList.add('account-icon-sprite');
    sprite.innerHTML=Object.entries(iconPaths).map(([name,paths])=>`<symbol id="account-icon-${name}" viewBox="0 0 24 24">${paths}</symbol>`).join('');document.body.prepend(sprite);
  }
  function icon(name,className=''){return `<svg class="account-icon${className?` ${className}`:''}" aria-hidden="true" focusable="false"><use href="#account-icon-${name}"></use></svg>`;}
  function setButtonLoading(button,loading=true,label){
    if(!button)return;
    if(loading){if(!button.dataset.idleHtml)button.dataset.idleHtml=button.innerHTML;button.disabled=true;button.setAttribute('aria-busy','true');button.classList.add('is-loading');if(label)button.dataset.loadingLabel=label;}
    else{button.disabled=false;button.removeAttribute('aria-busy');button.classList.remove('is-loading');if(button.dataset.idleHtml){button.innerHTML=button.dataset.idleHtml;delete button.dataset.idleHtml;}delete button.dataset.loadingLabel;}
  }
  installIconSprite();
  const escapeHtml=(value='')=>String(value).replace(/[&<>"']/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const fileMode=location.protocol==='file:';
  let wakeTimer=null,wakeStarted=0;
  function wakeScreen(show){
    let overlay=document.querySelector('[data-server-wake-screen]');
    if(show&&!overlay){overlay=document.createElement('div');overlay.className='account-wake-screen';overlay.dataset.serverWakeScreen='';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');overlay.innerHTML='<div class="account-wake-card"><span class="account-wake-spinner" aria-hidden="true"></span><strong>Сервер просыпается</strong><span>Обычно это занимает меньше минуты.</span><small data-wake-seconds>Прошло 0 секунд</small></div>';document.body.append(overlay);wakeStarted=Date.now();wakeTimer=window.setInterval(()=>{const seconds=Math.floor((Date.now()-wakeStarted)/1000),node=overlay.querySelector('[data-wake-seconds]');if(node)node.textContent=`Прошло ${seconds} секунд`;},1000);}
    if(!show&&overlay){overlay.remove();window.clearInterval(wakeTimer);wakeTimer=null;}
  }
  const wait=ms=>new Promise(resolve=>window.setTimeout(resolve,ms));
  async function api(url,options={}){
    const method=(options.method||'GET').toUpperCase();
    const headers=new Headers(options.headers||{});
    if(['POST','PUT','PATCH','DELETE'].includes(method))headers.set('Content-Type','application/json');
    let wakeShown=false,lastError=null;
    const slow=window.setTimeout(()=>{wakeShown=true;wakeScreen(true);},3000);
    try{
      for(let attempt=0;attempt<4;attempt++){
        const controller=new AbortController(),timeout=window.setTimeout(()=>controller.abort(new Error('Таймаут запроса.')),60000);
        try{
          const response=await fetch(url,{...options,method,headers,credentials:'same-origin',cache:'no-store',signal:controller.signal});
          let body={};try{body=await response.json()}catch{/* Unreadable response. */}
          if(response.ok)return body;
          const error=new Error(body.error||`Не удалось выполнить запрос (${response.status}).`);error.status=response.status;error.code=body.code;error.conflict=Boolean(body.conflict);error.server_draft=body.server_draft;error.draft_revision=body.draft_revision;error.payload=body;
          if(![429,500,502,503,504].includes(response.status)||attempt===3)throw error;
          lastError=error;
        }catch(error){
          if(error.status&&![429,500,502,503,504].includes(error.status))throw error;
          if(attempt===3)throw error;
          lastError=error;
        }finally{window.clearTimeout(timeout);}
        await wait(800*(2**attempt));
      }
      throw lastError||new Error('Не удалось подключиться к серверу.');
    }finally{window.clearTimeout(slow);if(wakeShown)wakeScreen(false);}
  }
  function formatDate(value,options={}){
    return window.CourseAccountUtils?.formatDate(value,options)??'—';
  }
  function formatDueDate(value,options={}){
    return window.CourseAccountUtils?.formatDueDate(value,options)??'Без срока';
  }
  function formatDescription(value=''){
    const escaped=escapeHtml(value);
    const blocks=escaped.split(/\n{2,}/).map(part=>{
      const inline=part.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
      const lines=inline.split('\n');
      if(lines.every(line=>/^[-*] /.test(line)))return `<ul>${lines.map(line=>`<li>${line.slice(2)}</li>`).join('')}</ul>`;
      return `<p>${lines.join('<br>')}</p>`;
    });
    return blocks.join('');
  }
  function setMessage(element,message,kind='error'){
    if(!element)return false;
    if(window.CourseAccountUtils)return window.CourseAccountUtils.setMessage(element,message,kind);
    const value=String(message??'').trim();element.textContent=value;element.dataset.kind=kind;element.hidden=!value;return element.hidden;
  }
  function redirectFor(user){
    if(user.must_change_password)return '/change-password.html';
    return user.role==='teacher'?'/teacher/index.html':'/student/index.html';
  }
  function previewDocument(html='',css=''){
    const policy="default-src 'none'; script-src 'none'; connect-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; media-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'";
    const baseStyles=':root{font-family:system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;color:#202b3a;background:#fff}*{box-sizing:border-box}body{min-height:100vh;margin:0;padding:16px;font:16px/1.5 system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",sans-serif;color:#202b3a;background:#fff}button,input,select,textarea{font:inherit}button{min-height:40px;padding:8px 14px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;color:#202b3a}img,iframe,video{max-width:100%}';
    return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${baseStyles}\n${String(css||'')}</style></head><body>${String(html||'')}</body></html>`;
  }
  function showPreview(frame,html,css){
    frame.setAttribute('sandbox','');
    frame.setAttribute('referrerpolicy','no-referrer');
    frame.srcdoc=previewDocument(html,css);
  }
  function evaluateChecks(html='',css='',checks=[],sourceDocument=null,styleWindow=null){
    const documentTree=sourceDocument||new DOMParser().parseFromString(String(html||''),'text/html');let rules=[];
    try{const sheet=new CSSStyleSheet();sheet.replaceSync(String(css||''));rules=[...sheet.cssRules];}catch{/* If the browser cannot parse a stylesheet, style checks will fail safely. */}
    const findRules=list=>list.flatMap(rule=>rule.cssRules?findRules([...rule.cssRules]):rule.style?[rule]:[]);
    const styleRules=findRules(rules);
    return (Array.isArray(checks)?checks:[]).map(check=>{
      const label=String(check.label||check.selector||'Проверка'),selector=String(check.selector||'');let elements=[];try{elements=[...documentTree.querySelectorAll(selector)];}catch{/* Invalid CSS selector means this condition has not passed. */}
      let passed=false;
      if(check.type==='exists')passed=elements.length>0;
      else if(check.type==='alt')passed=elements.length>0&&elements.every(element=>element.hasAttribute('alt')&&element.getAttribute('alt').trim().length>0);
      else if(check.type==='text')passed=elements.some(element=>element.textContent.includes(String(check.text||'')));
      else if(check.type==='count')passed=elements.length>=Number(check.min||0)&&(check.max==null||elements.length<=Number(check.max));
      else if(check.type==='style')passed=elements.some(element=>{let value='';try{value=styleWindow?.getComputedStyle(element).getPropertyValue(check.property).trim()||'';}catch{}if(!value){for(const rule of styleRules){try{if(element.matches(rule.selectorText)&&rule.style.getPropertyValue(check.property))value=rule.style.getPropertyValue(check.property).trim();}catch{/* Ignore selector forms unsupported by Element.matches. */}}}return value===String(check.value||'').trim();});
      else if(check.type==='link')passed=elements.some(element=>element.tagName==='A'&&element.hasAttribute('href')&&(!check.href||element.getAttribute('href')===check.href));
      else if(check.type==='semantic')passed=documentTree.querySelectorAll(check.tag||'main').length>0;
      else if(check.type==='no_inline')passed=documentTree.querySelectorAll('[style]').length===0;
      else if(check.type==='class_id')passed=[...documentTree.querySelectorAll('*')].some(element=>check.attribute==='id'?element.id===String(check.value||''):element.classList.contains(String(check.value||'')));
      return {label,passed};
    });
  }
  function toast(message,kind='success'){
    let element=document.querySelector('.account-toast');if(!element){element=document.createElement('div');element.className='account-toast';element.setAttribute('role','status');element.setAttribute('aria-live','polite');document.body.append(element);}element.textContent=message;element.dataset.kind=kind;clearTimeout(element._timer);element._timer=setTimeout(()=>element.remove(),3600);
  }
  function downloadCsv(filename,rows){
    const quote=value=>{let text=String(value??'').replace(/[\r\n]+/g,' ');if(/^[=+\-@\t]/.test(text))text=`'${text}`;return `"${text.replace(/"/g,'""')}"`;};
    const csv='\ufeff'+rows.map(row=>row.map(quote).join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function printCredentials(credentials){
    const popup=window.open('about:blank','_blank');if(!popup){toast('Разреши всплывающее окно, чтобы распечатать карточки.','error');return;}
    const pages=[];for(let index=0;index<credentials.length;index+=8)pages.push(credentials.slice(index,index+8));
    const pageMarkup=pages.map((page,pageIndex)=>`<section class="page"><div class="cards">${page.map(item=>`<article class="card"><div><h2>${escapeHtml(item.full_name)}</h2><p>Логин<br><code>${escapeHtml(item.login)}</code></p><p>Временный пароль<br><code>${escapeHtml(item.password)}</code></p><small>После входа задай новый пароль.</small></div><div class="qr"><img src="${escapeHtml(item.qr_url||'')}" alt="QR-код входа: логин ${escapeHtml(item.login)}"><small>QR ведёт на вход с этим логином.</small></div></article>`).join('')}</div>${pageIndex<pages.length-1?'<div class="page-number">Следующий лист</div>':''}</section>`).join('');
    popup.document.open();popup.document.write(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Карточки для входа</title><link rel="stylesheet" href="/assets/app/accounts/accounts.css?v=account-ui-20261114-account-redesign-v2"><link rel="stylesheet" href="/assets/app/design-tokens.css?v=course-design-20261114-flex-pilot-a11y"><link rel="stylesheet" href="/assets/app/components/button.css?v=account-ui-20261114-account-redesign-v2"><style>body{margin:20px}.toolbar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin:0 auto 18px;max-width:1000px}.toolbar p{max-width:680px}.page{max-width:1000px;margin:0 auto 28px}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(4,minmax(58mm,1fr));gap:7mm}.card{display:grid;grid-template-columns:minmax(0,1fr) 30mm;align-items:center;gap:5mm;min-height:58mm;padding:5mm;border:1px dashed var(--account-accent);border-radius:3mm;break-inside:avoid}.card h2{margin:0 0 2mm;font-size:14pt}.card p{margin:2mm 0;font-size:10pt}.card code{font-size:12pt;font-weight:750;overflow-wrap:anywhere}.card small{color:var(--account-muted);font-size:8pt}.qr{display:grid;justify-items:center;gap:1mm}.qr img{width:28mm;height:28mm;image-rendering:pixelated}.qr small{text-align:center}.page-number{display:none}@page{size:A4 portrait;margin:10mm}@media print{body{margin:0}.toolbar .btn{display:none}.page{margin:0;break-after:page}.page:last-child{break-after:auto}.cards{grid-template-rows:repeat(4,62mm);gap:4mm}.card{min-height:62mm}.page-number{display:block}}</style></head><body class="account-app-body"><header class="toolbar"><div><strong>Карточки для входа</strong><p>Передай карточку лично ученику. QR-код содержит только адрес входа и логин, не пароль.</p></div><button class="btn btn--primary" id="print">Распечатать</button></header><main>${pageMarkup}</main></body></html>`);popup.document.close();popup.document.getElementById('print').addEventListener('click',()=>popup.print());popup.opener=null;
  }
  function confirmDialog({title='Подтверди действие',message='',confirmLabel='Продолжить',cancelLabel='Отмена',danger=false}={}){
    return new Promise(resolve=>{
      const dialog=document.createElement('dialog');dialog.className='account-dialog account-confirm-dialog';dialog.setAttribute('aria-labelledby','account-confirm-title');
      const inner=document.createElement('div');inner.className='account-dialog-inner';
      const heading=document.createElement('h2');heading.id='account-confirm-title';heading.textContent=title;
      const copy=document.createElement('p');copy.className='account-muted';copy.textContent=message;
      const actions=document.createElement('div');actions.className='account-dialog-actions';
      const cancel=document.createElement('button');cancel.type='button';cancel.className='btn btn--sm btn--secondary';cancel.textContent=cancelLabel;
      const confirm=document.createElement('button');confirm.type='button';confirm.className=`btn ${danger?'btn--danger':'btn--primary'}`;confirm.textContent=confirmLabel;
      actions.append(cancel,confirm);inner.append(heading,copy,actions);dialog.append(inner);document.body.append(dialog);
      let settled=false;const finish=value=>{if(settled)return;settled=true;if(dialog.open)dialog.close();dialog.remove();resolve(value);};
      cancel.addEventListener('click',()=>finish(false));confirm.addEventListener('click',()=>finish(true));
      dialog.addEventListener('cancel',event=>{event.preventDefault();finish(false);});dialog.addEventListener('click',event=>{if(event.target===dialog)finish(false);});
      dialog.addEventListener('close',()=>finish(false),{once:true});dialog.showModal();cancel.focus();
    });
  }
  function showLoadError(container,error,retry){
    if(!container)return;
    container.replaceChildren();const section=document.createElement('section');section.className='account-empty account-error-state';section.setAttribute('role','alert');
    const heading=document.createElement('h2');heading.textContent='Не удалось загрузить данные';const copy=document.createElement('p');copy.textContent=error?.message||'Проверь подключение и попробуй ещё раз.';
    const button=document.createElement('button');button.type='button';button.className='btn btn--primary';button.textContent=window.CourseAccountStrings?.actions.retry||'Повторить загрузку';
    button.addEventListener('click',async()=>{setButtonLoading(button,true,'Загружаю…');try{await retry();}catch(nextError){showLoadError(container,nextError,retry);}});section.append(heading,copy,button);container.append(section);
  }
  function initials(name=''){
    return String(name).trim().split(/\s+/).slice(0,2).map(part=>part[0]||'').join('').toLocaleUpperCase('ru');
  }
  function bindTables(){
    const label=table=>{const headings=[...table.querySelectorAll('thead th')].map(cell=>cell.textContent.trim());for(const row of table.querySelectorAll('tbody tr'))[...row.cells].forEach((cell,index)=>{if(cell.tagName==='TD'&&headings[index])cell.dataset.label=headings[index];});};
    document.querySelectorAll('.account-table').forEach(label);
    new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;if(node.matches?.('.account-table'))label(node);node.querySelectorAll?.('.account-table').forEach(label);const table=node.closest?.('.account-table');if(table)label(table);}))).observe(document.body,{childList:true,subtree:true});
  }
  function installMobileNav(){
    if(!document.body.classList.contains('account-app-body')||document.querySelector('.account-mobile-nav'))return;
    const labels=window.CourseAccountStrings?.navigation||{course:'Курс',classes:'Классы',assignments:'Задания',profile:'Профиль'};
    const path=location.pathname;let links=[];
    if(path.includes('/teacher/'))links=[['/index.html',labels.course,'book-open'],['/teacher/index.html',labels.classes,'users']];
    else links=[['/index.html',labels.course,'book-open'],['/student/index.html',labels.assignments,'file-code'],['/student/profile.html',labels.profile,'user']];
    const nav=document.createElement('nav');nav.className='account-mobile-nav';nav.setAttribute('aria-label','Основная навигация');
    for(const [href,label,iconName] of links){const link=document.createElement('a');link.href=href;link.innerHTML=`${icon(iconName)}<span>${label}</span>`;if(location.pathname===href||(label==='Задания'&&path.endsWith('/assignment.html'))){link.setAttribute('aria-current','page');}nav.append(link);}
    document.body.append(nav);
  }
  function installAuthThemeControl(){
    if(!document.body.classList.contains('account-body')||document.querySelector('[data-theme-toggle]'))return;
    const button=document.createElement('button');button.type='button';button.className='btn btn--icon btn--ghost account-theme-toggle account-auth-theme';button.dataset.themeToggle='';button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','Тёмная тема');button.title='Переключить тему';
    button.innerHTML='<span class="theme-toggle-icon" data-theme-icon aria-hidden="true"></span><span data-theme-label>Тёмная тема</span>';document.body.append(button);
  }
  function installOfflineBanner(){
    const banner=document.createElement('div');banner.className='account-offline-banner';banner.setAttribute('role','status');banner.setAttribute('aria-live','polite');
    const text=document.createElement('span');text.textContent='Нет подключения к интернету. Изменения не отправятся, пока связь не восстановится.';
    const retry=document.createElement('button');retry.type='button';retry.className='btn btn--secondary';retry.textContent='Повторить';retry.addEventListener('click',()=>location.reload());
    banner.append(text,retry);document.body.append(banner);const update=()=>{banner.hidden=navigator.onLine;};window.addEventListener('online',update);window.addEventListener('offline',update);update();
  }
  function installOverflowMenus(){
    document.addEventListener('click',event=>{for(const menu of document.querySelectorAll('.account-overflow-menu[open]'))if(!menu.contains(event.target))menu.open=false;});
    document.addEventListener('click',event=>{for(const menu of document.querySelectorAll('.account-profile-menu[open]')){if(!menu.contains(event.target)||event.target.closest('[data-profile-settings],[data-owner-backup],[data-logout]'))menu.open=false;}});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'){const menu=document.querySelector('.account-overflow-menu[open],.account-profile-menu[open]');if(menu){menu.open=false;menu.querySelector('summary')?.focus();}}});
  }
  function skeletonMarkup(lines=3){return `<div class="account-skeleton" aria-hidden="true">${Array.from({length:lines},(_,index)=>`<span class="account-skeleton-line account-skeleton-line-${index+1}"></span>`).join('')}</div>`;}
  function installInitialSkeletons(){
    for(const selector of ['[data-class-grid]','[data-assignment-list]','[data-assignment-root]','[data-profile-root]']){const container=document.querySelector(selector);if(container&&!container.children.length)container.innerHTML=skeletonMarkup(3);}
  }
  function decorateStatus(node){
    if(!node?.matches?.('.account-status[data-status]')||node.querySelector('.account-icon'))return;
    const icons={accepted:'check',submitted:'clock',returned:'alert',draft:'edit',not_started:'book-open',not_submitted:'clock'};
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('account-icon');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href',`#account-icon-${icons[node.dataset.status]||'info'}`);svg.append(use);node.prepend(svg);
  }
  function installStatusIcons(){
    document.querySelectorAll('.account-status[data-status]').forEach(decorateStatus);
    new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;decorateStatus(node);node.querySelectorAll?.('.account-status[data-status]').forEach(decorateStatus);}))).observe(document.body,{childList:true,subtree:true});
  }
  installMobileNav();installAuthThemeControl();installOfflineBanner();installOverflowMenus();bindTables();installInitialSkeletons();installStatusIcons();
  async function currentUser(){return (await api('/api/auth/me')).user;}
  function paintProfileAvatar(user){
    document.querySelectorAll('[data-user-avatar]').forEach(node=>{
      node.replaceChildren();
      if(user?.avatar_url){const image=document.createElement('img');image.width=36;image.height=36;let imageSource=user.avatar_url;try{const parsed=new URL(imageSource);if(parsed.hostname==='res.cloudinary.com')imageSource=imageSource.replace('/image/upload/','/image/upload/c_fill,g_face,w_240,h_240,f_auto,q_auto/');}catch{}image.src=imageSource;image.alt='';image.loading='lazy';image.referrerPolicy='no-referrer';image.onerror=()=>{node.replaceChildren();node.textContent=initials(user.full_name);};node.append(image);}
      else node.textContent=initials(user?.full_name||'');
      node.dataset.theme=user?.profile_theme||'ocean';
    });
  }
  function setupProfileTrigger(user){
    document.querySelectorAll('[data-user-name]').forEach((name,index)=>{
      name.textContent=user.full_name;
      if(!name.id)name.id=`account-user-name-${index+1}`;
      const summary=name.closest('.account-profile-trigger');
      if(summary){summary.removeAttribute('aria-labelledby');if(getComputedStyle(name).display==='none')summary.setAttribute('aria-label',`${initials(user.full_name)}, ${user.full_name}`);else summary.removeAttribute('aria-label');summary.title=user.full_name;}
    });
    paintProfileAvatar(user);
  }
  async function guard(role){
    if(fileMode){location.replace('/login.html');return null;}
    try{const user=await currentUser();if(user.must_change_password){location.replace('/change-password.html');return null;}if(role&&user.role!==role){location.replace(redirectFor(user));return null;}try{localStorage.setItem('course-offline-user-v1',JSON.stringify({id:user.id,role:user.role,full_name:user.full_name,is_owner:user.is_owner,must_change_password:false,cached_at:Date.now()}));}catch{}setupProfileTrigger(user);document.querySelectorAll('[data-logout]').forEach(button=>{if(button.dataset.logoutReady!=='true'){button.dataset.logoutReady='true';button.addEventListener('click',logout);}});document.querySelectorAll('[data-owner-backup]').forEach(button=>{button.hidden=!user.is_owner;if(user.is_owner&&button.dataset.backupReady!=='true'){button.dataset.backupReady='true';button.addEventListener('click',()=>{toast('Резервная копия содержит персональные данные. Храни её в защищённом месте.','error');location.href='/api/teacher/backup';});}});return user;}
    catch{if(!navigator.onLine){try{const cached=JSON.parse(localStorage.getItem('course-offline-user-v1')||'null');if(cached?.id&&(!role||cached.role===role)){document.querySelectorAll('[data-user-name]').forEach(el=>el.textContent=cached.full_name||'Ученик');toast('Офлайн-режим: доступен сохранённый черновик.','error');return cached;}}catch{}}location.replace('/login.html');return null;}
  }
  async function logout(){try{localStorage.removeItem('course-offline-user-v1');await api('/api/auth/logout',{method:'POST',body:JSON.stringify({})});}finally{location.replace('/login.html');}}
  window.CourseAccounts={api,escapeHtml,formatDate,formatDueDate,formatDescription,setMessage,redirectFor,previewDocument,showPreview,evaluateChecks,currentUser,guard,logout,fileMode,toast,downloadCsv,printCredentials,confirmDialog,showLoadError,initials,paintProfileAvatar,skeletonMarkup,icon,setButtonLoading,strings:window.CourseAccountStrings||{}};
  document.querySelectorAll('[data-logout]').forEach(button=>{button.dataset.logoutReady='true';button.addEventListener('click',logout);});
})();
