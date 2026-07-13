import { NextRequest, NextResponse } from 'next/server'
import { getTrade, updateTradeStatus } from '@/trading-bot/store'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const trade = getTrade(id)

  if (!trade) return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
  if (trade.status !== 'PENDING') {
    return NextResponse.json({ error: `Trade already ${trade.status}` }, { status: 409 })
  }

  const updated = updateTradeStatus(id, { status: 'REJECTED' })
  return NextResponse.json({ trade: updated })
}
