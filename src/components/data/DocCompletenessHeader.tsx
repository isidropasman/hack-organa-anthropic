'use client'

import { TOTAL_DOCS, EXISTING_DOCS, getMissingByPriority } from '@/lib/doc-analysis'

const rate = Math.round((EXISTING_DOCS / TOTAL_DOCS) * 100)
const { critical, important, niceToHave } = getMissingByPriority()

function PriorityPill({
  color,
  count,
  label,
}: {
  color: string
  count: number
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 5px ${color}80` }}
      />
      <span className="text-xs text-slate-400">
        <span className="font-semibold" style={{ color }}>{count}</span>
        {' '}{label}
      </span>
    </div>
  )
}

export default function DocCompletenessHeader() {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)' }}
    >
      {/* Score row */}
      <div className="flex items-end gap-3 mb-3">
        <div className="leading-none">
          <span className="text-4xl font-bold text-white">{EXISTING_DOCS}</span>
          <span className="text-xl text-slate-600">/{TOTAL_DOCS}</span>
        </div>
        <span className="text-slate-400 text-sm mb-1">documentos cargados</span>
        <span
          className="ml-auto text-sm font-bold"
          style={{ color: '#06B6D4' }}
        >
          {rate}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1.5 rounded-full mb-3"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        <div
          className="h-1.5 rounded-full"
          style={{
            width: `${rate}%`,
            background: 'linear-gradient(90deg, #4F6BED, #06B6D4)',
          }}
        />
      </div>

      <p className="text-slate-500 text-xs mb-4">
        Faltan {TOTAL_DOCS - EXISTING_DOCS} documentos para tener la base de conocimiento completa
      </p>

      {/* Priority breakdown */}
      <div className="flex items-center gap-5 flex-wrap">
        <PriorityPill color="#EF4444" count={critical.length}   label="críticos faltantes" />
        <PriorityPill color="#F59E0B" count={important.length}  label="importantes faltantes" />
        <PriorityPill color="#64748B" count={niceToHave.length} label="nice-to-have faltantes" />
      </div>
    </div>
  )
}
