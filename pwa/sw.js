const CACHE_NAME = 'samorn-movie-v1';
const urlsToCache = [
  '/',
  'index.html',
  'login.html',
  'pages/category.html',
  'pages/watch.html',
  'pages/admin.html',
  'assets/css/style.css',
  'assets/css/watch.css',
  'assets/css/category-responsive.css',
  'assets/css/menu.css',
  'assets/js/script.js',
  'assets/js/category.js',
  'assets/js/watch.js',
  'assets/js/menu.js',
  'assets/js/vip-auth.js',
  'assets/js/auth-check.js',
  'assets/js/firebase-setup.js',
  'assets/js/tv-detection.js',
  'assets/js/tv-navigation.js',
  'pwa/manifest.json',
  'https://cdn.tailwindcss.com'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  console.log('Service Worker: Installing...');
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        // Cache files one by one to avoid failing all if one fails
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.warn('Failed to cache:', url, error);
              // Continue even if some files fail to cache
              return Promise.resolve();
            });
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Installed');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker installation failed:', error);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
  console.log('Service Worker: Activating...');
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event - Cache Strategy
self.addEventListener('fetch', (e) => {
  const request = e.request;
  const url = new URL(request.url);
  
  // สำหรับไฟล์ JSON (playlist) ใช้ Network First
  if (url.pathname.includes('/data/playlist/') && url.pathname.endsWith('.json')) {
    e.respondWith(
      fetch(request)
        .then((response) => {
          // ถ้าโหลดสำเร็จ ให้เก็บใน cache
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // ถ้าเน็ตล้มเหลว ให้ลองจาก cache
          return caches.match(request);
        })
    );
    return;
  }
  
  // สำหรับไฟล์อื่นๆ ใช้ Cache First
  e.respondWith(
    caches.match(request)
      .then((response) => {
        // ถ้ามีใน cache ให้ใช้ cache
        if (response) {
          return response;
        }
        
        // ถ้าไม่มีใน cache ให้โหลดจากเน็ต
        return fetch(request).then((response) => {
          // ตรวจสอบว่า response ถูกต้อง
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // เก็บใน cache สำหรับครั้งถัดไป
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          return response;
        });
      })
  );
});

// Background Sync (สำหรับออฟไลน์)
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-vip-data') {
    e.waitUntil(syncVipData());
  }
});

// Push Notifications
self.addEventListener('push', (e) => {
  const options = {
    body: e.data ? e.data.text() : 'SAMORN Movie - มีอัปเดตใหม่!',
    icon: 'assets/icons/icon-192.png',
    badge: 'assets/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'ดูหนังเลย',
        icon: 'assets/icons/icon-192.png'
      },
      {
        action: 'close',
        title: 'ปิด',
        icon: 'assets/icons/icon-192.png'
      }
    ]
  };
  
  e.waitUntil(
    self.registration.showNotification('SAMORN Movie VIP', options)
  );
});

// Sync VIP Data Function
async function syncVipData() {
  console.log('Syncing VIP data...');
  // ทำงานเมื่อมีการเชื่อมต่ออินเทอร์เน็ต
}