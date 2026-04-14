'use client'

import type { ExpectedDoc } from '@/lib/doc-analysis'
import MissingDocCard from './MissingDocCard'

const OWNER_COLORS: Record<string, string> = {
  'Martín García':   '#4F6BED',
  'Carlos Méndez':   '#F59E0B',
  'Ana Ruiz':        '#8B5CF6',
  'Lucía Fernández': '#EC4899',
  'Diego López':     '#06B6D4',
}

interface Props {
  ownerName: string
  docs: ExpectedDoc[]
}

export default function OwnerDocGroup({ ownerName, docs }: Props) {
  const role    = docs[0]?.ownerRole ?? ''
  const color   = OWNER_COLORS[ownerName] ?? '#4F6BED'
  const initials = ownerName.split(' ').map(w => w[0]).slice(0, 2).join('')
  const count    = docs.length

  return (
    <div>
      {/* Owner header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: `${color}20`, color }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <span className="text-white text-sm font-semibold">{ownerName}</span>
          <span className="text-slate-500 text-xs ml-2">
            {role} · {count} doc{count !== 1 ? 's' : ''} pendiente{count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Doc cards indented */}
      <div className="space-y-2 ml-9">
        {docs.map(doc => (
          <MissingDocCard key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  )
}
