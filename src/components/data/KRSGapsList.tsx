import type { KRSAgent } from '@/lib/types'

interface Props {
  agent: KRSAgent
}

export default function KRSGapsList({ agent }: Props) {
  if (agent.gaps.length === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm py-2">
        <span>✓</span>
        <span>No gaps detected — full coverage</span>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {agent.gaps.map((gap, i) => (
        <div
          key={i}
          className="flex items-start gap-2 text-sm px-3 py-2 bg-red-50 border border-red-200 rounded-lg"
        >
          <span className="text-red-600 flex-shrink-0 mt-0.5 text-xs">⚠</span>
          <span className="text-organa-text text-xs leading-relaxed">{gap}</span>
        </div>
      ))}
    </div>
  )
}
