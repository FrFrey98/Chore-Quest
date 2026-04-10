import { redirect } from 'next/navigation'

export default async function QuestsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/challenges?tab=quests`)
}
