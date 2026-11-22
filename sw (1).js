/* Service Worker — المنار */
const CACHE='manar-v1';
const ASSETS=[
  './almanar-updated.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()).catch(()=>{}));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  // لا تخزّن Firebase أو CDN
  if(url.hostname.includes('firebase')||url.hostname.includes('googleapis')||url.hostname.includes('gstatic')||url.hostname.includes('cdnjs')||url.hostname.includes('jsdelivr'))return;
  e.respondWith(
    caches.match(req).then(cached=>{
      const net=fetch(req).then(res=>{
        try{
          if(res&&res.ok&&url.origin===self.location.origin){
            const copy=res.clone();
            caches.open(CACHE).then(c=>c.put(req,copy)).catch(()=>{});
          }
        }catch(_){}
        return res;
      }).catch(()=>cached);
      return cached||net;
    })
  );
});
