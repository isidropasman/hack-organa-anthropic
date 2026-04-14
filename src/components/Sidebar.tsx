'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Brain, BarChart3, Sparkles } from 'lucide-react'

const adminNavItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/krs', label: 'AI Workforce', icon: Brain },
  { href: '/monitoring', label: 'Monitoring', icon: BarChart3 },
]

const employeeNavItems = [
  { href: '/my-twin/ops-twin', label: 'Mi Twin', icon: Sparkles },
]

export default function Sidebar() {
  const pathname = usePathname()

  const navLink = (href: string, label: string, Icon: React.ElementType) => {
    const isActive =
      href === '/'
        ? pathname === '/'
        : pathname.startsWith(href.startsWith('/my-twin') ? '/my-twin' : href)
    return (
      <li key={href}>
        <Link
          href={href}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-organa-accent/20 text-organa-accent border border-organa-accent/30'
              : 'text-organa-text-muted hover:text-organa-text hover:bg-organa-border/60'
          }`}
        >
          <Icon size={15} />
          {label}
        </Link>
      </li>
    )
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-organa-surface border-r border-organa-border flex flex-col min-h-screen sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-organa-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-organa-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold">O</span>
          </div>
          <span className="font-bold text-organa-text text-lg tracking-tight">ORGANA</span>
        </div>
        <p className="text-organa-text-muted text-xs mt-1.5">Organizational Memory</p>
      </div>

      {/* Navigation */}
      <nav className="p-3 flex-1">
        {/* Admin section */}
        <p className="px-3 mb-1 text-xs font-semibold text-organa-text-muted uppercase tracking-widest opacity-60">
          Admin
        </p>
        <ul className="space-y-0.5 mb-4">
          {adminNavItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}
        </ul>

        {/* Divider */}
        <div className="border-t border-organa-border mx-1 mb-4" />

        {/* Employee section */}
        <p className="px-3 mb-1 text-xs font-semibold text-organa-text-muted uppercase tracking-widest opacity-60">
          Empleado
        </p>
        <ul className="space-y-0.5">
          {employeeNavItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-organa-border">
        <p className="text-organa-text-muted text-xs font-medium">Nova Agency</p>
        <p className="text-organa-text-muted text-xs opacity-50 mt-0.5">Demo workspace</p>
      </div>
    </aside>
  )
}
