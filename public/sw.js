// Simple service worker so the app still opens on slow or no internet.
// It saves every page and file the first time it loads, then serves the saved copy if the network fails.
const CACHE = 'reachup-v2'

self.addEventListener('install', (event) => {
  // Save the main page right away, so any app link works offline
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(['/', '/manifest.json', '/logo.svg'])))
  self.skipWaiting()
})

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
      .catch(async () => {
        // Network failed: use the saved copy.
        // For app pages like /my-list, the main page is enough because React draws the screen.
        const hit = await caches.match(req)
        if (hit) return hit
        if (req.mode === 'navigate') return caches.match('/')
        return Response.error()
      })
  )
})
