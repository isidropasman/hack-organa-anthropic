// src/app/api/parse-org/route.ts
// POST /api/parse-org
// Accepts a base64-encoded org chart image, returns Agent[] parsed by Claude vision

import { NextRequest, NextResponse } from 'next/server'
import { parseOrgChart } from '@/lib/claude'
import type { OrgChartParseResponse } from '@/lib/types'

const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const

export async function POST(request: NextRequest): Promise<NextResponse<OrgChartParseResponse>> {
  try {
    const body = await request.json() as { imageBase64?: unknown; mediaType?: unknown }
    const { imageBase64, mediaType } = body

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ agents: [], error: 'Missing imageBase64' }, { status: 400 })
    }

    if (!mediaType || !ALLOWED_MEDIA_TYPES.includes(mediaType as typeof ALLOWED_MEDIA_TYPES[number])) {
      return NextResponse.json(
        { agents: [], error: 'mediaType must be image/jpeg, image/png, image/gif, or image/webp' },
        { status: 400 }
      )
    }

    const agents = await parseOrgChart({
      imageBase64,
      mediaType: mediaType as typeof ALLOWED_MEDIA_TYPES[number],
    })

    return NextResponse.json({ agents })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[parse-org] error:', err)
    return NextResponse.json({ agents: [], error: message }, { status: 500 })
  }
}
