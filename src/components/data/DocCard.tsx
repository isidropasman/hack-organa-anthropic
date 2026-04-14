'use client'

import { FileText, CheckCircle, Clock, Loader2, Zap } from 'lucide-react'
import type { BrainDoc } from '@/lib/brain-docs'

interface Props {
  doc: BrainDoc
  onProcess: (id: string) => void
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
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function DocCard({ doc, onProcess }: Props) {
  const ext   = getExt(doc.filename)
  const color = EXT_COLOR[ext] ?? '#94A3B8'

  return (
    <div
      className="rounded-xl border px-4 py-3 flex items-start gap-3 transition-all"
      style={{
        background: '#12121E',
        borderColor: doc.status === 'processed' ? `${color}30` : 'rgba(255,255,255,0.07)',
      }}
    >
      {/* File icon */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5"
        style={{ background: `${color}18`, border: `1px solid ${color}35` }}
      >
        <FileText size={15} style={{ color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate leading-tight">
          {doc.filename}
        </p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="text-slate-500 text-xs">{doc.size}</span>
          <span className="text-slate-600 text-xs">{formatDate(doc.uploadedAt)}</span>
        </div>

        {/* Extracted items */}
        {doc.status === 'processed' && doc.extractedItems && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <ExChip value={doc.extractedItems.tasks}     label="tareas"      color="#4F6BED" />
            <ExChip value={doc.extractedItems.tools}     label="herramientas" color="#F59E0B" />
            <ExChip value={doc.extractedItems.decisions} label="decisiones"   color="#EF4444" />
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
            style={{ background: 'rgba(79,107,237,0.15)', border: '1px solid rgba(79,107,237,0.35)', color: '#4F6BED' }}
          >
            <Zap size={11} />
            Procesar
          </button>
        )}
      </div>
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
