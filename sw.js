const CACHE = 'aktubu-v5';
const FILES = ['./', './index.html', './manifest.webmanifest', './fonts/amiri-Regular.woff', './fonts/amiri-Bold.woff', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  if (/\/fonts\//.test(url.pathname)) { e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))); return; }
  const nav = e.request.mode === 'navigate' || /\.html?$|\/$/.test(url.pathname);
  const fresh = nav ? new Request(e.request.url, {cache: 'no-cache'}) : e.request;
  e.respondWith(fetch(fresh).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; })
    .catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || (nav ? caches.match('./index.html') : Response.error()))));
});
