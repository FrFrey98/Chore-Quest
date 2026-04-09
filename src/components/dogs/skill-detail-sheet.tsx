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

export function SkillDetailSheet({ open, onOpenChange, skill, recentSessions }: Props) {
  const t = useTranslations("dogTraining")
  const skillSessions = recentSessions
    .filter((s) => s.skillsTrained.some((x: any) => x.skillDefinitionId === skill.definition.id))
    .slice(0, 5)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {skill.definition.nameDe}
            <Badge variant="default" className="text-xs uppercase">
              {skill.definition.difficulty}
            </Badge>
            {!skill.definition.isSystem && (
              <Badge className="text-xs">✨ KI</Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-3">
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
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {t("skillInstructions")}
            </div>
            <p className="text-sm mt-1 leading-relaxed">
              {skill.definition.descriptionDe}
            </p>
          </div>
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
