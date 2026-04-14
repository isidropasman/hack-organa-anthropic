'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Users, Bot } from 'lucide-react'
import { agentStore } from '@/lib/agent-store'
import OrgEditPanel from '@/components/OrgEditPanel'
import type { Agent } from '@/lib/types'

const OrgChartCanvas = dynamic(() => import('@/components/OrgChartCanvas'), { ssr: false })

type View = 'person' | 'agent'

export default function OrgPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [companyName, setCompanyName] = useState('')
  const [view, setView] = useState<View>('agent')
  const [panelOpen, setPanelOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)

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
    <div className="flex flex-col h-screen" style={{ background: view === 'agent' ? '#0d1b2a' : '#f5f5f7' }}>

      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-6 py-3.5 border-b"
        style={{
          background: view === 'agent' ? 'rgba(15,25,45,0.95)' : 'rgba(255,255,255,0.95)',
          borderColor: view === 'agent' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div>
          <h1 className="font-semibold text-sm" style={{ color: view === 'agent' ? '#F0F6FF' : '#1d1d1f' }}>
            {companyName || 'Organigrama'}
          </h1>
          <p className="text-xs mt-0.5" style={{ color: view === 'agent' ? 'rgba(240,246,255,0.45)' : '#6e6e73' }}>
            {agents.length} personas · {trained}/{agents.length} agentes entrenados
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div
            className="flex rounded-lg p-0.5"
            style={{ background: view === 'agent' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }}
          >
            {(['person', 'agent'] as View[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={{
                  color: view === v
                    ? v === 'agent' ? '#F0F6FF' : '#1d1d1f'
                    : view === 'agent' ? 'rgba(240,246,255,0.4)' : 'rgba(0,0,0,0.4)',
                  background: view === v
                    ? v === 'agent' ? 'rgba(59,130,246,0.25)' : 'white'
                    : 'transparent',
                  boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {v === 'person' ? <Users size={12} /> : <Bot size={12} />}
                {v === 'person' ? 'Equipo' : 'Agentes'}
              </button>
            ))}
          </div>

          <button
            onClick={openNew}
            className="flex items-center gap-2 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            style={{ background: '#0071E3' }}
          >
            <Plus size={14} />
            Agregar
          </button>
        </div>
      </header>

      {/* Canvas — full screen, single view */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {agents.length > 0 ? (
              <OrgChartCanvas
                agents={agents}
                variant={view}
                editable
                onAgentClick={openEdit}
                selectedAgentId={selectedId}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <p className="text-sm" style={{ color: view === 'agent' ? 'rgba(240,246,255,0.4)' : '#6e6e73' }}>
                  No hay agentes.{' '}
                  <button onClick={openNew} style={{ color: '#0071E3' }} className="hover:underline">
                    Crear el primero
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Click hint */}
        {agents.length > 0 && !panelOpen && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none">
            <span
              className="text-xs px-3 py-1.5 rounded-full"
              style={{
                background: view === 'agent' ? 'rgba(240,246,255,0.12)' : 'rgba(0,0,0,0.55)',
                color: view === 'agent' ? 'rgba(240,246,255,0.6)' : 'white',
                backdropFilter: 'blur(8px)',
              }}
            >
              Hacé clic en una persona para editarla
            </span>
          </div>
        )}
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
