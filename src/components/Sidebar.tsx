'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Brain, BarChart3, Sparkles, ShieldCheck, User } from 'lucide-react'
import { getCurrentUser, type CurrentUser } from '@/lib/auth'
import RoleSwitcher from './RoleSwitcher'

const adminNavItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/krs', label: 'AI Workforce', icon: Brain },
  { href: '/monitoring', label: 'Monitoring', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

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

  const initials = user?.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?'

  const isAdmin = user?.role === 'admin'
  const myTwinHref = `/my-twin/${user?.agentId ?? 'ops-twin'}`

  return (
    <aside className="w-60 flex-shrink-0 bg-organa-surface border-r border-organa-border flex flex-col min-h-screen sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-5 border-b border-organa-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-organa-accent flex items-center justify-center">
            <span className="text-white text-xs font-bold">O</span>
          </div>
          <span className="font-bold text-organa-text text-lg tracking-tight">ORGANA</span>
        </div>
        <p className="text-organa-text-muted text-xs mt-1">Organizational Memory</p>
      </div>

      {/* User avatar */}
      {user && (
        <div className="px-4 py-3 border-b border-organa-border flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-organa-accent/20 border border-organa-accent/30 flex items-center justify-center flex-shrink-0">
            <span className="text-organa-accent text-xs font-bold">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-organa-text text-xs font-medium truncate">{user.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {isAdmin
                ? <ShieldCheck size={10} className="text-organa-accent opacity-80" />
                : <User size={10} className="text-organa-text-muted opacity-80" />
              }
              <span className={`text-[10px] font-medium ${isAdmin ? 'text-organa-accent' : 'text-organa-text-muted'}`}>
                {isAdmin ? 'Admin' : 'Empleado'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-3 flex-1">
        {isAdmin ? (
          <ul className="space-y-0.5">
            {adminNavItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}
          </ul>
        ) : (
          <ul className="space-y-0.5">
            {navLink(myTwinHref, 'Mi Twin', Sparkles)}
          </ul>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-organa-border space-y-2">
        <RoleSwitcher />
        <div>
          <p className="text-organa-text-muted text-xs font-medium px-2">Nova Agency</p>
          <p className="text-organa-text-muted text-xs opacity-50 px-2">Demo workspace</p>
        </div>
      </div>
    </aside>
  )
}
