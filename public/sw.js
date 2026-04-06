// Chore-Quest Service Worker
const CACHE_VERSION = 'v1'

self.addEventListener('install', () => {
  // Don't skipWaiting — let the update banner control activation
})
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
