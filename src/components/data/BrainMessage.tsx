'use client'

export interface Message {
  id: string
  role: 'user' | 'bot'
  text: string
  ts: number
}

interface Props {
  message: Message
  userInitials: string
}

export default function BrainMessage({ message, userInitials }: Props) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2">
        <div
          className="max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-br-sm text-sm text-white leading-relaxed"
          style={{ background: '#4F6BED' }}
        >
          {message.text}
        </div>
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white mb-0.5"
          style={{ background: 'rgba(79,107,237,0.5)' }}
        >
          {userInitials}
        </div>
      </div>
    )
  }

  // Split trailing agent attribution line (starts with _Esta información)
  const textLines = message.text.split('\n')
  const attrLine  = textLines.findLast((l: string) => l.startsWith('_Esta información'))
  const mainLines = attrLine
    ? textLines.slice(0, textLines.lastIndexOf(attrLine))
    : textLines

  const mainFormatted = mainLines.join('\n')
  const mainParts = mainFormatted.split('\n').map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    return (
      <span key={i}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={j} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          ) : (
            <span key={j}>{part}</span>
          ),
        )}
        {i < arr.length - 1 && <br />}
      </span>
    )
  })

  return (
    <div className="flex items-end gap-2">
      {/* Brain avatar */}
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-0.5"
        style={{ background: 'rgba(79,107,237,0.18)', border: '1px solid rgba(79,107,237,0.35)', color: '#4F6BED' }}
      >
        🧠
      </div>

      <div
        className="max-w-[82%] rounded-2xl rounded-bl-sm border-l-2 overflow-hidden"
        style={{ background: '#1A1A2E', borderLeftColor: '#4F6BED' }}
      >
        <div className="px-3.5 py-2.5 text-sm text-slate-300 leading-relaxed">
          {mainParts}
        </div>

        {attrLine && (
          <div
            className="px-3.5 pb-2.5 text-[11px] leading-snug"
            style={{ color: '#475569' }}
          >
            {attrLine.replace(/^_/, '').replace(/_$/, '')}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs mb-0.5"
        style={{ background: 'rgba(79,107,237,0.18)', border: '1px solid rgba(79,107,237,0.35)' }}
      >
        🧠
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: '#1A1A2E', border: '1px solid rgba(79,107,237,0.15)' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
