# Skill: org-parser

## What it does
`parseOrgChart()` in `src/lib/claude.ts` sends an org chart image to Claude vision and returns a structured `Agent[]`.

## Inputs
- `imageBase64: string` — base64-encoded image (no data URL prefix, just the raw base64)
- `mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'`

## Outputs
- `Agent[]` — fully typed, with `readinessScore: 0`, `onboardingComplete: false`, `knowledgeBase: null`, `onboardingMessages: []`

## System prompt
Uses `PROMPTS.ORG_CHART_PARSER` from `src/lib/prompts.ts`.
The prompt instructs Claude to return ONLY a raw JSON array — no markdown, no explanation.

## Error handling
- Throws `Error('Failed to parse org chart: <reason>')` if the response is not valid JSON
- Throws if the array is empty (Claude couldn't find any people)
- The route handler at `src/app/api/parse-org/route.ts` catches and returns `{ agents: [], error: message }`

## Called by
`POST /api/parse-org` → `src/app/api/parse-org/route.ts`
