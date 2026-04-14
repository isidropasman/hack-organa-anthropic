// src/lib/claude.ts
// Single file for ALL Claude API calls in ORGANA MVP
// Three functions. Nothing else.
// Import Anthropic SDK here only — never in components or route handlers.

import Anthropic from '@anthropic-ai/sdk'
import { PROMPTS } from './prompts'
import type { Agent, Message, KnowledgeBase, OrgChartParseRequest } from './types'

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
          {
            type: 'text',
            text: 'Parse this org chart and return the JSON array.',
          },
        ],
      },
    ],
  })

  const block = response.content[0]
  if (block.type !== 'text') {
    throw new Error('Failed to parse org chart: unexpected response type')
  }

  let text = block.text.trim()
  // Strip markdown code fences if Claude wrapped it
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

  // Ensure required fields exist on every agent
  for (const agent of agents) {
    if (!agent.id || !agent.name || !agent.role) {
      throw new Error('Failed to parse org chart: agent missing required fields')
    }
    // Ensure defaults for any fields Claude might have omitted
    agent.readinessScore = agent.readinessScore ?? 0
    agent.onboardingComplete = agent.onboardingComplete ?? false
    agent.knowledgeBase = agent.knowledgeBase ?? null
    agent.onboardingMessages = agent.onboardingMessages ?? []
  }

  return agents
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
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: PROMPTS.ONBOARDING_INTERVIEWER(agentName, agentRole, companyName),
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
  })

  const block = response.content[0]
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from onboarding turn')
  }

  const reply = block.text
  const isComplete = reply.includes('ONBOARDING_COMPLETE')

  return { reply, isComplete }
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
  const serializedKnowledgeBase = JSON.stringify(knowledgeBase, null, 2)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: PROMPTS.TRAINED_AGENT(agentName, agentRole, companyName, serializedKnowledgeBase),
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
  })

  const block = response.content[0]
  if (block.type !== 'text') {
    throw new Error('Unexpected response type from agent chat')
  }

  return block.text
}
