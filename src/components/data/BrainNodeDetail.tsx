'use client'

import { X } from 'lucide-react'
import {
  NODE_COLOR,
  getNodeConnections,
  type GraphNode,
  type GraphLink,
} from '@/lib/brain-graph'

const TYPE_LABEL: Record<GraphNode['type'], string> = {
  person:    'Persona',
  tool:      'Herramienta',
  decision:  'Decisión',
  knowledge: 'Conocimiento tácito',
}

interface Props {
  node: GraphNode
  nodes: GraphNode[]
  links: GraphLink[]
  onClose: () => void
}

export default function BrainNodeDetail({ node, nodes, links, onClose }: Props) {
  const color = NODE_COLOR[node.type]
  const connections = getNodeConnections(node.id, nodes, links)

  const persons     = connections.filter(c => c.node.type === 'person')
  const tools       = connections.filter(c => c.node.type === 'tool')
  const decisions   = connections.filter(c => c.node.type === 'decision')
  const knowledge   = connections.filter(c => c.node.type === 'knowledge')

  function Section({ title, items }: { title: string; items: typeof connections }) {
    if (items.length === 0) return null
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
          {title}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {items.map(({ node: n }) => (
            <span
              key={n.id}
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: `${NODE_COLOR[n.type]}18`,
                color: NODE_COLOR[n.type],
                border: `1px solid ${NODE_COLOR[n.type]}40`,
              }}
            >
              {n.label}
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-72 flex-shrink-0 rounded-2xl border overflow-hidden"
      style={{ background: '#12121E', borderColor: `${color}30` }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-start justify-between gap-3"
        style={{ borderBottom: `1px solid ${color}25` }}
      >
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="mt-0.5 flex-shrink-0 w-3 h-3 rounded-full"
            style={{ background: color, boxShadow: `0 0 8px ${color}80` }}
          />
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">
              {node.label}
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color }}>
              {TYPE_LABEL[node.type]}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {node.detail && (
          <p className="text-slate-300 text-xs leading-relaxed">{node.detail}</p>
        )}

        <div
          className="text-xs text-slate-500 flex items-center gap-1.5"
          style={{ borderTop: `1px solid ${color}15`, paddingTop: '12px' }}
        >
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: color }}
          />
          <span>{node.connections} conexiones</span>
        </div>

        {node.type === 'person' && (
          <div className="space-y-4">
            <Section title="Herramientas" items={tools} />
            <Section title="Decisiones clave" items={decisions} />
            <Section title="Conocimiento tácito" items={knowledge} />
            <Section title="Trabaja con" items={persons} />
          </div>
        )}

        {node.type === 'tool' && (
          <Section title="Usado por" items={persons} />
        )}

        {node.type === 'decision' && (
          <Section title="Involucra" items={persons} />
        )}

        {node.type === 'knowledge' && (
          <Section title="Conocido por" items={persons} />
        )}
      </div>
    </div>
  )
}
