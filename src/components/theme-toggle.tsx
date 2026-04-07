'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const options = [
    { value: 'light', icon: Sun },
    { value: 'dark', icon: Moon },
    { value: 'system', icon: Monitor },
  ] as const

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border p-1">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`rounded-md p-1.5 transition-colors ${
            theme === value
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-label={value}
        >
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}
