'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, ShoppingBag, Trophy, User, Swords, Scroll, type LucideIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { getVisibleNavItems } from '@/lib/permissions'
import { LocaleSwitcher } from '@/components/locale-switcher'
import { ThemeToggle } from '@/components/theme-toggle'

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
  Swords,
  Scroll,
}

interface NavigationProps {
  dogTrainingEnabled?: boolean
}

export function Navigation({ dogTrainingEnabled = false }: NavigationProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const t = useTranslations('nav')
  const role = session?.user?.role ?? 'child'
  const navItems = getVisibleNavItems(role, dogTrainingEnabled)

  return (
    <>
      {/* Mobile bottom bar */}
      <nav aria-label={t('mainNav')} className="fixed bottom-0 left-0 right-0 bg-nav-bg border-t border-nav-border flex md:hidden z-50">
        {navItems.map(({ href, icon, emoji, labelKey }) => {
          const Icon = ICON_MAP[icon]
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive(pathname, href) ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
                isActive(pathname, href) ? 'text-accent font-bold' : 'text-nav-muted'
              }`}
            >
              {emoji ? (
                <span className="text-xl leading-none">{emoji}</span>
              ) : Icon ? (
                <Icon size={20} />
              ) : null}
              <span>{t(labelKey)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Desktop sidebar */}
      <nav aria-label={t('sidebar')} className="hidden md:flex flex-col w-56 min-h-screen bg-nav-bg border-r border-nav-border p-4 gap-1">
        <div className="text-sm font-bold mb-6 px-3 uppercase tracking-wide text-nav-foreground">{t('brand')}</div>
        {navItems.map(({ href, icon, emoji, labelKey }) => {
          const Icon = ICON_MAP[icon]
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive(pathname, href) ? 'page' : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(pathname, href)
                  ? 'text-accent font-bold'
                  : 'text-nav-muted hover:text-nav-foreground hover:bg-white/5'
              }`}
            >
              {emoji ? (
                <span className="text-lg leading-none w-[18px] flex items-center justify-center">{emoji}</span>
              ) : Icon ? (
                <Icon size={18} />
              ) : null}
              {t(labelKey)}
            </Link>
          )
        })}
        <div className="mt-auto pt-4 px-3 flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </nav>
    </>
  )
}
