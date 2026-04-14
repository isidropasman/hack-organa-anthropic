import { getScoreLevel, SCORE_COLORS } from '@/types/civilization'

interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export default function ScoreBadge({ score, size = 'sm' }: Props) {
  const level = getScoreLevel(score)
  const color = SCORE_COLORS[level]

  const padding  = size === 'sm' ? '1px 7px' : size === 'md' ? '2px 10px' : '4px 14px'
  const fontSize = size === 'sm' ? 11 : size === 'md' ? 13 : 18
  const fontWeight = size === 'lg' ? 800 : 700

  return (
    <span
      style={{
        display:      'inline-block',
        padding,
        borderRadius: 5,
        fontSize,
        fontWeight,
        background:   `${color}22`,
        color,
        border:       `1px solid ${color}55`,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {score}
    </span>
  )
}
