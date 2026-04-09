"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { DogFormSheet } from "@/components/dogs/dog-form-sheet"
import { TrainingLogModal } from "@/components/dogs/training-log-modal"

type Dog = {
  id: string
  name: string
  emoji: string
  photoBase64: string | null
  breed: string | null
  phase: string
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
  }>
  currentUserId: string
}

export function DogsClient({
  dogs,
  initialActiveDogId,
  initialOverview,
  initialDailyChallenge,
  householdUsers,
  allSkills,
  currentUserId,
}: Props) {
  const t = useTranslations("dogTraining")
  const [activeDogId, setActiveDogId] = useState<string | null>(initialActiveDogId)
  const [formOpen, setFormOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDog, setEditingDog] = useState<Dog | null>(null)

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
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              {activeDog.photoBase64 ? (
                <img
                  src={activeDog.photoBase64}
                  alt={activeDog.name}
                  className="w-14 h-14 rounded-md object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center text-2xl">
                  {activeDog.emoji}
                </div>
              )}
              <div className="flex-1">
                <div className="text-lg font-bold uppercase">{activeDog.name}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t(`phases.${activeDog.phase}`)}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingDog(activeDog)
                  setFormOpen(true)
                }}
              >
                {t("editDog")}
              </Button>
            </CardContent>
          </Card>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {t("recommendations.title")}
            </div>
            <div className="space-y-2">
              {(["maintenance", "progression", "discovery"] as const).map((slot) => {
                const rec = dailyChallenge?.[slot]
                if (!rec) return null
                const def = allSkills.find((s) => s.id === rec.skillDefinitionId)
                return (
                  <Card key={slot}>
                    <CardContent className="flex items-center gap-3 py-3">
                      <Badge variant="default" className="uppercase text-xs">
                        {t(`recommendations.slot.${slot}`)}
                      </Badge>
                      <div className="flex-1">{def?.nameDe}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <Button className="mt-3 w-full" onClick={() => setModalOpen(true)}>
              {t("logTraining")}
            </Button>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {t("pillars.title")}
            </div>
            <div className="space-y-3">
              {overview?.pillars.map((p: any) => (
                <Link
                  key={p.category.id}
                  href={`/hunde/${activeDog.id}/saule/${p.category.id}`}
                  className="block"
                >
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {p.category.nameDe}
                  </div>
                  <div className="h-1 bg-muted rounded-sm">
                    <div
                      className={`h-full rounded-sm ${healthColor(p.health)}`}
                      style={{ width: `${p.health}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" asChild>
              <Link href={`/hunde/${activeDog.id}/historie`}>{t("history.title")}</Link>
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
          pointsEarnedTodayForDog={0}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}

function healthColor(health: number): string {
  if (health >= 75) return "bg-success"
  if (health >= 40) return "bg-accent"
  if (health >= 15) return "bg-warning"
  return "bg-danger"
}
