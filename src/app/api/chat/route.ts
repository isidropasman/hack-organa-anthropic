// src/app/api/chat/route.ts
// POST /api/chat — SSE streaming endpoint with extended thinking
// Streams AgentStreamEvent JSON lines as Server-Sent Events

import { NextRequest } from 'next/server'
import { agentChatStream } from '@/lib/claude'
import type { AgentChatRequest } from '@/lib/types'

export async function POST(request: NextRequest): Promise<Response> {
  let body: Partial<AgentChatRequest>
  try {
    body = await request.json() as Partial<AgentChatRequest>
  } catch {
    return new Response('{"type":"error","message":"Invalid JSON"}', { status: 400 })
  }

  const { agentId, agentName, agentRole, companyName, knowledgeBase, messages } = body

  if (!agentId || !agentName || !agentRole || !companyName || !messages) {
    return new Response('{"type":"error","message":"Missing required fields"}', { status: 400 })
  }

  if (!knowledgeBase) {
    return new Response('{"type":"error","message":"Agent has not completed onboarding"}', { status: 400 })
  }

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const gen = agentChatStream(agentName, agentRole, companyName, knowledgeBase, messages)
        for await (const event of gen) {
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
