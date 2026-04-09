"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useTranslations } from "next-intl"
import { Step1Prompt } from "./step-1-prompt"
import { Step2Import } from "./step-2-import"

export type ExtensionCategory = {
  id: string
  nameDe: string
  nameEn: string
}

export type ExtensionSkill = {
  id: string
  categoryId: string
  nameDe: string
  nameEn: string
  difficulty: string
}

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  dog: { name: string; breed: string | null; phase: string }
  categories: ExtensionCategory[]
  existingSkills: ExtensionSkill[]
}

export function SkillExtensionSheet({
  open,
  onOpenChange,
  dog,
  categories,
  existingSkills,
}: Props) {
  const t = useTranslations("dogTraining.skillExtension")
  const [step, setStep] = useState<1 | 2>(1)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
        </SheetHeader>
        <div className="flex gap-2 my-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`px-3 py-1 text-xs uppercase font-bold rounded-sm ${
              step === 1
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            1. {t("step1")}
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`px-3 py-1 text-xs uppercase font-bold rounded-sm ${
              step === 2
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            2. {t("step2")}
          </button>
        </div>
        {step === 1 ? (
          <Step1Prompt
            dog={dog}
            categories={categories}
            existingSkills={existingSkills}
            onNext={() => setStep(2)}
          />
        ) : (
          <Step2Import onDone={() => onOpenChange(false)} />
        )}
      </SheetContent>
    </Sheet>
  )
}
