import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()
const PROMPT = fs.readFileSync(path.join(process.cwd(), 'lib/prompt/admin/portal.md'), 'utf-8')

export async function POST(req: NextRequest) {
  const body = await req.json()
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      try {
        const apiStream = await client.messages.create({
          model: 'claude-sonnet-4-6', max_tokens: 250, stream: true, system: PROMPT,
          messages: [{ role: 'user', content: `<community_data>${JSON.stringify(body)}</community_data>\n\nGenerá el análisis ahora.` }],
        })
        for await (const ev of apiStream) {
          if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta')
            send({ type: 'text', text: ev.delta.text })
        }
        send({ type: 'done' })
      } catch (err) {
        send({ type: 'error', message: (err as Error).message })
      } finally {
        controller.close()
      }
    },
  })
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  })
}
