'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Brain, BarChart3 } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/krs', label: 'AI Workforce', icon: Brain },
  { href: '/monitoring', label: 'Monitoring', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()

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
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
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
          })}
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
