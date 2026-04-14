import { type MessageIntent, INTENT_COLORS } from '@/types/civilization'

const INTENT_LABELS: Record<MessageIntent, string> = {
  delegate:      'Delegate',
  request:       'Request',
  status_update: 'Status',
  decision:      'Decision',
  question:      'Question',
  escalation:    'Escalation',
}

interface Props {
  intent: MessageIntent
  size?: 'xs' | 'sm'
}

export default function IntentBadge({ intent, size = 'xs' }: Props) {
  const color = INTENT_COLORS[intent]
  const label = INTENT_LABELS[intent]

  return (
    <span
      style={{
        display:       'inline-block',
        padding:       size === 'xs' ? '1px 6px' : '2px 8px',
        borderRadius:  4,
        fontSize:      size === 'xs' ? 10 : 11,
        fontWeight:    600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background:    `${color}22`,
        color,
        border:        `1px solid ${color}44`,
      }}
    >
      {label}
    </span>
  )
}
