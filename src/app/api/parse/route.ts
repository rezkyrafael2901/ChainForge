import { NextRequest, NextResponse } from 'next/server'
import { parsePrompt } from '@/lib/parser'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const spec = parsePrompt(prompt)
    return NextResponse.json(spec)
  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json(
      { error: 'Failed to parse prompt' },
      { status: 500 }
    )
  }
}
