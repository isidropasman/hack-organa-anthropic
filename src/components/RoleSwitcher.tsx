'use client'

import { useState, useRef, useEffect } from 'react'
import { RefreshCw, ChevronDown, ShieldCheck, User } from 'lucide-react'
import { getCurrentUser, setCurrentUser, DEMO_ADMIN, DEMO_EMPLOYEE } from '@/lib/auth'

export default function RoleSwitcher() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<'admin' | 'employee'>('admin')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setRole(getCurrentUser().role)
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const switchTo = (target: 'admin' | 'employee') => {
    setCurrentUser(target === 'admin' ? DEMO_ADMIN : DEMO_EMPLOYEE)
    window.location.reload()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-md text-organa-text-muted hover:text-organa-text hover:bg-organa-border/60 transition-colors text-xs"
      >
        <RefreshCw size={11} className="opacity-60" />
        <span className="flex-1 text-left">Switch role</span>
        <ChevronDown size={11} className={`opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute bottom-full mb-1 left-0 right-0 bg-organa-surface border border-organa-border rounded-lg shadow-lg overflow-hidden z-50">
          <button
            onClick={() => switchTo('admin')}
            className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors ${
              role === 'admin'
                ? 'bg-organa-accent/15 text-organa-accent'
                : 'text-organa-text-muted hover:text-organa-text hover:bg-organa-border/60'
            }`}
          >
            <ShieldCheck size={12} />
            <span>Admin</span>
            {role === 'admin' && <span className="ml-auto opacity-60">✓</span>}
          </button>
          <button
            onClick={() => switchTo('employee')}
            className={`flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors ${
              role === 'employee'
                ? 'bg-organa-accent/15 text-organa-accent'
                : 'text-organa-text-muted hover:text-organa-text hover:bg-organa-border/60'
            }`}
          >
            <User size={12} />
            <span>Employee</span>
            {role === 'employee' && <span className="ml-auto opacity-60">✓</span>}
          </button>
        </div>
      )}
    </div>
  )
}
