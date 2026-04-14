'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { type ScoreSnapshot } from '@/types/civilization'

interface Props {
  history: ScoreSnapshot[]
  agentName: string
  trending: 'up' | 'down' | 'flat'
}

const COLOR_UP   = '#10B981'
const COLOR_DOWN = '#EF4444'
const COLOR_FLAT = '#3B82F6'

export default function ScoreChart({ history, agentName, trending }: Props) {
  const color = trending === 'up' ? COLOR_UP : trending === 'down' ? COLOR_DOWN : COLOR_FLAT

  const data = history.map(s => ({
    date:      s.date.slice(5),  // "04-01"
    composite: s.composite,
    execution: s.execution,
    communication: s.communication,
    collaboration: s.collaboration,
    efficiency: s.efficiency,
  }))

  return (
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${agentName}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fill: '#475569', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          interval={3}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#475569', fontSize: 10 }}
          tickLine={false}
          axisLine={false}
          tickCount={5}
        />
        <Tooltip
          contentStyle={{
            background:   '#0F172A',
            border:       '1px solid #1E293B',
            borderRadius: 6,
            fontSize:     12,
            color:        '#CBD5E1',
          }}
          labelStyle={{ color: '#64748B', marginBottom: 4 }}
          formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : value, 'Composite']}
        />
        <ReferenceLine y={85} stroke="#10B98133" strokeDasharray="3 3" />
        <ReferenceLine y={70} stroke="#3B82F633" strokeDasharray="3 3" />
        <ReferenceLine y={50} stroke="#F59E0B33" strokeDasharray="3 3" />
        <Area
          type="monotone"
          dataKey="composite"
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${agentName})`}
          dot={false}
          activeDot={{ r: 4, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
