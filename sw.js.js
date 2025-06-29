// เปลี่ยนชื่อ Cache เพื่อบังคับให้เบราว์เซอร์ติดตั้ง Service Worker ใหม่
const CACHE_NAME = 'juckmanphai-pwa-cache-v5'; // อัปเดตเวอร์ชันเป็น v5

// [สำคัญ] เพิ่ม './06.html' และไฟล์อื่นๆ ที่อาจเกี่ยวข้องลงในลิสต์นี้
const urlsToCache = [
  './',
  './01.html',
  './02.html', 
  './03.html', 
  './04.html',
  './05.html',
  './06.html', // <-- เพิ่มไฟล์นี้เข้ามา
  './07.html',
  './08.html',
  './10.html',
  './14.html',
  './15.html',
  './16.html',
  './17.html',
  './19.html',
  './20.html',
  // ไฟล์พื้นฐานของ PWA
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png',
  './logo.png'
];

// โค้ดส่วนที่เหลือของ sw.js ยังคงเหมือนเดิม
// (self.addEventListener('install', ...), self.addEventListener('activate', ...), self.addEventListener('fetch', ...))

// Event: install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching all app files');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Failed to cache files during install:', error);
      })
  );
  self.skipWaiting();
});

// Event: activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cache => {
          return cache.startsWith('juckmanphai-pwa-cache-') && cache !== CACHE_NAME;
        }).map(cache => {
          console.log('Service Worker: Clearing old cache:', cache);
          return caches.delete(cache);
        })
      );
    })
  );
  return self.clients.claim();
});

// Event: fetch
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
      return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});