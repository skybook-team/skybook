import { NextResponse } from 'next/server'
import { getAllTrades } from '@/trading-bot/store'

export async function GET() {
  const trades = getAllTrades()
  return NextResponse.json({ trades })
}
