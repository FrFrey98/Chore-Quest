'use client'
import { useState, useRef, useEffect } from 'react'

const EMOJI_GROUPS = [
  {
    label: 'Haushalt',
    emojis: ['🏠', '🧹', '🧽', '🪣', '🪶', '🧺', '🫧', '🗑️', '🪞', '🚽', '🧊', '🪴', '🛒', '✨', '💧'],
  },
  {
    label: 'Küche',
    emojis: ['🍳', '👨‍🍳', '🍽️', '🍕', '🍔', '🥗', '🍰', '☕', '🧁', '🥘', '🍲', '🥤'],
  },
  {
    label: 'Belohnungen',
    emojis: ['🎬', '😴', '💆', '🎮', '🎵', '📚', '🛁', '🍫', '🍷', '🎁', '🎉', '🏖️'],
  },
  {
    label: 'Sport & Natur',
    emojis: ['🌿', '🚴', '🏃', '⚽', '🧘', '🌸', '☀️', '🌈', '🐕', '🌻'],
  },
  {
    label: 'Symbole',
    emojis: ['⭐', '🔥', '💪', '💯', '🏆', '💎', '💰', '👑', '🎓', '⚡', '❤️', '👍', '🎯', '🚀', '✅'],
  },
]

export function EmojiPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (emoji: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-9 px-3 border border-border rounded-md text-2xl flex items-center justify-center hover:bg-muted/50 transition-colors"
      >
        {value || '😀'}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-xl p-3 w-72 max-h-64 overflow-y-auto">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label} className="mb-2 last:mb-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-1">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-0.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onChange(emoji)
                      setOpen(false)
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-lg hover:bg-accent/10 transition-colors ${
                      value === emoji ? 'bg-accent/10 ring-1 ring-accent/30' : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
