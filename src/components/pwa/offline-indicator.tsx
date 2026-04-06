'use client'
import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    function handleOffline() {
      setIsOffline(true)
      setShow(true)
    }

    function handleOnline() {
      setIsOffline(false)
      setTimeout(() => setShow(false), 2000)
    }

    if (!navigator.onLine) {
      setIsOffline(true)
      setShow(true)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!show) return null

  return (
    <div
      className={`bg-amber-100 text-amber-800 text-xs font-medium px-4 py-2 flex items-center justify-center gap-2 transition-opacity duration-500 ${
        isOffline ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <WifiOff size={14} />
      <span>Offline — Änderungen werden synchronisiert</span>
    </div>
  )
}
