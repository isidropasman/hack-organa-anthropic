'use client'

interface Props {
  message: string
  type?: 'success' | 'error' | 'info'
}

const COLOR: Record<NonNullable<Props['type']>, string> = {
  success: '#22C55E',
  error:   '#EF4444',
  info:    '#4F6BED',
}

export default function Toast({ message, type = 'success' }: Props) {
  const color = COLOR[type]

  return (
    <div
      className="fixed bottom-8 left-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-medium"
      style={{
        transform:   'translateX(-50%)',
        background:  '#16162A',
        border:      `1px solid ${color}35`,
        color:       '#CBD5E1',
        boxShadow:   `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${color}10`,
        whiteSpace:  'nowrap',
        animation:   'toastIn 0.25s ease',
      }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {message}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
