'use client'

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import type { KRSDimensions } from '@/lib/types'

interface Props {
  dimensions: KRSDimensions
}

export default function KRSRadarChart({ dimensions }: Props) {
  const data = [
    { dimension: 'Completeness', value: dimensions.completitud },
    { dimension: 'Specificity', value: dimensions.especificidad },
    { dimension: 'Consistency', value: dimensions.consistencia },
    { dimension: 'Uniqueness', value: dimensions.unicidad },
    { dimension: 'Timeliness', value: dimensions.temporalidad },
  ]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <RadarChart cx="50%" cy="50%" outerRadius={70} data={data}>
        <PolarGrid stroke="#1E1E2E" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#7A7A9A', fontSize: 11 }} />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#7A7A9A', fontSize: 9 }}
          tickCount={4}
        />
        <Radar
          name="KRS"
          dataKey="value"
          stroke="#6C63FF"
          fill="#6C63FF"
          fillOpacity={0.25}
          strokeWidth={1.5}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
