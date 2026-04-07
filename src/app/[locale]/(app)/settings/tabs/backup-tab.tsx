'use client'
import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/toast-provider'
import { Download, Upload, AlertTriangle } from 'lucide-react'

export function BackupTab() {
  const t = useTranslations('settings.backup')
  const tc = useTranslations('common')
  const { toast } = useToast()
  const [exporting, setExporting] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fileInfo, setFileInfo] = useState<{ name: string; exportedAt: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const pendingFileRef = useRef<string | null>(null)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/settings/backup')
      if (!res.ok) throw new Error(t('exportFailed'))

      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `haushalt-quest-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast(t('exported'), 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : t('exportFailed'), 'error')
    } finally {
      setExporting(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast(t('fileTooLarge'), 'error')
      return
    }

    const reader = new FileReader()
    reader.onerror = () => toast(t('fileUnreadable'), 'error')
    reader.onload = () => {
      try {
        const content = reader.result as string
        const parsed = JSON.parse(content)
        if (!parsed.meta?.exportedAt) throw new Error(t('invalidFile'))

        pendingFileRef.current = content
        setFileInfo({
          name: file.name,
          exportedAt: new Date(parsed.meta.exportedAt).toLocaleString('de-DE'),
        })
        setShowConfirm(true)
      } catch {
        toast(t('invalidFile'), 'error')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleRestore() {
    if (!pendingFileRef.current) return
    setShowConfirm(false)
    setRestoring(true)

    try {
      const res = await fetch('/api/settings/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: pendingFileRef.current,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t('restoreFailed'))
      }

      toast(t('restored'), 'success')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      toast(err instanceof Error ? err.message : t('restoreFailed'), 'error')
    } finally {
      setRestoring(false)
      pendingFileRef.current = null
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        {t('description')}
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleExport}
          disabled={exporting || restoring}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={16} />
          {exporting ? t('exporting') : t('exportButton')}
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={exporting || restoring}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload size={16} />
          {restoring ? t('restoring') : t('restoreButton')}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {showConfirm && fileInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle size={24} />
              <h3 className="font-semibold text-lg text-slate-800">{t('confirmTitle')}</h3>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>{t('confirmBody')}</p>
              <p className="text-xs text-slate-400">
                {t('fileLabel', { name: fileInfo.name })}<br />
                {t('exportedAt', { date: fileInfo.exportedAt })}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowConfirm(false)
                  pendingFileRef.current = null
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={handleRestore}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                {t('restoreButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
