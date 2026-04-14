'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import { Plus, Users, Bot } from 'lucide-react'
import { agentStore } from '@/lib/agent-store'
import OrgEditPanel from '@/components/OrgEditPanel'
import type { Agent } from '@/lib/types'

const OrgChartCanvas = dynamic(() => import('@/components/OrgChartCanvas'), { ssr: false })

export default function OrgPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [companyName, setCompanyName] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null) // null = new

  const reload = useCallback(() => {
    setAgents(agentStore.getAllAgents())
    setCompanyName(agentStore.getCompanyName())
  }, [])

  useEffect(() => { reload() }, [reload])

  function openNew() {
    setEditingAgent(null)
    setPanelOpen(true)
  }

  function openEdit(agent: Agent) {
    setEditingAgent(agent)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
  }

  function handleSaved() {
    reload()
    closePanel()
  }

  const trained = agents.filter(a => a.onboardingComplete).length
  const selectedId = panelOpen && editingAgent ? editingAgent.id : undefined

  return (
    <div className="flex flex-col h-screen bg-organa-bg">

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-b border-organa-border bg-organa-surface">
        <div>
          <h1 className="text-organa-text font-semibold text-sm">{companyName || 'Organigrama'}</h1>
          <p className="text-organa-text-muted text-xs mt-0.5">
            {agents.length} personas · {trained}/{agents.length} agentes entrenados
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-organa-accent hover:bg-organa-accent/90 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus size={14} />
          Agregar persona
        </button>
      </header>

      {/* Dual canvas */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left — Human org */}
        <div className="flex-1 relative">
          <PanelLabel icon={<Users size={12} />} label="Tu equipo" color="text-organa-text-muted" />
          {agents.length > 0 ? (
            <OrgChartCanvas
              agents={agents}
              variant="person"
              editable
              onAgentClick={openEdit}
              selectedAgentId={selectedId}
            />
          ) : (
            <EmptyState onAdd={openNew} />
          )}
        </div>

        {/* Divider */}
        <div className="w-px bg-organa-border flex-shrink-0 relative">
          <div className="absolute inset-y-0 -left-2 -right-2" />
        </div>

        {/* Right — Agent org */}
        <div className="flex-1 relative">
          <PanelLabel
            icon={<Bot size={12} />}
            label="Agentes IA"
            color="text-organa-accent"
            accent
          />
          {agents.length > 0 ? (
            <OrgChartCanvas
              agents={agents}
              variant="agent"
              editable
              onAgentClick={openEdit}
              selectedAgentId={selectedId}
            />
          ) : (
            <EmptyState onAdd={openNew} />
          )}
        </div>
      </div>

      {/* Edit / Create panel */}
      <AnimatePresence>
        {panelOpen && (
          <OrgEditPanel
            agent={editingAgent}
            allAgents={agents}
            onClose={closePanel}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PanelLabel({
  icon, label, color, accent,
}: {
  icon: React.ReactNode
  label: string
  color: string
  accent?: boolean
}) {
  return (
    <div className="absolute top-3 left-4 z-10 pointer-events-none">
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full
        ${accent
          ? 'bg-organa-accent/10 text-organa-accent border border-organa-accent/20'
          : 'bg-organa-surface/80 text-organa-text-muted border border-organa-border'
        } backdrop-blur-sm`}
      >
        {icon}
        {label}
      </span>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <p className="text-organa-text-muted text-sm">
        <button onClick={onAdd} className="text-organa-accent hover:underline">
          Crear el primero
        </button>
      </p>
    </div>
  )
}
