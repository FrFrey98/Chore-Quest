'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useToast } from '@/components/toast-provider'
import { Trash2, Plus, GripVertical, Pencil } from 'lucide-react'

type TaskOption = { id: string; title: string; emoji: string }
type QuestStepData = {
  id: string
  stepOrder: number
  description: string
  descriptionDe: string
  task: TaskOption
}
type QuestData = {
  id: string
  title: string
  titleDe: string
  description: string
  descriptionDe: string
  emoji: string
  bonusPoints: number
  isActive: boolean
  steps: QuestStepData[]
}

type StepDraft = {
  taskId: string
  description: string
  descriptionDe: string
}

export function QuestsTab({ quests, tasks }: { quests: QuestData[]; tasks: TaskOption[] }) {
  const t = useTranslations('common')
  const locale = useLocale()
  const { toast } = useToast()
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  async function handleDelete(id: string) {
    const res = await fetch(`/api/quests/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast(t('saved'), 'success')
      router.refresh()
    } else {
      toast(t('saveFailed'), 'error')
    }
  }

  async function handleToggle(quest: QuestData) {
    const res = await fetch(`/api/quests/${quest.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !quest.isActive }),
    })
    if (res.ok) {
      toast(t('saved'), 'success')
      router.refresh()
    } else {
      toast(t('saveFailed'), 'error')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">Manage quest chains for all users.</p>
        <button
          onClick={() => { setShowCreate(true); setEditingId(null) }}
          className="bg-accent hover:bg-accent-hover text-accent-foreground text-xs font-semibold rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1"
        >
          <Plus size={14} /> {t('create')}
        </button>
      </div>

      {showCreate && (
        <QuestForm
          tasks={tasks}
          onDone={() => { setShowCreate(false); router.refresh() }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      <div className="flex flex-col gap-2 mt-4">
        {quests.map((quest) => (
          <div key={quest.id}>
            {editingId === quest.id ? (
              <QuestForm
                tasks={tasks}
                quest={quest}
                onDone={() => { setEditingId(null); router.refresh() }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                <span className="text-xl">{quest.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {locale === 'de' ? quest.titleDe : quest.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {quest.steps.length} steps · +{quest.bonusPoints} Pts
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(quest)}
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    quest.isActive
                      ? 'bg-success-muted text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {quest.isActive ? t('active') : t('inactive')}
                </button>
                <button onClick={() => setEditingId(quest.id)} className="text-muted-foreground hover:text-foreground p-1">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(quest.id)} className="text-muted-foreground hover:text-danger p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
        {quests.length === 0 && !showCreate && (
          <p className="text-sm text-muted-foreground text-center py-4">No quests yet.</p>
        )}
      </div>
    </div>
  )
}

function QuestForm({
  tasks,
  quest,
  onDone,
  onCancel,
}: {
  tasks: TaskOption[]
  quest?: QuestData
  onDone: () => void
  onCancel: () => void
}) {
  const t = useTranslations('common')
  const { toast } = useToast()

  const [title, setTitle] = useState(quest?.title ?? '')
  const [titleDe, setTitleDe] = useState(quest?.titleDe ?? '')
  const [description, setDescription] = useState(quest?.description ?? '')
  const [descriptionDe, setDescriptionDe] = useState(quest?.descriptionDe ?? '')
  const [emoji, setEmoji] = useState(quest?.emoji ?? '📜')
  const [bonusPoints, setBonusPoints] = useState(quest?.bonusPoints ?? 50)
  const [steps, setSteps] = useState<StepDraft[]>(
    quest?.steps.map((s) => ({
      taskId: s.task.id,
      description: s.description,
      descriptionDe: s.descriptionDe,
    })) ?? [{ taskId: '', description: '', descriptionDe: '' }]
  )
  const [saving, setSaving] = useState(false)

  function addStep() {
    setSteps([...steps, { taskId: '', description: '', descriptionDe: '' }])
  }

  function removeStep(idx: number) {
    setSteps(steps.filter((_, i) => i !== idx))
  }

  function updateStep(idx: number, field: keyof StepDraft, value: string) {
    const updated = [...steps]
    updated[idx] = { ...updated[idx], [field]: value }
    setSteps(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const body = { title, titleDe, description, descriptionDe, emoji, bonusPoints, steps }
      const url = quest ? `/api/quests/${quest.id}` : '/api/quests'
      const method = quest ? 'PATCH' : 'POST'

      // For PATCH, we need to delete and recreate. Use POST for new, and for edit
      // just update metadata (steps can't be edited via PATCH in current API)
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? t('saveFailed'))
      }

      toast(t('saved'), 'success')
      onDone()
    } catch (err: any) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="grid grid-cols-[60px_1fr] gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Emoji</label>
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} className={inputCls} maxLength={4} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Bonus Pts</label>
          <input type="number" value={bonusPoints} onChange={(e) => setBonusPoints(Number(e.target.value))} className={inputCls} min={1} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Title (EN)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Title (DE)</label>
          <input value={titleDe} onChange={(e) => setTitleDe(e.target.value)} className={inputCls} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-muted-foreground">Description (EN)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} rows={2} required />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Description (DE)</label>
          <textarea value={descriptionDe} onChange={(e) => setDescriptionDe(e.target.value)} className={inputCls} rows={2} required />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-muted-foreground font-semibold">Steps</label>
          <button type="button" onClick={addStep} className="text-xs text-accent hover:text-accent-hover flex items-center gap-1">
            <Plus size={12} /> {t('add')}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 bg-muted/50 rounded-lg p-2">
              <span className="text-xs text-muted-foreground mt-2 w-5 shrink-0">
                <GripVertical size={14} />
              </span>
              <div className="flex-1 flex flex-col gap-1.5">
                <select
                  value={step.taskId}
                  onChange={(e) => updateStep(idx, 'taskId', e.target.value)}
                  className={inputCls}
                  required
                >
                  <option value="">Select task...</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.emoji} {task.title}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    placeholder="Step description (EN)"
                    value={step.description}
                    onChange={(e) => updateStep(idx, 'description', e.target.value)}
                    className={inputCls}
                    required
                  />
                  <input
                    placeholder="Beschreibung (DE)"
                    value={step.descriptionDe}
                    onChange={(e) => updateStep(idx, 'descriptionDe', e.target.value)}
                    className={inputCls}
                    required
                  />
                </div>
              </div>
              {steps.length > 1 && (
                <button type="button" onClick={() => removeStep(idx)} className="text-muted-foreground hover:text-danger p-1 mt-1">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="bg-accent hover:bg-accent-hover text-accent-foreground text-sm font-semibold rounded-lg px-4 py-1.5 transition-colors disabled:opacity-50"
        >
          {saving ? t('saving') : t('save')}
        </button>
      </div>
    </form>
  )
}
