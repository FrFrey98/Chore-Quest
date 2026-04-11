"use client"

import { useState, useMemo, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "next-intl"
import { useToast } from "@/components/toast-provider"
import { logDogTrainingSession } from "@/app/actions/dog-training/log-session"
import { SessionSummary } from "./session-summary"
import { ALLOWED_DURATIONS } from "@/lib/dog-training/constants"
import { calculateSessionPoints } from "@/lib/dog-training/points"

type SkillDef = {
  id: string
  nameDe: string
  nameEn: string
  categoryId: string
  categoryNameDe: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dogId: string
  dogName: string
  allDogs: Array<{ id: string; name: string }>
  allSkills: SkillDef[]
  recommendedSkillIds: string[]
  householdUsers: Array<{ id: string; name: string }>
  pointsEarnedTodayForDog: number
  currentUserId: string
}

type Rating = "poor" | "okay" | "good"

export function TrainingLogModal({
  open,
  onOpenChange,
  dogId: initialDogId,
  allDogs,
  allSkills,
  recommendedSkillIds,
  householdUsers,
  pointsEarnedTodayForDog,
  currentUserId,
}: Props) {
  const t = useTranslations("dogTraining.modal")
  const { toast } = useToast()
  const [dogId, setDogId] = useState(initialDogId)
  const [selected, setSelected] = useState<Map<string, Rating>>(() => {
    const m = new Map<string, Rating>()
    for (const id of recommendedSkillIds) m.set(id, "okay")
    return m
  })
  const [duration, setDuration] = useState(10)
  const [moreDetails, setMoreDetails] = useState(false)
  const [withUserId, setWithUserId] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [mood, setMood] = useState<"tired" | "normal" | "excited" | null>(null)
  const [sessionType, setSessionType] = useState<"daily" | "focused" | "walk" | "scent" | null>(null)
  const [search, setSearch] = useState("")
  const [pending, startTransition] = useTransition()
  const [sessionResult, setSessionResult] = useState<{
    pointsAwarded: number
    capped: boolean
    levelUps: Array<{ skillId: string; skillName: string; oldStatus: string; newStatus: string }>
    newAchievements: Array<{ id: string; titleDe: string; emoji: string }>
  } | null>(null)

  const grouped = useMemo(() => {
    const filtered = allSkills.filter((s) =>
      search ? s.nameDe.toLowerCase().includes(search.toLowerCase()) : true,
    )
    const rec = filtered.filter((s) => recommendedSkillIds.includes(s.id))
    const rest = filtered.filter((s) => !recommendedSkillIds.includes(s.id))
    const byCategory = new Map<string, SkillDef[]>()
    for (const s of rest) {
      if (!byCategory.has(s.categoryNameDe)) byCategory.set(s.categoryNameDe, [])
      byCategory.get(s.categoryNameDe)!.push(s)
    }
    return { recommended: rec, byCategory }
  }, [allSkills, search, recommendedSkillIds])

  const toggleSkill = (id: string) => {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(id)) next.delete(id)
      else next.set(id, "okay")
      return next
    })
  }

  const setRating = (id: string, rating: Rating) => {
    setSelected((prev) => {
      const next = new Map(prev)
      next.set(id, rating)
      return next
    })
  }

  const skillInputs = useMemo(
    () => Array.from(selected.entries()).map(([id, rating]) => ({ skillDefinitionId: id, rating })),
    [selected],
  )

  const previewPoints = useMemo(() => {
    if (skillInputs.length === 0) return 0
    return calculateSessionPoints({
      durationMinutes: duration,
      skills: skillInputs,
      recommendedSkillIds,
      pointsEarnedTodayForDog,
    }).points
  }, [duration, skillInputs, recommendedSkillIds, pointsEarnedTodayForDog])

  const handleSave = () => {
    if (skillInputs.length === 0) {
      toast(t("noSkillsError"), "error")
      return
    }
    startTransition(async () => {
      try {
        const result = await logDogTrainingSession({
          dogId,
          skills: skillInputs,
          durationMinutes: duration,
          moodLevel: mood,
          sessionType,
          notes: notes || null,
          withUserId,
          recommendedSkillIds,
        })
        setSessionResult({
          pointsAwarded: result.pointsAwarded,
          capped: result.capped,
          levelUps: result.levelUps ?? [],
          newAchievements: result.newAchievements ?? [],
        })
      } catch (e) {
        toast((e as Error).message, "error")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setSessionResult(null); onOpenChange(v) }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        {sessionResult ? (
          <SessionSummary
            pointsAwarded={sessionResult.pointsAwarded}
            capped={sessionResult.capped}
            levelUps={sessionResult.levelUps}
            newAchievements={sessionResult.newAchievements}
            onClose={() => {
              setSessionResult(null)
              onOpenChange(false)
            }}
          />
        ) : (<>
        <div className="space-y-4">
          {allDogs.length > 1 && (
            <div>
              <Label>{t("dog")}</Label>
              <Select value={dogId} onValueChange={setDogId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {allDogs.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>{t("skills")}</Label>
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2"
            />
            <div className="max-h-64 overflow-y-auto border border-border rounded-md p-2 space-y-3">
              {grouped.recommended.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {t("recommended")}
                  </div>
                  {grouped.recommended.map((s) => (
                    <SkillRow
                      key={s.id}
                      skill={s}
                      selected={selected.has(s.id)}
                      rating={selected.get(s.id)}
                      onToggle={() => toggleSkill(s.id)}
                      onRate={(r) => setRating(s.id, r)}
                      recommended
                    />
                  ))}
                </div>
              )}
              {Array.from(grouped.byCategory.entries()).map(([cat, skills]) => (
                <div key={cat}>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {cat}
                  </div>
                  {skills.map((s) => (
                    <SkillRow
                      key={s.id}
                      skill={s}
                      selected={selected.has(s.id)}
                      rating={selected.get(s.id)}
                      onToggle={() => toggleSkill(s.id)}
                      onRate={(r) => setRating(s.id, r)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>{t("duration")}</Label>
            <ToggleGroup type="single" value={String(duration)} onValueChange={(v) => v && setDuration(Number(v))}>
              {ALLOWED_DURATIONS.map((d) => (
                <ToggleGroupItem key={d} value={String(d)}>{d} min</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <button
            type="button"
            className="text-sm text-accent underline"
            onClick={() => setMoreDetails((v) => !v)}
          >
            {moreDetails ? t("lessDetails") : t("moreDetails")}
          </button>

          {moreDetails && (
            <div className="space-y-3 border-t border-border pt-3">
              <div>
                <Label>{t("withUser")}</Label>
                <Select value={withUserId ?? ""} onValueChange={(v) => setWithUserId(v || null)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {householdUsers.filter((u) => u.id !== currentUserId).map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t("notes")}</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div>
                <Label>{t("mood")}</Label>
                <ToggleGroup type="single" value={mood ?? ""} onValueChange={(v) => setMood((v as "tired" | "normal" | "excited") || null)}>
                  <ToggleGroupItem value="tired">😴</ToggleGroupItem>
                  <ToggleGroupItem value="normal">🙂</ToggleGroupItem>
                  <ToggleGroupItem value="excited">🔥</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div>
                <Label>{t("sessionType")}</Label>
                <Select value={sessionType ?? ""} onValueChange={(v) => setSessionType((v as "daily" | "focused" | "walk" | "scent") || null)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t("sessionTypes.daily")}</SelectItem>
                    <SelectItem value="focused">{t("sessionTypes.focused")}</SelectItem>
                    <SelectItem value="walk">{t("sessionTypes.walk")}</SelectItem>
                    <SelectItem value="scent">{t("sessionTypes.scent")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex items-center justify-between">
          <div className="text-sm">
            {t("preview")}: <strong>{previewPoints}</strong> {t("points")}
            {pointsEarnedTodayForDog >= 40 && (
              <div className="text-xs text-warning">{t("cap")}</div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
            <Button onClick={handleSave} disabled={pending || skillInputs.length === 0}>
              {t("save")}
            </Button>
          </div>
        </DialogFooter>
        </>)}
      </DialogContent>
    </Dialog>
  )
}

function SkillRow({
  skill,
  selected,
  rating,
  onToggle,
  onRate,
  recommended,
}: {
  skill: SkillDef
  selected: boolean
  rating: "poor" | "okay" | "good" | undefined
  onToggle: () => void
  onRate: (r: "poor" | "okay" | "good") => void
  recommended?: boolean
}) {
  return (
    <div className="flex items-center gap-2 py-1">
      <input type="checkbox" checked={selected} onChange={onToggle} />
      <span className="flex-1 text-sm">{skill.nameDe}</span>
      {recommended && <Badge variant="default" className="text-xs">★</Badge>}
      {selected && (
        <ToggleGroup type="single" value={rating} onValueChange={(v) => v && onRate(v as "poor" | "okay" | "good")}>
          <ToggleGroupItem value="poor" className="text-xs">👎</ToggleGroupItem>
          <ToggleGroupItem value="okay" className="text-xs">👌</ToggleGroupItem>
          <ToggleGroupItem value="good" className="text-xs">👍</ToggleGroupItem>
        </ToggleGroup>
      )}
    </div>
  )
}
