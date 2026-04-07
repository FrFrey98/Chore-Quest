'use client'
import { useState, useRef } from 'react'
import { useToast } from '@/components/toast-provider'
import { Download, Upload, AlertTriangle } from 'lucide-react'

export function BackupTab() {
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
      if (!res.ok) throw new Error('Export fehlgeschlagen')

      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `haushalt-quest-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast('Backup heruntergeladen', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Export fehlgeschlagen', 'error')
    } finally {
      setExporting(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast('Datei zu groß (max 10 MB)', 'error')
      return
    }

    const reader = new FileReader()
    reader.onerror = () => toast('Datei konnte nicht gelesen werden', 'error')
    reader.onload = () => {
      try {
        const content = reader.result as string
        const parsed = JSON.parse(content)
        if (!parsed.meta?.exportedAt) throw new Error('Ungültige Backup-Datei')

        pendingFileRef.current = content
        setFileInfo({
          name: file.name,
          exportedAt: new Date(parsed.meta.exportedAt).toLocaleString('de-DE'),
        })
        setShowConfirm(true)
      } catch {
        toast('Ungültige Backup-Datei', 'error')
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
        throw new Error(data.error || 'Restore fehlgeschlagen')
      }

      toast('Daten wiederhergestellt. Seite wird neu geladen.', 'success')
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Restore fehlgeschlagen', 'error')
    } finally {
      setRestoring(false)
      pendingFileRef.current = null
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Exportiere alle Daten als JSON-Datei oder stelle sie aus einem Backup wieder her.
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleExport}
          disabled={exporting || restoring}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download size={16} />
          {exporting ? 'Exportiert...' : 'Backup exportieren'}
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={exporting || restoring}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload size={16} />
          {restoring ? 'Wiederherstellen...' : 'Backup wiederherstellen'}
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
              <h3 className="font-semibold text-lg text-slate-800">Daten überschreiben?</h3>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Alle aktuellen Daten werden überschrieben. Ein automatisches Backup wird vorher erstellt.</p>
              <p className="text-xs text-slate-400">
                Datei: {fileInfo.name}<br />
                Exportiert am: {fileInfo.exportedAt}
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
                Abbrechen
              </button>
              <button
                onClick={handleRestore}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Wiederherstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
