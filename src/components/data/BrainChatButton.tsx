'use client'

interface Props {
  onClick: () => void
}

export default function BrainChatButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 flex items-center gap-2.5 pl-3.5 pr-4 py-2.5 rounded-2xl shadow-2xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 z-40"
      style={{
        background: 'linear-gradient(135deg, #4F6BED 0%, #6B4FED 100%)',
        boxShadow: '0 0 24px rgba(79,107,237,0.45), 0 4px 16px rgba(0,0,0,0.4)',
        color: '#fff',
      }}
    >
      <span className="text-base leading-none">🧠</span>
      <span>Ask the Brain</span>
    </button>
  )
}
