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
  // TODO: Implement
  // 1. Call client.messages.create with vision:
  //    model: MODEL, max_tokens: 4096
  //    system: PROMPTS.ORG_CHART_PARSER
  //    messages: [{ role: 'user', content: [
  //      { type: 'image', source: { type: 'base64', media_type: request.mediaType, data: request.imageBase64 } },
  //      { type: 'text', text: 'Parse this org chart and return the JSON array.' }
  //    ]}]
  // 2. Extract text from response.content[0] (type: 'text')
  // 3. Parse text as JSON → Agent[]
  // 4. Validate each agent has id, name, role, department, reportsTo
  // 5. Throw Error('Failed to parse org chart: <reason>') if JSON parse fails or array is empty
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
  // 1. Map messages to Anthropic MessageParam format:
  //    { role: msg.role, content: msg.content }
  // 2. Call client.messages.create:
  //    model: MODEL, max_tokens: 1024
  //    system: PROMPTS.ONBOARDING_INTERVIEWER(agentName, agentRole, companyName)
  //    messages: mappedMessages
  // 3. Extract reply text from response.content[0] (type: 'text')
  // 4. Check if reply includes 'ONBOARDING_COMPLETE'
  // 5. Return { reply, isComplete }
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
  // 1. Serialize knowledgeBase: JSON.stringify(knowledgeBase, null, 2)
  // 2. Map messages to Anthropic MessageParam format:
  //    { role: msg.role, content: msg.content }
  // 3. Call client.messages.create:
  //    model: MODEL, max_tokens: 1024
  //    system: PROMPTS.TRAINED_AGENT(agentName, agentRole, companyName, serializedKnowledgeBase)
  //    messages: mappedMessages
  // 4. Extract reply text from response.content[0] (type: 'text')
  // 5. Return reply string
  throw new Error('Not implemented')
}
