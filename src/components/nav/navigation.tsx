'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, ShoppingBag, Trophy, User } from 'lucide-react'

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

const NAV_ITEMS = [
  { href: '/',             icon: Home,        label: 'Home' },
  { href: '/tasks',        icon: CheckSquare, label: 'Aufgaben' },
  { href: '/store',        icon: ShoppingBag, label: 'Store' },
  { href: '/achievements', icon: Trophy,      label: 'Erfolge' },
  { href: '/profile',      icon: User,        label: 'Profil' },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile bottom bar — 5 items */}
      <nav aria-label="Hauptnavigation" className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex md:hidden z-50">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(pathname, href) ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${
              isActive(pathname, href) ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop sidebar */}
      <nav aria-label="Seitenleiste" className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-slate-200 p-4 gap-1">
        <div className="text-lg font-bold mb-6 px-3">🏠 Haushalt-Quest</div>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
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
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}
