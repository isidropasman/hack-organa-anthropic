// src/app/api/analyze-recording/route.ts
// POST /api/analyze-recording — análisis de grabación de pantalla con Claude Vision
// Lee el prompt desde lib/prompt/user/screen-recorder-analysis.md

import { readFileSync } from 'fs'
import { join } from 'path'
import { NextRequest } from 'next/server'
import { analyzeRecordingStream } from '@/lib/claude'

const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), 'lib/prompt/user/screen-recorder-analysis.md'),
  'utf-8'
)

interface AnalyzeRequest {
  frames: string[]     // base64 data URLs, max 6
  agentName: string
  agentRole: string
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: Partial<AnalyzeRequest>
  try {
    body = await request.json() as Partial<AnalyzeRequest>
  } catch {
    return new Response('{"type":"error","message":"Invalid JSON"}', { status: 400 })
  }

  const { frames, agentName, agentRole } = body

  if (!frames?.length || !agentName || !agentRole) {
    return new Response('{"type":"error","message":"Missing required fields"}', { status: 400 })
  }

  const capped = frames.slice(0, 6)

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of analyzeRecordingStream(SYSTEM_PROMPT, capped, agentName, agentRole)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`)
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
      'Connection': 'keep-alive',
    },
  })
}
