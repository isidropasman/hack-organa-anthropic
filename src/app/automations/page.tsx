'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { agentStore } from '@/lib/agent-store'
import { portalStore } from '@/lib/portal-store'
import type { Automation, AutomationStatus } from '@/lib/types'

// ─── Demo seed (shown when agent has no automations yet) ─────────────────────

const DEMO_AUTOMATIONS: Automation[] = [
  {
    id: 'demo-1',
    name: 'Daily shipment tracking',
    description: 'Checks the tracking of all pending shipments in MercadoLibre Envíos and generates an automatic report.',
    steps: ['Access ML Envíos', 'Filter today\'s shipments', 'Export report', 'Send to Slack'],
    status: 'active',
    source: 'recording',
    createdAt: '2026-04-01T09:00:00Z',
    lastRun: '2026-04-14T09:15:00Z',
    runsTotal: 18,
    timeSavedMinutes: 216,
    nextRun: '2026-04-15T09:00:00Z',
    estimatedFrequency: 'daily',
  },
  {
    id: 'demo-2',
    name: 'Inventory update',
    description: 'Syncs the stock from the Google Sheets spreadsheet with the orders system at end of day.',
    steps: ['Open inventory spreadsheet', 'Compare with today\'s orders', 'Update stock column'],
    status: 'active',
    source: 'chat',
    createdAt: '2026-04-05T10:00:00Z',
    lastRun: '2026-04-14T18:00:00Z',
    runsTotal: 12,
    timeSavedMinutes: 180,
    nextRun: '2026-04-15T18:00:00Z',
    estimatedFrequency: 'daily',
  },
  {
    id: 'demo-3',
    name: 'OCA daily shipment list',
    description: 'Generates and emails the day\'s package list to OCA before 12pm, CC\'d to the warehouse.',
    steps: ['Export today\'s orders', 'Generate CSV with shipping data', 'Send email to OCA'],
    status: 'pending_approval',
    source: 'suggestion',
    createdAt: '2026-04-13T14:00:00Z',
    runsTotal: 0,
    timeSavedMinutes: 0,
    estimatedFrequency: 'daily',
  },
  {
    id: 'demo-4',
    name: 'Weekly returns report',
    description: 'Consolidates all returns for the week in Google Sheets and notifies the team via Slack.',
    steps: ['Filter returns by date', 'Update spreadsheet', 'Notify in Slack'],
    status: 'learning',
    source: 'recording',
    createdAt: '2026-04-10T15:00:00Z',
    runsTotal: 2,
    timeSavedMinutes: 30,
    estimatedFrequency: 'weekly',
  },
]

// ─── Config por estado ────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AutomationStatus, {
  label: string; icon: string
  card: string; badge: string
}> = {
  pending_approval: {
    label: 'Pending approval',
    icon: '⏳',
    card: 'border-amber-200 bg-amber-50/40',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  learning: {
    label: 'Learning',
    icon: '🧠',
    card: 'border-blue-200 bg-blue-50/30',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  active: {
    label: 'Active',
    icon: '✅',
    card: 'border-organa-border bg-white',
    badge: 'bg-green-100 text-green-700 border-green-200',
  },
  paused: {
    label: 'Paused',
    icon: '⏸️',
    card: 'border-organa-border bg-organa-bg/50',
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
  },
  failed: {
    label: 'Error',
    icon: '⚠️',
    card: 'border-red-200 bg-red-50/40',
    badge: 'bg-red-100 text-red-700 border-red-200',
  },
}

const SOURCE_LABEL: Record<string, string> = {
  chat: '💬 Chat',
  recording: '🖥️ Recording',
  suggestion: '🤖 Suggested',
}

const FREQ_LABEL: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  'on-demand': 'On demand',
}

const SECTION_ORDER: AutomationStatus[] = ['failed', 'pending_approval', 'active', 'learning', 'paused']

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtMinutes(m: number) {
  if (m === 0) return '—'
  const h = Math.floor(m / 60), rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : h > 0 ? `${h}h` : `${m}m`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function fmtDateShort(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffH = Math.round(diffMs / 3600000)
  if (diffH < 24 && diffH > 0) return `Today ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  if (diffH < 48 && diffH > 0) return `Tomorrow ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

// ─── Automation card ─────────────────────────────────────────────────────────

function AutomationCard({
  auto,
  agentId,
  agentName,
  agentRole,
  agentDept,
  onUpdate,
  onDelete,
}: {
  auto: Automation
  agentId: string | null
  agentName: string
  agentRole: string
  agentDept: string
  onUpdate: (id: string, status: AutomationStatus) => void
  onDelete: (id: string) => void
}) {
  const cfg = STATUS_CONFIG[auto.status]
  const [confirming, setConfirming] = useState(false)
  const [shared, setShared] = useState(false)

  function approve() {
    if (!agentId) return
    agentStore.updateAutomationStatus(agentId, auto.id, 'active')
    onUpdate(auto.id, 'active')
  }

  function pause() {
    if (!agentId) return
    agentStore.updateAutomationStatus(agentId, auto.id, 'paused')
    onUpdate(auto.id, 'paused')
  }

  function resume() {
    if (!agentId) return
    agentStore.updateAutomationStatus(agentId, auto.id, 'active')
    onUpdate(auto.id, 'active')
  }

  function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    onDelete(auto.id)
  }

  function shareToPortal() {
    if (shared || !agentId) return
    const timeSaved = auto.timeSavedMinutes > 0 ? `~${auto.timeSavedMinutes}min/${auto.estimatedFrequency === 'daily' ? 'day' : auto.estimatedFrequency === 'weekly' ? 'week' : 'month'}` : null
    portalStore.addPost({
      authorId: agentId,
      authorName: agentName,
      authorRole: agentRole,
      authorDept: agentDept,
      content: `I approved the automation "${auto.name}".${timeSaved ? ` Saves ${timeSaved}.` : ''}`,
      type: 'achievement',
      achievementEmoji: '✅',
      timestamp: new Date().toISOString(),
    })
    setShared(true)
  }

  return (
    <div className={`border rounded-2xl p-5 shadow-card transition-all ${cfg.card}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
              {cfg.icon} {cfg.label}
            </span>
            <span className="text-[10px] text-organa-text-muted bg-organa-bg border border-organa-border px-2 py-0.5 rounded-full">
              {SOURCE_LABEL[auto.source] ?? auto.source}
            </span>
            <span className="text-[10px] text-organa-text-muted bg-organa-bg border border-organa-border px-2 py-0.5 rounded-full">
              {FREQ_LABEL[auto.estimatedFrequency]}
            </span>
          </div>
          <h3 className="font-semibold text-organa-text text-sm leading-snug">{auto.name}</h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-organa-text-secondary text-xs leading-relaxed mb-4">{auto.description}</p>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-base">🔁</span>
          <span className="text-organa-text font-semibold text-sm">{auto.runsTotal}</span>
          <span className="text-organa-text-muted text-xs">runs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">⏱️</span>
          <span className="text-organa-text font-semibold text-sm">{fmtMinutes(auto.timeSavedMinutes)}</span>
          <span className="text-organa-text-muted text-xs">saved</span>
        </div>
        {auto.lastRun && (
          <div className="flex items-center gap-1.5">
            <span className="text-base">📅</span>
            <span className="text-organa-text-muted text-xs">Last: {fmtDate(auto.lastRun)}</span>
          </div>
        )}
        {auto.nextRun && auto.status === 'active' && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-organa-success font-medium">Next: {fmtDateShort(auto.nextRun)}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {auto.status === 'pending_approval' && (
            <button
              onClick={approve}
              className="flex-1 bg-organa-accent hover:bg-organa-accent-hover text-white rounded-xl px-4 py-2 text-xs font-semibold transition-colors shadow-button flex items-center justify-center gap-1.5"
            >
              ✅ Approve automation
              <span className="text-white/70 font-normal">· +30 pts</span>
            </button>
          )}
          {auto.status === 'active' && (
            <button
              onClick={pause}
              className="px-4 py-2 rounded-xl border border-organa-border bg-white hover:border-organa-accent text-organa-text text-xs font-semibold transition-colors"
            >
              ⏸️ Pause
            </button>
          )}
          {(auto.status === 'paused' || auto.status === 'failed') && (
            <button
              onClick={resume}
              className="px-4 py-2 rounded-xl border border-organa-accent bg-organa-accent-light text-organa-accent text-xs font-semibold transition-colors hover:bg-organa-accent hover:text-white"
            >
              ▶️ {auto.status === 'failed' ? 'Retry' : 'Resume'}
            </button>
          )}
          <button
            onClick={handleDelete}
            onBlur={() => setTimeout(() => setConfirming(false), 200)}
            className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-colors ml-auto ${
              confirming
                ? 'border-red-400 bg-red-500 text-white'
                : 'border-organa-border bg-white text-organa-text-muted hover:border-red-300 hover:text-red-500'
            }`}
          >
            {confirming ? 'Confirm?' : '🗑️ Delete'}
          </button>
        </div>
        {auto.status === 'active' && agentId && (
          <button
            onClick={shareToPortal}
            disabled={shared}
            className={`w-full py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
              shared
                ? 'bg-organa-bg text-organa-text-muted border-organa-border cursor-default'
                : 'bg-white border-organa-accent/40 text-organa-accent hover:bg-organa-accent-light hover:border-organa-accent'
            }`}
          >
            {shared ? '✓ Achievement published to portal' : '🎉 Share achievement to the portal'}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [agentId, setAgentId] = useState<string | null>(null)
  const [agentName, setAgentName] = useState('')
  const [agentRole, setAgentRole] = useState('')
  const [agentDept, setAgentDept] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const user = getCurrentUser()
    const id = user.agentId ?? null

    // Resolve real agent
    let agent = id ? agentStore.getAgent(id) : null
    if (!agent && user.name) {
      agent = agentStore.getAllAgents().find(
        a => a.name.toLowerCase() === user.name.toLowerCase()
      ) ?? null
    }

    if (agent) {
      setAgentId(agent.id)
      setAgentName(agent.name)
      setAgentRole(agent.role)
      setAgentDept(agent.department)
      if (agent.automations.length === 0) {
        // Seed demo automations for first visit
        DEMO_AUTOMATIONS.forEach(auto => agentStore.addAutomation(agent!.id, auto))
        setAutomations([...DEMO_AUTOMATIONS])
      } else {
        setAutomations([...agent.automations])
      }
    } else {
      // No agent in store yet — show demo data read-only
      setAutomations([...DEMO_AUTOMATIONS])
    }
  }, [])

  function handleUpdate(autoId: string, newStatus: AutomationStatus) {
    setAutomations(prev => prev.map(a => a.id === autoId ? { ...a, status: newStatus } : a))
  }

  function handleDelete(autoId: string) {
    if (agentId) {
      const agent = agentStore.getAgent(agentId)
      if (agent) {
        agent.automations = agent.automations.filter(a => a.id !== autoId)
        agentStore.upsertAgent(agent)
      }
    }
    setAutomations(prev => prev.filter(a => a.id !== autoId))
  }

  if (!mounted) return null

  // ── Derived stats ────────────────────────────────────────────────────────

  const totalTimeSaved = automations.reduce((s, a) => s + a.timeSavedMinutes, 0)
  const activeCount = automations.filter(a => a.status === 'active').length
  const pendingCount = automations.filter(a => a.status === 'pending_approval').length
  const failedCount = automations.filter(a => a.status === 'failed').length

  // ── Group by status in display order ────────────────────────────────────

  const grouped = SECTION_ORDER
    .map(status => ({
      status,
      items: automations.filter(a => a.status === status),
    }))
    .filter(g => g.items.length > 0)

  const sectionTitles: Record<AutomationStatus, string> = {
    failed: '⚠️ Need attention',
    pending_approval: '⏳ Pending approval',
    active: '✅ Active',
    learning: '🧠 Learning',
    paused: '⏸️ Paused',
  }

  return (
    <main className="min-h-screen bg-organa-bg p-8 max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-organa-text">My automations</h1>
          <p className="text-organa-text-muted text-sm mt-1">
            Your agent manages these processes autonomously or with your approval.
          </p>
        </div>
        <Link
          href="/record"
          className="flex-shrink-0 bg-organa-accent hover:bg-organa-accent-hover text-white rounded-xl px-4 py-2.5 text-xs font-semibold shadow-button transition-colors flex items-center gap-2"
        >
          🖥️ Record new task
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { value: automations.length, label: 'Total', sub: 'automations' },
          { value: activeCount, label: 'Active', sub: 'running on their own', green: true },
          { value: fmtMinutes(totalTimeSaved), label: 'Time saved', sub: 'in total' },
          {
            value: pendingCount,
            label: 'Pending',
            sub: pendingCount > 0 ? 'your approval' : 'all approved',
            amber: pendingCount > 0,
          },
        ].map(({ value, label, sub, green, amber }) => (
          <div key={label} className="bg-white border border-organa-border rounded-2xl p-4 shadow-card">
            <div className={`text-2xl font-bold leading-none ${green ? 'text-organa-success' : amber ? 'text-amber-600' : 'text-organa-text'}`}>
              {value}
            </div>
            <div className="text-organa-text-muted text-[10px] uppercase tracking-wide mt-1">{label}</div>
            <div className="text-organa-text-muted text-[10px] mt-0.5 opacity-70">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Failed alert ── */}
      {failedCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 mb-5 flex items-center gap-3 shadow-card">
          <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
          <p className="text-red-700 text-sm font-medium flex-1">
            {failedCount} automation{failedCount > 1 ? 's' : ''} with errors — review them before continuing
          </p>
        </div>
      )}

      {/* ── Pending alert ── */}
      {pendingCount > 0 && failedCount === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 mb-5 flex items-center gap-3 shadow-card">
          <span className="text-amber-500 text-xl flex-shrink-0">⏳</span>
          <p className="text-amber-800 text-sm font-medium flex-1">
            {pendingCount} automation{pendingCount > 1 ? 's' : ''} waiting for your approval · +30 pts each
          </p>
        </div>
      )}

      {/* ── Sections ── */}
      {grouped.length === 0 ? (
        <div className="bg-white border border-organa-border rounded-2xl p-10 shadow-card flex flex-col items-center gap-4 text-center">
          <span className="text-4xl">⚡</span>
          <p className="text-organa-text font-semibold">No automations yet</p>
          <p className="text-organa-text-muted text-sm max-w-xs">
            Record a task so your agent can detect what it can automate.
          </p>
          <Link
            href="/record"
            className="bg-organa-accent hover:bg-organa-accent-hover text-white rounded-xl px-5 py-2.5 text-sm font-semibold shadow-button transition-colors"
          >
            🖥️ Record a task
          </Link>
        </div>
      ) : (
        <div className="space-y-7">
          {grouped.map(({ status, items }) => (
            <section key={status}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-organa-text font-semibold text-sm">{sectionTitles[status]}</h2>
                <span className="text-organa-text-muted text-xs">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map(auto => (
                  <AutomationCard
                    key={auto.id}
                    auto={auto}
                    agentId={agentId}
                    agentName={agentName}
                    agentRole={agentRole}
                    agentDept={agentDept}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ── Footer tip ── */}
      {automations.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-organa-text-muted text-xs">
            Each successful run adds +10 pts · Approving adds +30 pts
          </p>
        </div>
      )}
    </main>
  )
}
