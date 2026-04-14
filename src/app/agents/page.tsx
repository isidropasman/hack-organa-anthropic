'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import OrgUpload from '@/components/OrgUpload'
import AgentCard from '@/components/AgentCard'
import { agentStore } from '@/lib/agent-store'
import type { Agent } from '@/lib/types'

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [companyName, setCompanyName] = useState('Nova Agency')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setAgents(agentStore.getAllAgents())
    setCompanyName(agentStore.getCompanyName())
    setMounted(true)
  }, [])

  function handleAgentsGenerated(newAgents: Agent[], name?: string) {
    agentStore.setAgents(newAgents)
    setAgents(newAgents)
    if (name) {
      agentStore.setCompanyName(name)
      setCompanyName(name)
    }
  }

  function handleAgentClick(agent: Agent) {
    if (agent.onboardingComplete) router.push(`/agent/${agent.id}`)
    else router.push(`/onboard/${agent.id}`)
  }

  function handleReset() {
    agentStore.clearAll()
    setAgents([])
    setCompanyName('Nova Agency')
  }

  const trainedCount = agents.filter(a => a.onboardingComplete).length

  if (!mounted) return null

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">
        {agents.length === 0 ? (
          /* ── Upload state ── */
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-center mb-12"
            >
              <h2 className="text-[28px] font-bold text-organa-text leading-tight tracking-tight">
                Importar organigrama
              </h2>
              <p className="text-organa-text-secondary mt-2 text-[15px] max-w-md mx-auto leading-relaxed">
                Subí una foto del organigrama para generar los agentes del equipo automáticamente.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-modal p-8"
            >
              <OrgUpload onAgentsGenerated={handleAgentsGenerated} isLoading={false} />
            </motion.div>
          </motion.div>
        ) : (
          /* ── Grid state ── */
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto px-6 py-10"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h1 className="text-xl font-bold text-organa-text">{companyName}</h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-sm text-organa-text-muted">{agents.length} agentes</span>
                  <span className="text-organa-border">·</span>
                  <span className="text-sm text-organa-success font-medium">{trainedCount} entrenados</span>
                  {agents.length - trainedCount > 0 && (
                    <>
                      <span className="text-organa-border">·</span>
                      <span className="text-sm text-organa-text-muted">{agents.length - trainedCount} pendientes</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-organa-text">
                    {Math.round((trainedCount / agents.length) * 100)}%
                  </div>
                  <div className="text-xs text-organa-text-muted">cobertura</div>
                </div>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 text-sm text-organa-text-secondary border border-organa-border bg-white rounded-xl hover:border-organa-accent hover:text-organa-accent transition-colors shadow-card"
                >
                  Nuevo organigrama
                </motion.button>
              </div>
            </motion.div>

            {/* Coverage bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'left' }}
              className="h-1 bg-gray-100 rounded-full mb-8 overflow-hidden"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(trainedCount / agents.length) * 100}%` }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-organa-success rounded-full"
              />
            </motion.div>

            {/* Agent grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {agents.map((agent, i) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  index={i}
                  onClick={() => handleAgentClick(agent)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
