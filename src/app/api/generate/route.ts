import { NextRequest, NextResponse } from 'next/server'
import { generateProject } from '@/lib/generator'
import { ProjectSpec } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const spec: ProjectSpec = await request.json()
    
    if (!spec.type || !spec.chain || !spec.name) {
      return NextResponse.json(
        { error: 'Invalid project spec — type, chain, and name required' },
        { status: 400 }
      )
    }

    const project = generateProject(spec)
    return NextResponse.json(project)
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json(
      { error: 'Failed to generate project' },
      { status: 500 }
    )
  }
}
