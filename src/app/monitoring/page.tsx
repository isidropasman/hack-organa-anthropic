'use client'

import { Users, ThumbsUp, DollarSign, Zap, AlertTriangle, Monitor, Clock } from 'lucide-react'
import MetricCard from '@/components/data/MetricCard'
import AgentTable from '@/components/data/AgentTable'
import AlertsPanel from '@/components/data/AlertsPanel'
import TrendCharts from '@/components/data/TrendCharts'
import { monitoredAgents, monitoringSummary, orgTrend } from '@/lib/mock-data'

export default function MonitoringPage() {
  const s = monitoringSummary

  return (
    <main className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-organa-text">Monitoring</h1>
        <p className="text-organa-text-muted mt-1 text-sm">
          Performance y alertas de los agentes AI en producción
        </p>
      </div>

      {/* Section A: KPI header */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard label="Agentes activos" value={s.activeAgents} icon={Users} />
        <MetricCard
          label="Approval rate"
          value={`${s.avgApprovalRate}%`}
          icon={ThumbsUp}
          highlight="green"
        />
        <MetricCard
          label="Costo total"
          value={`$${s.totalCost.toFixed(2)}`}
          icon={DollarSign}
        />
        <MetricCard
          label="Automation rate"
          value={`${s.automationRate}%`}
          icon={Zap}
          highlight="blue"
        />
        <MetricCard
          label="Alertas activas"
          value={s.alertsActive}
          icon={AlertTriangle}
          highlight="red"
        />
        <MetricCard
          label="Horas observación"
          value={`${s.totalScreenHours}h`}
          icon={Monitor}
        />
        <MetricCard
          label="Costo / hora obs"
          value={`$${s.costPerScreenHour.toFixed(2)}`}
          icon={Clock}
        />
      </div>

      {/* Section B + C: Agents table + Alerts panel */}
      <div className="flex gap-6 mb-8 items-start">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-organa-text-muted uppercase tracking-wide mb-4">
            Agentes
          </h2>
          <AgentTable agents={monitoredAgents} />
        </div>
        <div className="w-80 flex-shrink-0">
          <h2 className="text-sm font-semibold text-organa-text-muted uppercase tracking-wide mb-4">
            Alertas
          </h2>
          <AlertsPanel agents={monitoredAgents} />
        </div>
      </div>

      {/* Section D: Trend charts */}
      <div>
        <h2 className="text-sm font-semibold text-organa-text-muted uppercase tracking-wide mb-4">
          Tendencias Organizacionales
        </h2>
        <TrendCharts trend={orgTrend} />
      </div>
    </main>
  )
}
