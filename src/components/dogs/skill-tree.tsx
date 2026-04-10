"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { SkillDetailSheet } from "./skill-detail-sheet"
import { RadarChart } from "./radar-chart"
import type { SkillStatus } from "@/lib/dog-training/types"
import { statusRank } from "@/lib/dog-training/status"

type Props = {
  dog: any
  pillar: any
  allPillars: any[]
  recentSessions: any[]
  allSkillStatuses: Record<string, { bestStatus: string }>
}

const STATUS_COLORS: Record<string, { border: string; bg: string; text: string; bar: string }> = {
  mastery: { border: "border-green-500/30", bg: "bg-gradient-to-br from-green-500/[0.12] to-green-500/[0.04]", text: "text-green-500", bar: "bg-green-500" },
  maintenance: { border: "border-green-500/25", bg: "bg-gradient-to-br from-green-500/[0.08] to-green-500/[0.03]", text: "text-green-500", bar: "bg-green-500" },
  proficiency: { border: "border-blue-500/30", bg: "bg-gradient-to-br from-blue-500/[0.12] to-blue-500/[0.04]", text: "text-blue-500", bar: "bg-blue-500" },
  fluency: { border: "border-purple-500/30", bg: "bg-gradient-to-br from-purple-500/[0.12] to-purple-500/[0.04]", text: "text-purple-500", bar: "bg-purple-500" },
  acquisition: { border: "border-amber-500/30", bg: "bg-gradient-to-br from-amber-500/[0.12] to-amber-500/[0.04]", text: "text-amber-500", bar: "bg-amber-500" },
}

function isLocked(skill: any, allSkillStatuses: Record<string, { bestStatus: string }>): boolean {
  if (skill.trainedCount > 0) return false
  const prereqIds = skill.definition.prerequisiteIds
    ? skill.definition.prerequisiteIds.split(",").filter(Boolean)
    : []
  if (prereqIds.length === 0) return false
  return prereqIds.some((id: string) => {
    const s = allSkillStatuses[id]
    return !s || statusRank(s.bestStatus as SkillStatus) < statusRank("fluency")
  })
}

function getPrereqNames(skill: any, allPillarSkills: any[]): string[] {
  const prereqIds = skill.definition.prerequisiteIds
    ? skill.definition.prerequisiteIds.split(",").filter(Boolean)
    : []
  return prereqIds.map((id: string) => {
    const found = allPillarSkills.find((s: any) => s.definition.id === id)
    return found?.definition.nameDe ?? id
  })
}

export function SkillTreeView({ dog, pillar, allPillars, recentSessions, allSkillStatuses }: Props) {
  const t = useTranslations("dogTraining")
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const selected = selectedSkillId
    ? pillar.skills.find((s: any) => s.definition.id === selectedSkillId)
    : null

  const allPillarSkills = allPillars.flatMap((p: any) => p.skills)

  return (
    <div className="space-y-4">
      <Link href="/hunde" className="text-sm text-muted-foreground underline">
        ← {dog.name}
      </Link>
      <div>
        <h1 className="text-2xl font-light uppercase tracking-wide">
          {pillar.category.emoji} {pillar.category.nameDe}
        </h1>
        <div className="text-sm text-muted-foreground">
          {Math.round(pillar.health)}% {t("pillars.health")}
        </div>
      </div>

      <RadarChart
        pillars={allPillars.map((p: any) => ({
          id: p.category.id,
          name: p.category.nameDe,
          emoji: p.category.emoji,
          health: p.health,
        }))}
        activePillarId={pillar.category.id}
      />

      <div className="grid grid-cols-2 gap-3">
        {pillar.skills.map((s: any) => {
          const locked = isLocked(s, allSkillStatuses)
          const status = s.effectiveStatus as string
          const colors = STATUS_COLORS[status]

          if (locked) {
            const prereqNames = getPrereqNames(s, allPillarSkills)
            return (
              <div key={s.definition.id} className="text-left p-3 border border-dashed border-white/[0.08] rounded-lg bg-white/[0.02] opacity-40">
                <div className="font-bold text-sm text-muted-foreground/50">🔒 {s.definition.nameDe}</div>
                <div className="text-[10px] text-muted-foreground/40 mt-1">
                  {t("skillTree.requires", { skills: prereqNames.join(", ") })}
                </div>
              </div>
            )
          }

          if (!colors) {
            return (
              <button key={s.definition.id} onClick={() => setSelectedSkillId(s.definition.id)}
                className="text-left p-3 border border-dashed border-white/[0.12] rounded-lg bg-white/[0.02] opacity-60 hover:opacity-80 transition-opacity">
                <div className="font-bold text-sm text-muted-foreground/60">{s.definition.nameDe}</div>
                <div className="text-[10px] text-muted-foreground/40 mt-1">{t("skillTree.notTrained")}</div>
              </button>
            )
          }

          return (
            <button key={s.definition.id} onClick={() => setSelectedSkillId(s.definition.id)}
              className={`text-left p-3 border rounded-lg relative hover:scale-[1.02] hover:shadow-md transition-all ${colors.border} ${colors.bg}`}>
              {status === "mastery" && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-[10px]">⭐</div>
              )}
              <div className="font-bold text-sm">{s.definition.nameDe}</div>
              <div className={`text-[10px] mt-1 ${colors.text}`}>{t(`statuses.${status}`)}</div>
              <div className="h-[3px] bg-white/10 rounded-sm mt-2">
                <div className={`h-full rounded-sm transition-all duration-600 ease-out ${colors.bar}`}
                  style={{ width: `${s.effectiveProgress * 100}%` }} />
              </div>
            </button>
          )
        })}
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
