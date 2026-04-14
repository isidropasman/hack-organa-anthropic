import { krsAgents } from '@/lib/mock-data'

function krsTextColor(score: number) {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

export default function KRSSummaryBar() {
  const avgKRS = Math.round(krsAgents.reduce((s, a) => s + a.krs, 0) / krsAgents.length)
  const green = krsAgents.filter(a => a.krs >= 80).length
  const yellow = krsAgents.filter(a => a.krs >= 60 && a.krs < 80).length
  const red = krsAgents.filter(a => a.krs < 60).length
  const readyForAssisted = green
  const totalHours = krsAgents.reduce((s, a) => s + a.screenHours, 0).toFixed(1)
  const totalTasks = krsAgents.reduce((s, a) => s + a.tasksDocumented, 0)

  return (
    <div className="bg-organa-surface border border-organa-border rounded-xl p-5 flex items-center gap-8">
      {/* Avg KRS */}
      <div className="text-center flex-shrink-0">
        <div className={`text-5xl font-bold leading-none ${krsTextColor(avgKRS)}`}>{avgKRS}</div>
        <div className="text-organa-text-muted text-xs mt-1.5">Org Avg KRS</div>
      </div>

      <div className="w-px h-14 bg-organa-border flex-shrink-0" />

      {/* Distribution */}
      <div className="flex-shrink-0">
        <div className="text-organa-text-muted text-xs font-medium mb-2">Distribution</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="text-organa-text text-sm">{green} optimal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="text-organa-text text-sm">{yellow} developing</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <span className="text-organa-text text-sm">{red} critical</span>
          </div>
        </div>
      </div>

      <div className="w-px h-14 bg-organa-border flex-shrink-0" />

      {/* Assisted ready */}
      <div className="text-center flex-shrink-0">
        <div className="text-2xl font-bold text-organa-text">
          {readyForAssisted}
          <span className="text-organa-text-muted text-lg font-normal"> / {krsAgents.length}</span>
        </div>
        <div className="text-organa-text-muted text-xs mt-1">Ready for Assisted Mode</div>
      </div>

      <div className="w-px h-14 bg-organa-border flex-shrink-0" />

      {/* Screen hours */}
      <div className="text-center flex-shrink-0">
        <div className="text-2xl font-bold text-organa-text">{totalHours}h</div>
        <div className="text-organa-text-muted text-xs mt-1">Observation Hours</div>
      </div>

      <div className="w-px h-14 bg-organa-border flex-shrink-0" />

      {/* Total tasks */}
      <div className="text-center flex-shrink-0">
        <div className="text-2xl font-bold text-organa-text">{totalTasks}</div>
        <div className="text-organa-text-muted text-xs mt-1">Tasks Discovered</div>
      </div>
    </div>
  )
}
