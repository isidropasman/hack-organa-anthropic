'use client'

import { useState, useMemo } from 'react'
import { Network, FileStack } from 'lucide-react'
import { BRAIN_GRAPH_DATA, type GraphNode } from '@/lib/brain-graph'
import BrainGraph from '@/components/data/BrainGraph'
import BrainLegend from '@/components/data/BrainLegend'
import BrainNodeDetail from '@/components/data/BrainNodeDetail'
import BrainUpload from '@/components/data/BrainUpload'
import BrainChat from '@/components/data/BrainChat'
import BrainChatButton from '@/components/data/BrainChatButton'

const { nodes, links } = BRAIN_GRAPH_DATA

export default function BrainPage() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [chatOpen, setChatOpen] = useState(false)

  const stats = useMemo(() => {
    const persons   = nodes.filter(n => n.type === 'person').length
    const tools     = nodes.filter(n => n.type === 'tool').length
    const decisions = nodes.filter(n => n.type === 'decision').length
    const knowledge = nodes.filter(n => n.type === 'knowledge').length
    return { persons, tools, decisions, knowledge, links: links.length }
  }, [])

  return (
    <div className="flex flex-col" style={{ background: '#080810', minHeight: '100vh' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="px-8 pt-7 pb-5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(79,107,237,0.15)', border: '1px solid rgba(79,107,237,0.3)' }}
              >
                <Network size={16} style={{ color: '#4F6BED' }} />
              </div>
              <h1 className="text-white text-xl font-bold tracking-tight">
                Cerebro Organizacional
              </h1>
            </div>
            <p className="text-slate-500 text-sm">
              Red neuronal de conocimiento de Nova Store
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 flex-wrap">
            <Stat value={stats.persons}   label="roles"               color="#4F6BED" />
            <Stat value={stats.tools}     label="herramientas"        color="#F59E0B" />
            <Stat value={stats.decisions} label="decisiones clave"    color="#EF4444" />
            <Stat value={stats.knowledge} label="conocimientos tácitos" color="#8B5CF6" />
            <Stat value={stats.links}     label="conexiones"          color="#94A3B8" />
          </div>
        </div>

        <div className="mt-4">
          <BrainLegend />
        </div>
      </div>

      {/* ── Graph area ──────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 gap-4 p-4" style={{ height: 'calc(100vh - 196px)' }}>
        <div className="flex-1 min-h-0 min-w-0 relative">
          <BrainGraph
            nodes={nodes}
            links={links}
            selectedNodeId={selectedNode?.id ?? null}
            onNodeClick={setSelectedNode}
          />
        </div>

        {selectedNode && (
          <div
            className="flex-shrink-0 self-start mt-2"
            style={{ animation: 'slideInRight 0.2s ease-out' }}
          >
            <BrainNodeDetail
              node={selectedNode}
              nodes={nodes}
              links={links}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        )}
      </div>

      {/* ── Documents section ───────────────────────────────────────────────── */}
      <div
        className="px-8 py-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(79,107,237,0.12)', border: '1px solid rgba(79,107,237,0.25)' }}
          >
            <FileStack size={13} style={{ color: '#4F6BED' }} />
          </div>
          <div>
            <h2 className="text-white text-sm font-semibold">Documentos del cerebro</h2>
            <p className="text-slate-600 text-xs">Subí manuales, SOPs y guías para enriquecer el conocimiento organizacional</p>
          </div>
        </div>

        <div style={{ maxWidth: '760px' }}>
          <BrainUpload />
        </div>
      </div>

      {/* ── Floating chat ───────────────────────────────────────────────────── */}
      {!chatOpen && <BrainChatButton onClick={() => setChatOpen(true)} />}
      {chatOpen  && <BrainChat onClose={() => setChatOpen(false)} />}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="font-bold" style={{ color }}>{value}</span>
      <span className="text-slate-500">{label}</span>
    </div>
  )
}
