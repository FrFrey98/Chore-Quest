"use client"

import { useState, useTransition } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "next-intl"
import { useToast } from "@/components/toast-provider"
import { createDog } from "@/app/actions/dog-training/create-dog"
import { updateDog } from "@/app/actions/dog-training/update-dog"
import { archiveDog } from "@/app/actions/dog-training/archive-dog"
import { suggestPhase } from "@/lib/dog-training/phase"
import { DOG_PHASES } from "@/lib/dog-training/types"

type Dog = {
  id: string
  name: string
  emoji: string
  photoBase64: string | null
  breed: string | null
  gender: string | null
  birthDate: Date | null
  phase: string
  notes: string | null
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  dog?: Dog
}

async function compressToBase64(file: File, maxDim = 512, quality = 0.8): Promise<string> {
  const img = new Image()
  const url = URL.createObjectURL(file)
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error("image load failed"))
    img.src = url
  })
  const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(url)
  return canvas.toDataURL("image/jpeg", quality)
}

export function DogFormSheet({ open, onOpenChange, dog }: Props) {
  const t = useTranslations("dogTraining.dogForm")
  const { toast } = useToast()
  const [name, setName] = useState(dog?.name ?? "")
  const [emoji, setEmoji] = useState(dog?.emoji ?? "🐕")
  const [photo, setPhoto] = useState(dog?.photoBase64 ?? null)
  const [breed, setBreed] = useState(dog?.breed ?? "")
  const [gender, setGender] = useState(dog?.gender ?? "")
  const [birthDate, setBirthDate] = useState<string>(
    dog?.birthDate ? new Date(dog.birthDate).toISOString().slice(0, 10) : "",
  )
  const [phase, setPhase] = useState(dog?.phase ?? "adult")
  const [notes, setNotes] = useState(dog?.notes ?? "")
  const [pending, startTransition] = useTransition()

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const b64 = await compressToBase64(file)
      setPhoto(b64)
    } catch (err) {
      toast((err as Error).message, "error")
    }
  }

  const handleBirthDateChange = (value: string) => {
    setBirthDate(value)
    if (value) {
      const suggested = suggestPhase(new Date(value))
      setPhase(suggested)
    }
  }

  const handleSave = () => {
    startTransition(async () => {
      try {
        if (dog) {
          await updateDog({
            id: dog.id,
            name,
            emoji,
            photoBase64: photo,
            breed: breed || null,
            gender: (gender as "male" | "female" | "other") || null,
            birthDate: birthDate ? new Date(birthDate) : null,
            phase,
            notes: notes || null,
          })
        } else {
          await createDog({
            name,
            emoji,
            photoBase64: photo,
            breed: breed || null,
            gender: (gender as "male" | "female" | "other") || null,
            birthDate: birthDate ? new Date(birthDate) : null,
            phase,
            notes: notes || null,
          })
        }
        toast(t("saved"), "success")
        onOpenChange(false)
      } catch (e) {
        toast((e as Error).message, "error")
      }
    })
  }

  const handleArchive = () => {
    if (!dog) return
    if (!confirm(t("archiveConfirm"))) return
    startTransition(async () => {
      try {
        await archiveDog(dog.id)
        toast(t("archived"), "success")
        onOpenChange(false)
      } catch (e) {
        toast((e as Error).message, "error")
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{dog ? t("editTitle") : t("createTitle")}</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="dog-name">{t("name")}</Label>
            <Input id="dog-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="dog-photo">{t("photo")}</Label>
            <Input id="dog-photo" type="file" accept="image/*" onChange={handlePhoto} />
            {photo && (
              <img src={photo} alt="dog" className="mt-2 w-24 h-24 rounded-md object-cover" />
            )}
          </div>
          <div>
            <Label htmlFor="dog-emoji">{t("emoji")}</Label>
            <Input id="dog-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} />
          </div>
          <div>
            <Label htmlFor="dog-breed">{t("breed")}</Label>
            <Input id="dog-breed" value={breed} onChange={(e) => setBreed(e.target.value)} />
          </div>
          <div>
            <Label>{t("gender")}</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t("genderMale")}</SelectItem>
                <SelectItem value="female">{t("genderFemale")}</SelectItem>
                <SelectItem value="other">{t("genderOther")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dog-birth">{t("birthDate")}</Label>
            <Input id="dog-birth" type="date" value={birthDate} onChange={(e) => handleBirthDateChange(e.target.value)} />
          </div>
          <div>
            <Label>{t("phase")}</Label>
            <Select value={phase} onValueChange={setPhase}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DOG_PHASES.map((p) => (
                  <SelectItem key={p} value={p}>{t(`phases.${p}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dog-notes">{t("notes")}</Label>
            <Textarea id="dog-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={pending || !name}>{t("save")}</Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
            {dog && (
              <Button variant="destructive" onClick={handleArchive} disabled={pending} className="ml-auto">
                {t("archive")}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
