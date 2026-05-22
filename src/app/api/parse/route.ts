import { NextResponse } from 'next/server'
import { parsePrompt } from '@/lib/parser'
import { parseWithAI, hasAIProvider } from '@/lib/ai-parser'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    let spec = null

    // Try AI parsing first (if provider configured)
    if (hasAIProvider()) {
      try {
        spec = await parseWithAI(prompt)
      } catch (err) {
        console.error('[Parse API] AI parsing failed, falling back to regex:', err)
      }
    }

    // Fallback to regex parser
    if (!spec) {
      spec = parsePrompt(prompt)
    }

    return NextResponse.json(spec)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to parse prompt' },
      { status: 500 }
    )
  }
}
