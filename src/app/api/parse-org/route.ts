// src/app/api/parse-org/route.ts
// POST /api/parse-org
// Accepts a base64-encoded org chart image, returns Agent[] parsed by Claude vision

import { NextRequest, NextResponse } from 'next/server'
import { parseOrgChart } from '@/lib/claude'
import type { OrgChartParseRequest, OrgChartParseResponse } from '@/lib/types'

export async function POST(request: NextRequest): Promise<NextResponse<OrgChartParseResponse>> {
  // TODO: Implement
  // 1. Parse request body: const { imageBase64, mediaType } = await request.json()
  // 2. Validate: imageBase64 must be non-empty string, mediaType must be one of the allowed values
  //    Return NextResponse.json({ agents: [], error: 'Missing imageBase64' }, { status: 400 }) on failure
  // 3. Call: const agents = await parseOrgChart({ imageBase64, mediaType })
  // 4. Return: NextResponse.json({ agents })
  // 5. Catch errors: return NextResponse.json({ agents: [], error: err.message }, { status: 500 })
  return NextResponse.json({ agents: [], error: 'Not implemented' }, { status: 501 })
}
