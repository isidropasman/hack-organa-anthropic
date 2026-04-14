#!/usr/bin/env tsx
/**
 * ORGANA Bug Solver Agent
 * ─────────────────────────────────────────────────────────────────────────────
 * Autonomously detects and fixes UI/runtime bugs in the running Next.js app.
 *
 * How it works:
 *   1. Launches a headless Chromium browser via Puppeteer
 *   2. Visits each route, captures screenshots + console errors + network failures
 *   3. Sends all context to Claude with file-system tools (read, write, list)
 *   4. Claude reads source files, diagnoses root causes, and applies patches
 *   5. Waits for Next.js hot-reload, then re-captures to verify fixes
 *   6. Loops up to MAX_ITERATIONS or until no errors remain
 *
 * Usage:
 *   pnpm bug-solver              # default: http://localhost:3000
 *   pnpm bug-solver --url http://localhost:3001
 *   pnpm bug-solver --dry-run    # analyze only, no file writes
 *
 * Requirements: Next.js dev server must be running.
 */

import Anthropic from '@anthropic-ai/sdk'
import puppeteer, { Browser, Page } from 'puppeteer'
import * as fs from 'fs'
import * as path from 'path'

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = process.argv.includes('--url')
  ? process.argv[process.argv.indexOf('--url') + 1]
  : 'http://localhost:3000'

const DRY_RUN = process.argv.includes('--dry-run')
const MAX_ITERATIONS = 5
const RELOAD_WAIT_MS = 4000 // time for Next.js hot-reload after a file change
const PROJECT_ROOT = path.resolve(__dirname, '../..')
const SRC_ROOT = path.join(PROJECT_ROOT, 'src')

const ROUTES = [
  { path: '/', label: 'Home (org chart upload)' },
  { path: '/onboard/valentina-torres', label: 'Onboarding (demo agent)' },
  { path: '/agent/valentina-torres', label: 'Agent chat (demo agent)' },
]

// ─── Types ───────────────────────────────────────────────────────────────────

interface PageCapture {
  route: string
  label: string
  screenshotBase64: string
  consoleErrors: string[]
  consoleWarnings: string[]
  networkErrors: string[]
  pageTitle: string
  url: string
}

interface ToolResult {
  type: 'tool_result'
  tool_use_id: string
  content: string
}

// ─── Puppeteer helpers ───────────────────────────────────────────────────────

async function capturePage(browser: Browser, route: string, label: string): Promise<PageCapture> {
  const page: Page = await browser.newPage()
  const consoleErrors: string[] = []
  const consoleWarnings: string[] = []
  const networkErrors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
    if (msg.type() === 'warning') consoleWarnings.push(msg.text())
  })

  page.on('pageerror', (err) => {
    consoleErrors.push(`PageError: ${err.message}`)
  })

  page.on('requestfailed', (req) => {
    networkErrors.push(`${req.method()} ${req.url()} → ${req.failure()?.errorText ?? 'unknown'}`)
  })

  const url = `${BASE_URL}${route}`
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 })
    await page.waitForTimeout(1500) // let React render
  } catch (err) {
    consoleErrors.push(`Navigation failed: ${(err as Error).message}`)
  }

  const screenshotBuffer = await page.screenshot({ fullPage: true, type: 'jpeg', quality: 80 })
  const screenshotBase64 = screenshotBuffer.toString('base64')
  const pageTitle = await page.title().catch(() => '(unknown)')

  await page.close()

  return { route, label, screenshotBase64, consoleErrors, consoleWarnings, networkErrors, pageTitle, url }
}

async function captureAllRoutes(browser: Browser): Promise<PageCapture[]> {
  const results: PageCapture[] = []
  for (const route of ROUTES) {
    console.log(`  📸 Capturing ${route.label}...`)
    const capture = await capturePage(browser, route.path, route.label)
    results.push(capture)
    const errCount = capture.consoleErrors.length + capture.networkErrors.length
    if (errCount > 0) {
      console.log(`     ⚠️  ${errCount} error(s) found`)
    } else {
      console.log(`     ✅ Clean`)
    }
  }
  return results
}

// ─── File system tools ───────────────────────────────────────────────────────

function listDirectory(dirPath: string): string {
  const abs = path.isAbsolute(dirPath) ? dirPath : path.join(PROJECT_ROOT, dirPath)
  try {
    const entries = fs.readdirSync(abs, { withFileTypes: true })
    return entries
      .map((e) => `${e.isDirectory() ? '[dir] ' : '      '}${e.name}`)
      .join('\n')
  } catch (err) {
    return `Error: ${(err as Error).message}`
  }
}

function readFile(filePath: string): string {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(PROJECT_ROOT, filePath)
  // Safety: only allow reading within project root
  if (!abs.startsWith(PROJECT_ROOT)) {
    return 'Error: path is outside the project root'
  }
  try {
    return fs.readFileSync(abs, 'utf-8')
  } catch (err) {
    return `Error: ${(err as Error).message}`
  }
}

function writeFile(filePath: string, content: string): string {
  if (DRY_RUN) {
    return `[DRY RUN] Would write ${content.length} chars to ${filePath}`
  }
  const abs = path.isAbsolute(filePath) ? filePath : path.join(PROJECT_ROOT, filePath)
  // Safety: only allow writing within src/
  if (!abs.startsWith(SRC_ROOT)) {
    return `Error: writes are only allowed inside src/ (got ${abs})`
  }
  try {
    fs.mkdirSync(path.dirname(abs), { recursive: true })
    fs.writeFileSync(abs, content, 'utf-8')
    return `Written ${content.length} chars to ${filePath}`
  } catch (err) {
    return `Error: ${(err as Error).message}`
  }
}

// ─── Claude tools definition ─────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'list_directory',
    description: 'List files and directories at the given path relative to the project root. Use this to explore the codebase structure.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'Path relative to the project root, e.g. "src/app" or "src/lib"',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'read_file',
    description: 'Read the full contents of a source file. Use this before writing any fixes to understand the current code.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'File path relative to project root, e.g. "src/app/page.tsx"',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Write (overwrite) a source file with fixed content. Only use this after reading the file. Only writes inside src/.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: {
          type: 'string',
          description: 'File path relative to project root, e.g. "src/app/page.tsx"',
        },
        content: {
          type: 'string',
          description: 'Complete new file content. Must be the full file, not just the diff.',
        },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'finish',
    description: 'Signal that all detected issues have been addressed (or that no actionable issues remain). Provide a summary of what was fixed.',
    input_schema: {
      type: 'object' as const,
      properties: {
        summary: {
          type: 'string',
          description: 'Human-readable summary of fixes applied, or explanation of why no fixes were needed.',
        },
        issues_fixed: {
          type: 'number',
          description: 'Number of distinct issues that were fixed.',
        },
        issues_remaining: {
          type: 'number',
          description: 'Number of issues that could not be fixed (e.g. missing env vars, external service down).',
        },
      },
      required: ['summary', 'issues_fixed', 'issues_remaining'],
    },
  },
]

// ─── Build Claude prompt from page captures ───────────────────────────────────

function buildInitialMessages(captures: PageCapture[], iteration: number): Anthropic.MessageParam[] {
  const errorSummary = captures.map((c) => {
    const errors = [
      ...c.consoleErrors.map((e) => `  [console.error] ${e}`),
      ...c.networkErrors.map((e) => `  [network fail]  ${e}`),
      ...c.consoleWarnings.map((w) => `  [console.warn]  ${w}`),
    ]
    return `### ${c.label} (${c.url})\nTitle: ${c.pageTitle}\n${errors.length ? errors.join('\n') : '  No errors detected'}`
  }).join('\n\n')

  const content: Anthropic.ContentBlockParam[] = [
    {
      type: 'text',
      text: `# ORGANA Bug Solver — Iteration ${iteration}

You are analyzing a Next.js 14 App Router application called ORGANA MVP.
${DRY_RUN ? '\n⚠️  DRY RUN MODE — read_file and list_directory work, but write_file will not apply changes.\n' : ''}
## Error Report

${errorSummary}

## Screenshots

Below are screenshots of each route. Study them carefully for visual errors, blank screens, broken layouts, and missing content.
`,
    },
  ]

  // Add screenshots as vision content
  for (const capture of captures) {
    content.push({
      type: 'text',
      text: `### Screenshot: ${capture.label}`,
    })
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/jpeg',
        data: capture.screenshotBase64,
      },
    })
  }

  content.push({
    type: 'text',
    text: `## Instructions

1. Analyze the screenshots and error report above.
2. Use list_directory and read_file to explore the source code — start with src/app/, src/lib/, src/components/.
3. Identify the ROOT CAUSE of each error, not just the symptom.
4. Use write_file to apply fixes. Read the file first, then write the complete corrected version.
5. Fix TypeScript type errors, runtime crashes, import errors, missing dependencies, broken layouts, and blank screens.
6. Do NOT fix things that are intentional or working correctly.
7. When you have addressed all actionable issues, call finish() with a summary.

Important rules:
- Never partially write a file. write_file requires the FULL file content.
- Only write to files inside src/.
- Preserve all existing functionality — only fix what is broken.
- TypeScript strict mode is on. All fixes must be type-safe.`,
  })

  return [{ role: 'user', content }]
}

// ─── Agentic loop ─────────────────────────────────────────────────────────────

async function runAgentLoop(
  client: Anthropic,
  messages: Anthropic.MessageParam[]
): Promise<{ done: boolean; summary: string; filesWritten: string[] }> {
  const filesWritten: string[] = []
  let iterationMessages = [...messages]

  while (true) {
    console.log(`\n  🤖 Calling Claude (${iterationMessages.length} messages in context)...`)

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 8192,
      tools: TOOLS,
      messages: iterationMessages,
      system: `You are an expert Next.js 14 / TypeScript bug solver. You analyze screenshots and error logs from a running web application and fix issues by reading and rewriting source files. You are methodical, read code before editing it, and only fix things that are actually broken. You use extended analysis before writing any fix.`,
    })

    // Add assistant response to conversation
    iterationMessages.push({ role: 'assistant', content: response.content })

    // Process tool calls
    const toolResults: ToolResult[] = []
    let finishCall: { summary: string; issues_fixed: number; issues_remaining: number } | null = null

    for (const block of response.content) {
      if (block.type === 'text') {
        if (block.text.trim()) {
          console.log(`\n  💬 Claude: ${block.text.slice(0, 300)}${block.text.length > 300 ? '...' : ''}`)
        }
      } else if (block.type === 'tool_use') {
        const input = block.input as Record<string, string>
        console.log(`\n  🔧 Tool: ${block.name}(${JSON.stringify(input).slice(0, 120)})`)

        let result = ''
        if (block.name === 'list_directory') {
          result = listDirectory(input.path)
        } else if (block.name === 'read_file') {
          result = readFile(input.path)
          console.log(`     → Read ${result.length} chars`)
        } else if (block.name === 'write_file') {
          result = writeFile(input.path, input.content)
          if (!DRY_RUN && result.startsWith('Written')) {
            filesWritten.push(input.path)
          }
          console.log(`     → ${result}`)
        } else if (block.name === 'finish') {
          const finishInput = block.input as { summary: string; issues_fixed: number; issues_remaining: number }
          finishCall = finishInput
          result = 'Session complete.'
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        })
      }
    }

    // If finish was called, we're done
    if (finishCall) {
      return {
        done: true,
        summary: finishCall.summary,
        filesWritten,
      }
    }

    // If stop_reason is end_turn with no tool calls, we're done unexpectedly
    if (response.stop_reason === 'end_turn' && toolResults.length === 0) {
      return {
        done: true,
        summary: 'Claude stopped without calling finish(). Review output above.',
        filesWritten,
      }
    }

    // Add tool results to conversation and continue
    if (toolResults.length > 0) {
      iterationMessages.push({ role: 'user', content: toolResults })
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║          ORGANA Bug Solver Agent                             ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log(`\nTarget: ${BASE_URL}`)
  console.log(`Mode:   ${DRY_RUN ? 'DRY RUN (read-only)' : 'LIVE (will write files)'}`)
  console.log(`Routes: ${ROUTES.map((r) => r.path).join(', ')}`)

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n❌ ANTHROPIC_API_KEY is not set. Export it before running.')
    process.exit(1)
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let browser: Browser | null = null
  const totalFixedFiles: string[] = []

  try {
    console.log('\n🚀 Launching browser...')
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
      console.log(`\n${'─'.repeat(64)}`)
      console.log(`Iteration ${iteration} / ${MAX_ITERATIONS}`)
      console.log('─'.repeat(64))

      console.log('\n📸 Capturing all routes...')
      const captures = await captureAllRoutes(browser)

      const totalErrors = captures.reduce(
        (sum, c) => sum + c.consoleErrors.length + c.networkErrors.length,
        0
      )

      if (totalErrors === 0 && iteration > 1) {
        console.log('\n✅ No errors detected. App looks clean!')
        break
      }

      console.log(`\n📊 Total errors across all routes: ${totalErrors}`)

      const messages = buildInitialMessages(captures, iteration)
      const { done, summary, filesWritten } = await runAgentLoop(client, messages)

      totalFixedFiles.push(...filesWritten)

      console.log(`\n${'─'.repeat(64)}`)
      console.log(`Iteration ${iteration} complete`)
      console.log(`Files written: ${filesWritten.length > 0 ? filesWritten.join(', ') : 'none'}`)

      if (done && filesWritten.length === 0) {
        // No changes made, no point re-checking
        console.log('\n📋 Summary:', summary)
        break
      }

      if (filesWritten.length > 0 && iteration < MAX_ITERATIONS) {
        console.log(`\n⏳ Waiting ${RELOAD_WAIT_MS / 1000}s for Next.js hot-reload...`)
        await new Promise((resolve) => setTimeout(resolve, RELOAD_WAIT_MS))
      }

      if (done) {
        console.log('\n📋 Summary:', summary)
        break
      }
    }
  } finally {
    if (browser) await browser.close()
  }

  console.log('\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║  Bug Solver Complete                                         ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log(`\nTotal files modified: ${totalFixedFiles.length}`)
  if (totalFixedFiles.length > 0) {
    totalFixedFiles.forEach((f) => console.log(`  ✏️  ${f}`))
  }
  console.log()
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err)
  process.exit(1)
})
