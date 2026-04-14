# Skill: agent-chat

## What it does
`agentChat()` in `src/lib/claude.ts` sends a chat message to a trained agent's AI twin.
The agent's `KnowledgeBase` is injected into the system prompt as serialized JSON.

## Inputs
- `agentName: string` — e.g. "Sofía Chen"
- `agentRole: string` — e.g. "Head of Creative"
- `companyName: string` — e.g. "Nova Agency"
- `knowledgeBase: KnowledgeBase` — the agent's complete trained knowledge base
- `messages: Message[]` — full conversation history (user + assistant turns)

## Outputs
- `string` — the agent's reply text

## System prompt
Uses `PROMPTS.TRAINED_AGENT(agentName, agentRole, companyName, knowledgeBaseString)` from `src/lib/prompts.ts`.
The knowledge base is serialized with `JSON.stringify(knowledgeBase, null, 2)` and injected between delimiters.

## Quality note
**The quality of answers is entirely determined by the richness of the knowledge base.**
- If `knowledgeBase.categories` arrays are empty and `rawTranscript` is short → generic answers
- If the onboarding interview was thorough (12-18 turns covering all 6 categories) → highly specific answers
- The prompt instructs Claude to refuse generic answers and say "I don't have specific knowledge about that" instead

## Guard
`/agent/[agentId]` page redirects to `/onboard/[agentId]` if `agent.onboardingComplete === false`.
The route handler validates `knowledgeBase` is present before calling `agentChat()`.

## Called by
`POST /api/chat` → `src/app/api/chat/route.ts`
