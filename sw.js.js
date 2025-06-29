const CACHE_NAME = 'accounting-app-cache-v1';
// เพิ่มไฟล์ทั้งหมดที่จำเป็นสำหรับแอปของคุณที่นี่
const urlsToCache = [
  './', // นี่คือ 17.html (เมื่อ start_url คือ '.')
  './17.html', // ใส่ชื่อไฟล์เต็มๆ เพื่อความแน่นอน
  './manifest.json',
  './icon-192x192.png',
  './icon-512x512.png'
];

// Event: install - ติดตั้ง Service Worker และ Cache ไฟล์
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching files');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Event: activate - จัดการแคชเก่า
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Event: fetch - จัดการกับการร้องขอไฟล์ (Cache First Strategy)
self.addEventListener('fetch', event => {
  // ไม่แคช request ที่ไม่ใช่ GET
  if (event.request.method !== 'GET') {
      return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // ถ้ามีในแคช ก็ส่ง response จากแคชกลับไปเลย
        if (response) {
          return response;
        }
        
        // ถ้าไม่มีในแคช ก็ไปโหลดจากเน็ตเวิร์ก
        return fetch(event.request).then(
          networkResponse => {
            // และเก็บ response ที่ได้มาใหม่ลงในแคชด้วย
            return caches.open(CACHE_NAME).then(cache => {
                // ไม่แคชไฟล์ที่เกิดข้อผิดพลาด
                if (networkResponse.status === 200) {
                    cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            });
          }
        ).catch(err => {
            // กรณีที่ไม่มีทั้งในแคชและโหลดจากเน็ตไม่ได้ (ออฟไลน์)
            // คุณสามารถส่งหน้า fallback page ได้ที่นี่ (ถ้ามี)
            console.error('Fetching failed:', err);
        });
      }
    )
  );
});