const CACHE_NAME='kod-student-assignment-shell-v7';
const SHELL_FILES=[
  'assignment.html',
  '../assets/course.js?v=account-ui-20261112',
  '../assets/app/theme.js?v=account-ui-20261112',
  '../assets/app/accounts/accounts.css?v=account-ui-20261112',
  '../assets/app/editor-loader.js?v=account-ui-20261112',
  '../assets/app/code-format.js?v=account-ui-20261112',
  '../assets/app/accounts/ui-utils.js?v=account-ui-20261112',
  '../assets/app/accounts/ui-strings.js?v=account-ui-20261112',
  '../assets/app/accounts/common.js?v=account-ui-20261112',
  '../assets/app/accounts/profile-settings.js?v=account-ui-20261112',
  '../assets/app/accounts/assignment.js?v=account-ui-20261112',
  '../assets/vendor/code-editor.js?v=account-ui-20261112'
];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE_NAME);await cache.addAll(SHELL_FILES.map(file=>new URL(file,self.registration.scope)));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('kod-student-assignment-shell-')&&key!==CACHE_NAME).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url),scope=new URL(self.registration.scope);
  if(request.method!=='GET'||url.origin!==scope.origin||url.pathname.startsWith('/api/'))return;
  if(url.pathname===new URL('assignment.html',scope).pathname&&request.mode==='navigate'){
    event.respondWith((async()=>{try{const response=await fetch(request);const cache=await caches.open(CACHE_NAME);await cache.put(new URL('assignment.html',scope),response.clone());return response;}catch{return await caches.match(new URL('assignment.html',scope))||Response.error();}})());return;
  }
  if(url.pathname.startsWith(new URL('../assets/',scope).pathname))event.respondWith(caches.match(request).then(response=>response||fetch(request)));
});
