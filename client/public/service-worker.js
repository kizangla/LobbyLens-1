// Service Worker for Lobby Application
const CACHE_NAME = 'lobby-app-cache-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache initially
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx'
];

// Cache API responses
const API_CACHE_NAME = 'lobby-app-api-cache-v1';
const API_URLS = [
  '/api/categories',
  '/api/guides'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(STATIC_RESOURCES);
      })
      .catch(error => console.error('Pre-caching failed:', error))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  
  // Ensure the service worker takes control immediately
  return self.clients.claim();
});

// Helper function to determine if a request is an API request
const isApiRequest = (request) => {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/');
};

// Helper function to create a network-first strategy with cache fallback
const networkFirstWithCache = async (request, cacheName) => {
  try {
    // Try to get from network first
    const networkResponse = await fetch(request);
    
    // Cache the successful response
    const responseToCache = networkResponse.clone();
    caches.open(cacheName)
      .then(cache => {
        cache.put(request, responseToCache);
      });
    
    return networkResponse;
  } catch (error) {
    console.log('Network request failed, trying cache...', request.url);
    
    // If network fails, try to get from cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's a specific API request for which we want to show offline content
    if (isApiRequest(request)) {
      if (request.url.includes('/api/categories')) {
        // Return empty categories array for offline mode
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (request.url.includes('/api/guides')) {
        // Return empty guides array for offline mode
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // For other API requests, return a basic offline response
      return new Response(JSON.stringify({ offline: true, message: 'You are offline' }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For non-API requests without a cache match, serve the offline page
    return caches.match(OFFLINE_URL);
  }
};

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle API requests - network first, then cache
  if (isApiRequest(request)) {
    event.respondWith(networkFirstWithCache(request, API_CACHE_NAME));
    return;
  }
  
  // For non-API requests, use cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // If fetch fails (offline), serve the offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            return new Response('Offline content not available');
          });
      })
  );
});