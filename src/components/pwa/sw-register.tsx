'use client'
import { useEffect, useState } from 'react'

export function SwRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV === 'development') return

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker)
            setUpdateAvailable(true)
          }
        })
      })
    })

    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true
        window.location.reload()
      }
    })

    // Fallback: sync pending completions on app start (for browsers without Background Sync)
    navigator.serviceWorker.ready.then((registration) => {
      if (!('sync' in registration)) {
        registration.active?.postMessage({ type: 'MANUAL_SYNC' })
      }
    })
  }, [])

  function handleUpdate() {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' })
    setUpdateAvailable(false)
  }

  if (!updateAvailable) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-accent text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-3">
      <span>Update verfügbar</span>
      <button
        onClick={handleUpdate}
        className="bg-white text-accent px-3 py-1 rounded-lg text-xs font-bold hover:bg-accent/10 transition-colors"
      >
        Neu laden
      </button>
    </div>
  )
}
