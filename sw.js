/* 双休购 Service Worker：静态资源离线缓存，网络图片运行时缓存 */
const CACHE_STATIC = 'sxg-static-v7';
const CACHE_IMG = 'sxg-img-v7';

const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/data2.js',
  './js/data3.js',
  './js/data4.js',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './img/hero.jpg', './img/digital.jpg', './img/appliance.jpg', './img/software.jpg',
  './img/fashion.jpg', './img/beauty.jpg', './img/food.jpg', './img/baby.jpg',
  './img/home.jpg', './img/auto.jpg', './img/books.jpg', './img/game.jpg',
  './img/ecommerce.jpg', './img/education.jpg', './img/travel.jpg', './img/b2b.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_STATIC).then(c => c.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => ![CACHE_STATIC, CACHE_IMG].includes(k)).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // 图片：仅处理同源图片与指定图床；外站 logo（如 clearbit）不拦截，
  // 让其失败时触发 <img onerror> 回退为字母头像，避免缓存污染的占位图
  const isOurImg = e.request.destination === 'image' && url.origin === location.origin;
  const isImgBed = url.hostname.includes('trae-api-cn');
  if (isOurImg || isImgBed) {
    e.respondWith(
      caches.match(e.request).then(hit => {
        if (hit) return hit;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_IMG).then(c => c.put(e.request, clone));
          }
          return res;
        }).catch(() => caches.match('./icons/icon-192.png'));
      })
    );
    return;
  }

  // 静态资源走「网络优先，离线回退缓存」
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && url.origin === location.origin) {
        const clone = res.clone();
        caches.open(CACHE_STATIC).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() =>
      caches.match(e.request).then(hit =>
        hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())
      )
    )
  );
});
