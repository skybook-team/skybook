import { NextRequest, NextResponse } from 'next/server'
import { runScan } from '@/trading-bot/scanner'

// Protect with a shared secret: POST /api/trading-bot/scan?secret=XXX
// Set BOT_SECRET env var. For Vercel Cron, pass it in the cron config.
export async function POST(req: NextRequest) {
  const secret = new URL(req.url).searchParams.get('secret')
  if (process.env.BOT_SECRET && secret !== process.env.BOT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = await runScan()
  return NextResponse.json({ results, scannedAt: new Date().toISOString() })
}
