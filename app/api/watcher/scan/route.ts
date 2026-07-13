import { NextRequest, NextResponse } from 'next/server'
import { scanAll } from '@/watcher/scanner'

export async function POST(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get('secret')
  if (process.env.BOT_SECRET && secret !== process.env.BOT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const results = await scanAll()
  return NextResponse.json({ results, scannedAt: new Date().toISOString() })
}
