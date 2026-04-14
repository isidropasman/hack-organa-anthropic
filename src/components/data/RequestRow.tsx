'use client'

import type { AgentRequest } from '@/lib/inbox-data'

interface Props {
  request: AgentRequest
}

const PRIORITY_DOT: Record<AgentRequest['priority'], string> = {
  high:   '🔴',
  medium: '🟡',
  low:    '⚪',
}

const STATUS_CLASS: Record<AgentRequest['status'], string> = {
  pending:     'bg-amber-50 text-amber-700 border border-amber-200',
  'in-progress': 'bg-blue-50 text-blue-700 border border-blue-200',
  completed:   'bg-green-50 text-green-700 border border-green-200',
}

const STATUS_LABEL: Record<AgentRequest['status'], string> = {
  pending:     'Pending',
  'in-progress': 'In Progress',
  completed:   'Completed',
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function RequestRow({ request }: Props) {
  const isHighPending = request.priority === 'high' && request.status === 'pending'
  const arrow = request.type === 'inbound' ? '←' : '→'
  const counterparty = request.type === 'inbound' ? request.from : request.to

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors ${
        isHighPending ? 'bg-red-50' : 'hover:bg-slate-50'
      }`}
    >
      {/* Priority dot */}
      <span className="flex-shrink-0 text-base leading-none" title={request.priority}>
        {PRIORITY_DOT[request.priority]}
      </span>

      {/* Arrow + counterparty */}
      <div className="flex items-center gap-1.5 flex-shrink-0 min-w-0 w-36">
        <span className="text-slate-400 font-mono">{arrow}</span>
        <span className="text-slate-600 truncate" title={`${counterparty.name}'s Twin`}>
          {counterparty.name.split(' ')[0]}&apos;s Twin
        </span>
      </div>

      {/* Subject */}
      <p className="flex-1 min-w-0 text-slate-700 truncate" title={request.subject}>
        {request.subject}
      </p>

      {/* Status badge */}
      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_CLASS[request.status]}`}>
        {STATUS_LABEL[request.status]}
      </span>

      {/* Time */}
      <span className="flex-shrink-0 text-slate-400 text-[10px] w-14 text-right">
        {relativeTime(request.createdAt)}
      </span>
    </div>
  )
}
