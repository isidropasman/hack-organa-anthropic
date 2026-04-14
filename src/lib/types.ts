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
