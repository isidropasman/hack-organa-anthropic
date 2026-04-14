// src/app/api/chat/route.ts
// POST /api/chat
// Sends a message to a trained agent and returns the response

import { NextRequest, NextResponse } from 'next/server'
import { agentChat } from '@/lib/claude'
import type { AgentChatRequest, AgentChatResponse, Message } from '@/lib/types'

export async function POST(request: NextRequest): Promise<NextResponse<AgentChatResponse>> {
  try {
    const body = await request.json() as Partial<AgentChatRequest>
    const { agentId, agentName, agentRole, companyName, knowledgeBase, messages } = body

    if (!agentId || !agentName || !agentRole || !companyName || !messages) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Missing required fields',
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(
        { message: errorMessage, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!knowledgeBase) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'This agent has not completed onboarding yet.',
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(
        { message: errorMessage, error: 'Agent has not completed onboarding' },
        { status: 400 }
      )
    }

    const reply = await agentChat(agentName, agentRole, companyName, knowledgeBase, messages)

    const message: Message = {
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ message })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    const errorMessage: Message = {
      role: 'assistant',
      content: 'Sorry, something went wrong. Please try again.',
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(
      { message: errorMessage, error: errorMsg },
      { status: 500 }
    )
  }
}
