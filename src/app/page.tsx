'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { agentStore } from '@/lib/agent-store'
import MarkdownMessage from '@/components/MarkdownMessage'
import type { Agent } from '@/lib/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function readinessColor(score: number) {
  if (score >= 80) return 'text-organa-success'
  if (score >= 40) return 'text-amber-500'
  return 'text-red-500'
}

function readinessBar(score: number) {
  if (score >= 80) return 'bg-organa-success'
  if (score >= 40) return 'bg-amber-400'
  return 'bg-red-400'
}

function deptColor(dept: string) {
  const palette = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-green-100 text-green-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700',
  ]
  let h = 0
  for (const c of dept) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return palette[h % palette.length]
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  sub,
  color = 'text-organa-text',
  href,
}: {
  value: string | number
  label: string
  sub?: string
  color?: string
  href?: string
}) {
  const inner = (
    <div className={`bg-white border border-organa-border rounded-2xl p-5 shadow-card h-full ${href ? 'hover:border-organa-accent hover:shadow-card-hover transition-all cursor-pointer' : ''}`}>
      <div className={`text-3xl font-bold leading-none mb-1 ${color}`}>{value}</div>
      <div className="text-organa-text-muted text-xs uppercase tracking-wide">{label}</div>
      {sub && <div className="text-organa-text-secondary text-xs mt-1">{sub}</div>}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

// ─── Untrained agent row ──────────────────────────────────────────────────────

function UntrainedRow({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/onboard/${agent.id}`}
      className="flex items-center gap-3 py-2.5 hover:bg-organa-bg px-3 -mx-3 rounded-xl transition-colors group"
    >
      <div className="w-7 h-7 rounded-full bg-organa-accent/10 border border-organa-accent/20 flex items-center justify-center flex-shrink-0">
        <span className="text-organa-accent text-[10px] font-bold">{getInitials(agent.name)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-organa-text text-xs font-medium truncate">{agent.name}</p>
        <p className="text-organa-text-muted text-[10px] truncate">{agent.role}</p>
      </div>
      <span className="text-organa-accent text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        Train →
      </span>
    </Link>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [insight, setInsight] = useState('')
  const [insightDone, setInsightDone] = useState(false)
  const [mounted, setMounted] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setMounted(true)
    const all = agentStore.getAllAgents()
    setAgents(all)
    if (all.length > 0) fetchInsight(all)

    return () => abortRef.current?.abort()
  }, [])

  async function fetchInsight(all: Agent[]) {
    const ctrl = new AbortController()
    abortRef.current = ctrl

    const payload = {
      totalAgents: all.length,
      trainedAgents: all.filter(a => a.onboardingComplete).length,
      departments: Array.from(new Set(all.map(a => a.department))),
      totalAutomations: all.reduce((s, a) => s + a.automations.length, 0),
      activeAutomations: all.reduce((s, a) => s + a.automations.filter(x => x.status === 'active').length, 0),
      pendingAutomations: all.reduce((s, a) => s + a.automations.filter(x => x.status === 'pending_approval').length, 0),
      failedAutomations: all.reduce((s, a) => s + a.automations.filter(x => x.status === 'failed').length, 0),
      timeSavedMinutes: all.reduce((s, a) => s + a.automations.reduce((ss, x) => ss + x.timeSavedMinutes, 0), 0),
      topAgent: [...all].sort((a, b) => b.points - a.points)[0]?.name ?? null,
      untrainedAgents: all.filter(a => !a.onboardingComplete).map(a => ({ name: a.name, role: a.role })),
      levelDistribution: {
        bronze: all.filter(a => a.level === 'bronze').length,
        silver: all.filter(a => a.level === 'silver').length,
        gold: all.filter(a => a.level === 'gold').length,
        elite: all.filter(a => a.level === 'elite').length,
      },
    }

    try {
      const res = await fetch('/api/admin-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      })
      if (!res.body) return

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let acc = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const ev = JSON.parse(line.slice(6))
            if (ev.type === 'text') { acc += ev.text; setInsight(acc) }
            else if (ev.type === 'done') setInsightDone(true)
          } catch { /* skip */ }
        }
      }
      setInsightDone(true)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setInsightDone(true)
    }
  }

  if (!mounted) return null

  // ── Derived metrics ─────────────────────────────────────────────────────────

  const companyName = agentStore.getCompanyName()
  const trained = agents.filter(a => a.onboardingComplete)
  const untrained = agents.filter(a => !a.onboardingComplete)
  const coverage = agents.length > 0 ? Math.round((trained.length / agents.length) * 100) : 0

  const allAutos = agents.flatMap(a => a.automations)
  const activeAutos = allAutos.filter(x => x.status === 'active').length
  const pendingAutos = allAutos.filter(x => x.status === 'pending_approval').length
  const failedAutos = allAutos.filter(x => x.status === 'failed').length
  const totalTimeSaved = allAutos.reduce((s, x) => s + x.timeSavedMinutes, 0)

  const depts = Array.from(new Set(agents.map(a => a.department))).filter(Boolean)

  const noAgents = agents.length === 0

  // ── Trained agents with readiness, top 5 ────────────────────────────────────
  const trainedSorted = [...trained].sort((a, b) => b.points - a.points).slice(0, 5)

  function fmtTime(m: number) {
    const h = Math.floor(m / 60), rem = m % 60
    return rem > 0 ? `${h}h ${rem}m` : h > 0 ? `${h}h` : `${m}m`
  }

  return (
    <main className="min-h-screen bg-organa-bg p-8 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-organa-text">
            {companyName}
            <span className="ml-2 text-organa-text-muted font-normal text-lg">— Dashboard</span>
          </h1>
          <p className="text-organa-text-muted text-sm mt-1">
            AI workforce overview and automation status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/agents"
            className="bg-organa-accent hover:bg-organa-accent-hover text-white rounded-xl px-4 py-2 text-sm font-semibold shadow-button transition-colors"
          >
            View agents
          </Link>
          <Link
            href="/admin/automations"
            className="border border-organa-border bg-white hover:border-organa-accent text-organa-text rounded-xl px-4 py-2 text-sm font-semibold shadow-card transition-colors"
          >
            Automations
          </Link>
        </div>
      </div>

      {/* ── No agents state ── */}
      {noAgents && (
        <div className="bg-white border border-organa-border rounded-2xl p-10 shadow-card flex flex-col items-center gap-4 text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-organa-accent-light flex items-center justify-center text-3xl">📋</div>
          <div>
            <p className="text-organa-text font-semibold text-base">No agents yet</p>
            <p className="text-organa-text-muted text-sm mt-1 max-w-xs">
              Import the org chart to generate the team's agents.
            </p>
          </div>
          <Link
            href="/agents"
            className="bg-organa-accent hover:bg-organa-accent-hover text-white rounded-xl px-5 py-2.5 text-sm font-semibold shadow-button transition-colors"
          >
            Import org chart →
          </Link>
        </div>
      )}

      {/* ── Stats row ── */}
      {!noAgents && (
        <>
          <div className="grid grid-cols-6 gap-3 mb-6">
            <StatCard
              value={agents.length}
              label="Agents"
              sub={`${depts.length} departments`}
              href="/agents"
            />
            <StatCard
              value={`${coverage}%`}
              label="Coverage"
              sub={`${trained.length} trained`}
              color={coverage >= 80 ? 'text-organa-success' : coverage >= 50 ? 'text-amber-500' : 'text-red-500'}
            />
            <StatCard
              value={activeAutos}
              label="Automations"
              sub="active"
              color="text-organa-success"
              href="/admin/automations"
            />
            <StatCard
              value={pendingAutos}
              label="Pending"
              sub="approval"
              color={pendingAutos > 0 ? 'text-amber-500' : 'text-organa-text-muted'}
              href="/admin/automations"
            />
            <StatCard
              value={failedAutos}
              label="Errors"
              sub="need attention"
              color={failedAutos > 0 ? 'text-red-500' : 'text-organa-text-muted'}
              href="/admin/automations"
            />
            <StatCard
              value={totalTimeSaved > 0 ? fmtTime(totalTimeSaved) : '—'}
              label="Time saved"
              sub="by automations"
              color="text-organa-accent"
            />
          </div>

          {/* ── Coverage bar ── */}
          <div className="bg-white border border-organa-border rounded-2xl p-4 shadow-card mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-organa-text text-xs font-semibold">Team coverage</span>
              <span className="text-organa-text-muted text-xs">{trained.length} / {agents.length} agents trained</span>
            </div>
            <div className="h-2.5 bg-organa-bg rounded-full overflow-hidden border border-organa-border">
              <div
                className="h-full rounded-full bg-organa-success transition-all duration-700"
                style={{ width: `${coverage}%` }}
              />
            </div>
            {depts.length > 0 && (
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {depts.map(d => {
                  const inDept = agents.filter(a => a.department === d)
                  const trainedInDept = inDept.filter(a => a.onboardingComplete).length
                  return (
                    <span key={d} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${deptColor(d)}`}>
                      {d} {trainedInDept}/{inDept.length}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Alerts ── */}
          {failedAutos > 0 && (
            <Link href="/admin/automations" className="block mb-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-card hover:border-red-400 transition-colors">
                <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
                <p className="text-red-700 text-sm font-medium flex-1">
                  {failedAutos} automation{failedAutos > 1 ? 's' : ''} with errors in the team
                </p>
                <span className="text-red-500 text-xs font-semibold flex-shrink-0">View →</span>
              </div>
            </Link>
          )}
          {pendingAutos > 0 && failedAutos === 0 && (
            <Link href="/admin/automations" className="block mb-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-card hover:border-amber-400 transition-colors">
                <span className="text-amber-500 text-xl flex-shrink-0">⏳</span>
                <p className="text-amber-800 text-sm font-medium flex-1">
                  {pendingAutos} automation{pendingAutos > 1 ? 's' : ''} waiting for approval
                </p>
                <span className="text-amber-600 text-xs font-semibold flex-shrink-0">Approve →</span>
              </div>
            </Link>
          )}

          {/* ── Two-column body ── */}
          <div className="grid grid-cols-3 gap-5">

            {/* ── AI Insight (2/3) ── */}
            <div className="col-span-2 bg-white border border-organa-border rounded-2xl p-6 shadow-card">
              <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-organa-border">
                <div className="w-7 h-7 rounded-full bg-organa-accent flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">🤖</span>
                </div>
                <div className="flex-1">
                  <p className="text-organa-text font-semibold text-sm">AI workforce analysis</p>
                  <p className="text-organa-text-muted text-xs">Generated in real time by Claude</p>
                </div>
                {!insightDone && (
                  <span className="inline-block w-1.5 h-4 bg-organa-accent animate-pulse rounded-sm" />
                )}
              </div>

              {insight ? (
                <div className="prose prose-sm max-w-none text-organa-text-secondary">
                  <MarkdownMessage content={insight} />
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="skeleton h-3 rounded w-full" />
                  <div className="skeleton h-3 rounded w-5/6" />
                  <div className="skeleton h-3 rounded w-4/5" />
                  <div className="skeleton h-3 rounded w-3/4 mt-4" />
                  <div className="skeleton h-3 rounded w-full" />
                </div>
              )}
            </div>

            {/* ── Right column (1/3) ── */}
            <div className="space-y-4">

              {/* Top trained agents */}
              <div className="bg-white border border-organa-border rounded-2xl p-5 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-organa-text font-semibold text-sm">Top agents</p>
                  <Link href="/agents" className="text-organa-accent text-xs font-medium hover:underline">
                    View all →
                  </Link>
                </div>
                {trainedSorted.length === 0 ? (
                  <p className="text-organa-text-muted text-xs">No trained agents yet.</p>
                ) : (
                  <div className="space-y-2">
                    {trainedSorted.map((agent, i) => (
                      <Link
                        key={agent.id}
                        href={`/agent/${agent.id}`}
                        className="flex items-center gap-2.5 py-1.5 group"
                      >
                        <span className="text-organa-text-muted text-[10px] w-3 flex-shrink-0 font-bold">
                          {i + 1}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-organa-accent/10 border border-organa-accent/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-organa-accent text-[9px] font-bold">{getInitials(agent.name)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-organa-text text-xs font-medium truncate group-hover:text-organa-accent transition-colors">
                            {agent.name}
                          </p>
                          <p className="text-organa-text-muted text-[10px] truncate">{agent.role}</p>
                        </div>
                        <span className="text-organa-text-muted text-[10px] font-semibold flex-shrink-0">
                          {agent.points.toLocaleString()} pts
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Untrained */}
              {untrained.length > 0 && (
                <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-organa-text font-semibold text-sm">
                      Untrained
                      <span className="ml-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {untrained.length}
                      </span>
                    </p>
                    <Link href="/agents" className="text-organa-text-muted text-xs hover:underline">
                      View all →
                    </Link>
                  </div>
                  <div className="space-y-0.5">
                    {untrained.slice(0, 4).map(agent => (
                      <UntrainedRow key={agent.id} agent={agent} />
                    ))}
                    {untrained.length > 4 && (
                      <p className="text-organa-text-muted text-[10px] pt-1 pl-3">
                        +{untrained.length - 4} más
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Quick actions */}
              <div className="bg-white border border-organa-border rounded-2xl p-5 shadow-card">
                <p className="text-organa-text font-semibold text-sm mb-3">Quick actions</p>
                <div className="space-y-2">
                  {[
                    { href: '/agents', label: 'Manage agents', icon: '👥' },
                    { href: '/admin/automations', label: 'View automations', icon: '⚡' },
                    { href: '/krs', label: 'AI Workforce (KRS)', icon: '🧠' },
                    { href: '/monitoring', label: 'Monitoring', icon: '📊' },
                  ].map(({ href, label, icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2.5 py-2 px-3 -mx-3 rounded-xl hover:bg-organa-bg transition-colors group"
                    >
                      <span className="text-sm">{icon}</span>
                      <span className="text-organa-text text-xs font-medium group-hover:text-organa-accent transition-colors flex-1">
                        {label}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-organa-text-muted group-hover:text-organa-accent transition-colors">
                        <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
