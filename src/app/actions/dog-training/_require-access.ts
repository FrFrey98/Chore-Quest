import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { APP_CONFIG_FEATURE_KEY } from "@/lib/dog-training/types"

export async function requireDogTrainingAccess() {
  const user = await getCurrentUser()
  if (!user) throw new Error("Nicht eingeloggt")
  const cfg = await prisma.appConfig.findUnique({ where: { key: APP_CONFIG_FEATURE_KEY } })
  if (cfg?.value !== "true") throw new Error("Hundetraining ist nicht aktiviert")
  return user
}
