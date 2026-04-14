'use client'

import type { ExpectedDoc } from '@/lib/doc-analysis'

const PRIORITY_CONFIG: Record<
  ExpectedDoc['priority'],
  { color: string; bg: string; border: string; label: string }
> = {
  'critical':     { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', label: 'Critical' },
  'important':    { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', label: 'Important' },
  'nice-to-have': { color: '#64748B', bg: '#F8FAFC', border: '#E2E8F0', label: 'Nice to have' },
}

const OWNER_COLORS: Record<string, string> = {
  ceo:      '#4F6BED',
  ops:      '#F59E0B',
  finanzas: '#8B5CF6',
  marketing:'#EC4899',
  soporte:  '#06B6D4',
}

export default function MissingDocCard({ doc }: { doc: ExpectedDoc }) {
  const pc    = PRIORITY_CONFIG[doc.priority]
  const color = OWNER_COLORS[doc.owner] ?? '#4F6BED'
  const initials = doc.ownerName.split(' ').map(w => w[0]).slice(0, 2).join('')

  return (
    <div className="rounded-xl border p-4 bg-white border-slate-200">
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-slate-800 text-sm font-semibold leading-snug">{doc.title}</p>
        <span
          className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
          style={{
            background: pc.bg,
            color:      pc.color,
            border:     `1px solid ${pc.border}`,
          }}
        >
          {pc.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-xs leading-relaxed mb-3">{doc.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ background: `${color}20`, color }}
          >
            {initials}
          </div>
          <span className="text-slate-600 text-xs">
            {doc.ownerName}
            <span className="text-slate-400"> · {doc.ownerRole}</span>
          </span>
        </div>

        <button
          disabled
          className="px-3 py-1 rounded-lg text-xs font-medium opacity-40 cursor-not-allowed flex-shrink-0"
          style={{
            background: `${color}18`,
            color,
            border: `1px solid ${color}35`,
          }}
        >
          Request from {doc.ownerName.split(' ')[0]}&apos;s Twin
        </button>
      </div>
    </div>
  )
}
