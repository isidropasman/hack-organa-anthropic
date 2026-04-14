# ORGANA MVP

AI-powered organizational memory. Upload an org chart → train AI agents → chat with anyone in your company, anytime.

## Quick start

```bash
cp .env.local.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo (no API key needed for org chart step)

Click **"Load Nova Agency demo"** on the home screen to pre-load 13 agents (3 fully trained, 10 untrained).

## Three screens

| Screen | Path | What it does |
|--------|------|-------------|
| Org Upload | `/` | Upload an org chart image → Claude parses it into agents |
| Onboarding | `/onboard/[agentId]` | 10-minute interview to train an agent's AI twin |
| Agent Chat | `/agent/[agentId]` | Chat with a trained agent about their role |

## Architecture

```
src/lib/claude.ts       ← All Anthropic SDK calls (3 functions)
src/lib/prompts.ts      ← All system prompts
src/lib/agent-store.ts  ← All localStorage state
src/lib/types.ts        ← All TypeScript interfaces
```

No database. No auth. localStorage only.

## Environment variables

```
ANTHROPIC_API_KEY=sk-ant-...
```
