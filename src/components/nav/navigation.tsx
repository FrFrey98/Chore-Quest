'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, ShoppingBag, Trophy, User, ClipboardCheck, ListTodo, Settings, type LucideIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getVisibleNavItems } from '@/lib/permissions'
import type { Role } from '@/generated/prisma'

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
  ClipboardCheck,
  ListTodo,
  Settings,
}

export function Navigation() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as { role?: Role } | undefined)?.role ?? 'child'
  const navItems = getVisibleNavItems(role)

  return (
    <>
      {/* Mobile bottom bar */}
      <nav aria-label="Hauptnavigation" className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex md:hidden z-50">
        {navItems.map(({ href, icon, label }) => {
          const Icon = ICON_MAP[icon]
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive(pathname, href) ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
                isActive(pathname, href) ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              {Icon && <Icon size={20} />}
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Desktop sidebar */}
      <nav aria-label="Seitenleiste" className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-slate-200 p-4 gap-1">
        <div className="text-lg font-bold mb-6 px-3">🏠 Chore-Quest</div>
        {navItems.map(({ href, icon, label }) => {
          const Icon = ICON_MAP[icon]
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
              {Icon && <Icon size={18} />}
              {label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
