'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Brain, BarChart3, Sparkles, ShieldCheck, User, LayoutDashboard, Monitor, Zap, Users, Trophy, Settings, GitBranch, Network, ChevronLeft, ChevronRight, Cpu } from 'lucide-react'
import { getCurrentUser, type CurrentUser } from '@/lib/auth'
import RoleSwitcher from './RoleSwitcher'
import Logo from './Logo'

const adminNavItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/agents', label: 'Agents', icon: Users },
  { href: '/admin/automations', label: 'Automations', icon: Zap },
  { href: '/admin/portal', label: 'Portal', icon: Trophy },
  { href: '/krs', label: 'AI Workforce', icon: Brain },
  { href: '/monitoring', label: 'Monitoring', icon: BarChart3 },
  { href: '/settings', label: 'Integrations', icon: Settings },
  { href: '/org', label: 'Org Chart', icon: GitBranch },
  { href: '/brain', label: 'Org Brain', icon: Network },
  { href: '/civilization', label: 'Civilization', icon: Cpu },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const isAdmin = user?.role === 'admin'
  const myTwinHref = `/my-twin/${user?.agentId ?? 'ops-twin'}`
  const initials = user?.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  const navLink = (href: string, label: string, Icon: React.ElementType) => {
    const EXACT = ['/', '/home', '/record', '/automations', '/portal', '/agents', '/admin/automations', '/admin/portal', '/admin/leaderboard', '/leaderboard', '/krs', '/monitoring', '/settings']
    const isActive = EXACT.includes(href)
      ? pathname === href
      : pathname.startsWith(href.startsWith('/my-twin') ? '/my-twin' : href)
    return (
      <li key={href}>
        <Link
          href={href}
          title={collapsed ? label : undefined}
          className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          } ${collapsed ? 'justify-center' : ''}`}
        >
          <Icon size={15} className="flex-shrink-0" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </li>
    )
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 240 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="flex-shrink-0 bg-organa-surface border-r border-organa-border flex flex-col min-h-screen sticky top-0 h-screen overflow-hidden relative"
    >
      {/* Logo + collapse button */}
      <div className={`flex items-center border-b border-organa-border h-[65px] px-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <Logo size="sm" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setCollapsed(c => !c)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </motion.button>
      </div>

      {/* User avatar */}
      {user && (
        <div className={`py-3 border-b border-organa-border flex items-center gap-2.5 px-3 ${collapsed ? 'justify-center' : ''}`}>
          <div
            title={collapsed ? user.name : undefined}
            className="w-7 h-7 rounded-full bg-organa-accent/20 border border-organa-accent/30 flex items-center justify-center flex-shrink-0"
          >
            <span className="text-organa-accent text-[10px] font-bold">{initials}</span>
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="min-w-0 overflow-hidden"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-organa-text text-xs font-medium truncate">{user.name}</p>
                  <span className={`flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${
                    isAdmin
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {isAdmin ? 'Admin' : 'Employee'}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      <nav className="p-2 flex-1">
        {isAdmin ? (
          <>
            <ul className="space-y-0.5">
              {adminNavItems.map(({ href, label, icon: Icon }) => navLink(href, label, Icon))}
            </ul>
            <div className="my-2 border-t border-organa-border" />
            <ul className="space-y-0.5">
              {navLink(myTwinHref, 'My Twin', Sparkles)}
            </ul>
          </>
        ) : (
          <ul className="space-y-0.5">
            {navLink('/home', 'Home', LayoutDashboard)}
            {navLink(myTwinHref, 'My Twin', Sparkles)}
            {navLink('/record', 'Record Task', Monitor)}
            {navLink('/automations', 'Automations', Zap)}
            {navLink('/portal', 'Portal', Trophy)}
          </ul>
        )}
      </nav>

      {/* Footer */}
      <div className={`p-2 border-t border-organa-border space-y-2 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <RoleSwitcher />
              <div className="mt-2">
                <p className="text-organa-text-muted text-xs font-medium px-2">Nova Agency</p>
                <p className="text-organa-text-muted text-xs opacity-50 px-2">Demo workspace</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}
