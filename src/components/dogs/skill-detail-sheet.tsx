"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  skill: any
  recentSessions: any[]
  dogId: string
}

function parseJsonField(value: string | null | undefined): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function SkillDetailSheet({ open, onOpenChange, skill, recentSessions }: Props) {
  const t = useTranslations("dogTraining")
  const skillSessions = recentSessions
    .filter((s) => s.skillsTrained.some((x: any) => x.skillDefinitionId === skill.definition.id))
    .slice(0, 5)

  const def = skill.definition
  const steps = parseJsonField(def.stepsDe)
  const mistakes = parseJsonField(def.mistakesDe)
  const hasStructured = steps.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {def.nameDe}
            <Badge variant="default" className="text-xs uppercase">
              {def.difficulty}
            </Badge>
            {!def.isSystem && (
              <Badge className="text-xs">✨ KI</Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-5 mt-3">
          {/* Status + Progress */}
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("statusLabel")}
            </div>
            <div className="text-sm">{t(`statuses.${skill.effectiveStatus}`)}</div>
            <div className="h-1 bg-muted rounded-sm mt-1">
              <div
                className="h-full bg-accent rounded-sm"
                style={{ width: `${skill.effectiveProgress * 100}%` }}
              />
            </div>
          </div>

          {hasStructured ? (
            <>
              {/* Steps */}
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  {t("skillDetail.steps")}
                </div>
                <ol className="space-y-2">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed">
                      <span className="text-muted-foreground font-bold flex-shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Mistakes */}
              {mistakes.length > 0 && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {t("skillDetail.mistakes")}
                  </div>
                  <ul className="space-y-1">
                    {mistakes.map((m, i) => (
                      <li key={i} className="text-sm leading-relaxed flex gap-2">
                        <span className="text-red-400 flex-shrink-0">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Progression */}
              {def.progressionDe && (
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    {t("skillDetail.progression")}
                  </div>
                  <p className="text-sm leading-relaxed">{def.progressionDe}</p>
                </div>
              )}

              {/* Pro Tip */}
              {def.proTipDe && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
                  <div className="text-xs uppercase tracking-wider text-amber-500 mb-1">
                    💡 {t("skillDetail.proTip")}
                  </div>
                  <p className="text-sm leading-relaxed">{def.proTipDe}</p>
                </div>
              )}

              {/* Meta tags */}
              <div className="flex flex-wrap gap-2">
                {def.durationMin && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    ⏱ {t("skillDetail.durationUnit", { min: def.durationMin })}
                  </span>
                )}
                {def.frequencyPerDay && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    🔁 {t("skillDetail.frequencyUnit", { count: def.frequencyPerDay })}
                  </span>
                )}
                {def.estimatedDays && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    📅 {t("skillDetail.estimatedDaysUnit", { days: def.estimatedDays })}
                  </span>
                )}
                {def.methodology && (
                  <span className="text-xs bg-muted px-2 py-1 rounded">
                    📖 {t(`skillDetail.methodologies.${def.methodology}`)}
                  </span>
                )}
              </div>
            </>
          ) : (
            /* Fallback for AI-generated skills without structured data */
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {t("skillInstructions")}
              </div>
              <p className="text-sm mt-1 leading-relaxed">{def.descriptionDe}</p>
            </div>
          )}

          {/* Recent sessions */}
          {skillSessions.length > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">
                {t("recentTraining")}
              </div>
              <ul className="text-sm mt-1 space-y-1">
                {skillSessions.map((s) => (
                  <li key={s.id}>{new Date(s.completedAt).toLocaleDateString()}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
