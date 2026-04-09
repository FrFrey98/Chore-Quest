// src/app/actions/dog-training/check-achievements.ts
// Stub to be filled out in Task 28 — returns empty array for now.
// Accepts any transaction client to avoid depending on Prisma type.

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function checkAndUnlockDogAchievements(
  _tx: any,
  _userId: string,
  _dogId: string,
): Promise<Array<{ id: string; titleDe: string; titleEn: string; emoji: string }>> {
  return []
}
