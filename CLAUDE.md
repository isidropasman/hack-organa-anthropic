# ORGANA MVP — Claude Code Project Memory

## What this is
ORGANA MVP is a one-day hackathon build. It demonstrates AI-powered organizational memory:
upload an org chart photo → Claude generates AI agents → employees train their agents in 10 minutes → anyone can chat with trained agents to recover operational knowledge.

## Stack
- Next.js 14 App Router, TypeScript strict, Tailwind CSS
- Claude API via @anthropic-ai/sdk — model: claude-opus-4-5-20251101
- NO database — localStorage only via src/lib/agent-store.ts
- NO auth — single demo workspace, no login required

## Three screens, three API routes — nothing else
| Screen | Route | API | Purpose |
|--------|-------|-----|---------|
| / | src/app/page.tsx | /api/parse-org | Upload org chart photo → generate agents |
| /onboard/[agentId] | src/app/onboard/[agentId]/page.tsx | /api/onboard | 10-min interview to train agent |
| /agent/[agentId] | src/app/agent/[agentId]/page.tsx | /api/chat | Chat with trained agent |

## Core data flow
1. User uploads org chart image → POST /api/parse-org → Claude vision returns Agent[] JSON
2. Agent[] saved to localStorage via agent-store.ts
3. User clicks agent → /onboard/[agentId] → POST /api/onboard streams interview turns
4. Onboarding messages saved to localStorage as agent.knowledgeBase
5. User visits /agent/[agentId] → POST /api/chat → Claude responds using knowledgeBase as context

## All Claude calls go through src/lib/claude.ts — never call Anthropic SDK directly from components or routes
## All prompts live in src/lib/prompts.ts — never inline prompts in route handlers
## All state lives in src/lib/agent-store.ts — never use useState for persistent data

## What NOT to build
- Authentication or user accounts
- Database (Supabase, Postgres, anything)
- Dashboard with metrics
- Shadow/Assisted/Autonomous mode UI
- Email invitations
- Multi-tenancy
- Org chart canvas (React Flow or similar)
- Any feature not in the three screens above

## Demo data
Nova Agency — 13 agents pre-seeded. Data lives in tools/scripts/seed-demo.ts.
Import NOVA_AGENCY_DEMO and call agentStore.seedDemoCompany(NOVA_AGENCY_DEMO) from the browser.
The demo MUST work without any live API calls for the org chart step (use seed data via "Load Nova Agency demo" button in OrgUpload.tsx).

## Key files
- src/lib/types.ts — ALL TypeScript interfaces. Read this first.
- src/lib/prompts.ts — ALL system prompts. The prompts are the product.
- src/lib/agent-store.ts — ALL localStorage operations. Single source of truth.
- src/lib/claude.ts — ALL Anthropic SDK calls. Three functions: parseOrgChart, onboardingTurn, agentChat.
