'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { agentStore } from '@/lib/agent-store'
import { portalStore } from '@/lib/portal-store'
import MarkdownMessage from '@/components/MarkdownMessage'
import { LEVEL_LABELS, LEVEL_THRESHOLDS } from '@/lib/types'
import type { Agent, AgentLevel } from '@/lib/types'
import type { PortalPost } from '@/lib/portal-store'

// ─── Feed types ───────────────────────────────────────────────────────────────

type FeedType = 'achievement' | 'automation' | 'recording' | 'level_up' | 'milestone'
interface FeedItem {
  id: string; type: FeedType; agentName: string; agentRole: string
  agentDept: string; agentId: string; text: string; timestamp: string; emoji: string; detail?: string
}

type AnyFeedItem =
  | (FeedItem & { kind: 'system' })
  | (PortalPost & { kind: 'post' })

// ─── Demo points ──────────────────────────────────────────────────────────────

const DEMO_PTS = [850, 720, 650, 580, 490, 390, 310, 270, 200, 160, 110, 70, 30]
function pts(agent: Agent, idx: number) { return (agent.points ?? 0) > 0 ? (agent.points ?? 0) : (DEMO_PTS[idx] ?? 20) }
function lvl(p: number): AgentLevel {
  if (p >= LEVEL_THRESHOLDS.elite) return 'elite'
  if (p >= LEVEL_THRESHOLDS.gold) return 'gold'
  if (p >= LEVEL_THRESHOLDS.silver) return 'silver'
  return 'bronze'
}
const LEVEL_STYLE: Record<AgentLevel, { badge: string; text: string }> = {
  bronze: { badge: 'bg-[#CD7F32]/10 text-[#8B5E2A] border-[#CD7F32]/30', text: 'text-[#CD7F32]' },
  silver: { badge: 'bg-gray-100 text-gray-600 border-gray-300', text: 'text-gray-500' },
  gold:   { badge: 'bg-yellow-50 text-yellow-700 border-yellow-300', text: 'text-yellow-600' },
  elite:  { badge: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-organa-accent' },
}
const RANK_ICON: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
function initials(name: string) { return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() }

// ─── Feed generation (shared logic) ──────────────────────────────────────────

function daysAgo(n: number) {
  const d = new Date('2026-04-14T12:00:00Z'); d.setDate(d.getDate() - n); return d.toISOString()
}

const SEEDED: FeedItem[] = [
  { id: 'seed-milestone-1', type: 'milestone', agentName: 'ORGANA', agentRole: 'Sistema', agentDept: '', agentId: '', text: 'El equipo superó 100 ejecuciones de automatizaciones este mes', timestamp: daysAgo(1), emoji: '🎯', detail: 'Más de 12 horas ahorradas en procesos repetitivos' },
  { id: 'seed-milestone-2', type: 'milestone', agentName: 'ORGANA', agentRole: 'Sistema', agentDept: '', agentId: '', text: 'Nova Agency activó su primer agente de IA hace 2 semanas', timestamp: daysAgo(6), emoji: '🚀', detail: '13 gemelos digitales en construcción' },
]

function buildFeed(agents: Agent[]): FeedItem[] {
  const items: FeedItem[] = [...SEEDED]
  for (const agent of agents) {
    if (agent.onboardingComplete && agent.knowledgeBase)
      items.push({ id: `onboard-${agent.id}`, type: 'achievement', agentName: agent.name, agentRole: agent.role, agentDept: agent.department, agentId: agent.id, text: 'completó su onboarding y activó su gemelo digital', timestamp: agent.knowledgeBase.completedAt, emoji: '✅', detail: `Agente de ${agent.role} listo para responder consultas` })
    for (const auto of (agent.automations ?? [])) {
      if (auto.status === 'active')
        items.push({ id: `auto-${auto.id}`, type: 'automation', agentName: agent.name, agentRole: agent.role, agentDept: agent.department, agentId: agent.id, text: `activó "${auto.name}"`, timestamp: auto.createdAt, emoji: '⚡', detail: auto.timeSavedMinutes > 0 ? `Ahorra ~${auto.timeSavedMinutes}min/${auto.estimatedFrequency === 'daily' ? 'día' : 'semana'}` : undefined })
      if (auto.source === 'recording' && auto.status !== 'failed')
        items.push({ id: `rec-${auto.id}`, type: 'recording', agentName: agent.name, agentRole: agent.role, agentDept: agent.department, agentId: agent.id, text: 'grabó una tarea para analizar', timestamp: auto.createdAt, emoji: '🖥️' })
    }
  }
  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 40)
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000); if (m < 1) return 'ahora'; if (m < 60) return `${m}m`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

const TYPE_LABEL: Record<FeedType, string> = { achievement: 'Logro', automation: 'Automatización', recording: 'Grabación', level_up: 'Nivel', milestone: 'Hito' }

// ─── SSE ──────────────────────────────────────────────────────────────────────

async function streamSSE(url: string, body: object, onText: (t: string) => void, onDone: () => void, signal: AbortSignal) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal })
  if (!res.body) return
  const reader = res.body.getReader(); const decoder = new TextDecoder(); let buf = ''
  while (true) {
    const { done, value } = await reader.read(); if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n'); buf = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try { const ev = JSON.parse(line.slice(6)); if (ev.type === 'text') onText(ev.text); else if (ev.type === 'done') onDone() } catch { /* skip */ }
    }
  }
  onDone()
}

// ─── Ranked types ─────────────────────────────────────────────────────────────

interface RankedEntry { agent: Agent; pts: number; level: AgentLevel; rank: number; activeAutos: number }

type Tab = 'feed' | 'ranking'
type FeedFilter = FeedType | 'all' | 'post'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPortalPage() {
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<Tab>('feed')
  const [feed, setFeed] = useState<AnyFeedItem[]>([])
  const [ranked, setRanked] = useState<RankedEntry[]>([])
  const [depts, setDepts] = useState<string[]>([])
  const [selectedDept, setSelectedDept] = useState<string>('all')
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all')
  const [insight, setInsight] = useState('')
  const [insightDone, setInsightDone] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setMounted(true)
    const agents = agentStore.getAllAgents()

    const sorted: RankedEntry[] = [...agents]
      .map((agent, i) => { const p = pts(agent, i); return { agent, pts: p, level: lvl(p), rank: 0, activeAutos: Math.max((agent.automations ?? []).filter(a => a.status === 'active').length, Math.floor(p / 200)) } })
      .sort((a, b) => b.pts - a.pts)
      .map((e, i) => ({ ...e, rank: i + 1 }))
    setRanked(sorted)
    setDepts(Array.from(new Set(sorted.map(e => e.agent.department).filter(Boolean))))

    const systemItems: AnyFeedItem[] = buildFeed(agents).map(f => ({ ...f, kind: 'system' as const }))
    const userPosts: AnyFeedItem[] = portalStore.getPosts().map(p => ({ ...p, kind: 'post' as const }))
    const merged = [...systemItems, ...userPosts].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 50)
    setFeed(merged)

    // Claude portal insight
    const allDepts = Array.from(new Set(agents.map(a => a.department)))
    const activeDepts = allDepts.filter(d => agents.some(a => a.department === d && (a.onboardingComplete || (a.automations ?? []).length > 0)))
    const inactiveDepts = allDepts.filter(d => !activeDepts.includes(d))
    const topDeptName = sorted[0]?.agent.department ?? ''
    const topDeptAvg = sorted.filter(e => e.agent.department === topDeptName).reduce((s, e, _, arr) => s + e.pts / arr.length, 0)

    const payload = {
      recentActivity: systemItems.slice(0, 8).map(f => {
        const sf = f as FeedItem & { kind: 'system' }
        return { type: sf.type, agentName: sf.agentName, role: sf.agentRole, dept: sf.agentDept, text: sf.text, timestamp: sf.timestamp }
      }),
      stats: {
        activeThisWeek: agents.filter(a => a.onboardingComplete || (a.automations ?? []).length > 0).length,
        automationsActivated: agents.reduce((s, a) => s + (a.automations ?? []).filter(x => x.status === 'active').length, 0),
        onboardingsCompleted: agents.filter(a => a.onboardingComplete).length,
        recordingsMade: agents.reduce((s, a) => s + (a.automations ?? []).filter(x => x.source === 'recording').length, 0),
      },
      topDept: { name: topDeptName, avgPoints: Math.round(topDeptAvg) },
      inactiveDepts,
      totalAgents: agents.length,
    }

    const ctrl = new AbortController(); abortRef.current = ctrl; let acc = ''
    streamSSE('/api/admin-portal', payload, t => { acc += t; setInsight(acc) }, () => setInsightDone(true), ctrl.signal)
      .catch(err => { if (err.name !== 'AbortError') setInsightDone(true) })

    return () => abortRef.current?.abort()
  }, [])

  if (!mounted) return null

  const filteredFeed = feedFilter === 'all'
    ? feed
    : feedFilter === 'post'
    ? feed.filter(f => f.kind === 'post')
    : feed.filter(f => f.kind === 'system' && f.type === feedFilter)
  const filteredRanked = selectedDept === 'all' ? ranked : ranked.filter(e => e.agent.department === selectedDept)

  const feedTypeCounts: Record<string, number> = {}
  const userPostCount = feed.filter(f => f.kind === 'post').length
  for (const item of feed) {
    if (item.kind === 'system') feedTypeCounts[item.type] = (feedTypeCounts[item.type] ?? 0) + 1
  }

  return (
    <main className="min-h-screen bg-organa-bg p-8 max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-organa-text">Team portal</h1>
          <p className="text-organa-text-secondary text-sm mt-1">Feed de actividad · rankings de adopción</p>
        </div>
        <div className="flex items-center gap-1 bg-organa-bg border border-organa-border rounded-xl p-1">
          {(['feed', 'ranking'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${t === tab ? 'bg-white text-organa-text shadow-card' : 'text-organa-text-muted hover:text-organa-text'}`}>
              {t === 'feed' ? '📣 Feed' : '🏆 Ranking'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { value: feed.filter(f => f.kind === 'system' && f.type !== 'milestone').length + userPostCount, label: 'Eventos esta semana', color: 'text-organa-text' },
          { value: ranked.filter(e => e.agent.onboardingComplete).length, label: 'Con onboarding', color: 'text-organa-success' },
          { value: ranked.reduce((s, e) => s + e.activeAutos, 0), label: 'Automz. activas', color: 'text-organa-accent' },
          { value: ranked.filter(e => !e.agent.onboardingComplete).length, label: 'Sin entrenar', color: ranked.filter(e => !e.agent.onboardingComplete).length > 0 ? 'text-amber-500' : 'text-organa-text-muted' },
        ].map(({ value, label, color }) => (
          <div key={label} className="bg-white border border-organa-border rounded-2xl p-4 shadow-card">
            <div className={`text-xl font-bold leading-none ${color}`}>{value}</div>
            <div className="text-organa-text-muted text-[10px] uppercase tracking-wide mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Claude insight — visible in both tabs ── */}
      <div className="bg-white border border-organa-border rounded-2xl p-5 shadow-card mb-5">
        <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-organa-border">
          <div className="w-6 h-6 rounded-full bg-organa-accent flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs">🤖</span>
          </div>
          <div className="flex-1">
            <p className="text-organa-text font-semibold text-sm">Pulso de la comunidad</p>
            <p className="text-organa-text-muted text-xs">Momentum, destacados y quién activar esta semana</p>
          </div>
          {!insightDone && <span className="inline-block w-1.5 h-4 bg-organa-accent animate-pulse rounded-sm" />}
        </div>
        {insight ? (
          <div className="prose prose-sm max-w-none text-organa-text-secondary"><MarkdownMessage content={insight} /></div>
        ) : (
          <div className="space-y-2"><div className="skeleton h-3 rounded w-full" /><div className="skeleton h-3 rounded w-5/6" /><div className="skeleton h-3 rounded w-4/5" /></div>
        )}
      </div>

      {/* ── FEED TAB ── */}
      {tab === 'feed' && (
        <>
          {/* Type filter */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            {([['all', 'Todo', feed.length], ['post', 'Publicaciones', userPostCount], ['achievement', 'Logros', feedTypeCounts['achievement'] ?? 0], ['automation', 'Automz.', feedTypeCounts['automation'] ?? 0], ['recording', 'Grabaciones', feedTypeCounts['recording'] ?? 0], ['milestone', 'Hitos', feedTypeCounts['milestone'] ?? 0]] as [FeedFilter, string, number][]).map(([type, label, count]) => count > 0 || type === 'all' ? (
              <button key={type} onClick={() => setFeedFilter(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${feedFilter === type ? 'bg-organa-accent text-white border-organa-accent shadow-button' : 'bg-white text-organa-text-muted border-organa-border hover:border-organa-accent hover:text-organa-text'}`}>
                {label} <span className={`ml-1 px-1 py-0.5 rounded-full text-[9px] font-bold ${feedFilter === type ? 'bg-white/20 text-white' : 'bg-organa-bg text-organa-text-muted'}`}>{count}</span>
              </button>
            ) : null)}
          </div>

          {/* Feed list */}
          <div className="space-y-3">
            {filteredFeed.length === 0 ? (
              <div className="bg-white border border-organa-border rounded-2xl p-10 shadow-card text-center">
                <p className="text-organa-text-muted text-sm">Sin actividad en este filtro.</p>
              </div>
            ) : filteredFeed.map(item => {
              if (item.kind === 'post') {
                return (
                  <div key={item.id} className={`border rounded-2xl p-4 shadow-card ${item.type === 'achievement' ? 'bg-organa-accent-light border-organa-accent/30' : 'bg-white border-organa-border'}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-organa-accent/10 border border-organa-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-organa-accent text-[10px] font-bold">{initials(item.authorName)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-organa-text font-semibold text-sm">{item.authorName}</span>
                          {item.achievementEmoji && <span className="text-base leading-none">{item.achievementEmoji}</span>}
                          <span className="text-organa-text-muted text-[10px] ml-auto flex-shrink-0">{relTime(item.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 mb-2">
                          <span className="text-organa-text-muted text-[10px]">{item.authorRole}{item.authorDept ? ` · ${item.authorDept}` : ''}</span>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full border bg-organa-accent/10 text-organa-accent border-organa-accent/20">
                            {item.type === 'achievement' ? 'Logro' : 'Publicación'}
                          </span>
                        </div>
                        <p className="text-organa-text-secondary text-sm">{item.content}</p>
                      </div>
                    </div>
                  </div>
                )
              }
              return (
                <div key={item.id} className="bg-white border border-organa-border rounded-2xl p-4 shadow-card">
                  <div className="flex items-start gap-3">
                    {item.type === 'milestone' ? (
                      <div className="w-9 h-9 rounded-xl bg-organa-accent flex items-center justify-center flex-shrink-0 text-lg">{item.emoji}</div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-organa-accent/10 border border-organa-accent/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-organa-accent text-[10px] font-bold">{initials(item.agentName)}</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        {item.type !== 'milestone' && <span className="text-organa-text font-semibold text-sm">{item.agentName}</span>}
                        <span className="text-organa-text-secondary text-sm">{item.text}</span>
                        <span className="text-organa-text-muted text-[10px] ml-auto flex-shrink-0">{relTime(item.timestamp)}</span>
                      </div>
                      {item.type !== 'milestone' && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-organa-text-muted text-[10px]">{item.agentRole} · {item.agentDept}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${
                            item.type === 'achievement' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.type === 'automation' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-purple-50 text-purple-700 border-purple-200'
                          }`}>{TYPE_LABEL[item.type]}</span>
                          {!item.agentId ? null : !agentStore.getAgent(item.agentId)?.onboardingComplete ? null : (
                            <Link href={`/agent/${item.agentId}`} className="text-organa-accent text-[9px] font-medium hover:underline">Ver agente →</Link>
                          )}
                        </div>
                      )}
                      {item.detail && <p className="text-organa-text-secondary text-xs mt-1.5 bg-organa-bg rounded-lg px-2.5 py-1.5 inline-block">{item.detail}</p>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* ── RANKING TAB ── */}
      {tab === 'ranking' && (
        <>
          {/* Dept filter */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            <span className="text-organa-text-muted text-xs font-medium mr-1">Sector:</span>
            {[['all', 'Todos', ranked.length] as [string, string, number], ...depts.map(d => [d, d, ranked.filter(e => e.agent.department === d).length] as [string, string, number])].map(([value, label, count]) => (
              <button key={value} onClick={() => setSelectedDept(value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${selectedDept === value ? 'bg-organa-accent text-white border-organa-accent shadow-button' : 'bg-white text-organa-text-muted border-organa-border hover:border-organa-accent hover:text-organa-text'}`}>
                {label} <span className={`ml-1 px-1 py-0.5 rounded-full text-[9px] font-bold ${selectedDept === value ? 'bg-white/20 text-white' : 'bg-organa-bg text-organa-text-muted'}`}>{count}</span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white border border-organa-border rounded-2xl shadow-card overflow-hidden">
            <div className="grid grid-cols-[3rem_1fr_7rem_5.5rem_4.5rem] gap-2 px-5 py-2.5 border-b border-organa-border bg-organa-bg">
              {['#', 'Empleado', 'Nivel', 'Puntos', 'Automz.'].map(h => (
                <span key={h} className="text-[10px] text-organa-text-muted uppercase tracking-wide font-semibold">{h}</span>
              ))}
            </div>
            {filteredRanked.map((entry, idx) => {
              const displayRank = selectedDept === 'all' ? entry.rank : idx + 1
              const style = LEVEL_STYLE[entry.level]
              return (
                <div key={entry.agent.id} className="grid grid-cols-[3rem_1fr_7rem_5.5rem_4.5rem] gap-2 px-5 py-3 border-b border-organa-border last:border-0 hover:bg-organa-bg/50 transition-colors items-center">
                  <div className="text-center">{displayRank <= 3 ? <span>{RANK_ICON[displayRank]}</span> : <span className="text-organa-text-muted font-bold text-sm">{displayRank}</span>}</div>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-organa-accent/10 border border-organa-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-organa-accent text-[9px] font-bold">{initials(entry.agent.name)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-organa-text font-medium text-xs truncate">{entry.agent.name}</p>
                      <p className="text-organa-text-muted text-[10px] truncate">{selectedDept === 'all' ? `${entry.agent.role} · ${entry.agent.department}` : entry.agent.role}</p>
                    </div>
                    {!entry.agent.onboardingComplete && (
                      <Link href={`/onboard/${entry.agent.id}`} className="text-[9px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full font-semibold hover:bg-amber-100 transition-colors flex-shrink-0 whitespace-nowrap">Sin entrenar</Link>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border w-fit ${style.badge}`}>{LEVEL_LABELS[entry.level]}</span>
                  <span className={`font-bold text-sm ${style.text}`}>{entry.pts.toLocaleString()}</span>
                  <span className={`text-sm font-semibold ${entry.activeAutos > 0 ? 'text-organa-success' : 'text-organa-text-muted'}`}>{entry.activeAutos > 0 ? entry.activeAutos : '—'}</span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 text-center">
            <p className="text-organa-text-muted text-xs">
              Para scores de conocimiento ver{' '}
              <Link href="/krs" className="text-organa-accent font-medium hover:underline">AI Workforce</Link> · para métricas operativas ver{' '}
              <Link href="/monitoring" className="text-organa-accent font-medium hover:underline">Monitoring</Link>
            </p>
          </div>
        </>
      )}
    </main>
  )
}
