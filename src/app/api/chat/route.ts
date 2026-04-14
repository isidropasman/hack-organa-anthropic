// src/app/api/chat/route.ts
// POST /api/chat
// Sends a message to a trained agent and returns the response

import { NextRequest, NextResponse } from 'next/server'
import { agentChat } from '@/lib/claude'
import type { AgentChatRequest, AgentChatResponse, Message } from '@/lib/types'

export async function POST(request: NextRequest): Promise<NextResponse<AgentChatResponse>> {
  // TODO: Implement
  // 1. Parse body: const { agentId, agentName, agentRole, companyName, knowledgeBase, messages } = await request.json()
  // 2. Validate all required fields — especially knowledgeBase must not be null
  //    Return 400 with error: 'Agent has not completed onboarding' if knowledgeBase is missing
  // 3. Call: const reply = await agentChat(agentName, agentRole, companyName, knowledgeBase, messages)
  // 4. Build response message:
  //    const message: Message = { role: 'assistant', content: reply, timestamp: new Date().toISOString() }
  // 5. Return: NextResponse.json({ message })
  // 6. Catch errors: return NextResponse.json({ message: {...}, error: err.message }, { status: 500 })

  const errorMessage: Message = {
    role: 'assistant',
    content: 'Not implemented',
    timestamp: new Date().toISOString(),
  }
  return NextResponse.json({ message: errorMessage, error: 'Not implemented' }, { status: 501 })
}
