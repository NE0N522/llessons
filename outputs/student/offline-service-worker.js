const CACHE_NAME='kod-student-assignment-shell-v2';
const SHELL_FILES=[
  'assignment.html',
  '../assets/course.js',
  '../assets/app/theme.js',
  '../assets/app/lesson-v3.css',
  '../assets/app/theme-v3.css',
  '../assets/app/accounts/theme.css',
  '../assets/app/accounts/accounts.css',
  '../assets/app/accounts/stage5.css',
  '../assets/app/editor-loader.js',
  '../assets/app/code-format.js',
  '../assets/app/accounts/ui-utils.js',
  '../assets/app/accounts/ui-strings.js',
  '../assets/app/accounts/common.js',
  '../assets/app/accounts/assignment.js',
  '../assets/vendor/code-editor.js'
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
