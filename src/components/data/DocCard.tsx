'use client'

import { useState } from 'react'
import { FileText, CheckCircle, Loader2, Zap, Trash2 } from 'lucide-react'
import type { BrainDoc } from '@/lib/brain-docs'
import DeleteConfirm from './DeleteConfirm'

interface Props {
  doc:       BrainDoc
  onProcess: (id: string) => void
  onDelete?: (id: string) => void
  canDelete?: boolean  // false for pre-seeded docs
}

const EXT_COLOR: Record<string, string> = {
  docx: '#4F6BED',
  pdf:  '#EF4444',
  txt:  '#8B5CF6',
}

function getExt(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? 'txt'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-AR', {
    day:    '2-digit',
    month:  '2-digit',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

export default function DocCard({ doc, onProcess, onDelete, canDelete = true }: Props) {
  const [hovered,    setHovered]    = useState(false)
  const [confirming, setConfirming] = useState(false)

  const ext   = getExt(doc.filename)
  const color = EXT_COLOR[ext] ?? '#94A3B8'

  function handleTrashClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (canDelete) setConfirming(true)
  }

  function handleConfirm() {
    onDelete?.(doc.id)
    setConfirming(false)
  }

  return (
    <div
      className="rounded-xl border px-4 py-3 transition-all relative"
      style={{
        background:  '#12121E',
        borderColor: confirming
          ? 'rgba(239,68,68,0.30)'
          : doc.status === 'processed'
            ? `${color}30`
            : 'rgba(255,255,255,0.07)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Main row */}
      <div className="flex items-start gap-3">
        {/* File icon */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
          style={{ background: `${color}18`, border: `1px solid ${color}35` }}
        >
          <FileText size={15} style={{ color }} />
        </div>

        {/* Content — extra right padding so text doesn't overlap the trash button */}
        <div className="flex-1 min-w-0" style={{ paddingRight: '28px' }}>
          <p className="text-white text-sm font-medium truncate leading-tight">
            {doc.filename}
          </p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-slate-500 text-xs">{doc.size}</span>
            <span className="text-slate-600 text-xs">{formatDate(doc.uploadedAt)}</span>
          </div>

          {doc.status === 'processed' && doc.extractedItems && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <ExChip value={doc.extractedItems.tasks}     label="tareas"        color="#4F6BED" />
              <ExChip value={doc.extractedItems.tools}     label="herramientas"  color="#F59E0B" />
              <ExChip value={doc.extractedItems.decisions} label="decisiones"    color="#EF4444" />
              <ExChip value={doc.extractedItems.knowledge} label="conocimientos" color="#8B5CF6" />
            </div>
          )}
        </div>

        {/* Status / action */}
        <div className="flex-shrink-0 flex items-center">
          {doc.status === 'processed' && (
            <div className="flex items-center gap-1.5">
              <CheckCircle size={14} style={{ color: '#22C55E' }} />
              <span className="text-xs font-medium" style={{ color: '#22C55E' }}>Procesado</span>
            </div>
          )}
          {doc.status === 'processing' && (
            <div className="flex items-center gap-1.5">
              <Loader2 size={14} className="animate-spin text-slate-400" />
              <span className="text-xs text-slate-400">Procesando...</span>
            </div>
          )}
          {doc.status === 'pending' && (
            <button
              onClick={() => onProcess(doc.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{
                background: 'rgba(79,107,237,0.15)',
                border:     '1px solid rgba(79,107,237,0.35)',
                color:      '#4F6BED',
              }}
            >
              <Zap size={11} />
              Procesar
            </button>
          )}
        </div>
      </div>

      {/* Trash button — absolute top-right, fades in on hover */}
      <button
        onClick={handleTrashClick}
        title={
          canDelete
            ? 'Eliminar documento'
            : 'Documento del sistema — no se puede eliminar'
        }
        className="absolute top-3 right-3 p-1 rounded transition-opacity"
        style={{
          opacity:    hovered && !confirming ? 1 : 0,
          color:      canDelete ? '#EF4444' : '#475569',
          cursor:     canDelete ? 'pointer' : 'not-allowed',
          background: hovered && canDelete ? 'rgba(239,68,68,0.08)' : 'transparent',
          pointerEvents: confirming ? 'none' : 'auto',
        }}
        aria-label="Eliminar documento"
      >
        <Trash2 size={13} />
      </button>

      {/* Inline delete confirmation */}
      {confirming && (
        <DeleteConfirm
          onConfirm={handleConfirm}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  )
}

function ExChip({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      <span>{value}</span>
      <span className="font-normal opacity-70">{label}</span>
    </span>
  )
}
