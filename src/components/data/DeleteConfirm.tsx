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
      <span className="text-xs text-slate-400">¿Eliminar este documento?</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onCancel}
          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors hover:text-slate-200"
          style={{
            color:      '#64748B',
            background: 'rgba(255,255,255,0.05)',
            border:     '1px solid rgba(255,255,255,0.08)',
          }}
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors hover:opacity-90"
          style={{
            color:      '#EF4444',
            background: 'rgba(239,68,68,0.10)',
            border:     '1px solid rgba(239,68,68,0.25)',
          }}
        >
          Sí, eliminar
        </button>
      </div>
    </div>
  )
}
