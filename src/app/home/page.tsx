'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { agentStore } from '@/lib/agent-store'
import { getEmployeeData } from '@/lib/mock-data-employee'
import { LEVEL_LABELS, LEVEL_THRESHOLDS } from '@/lib/types'
import type { AgentLevel } from '@/lib/types'

// ─── Mock home stats ──────────────────────────────────────────────────────────

interface HomeStats {
  points: number
  level: AgentLevel
  automationsActive: number
  automationsPending: number
  timeSavedThisWeek: number   // minutos
  rankingPosition: number
  totalEmployees: number
  weeklyActivity: { chats: number; recordings: number; automationsRun: number }
}

const MOCK_STATS: Record<string, HomeStats> = {
  'ops-twin': {
    points: 850,
    level: 'silver',
    automationsActive: 3,
    automationsPending: 1,
    timeSavedThisWeek: 240,
    rankingPosition: 2,
    totalEmployees: 13,
    weeklyActivity: { chats: 12, recordings: 2, automationsRun: 18 },
  },
  'marketing-twin': {
    points: 320,
    level: 'bronze',
    automationsActive: 1,
    automationsPending: 2,
    timeSavedThisWeek: 90,
    rankingPosition: 5,
    totalEmployees: 13,
    weeklyActivity: { chats: 6, recordings: 1, automationsRun: 7 },
  },
}

// ─── Level config ─────────────────────────────────────────────────────────────

const LEVEL_CONFIG: Record<AgentLevel, {
  bg: string; text: string; bar: string; border: string; nextBg: string
}> = {
  bronze: {
    bg: 'bg-[#CD7F32]',
    text: 'text-[#CD7F32]',
    bar: 'bg-[#CD7F32]',
    border: 'border-[#CD7F32]/30',
    nextBg: 'bg-[#9E9E9E]',
  },
  silver: {
    bg: 'bg-[#9E9E9E]',
    text: 'text-[#9E9E9E]',
    bar: 'bg-[#9E9E9E]',
    border: 'border-[#9E9E9E]/30',
    nextBg: 'bg-[#D4A800]',
  },
  gold: {
    bg: 'bg-[#D4A800]',
    text: 'text-[#D4A800]',
    bar: 'bg-[#D4A800]',
    border: 'border-[#D4A800]/30',
    nextBg: 'bg-[#4F6BED]',
  },
  elite: {
    bg: 'bg-[#4F6BED]',
    text: 'text-[#4F6BED]',
    bar: 'bg-[#4F6BED]',
    border: 'border-[#4F6BED]/30',
    nextBg: 'bg-[#4F6BED]',
  },
}

const LEVEL_ORDER: AgentLevel[] = ['bronze', 'silver', 'gold', 'elite']

function getLevelProgress(points: number, level: AgentLevel) {
  const idx = LEVEL_ORDER.indexOf(level)
  const nextLevel = LEVEL_ORDER[idx + 1] as AgentLevel | undefined
  if (!nextLevel) return { pct: 100, remaining: 0, nextLevel: null }
  const rangeStart = LEVEL_THRESHOLDS[level]
  const rangeEnd = LEVEL_THRESHOLDS[nextLevel]
  const pct = Math.round(((points - rangeStart) / (rangeEnd - rangeStart)) * 100)
  return { pct, remaining: rangeEnd - points, nextLevel }
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  sub,
  accent,
}: {
  value: string
  label: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div className="bg-white border border-organa-border rounded-2xl p-5 shadow-card">
      <div className={`text-3xl font-bold leading-none mb-1 ${accent ? 'text-organa-success' : 'text-organa-text'}`}>
        {value}
      </div>
      <div className="text-organa-text-muted text-xs uppercase tracking-wide">{label}</div>
      {sub && <div className="text-organa-text-secondary text-xs mt-1">{sub}</div>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EmployeeHomePage() {
  const [lines, setLines] = useState<[string, string]>(['', ''])
  const [greetingDone, setGreetingDone] = useState(false)
  const [barWidth, setBarWidth] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [chatHref, setChatHref] = useState<string | null | 'not-found'>('loading')
  const abortRef = useRef<AbortController | null>(null)

  // Read user client-side
  const [agentId, setAgentId] = useState('ops-twin')
  useEffect(() => {
    const u = getCurrentUser()
    const id = u.agentId ?? 'ops-twin'
    setAgentId(id)
    // Resolve chat link: try stored agentId first, then match by name
    let realAgent = agentStore.getAgent(id)
    if (!realAgent && u.name) {
      const all = agentStore.getAllAgents()
      realAgent = all.find(a => a.name.toLowerCase() === u.name.toLowerCase()) ?? null
    }
    if (realAgent) {
      setChatHref(realAgent.onboardingComplete ? `/agent/${realAgent.id}` : `/onboard/${realAgent.id}`)
    } else {
      setChatHref('not-found')
    }
  }, [])

  const employeeData = getEmployeeData(agentId) ?? getEmployeeData('ops-twin')!
  const stats = MOCK_STATS[agentId] ?? MOCK_STATS['ops-twin']
  const cfg = LEVEL_CONFIG[stats.level]
  const { pct, remaining, nextLevel } = getLevelProgress(stats.points, stats.level)

  const initials = employeeData.employeeName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Fetch greeting
  useEffect(() => {
    setMounted(true)
    const ctrl = new AbortController()
    abortRef.current = ctrl

    const userData = {
      name: employeeData.employeeName,
      role: employeeData.role,
      points: stats.points,
      level: stats.level,
      pointsToNextLevel: remaining,
      automationsActive: stats.automationsActive,
      automationsPending: stats.automationsPending,
      timeSavedThisWeek: stats.timeSavedThisWeek,
      lastActivity: new Date().toISOString(),
      rankingPosition: stats.rankingPosition,
      totalEmployees: stats.totalEmployees,
      weeklyActivity: stats.weeklyActivity,
    }

    async function fetchGreeting() {
      try {
        const res = await fetch('/api/home-greeting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
          signal: ctrl.signal,
        })
        if (!res.body) return
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n')
          buffer = parts.pop() ?? ''
          for (const line of parts) {
            if (!line.startsWith('data: ')) continue
            try {
              const event = JSON.parse(line.slice(6))
              if (event.type === 'text') {
                accumulated += event.text
                // Split into 2 lines as they stream in
                const split = accumulated.split('\n').filter(l => l.trim())
                setLines([split[0] ?? '', split[1] ?? ''])
              } else if (event.type === 'done') {
                setGreetingDone(true)
              }
            } catch { /* skip */ }
          }
        }
        setGreetingDone(true)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setLines([`Hi ${employeeData.employeeName} 👋 Your agent is ready for today.`, ''])
          setGreetingDone(true)
        }
      }
    }

    fetchGreeting()
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId])

  // Animate bar
  useEffect(() => {
    if (!mounted) return
    const t = setTimeout(() => setBarWidth(pct), 200)
    return () => clearTimeout(t)
  }, [mounted, pct])

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-organa-bg p-8 max-w-4xl mx-auto">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-white border border-organa-border rounded-2xl p-6 shadow-card mb-5 flex items-center gap-5">
        {/* Avatar */}
        <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-white text-lg font-bold ${cfg.bg}`}>
          {initials}
        </div>

        {/* Greeting */}
        <div className="flex-1 min-w-0">
          {lines[0] ? (
            <>
              <p className="text-organa-text font-medium text-sm leading-snug">
                {lines[0]}
                {!greetingDone && !lines[1] && (
                  <span className="inline-block w-1 h-3.5 bg-organa-accent ml-0.5 animate-pulse rounded-sm align-middle" />
                )}
              </p>
              {lines[1] && (
                <p className="text-organa-text-secondary text-sm mt-1 leading-snug">
                  {lines[1]}
                  {!greetingDone && (
                    <span className="inline-block w-1 h-3.5 bg-organa-accent ml-0.5 animate-pulse rounded-sm align-middle" />
                  )}
                </p>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <div className="skeleton h-3.5 rounded w-3/4" />
              <div className="skeleton h-3.5 rounded w-1/2" />
            </div>
          )}
        </div>

        {/* Points + level */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <div className="text-right">
            <div className={`text-2xl font-bold leading-none ${cfg.text}`}>
              {stats.points.toLocaleString()}
            </div>
            <div className="text-organa-text-muted text-[10px] uppercase tracking-wide mt-0.5">points</div>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-white text-xs font-bold ${cfg.bg}`}>
            {LEVEL_LABELS[stats.level]}
          </div>
        </div>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {chatHref === 'loading' && (
          <div className="bg-organa-accent/50 text-white rounded-2xl p-5 cursor-wait">
            <div className="text-2xl mb-3">💬</div>
            <div className="font-semibold text-sm">Chat with your agent</div>
            <div className="text-white/65 text-xs mt-0.5">+5 pts per message</div>
          </div>
        )}
        {chatHref === 'not-found' && (
          <Link
            href="/"
            className="bg-organa-accent hover:bg-organa-accent-hover text-white rounded-2xl p-5 shadow-button transition-colors block"
          >
            <div className="text-2xl mb-3">💬</div>
            <div className="font-semibold text-sm">Create your agent</div>
            <div className="text-white/65 text-xs mt-0.5">Complete onboarding first</div>
          </Link>
        )}
        {chatHref && chatHref !== 'loading' && chatHref !== 'not-found' && (
          <Link
            href={chatHref}
            className="bg-organa-accent hover:bg-organa-accent-hover text-white rounded-2xl p-5 shadow-button transition-colors block"
          >
            <div className="text-2xl mb-3">💬</div>
            <div className="font-semibold text-sm">Chat with your agent</div>
            <div className="text-white/65 text-xs mt-0.5">+5 pts per message</div>
          </Link>
        )}

        <Link
          href="/record"
          className="bg-white border border-organa-border hover:border-organa-accent hover:shadow-card-hover text-organa-text rounded-2xl p-5 shadow-card transition-all text-left block"
        >
          <div className="text-2xl mb-3">🖥️</div>
          <div className="font-semibold text-sm">Record a task</div>
          <div className="text-organa-text-muted text-xs mt-0.5">+20 pts per recording</div>
        </Link>

        <Link
          href="/automations"
          className="bg-white border border-organa-border hover:border-organa-accent hover:shadow-card-hover text-organa-text rounded-2xl p-5 shadow-card transition-all text-left block"
        >
          <div className="text-2xl mb-3">⚡</div>
          <div className="font-semibold text-sm">My automations</div>
          <div className="text-organa-text-muted text-xs mt-0.5">+30 pts per approval</div>
        </Link>
      </div>

      {/* ── Alert: automatizaciones pendientes ────────────────────────── */}
      {stats.automationsPending > 0 && (
        <Link
          href="/automations"
          className="w-full mb-5 bg-amber-50 border border-amber-200 hover:border-amber-400 rounded-2xl px-5 py-3.5 flex items-center gap-3 transition-colors text-left shadow-card group block"
        >
          <span className="text-amber-500 text-xl flex-shrink-0">⚡</span>
          <div className="flex-1">
            <span className="text-amber-800 font-semibold text-sm">
              {stats.automationsPending} automation{stats.automationsPending > 1 ? 's' : ''} pending approval
            </span>
            <span className="text-amber-600 text-xs ml-2">· +30 pts</span>
          </div>
          <span className="text-amber-400 text-xs font-medium group-hover:translate-x-0.5 transition-transform">Approve →</span>
        </Link>
      )}

      {/* ── Stat cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard
          value={formatMinutes(stats.timeSavedThisWeek)}
          label="Time saved"
          sub="this week"
          accent
        />
        <StatCard
          value={String(stats.automationsActive)}
          label="Automations"
          sub="active"
        />
        <StatCard
          value={`#${stats.rankingPosition}`}
          label="Ranking"
          sub={`of ${stats.totalEmployees} employees`}
        />
        <StatCard
          value={`${stats.weeklyActivity.chats}`}
          label="Chats"
          sub="this week"
        />
      </div>

      {/* ── Progress bar ──────────────────────────────────────────────── */}
      <div className="bg-white border border-organa-border rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${cfg.text}`}>{LEVEL_LABELS[stats.level]}</span>
            {nextLevel && (
              <>
                <span className="text-organa-border text-xs">→</span>
                <span className="text-sm font-bold text-organa-text-muted">{LEVEL_LABELS[nextLevel]}</span>
              </>
            )}
          </div>
          <span className="text-organa-text-muted text-xs">
            {nextLevel
              ? `${remaining.toLocaleString()} pts to next level`
              : 'Max level ✨'}
          </span>
        </div>

        {/* Track */}
        <div className="relative h-3 bg-organa-bg rounded-full overflow-hidden border border-organa-border">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${cfg.bar}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        {/* Level dots */}
        <div className="flex justify-between mt-2">
          {LEVEL_ORDER.map(lvl => (
            <div key={lvl} className="flex flex-col items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${
                LEVEL_ORDER.indexOf(lvl) <= LEVEL_ORDER.indexOf(stats.level)
                  ? LEVEL_CONFIG[lvl].bg
                  : 'bg-organa-border'
              }`} />
              <span className="text-[10px] text-organa-text-muted">{LEVEL_LABELS[lvl]}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
