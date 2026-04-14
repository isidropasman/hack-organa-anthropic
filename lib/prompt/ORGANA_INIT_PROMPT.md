# ORGANA MVP — REPO INIT PROMPT
# Pegá esto completo en Claude Code en un terminal fresco.
# No modifiques nada. Dejá que termine antes de abrir otros terminales.

---

You are a senior full-stack engineer bootstrapping a Next.js 14 project for a one-day hackathon. Your job is to scaffold the complete repository architecture for ORGANA MVP — an AI-powered organizational memory system built on Claude.

## YOUR MISSION

Create the complete folder structure, all configuration files, all placeholder files with their exact interfaces defined, and the CLAUDE.md project memory file. Do NOT implement business logic yet — that comes in parallel workstreams after this scaffold is complete.

Every file you create must have:
1. The correct imports and type definitions
2. A clear TODO comment explaining exactly what needs to be implemented
3. Enough structure that a developer can start working immediately without asking questions

## TECH STACK

- Next.js 14 with App Router
- TypeScript (strict mode)
- Tailwind CSS
- Claude API (Anthropic SDK) — model: claude-opus-4-5-20251101
- No database — localStorage + in-memory state only
- No authentication — single demo workspace

## COMPLETE FOLDER STRUCTURE TO CREATE

```
organa-mvp/
├── CLAUDE.md
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
│
├── .claude/
│   ├── settings.json
│   └── skills/
│       ├── org-parser/
│       │   └── SKILL.md
│       ├── onboarding-chat/
│       │   └── SKILL.md
│       └── agent-chat/
│           └── SKILL.md
│
├── docs/
│   ├── architecture.md
│   └── demo-script.md
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    ← Screen 1: Org chart upload
│   │   ├── onboard/[agentId]/
│   │   │   └── page.tsx                ← Screen 2: Agent onboarding chat
│   │   └── agent/[agentId]/
│   │       └── page.tsx                ← Screen 3: Chat with trained agent
│   │
│   ├── components/
│   │   ├── AgentCard.tsx
│   │   ├── OrgUpload.tsx
│   │   └── ChatInterface.tsx
│   │
│   ├── lib/
│   │   ├── claude.ts                   ← All Claude API calls
│   │   ├── agent-store.ts              ← localStorage state management
│   │   ├── prompts.ts                  ← All system prompts
│   │   └── types.ts                    ← All TypeScript interfaces
│   │
│   └── app/api/
│       ├── parse-org/
│       │   └── route.ts
│       ├── onboard/
│       │   └── route.ts
│       └── chat/
│           └── route.ts
│
└── tools/
    └── scripts/
        └── seed-demo.ts
```

## FILES TO CREATE WITH EXACT CONTENT

### 1. CLAUDE.md (project memory — this is critical)

```markdown
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
Nova Agency — 13 agents pre-seeded. Run: npx ts-node tools/scripts/seed-demo.ts
The demo MUST work without any live API calls for the org chart step (use cached seed data).

## Key files
- src/lib/types.ts — ALL TypeScript interfaces. Read this first.
- src/lib/prompts.ts — ALL system prompts. The prompts are the product.
- src/lib/agent-store.ts — ALL localStorage operations. Single source of truth.
- src/lib/claude.ts — ALL Anthropic SDK calls. Three functions: parseOrgChart, onboardingTurn, agentChat.
```

### 2. src/lib/types.ts (define ALL interfaces here)

Create this file with these exact interfaces — no implementation, just types:

```typescript
// src/lib/types.ts
// ALL TypeScript interfaces for ORGANA MVP
// Import from here everywhere — never define types inline

export interface Agent {
  id: string                    // slugified name: "valentina-torres"
  name: string                  // "Valentina Torres"
  role: string                  // "CEO"
  department: string            // "Dirección General"
  reportsTo: string | null      // agent id of manager, null for CEO
  readinessScore: number        // 0-100, calculated from onboarding completion
  onboardingComplete: boolean
  knowledgeBase: KnowledgeBase | null
  onboardingMessages: Message[]
}

export interface KnowledgeBase {
  agentId: string
  completedAt: string           // ISO timestamp
  categories: {
    tasks: string[]             // What they do daily
    tools: string[]             // Tools they use
    team: string[]              // Who they work with
    comms: string[]             // Communication patterns
    decisions: string[]         // Decision-making patterns
    knowledge: string[]         // Tribal knowledge / what new hires need to know
  }
  rawTranscript: Message[]      // Full onboarding conversation
  summary: string               // Claude-generated summary of this person's role
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string             // ISO timestamp
}

export interface OrgChartParseRequest {
  imageBase64: string
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
}

export interface OrgChartParseResponse {
  agents: Agent[]
  error?: string
}

export interface OnboardingTurnRequest {
  agentId: string
  agentName: string
  agentRole: string
  companyName: string
  messages: Message[]
}

export interface OnboardingTurnResponse {
  message: Message
  isComplete: boolean           // true when Claude determines onboarding is done
  extractedKnowledge?: Partial<KnowledgeBase['categories']>
  error?: string
}

export interface AgentChatRequest {
  agentId: string
  agentName: string
  agentRole: string
  companyName: string
  knowledgeBase: KnowledgeBase
  messages: Message[]
}

export interface AgentChatResponse {
  message: Message
  error?: string
}

export interface DemoCompany {
  name: string
  description: string
  agents: Agent[]
}
```

### 3. src/lib/prompts.ts (ALL system prompts — the product lives here)

```typescript
// src/lib/prompts.ts
// ALL Claude system prompts for ORGANA MVP
// These prompts ARE the product. Change them carefully.
// Never inline prompts in route handlers — always import from here.

export const PROMPTS = {

  ORG_CHART_PARSER: `You are an organizational chart parser. The user will provide an image of a company org chart.

Extract every person visible and return ONLY a valid JSON array. Each object must have:
- id: string (slugified full name, lowercase, hyphens only. Example: "valentina-torres")
- name: string (full name as shown)
- role: string (job title as shown)
- department: string (infer from position/role if not explicit. Use Spanish if names are Spanish.)
- reportsTo: string | null (id of their direct manager. null only for the top-level person.)
- readinessScore: 0
- onboardingComplete: false
- knowledgeBase: null
- onboardingMessages: []

Rules:
- Return NOTHING except the raw JSON array. No markdown, no explanation, no code blocks.
- If a name is unclear, make a reasonable inference.
- If a role is missing, infer from position in the hierarchy.
- The top-level person (CEO or equivalent) must have reportsTo: null.
- Every other person must have a valid reportsTo pointing to their manager's id.`,

  ONBOARDING_INTERVIEWER: (agentName: string, agentRole: string, companyName: string) => `You are ARIA, an AI agent interviewer at ${companyName}. You are conducting a structured onboarding interview with ${agentName}, who is the ${agentRole}.

Your goal: extract their operational knowledge across 6 categories through natural conversation.

Categories to cover (cover all of them before finishing):
1. TASKS — What does a typical week look like? What are the 3 things only they can do?
2. TOOLS — What tools do they use daily? How do they use each one specifically?
3. TEAM — Who do they work with most? How do they prefer to communicate?
4. COMMS — How do they handle difficult client situations? What's their communication style?
5. DECISIONS — What decisions do they make independently? When do they escalate?
6. KNOWLEDGE — What would a new person in their role need to know in week 1 that nobody tells you?

Rules:
- Ask ONE question at a time. Never two questions in one message.
- Be conversational, warm, and specific — not bureaucratic.
- Reference their previous answers to go deeper.
- After covering all 6 categories (approximately 12-18 exchanges), write exactly: "ONBOARDING_COMPLETE" on its own line, then provide a 3-sentence summary of what you learned about their role.
- Never ask yes/no questions.
- Start by introducing yourself and asking about their typical week.`,

  TRAINED_AGENT: (agentName: string, agentRole: string, companyName: string, knowledgeBase: string) => `You are the AI twin of ${agentName}, ${agentRole} at ${companyName}.

You were trained through a structured interview with the real ${agentName}. Everything you know about how to do this job comes from that conversation. You respond as ${agentName} — not as a generic assistant.

--- KNOWLEDGE BASE ---
${knowledgeBase}
--- END KNOWLEDGE BASE ---

Rules:
- Answer ONLY from the knowledge base above. Be specific — use actual tools, clients, processes, and language from the knowledge base.
- If something is NOT in the knowledge base, say: "I don't have specific knowledge about that from my training. You may want to ask ${agentName} directly."
- NEVER give a generic answer. A generic answer means the knowledge base is empty — that is a failure.
- Speak in first person as ${agentName}.
- Be concise and direct. This is operational knowledge transfer, not a conversation.`,

}
```

### 4. src/lib/claude.ts (ALL Anthropic SDK calls — three functions only)

```typescript
// src/lib/claude.ts
// Single file for ALL Claude API calls in ORGANA MVP
// Three functions. Nothing else.
// Import Anthropic SDK here only — never in components or route handlers.

import Anthropic from '@anthropic-ai/sdk'
import { PROMPTS } from './prompts'
import type { Agent, Message, KnowledgeBase, OrgChartParseRequest, OnboardingTurnResponse, AgentChatResponse } from './types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = 'claude-opus-4-5-20251101'

/**
 * parseOrgChart
 * Sends an org chart image to Claude vision and returns structured Agent[]
 * Called by: POST /api/parse-org
 */
export async function parseOrgChart(request: OrgChartParseRequest): Promise<Agent[]> {
  // TODO: Implement
  // 1. Call client.messages.create with vision
  // 2. Pass PROMPTS.ORG_CHART_PARSER as system prompt
  // 3. Parse response as JSON Agent[]
  // 4. Return agents with readinessScore: 0, onboardingComplete: false, knowledgeBase: null
  // 5. Throw descriptive error if JSON parse fails
  throw new Error('Not implemented')
}

/**
 * onboardingTurn
 * Sends one turn of the onboarding interview to Claude
 * Returns Claude's next question and whether onboarding is complete
 * Called by: POST /api/onboard
 */
export async function onboardingTurn(
  agentName: string,
  agentRole: string,
  companyName: string,
  messages: Message[]
): Promise<{ reply: string; isComplete: boolean }> {
  // TODO: Implement
  // 1. Call client.messages.create with PROMPTS.ONBOARDING_INTERVIEWER(agentName, agentRole, companyName)
  // 2. Pass full messages array as conversation history
  // 3. Check if response contains "ONBOARDING_COMPLETE"
  // 4. Return { reply: string, isComplete: boolean }
  throw new Error('Not implemented')
}

/**
 * agentChat
 * Sends a chat message to a trained agent
 * Injects the agent's knowledge base into context
 * Called by: POST /api/chat
 */
export async function agentChat(
  agentName: string,
  agentRole: string,
  companyName: string,
  knowledgeBase: KnowledgeBase,
  messages: Message[]
): Promise<string> {
  // TODO: Implement
  // 1. Serialize knowledgeBase to string (JSON.stringify with formatting)
  // 2. Call client.messages.create with PROMPTS.TRAINED_AGENT(agentName, agentRole, companyName, knowledgeBaseString)
  // 3. Pass full messages array as conversation history
  // 4. Return response text
  throw new Error('Not implemented')
}
```

### 5. src/lib/agent-store.ts (ALL localStorage operations)

```typescript
// src/lib/agent-store.ts
// Single source of truth for all persistent state in ORGANA MVP
// Uses localStorage only — no database, no server state
// Import this everywhere you need to read or write agent data

import type { Agent, KnowledgeBase, Message, DemoCompany } from './types'

const KEYS = {
  AGENTS: 'organa_agents',
  COMPANY_NAME: 'organa_company_name',
} as const

export const agentStore = {

  // Company
  getCompanyName: (): string => {
    // TODO: read from localStorage, return 'Nova Agency' as default
    throw new Error('Not implemented')
  },
  setCompanyName: (name: string): void => {
    // TODO: write to localStorage
    throw new Error('Not implemented')
  },

  // Agents
  getAllAgents: (): Agent[] => {
    // TODO: read from localStorage, parse JSON, return [] if empty
    throw new Error('Not implemented')
  },
  getAgent: (agentId: string): Agent | null => {
    // TODO: find agent by id in getAllAgents()
    throw new Error('Not implemented')
  },
  setAgents: (agents: Agent[]): void => {
    // TODO: write agents array to localStorage as JSON
    throw new Error('Not implemented')
  },
  upsertAgent: (agent: Agent): void => {
    // TODO: get all agents, replace if exists, push if new, save
    throw new Error('Not implemented')
  },

  // Onboarding
  addOnboardingMessage: (agentId: string, message: Message): void => {
    // TODO: get agent, push message to onboardingMessages, upsert agent
    throw new Error('Not implemented')
  },
  completeOnboarding: (agentId: string, knowledgeBase: KnowledgeBase): void => {
    // TODO: get agent, set knowledgeBase, onboardingComplete: true, readinessScore: 100, upsert
    throw new Error('Not implemented')
  },

  // Demo seed
  seedDemoCompany: (company: DemoCompany): void => {
    // TODO: setCompanyName(company.name), setAgents(company.agents)
    throw new Error('Not implemented')
  },
  clearAll: (): void => {
    // TODO: remove all KEYS from localStorage
    throw new Error('Not implemented')
  },
}
```

### 6. All API route stubs

Create these three route files with the correct Request/Response types and TODO comments:

**src/app/api/parse-org/route.ts**
- POST handler
- Reads imageBase64 and mediaType from request body
- Calls parseOrgChart() from claude.ts
- Returns Agent[] as JSON
- TODO: implement

**src/app/api/onboard/route.ts**
- POST handler
- Reads agentId, agentName, agentRole, companyName, messages from request body
- Calls onboardingTurn() from claude.ts
- Returns OnboardingTurnResponse as JSON
- TODO: implement

**src/app/api/chat/route.ts**
- POST handler
- Reads agentId, agentName, agentRole, companyName, knowledgeBase, messages from request body
- Calls agentChat() from claude.ts
- Returns AgentChatResponse as JSON
- TODO: implement

### 7. All page stubs

Create these three page files with correct TypeScript props and TODO comments:

**src/app/page.tsx** — Screen 1
- State: agents[], isLoading, companyName
- Has OrgUpload component
- On upload: POST to /api/parse-org, save to agentStore, render AgentCard[] grid
- Each AgentCard links to /onboard/[agentId]
- TODO: implement

**src/app/onboard/[agentId]/page.tsx** — Screen 2
- Reads agentId from params
- Gets agent from agentStore
- Renders ChatInterface
- On message: POST to /api/onboard, save message to agentStore
- On isComplete: calls agentStore.completeOnboarding(), redirects to /agent/[agentId]
- TODO: implement

**src/app/agent/[agentId]/page.tsx** — Screen 3
- Reads agentId from params
- Gets agent from agentStore
- Checks onboardingComplete — if false, redirects to /onboard/[agentId]
- Renders ChatInterface with agent context
- On message: POST to /api/chat, renders response
- TODO: implement

### 8. Component stubs

**src/components/OrgUpload.tsx**
- Props: onAgentsGenerated: (agents: Agent[]) => void, isLoading: boolean
- Renders drag-and-drop zone
- Converts image to base64, calls parent callback
- TODO: implement UI

**src/components/AgentCard.tsx**
- Props: agent: Agent, onClick: () => void
- Shows name, role, department, readinessScore as progress bar
- Green badge if onboardingComplete, gray if not
- TODO: implement UI

**src/components/ChatInterface.tsx**
- Props: messages: Message[], onSend: (content: string) => void, isLoading: boolean, placeholder?: string
- Renders message list and input
- TODO: implement UI

### 9. .claude/skills/ SKILL.md files

**org-parser/SKILL.md**: Document that parseOrgChart() in claude.ts uses Claude vision with PROMPTS.ORG_CHART_PARSER. Returns Agent[]. Input: base64 image. Output: typed Agent array. Error: throws if JSON parse fails.

**onboarding-chat/SKILL.md**: Document that onboardingTurn() manages the interview loop. ONBOARDING_COMPLETE signal ends the session. Messages array is the full conversation history passed on each turn.

**agent-chat/SKILL.md**: Document that agentChat() injects the full KnowledgeBase as JSON string into the system prompt via PROMPTS.TRAINED_AGENT. The quality of answers depends entirely on the richness of the knowledge base.

### 10. tools/scripts/seed-demo.ts

Pre-loads Nova Agency with 3 fully trained agents: Valentina Torres (CEO), Martín Ruiz (Head of Accounts), Sofía Chen (Head of Creative). Each has a complete KnowledgeBase with realistic data for a marketing agency. The other 10 agents exist but have no knowledge base (onboardingComplete: false). This lets the demo show BOTH states: untrained (generic) vs trained (specific).

## EXECUTION ORDER

1. Create package.json with all dependencies (next, react, @anthropic-ai/sdk, typescript, tailwind)
2. Create tsconfig.json and next.config.ts
3. Create CLAUDE.md
4. Create src/lib/types.ts — this unblocks everything else
5. Create src/lib/prompts.ts
6. Create src/lib/claude.ts (stubs)
7. Create src/lib/agent-store.ts (stubs)
8. Create all API routes (stubs)
9. Create all pages (stubs)
10. Create all components (stubs)
11. Create .claude/ directory and skill files
12. Create tools/scripts/seed-demo.ts with Nova Agency data
13. Run npm install and verify TypeScript compiles with no errors
14. Output a summary of every file created and what needs to be implemented next

## SUCCESS CRITERIA

When you finish, running `npm run dev` must start the server without TypeScript errors. Every file must exist. Every interface must be typed. Every TODO must be specific enough that a developer can implement it without asking questions.

The repo is ready when three developers can open three terminals and each implement one of the three Claude functions in claude.ts simultaneously without any conflicts.
