"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import { useToast } from "@/components/toast-provider"
import { importDogSkills } from "@/app/actions/dog-training/import-skills"

type Result = {
  imported: Array<{ id: string; nameDe: string }>
  skipped: Array<{ id: string; reason: string }>
  errors: string[]
} | null

type Props = {
  onDone: () => void
}

export function Step2Import({ onDone }: Props) {
  const t = useTranslations("dogTraining.skillExtension")
  const { toast } = useToast()
  const [raw, setRaw] = useState("")
  const [result, setResult] = useState<Result>(null)
  const [pending, startTransition] = useTransition()

  const handleValidate = () => {
    startTransition(async () => {
      try {
        const res = await importDogSkills(raw)
        setResult(res as Result)
        if (res.errors.length === 0 && res.imported.length > 0) {
          toast(t("importedCount", { count: res.imported.length }), "success")
        }
      } catch (e) {
        toast((e as Error).message, "error")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="import-json">{t("pasteResponse")}</Label>
        <Textarea
          id="import-json"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="font-mono text-xs h-48"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleValidate} disabled={!raw.trim() || pending}>
          {t("validateAndImport")}
        </Button>
        <Button variant="ghost" onClick={onDone}>
          {t("close")}
        </Button>
      </div>
      {result && (
        <div className="space-y-2">
          {result.errors.length > 0 && (
            <div className="border border-danger bg-danger/10 p-3 rounded-md">
              <div className="text-xs font-bold uppercase text-danger mb-1">
                {t("errors")}
              </div>
              <ul className="text-xs space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i}>• {e}</li>
                ))}
              </ul>
            </div>
          )}
          {result.skipped.length > 0 && (
            <div className="border border-warning bg-warning/10 p-3 rounded-md">
              <div className="text-xs font-bold uppercase text-warning mb-1">
                {t("warnings")}
              </div>
              <ul className="text-xs space-y-1">
                {result.skipped.map((s, i) => (
                  <li key={i}>
                    • {s.id}: {s.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.imported.length > 0 && (
            <div className="border border-success bg-success/10 p-3 rounded-md">
              <div className="text-xs font-bold uppercase text-success mb-1">
                {t("imported")}
              </div>
              <ul className="text-xs space-y-1">
                {result.imported.map((s) => (
                  <li key={s.id}>• {s.nameDe}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
