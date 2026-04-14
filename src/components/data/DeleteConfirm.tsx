'use client'

interface Props {
  onConfirm: () => void
  onCancel:  () => void
}

export default function DeleteConfirm({ onConfirm, onCancel }: Props) {
  return (
    <div
      className="mt-3 pt-3 flex items-center justify-between gap-3"
      style={{ borderTop: '1px solid rgba(239,68,68,0.18)' }}
    >
      <span className="text-xs text-slate-500">Delete this document?</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors text-slate-600 hover:text-slate-800 bg-slate-100 border border-slate-200"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
          style={{
            color:      '#EF4444',
            background: 'rgba(239,68,68,0.08)',
            border:     '1px solid rgba(239,68,68,0.25)',
          }}
        >
          Yes, delete
        </button>
      </div>
    </div>
  )
}
