'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ControlRoom   from './ControlRoom'
import SynapsePanel  from './SynapsePanel'
import NexusPanel    from './NexusPanel'
import TribunalPanel from './TribunalPanel'
import ScorePanel    from './ScorePanel'
import AcademiaPanel from './AcademiaPanel'

type Tab = 'control' | 'synapse' | 'nexus' | 'tribunal' | 'score' | 'academia'

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'control',  label: 'Control Room', emoji: '⬡' },
  { id: 'synapse',  label: 'Synapse',      emoji: '⇄' },
  { id: 'nexus',    label: 'Nexus',        emoji: '◎' },
  { id: 'tribunal', label: 'Tribunal',     emoji: '⚖' },
  { id: 'score',    label: 'Score',        emoji: '◈' },
  { id: 'academia', label: 'Academia',     emoji: '✦' },
]

function TabPanel({ tab }: { tab: Tab }) {
  switch (tab) {
    case 'control':  return <ControlRoom />
    case 'synapse':  return <SynapsePanel />
    case 'nexus':    return <NexusPanel />
    case 'tribunal': return <TribunalPanel />
    case 'score':    return <ScorePanel />
    case 'academia': return <AcademiaPanel />
  }
}

export default function CivilizationLayout() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const activeTab    = (searchParams.get('tab') as Tab) ?? 'control'

  const setTab = (tab: Tab) => {
    router.push(`/civilization?tab=${tab}`, { scroll: false })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div
        style={{
          display:       'flex',
          gap:           4,
          padding:       '0 0 0 0',
          marginBottom:  24,
          borderBottom:  '1px solid #1E293B',
          overflowX:     'auto',
          flexShrink:    0,
        }}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              style={{
                padding:        '10px 16px',
                fontSize:       13,
                fontWeight:     isActive ? 700 : 500,
                color:          isActive ? '#E2E8F0' : '#475569',
                background:     'transparent',
                border:         'none',
                borderBottom:   isActive ? '2px solid #6366F1' : '2px solid transparent',
                cursor:         'pointer',
                whiteSpace:     'nowrap',
                display:        'flex',
                alignItems:     'center',
                gap:            6,
                transition:     'color 0.2s, border-color 0.2s',
                marginBottom:   -1,
              }}
            >
              <span style={{ fontSize: 15 }}>{tab.emoji}</span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Panel */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TabPanel tab={activeTab} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
