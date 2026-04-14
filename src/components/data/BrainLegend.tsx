'use client'

import { NODE_COLOR, type NodeType } from '@/lib/brain-graph'

const ITEMS: { type: NodeType; label: string; square?: boolean }[] = [
  { type: 'person',    label: 'Personas' },
  { type: 'tool',      label: 'Herramientas' },
  { type: 'decision',  label: 'Decisiones clave' },
  { type: 'knowledge', label: 'Conocimiento tácito' },
  { type: 'document',  label: 'Documentos', square: true },
]

export default function BrainLegend() {
  return (
    <div className="flex items-center gap-6 flex-wrap">
      {ITEMS.map(({ type, label, square }) => (
        <div key={type} className="flex items-center gap-2">
          <span
            className="block flex-shrink-0"
            style={{
              width:        type === 'person' ? 12 : 9,
              height:       type === 'person' ? 12 : 9,
              background:   NODE_COLOR[type],
              boxShadow:    `0 0 6px ${NODE_COLOR[type]}80`,
              borderRadius: square ? '2px' : '50%',
            }}
          />
          <span className="text-xs text-slate-400 font-medium">{label}</span>
        </div>
      ))}
    </div>
  )
}
