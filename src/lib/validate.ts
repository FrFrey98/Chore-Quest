import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema } from 'zod'

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse }

export async function parseBody<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): Promise<ParseResult<T>> {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return {
      success: false,
      response: NextResponse.json({ error: 'Ungültiges JSON' }, { status: 400 }),
    }
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(', ')
    return {
      success: false,
      response: NextResponse.json({ error: message }, { status: 400 }),
    }
  }

  return { success: true, data: result.data }
}
