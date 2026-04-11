"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { TrainingHeatmap } from "./training-heatmap"
import { ProgressChart } from "./progress-chart"

type Props = {
  dog: any
  sessions: any[]
  teamStats: any[]
  sessionCounts?: Record<string, number>
  weeklyPoints?: Array<{ weekLabel: string; points: number }>
}

export function HistoryView({ dog, sessions, teamStats, sessionCounts, weeklyPoints }: Props) {
  const t = useTranslations("dogTraining.history")

  return (
    <div className="space-y-6">
      <Link href={`/hunde`} className="text-sm text-muted-foreground underline">
        ← {dog.name}
      </Link>

      {sessionCounts && (
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {t("last90Days")}
          </div>
          <TrainingHeatmap sessionCounts={sessionCounts} />
        </div>
      )}

      {weeklyPoints && weeklyPoints.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {t("pointsPerWeek")}
          </div>
          <ProgressChart weeklyPoints={weeklyPoints} />
        </div>
      )}

      <div>
        <h1 className="text-2xl font-light uppercase tracking-wide mb-2">{t("title")}</h1>
        <div className="space-y-2">
          {sessions.map((s) => (
            <Card key={s.id}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold">{new Date(s.completedAt).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.user.name}{s.withUser ? ` + ${s.withUser.name}` : ""}
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs">{s.durationMinutes} min</Badge>
                  <Badge variant="default" className="text-xs">{s.pointsAwarded} P</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {s.skillsTrained.map((sk: any) => (
                    <span key={sk.id} className="text-xs bg-muted px-2 py-0.5 rounded-sm">
                      {sk.skillDefinition.nameDe}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {sessions.length === 0 && (
            <div className="text-sm text-muted-foreground py-6 text-center">
              {t("empty")}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold uppercase tracking-wide mb-2">{t("team")}</h2>
        <div className="space-y-2">
          {teamStats.map((u) => (
            <Card key={u.userId}>
              <CardContent className="py-3">
                <div className="text-sm font-bold">{u.userName}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {u.totalSessions} {t("sessions")} · {u.thisMonthSessions} {t("thisMonth")} · {u.totalMinutes} min
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
