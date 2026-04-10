"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "next-intl"
import { useToast } from "@/components/toast-provider"
import { buildSkillExtensionPrompt } from "@/lib/dog-training/prompt-generator"
import type { ExtensionCategory, ExtensionSkill } from "./index"

type Difficulty = "any" | "beginner" | "intermediate" | "advanced" | "mixed"

type Props = {
  dog: { name: string; breed: string | null; phase: string }
  categories: ExtensionCategory[]
  existingSkills: ExtensionSkill[]
  onNext: () => void
}

export function Step1Prompt({ dog, categories, existingSkills, onNext }: Props) {
  const t = useTranslations("dogTraining.skillExtension")
  const { toast } = useToast()
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    categories.map((c) => c.id),
  )
  const [count, setCount] = useState(5)
  const [difficulty, setDifficulty] = useState<Difficulty>("any")
  const [focusText, setFocusText] = useState("")

  const prompt = useMemo(() => {
    return buildSkillExtensionPrompt({
      dog: {
        name: dog.name,
        breed: dog.breed,
        phase: dog.phase as "puppy" | "adolescent" | "adult" | "senior" | "advanced",
      },
      categories,
      selectedCategoryIds,
      existingSkills,
      count,
      difficulty,
      focusText,
    })
  }, [dog, categories, selectedCategoryIds, existingSkills, count, difficulty, focusText])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      toast(t("copied"), "success")
    } catch {
      toast(t("copyFailed"), "error")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>{t("categories")}</Label>
        <div className="flex flex-wrap gap-1 mt-1">
          {categories.map((c) => {
            const active = selectedCategoryIds.includes(c.id)
            return (
              <button
                type="button"
                key={c.id}
                onClick={() =>
                  setSelectedCategoryIds((prev) =>
                    active ? prev.filter((id) => id !== c.id) : [...prev, c.id],
                  )
                }
                className={`px-2 py-1 text-xs rounded-sm ${
                  active
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {c.nameDe}
              </button>
            )
          })}
        </div>
      </div>
      <div>
        <Label htmlFor="ext-count">{t("count")}</Label>
        <Input
          id="ext-count"
          type="number"
          min={1}
          max={20}
          value={count}
          onChange={(e) =>
            setCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))
          }
        />
      </div>
      <div>
        <Label>{t("difficulty")}</Label>
        <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">{t("difficulties.any")}</SelectItem>
            <SelectItem value="beginner">{t("difficulties.beginner")}</SelectItem>
            <SelectItem value="intermediate">{t("difficulties.intermediate")}</SelectItem>
            <SelectItem value="advanced">{t("difficulties.advanced")}</SelectItem>
            <SelectItem value="mixed">{t("difficulties.mixed")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="ext-focus">{t("focus")}</Label>
        <Textarea
          id="ext-focus"
          value={focusText}
          onChange={(e) => setFocusText(e.target.value)}
        />
      </div>
      <div>
        <Label>{t("preview")}</Label>
        <Textarea
          readOnly
          value={prompt}
          className="font-mono text-xs h-48"
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={copy} disabled={selectedCategoryIds.length === 0}>
          {t("copyPrompt")}
        </Button>
        <Button variant="outline" onClick={onNext}>
          {t("goToImport")} →
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{t("helperText")}</p>
    </div>
  )
}
