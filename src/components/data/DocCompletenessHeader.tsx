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
        style={{ background: color }}
      />
      <span className="text-xs text-slate-600">
        <span className="font-semibold" style={{ color }}>{count}</span>
        {' '}{label}
      </span>
    </div>
  )
}

export default function DocCompletenessHeader() {
  return (
    <div className="rounded-xl p-5 bg-cyan-50 border border-cyan-200">
      {/* Score row */}
      <div className="flex items-end gap-3 mb-3">
        <div className="leading-none">
          <span className="text-4xl font-bold text-slate-800">{EXISTING_DOCS}</span>
          <span className="text-xl text-slate-500">/{TOTAL_DOCS}</span>
        </div>
        <span className="text-slate-500 text-sm mb-1">documents loaded</span>
        <span className="ml-auto text-sm font-bold text-cyan-600">
          {rate}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full mb-3 bg-slate-200">
        <div
          className="h-1.5 rounded-full"
          style={{
            width: `${rate}%`,
            background: 'linear-gradient(90deg, #4F6BED, #06B6D4)',
          }}
        />
      </div>

      <p className="text-slate-500 text-xs mb-4">
        {TOTAL_DOCS - EXISTING_DOCS} documents missing for a complete knowledge base
      </p>

      {/* Priority breakdown */}
      <div className="flex items-center gap-5 flex-wrap">
        <PriorityPill color="#EF4444" count={critical.length}   label="critical missing" />
        <PriorityPill color="#F59E0B" count={important.length}  label="important missing" />
        <PriorityPill color="#64748B" count={niceToHave.length} label="nice-to-have missing" />
      </div>
    </div>
  )
}
