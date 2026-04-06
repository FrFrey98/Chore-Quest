// Chore-Quest Service Worker
const CACHE_NAME = 'chore-quest-v1'
const API_CACHE = 'chore-quest-api-v1'

// === Install ===
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        '/manifest.json',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png',
      ])
    )
  )
})

// === Activate: clean old caches ===
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== API_CACHE && key !== 'chore-quest-offline-v1')
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  )
})

// === Message: skip waiting for updates ===
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  if (event.data?.type === 'MANUAL_SYNC') {
    event.waitUntil(syncCompletions())
  }
})

// === Fetch: caching strategies ===
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return

  // POST to completion API: try network, queue offline if fails
  if (request.method === 'POST' && url.pathname.match(/^\/api\/tasks\/[^/]+\/complete$/)) {
    event.respondWith(handleOfflineCompletion(request))
    return
  }

  // Only cache GET requests
  if (request.method !== 'GET') return

  // Static assets (/_next/static/): Cache-First (hashed = immutable)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CACHE_NAME))
    return
  }

  // Icons and manifest: Cache-First
  if (url.pathname.startsWith('/icons/') || url.pathname === '/manifest.json') {
    event.respondWith(cacheFirst(request, CACHE_NAME))
    return
  }

  // API data routes: Network-First with cache fallback
  if (url.pathname === '/api/tasks' || url.pathname === '/api/stats' || url.pathname === '/api/streak') {
    event.respondWith(networkFirst(request, API_CACHE))
    return
  }

  // HTML pages: Network-First with cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, CACHE_NAME))
    return
  }
})

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503 })
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    if (request.headers.get('accept')?.includes('text/html')) {
      return new Response(
        '<html><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;color:#64748b;"><div style="text-align:center"><h1>Offline</h1><p>Chore-Quest ist gerade nicht erreichbar.</p></div></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
      )
    }
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

// === Push Notifications ===
self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Chore-Quest', body: event.data.text() }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Chore-Quest', {
      body: payload.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      data: payload.data || {},
      vibrate: [100, 50, 100],
    })
  )
})

// === Notification Click ===
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/tasks'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})

// === IndexedDB Helpers for Offline Completions ===
const DB_NAME = 'chore-quest-offline'
const DB_VERSION = 1
const STORE_NAME = 'pending-completions'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function addPending(data) {
  return openDB().then((db) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.add(data)
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  )
}

function getAllPending() {
  return openDB().then((db) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  )
}

function removePending(id) {
  return openDB().then((db) =>
    new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const req = store.delete(id)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  )
}

// === Offline Completion Handler ===
async function handleOfflineCompletion(request) {
  const clone = request.clone()

  try {
    const response = await fetch(clone)
    return response
  } catch {
    // Network failed — queue for later
    let body = {}
    try {
      body = await request.json()
    } catch {
      // No body
    }

    const url = new URL(request.url)
    const taskId = url.pathname.split('/')[3] // /api/tasks/{id}/complete

    await addPending({
      taskId,
      url: url.pathname,
      body,
      timestamp: new Date().toISOString(),
    })

    // Register background sync
    if (self.registration.sync) {
      await self.registration.sync.register('sync-completions')
    }

    return new Response(
      JSON.stringify({ queued: true, taskId }),
      { status: 202, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// === Background Sync ===
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-completions') {
    event.waitUntil(syncCompletions())
  }
})

async function syncCompletions() {
  const pending = await getAllPending()

  for (const item of pending) {
    try {
      const response = await fetch(item.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item.body, offlineAt: item.timestamp }),
      })

      if (response.ok) {
        await removePending(item.id)
      } else if (response.status === 409) {
        // Already completed by someone else
        await removePending(item.id)
        const data = await response.json()
        await self.registration.showNotification('Chore-Quest', {
          body: `Aufgabe wurde bereits von ${data.completedBy || 'Partner'} erledigt`,
          icon: '/icons/icon-192x192.png',
        })
      }
      // Other errors: leave in queue for next sync attempt
    } catch {
      // Network still unavailable — leave in queue
      break
    }
  }
}
