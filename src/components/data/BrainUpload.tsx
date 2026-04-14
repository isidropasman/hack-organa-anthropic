'use client'

import { useState, useRef } from 'react'
import { Upload, FileText } from 'lucide-react'
import DocCard from './DocCard'
import { ACCEPTED_EXTENSIONS, PRELOADED_DOC_IDS, type BrainDoc } from '@/lib/brain-docs'

interface BrainUploadProps {
  docs:       BrainDoc[]
  onAddFiles: (files: FileList | null) => void
  onProcess:  (id: string) => void
  onDelete:   (id: string) => void
}

export default function BrainUpload({ docs, onAddFiles, onProcess, onDelete }: BrainUploadProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    onAddFiles(e.dataTransfer.files)
  }

  const processedCount = docs.filter(d => d.status === 'processed').length
  const totalExtracted = docs
    .filter(d => d.status === 'processed' && d.extractedItems)
    .reduce(
      (acc, d) => ({
        tasks:     acc.tasks     + (d.extractedItems?.tasks     ?? 0),
        tools:     acc.tools     + (d.extractedItems?.tools     ?? 0),
        decisions: acc.decisions + (d.extractedItems?.decisions ?? 0),
        knowledge: acc.knowledge + (d.extractedItems?.knowledge ?? 0),
      }),
      { tasks: 0, tools: 0, decisions: 0, knowledge: 0 },
    )

  return (
    <div className="space-y-4">
      {/* Summary chips */}
      {processedCount > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-500">
            {processedCount} doc{processedCount !== 1 ? 's' : ''} procesados →
          </span>
          <Chip value={totalExtracted.tasks}     label="tareas"        color="#4F6BED" />
          <Chip value={totalExtracted.tools}     label="herramientas"  color="#F59E0B" />
          <Chip value={totalExtracted.decisions} label="decisiones"    color="#EF4444" />
          <Chip value={totalExtracted.knowledge} label="conocimientos" color="#8B5CF6" />
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all py-6 px-4"
        style={{
          borderColor: dragging ? '#4F6BED' : 'rgba(255,255,255,0.10)',
          background:  dragging ? 'rgba(79,107,237,0.07)' : 'rgba(255,255,255,0.02)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(79,107,237,0.12)', border: '1px solid rgba(79,107,237,0.25)' }}
        >
          {dragging ? (
            <FileText size={18} style={{ color: '#4F6BED' }} />
          ) : (
            <Upload size={18} style={{ color: '#4F6BED' }} />
          )}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-300">
            {dragging ? 'Soltá los archivos aquí' : 'Arrastrá documentos para alimentar el cerebro'}
          </p>
          <p className="text-xs text-slate-600 mt-0.5">Acepta .docx, .pdf, .txt</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={e => onAddFiles(e.target.files)}
        />
      </div>

      {/* Document list */}
      {docs.length > 0 && (
        <div className="space-y-2">
          {docs.map(doc => (
            <DocCard
              key={doc.id}
              doc={doc}
              onProcess={onProcess}
              onDelete={onDelete}
              canDelete={!PRELOADED_DOC_IDS.has(doc.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Chip({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: `${color}15`, color, border: `1px solid ${color}35` }}
    >
      {value} {label}
    </span>
  )
}
