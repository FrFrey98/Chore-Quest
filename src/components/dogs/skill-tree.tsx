"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { SkillDetailSheet } from "./skill-detail-sheet"

type Props = {
  dog: any
  pillar: any
  recentSessions: any[]
}

export function SkillTreeView({ dog, pillar, recentSessions }: Props) {
  const t = useTranslations("dogTraining")
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const selected = selectedSkillId
    ? pillar.skills.find((s: any) => s.definition.id === selectedSkillId)
    : null

  return (
    <div className="space-y-4">
      <Link href={`/hunde`} className="text-sm text-muted-foreground underline">
        ← {dog.name}
      </Link>
      <div>
        <h1 className="text-2xl font-light uppercase tracking-wide">
          {pillar.category.nameDe}
        </h1>
        <div className="text-sm text-muted-foreground">
          {pillar.health}% {t("pillars.health")}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {pillar.skills.map((s: any) => (
          <button
            key={s.definition.id}
            onClick={() => setSelectedSkillId(s.definition.id)}
            className={`text-left p-3 border border-border rounded-md ${
              s.trainedCount === 0 ? "opacity-60 border-dashed" : ""
            }`}
          >
            <div className="font-bold text-sm">{s.definition.nameDe}</div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
              {t(`statuses.${s.effectiveStatus}`)}
            </div>
            <div className="h-1 bg-muted rounded-sm mt-2">
              <div
                className="h-full bg-accent rounded-sm"
                style={{ width: `${s.effectiveProgress * 100}%` }}
              />
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <SkillDetailSheet
          open={!!selected}
          onOpenChange={(o) => !o && setSelectedSkillId(null)}
          skill={selected}
          recentSessions={recentSessions}
          dogId={dog.id}
        />
      )}
    </div>
  )
}
