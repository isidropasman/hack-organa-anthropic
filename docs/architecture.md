# ORGANA MVP — Architecture

## Overview

```
Browser (Next.js 14 App Router)
│
├── /                          ← Screen 1: Org chart upload
├── /onboard/[agentId]         ← Screen 2: Onboarding interview
└── /agent/[agentId]           ← Screen 3: Chat with trained agent
    │
    └── API Routes (Node.js edge handlers)
        ├── POST /api/parse-org    ← Claude vision → Agent[]
        ├── POST /api/onboard      ← Claude chat → interview turn
        └── POST /api/chat         ← Claude chat → agent response
            │
            └── Anthropic SDK → claude-opus-4-5-20251101
```

## State management

No server state. No database. Everything lives in localStorage.

```
localStorage
├── organa_agents        ← Agent[] JSON
└── organa_company_name  ← string
```

All reads/writes go through `src/lib/agent-store.ts`. Never access localStorage directly.

## Data flow

### Screen 1: Org chart upload
1. User drops image → `OrgUpload.tsx` converts to base64
2. `POST /api/parse-org` with `{ imageBase64, mediaType }`
3. Route calls `parseOrgChart()` from `claude.ts`
4. Claude vision returns JSON array → parsed as `Agent[]`
5. `agentStore.setAgents(agents)` saves to localStorage
6. UI renders `AgentCard[]` grid

### Screen 2: Onboarding interview
1. Page loads agent from `agentStore.getAgent(agentId)`
2. If no messages yet, triggers first turn with empty messages array
3. Each user message → `POST /api/onboard`
4. Route calls `onboardingTurn()` → ARIA's next question
5. Both messages saved via `agentStore.addOnboardingMessage()`
6. When `isComplete: true` → build `KnowledgeBase`, call `agentStore.completeOnboarding()`, redirect

### Screen 3: Agent chat
1. Page guards: redirects to `/onboard/[agentId]` if not complete
2. User message → `POST /api/chat` with full `knowledgeBase`
3. Route calls `agentChat()` → agent's reply
4. Messages appended to local state (NOT persisted to localStorage)

## Component hierarchy

```
layout.tsx
├── page.tsx (Screen 1)
│   ├── OrgUpload.tsx
│   └── AgentCard.tsx (×N)
├── onboard/[agentId]/page.tsx (Screen 2)
│   └── ChatInterface.tsx
└── agent/[agentId]/page.tsx (Screen 3)
    └── ChatInterface.tsx
```

## Why no streaming

MVP simplicity. Streaming adds complexity (Server-Sent Events or ReadableStream plumbing).
Regular JSON responses work fine for a demo. Add streaming post-hackathon if needed.

## Token budget estimates

| Call | Est. tokens | Notes |
|------|-------------|-------|
| parseOrgChart | ~800-1200 in, ~500 out | Image + JSON parse |
| onboardingTurn | ~500-2000 in, ~150 out | Grows with conversation length |
| agentChat | ~2000-4000 in, ~200 out | KnowledgeBase is large context |
