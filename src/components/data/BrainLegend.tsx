'use client'

import { NODE_COLOR, type NodeType } from '@/lib/brain-graph'

const ITEMS: { type: NodeType; label: string }[] = [
  { type: 'person',    label: 'Personas' },
  { type: 'tool',      label: 'Herramientas' },
  { type: 'decision',  label: 'Decisiones clave' },
  { type: 'knowledge', label: 'Conocimiento tácito' },
]

export default function BrainLegend() {
  return (
    <div className="flex items-center gap-6 flex-wrap">
      {ITEMS.map(({ type, label }) => (
        <div key={type} className="flex items-center gap-2">
          <span
            className="block rounded-full flex-shrink-0"
            style={{
              width: type === 'person' ? 12 : 9,
              height: type === 'person' ? 12 : 9,
              background: NODE_COLOR[type],
              boxShadow: `0 0 6px ${NODE_COLOR[type]}80`,
            }}
          />
          <span className="text-xs text-slate-400 font-medium">{label}</span>
        </div>
      ))}
    </div>
  )
}
