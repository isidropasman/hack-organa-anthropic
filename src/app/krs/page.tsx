import KRSSummaryBar from '@/components/data/KRSSummaryBar'
import KRSAgentCard from '@/components/data/KRSAgentCard'
import { krsAgents } from '@/lib/mock-data'

export default function KRSPage() {
  const gapsByAgent = krsAgents
    .filter(a => a.gaps.length > 0)
    .map(a => ({ name: a.name, role: a.role, avatar: a.avatar, gaps: a.gaps }))
  const totalGaps = krsAgents.reduce((s, a) => s + a.gaps.length, 0)

  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-organa-text">AI Workforce</h1>
        <p className="text-organa-text-muted mt-1 text-sm">
          Knowledge Readiness Score — knowledge capture status per agent
        </p>
      </div>

      {/* Section A: Org-level KRS summary */}
      <div className="mb-8">
        <KRSSummaryBar />
      </div>

      {/* Section B: Agent KRS cards */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-organa-text-muted uppercase tracking-wide mb-4">
          Agents
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {krsAgents.map(agent => (
            <KRSAgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </div>

      {/* Section C: Gaps summary */}
      <div className="bg-organa-surface border border-organa-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-organa-text mb-4">
          Gaps Summary{' '}
          <span className="text-organa-text-muted font-normal">
            — {totalGaps} total gaps detected
          </span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {gapsByAgent.map(({ name, role, avatar, gaps }) => (
            <div
              key={name}
              className="border border-organa-border rounded-lg p-4 hover:border-organa-muted transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-organa-accent/20 flex items-center justify-center text-organa-accent font-bold text-xs flex-shrink-0">
                  {avatar}
                </div>
                <div className="min-w-0">
                  <span className="text-organa-text text-sm font-medium">{name}</span>
                  <span className="text-organa-text-muted text-xs ml-2">{role}</span>
                </div>
              </div>
              <ul className="space-y-1">
                {gaps.map((g, i) => (
                  <li key={i} className="text-xs text-organa-text-muted flex items-start gap-1.5">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">•</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
