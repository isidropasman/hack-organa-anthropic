'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { agentStore } from '@/lib/agent-store'
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

const LEVEL_STYLE: Record<AgentLevel, { badge: string; text: string; bg: string }> = {
  bronze: { badge: 'bg-[#CD7F32]/10 text-[#8B5E2A] border-[#CD7F32]/30', text: 'text-[#CD7F32]', bg: 'bg-[#CD7F32]' },
  silver: { badge: 'bg-gray-100 text-gray-600 border-gray-300',           text: 'text-gray-500',   bg: 'bg-gray-400'   },
  gold:   { badge: 'bg-yellow-50 text-yellow-700 border-yellow-300',       text: 'text-yellow-600', bg: 'bg-yellow-400' },
  elite:  { badge: 'bg-blue-50 text-blue-700 border-blue-200',             text: 'text-organa-accent', bg: 'bg-organa-accent' },
}

const RANK_ICON: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
const RANK_CARD: Record<number, string> = {
  1: 'border-yellow-300 bg-yellow-50/50',
  2: 'border-gray-300 bg-gray-50/50',
  3: 'border-amber-200 bg-amber-50/30',
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

// ─── SSE helper ───────────────────────────────────────────────────────────────

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
  rank: number
}

// ─── Small podium card (top 3 per dept) ──────────────────────────────────────

function PodiumCard({ entry, isMe }: { entry: RankedEntry; isMe: boolean }) {
  const style = LEVEL_STYLE[entry.level]
  return (
    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all ${
      isMe ? 'border-organa-accent/40 bg-organa-accent-light' : RANK_CARD[entry.rank] ?? 'border-organa-border bg-white'
    }`}>
      <span className="text-xl">{RANK_ICON[entry.rank]}</span>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
        isMe ? 'bg-organa-accent text-white' : 'bg-organa-accent/10 border border-organa-accent/20 text-organa-accent'
      }`}>
        {getInitials(entry.agent.name)}
      </div>
      <div className="text-center min-w-0 w-full">
        <p className={`text-[11px] font-semibold truncate ${isMe ? 'text-organa-accent' : 'text-organa-text'}`}>
          {entry.agent.name.split(' ')[0]}
          {isMe && <span className="ml-1 text-[9px] bg-organa-accent text-white px-1 py-0.5 rounded-full">TÚ</span>}
        </p>
        <p className={`text-[10px] font-bold mt-0.5 ${style.text}`}>{entry.pts.toLocaleString()} pts</p>
      </div>
    </div>
  )
}

// ─── Company rank row (top 10) ────────────────────────────────────────────────

function RankRow({ entry, isMe }: { entry: RankedEntry; isMe: boolean }) {
  const style = LEVEL_STYLE[entry.level]
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      isMe ? 'bg-organa-accent-light border border-organa-accent/30' : 'hover:bg-organa-bg/60'
    }`}>
      <div className="w-7 text-center flex-shrink-0">
        {entry.rank <= 3
          ? <span className="text-lg">{RANK_ICON[entry.rank]}</span>
          : <span className="text-organa-text-muted font-bold text-sm">{entry.rank}</span>
        }
      </div>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
        isMe ? 'bg-organa-accent text-white' : 'bg-organa-accent/10 border border-organa-accent/20 text-organa-accent'
      }`}>
        {getInitials(entry.agent.name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className={`font-semibold text-sm truncate ${isMe ? 'text-organa-accent' : 'text-organa-text'}`}>
            {entry.agent.name}
          </p>
          {isMe && <span className="text-[9px] bg-organa-accent text-white px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">TÚ</span>}
        </div>
        <p className="text-organa-text-muted text-[10px] truncate">{entry.agent.department}</p>
      </div>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border hidden sm:block flex-shrink-0 ${style.badge}`}>
        {LEVEL_LABELS[entry.level]}
      </span>
      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-sm leading-none ${isMe ? 'text-organa-accent' : 'text-organa-text'}`}>
          {entry.pts.toLocaleString()}
        </p>
        <p className="text-organa-text-muted text-[10px]">pts</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [mounted, setMounted] = useState(false)
  const [ranked, setRanked] = useState<RankedEntry[]>([])
  const [deptTop3, setDeptTop3] = useState<{ department: string; entries: RankedEntry[] }[]>([])
  const [myAgentId, setMyAgentId] = useState<string | null>(null)
  const [myRank, setMyRank] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [messageDone, setMessageDone] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setMounted(true)
    const user = getCurrentUser()
    let myAgent = agentStore.getAgent(user.agentId ?? '')
    if (!myAgent && user.name) {
      myAgent = agentStore.getAllAgents().find(
        a => a.name.toLowerCase() === user.name.toLowerCase()
      ) ?? null
    }
    if (myAgent) setMyAgentId(myAgent.id)

    const agents = agentStore.getAllAgents()

    // Build global ranking
    const sorted: RankedEntry[] = [...agents]
      .map((agent, i) => ({ agent, pts: displayPoints(agent, i) }))
      .sort((a, b) => b.pts - a.pts)
      .map(({ agent, pts }, i) => ({ agent, pts, level: displayLevel(pts), rank: i + 1 }))
    setRanked(sorted)

    const myEntry = myAgent ? sorted.find(s => s.agent.id === myAgent!.id) : null
    if (myEntry) setMyRank(myEntry.rank)

    // Top 3 per department
    const byDept: Record<string, RankedEntry[]> = {}
    for (const entry of sorted) {
      const d = entry.agent.department || 'Sin departamento'
      byDept[d] ??= []
      byDept[d].push(entry)
    }
    const deptList = Object.entries(byDept)
      .map(([department, entries]) => ({ department, entries: entries.slice(0, 3) }))
      .sort((a, b) => b.entries[0].pts - a.entries[0].pts)
    setDeptTop3(deptList)

    // Claude message
    if (myAgent && sorted.length > 0) {
      const myPts = sorted.find(s => s.agent.id === myAgent!.id)?.pts ?? 0
      const myRankNum = sorted.findIndex(s => s.agent.id === myAgent!.id) + 1
      const payload = {
        currentUser: {
          name: myAgent.name, points: myPts,
          level: displayLevel(myPts), rank: myRankNum,
          department: myAgent.department,
        },
        topPlayers: sorted.slice(0, 5).map(s => ({
          name: s.agent.name, points: s.pts,
          level: s.level, department: s.agent.department,
        })),
        departmentRanking: deptList.slice(0, 3).map(d => ({
          department: d.department,
          avgPoints: Math.round(d.entries.reduce((s, e) => s + e.pts, 0) / d.entries.length),
          totalAutomations: 0,
        })),
        totalParticipants: sorted.length,
      }
      const ctrl = new AbortController()
      abortRef.current = ctrl
      let acc = ''
      streamSSE('/api/leaderboard-message', payload,
        t => { acc += t; setMessage(acc) },
        () => setMessageDone(true),
        ctrl.signal,
      ).catch(err => { if (err.name !== 'AbortError') setMessageDone(true) })
    } else {
      setMessageDone(true)
    }

    return () => abortRef.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mounted) return null

  const top10 = ranked.slice(0, 10)
  // If I'm outside top 10, append my entry after a separator
  const myEntry = myRank !== null ? ranked[myRank - 1] : null
  const myOutsideTop10 = myRank !== null && myRank > 10

  return (
    <main className="min-h-screen bg-organa-bg p-8 max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-organa-text">Ranking</h1>
        <p className="text-organa-text-muted text-sm mt-1">
          {ranked.length} participantes · Top 10 empresa + Top 3 por sector
        </p>
      </div>

      {/* ── My position card ── */}
      {myEntry && (
        <div className="bg-white border border-organa-accent/30 rounded-2xl p-4 shadow-card mb-4 flex items-center gap-4">
          <div className="text-2xl flex-shrink-0">
            {myRank && myRank <= 3
              ? RANK_ICON[myRank]
              : <span className="w-10 h-10 rounded-full bg-organa-bg border border-organa-border flex items-center justify-center text-organa-text font-bold text-base inline-flex">{myRank}</span>
            }
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${LEVEL_STYLE[myEntry.level].bg} text-white`}>
            {getInitials(myEntry.agent.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-organa-text font-bold text-sm">{myEntry.agent.name}</p>
            <p className="text-organa-text-muted text-xs">{myEntry.agent.department} · Puesto {myRank} de {ranked.length}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className={`text-2xl font-bold ${LEVEL_STYLE[myEntry.level].text}`}>{myEntry.pts.toLocaleString()}</p>
            <p className="text-[10px] text-organa-text-muted uppercase tracking-wide">
              {LEVEL_LABELS[myEntry.level]}
            </p>
          </div>
        </div>
      )}

      {/* ── Claude message ── */}
      <div className="bg-organa-accent-light border border-organa-accent/20 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3 min-h-[52px]">
        <div className="w-6 h-6 rounded-full bg-organa-accent flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs">🤖</span>
        </div>
        {message ? (
          <p className="text-organa-accent text-sm leading-relaxed flex-1">
            {message}
            {!messageDone && <span className="inline-block w-1 h-3.5 bg-organa-accent ml-0.5 animate-pulse rounded-sm align-middle" />}
          </p>
        ) : (
          <div className="flex-1 space-y-1.5 pt-1">
            <div className="skeleton h-3 rounded w-4/5" />
            <div className="skeleton h-3 rounded w-3/5" />
          </div>
        )}
      </div>

      {/* ── Top 10 empresa ── */}
      <div className="mb-7">
        <h2 className="text-organa-text font-semibold text-sm mb-3">🏆 Top 10 empresa</h2>
        <div className="bg-white border border-organa-border rounded-2xl shadow-card overflow-hidden">
          <div className="divide-y divide-organa-border/60 p-2">
            {top10.map(entry => (
              <RankRow key={entry.agent.id} entry={entry} isMe={entry.agent.id === myAgentId} />
            ))}
            {top10.length === 0 && (
              <p className="text-center text-organa-text-muted text-sm py-8">Sin participantes aún.</p>
            )}
          </div>

          {/* My position if outside top 10 */}
          {myOutsideTop10 && myEntry && (
            <>
              <div className="px-4 py-2 border-t border-dashed border-organa-border bg-organa-bg flex items-center gap-2">
                <div className="flex-1 h-px bg-organa-border" />
                <span className="text-organa-text-muted text-[10px] font-medium">Tu posición</span>
                <div className="flex-1 h-px bg-organa-border" />
              </div>
              <div className="p-2">
                <RankRow entry={myEntry} isMe />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Top 3 por sector ── */}
      <div>
        <h2 className="text-organa-text font-semibold text-sm mb-4">🏅 Top 3 por sector</h2>
        <div className="space-y-5">
          {deptTop3.map(({ department, entries }) => {
            const deptMyEntry = entries.find(e => e.agent.id === myAgentId)
            return (
              <div key={department}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-organa-text-secondary text-xs font-semibold uppercase tracking-wide">{department}</p>
                  <span className="text-organa-text-muted text-[10px]">
                    {deptMyEntry ? '· Estás en este sector' : ''}
                  </span>
                </div>
                <div className={`grid gap-2 ${entries.length === 1 ? 'grid-cols-1' : entries.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {entries.map(entry => (
                    <PodiumCard key={entry.agent.id} entry={entry} isMe={entry.agent.id === myAgentId} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="mt-8 text-center">
        <p className="text-organa-text-muted text-xs mb-2">
          Sumá puntos usando tu agente todos los días
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/chat" className="text-organa-accent text-xs font-medium hover:underline">💬 Chat +5 pts</Link>
          <Link href="/record" className="text-organa-accent text-xs font-medium hover:underline">🖥️ Grabar +20 pts</Link>
          <Link href="/automations" className="text-organa-accent text-xs font-medium hover:underline">⚡ Aprobar +30 pts</Link>
        </div>
      </div>
    </main>
  )
}
