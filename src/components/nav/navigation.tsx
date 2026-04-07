'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, ShoppingBag, Trophy, User, type LucideIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { getVisibleNavItems } from '@/lib/permissions'
import { LocaleSwitcher } from '@/components/locale-switcher'

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  CheckSquare,
  ShoppingBag,
  Trophy,
  User,
}

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const t = useTranslations('nav')
  const role = session?.user?.role ?? 'child'
  const navItems = getVisibleNavItems(role)

  return (
    <>
      {/* Mobile bottom bar */}
      <nav aria-label={t('mainNav')} className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex md:hidden z-50">
        {navItems.map(({ href, icon, labelKey }) => {
          const Icon = ICON_MAP[icon] ?? Home
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive(pathname, href) ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
                isActive(pathname, href) ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              <Icon size={20} />
              <span>{t(labelKey)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Desktop sidebar */}
      <nav aria-label={t('sidebar')} className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-slate-200 p-4 gap-1">
        <div className="text-lg font-bold mb-6 px-3">{t('brand')}</div>
        {navItems.map(({ href, icon, labelKey }) => {
          const Icon = ICON_MAP[icon] ?? Home
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive(pathname, href) ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(pathname, href)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} />
              {t(labelKey)}
            </Link>
          )
        })}
        <div className="mt-auto pt-4 px-3">
          <LocaleSwitcher />
        </div>
      </nav>
    </>
  )
}
