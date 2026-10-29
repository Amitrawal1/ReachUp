// Simple service worker so the app still opens on slow or no internet.
// It saves every page and file the first time it loads, then serves the saved copy if the network fails.
const CACHE = 'reachup-v1'

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  // Remove old caches when a new version is deployed
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  // Only handle normal GET requests from our own site
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Save a fresh copy for offline use
        const copy = res.clone()
        caches.open(CACHE).then((cache) => cache.put(req, copy))
        return res
      })
      // Network failed: use the saved copy, or the home page for app routes
      .catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
  )
})
