'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import OrgUpload from '@/components/OrgUpload'
import AgentCard from '@/components/AgentCard'
import { agentStore } from '@/lib/agent-store'
import { loadDemoData } from '@/lib/demo-seed'
import type { Agent } from '@/lib/types'

const OrgChartCanvas = dynamic(() => import('@/components/OrgChartCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-organa-accent border-t-transparent rounded-full animate-spin" />
    </div>
  ),
})

export default function HomePage() {
  const router = useRouter()
  const [agents, setAgents] = useState<Agent[]>([])
  const [previewAgents, setPreviewAgents] = useState<Agent[] | null>(null)
  const [companyName, setCompanyName] = useState('Nova Agency')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setAgents(agentStore.getAllAgents())
    setCompanyName(agentStore.getCompanyName())
    setMounted(true)
  }, [])

  function handleAgentsGenerated(newAgents: Agent[], name?: string) {
    if (name) {
      // Template — skip preview, go straight to grid
      agentStore.setAgents(newAgents)
      agentStore.setCompanyName(name)
      setAgents(newAgents)
      setCompanyName(name)
    } else {
      // Image upload — show org chart preview first
      setPreviewAgents(newAgents)
    }
  }

  function handleConfirmPreview() {
    if (!previewAgents) return
    agentStore.setAgents(previewAgents)
    setAgents(previewAgents)
    setPreviewAgents(null)
  }

  function handleAgentClick(agent: Agent) {
    if (agent.onboardingComplete) router.push(`/agent/${agent.id}`)
    else router.push(`/onboard/${agent.id}`)
  }

  function handleLoadDemo() {
    const ok = loadDemoData()
    if (ok) {
      setAgents(agentStore.getAllAgents())
      setCompanyName(agentStore.getCompanyName())
    }
  }

  function handleReset() {
    agentStore.clearAll()
    setAgents([])
    setPreviewAgents(null)
    setCompanyName('Nova Agency')
  }

  function handleResetDemo() {
    agentStore.clearAll()
    window.location.reload()
  }

  const trainedCount = agents.filter(a => a.onboardingComplete).length

  if (!mounted) return null

  return (
    <main className="min-h-screen">
      <AnimatePresence mode="wait">

        {/* ── Grid ── */}
        {agents.length > 0 ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto px-6 py-10"
          >
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between mb-10"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-organa-accent rounded-xl flex items-center justify-center shadow-button">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="5" r="2.5" fill="white"/>
                    <circle cx="4" cy="14" r="2.5" fill="white" opacity="0.7"/>
                    <circle cx="16" cy="14" r="2.5" fill="white" opacity="0.7"/>
                    <line x1="10" y1="7.5" x2="4" y2="11.5" stroke="white" strokeWidth="1.2" opacity="0.7"/>
                    <line x1="10" y1="7.5" x2="16" y2="11.5" stroke="white" strokeWidth="1.2" opacity="0.7"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-organa-text leading-none">{companyName}</h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-sm text-organa-text-muted">{agents.length} agents</span>
                    <span className="text-organa-border">·</span>
                    <span className="text-sm text-organa-success font-medium">{trainedCount} trained</span>
                    {agents.length - trainedCount > 0 && (
                      <>
                        <span className="text-organa-border">·</span>
                        <span className="text-sm text-organa-text-muted">{agents.length - trainedCount} pending</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-organa-text">
                    {Math.round((trainedCount / agents.length) * 100)}%
                  </div>
                  <div className="text-xs text-organa-text-muted">coverage</div>
                </div>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 text-sm text-organa-text-secondary border border-organa-border bg-white rounded-xl hover:border-organa-accent hover:text-organa-accent transition-colors shadow-card"
                >
                  Upload new chart
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'left' }}
              className="h-1 bg-gray-100 rounded-full mb-10 overflow-hidden"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(trainedCount / agents.length) * 100}%` }}
                transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="h-full bg-organa-success rounded-full"
              />
            </motion.div>

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

            <div className="flex justify-center mt-12 pb-6">
              <button
                onClick={handleResetDemo}
                className="text-xs text-organa-text-muted hover:text-red-400 transition-colors"
              >
                Reset demo
              </button>
            </div>
          </motion.div>

        /* ── Preview ── */
        ) : previewAgents !== null ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header bar */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-between px-6 py-4 border-b border-organa-border bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-organa-accent rounded-xl flex items-center justify-center shadow-button">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="5" r="2.5" fill="white"/>
                    <circle cx="4" cy="14" r="2.5" fill="white" opacity="0.7"/>
                    <circle cx="16" cy="14" r="2.5" fill="white" opacity="0.7"/>
                    <line x1="10" y1="7.5" x2="4" y2="11.5" stroke="white" strokeWidth="1.2" opacity="0.7"/>
                    <line x1="10" y1="7.5" x2="16" y2="11.5" stroke="white" strokeWidth="1.2" opacity="0.7"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-organa-text leading-none">Review your org chart</p>
                  <p className="text-xs text-organa-text-muted mt-0.5">
                    {previewAgents.length} people detected — does this look right?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <motion.button
                  onClick={() => setPreviewAgents(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 text-sm text-organa-text-secondary border border-organa-border bg-white rounded-xl hover:border-red-200 hover:text-red-500 transition-colors"
                >
                  ← Re-upload
                </motion.button>
                <motion.button
                  onClick={handleConfirmPreview}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2 text-sm font-semibold bg-organa-accent text-white rounded-xl shadow-button hover:bg-blue-600 transition-colors"
                >
                  Create {previewAgents.length} agents →
                </motion.button>
              </div>
            </motion.div>

            {/* Canvas */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex-1"
              style={{ height: 'calc(100vh - 73px)' }}
            >
              <OrgChartCanvas agents={previewAgents} />
            </motion.div>
          </motion.div>

        /* ── Upload ── */
        ) : (
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
              <div className="inline-flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 bg-organa-accent rounded-xl flex items-center justify-center shadow-button">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="5" r="2.5" fill="white"/>
                    <circle cx="4" cy="14" r="2.5" fill="white" opacity="0.7"/>
                    <circle cx="16" cy="14" r="2.5" fill="white" opacity="0.7"/>
                    <line x1="10" y1="7.5" x2="4" y2="11.5" stroke="white" strokeWidth="1.2" opacity="0.7"/>
                    <line x1="10" y1="7.5" x2="16" y2="11.5" stroke="white" strokeWidth="1.2" opacity="0.7"/>
                  </svg>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-organa-text">ORGANA</h1>
              </div>
              <h2 className="text-[32px] font-bold text-organa-text leading-tight tracking-tight">
                Your company&apos;s memory,<br />
                <span className="text-organa-accent">preserved forever.</span>
              </h2>
              <p className="text-organa-text-secondary mt-3 text-[15px] max-w-md mx-auto leading-relaxed">
                Upload an org chart → AI generates one agent per person → train each agent in 10 minutes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 mb-10 text-sm text-organa-text-muted"
            >
              {['Upload org chart', 'Review & confirm', 'Train in 10 min', 'Chat with anyone'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-organa-accent-light text-organa-accent text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <span className="hidden sm:block">{step}</span>
                  </div>
                  {i < 3 && <div className="w-6 h-px bg-organa-border" />}
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-modal p-8"
            >
              <OrgUpload onAgentsGenerated={handleAgentsGenerated} isLoading={false} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-2 mt-5"
            >
              <div className="flex items-center gap-3 text-organa-text-muted text-sm">
                <div className="w-12 h-px bg-organa-border" />
                <span>o prueba con datos de demo</span>
                <div className="w-12 h-px bg-organa-border" />
              </div>
              <motion.button
                onClick={handleLoadDemo}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2.5 text-sm font-medium text-organa-accent border border-organa-accent bg-organa-accent-light rounded-xl hover:bg-organa-accent hover:text-white transition-colors shadow-sm"
              >
                Cargar datos de demo
              </motion.button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  )
}
