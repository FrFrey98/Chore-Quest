import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  // Verify webhook secret
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const message = body?.message
  if (!message?.text || !message?.chat?.id) {
    return NextResponse.json({ ok: true })
  }

  const text = message.text.trim()
  const chatId = String(message.chat.id)

  // Handle /link command — link account
  if (text.startsWith('/link ')) {
    const code = text.replace('/link ', '').trim()

    // Find user by link code (stored temporarily in AppConfig)
    const configEntry = await prisma.appConfig.findUnique({
      where: { key: `telegram_link_${code}` },
    })

    if (!configEntry) {
      await sendTelegramMessage(chatId, 'Invalid or expired link code.')
      return NextResponse.json({ ok: true })
    }

    const data = JSON.parse(configEntry.value)
    if (Date.now() > data.expiresAt) {
      await prisma.appConfig.delete({ where: { key: `telegram_link_${code}` } })
      await sendTelegramMessage(chatId, 'Link code expired. Please generate a new one.')
      return NextResponse.json({ ok: true })
    }
    const userId = data.userId

    // Update user's telegramChatId
    await prisma.user.update({
      where: { id: userId },
      data: { telegramChatId: chatId },
    })

    // Clean up the code
    await prisma.appConfig.delete({ where: { key: `telegram_link_${code}` } })

    await sendTelegramMessage(chatId, 'Account linked successfully! You will now receive notifications here.')
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}

async function sendTelegramMessage(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  }).catch(() => {})
}
