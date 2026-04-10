"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { DogFormSheet } from "@/components/dogs/dog-form-sheet"
import { TrainingLogModal } from "@/components/dogs/training-log-modal"
import { SkillExtensionSheet, type ExtensionCategory } from "@/components/dogs/skill-extension-sheet"

type Dog = {
  id: string
  name: string
  emoji: string
  photoBase64: string | null
  breed: string | null
  gender: string | null
  birthDate: Date | null
  phase: string
  notes: string | null
}

type Props = {
  dogs: Dog[]
  initialActiveDogId: string | null
  initialOverview: any
  initialDailyChallenge: any
  householdUsers: Array<{ id: string; name: string }>
  allSkills: Array<{
    id: string
    nameDe: string
    nameEn: string
    categoryId: string
    categoryNameDe: string
    difficulty: string
  }>
  dogTrainingCategories: ExtensionCategory[]
  currentUserId: string
  pointsEarnedTodayForDog?: number
  streak?: number
  trainedSkillCount?: number
  totalSessionCount?: number
}

export function DogsClient({
  dogs,
  initialActiveDogId,
  initialOverview,
  initialDailyChallenge,
  householdUsers,
  allSkills,
  dogTrainingCategories,
  currentUserId,
  pointsEarnedTodayForDog = 0,
  streak,
  trainedSkillCount,
  totalSessionCount,
}: Props) {
  const t = useTranslations("dogTraining")
  const [activeDogId, setActiveDogId] = useState<string | null>(initialActiveDogId)
  const [formOpen, setFormOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDog, setEditingDog] = useState<Dog | null>(null)
  const [extensionOpen, setExtensionOpen] = useState(false)

  const activeDog = dogs.find((d) => d.id === activeDogId) ?? null
  const overview = initialOverview
  const dailyChallenge = initialDailyChallenge

  const recommendedIds = [
    dailyChallenge?.maintenance?.skillDefinitionId,
    dailyChallenge?.progression?.skillDefinitionId,
    dailyChallenge?.discovery?.skillDefinitionId,
  ].filter(Boolean) as string[]

  if (dogs.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h1 className="text-3xl font-light uppercase tracking-wide mb-2">{t("empty.title")}</h1>
        <p className="text-muted-foreground mb-6">{t("empty.subtitle")}</p>
        <Button onClick={() => setFormOpen(true)}>{t("empty.action")}</Button>
        <DogFormSheet open={formOpen} onOpenChange={setFormOpen} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-light uppercase tracking-wide">{t("tab")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {dogs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dogs.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDogId(d.id)}
              className={`px-3 py-1 rounded-sm text-sm font-bold ${
                activeDogId === d.id
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {d.emoji} {d.name}
            </button>
          ))}
          <button
            onClick={() => {
              setEditingDog(null)
              setFormOpen(true)
            }}
            className="px-3 py-1 rounded-sm text-sm border border-border"
          >
            +
          </button>
        </div>
      )}

      {activeDog && (
        <>
          <div className="rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-transparent border border-border">
            <div className="flex items-center gap-4 p-5">
              {activeDog.photoBase64 ? (
                <img
                  src={activeDog.photoBase64}
                  alt={activeDog.name}
                  className="w-[90px] h-[90px] rounded-full object-cover border-2 border-white/20 flex-shrink-0"
                />
              ) : (
                <div className="w-[90px] h-[90px] rounded-full bg-muted flex items-center justify-center text-4xl border-2 border-white/20 flex-shrink-0">
                  {activeDog.emoji}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xl font-bold uppercase tracking-wide">{activeDog.name}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {t(`phases.${activeDog.phase}`)}
                  {activeDog.breed && ` · ${activeDog.breed}`}
                </div>
                <div className="flex gap-5 mt-3">
                  <div className="text-center">
                    <div className="text-lg font-bold">{totalSessionCount ?? 0}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("hero.sessions")}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">{trainedSkillCount ?? 0}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("hero.skills")}</div>
                  </div>
                  <div className="text-center" aria-label={t("hero.streak")}>
                    <div className="text-lg font-bold"><span aria-hidden="true">🔥 </span>{streak ?? 0}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("hero.streak")}</div>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => {
                  setEditingDog(activeDog)
                  setFormOpen(true)
                }}
              >
                {t("editDog")}
              </Button>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              {t("recommendations.title")}
            </div>
            <div className="space-y-2">
              {(["maintenance", "progression", "discovery"] as const).map((slot) => {
                const rec = dailyChallenge?.[slot]
                if (!rec) return null
                const def = allSkills.find((s) => s.id === rec.skillDefinitionId)
                if (!def) return null

                const slotConfig = {
                  maintenance: { icon: "🔄", bgClass: "bg-green-500/10", textClass: "text-green-500" },
                  progression: { icon: "📈", bgClass: "bg-blue-500/10", textClass: "text-blue-500" },
                  discovery: { icon: "✨", bgClass: "bg-purple-500/10", textClass: "text-purple-500" },
                }[slot]

                const subtitle = (() => {
                  if (slot === "maintenance" && rec.lastTrainedAt) {
                    const days = Math.floor((Date.now() - new Date(rec.lastTrainedAt).getTime()) / 86400000)
                    return t("recommendations.context.daysAgo", { days })
                  }
                  if (slot === "progression") {
                    return t("recommendations.context.sessionsOf", {
                      done: rec.trainedCount,
                      needed: 10,
                    })
                  }
                  return def.categoryNameDe
                })()

                const statusLabel = rec.status === "new"
                  ? t("statuses.new")
                  : t(`statuses.${rec.status}`)

                return (
                  <div key={slot} className="flex items-center gap-3 rounded-lg bg-card border border-border p-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${slotConfig.bgClass}`}>
                      {slotConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{def.nameDe}</div>
                      <div className="text-xs text-muted-foreground">
                        {t(`recommendations.slot.${slot}`)} · {subtitle}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-[10px] ${slotConfig.textClass}`}>{statusLabel}</div>
                      {slot !== "discovery" ? (
                        <div className="h-[3px] w-10 bg-muted rounded-sm mt-1">
                          <div
                            className={`h-full rounded-sm ${slot === "maintenance" ? "bg-green-500" : "bg-blue-500"}`}
                            style={{ width: `${rec.progress * 100}%` }}
                          />
                        </div>
                      ) : (
                        <div className={`text-[9px] mt-0.5 px-1.5 py-0.5 border rounded ${slotConfig.textClass} border-current/30`}>
                          {def.difficulty === "beginner" ? "Anfänger" : def.difficulty === "intermediate" ? "Mittel" : "Fortgeschritten"}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-card border border-border p-3">
            <div className="text-sm font-medium">
              {t("points.today", { earned: pointsEarnedTodayForDog, cap: 40 })}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-600 ease-out ${
                    pointsEarnedTodayForDog >= 40
                      ? "bg-green-500"
                      : pointsEarnedTodayForDog >= 35
                        ? "bg-amber-500"
                        : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(100, (pointsEarnedTodayForDog / 40) * 100)}%` }}
                />
              </div>
              {pointsEarnedTodayForDog >= 40 && (
                <span className="text-xs text-green-500 font-medium">{t("points.goalReached")}</span>
              )}
            </div>
          </div>

          <Button className="w-full" onClick={() => setModalOpen(true)}>
            {t("logTraining")}
          </Button>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              {t("pillars.title")}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {overview?.pillars.map((p: any, index: number) => {
                const totalSkills = p.skills.length
                const trainedSkills = p.skills.filter((s: any) => s.trainedCount > 0).length
                const masteredSkills = p.skills.filter((s: any) => s.effectiveStatus === "mastery").length
                const color = healthColor(p.health)
                const borderColor = healthBorderColor(p.health)
                const bgColor = healthBgColor(p.health)

                return (
                  <Link
                    key={p.category.id}
                    href={`/hunde/${activeDog!.id}/saule/${p.category.id}`}
                    className={`block rounded-lg p-3 border-l-[3px] transition-colors hover:bg-muted/50 animate-fade-in ${borderColor} ${bgColor}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-sm font-bold">
                        {p.category.emoji} {p.category.nameDe}
                      </div>
                      <div className={`text-xs font-bold ${healthTextColor(p.health)}`}>
                        {Math.round(p.health)}%
                      </div>
                    </div>
                    <div className="h-1 bg-muted/50 rounded-sm mt-2">
                      <div
                        className={`h-full rounded-sm transition-all duration-600 ease-out ${color}`}
                        style={{ width: `${p.health}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1.5">
                      {trainedSkills}/{totalSkills} Skills
                      {masteredSkills > 0 && ` · ${masteredSkills} ⭐`}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link href={`/hunde/${activeDog.id}/historie`}>{t("history.title")}</Link>
            </Button>
            <Button variant="outline" onClick={() => setExtensionOpen(true)}>
              {t("skillExtensionOpen")}
            </Button>
          </div>
        </>
      )}

      <DogFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        dog={editingDog ?? undefined}
      />
      {activeDog && (
        <TrainingLogModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          dogId={activeDog.id}
          dogName={activeDog.name}
          allDogs={dogs}
          allSkills={allSkills}
          recommendedSkillIds={recommendedIds}
          householdUsers={householdUsers}
          pointsEarnedTodayForDog={pointsEarnedTodayForDog}
          currentUserId={currentUserId}
        />
      )}
      {activeDog && (
        <SkillExtensionSheet
          open={extensionOpen}
          onOpenChange={setExtensionOpen}
          dog={{ name: activeDog.name, breed: activeDog.breed, phase: activeDog.phase }}
          categories={dogTrainingCategories}
          existingSkills={allSkills.map((s) => ({
            id: s.id,
            categoryId: s.categoryId,
            nameDe: s.nameDe,
            nameEn: s.nameEn,
            difficulty: s.difficulty,
          }))}
        />
      )}
    </div>
  )
}

function healthColor(health: number): string {
  if (health >= 75) return "bg-green-500"
  if (health >= 40) return "bg-blue-500"
  if (health >= 15) return "bg-amber-500"
  return "bg-red-500"
}

function healthBorderColor(health: number): string {
  if (health >= 75) return "border-green-500/30"
  if (health >= 40) return "border-blue-500/30"
  if (health >= 15) return "border-amber-500/30"
  return "border-red-500/30"
}

function healthBgColor(health: number): string {
  if (health >= 75) return "bg-green-500/[0.04]"
  if (health >= 40) return "bg-blue-500/[0.04]"
  if (health >= 15) return "bg-amber-500/[0.04]"
  return "bg-red-500/[0.04]"
}

function healthTextColor(health: number): string {
  if (health >= 75) return "text-green-500"
  if (health >= 40) return "text-blue-500"
  if (health >= 15) return "text-amber-500"
  return "text-red-500"
}
