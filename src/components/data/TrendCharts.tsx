'use client'

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { OrgTrend } from '@/lib/types'

interface Props {
  trend: OrgTrend
}

const tooltipStyle = {
  contentStyle: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    fontSize: '11px',
    padding: '6px 10px',
    color: '#1E293B',
  },
  labelStyle: { color: '#64748B' },
}

const axisProps = {
  axisLine: false as const,
  tickLine: false as const,
  tick: { fill: '#64748B', fontSize: 10 },
}

export default function TrendCharts({ trend }: Props) {
  const data = trend.labels.map((label, i) => ({
    label,
    approvalRate: trend.approvalRate[i],
    costTotal: trend.costTotal[i],
    automationRate: trend.automationRate[i],
    screenLearningRate: trend.screenLearningRate[i],
  }))

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Chart 1: Approval Rate */}
      <div className="bg-organa-surface border border-organa-border rounded-xl p-4">
        <h3 className="text-xs font-medium text-organa-text-muted uppercase tracking-wide mb-3">
          Approval Rate Org
        </h3>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data}>
            <XAxis dataKey="label" {...axisProps} />
            <YAxis domain={[70, 90]} {...axisProps} width={28} />
            <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`${v as number}%`, 'Approval']} />
            <Line
              type="monotone"
              dataKey="approvalRate"
              stroke="#6C63FF"
              strokeWidth={2}
              dot={{ fill: '#6C63FF', r: 3, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Costo Acumulado */}
      <div className="bg-organa-surface border border-organa-border rounded-xl p-4">
        <h3 className="text-xs font-medium text-organa-text-muted uppercase tracking-wide mb-3">
          Accumulated Cost
        </h3>
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={data}>
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} width={32} />
            <Tooltip
              {...tooltipStyle}
              formatter={(v: unknown) => [`$${(v as number).toFixed(2)}`, 'Cost']}
            />
            <Area
              type="monotone"
              dataKey="costTotal"
              stroke="#F59E0B"
              fill="#F59E0B"
              fillOpacity={0.12}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3: Automation Rate */}
      <div className="bg-organa-surface border border-organa-border rounded-xl p-4">
        <h3 className="text-xs font-medium text-organa-text-muted uppercase tracking-wide mb-3">
          Automation Rate
        </h3>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data}>
            <XAxis dataKey="label" {...axisProps} />
            <YAxis domain={[0, 60]} {...axisProps} width={28} />
            <Tooltip {...tooltipStyle} formatter={(v: unknown) => [`${v as number}%`, 'Automation']} />
            <Bar dataKey="automationRate" fill="#22C55E" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 4: Screen Learning Rate */}
      <div className="bg-organa-surface border border-organa-border rounded-xl p-4">
        <h3 className="text-xs font-medium text-organa-text-muted uppercase tracking-wide mb-3">
          Screen Learning Rate
        </h3>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data}>
            <XAxis dataKey="label" {...axisProps} />
            <YAxis domain={[0, 2.5]} {...axisProps} width={28} />
            <Tooltip
              {...tooltipStyle}
              formatter={(v: unknown) => [`${v as number} tasks/hr`, 'Screen Rate']}
            />
            <Line
              type="monotone"
              dataKey="screenLearningRate"
              stroke="#38BDF8"
              strokeWidth={2}
              dot={{ fill: '#38BDF8', r: 3, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
