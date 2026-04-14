// src/lib/claude.ts
// Single file for ALL Claude API calls in ORGANA MVP
// Import Anthropic SDK here only — never in components or route handlers.

import Anthropic from '@anthropic-ai/sdk'
import { PROMPTS } from './prompts'
import type { Agent, Message, KnowledgeBase, OrgChartParseRequest } from './types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = 'claude-opus-4-6'

// ─── Streaming types ─────────────────────────────────────────────────────────

export type AgentStreamEvent =
  | { type: 'thinking'; text: string }
  | { type: 'text'; text: string }
  | { type: 'done'; thinkingSeconds: number }
  | { type: 'error'; message: string }

// ─── parseOrgChart ───────────────────────────────────────────────────────────

export async function parseOrgChart(request: OrgChartParseRequest): Promise<Agent[]> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: PROMPTS.ORG_CHART_PARSER,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: request.mediaType,
              data: request.imageBase64,
            },
          },
          { type: 'text', text: 'Parse this org chart and return the JSON array.' },
        ],
      },
    ],
  })

  const block = response.content[0]
  if (block.type !== 'text') {
    throw new Error('Failed to parse org chart: unexpected response type')
  }

  let text = block.text.trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```[^\n]*\n?/, '').replace(/```$/, '').trim()
  }

  let agents: Agent[]
  try {
    agents = JSON.parse(text) as Agent[]
  } catch {
    throw new Error('Failed to parse org chart: response was not valid JSON')
  }

  if (!Array.isArray(agents) || agents.length === 0) {
    throw new Error('Failed to parse org chart: no agents found in response')
  }

  for (const agent of agents) {
    if (!agent.id || !agent.name || !agent.role) {
      throw new Error('Failed to parse org chart: agent missing required fields')
    }
    agent.readinessScore = agent.readinessScore ?? 0
    agent.onboardingComplete = agent.onboardingComplete ?? false
    agent.knowledgeBase = agent.knowledgeBase ?? null
    agent.onboardingMessages = agent.onboardingMessages ?? []
  }

  return agents
}

// ─── onboardingTurn ──────────────────────────────────────────────────────────

export async function onboardingTurn(
  agentName: string,
  agentRole: string,
  companyName: string,
  messages: Message[]
): Promise<{ reply: string; isComplete: boolean }> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: PROMPTS.ONBOARDING_INTERVIEWER(agentName, agentRole, companyName),
    messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
  })

  const block = response.content[0]
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from onboarding turn')
  }

  const reply = block.text
  const isComplete = reply.includes('ONBOARDING_COMPLETE')
  return { reply, isComplete }
}

// ─── agentChat (non-streaming fallback) ──────────────────────────────────────

export async function agentChat(
  agentName: string,
  agentRole: string,
  companyName: string,
  knowledgeBase: KnowledgeBase,
  messages: Message[]
): Promise<string> {
  const serializedKnowledgeBase = JSON.stringify(knowledgeBase, null, 2)
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: PROMPTS.TRAINED_AGENT(agentName, agentRole, companyName, serializedKnowledgeBase),
    messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from agent chat')
  return block.text
}

// ─── agentChatStream (agentic — extended thinking + streaming) ────────────────

export async function* agentChatStream(
  agentName: string,
  agentRole: string,
  companyName: string,
  knowledgeBase: KnowledgeBase,
  messages: Message[]
): AsyncGenerator<AgentStreamEvent> {
  const serialized = JSON.stringify(knowledgeBase, null, 2)
  const startTime = Date.now()

  const stream = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    thinking: { type: 'enabled', budget_tokens: 1024 },
    stream: true,
    system: PROMPTS.TRAINED_AGENT(agentName, agentRole, companyName, serialized),
    messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      if (event.delta.type === 'thinking_delta') {
        yield { type: 'thinking', text: event.delta.thinking }
      } else if (event.delta.type === 'text_delta') {
        yield { type: 'text', text: event.delta.text }
      }
    }
  }

  const thinkingSeconds = Math.round((Date.now() - startTime) / 1000)
  yield { type: 'done', thinkingSeconds }
}
