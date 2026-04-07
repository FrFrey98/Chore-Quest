'use client'

import { useState, useMemo } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import templates from '@/data/task-templates.json'

interface TemplatePickerProps {
  open: boolean
  onClose: () => void
  onSelect: (template: { title: string; emoji: string; points: number; interval: string }) => void
}

export function TemplatePicker({ open, onClose, onSelect }: TemplatePickerProps) {
  const locale = useLocale()
  const t = useTranslations('templates')
  const tIntervals = useTranslations('intervals')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return templates
      .filter((cat) => !activeCategory || cat.category === activeCategory)
      .map((cat) => ({
        ...cat,
        templates: cat.templates.filter((tpl) => {
          if (!q) return true
          const title = locale === 'de' ? tpl.titleDe : tpl.title
          return title.toLowerCase().includes(q)
        }),
      }))
      .filter((cat) => cat.templates.length > 0)
  }, [search, activeCategory, locale])

  function handleSelect(tpl: (typeof templates)[number]['templates'][number]) {
    onSelect({
      title: locale === 'de' ? tpl.titleDe : tpl.title,
      emoji: tpl.emoji,
      points: tpl.suggestedPoints,
      interval: tpl.suggestedInterval,
    })
    setSearch('')
    setActiveCategory(null)
    onClose()
  }

  const intervalLabel = (interval: string) => {
    switch (interval) {
      case 'daily': return tIntervals('daily')
      case 'weekly': return tIntervals('weekly')
      case 'monthly': return tIntervals('monthly')
      default: return interval
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { onClose(); setSearch(''); setActiveCategory(null) } }}>
      <DialogContent className="max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('selectTemplate')}</DialogTitle>
        </DialogHeader>

        <Input
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
        />

        <div className="flex gap-1 flex-wrap mb-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !activeCategory ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground hover:bg-accent'
            }`}
          >
            {t('allCategories')}
          </button>
          {templates.map((cat) => (
            <button
              key={cat.category}
              type="button"
              onClick={() => setActiveCategory(cat.category === activeCategory ? null : cat.category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === cat.category ? 'bg-indigo-600 text-white' : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              {cat.emoji} {locale === 'de' ? cat.categoryDe : cat.category}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 space-y-4 min-h-0">
          {filtered.map((cat) => (
            <div key={cat.category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {cat.emoji} {locale === 'de' ? cat.categoryDe : cat.category}
              </h3>
              <div className="grid grid-cols-1 gap-1">
                {cat.templates.map((tpl) => (
                  <button
                    key={tpl.title}
                    type="button"
                    onClick={() => handleSelect(tpl)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent text-left transition-colors"
                  >
                    <span className="text-lg">{tpl.emoji}</span>
                    <span className="flex-1 text-sm font-medium">
                      {locale === 'de' ? tpl.titleDe : tpl.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {tpl.suggestedPoints} Pts
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {intervalLabel(tpl.suggestedInterval)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No templates found.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
