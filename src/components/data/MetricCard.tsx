'use client'

import type { ElementType } from 'react'

interface Props {
  label: string
  value: string | number
  icon: ElementType
  highlight?: 'green' | 'amber' | 'red' | 'blue'
}

function highlightClasses(h?: Props['highlight']) {
  if (h === 'green') return { icon: 'text-green-400', card: 'bg-green-900/20 border-green-900/40' }
  if (h === 'amber') return { icon: 'text-amber-400', card: 'bg-amber-900/20 border-amber-900/40' }
  if (h === 'red') return { icon: 'text-red-400', card: 'bg-red-900/20 border-red-900/40' }
  if (h === 'blue') return { icon: 'text-blue-400', card: 'bg-blue-900/20 border-blue-900/40' }
  return { icon: 'text-organa-accent', card: 'bg-organa-surface border-organa-border' }
}

export default function MetricCard({ label, value, icon: Icon, highlight }: Props) {
  const cls = highlightClasses(highlight)
  return (
    <div className={`border rounded-xl p-4 flex items-center gap-4 ${cls.card}`}>
      <div className={`p-2 rounded-lg bg-organa-bg/60 flex-shrink-0 ${cls.icon}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-2xl font-bold text-organa-text leading-none">{value}</div>
        <div className="text-organa-text-muted text-xs mt-1">{label}</div>
      </div>
    </div>
  )
}
