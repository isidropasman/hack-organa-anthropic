# Skill: onboarding-chat

## What it does
`onboardingTurn()` in `src/lib/claude.ts` manages one conversational turn of the structured onboarding interview.

## Inputs
- `agentName: string` — e.g. "Valentina Torres"
- `agentRole: string` — e.g. "CEO"
- `companyName: string` — e.g. "Nova Agency"
- `messages: Message[]` — full conversation history so far (both sides)

## Outputs
- `{ reply: string, isComplete: boolean }`
- `reply` — ARIA's next question or statement
- `isComplete` — true when Claude's response contains the literal string `"ONBOARDING_COMPLETE"`

## System prompt
Uses `PROMPTS.ONBOARDING_INTERVIEWER(agentName, agentRole, companyName)` from `src/lib/prompts.ts`.
ARIA covers 6 categories: TASKS, TOOLS, TEAM, COMMS, DECISIONS, KNOWLEDGE (~12-18 exchanges).

## Completion signal
When Claude has covered all 6 categories, it writes `"ONBOARDING_COMPLETE"` on its own line,
then provides a 3-sentence summary. The client detects this substring to end the session.

## After completion
The page (`/onboard/[agentId]`) is responsible for:
1. Calling `agentStore.completeOnboarding(agentId, knowledgeBase)` with the built `KnowledgeBase`
2. Redirecting to `/agent/[agentId]`

## Called by
`POST /api/onboard` → `src/app/api/onboard/route.ts`
