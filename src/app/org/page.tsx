'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence } from 'framer-motion'
import { Plus, GitBranch } from 'lucide-react'
import { agentStore } from '@/lib/agent-store'
import OrgEditPanel from '@/components/OrgEditPanel'
import type { Agent } from '@/lib/types'

const OrgChartCanvas = dynamic(() => import('@/components/OrgChartCanvas'), { ssr: false })

export default function OrgPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [companyName, setCompanyName] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null | 'new'>('new' as never)
  const [panelOpen, setPanelOpen] = useState(false)

  const reload = useCallback(() => {
    setAgents(agentStore.getAllAgents())
    setCompanyName(agentStore.getCompanyName())
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  function openNew() {
    setSelectedAgent(null)
    setPanelOpen(true)
  }

  function openEdit(agent: Agent) {
    setSelectedAgent(agent)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
    setSelectedAgent(null)
  }

  function handleSaved() {
    reload()
    closePanel()
  }

  const trained = agents.filter(a => a.onboardingComplete).length
  const departments = new Set(agents.map(a => a.department)).size

  return (
    <div className="flex flex-col h-screen bg-organa-bg">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-organa-border bg-organa-surface">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-organa-accent/10 flex items-center justify-center">
            <GitBranch size={16} className="text-organa-accent" />
          </div>
          <div>
            <h1 className="text-organa-text font-semibold text-sm">{companyName || 'Organigrama'}</h1>
            <p className="text-organa-text-muted text-xs mt-0.5">
              {agents.length} personas · {trained} entrenadas · {departments} departamentos
            </p>
          </div>
        </div>

        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-organa-accent hover:bg-organa-accent/90 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus size={14} />
          Agregar persona
        </button>
      </header>

      {/* Canvas */}
      <div className="flex-1 relative">
        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <GitBranch size={32} className="text-organa-text-muted opacity-30" />
            <p className="text-organa-text-muted text-sm">
              No hay agentes cargados.{' '}
              <button onClick={openNew} className="text-organa-accent hover:underline">
                Crear el primero
              </button>
            </p>
          </div>
        ) : (
          <OrgChartCanvas
            agents={agents}
            editable
            onAgentClick={openEdit}
            selectedAgentId={
              panelOpen && selectedAgent && selectedAgent !== null
                ? (selectedAgent as Agent).id
                : undefined
            }
          />
        )}

        {/* Hint */}
        {agents.length > 0 && !panelOpen && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none">
            <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
              Hacé clic en una persona para editarla
            </span>
          </div>
        )}
      </div>

      {/* Edit / Create panel */}
      <AnimatePresence>
        {panelOpen && (
          <OrgEditPanel
            agent={selectedAgent === null ? null : (selectedAgent as Agent)}
            allAgents={agents}
            onClose={closePanel}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
