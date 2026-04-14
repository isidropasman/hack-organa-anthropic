// src/app/api/onboard/route.ts
// POST /api/onboard
// Handles one turn of the onboarding interview conversation

import { NextRequest, NextResponse } from 'next/server'
import { onboardingTurn } from '@/lib/claude'
import type { OnboardingTurnRequest, OnboardingTurnResponse, Message } from '@/lib/types'

export async function POST(request: NextRequest): Promise<NextResponse<OnboardingTurnResponse>> {
  // TODO: Implement
  // 1. Parse body: const { agentId, agentName, agentRole, companyName, messages } = await request.json()
  // 2. Validate all required fields are present — return 400 if any are missing
  // 3. Call: const { reply, isComplete } = await onboardingTurn(agentName, agentRole, companyName, messages)
  // 4. Build response message:
  //    const message: Message = { role: 'assistant', content: reply, timestamp: new Date().toISOString() }
  // 5. Return: NextResponse.json({ message, isComplete })
  //    Note: when isComplete is true, the client is responsible for calling agentStore.completeOnboarding()
  //    and building the KnowledgeBase from the full onboardingMessages array
  // 6. Catch errors: return NextResponse.json({ message: {...}, isComplete: false, error: err.message }, { status: 500 })

  const errorMessage: Message = {
    role: 'assistant',
    content: 'Not implemented',
    timestamp: new Date().toISOString(),
  }
  return NextResponse.json({ message: errorMessage, isComplete: false, error: 'Not implemented' }, { status: 501 })
}
