import { NextResponse } from 'next/server'
import { CHAINS } from '@/lib/chains'

export async function GET() {
  return NextResponse.json(CHAINS)
}
