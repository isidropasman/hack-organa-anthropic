'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { agentStore } from '@/lib/agent-store'
import { portalStore } from '@/lib/portal-store'
import { LEVEL_LABELS, LEVEL_THRESHOLDS } from '@/lib/types'
import type { Agent, AgentLevel } from '@/lib/types'
import type { PortalPost } from '@/lib/portal-store'

// ─── Feed item (system-generated) ────────────────────────────────────────────

type FeedType = 'achievement' | 'automation' | 'recording' | 'milestone'

interface FeedItem {
  id: string; kind: 'system'
  type: FeedType; agentName: string; agentRole: string; agentDept: string; agentId: string
  text: string; timestamp: string; emoji: string; detail?: string
}

type AnyItem = FeedItem | (PortalPost & { kind: 'post' })

// ─── Demo points ──────────────────────────────────────────────────────────────

const DEMO_PTS = [850, 720, 650, 580, 490, 390, 310, 270, 200, 160, 110, 70, 30]
const dPts = (a: Agent, i: number) => (a.points ?? 0) > 0 ? (a.points ?? 0) : (DEMO_PTS[i] ?? 20)
const dLvl = (p: number): AgentLevel =>
  p >= LEVEL_THRESHOLDS.elite ? 'elite' : p >= LEVEL_THRESHOLDS.gold ? 'gold' : p >= LEVEL_THRESHOLDS.silver ? 'silver' : 'bronze'

const LEVEL_STYLE: Record<AgentLevel, { badge: string; text: string; bg: string }> = {
  bronze: { badge: 'bg-[#CD7F32]/10 text-[#8B5E2A] border-[#CD7F32]/30', text: 'text-[#CD7F32]', bg: 'bg-[#CD7F32]' },
  silver: { badge: 'bg-gray-100 text-gray-600 border-gray-300', text: 'text-gray-500', bg: 'bg-gray-400' },
  gold:   { badge: 'bg-yellow-50 text-yellow-700 border-yellow-300', text: 'text-yellow-600', bg: 'bg-yellow-400' },
  elite:  { badge: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-organa-accent', bg: 'bg-organa-accent' },
}
const RANK_ICON: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
const ini = (name: string | undefined) => (name ?? '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

// ─── System feed generation ───────────────────────────────────────────────────

const dAgo = (n: number) => { const d = new Date('2026-04-14T12:00:00Z'); d.setDate(d.getDate() - n); return d.toISOString() }

const SEEDED: FeedItem[] = [
  { id: 'seed-1', kind: 'system', type: 'milestone', agentName: 'ORGANA', agentRole: '', agentDept: '', agentId: '', text: 'The team surpassed 100 automation runs this month', timestamp: dAgo(1), emoji: '🎯', detail: 'Over 12 hours saved in repetitive processes' },
  { id: 'seed-2', kind: 'system', type: 'milestone', agentName: 'ORGANA', agentRole: '', agentDept: '', agentId: '', text: 'Nova Agency activated its first AI agent', timestamp: dAgo(6), emoji: '🚀', detail: '13 digital twins under construction' },
]

function buildSystemFeed(agents: Agent[]): FeedItem[] {
  const items: FeedItem[] = [...SEEDED]
  for (const a of agents) {
    if (a.onboardingComplete && a.knowledgeBase)
      items.push({ id: `onboard-${a.id}`, kind: 'system', type: 'achievement', agentName: a.name, agentRole: a.role, agentDept: a.department, agentId: a.id, text: 'completed onboarding and activated their digital twin', timestamp: a.knowledgeBase.completedAt, emoji: '✅', detail: `${a.role} agent ready to answer queries` })
    for (const au of (a.automations ?? [])) {
      if (au.status === 'active')
        items.push({ id: `auto-${au.id}`, kind: 'system', type: 'automation', agentName: a.name, agentRole: a.role, agentDept: a.department, agentId: a.id, text: `activated "${au.name}"`, timestamp: au.createdAt, emoji: '⚡', detail: au.timeSavedMinutes > 0 ? `Saves ~${au.timeSavedMinutes}min/${au.estimatedFrequency === 'daily' ? 'day' : 'week'}` : undefined })
      if (au.source === 'recording' && au.status !== 'failed')
        items.push({ id: `rec-${au.id}`, kind: 'system', type: 'recording', agentName: a.name, agentRole: a.role, agentDept: a.department, agentId: a.id, text: 'recorded a task for analysis', timestamp: au.createdAt, emoji: '🖥️' })
    }
  }
  return items
}

// ─── Reactions ────────────────────────────────────────────────────────────────

const REACTIONS = ['👏', '🔥', '⚡'] as const
type Reaction = typeof REACTIONS[number]

const loadR = () => { try { return JSON.parse(localStorage.getItem('organa_reactions') ?? '{}') as Record<string, Record<Reaction, number>> } catch { return {} } }
const loadMR = () => { try { return JSON.parse(localStorage.getItem('organa_my_reactions') ?? '{}') as Record<string, boolean> } catch { return {} } }
const saveR = (r: Record<string, Record<Reaction, number>>) => localStorage.setItem('organa_reactions', JSON.stringify(r))
const saveMR = (r: Record<string, boolean>) => localStorage.setItem('organa_my_reactions', JSON.stringify(r))

// ─── Ranking types ────────────────────────────────────────────────────────────

interface RankedEntry { agent: Agent; pts: number; level: AgentLevel; rank: number }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const relTime = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'now'; if (m < 60) return `${m}m`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

async function streamSSE(url: string, body: object, onText: (t: string) => void, onDone: () => void, signal: AbortSignal) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal })
  if (!res.body) return
  const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = ''
  while (true) {
    const { done, value } = await reader.read(); if (done) break
    buf += dec.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      try { const ev = JSON.parse(line.slice(6)); if (ev.type === 'text') onText(ev.text); else if (ev.type === 'done') onDone() } catch { /* skip */ }
    }
  }
  onDone()
}

// ─── PostComposer ─────────────────────────────────────────────────────────────

const MOOD_OPTIONS = ['', '🎉', '💡', '🚀', '🔥', '⚡'] as const

function PostComposer({ authorId, authorName, authorRole, authorDept, onPost }: {
  authorId: string | null; authorName: string; authorRole: string; authorDept: string
  onPost: (post: PortalPost) => void
}) {
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string>('')
  const [posting, setPosting] = useState(false)
  const MAX = 280

  function submit() {
    if (!content.trim() || posting) return
    setPosting(true)
    const post = portalStore.addPost({ authorId, authorName, authorRole, authorDept, content: content.trim(), type: 'post', achievementEmoji: mood || undefined, timestamp: new Date().toISOString() })
    onPost(post)
    setContent(''); setMood(''); setPosting(false)
  }

  return (
    <div className="bg-white border border-organa-border rounded-2xl p-4 shadow-card mb-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-organa-accent/10 border border-organa-accent/20 flex items-center justify-center flex-shrink-0 font-bold text-[10px] text-organa-accent">
          {ini(authorName)}
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value.slice(0, MAX))}
            placeholder="Share a news item, achievement, or learning with the team…"
            rows={2}
            className="w-full text-sm text-organa-text placeholder-organa-text-muted bg-organa-bg border border-organa-border rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-organa-accent transition-colors leading-relaxed"
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit() }}
          />
          <div className="flex items-center justify-between mt-2">
            {/* Mood selector */}
            <div className="flex items-center gap-1">
              {MOOD_OPTIONS.map(m => (
                <button key={m || 'none'} onClick={() => setMood(m)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all border ${mood === m ? 'border-organa-accent bg-organa-accent-light' : 'border-transparent hover:border-organa-border hover:bg-organa-bg'}`}>
                  {m || <span className="text-organa-text-muted text-[10px] font-medium">—</span>}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-medium ${content.length > MAX * 0.85 ? 'text-amber-500' : 'text-organa-text-muted'}`}>{content.length}/{MAX}</span>
              <button
                onClick={submit}
                disabled={!content.trim() || posting}
                className="bg-organa-accent hover:bg-organa-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-1.5 text-xs font-semibold shadow-button transition-all"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── FeedCard ─────────────────────────────────────────────────────────────────

function FeedCard({ item, reactions, myReactions, onReact, onDelete }: {
  item: AnyItem
  reactions: Record<Reaction, number>
  myReactions: Record<string, boolean>
  onReact: (id: string, e: Reaction) => void
  onDelete?: () => void
}) {
  const isPost = item.kind === 'post'
  const isMilestone = !isPost && (item as FeedItem).type === 'milestone'
  const isAchievement = isPost && item.type === 'achievement'

  return (
    <div className={`bg-white border rounded-2xl p-4 shadow-card transition-all ${isAchievement ? 'border-organa-accent/30 bg-gradient-to-br from-white to-organa-accent-light/30' : 'border-organa-border'}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {isMilestone ? (
          <div className="w-9 h-9 rounded-xl bg-organa-accent flex items-center justify-center flex-shrink-0 text-lg">{(item as FeedItem).emoji}</div>
        ) : (
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${isAchievement ? 'bg-organa-accent text-white' : 'bg-organa-accent/10 border border-organa-accent/20 text-organa-accent'}`}>
            {ini(isPost ? (item as PortalPost).authorName : (item as FeedItem).agentName)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {isPost ? (
            /* User post */
            <>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-organa-text font-semibold text-sm">{item.authorName}</span>
                {item.achievementEmoji && <span className="text-base leading-none">{item.achievementEmoji}</span>}
                {isAchievement && <span className="text-[9px] bg-organa-accent text-white px-1.5 py-0.5 rounded-full font-bold">ACHIEVEMENT</span>}
                <span className="text-organa-text-muted text-[10px] ml-auto">{relTime(item.timestamp)}</span>
              </div>
              <p className="text-organa-text-secondary text-xs">{item.authorRole} · {item.authorDept}</p>
              <p className="text-organa-text text-sm mt-2 leading-relaxed">{item.content}</p>
            </>
          ) : (
            /* System item */
            <>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                {!isMilestone && <span className="text-organa-text font-semibold text-sm">{(item as FeedItem).agentName}</span>}
                <span className="text-organa-text-secondary text-sm">{(item as FeedItem).text}</span>
                <span className="text-organa-text-muted text-[10px] ml-auto flex-shrink-0">{relTime(item.timestamp)}</span>
              </div>
              {!isMilestone && <p className="text-organa-text-muted text-[10px] mt-0.5">{(item as FeedItem).agentRole} · {(item as FeedItem).agentDept}</p>}
              {(item as FeedItem).detail && <p className="text-organa-text-secondary text-xs mt-1.5 bg-organa-bg rounded-lg px-2.5 py-1.5 inline-block">{(item as FeedItem).detail}</p>}
            </>
          )}

          {/* Reactions + delete */}
          <div className="flex items-center gap-1.5 mt-3">
            {REACTIONS.map(emoji => {
              const count = reactions[emoji] ?? 0
              const reacted = myReactions[`${item.id}_${emoji}`] ?? false
              return (
                <button key={emoji} onClick={() => onReact(item.id, emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all border ${reacted ? 'bg-organa-accent-light border-organa-accent/30 text-organa-accent font-semibold' : 'bg-organa-bg border-organa-border text-organa-text-muted hover:border-organa-accent hover:text-organa-accent'}`}>
                  {emoji}{count > 0 && <span className="text-[10px] font-semibold">{count}</span>}
                </button>
              )
            })}
            {onDelete && (
              <button onClick={onDelete} className="ml-auto text-organa-text-muted hover:text-red-500 text-[10px] transition-colors">
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Ranking rows ─────────────────────────────────────────────────────────────

function RankRow({ entry, isMe }: { entry: RankedEntry; isMe: boolean }) {
  const s = LEVEL_STYLE[entry.level]
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isMe ? 'bg-organa-accent-light border border-organa-accent/30' : 'hover:bg-organa-bg/60'}`}>
      <div className="w-6 text-center flex-shrink-0">{entry.rank <= 3 ? <span>{RANK_ICON[entry.rank]}</span> : <span className="text-organa-text-muted font-bold text-xs">{entry.rank}</span>}</div>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${isMe ? 'bg-organa-accent text-white' : 'bg-organa-accent/10 border border-organa-accent/20 text-organa-accent'}`}>{ini(entry.agent.name)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1"><p className={`font-semibold text-xs truncate ${isMe ? 'text-organa-accent' : 'text-organa-text'}`}>{entry.agent.name}</p>{isMe && <span className="text-[8px] bg-organa-accent text-white px-1 py-0.5 rounded-full font-bold flex-shrink-0">TÚ</span>}</div>
        <p className="text-organa-text-muted text-[10px] truncate">{entry.agent.department}</p>
      </div>
      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border hidden sm:block ${s.badge}`}>{LEVEL_LABELS[entry.level]}</span>
      <div className="text-right flex-shrink-0"><p className={`font-bold text-xs ${isMe ? 'text-organa-accent' : 'text-organa-text'}`}>{entry.pts.toLocaleString()}</p><p className="text-organa-text-muted text-[9px]">pts</p></div>
    </div>
  )
}

function PodiumMini({ entry, isMe }: { entry: RankedEntry; isMe: boolean }) {
  const s = LEVEL_STYLE[entry.level]
  return (
    <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${isMe ? 'border-organa-accent/30 bg-organa-accent-light' : 'border-organa-border bg-white'}`}>
      <span className="text-base flex-shrink-0">{RANK_ICON[entry.rank]}</span>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${isMe ? 'bg-organa-accent text-white' : 'bg-organa-accent/10 border border-organa-accent/20 text-organa-accent'}`}>{ini(entry.agent.name)}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-semibold truncate ${isMe ? 'text-organa-accent' : 'text-organa-text'}`}>{entry.agent.name.split(' ')[0]}{isMe && <span className="ml-1 text-[8px] bg-organa-accent text-white px-1 rounded-full">TÚ</span>}</p>
        <p className={`text-[9px] font-bold ${s.text}`}>{entry.pts.toLocaleString()} pts</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'feed' | 'ranking'

export default function PortalPage() {
  const [mounted, setMounted] = useState(false)
  const [tab, setTab] = useState<Tab>('feed')
  const [systemFeed, setSystemFeed] = useState<FeedItem[]>([])
  const [userPosts, setUserPosts] = useState<PortalPost[]>([])
  const [ranked, setRanked] = useState<RankedEntry[]>([])
  const [deptTop3, setDeptTop3] = useState<{ department: string; entries: RankedEntry[] }[]>([])
  const [myAgentId, setMyAgentId] = useState<string | null>(null)
  const [myAgent, setMyAgent] = useState<Agent | null>(null)
  const [myRank, setMyRank] = useState<number | null>(null)
  const [reactions, setReactions] = useState<Record<string, Record<Reaction, number>>>({})
  const [myReactions, setMyReactions] = useState<Record<string, boolean>>({})
  const [message, setMessage] = useState('')
  const [messageDone, setMessageDone] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setMounted(true)
    const user = getCurrentUser()
    const agents = agentStore.getAllAgents()

    let agent = agentStore.getAgent(user.agentId ?? '')
    if (!agent && user.name) agent = agents.find(a => a.name.toLowerCase() === user.name.toLowerCase()) ?? null
    if (agent) { setMyAgentId(agent.id); setMyAgent(agent) }

    const sorted: RankedEntry[] = [...agents]
      .map((a, i) => ({ agent: a, pts: dPts(a, i) }))
      .sort((a, b) => b.pts - a.pts)
      .map(({ agent: a, pts: p }, i) => ({ agent: a, pts: p, level: dLvl(p), rank: i + 1 }))
    setRanked(sorted)

    const myEntry = agent ? sorted.find(s => s.agent.id === agent!.id) : null
    if (myEntry) setMyRank(myEntry.rank)

    const byDept: Record<string, RankedEntry[]> = {}
    for (const e of sorted) { const d = e.agent.department || 'Sin departamento'; byDept[d] ??= []; byDept[d].push(e) }
    setDeptTop3(Object.entries(byDept).map(([d, es]) => ({ department: d, entries: es.slice(0, 3) })).sort((a, b) => b.entries[0].pts - a.entries[0].pts))

    const sf = buildSystemFeed(agents)
    setSystemFeed(sf)
    setUserPosts(portalStore.getPosts())
    setReactions(loadR()); setMyReactions(loadMR())

    if (agents.length > 0 && agent) {
      const myPts = myEntry?.pts ?? 0
      const payload = {
        currentUser: { name: user.name, points: myPts, level: dLvl(myPts), rank: myEntry?.rank ?? 0, department: agent.department ?? '' },
        recentActivity: sf.slice(0, 5).map(f => ({ type: f.type, agentName: f.agentName, text: f.text, dept: f.agentDept })),
        topRanked: sorted.slice(0, 3).map(s => ({ name: s.agent.name, points: s.pts, dept: s.agent.department })),
        totalParticipants: sorted.length,
        teamAutomationsRun: agents.reduce((s, a) => s + (a.automations ?? []).reduce((ss, au) => ss + au.runsTotal, 0), 0),
      }
      const ctrl = new AbortController(); abortRef.current = ctrl; let acc = ''
      streamSSE('/api/portal-message', payload, t => { acc += t; setMessage(acc) }, () => setMessageDone(true), ctrl.signal)
        .catch(err => { if (err.name !== 'AbortError') setMessageDone(true) })
    } else { setMessageDone(true) }

    return () => abortRef.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handlePost(post: PortalPost) {
    setUserPosts(prev => [post, ...prev])
  }

  function handleDeletePost(id: string) {
    portalStore.deletePost(id)
    setUserPosts(prev => prev.filter(p => p.id !== id))
  }

  function handleReact(itemId: string, emoji: Reaction) {
    const key = `${itemId}_${emoji}`; const reacted = myReactions[key]
    setReactions(prev => { const u = { ...prev, [itemId]: { ...(prev[itemId] ?? { '👏': 0, '🔥': 0, '⚡': 0 }), [emoji]: Math.max(0, (prev[itemId]?.[emoji] ?? 0) + (reacted ? -1 : 1)) } }; saveR(u); return u })
    setMyReactions(prev => { const u = { ...prev, [key]: !reacted }; saveMR(u); return u })
  }

  if (!mounted) return null

  // Merge system + user posts, sort by timestamp
  const allFeed: AnyItem[] = [
    ...systemFeed.map(f => ({ ...f, kind: 'system' as const })),
    ...userPosts.map(p => ({ ...p, kind: 'post' as const })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const top10 = ranked.slice(0, 10)
  const myEntry = myRank !== null ? ranked[myRank - 1] : null
  const myOutsideTop10 = myRank !== null && myRank > 10

  return (
    <main className="min-h-screen bg-organa-bg p-8 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-organa-text">Portal</h1>
          <p className="text-organa-text-muted text-sm mt-0.5">{ranked.length} compañeros · actividad del equipo</p>
        </div>
        <div className="flex items-center gap-1 bg-organa-bg border border-organa-border rounded-xl p-1">
          {(['feed', 'ranking'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${t === tab ? 'bg-white text-organa-text shadow-card' : 'text-organa-text-muted hover:text-organa-text'}`}>
              {t === 'feed' ? '📣 Feed' : '🏆 Ranking'}
            </button>
          ))}
        </div>
      </div>

      {/* Claude digest */}
      <div className="bg-organa-accent-light border border-organa-accent/20 rounded-2xl px-4 py-3.5 mb-5 flex items-start gap-3 min-h-[48px]">
        <div className="w-6 h-6 rounded-full bg-organa-accent flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-white text-xs">🤖</span></div>
        {message ? (
          <p className="text-organa-accent text-sm leading-relaxed flex-1">{message}{!messageDone && <span className="inline-block w-1 h-3.5 bg-organa-accent ml-0.5 animate-pulse rounded-sm align-middle" />}</p>
        ) : (
          <div className="flex-1 space-y-1.5 pt-1"><div className="skeleton h-3 rounded w-4/5" /><div className="skeleton h-3 rounded w-3/5" /></div>
        )}
      </div>

      {/* ── FEED TAB ── */}
      {tab === 'feed' && (
        <div className="space-y-3">
          {/* Composer */}
          {myAgent && (
            <PostComposer
              authorId={myAgent.id} authorName={myAgent.name}
              authorRole={myAgent.role} authorDept={myAgent.department}
              onPost={handlePost}
            />
          )}

          {/* Feed items */}
          {allFeed.length === 0 ? (
            <div className="bg-white border border-organa-border rounded-2xl p-10 shadow-card text-center">
              <p className="text-4xl mb-3">📣</p>
              <p className="text-organa-text font-semibold">El feed está vacío</p>
              <p className="text-organa-text-muted text-sm mt-1">Sé el primero en publicar algo al equipo</p>
            </div>
          ) : allFeed.map(item => (
            <FeedCard
              key={item.id} item={item}
              reactions={{ '👏': reactions[item.id]?.['👏'] ?? 0, '🔥': reactions[item.id]?.['🔥'] ?? 0, '⚡': reactions[item.id]?.['⚡'] ?? 0 }}
              myReactions={myReactions} onReact={handleReact}
              onDelete={item.kind === 'post' && item.authorId === myAgentId ? () => handleDeletePost(item.id) : undefined}
            />
          ))}
        </div>
      )}

      {/* ── RANKING TAB ── */}
      {tab === 'ranking' && (
        <div className="space-y-6">
          {myEntry && (
            <div className="bg-white border border-organa-accent/30 rounded-2xl p-4 shadow-card flex items-center gap-4">
              <div className="text-2xl flex-shrink-0">{myRank && myRank <= 3 ? RANK_ICON[myRank] : <span className="w-9 h-9 rounded-full bg-organa-bg border border-organa-border flex items-center justify-center text-organa-text font-bold text-sm inline-flex">{myRank}</span>}</div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${LEVEL_STYLE[myEntry.level].bg} text-white`}>{ini(myEntry.agent.name)}</div>
              <div className="flex-1 min-w-0"><p className="text-organa-text font-bold text-sm">{myEntry.agent.name}</p><p className="text-organa-text-muted text-xs">{myEntry.agent.department} · Puesto {myRank} de {ranked.length}</p></div>
              <div className="text-right flex-shrink-0"><p className={`text-2xl font-bold ${LEVEL_STYLE[myEntry.level].text}`}>{myEntry.pts.toLocaleString()}</p><p className="text-[10px] text-organa-text-muted uppercase tracking-wide">{LEVEL_LABELS[myEntry.level]}</p></div>
            </div>
          )}

          <div>
            <h2 className="text-organa-text font-semibold text-sm mb-3">🏆 Top 10 company</h2>
            <div className="bg-white border border-organa-border rounded-2xl shadow-card overflow-hidden">
              <div className="divide-y divide-organa-border/60 p-2">
                {top10.map(e => <RankRow key={e.agent.id} entry={e} isMe={e.agent.id === myAgentId} />)}
              </div>
              {myOutsideTop10 && myEntry && (
                <>
                  <div className="px-4 py-2 border-t border-dashed border-organa-border bg-organa-bg flex items-center gap-2"><div className="flex-1 h-px bg-organa-border" /><span className="text-organa-text-muted text-[10px] font-medium">Tu posición</span><div className="flex-1 h-px bg-organa-border" /></div>
                  <div className="p-2"><RankRow entry={myEntry} isMe /></div>
                </>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-organa-text font-semibold text-sm mb-4">🏅 Top 3 by department</h2>
            <div className="space-y-4">
              {deptTop3.map(({ department, entries }) => (
                <div key={department}>
                  <p className="text-organa-text-secondary text-[10px] font-semibold uppercase tracking-wide mb-2">{department}</p>
                  <div className={`grid gap-2 ${entries.length === 1 ? 'grid-cols-1' : entries.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {entries.map(e => <PodiumMini key={e.agent.id} entry={e} isMe={e.agent.id === myAgentId} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-organa-text-muted text-xs mb-2">Sumá puntos usando tu agente</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/chat" className="text-organa-accent text-xs font-medium hover:underline">💬 Chat +5 pts</Link>
              <Link href="/record" className="text-organa-accent text-xs font-medium hover:underline">🖥️ Grabar +20 pts</Link>
              <Link href="/automations" className="text-organa-accent text-xs font-medium hover:underline">⚡ Aprobar +30 pts</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
