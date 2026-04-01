'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CheckSquare, ShoppingBag, BarChart2, Shield, Settings } from 'lucide-react'

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}

const MAIN_NAV = [
  { href: '/',           icon: Home,         label: 'Home' },
  { href: '/tasks',      icon: CheckSquare,  label: 'Aufgaben' },
  { href: '/store',      icon: ShoppingBag,  label: 'Store' },
  { href: '/stats',      icon: BarChart2,    label: 'Statistik' },
  { href: '/approvals',  icon: Shield,       label: 'Freigaben' },
]

export function Navigation() {
  const pathname = usePathname()
  const [approvalCount, setApprovalCount] = useState(0)

  useEffect(() => {
    fetch('/api/approvals/count')
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setApprovalCount(d.count ?? 0))
      .catch(() => {})
  }, [pathname])

  return (
    <>
      {/* Mobile top bar with admin access */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 py-2 md:hidden z-50">
        <span className="text-sm font-bold">🏠 Haushalt-Quest</span>
        <Link
          href="/admin"
          aria-current={isActive(pathname, '/admin') ? 'page' : undefined}
          className={`p-2 rounded-lg transition-colors ${
            isActive(pathname, '/admin') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'
          }`}
        >
          <Settings size={20} />
        </Link>
      </header>

      {/* Mobile bottom bar — 5 items */}
      <nav aria-label="Hauptnavigation" className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex md:hidden z-50">
        {MAIN_NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(pathname, href) ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors relative ${
              isActive(pathname, href) ? 'text-indigo-600' : 'text-slate-500'
            }`}
          >
            <span className="relative">
              <Icon size={20} />
              {href === '/approvals' && approvalCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-xs bg-red-500 text-white rounded-full px-1 min-w-4 text-center leading-4">
                  {approvalCount > 9 ? '9+' : approvalCount}
                </span>
              )}
            </span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop sidebar — all 6 items */}
      <nav aria-label="Seitenleiste" className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-slate-200 p-4 gap-1">
        <div className="text-lg font-bold mb-6 px-3">🏠 Haushalt-Quest</div>
        {[...MAIN_NAV, { href: '/admin', icon: Settings, label: 'Admin' }].map(({ href, icon: Icon, label }) => (
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
            {href === '/approvals' && approvalCount > 0 && (
              <span className="ml-auto text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-5 text-center">
                {approvalCount}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </>
  )
}
