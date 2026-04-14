'use client'

import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  data: number[]
  color?: string
}

export default function SparkLine({ data, color = '#6C63FF' }: Props) {
  const chartData = data.map((value, i) => ({ i, value }))
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        <Tooltip
          contentStyle={{
            background: '#12121A',
            border: '1px solid #1E1E2E',
            borderRadius: '6px',
            fontSize: '11px',
            padding: '4px 8px',
          }}
          labelFormatter={() => ''}
          formatter={(v: unknown) => [`${v as number}%`, 'Rate']}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
