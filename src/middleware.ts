import createIntlMiddleware from 'next-intl/middleware'
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

const publicPaths = ['/login', '/setup']

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function isIgnoredPath(pathname: string): boolean {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icons/') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js'
  )
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (isIgnoredPath(pathname)) {
    return NextResponse.next()
  }
  if (isPublicPath(pathname)) {
    return intlMiddleware(req)
  }
  const token = await getToken({ req })
  if (!token) {
    const loginUrl = new URL('/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Sync locale from user profile to cookie
  if (token.locale && typeof token.locale === 'string') {
    const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value
    if (cookieLocale !== token.locale) {
      const response = intlMiddleware(req)
      response.cookies.set('NEXT_LOCALE', token.locale, {
        path: '/',
        maxAge: 31536000,
      })
      return response
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|icons|manifest.json|sw.js).*)'],
}
