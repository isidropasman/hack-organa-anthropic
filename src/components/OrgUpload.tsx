'use client'

// src/components/OrgUpload.tsx
// Drag-and-drop org chart image uploader
// Converts image to base64 → calls POST /api/parse-org → returns Agent[] to parent

import { useState, useCallback } from 'react'
import type { Agent, OrgChartParseResponse } from '@/lib/types'

interface Props {
  onAgentsGenerated: (agents: Agent[]) => void
  isLoading: boolean
}

export default function OrgUpload({ onAgentsGenerated, isLoading }: Props) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  async function processFile(file: File) {
    // TODO: Implement
    // 1. Validate file.type is one of: image/jpeg, image/png, image/gif, image/webp
    //    setError('Please upload a JPEG, PNG, GIF, or WebP image') if invalid
    // 2. Convert to base64:
    //    const reader = new FileReader()
    //    reader.readAsDataURL(file)
    //    const base64 = await new Promise<string>((res) => { reader.onload = () => res(reader.result as string) })
    //    const imageBase64 = base64.split(',')[1]  // strip data:image/...;base64, prefix
    // 3. setFileName(file.name)
    // 4. POST to /api/parse-org: { imageBase64, mediaType: file.type }
    // 5. const data: OrgChartParseResponse = await res.json()
    // 6. If data.error, setError(data.error)
    // 7. Else onAgentsGenerated(data.agents)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    // TODO: Implement
    // e.preventDefault()
    // setIsDragOver(false)
    // const file = e.dataTransfer.files[0]
    // if (file) processFile(file)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implement
    // const file = e.target.files?.[0]
    // if (file) processFile(file)
  }, [])

  return (
    <div className="space-y-4">
      {/* TODO: Implement full drag-and-drop UI */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all
          ${isDragOver
            ? 'border-organa-accent bg-organa-accent/10'
            : 'border-organa-border hover:border-organa-muted'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <label htmlFor="org-chart-input" className="cursor-pointer block">
          {/* TODO: Add SVG upload icon */}
          <p className="text-organa-text font-medium mt-4">
            {isLoading ? 'Parsing org chart...' : 'Drop your org chart here'}
          </p>
          <p className="text-organa-text-muted text-sm mt-2">
            {fileName ? `Selected: ${fileName}` : 'JPEG, PNG, GIF, or WebP · Any size'}
          </p>
          {!isLoading && (
            <span className="inline-block mt-4 px-4 py-2 bg-organa-accent hover:bg-organa-accent-hover rounded-lg text-sm font-medium transition-colors">
              Choose file
            </span>
          )}
        </label>
        <input
          id="org-chart-input"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Demo seed button */}
      {/* TODO: Add a "Load Nova Agency demo" button that calls agentStore.seedDemoCompany(NOVA_AGENCY_DEMO) */}
      {/* Import NOVA_AGENCY_DEMO from tools/scripts/seed-demo.ts (extract the data as a separate export) */}
    </div>
  )
}
