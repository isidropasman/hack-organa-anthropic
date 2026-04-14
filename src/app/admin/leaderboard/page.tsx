'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { agentStore } from '@/lib/agent-store'
import MarkdownMessage from '@/components/MarkdownMessage'
import { LEVEL_LABELS, LEVEL_THRESHOLDS } from '@/lib/types'
import type { Agent, AgentLevel } from '@/lib/types'

// ─── Demo display points ──────────────────────────────────────────────────────

const DEMO_POINTS = [850, 720, 650, 580, 490, 390, 310, 270, 200, 160, 110, 70, 30]

function displayPoints(agent: Agent, fallbackIdx: number): number {
  return agent.points > 0 ? agent.points : (DEMO_POINTS[fallbackIdx] ?? 20)
}

function displayLevel(pts: number): AgentLevel {
  if (pts >= LEVEL_THRESHOLDS.elite)  return 'elite'
  if (pts >= LEVEL_THRESHOLDS.gold)   return 'gold'
  if (pts >= LEVEL_THRESHOLDS.silver) return 'silver'
  return 'bronze'
}

// ─── Config ──────────────────────────────────────────────────────────────────

const LEVEL_STYLE: Record<AgentLevel, { badge: string; text: string }> = {
  bronze: { badge: 'bg-[#CD7F32]/10 text-[#8B5E2A] border-[#CD7F32]/30', text: 'text-[#CD7F32]' },
  silver: { badge: 'bg-gray-100 text-gray-600 border-gray-300',           text: 'text-gray-500'  },
  gold:   { badge: 'bg-yellow-50 text-yellow-700 border-yellow-300',       text: 'text-yellow-600'},
  elite:  { badge: 'bg-blue-50 text-blue-700 border-blue-200',             text: 'text-organa-accent' },
}

const RANK_ICON: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function demoActivity(pts: number) {
  return {
    chats: Math.floor(pts / 5),
    recordings: Math.floor(pts / 50),
    automations: pts >= 600 ? Math.floor((pts - 100) / 130) : pts >= 200 ? Math.floor((pts - 100) / 200) : 0,
  }
}

async function streamSSE(
  url: string, body: object,
  onText: (t: string) => void, onDone: () => void, signal: AbortSignal,
) {
  const res = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body), signal,
  })
  if (!res.body) return
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n'); buf = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try {
        const ev = JSON.parse(line.slice(6))
        if (ev.type === 'text') onText(ev.text)
        else if (ev.type === 'done') onDone()
      } catch { /* skip */ }
    }
  }
  onDone()
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface RankedEntry {
  agent: Agent
  pts: number
  level: AgentLevel
  rank: number         // global rank
  activeAutos: number
  chats: number
  recordings: number
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminLeaderboardPage() {
  const [mounted, setMounted] = useState(false)
  const [ranked, setRanked] = useState<RankedEntry[]>([])
  const [depts, setDepts] = useState<string[]>([])
  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [insight, setInsight] = useState('')
  const [insightDone, setInsightDone] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setMounted(true)
    const agents = agentStore.getAllAgents()

    const sorted: RankedEntry[] = [...agents]
      .map((agent, i) => {
        const pts = displayPoints(agent, i)
        const activity = demoActivity(pts)
        const realAutos = agent.automations.filter(a => a.status === 'active').length
        return {
          agent, pts, level: displayLevel(pts), rank: 0,
          activeAutos: realAutos > 0 ? realAutos : activity.automations,
          chats: activity.chats,
          recordings: activity.recordings,
        }
      })
      .sort((a, b) => b.pts - a.pts)
      .map((e, i) => ({ ...e, rank: i + 1 }))

    setRanked(sorted)
    setDepts(Array.from(new Set(sorted.map(e => e.agent.department).filter(Boolean))))

    // Claude insights
    const ctrl = new AbortController()
    abortRef.current = ctrl
    let acc = ''
    streamSSE(
      '/api/admin-leaderboard',
      sorted.map(e => ({
        name: e.agent.name, role: e.agent.role,
        department: e.agent.department, points: e.pts,
        level: e.level, automatizacionesActivas: e.activeAutos,
        chatsRealizados: e.chats, tareasGrabadas: e.recordings,
        onboardingCompleto: e.agent.onboardingComplete,
      })),
      t => { acc += t; setInsight(acc) },
      () => setInsightDone(true),
      ctrl.signal,
    ).catch(err => { if (err.name !== 'AbortError') setInsightDone(true) })

    return () => abortRef.current?.abort()
  }, [])

  if (!mounted) return null

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = selectedDept === 'all'
    ? ranked
    : ranked.filter(e => e.agent.department === selectedDept)

  // ── Global stats ───────────────────────────────────────────────────────────
  const withOnboarding = ranked.filter(e => e.agent.onboardingComplete).length
  const withAutos = ranked.filter(e => e.activeAutos > 0).length

  // Dept summary for the dept filter bar
  const deptAvg: Record<string, number> = {}
  for (const d of depts) {
    const entries = ranked.filter(e => e.agent.department === d)
    deptAvg[d] = Math.round(entries.reduce((s, e) => s + e.pts, 0) / entries.length)
  }
  const topDept = depts.sort((a, b) => (deptAvg[b] ?? 0) - (deptAvg[a] ?? 0))[0]

  return (
    <main className="min-h-screen bg-organa-bg p-8 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-organa-text">Adoption ranking</h1>
          <p className="text-organa-text-secondary text-sm mt-1">
            Engagement del equipo · puntos, automatizaciones y actividad por empleado
          </p>
        </div>
        <div className="text-[10px] text-organa-text-muted bg-white border border-organa-border rounded-xl px-3 py-2 shadow-card flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-organa-success inline-block" />
          Mide engagement, no calidad de conocimiento
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { value: ranked.length, label: 'Participantes', sub: 'en el ranking' },
          { value: `${ranked.length > 0 ? Math.round(withOnboarding / ranked.length * 100) : 0}%`, label: 'Con onboarding', sub: `${withOnboarding} personas`, color: 'text-organa-success' },
          { value: withAutos, label: 'Con automatizaciones', sub: 'activas', color: 'text-organa-accent' },
          { value: topDept ?? '—', label: 'Sector líder', sub: topDept ? `${deptAvg[topDept]?.toLocaleString()} pts prom.` : '' },
        ].map(({ value, label, sub, color }) => (
          <div key={label} className="bg-white border border-organa-border rounded-2xl p-4 shadow-card">
            <div className={`text-xl font-bold leading-none truncate ${color ?? 'text-organa-text'}`}>{value}</div>
            <div className="text-organa-text-muted text-[10px] uppercase tracking-wide mt-1">{label}</div>
            {sub && <div className="text-organa-text-muted text-[10px] mt-0.5 opacity-70">{sub}</div>}
          </div>
        ))}
      </div>

      {/* ── Claude insight ── */}
      <div className="bg-white border border-organa-border rounded-2xl p-5 shadow-card mb-5">
        <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-organa-border">
          <div className="w-6 h-6 rounded-full bg-organa-accent flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs">🤖</span>
          </div>
          <div className="flex-1">
            <p className="text-organa-text font-semibold text-sm">Análisis de adopción</p>
            <p className="text-organa-text-muted text-xs">Líderes, quién activar, patrones del equipo</p>
          </div>
          {!insightDone && <span className="inline-block w-1.5 h-4 bg-organa-accent animate-pulse rounded-sm" />}
        </div>
        {insight ? (
          <div className="prose prose-sm max-w-none text-organa-text-secondary">
            <MarkdownMessage content={insight} />
          </div>
        ) : (
          <div className="space-y-2">
            <div className="skeleton h-3 rounded w-full" />
            <div className="skeleton h-3 rounded w-5/6" />
            <div className="skeleton h-3 rounded w-4/5" />
            <div className="skeleton h-3 rounded w-3/4 mt-3" />
          </div>
        )}
      </div>

      {/* ── Department filter ── */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-organa-text-muted text-xs font-medium mr-1">Sector:</span>
        <button
          onClick={() => setSelectedDept('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
            selectedDept === 'all'
              ? 'bg-organa-accent text-white border-organa-accent shadow-button'
              : 'bg-white text-organa-text-muted border-organa-border hover:border-organa-accent hover:text-organa-text'
          }`}
        >
          Todos
          <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            selectedDept === 'all' ? 'bg-white/20 text-white' : 'bg-organa-bg text-organa-text-muted'
          }`}>
            {ranked.length}
          </span>
        </button>
        {depts.map(dept => {
          const count = ranked.filter(e => e.agent.department === dept).length
          const isSelected = selectedDept === dept
          return (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                isSelected
                  ? 'bg-organa-accent text-white border-organa-accent shadow-button'
                  : 'bg-white text-organa-text-muted border-organa-border hover:border-organa-accent hover:text-organa-text'
              }`}
            >
              {dept}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-organa-bg text-organa-text-muted'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-organa-border rounded-2xl shadow-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_7rem_5.5rem_4.5rem_4.5rem_4.5rem] gap-2 px-5 py-2.5 border-b border-organa-border bg-organa-bg">
          {['#', 'Empleado', 'Nivel', 'Puntos', 'Automz.', 'Chats', 'Grabs.'].map(h => (
            <span key={h} className="text-[10px] text-organa-text-muted uppercase tracking-wide font-semibold">{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-organa-text-muted text-sm">Sin agentes en este sector.</p>
          </div>
        ) : (
          filtered.map((entry, idx) => {
            // Within filtered list, show local rank if filtering by dept
            const displayRank = selectedDept === 'all' ? entry.rank : idx + 1
            const style = LEVEL_STYLE[entry.level]

            return (
              <div
                key={entry.agent.id}
                className="grid grid-cols-[3rem_1fr_7rem_5.5rem_4.5rem_4.5rem_4.5rem] gap-2 px-5 py-3 border-b border-organa-border last:border-0 hover:bg-organa-bg/50 transition-colors items-center"
              >
                {/* Rank */}
                <div className="text-center">
                  {displayRank <= 3
                    ? <span className="text-lg">{RANK_ICON[displayRank]}</span>
                    : <span className="text-organa-text-muted font-bold text-sm">{displayRank}</span>
                  }
                </div>

                {/* Employee */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-organa-accent/10 border border-organa-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-organa-accent text-[9px] font-bold">{getInitials(entry.agent.name)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-organa-text font-medium text-xs truncate">{entry.agent.name}</p>
                    <p className="text-organa-text-muted text-[10px] truncate">
                      {selectedDept === 'all' ? `${entry.agent.role} · ${entry.agent.department}` : entry.agent.role}
                    </p>
                  </div>
                  {!entry.agent.onboardingComplete && (
                    <Link
                      href={`/onboard/${entry.agent.id}`}
                      className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full font-semibold hover:bg-amber-100 transition-colors flex-shrink-0 whitespace-nowrap"
                    >
                      Sin entrenar
                    </Link>
                  )}
                </div>

                {/* Level */}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border w-fit ${style.badge}`}>
                  {LEVEL_LABELS[entry.level]}
                </span>

                {/* Points */}
                <span className={`font-bold text-sm ${style.text}`}>
                  {entry.pts.toLocaleString()}
                </span>

                {/* Automations */}
                <span className={`text-sm font-semibold ${entry.activeAutos > 0 ? 'text-organa-success' : 'text-organa-text-muted'}`}>
                  {entry.activeAutos > 0 ? entry.activeAutos : '—'}
                </span>

                {/* Chats */}
                <span className="text-organa-text-muted text-sm">
                  {entry.chats > 0 ? entry.chats : '—'}
                </span>

                {/* Recordings */}
                <span className="text-organa-text-muted text-sm">
                  {entry.recordings > 0 ? entry.recordings : '—'}
                </span>
              </div>
            )
          })
        )}
      </div>

      {/* ── Footer ── */}
      <div className="mt-6 bg-organa-bg border border-organa-border rounded-xl px-4 py-3 flex items-start gap-2.5">
        <span className="text-sm flex-shrink-0">💡</span>
        <p className="text-xs text-organa-text-muted leading-relaxed">
          <span className="font-semibold text-organa-text">Este ranking mide engagement</span>, no calidad del conocimiento.{' '}
          Para scores de conocimiento ver{' '}
          <Link href="/krs" className="text-organa-accent font-medium hover:underline">AI Workforce</Link>.{' '}
          Para métricas operativas ver{' '}
          <Link href="/monitoring" className="text-organa-accent font-medium hover:underline">Monitoring</Link>.
        </p>
      </div>
    </main>
  )
}
