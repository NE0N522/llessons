const SHELL_CACHE='kod-course-offline-shell-v12';
const APP_SHELL=[
  '/lesson-view.html','/student/assignment.html',
  '/assets/course.js','/assets/app/theme.js','/assets/app/accounts/nav.js','/assets/app/editor-loader.js?v=editor-shortcuts-20261112',
  '/assets/app/lesson-v3.css','/assets/app/theme-v3.css','/assets/app/design-tokens.css?v=course-design-20261114-flex-pilot-a11y','/assets/app/accounts/accounts.css?v=account-ui-20261112',
  '/assets/fonts/noto-sans-cyrillic-ext.woff2','/assets/fonts/noto-sans-cyrillic.woff2','/assets/fonts/noto-sans-latin.woff2',
  '/assets/fonts/noto-sans-mono-cyrillic-ext.woff2','/assets/fonts/noto-sans-mono-cyrillic.woff2','/assets/fonts/noto-sans-mono-latin.woff2',
  '/assets/app/code-format.js','/assets/app/playground.js','/assets/app/flex-lab.js','/assets/app/progress.js','/assets/app/lesson-notes.js','/assets/app/lesson-view.js',
  '/assets/lessons/lesson-29.js',
  '/assets/app/accounts/ui-utils.js?v=account-ui-20261112','/assets/app/accounts/ui-strings.js?v=account-ui-20261112','/assets/app/accounts/common.js?v=account-ui-20261112','/assets/app/accounts/profile-settings.js?v=account-ui-20261112','/assets/app/accounts/assignment.js?v=account-ui-20261112','/assets/vendor/code-editor.js?v=account-ui-20261112'
];
const APP_PAGES=new Set(['/lesson-view.html','/student/assignment.html']);
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(SHELL_CACHE);await cache.addAll(APP_SHELL.map(path=>new URL(path,self.location.origin)));await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('kod-course-offline-shell-')&&key!==SHELL_CACHE).map(key=>caches.delete(key)));await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
  if(request.mode==='navigate'&&APP_PAGES.has(url.pathname)){
    event.respondWith((async()=>{try{const response=await fetch(request);const cache=await caches.open(SHELL_CACHE);await cache.put(url.pathname,response.clone());return response;}catch{return await caches.match(url.pathname)||Response.error();}})());return;
  }
  if(/^\/assets\/lessons\/lesson-\d+\.js$/.test(url.pathname)){
    event.respondWith((async()=>{const cached=await caches.match(request);try{const response=await fetch(request);if(response.ok){const cache=await caches.open(SHELL_CACHE);await cache.put(request,response.clone());}return response;}catch{return cached||Response.error();}})());return;
  }
  if(url.pathname==='/assets/app/accounts/teacher-reports.js'||url.pathname==='/assets/vendor/classroom-tools.js'){
    event.respondWith((async()=>{const cached=await caches.match(request);try{const response=await fetch(request);if(response.ok){const cache=await caches.open(SHELL_CACHE);await cache.put(request,response.clone());}return response;}catch{return cached||Response.error();}})());return;
  }
  if(url.pathname.startsWith('/assets/'))event.respondWith(caches.match(request).then(response=>response||fetch(request)));
});
