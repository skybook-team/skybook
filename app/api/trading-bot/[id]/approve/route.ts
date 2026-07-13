import { NextRequest, NextResponse } from 'next/server'
import { getTrade, updateTradeStatus } from '@/trading-bot/store'
import { getAccount, placeOptionOrder } from '@/trading-bot/robinhood'
import { sendOrderConfirmation } from '@/trading-bot/notifier'
import { RH_TOKEN } from '@/trading-bot/config'

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

  updateTradeStatus(id, { status: 'APPROVED' })

  try {
    const token = RH_TOKEN
    if (!token) throw new Error('ROBINHOOD_TOKEN not set')

    const account = await getAccount(token)

    // Build RH order legs from trade legs
    const legs = trade.legs.map(leg => ({
      option: leg.instrumentUrl,
      side: leg.action,
      position_effect: 'open' as const,
      ratio_quantity: 1,
    }))

    // Net price for the combo (positive = debit, negative = credit)
    const limitPrice = Math.abs(trade.netDebit)

    const order = await placeOptionOrder(
      account.url,
      legs,
      trade.contracts,
      limitPrice,
      token,
    )

    const updated = updateTradeStatus(id, { status: 'EXECUTED', rhOrderId: order.id })
    await sendOrderConfirmation(trade)

    return NextResponse.json({ trade: updated, orderId: order.id })
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    updateTradeStatus(id, { status: 'FAILED', error })
    return NextResponse.json({ error }, { status: 500 })
  }
}
