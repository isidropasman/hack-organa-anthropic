'use client'

import { useEffect, useState } from 'react'
import { agentStore } from '@/lib/agent-store'
import type { Agent, Automation, AutomationStatus } from '@/lib/types'

// ─── Demo seed for multiple agents (so the admin view looks populated) ────────

const DEMO_SETS: Automation[][] = [
  [
    {
      id: 'adm-demo-1a',
      name: 'Seguimiento diario de envíos',
      description: 'Revisa el tracking de todos los envíos pendientes en MercadoLibre Envíos y genera un reporte automático.',
      steps: ['Acceder a ML Envíos', 'Filtrar envíos del día', 'Exportar reporte', 'Enviar a Slack'],
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
      id: 'adm-demo-1b',
      name: 'Listado OCA para envío',
      description: 'Genera y envía el listado de paquetes del día a OCA por email antes de las 12pm.',
      steps: ['Exportar pedidos del día', 'Generar CSV', 'Enviar email a OCA'],
      status: 'pending_approval',
      source: 'suggestion',
      createdAt: '2026-04-13T14:00:00Z',
      runsTotal: 0,
      timeSavedMinutes: 0,
      estimatedFrequency: 'daily',
    },
  ],
  [
    {
      id: 'adm-demo-2a',
      name: 'Reporte semanal de métricas',
      description: 'Consolida KPIs del equipo en Google Sheets y envía resumen por email todos los lunes.',
      steps: ['Recopilar datos de analytics', 'Actualizar planilla', 'Enviar email'],
      status: 'active',
      source: 'recording',
      createdAt: '2026-04-05T10:00:00Z',
      lastRun: '2026-04-07T08:00:00Z',
      runsTotal: 6,
      timeSavedMinutes: 90,
      nextRun: '2026-04-21T08:00:00Z',
      estimatedFrequency: 'weekly',
    },
    {
      id: 'adm-demo-2b',
      name: 'Respuesta automática a leads',
      description: 'Detecta leads nuevos en el CRM y envía email de bienvenida personalizado dentro de los primeros 5 minutos.',
      steps: ['Monitorear CRM', 'Generar email personalizado', 'Enviar y registrar'],
      status: 'learning',
      source: 'chat',
      createdAt: '2026-04-10T15:00:00Z',
      runsTotal: 3,
      timeSavedMinutes: 45,
      estimatedFrequency: 'on-demand',
    },
  ],
  [
    {
      id: 'adm-demo-3a',
      name: 'Actualización de inventario',
      description: 'Sincroniza el stock de la planilla con el sistema de pedidos al final del día.',
      steps: ['Abrir planilla de inventario', 'Comparar con pedidos', 'Actualizar columna stock'],
      status: 'active',
      source: 'recording',
      createdAt: '2026-04-03T10:00:00Z',
      lastRun: '2026-04-14T18:00:00Z',
      runsTotal: 12,
      timeSavedMinutes: 180,
      nextRun: '2026-04-15T18:00:00Z',
      estimatedFrequency: 'daily',
    },
    {
      id: 'adm-demo-3b',
      name: 'Alerta de stock mínimo',
      description: 'Revisa niveles de stock cada mañana y notifica a logística si algún producto está por debajo del mínimo.',
      steps: ['Leer planilla de stock', 'Comparar con umbral mínimo', 'Enviar alerta a Slack'],
      status: 'failed',
      source: 'suggestion',
      createdAt: '2026-04-08T11:00:00Z',
      lastRun: '2026-04-13T09:00:00Z',
      runsTotal: 5,
      timeSavedMinutes: 40,
      estimatedFrequency: 'daily',
    },
  ],
]

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AutomationStatus, { label: string; icon: string; badge: string; dot: string }> = {
  pending_approval: {
    label: 'Pendiente',
    icon: '⏳',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-400',
  },
  learning: {
    label: 'Aprendiendo',
    icon: '🧠',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-400',
  },
  active: {
    label: 'Activa',
    icon: '✅',
    badge: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
  paused: {
    label: 'Pausada',
    icon: '⏸️',
    badge: 'bg-gray-100 text-gray-600 border-gray-200',
    dot: 'bg-gray-400',
  },
  failed: {
    label: 'Error',
    icon: '⚠️',
    badge: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-500',
  },
}

const SOURCE_LABEL: Record<string, string> = {
  chat: '💬 Chat',
  recording: '🖥️ Grabación',
  suggestion: '🤖 Sugerida',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtMinutes(m: number) {
  if (m === 0) return '0m'
  const h = Math.floor(m / 60), rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : h > 0 ? `${h}h` : `${m}m`
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

function agentStats(automations: Automation[]) {
  return {
    total: automations.length,
    active: automations.filter(a => a.status === 'active').length,
    pending: automations.filter(a => a.status === 'pending_approval').length,
    failed: automations.filter(a => a.status === 'failed').length,
    timeSaved: automations.reduce((s, a) => s + a.timeSavedMinutes, 0),
    runs: automations.reduce((s, a) => s + a.runsTotal, 0),
  }
}

// ─── Row inside expanded employee section ─────────────────────────────────────

function AutomationRow({
  auto,
  agentId,
  onUpdate,
}: {
  auto: Automation
  agentId: string
  onUpdate: (agentId: string, autoId: string, status: AutomationStatus) => void
}) {
  const cfg = STATUS_CONFIG[auto.status]

  function approve() {
    agentStore.updateAutomationStatus(agentId, auto.id, 'active')
    onUpdate(agentId, auto.id, 'active')
  }

  function pause() {
    agentStore.updateAutomationStatus(agentId, auto.id, 'paused')
    onUpdate(agentId, auto.id, 'paused')
  }

  function resume() {
    agentStore.updateAutomationStatus(agentId, auto.id, 'active')
    onUpdate(agentId, auto.id, 'active')
  }

  return (
    <div className="flex items-start gap-4 py-4 border-b border-organa-border last:border-0">
      {/* Status dot */}
      <div className="flex-shrink-0 mt-1.5">
        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-organa-text font-semibold text-sm">{auto.name}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
            {cfg.icon} {cfg.label}
          </span>
          <span className="text-[10px] text-organa-text-muted">
            {SOURCE_LABEL[auto.source] ?? auto.source}
          </span>
        </div>
        <p className="text-organa-text-muted text-xs leading-relaxed mb-2">{auto.description}</p>

        <div className="flex items-center gap-4 text-xs text-organa-text-muted flex-wrap">
          <span>🔁 {auto.runsTotal} ejecuciones</span>
          <span>⏱️ {fmtMinutes(auto.timeSavedMinutes)} ahorradas</span>
          {auto.lastRun && (
            <span>📅 Última: {new Date(auto.lastRun).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2">
        {auto.status === 'pending_approval' && (
          <button
            onClick={approve}
            className="bg-organa-accent hover:bg-organa-accent-hover text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            ✅ Aprobar
          </button>
        )}
        {auto.status === 'active' && (
          <button
            onClick={pause}
            className="border border-organa-border bg-white hover:border-organa-accent text-organa-text rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            ⏸️ Pausar
          </button>
        )}
        {(auto.status === 'paused' || auto.status === 'failed') && (
          <button
            onClick={resume}
            className="border border-organa-accent bg-organa-accent-light text-organa-accent hover:bg-organa-accent hover:text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
          >
            ▶️ Reanudar
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Employee section ─────────────────────────────────────────────────────────

function EmployeeSection({
  agent,
  automations,
  onUpdate,
}: {
  agent: Agent
  automations: Automation[]
  onUpdate: (agentId: string, autoId: string, status: AutomationStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const stats = agentStats(automations)
  const initials = getInitials(agent.name)

  const hasPending = stats.pending > 0
  const hasFailed = stats.failed > 0

  return (
    <div className={`bg-white border rounded-2xl shadow-card overflow-hidden transition-all ${
      hasFailed ? 'border-red-200' : hasPending ? 'border-amber-200' : 'border-organa-border'
    }`}>
      {/* Header — always visible, clickable to expand */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-5 hover:bg-organa-bg/50 transition-colors text-left"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-organa-accent/15 border border-organa-accent/25 flex items-center justify-center flex-shrink-0">
          <span className="text-organa-accent font-bold text-xs">{initials}</span>
        </div>

        {/* Name + role */}
        <div className="flex-1 min-w-0">
          <p className="text-organa-text font-semibold text-sm">{agent.name}</p>
          <p className="text-organa-text-muted text-xs">{agent.role} · {agent.department}</p>
        </div>

        {/* Mini stats */}
        <div className="hidden sm:flex items-center gap-5 text-center mr-4">
          <div>
            <div className={`text-base font-bold leading-none ${stats.active > 0 ? 'text-organa-success' : 'text-organa-text-muted'}`}>
              {stats.active}
            </div>
            <div className="text-[10px] text-organa-text-muted mt-0.5">activas</div>
          </div>
          <div>
            <div className={`text-base font-bold leading-none ${hasPending ? 'text-amber-600' : 'text-organa-text-muted'}`}>
              {stats.pending}
            </div>
            <div className="text-[10px] text-organa-text-muted mt-0.5">pendientes</div>
          </div>
          <div>
            <div className={`text-base font-bold leading-none ${hasFailed ? 'text-red-500' : 'text-organa-text-muted'}`}>
              {stats.failed}
            </div>
            <div className="text-[10px] text-organa-text-muted mt-0.5">con error</div>
          </div>
          <div>
            <div className="text-base font-bold leading-none text-organa-text">
              {fmtMinutes(stats.timeSaved)}
            </div>
            <div className="text-[10px] text-organa-text-muted mt-0.5">ahorradas</div>
          </div>
        </div>

        {/* Badges for urgent states */}
        <div className="flex items-center gap-1.5 mr-3">
          {hasFailed && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
              ⚠️ {stats.failed} error{stats.failed > 1 ? 'es' : ''}
            </span>
          )}
          {hasPending && !hasFailed && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              ⏳ {stats.pending} pendiente{stats.pending > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          className={`flex-shrink-0 text-organa-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Expanded automations list */}
      {open && (
        <div className="border-t border-organa-border px-5">
          {automations.map(auto => (
            <AutomationRow
              key={auto.id}
              auto={auto}
              agentId={agent.id}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface EmployeeEntry {
  agent: Agent
  automations: Automation[]
}

export default function AdminAutomationsPage() {
  const [entries, setEntries] = useState<EmployeeEntry[]>([])
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState<AutomationStatus | 'all'>('all')

  useEffect(() => {
    setMounted(true)
    const agents = agentStore.getAllAgents()

    // Seed demo automations for first 3 agents that have none
    let demoIdx = 0
    const enriched = agents.map(agent => {
      let autos = [...agent.automations]
      if (autos.length === 0 && demoIdx < DEMO_SETS.length) {
        const demos = DEMO_SETS[demoIdx++]
        demos.forEach(d => agentStore.addAutomation(agent.id, d))
        autos = [...demos]
      }
      return { agent, automations: autos }
    })

    // Only show agents that have automations, sorted: failed/pending first, then by total count
    const withAutos = enriched
      .filter(e => e.automations.length > 0)
      .sort((a, b) => {
        const aUrgent = a.automations.filter(x => x.status === 'failed' || x.status === 'pending_approval').length
        const bUrgent = b.automations.filter(x => x.status === 'failed' || x.status === 'pending_approval').length
        if (bUrgent !== aUrgent) return bUrgent - aUrgent
        return b.automations.length - a.automations.length
      })

    setEntries(withAutos)
  }, [])

  function handleUpdate(agentId: string, autoId: string, newStatus: AutomationStatus) {
    setEntries(prev => prev.map(e => {
      if (e.agent.id !== agentId) return e
      return {
        ...e,
        automations: e.automations.map(a => a.id === autoId ? { ...a, status: newStatus } : a),
      }
    }))
  }

  if (!mounted) return null

  // ── Global stats ───────────────────────────────────────────────────────────

  const allAutos = entries.flatMap(e => e.automations)
  const globalStats = {
    employees: entries.length,
    total: allAutos.length,
    active: allAutos.filter(a => a.status === 'active').length,
    pending: allAutos.filter(a => a.status === 'pending_approval').length,
    failed: allAutos.filter(a => a.status === 'failed').length,
    timeSaved: allAutos.reduce((s, a) => s + a.timeSavedMinutes, 0),
    runs: allAutos.reduce((s, a) => s + a.runsTotal, 0),
  }

  // ── Filter entries ─────────────────────────────────────────────────────────

  const filtered = filter === 'all'
    ? entries
    : entries
        .map(e => ({ ...e, automations: e.automations.filter(a => a.status === filter) }))
        .filter(e => e.automations.length > 0)

  const FILTER_TABS: { value: AutomationStatus | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'Todas', count: globalStats.total },
    { value: 'pending_approval', label: '⏳ Pendientes', count: globalStats.pending },
    { value: 'failed', label: '⚠️ Con error', count: globalStats.failed },
    { value: 'active', label: '✅ Activas', count: globalStats.active },
    { value: 'learning', label: '🧠 Aprendiendo', count: allAutos.filter(a => a.status === 'learning').length },
    { value: 'paused', label: '⏸️ Pausadas', count: allAutos.filter(a => a.status === 'paused').length },
  ]

  return (
    <main className="min-h-screen bg-organa-bg p-8 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-organa-text">Team automations</h1>
        <p className="text-organa-text-muted text-sm mt-1">
          Visión global de todas las automatizaciones activas, pendientes y con error por empleado.
        </p>
      </div>

      {/* ── Global stats ── */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        {[
          { value: globalStats.employees, label: 'Empleados', sub: 'con automatizaciones', color: 'text-organa-text' },
          { value: globalStats.total, label: 'Total', sub: 'automatizaciones', color: 'text-organa-text' },
          { value: globalStats.active, label: 'Activas', sub: 'corriendo solas', color: 'text-organa-success' },
          { value: globalStats.pending, label: 'Pendientes', sub: 'de aprobación', color: globalStats.pending > 0 ? 'text-amber-600' : 'text-organa-text-muted' },
          { value: globalStats.failed, label: 'Con error', sub: 'requieren atención', color: globalStats.failed > 0 ? 'text-red-500' : 'text-organa-text-muted' },
          { value: fmtMinutes(globalStats.timeSaved), label: 'Tiempo ahorrado', sub: `${globalStats.runs} ejecuciones`, color: 'text-organa-accent' },
        ].map(({ value, label, sub, color }) => (
          <div key={label} className="bg-white border border-organa-border rounded-2xl p-4 shadow-card">
            <div className={`text-xl font-bold leading-none ${color}`}>{value}</div>
            <div className="text-organa-text-muted text-[10px] uppercase tracking-wide mt-1">{label}</div>
            <div className="text-organa-text-muted text-[10px] mt-0.5 opacity-70">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Urgent alerts ── */}
      {globalStats.failed > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 mb-4 flex items-center gap-3 shadow-card">
          <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
          <p className="text-red-700 text-sm font-medium flex-1">
            {globalStats.failed} automatización{globalStats.failed > 1 ? 'es' : ''} con error en el equipo
          </p>
          <button
            onClick={() => setFilter('failed')}
            className="text-red-600 text-xs font-semibold hover:underline flex-shrink-0"
          >
            Ver solo errores →
          </button>
        </div>
      )}
      {globalStats.pending > 0 && globalStats.failed === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 mb-4 flex items-center gap-3 shadow-card">
          <span className="text-amber-500 text-xl flex-shrink-0">⏳</span>
          <p className="text-amber-800 text-sm font-medium flex-1">
            {globalStats.pending} automatización{globalStats.pending > 1 ? 'es' : ''} esperando aprobación en el equipo
          </p>
          <button
            onClick={() => setFilter('pending_approval')}
            className="text-amber-700 text-xs font-semibold hover:underline flex-shrink-0"
          >
            Ver pendientes →
          </button>
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {FILTER_TABS.filter(t => t.count > 0 || t.value === 'all').map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
              filter === tab.value
                ? 'bg-organa-accent text-white border-organa-accent shadow-button'
                : 'bg-white text-organa-text-muted border-organa-border hover:border-organa-accent hover:text-organa-text'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                filter === tab.value ? 'bg-white/20 text-white' : 'bg-organa-bg text-organa-text-muted'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Employee sections ── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-organa-border rounded-2xl p-10 shadow-card flex flex-col items-center gap-4 text-center">
          <span className="text-4xl">⚡</span>
          <p className="text-organa-text font-semibold">No hay automatizaciones en este estado</p>
          <button
            onClick={() => setFilter('all')}
            className="text-organa-accent text-sm font-medium hover:underline"
          >
            Ver todas
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ agent, automations }) => (
            <EmployeeSection
              key={agent.id}
              agent={agent}
              automations={automations}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {/* ── Footer note ── */}
      {filtered.length > 0 && (
        <p className="text-center text-organa-text-muted text-xs mt-8">
          {filtered.length} empleado{filtered.length > 1 ? 's' : ''} · {filtered.flatMap(e => e.automations).length} automatizaciones
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="ml-2 text-organa-accent font-medium hover:underline">
              Ver todas
            </button>
          )}
        </p>
      )}
    </main>
  )
}
