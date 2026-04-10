"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import { useToast } from "@/components/toast-provider"
import { toggleDogTrainingFeature } from "@/app/actions/dog-training/toggle-feature"

type Props = {
  initialEnabled: boolean
  isAdmin: boolean
}

export function DogsTab({ initialEnabled, isAdmin }: Props) {
  const t = useTranslations("dogTraining.settings")
  const { toast } = useToast()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [pending, startTransition] = useTransition()

  const handleToggle = (checked: boolean) => {
    if (!isAdmin) return
    startTransition(async () => {
      try {
        await toggleDogTrainingFeature(checked)
        setEnabled(checked)
        toast(checked ? t("enabledToast") : t("disabledToast"), "success")
      } catch (e) {
        toast((e as Error).message, "error")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        <div className="flex items-center gap-3">
          <Switch
            id="dog-training-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={!isAdmin || pending}
          />
          <Label htmlFor="dog-training-toggle">{enabled ? t("toggleDisable") : t("toggle")}</Label>
        </div>
        {!isAdmin && (
          <p className="text-xs text-muted-foreground">{t("adminOnly")}</p>
        )}
        {enabled && (
          <p className="text-xs text-muted-foreground">{t("managedInHundeTab")}</p>
        )}
      </CardContent>
    </Card>
  )
}
