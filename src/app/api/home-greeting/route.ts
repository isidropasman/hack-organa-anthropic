// src/app/api/home-greeting/route.ts
// POST /api/home-greeting — SSE streaming del saludo diario del empleado
// Lee el prompt desde lib/prompt/user/home-assistant.md

import { readFileSync } from 'fs'
import { join } from 'path'
import { NextRequest } from 'next/server'
import { homeGreetingStream } from '@/lib/claude'

const SYSTEM_PROMPT = readFileSync(
  join(process.cwd(), 'lib/prompt/user/home-assistant.md'),
  'utf-8'
)

export async function POST(request: NextRequest): Promise<Response> {
  let userData: object
  try {
    userData = await request.json() as object
  } catch {
    return new Response('{"type":"error","message":"Invalid JSON"}', { status: 400 })
  }

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of homeGreetingStream(SYSTEM_PROMPT, userData)) {
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
