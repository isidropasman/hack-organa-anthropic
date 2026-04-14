// src/app/api/onboard/route.ts
// POST /api/onboard
// Handles one turn of the onboarding interview conversation

import { NextRequest, NextResponse } from 'next/server'
import { onboardingTurn } from '@/lib/claude'
import type { OnboardingTurnRequest, OnboardingTurnResponse, Message } from '@/lib/types'

export async function POST(request: NextRequest): Promise<NextResponse<OnboardingTurnResponse>> {
  try {
    const body = await request.json() as Partial<OnboardingTurnRequest>
    const { agentId, agentName, agentRole, companyName, messages } = body

    if (!agentId || !agentName || !agentRole || !companyName || !messages) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Missing required fields',
        timestamp: new Date().toISOString(),
      }
      return NextResponse.json(
        { message: errorMessage, isComplete: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { reply, isComplete } = await onboardingTurn(agentName, agentRole, companyName, messages)

    const message: Message = {
      role: 'assistant',
      content: reply,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({ message, isComplete })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error'
    const errorMessage: Message = {
      role: 'assistant',
      content: 'Sorry, something went wrong. Please try again.',
      timestamp: new Date().toISOString(),
    }
    return NextResponse.json(
      { message: errorMessage, isComplete: false, error: errorMsg },
      { status: 500 }
    )
  }
}
