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
        <PolarGrid stroke="#E2E8F0" />
        <PolarAngleAxis dataKey="dimension" tick={{ fill: '#64748B', fontSize: 11 }} />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: '#64748B', fontSize: 9 }}
          tickCount={4}
        />
        <Radar
          name="KRS"
          dataKey="value"
          stroke="#4F6BED"
          fill="#4F6BED"
          fillOpacity={0.2}
          strokeWidth={1.5}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
