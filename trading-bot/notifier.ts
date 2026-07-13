import { NTFY_TOPIC, APP_URL } from './config'
import type { Trade } from './types'

const STRATEGY_LABELS: Record<string, string> = {
  BULL_CALL_SPREAD: '🟢 Bull Call Spread',
  BULL_PUT_SPREAD: '🟢 Bull Put Spread',
  BEAR_PUT_SPREAD: '🔴 Bear Put Spread',
  BEAR_CALL_SPREAD: '🔴 Bear Call Spread',
  IRON_CONDOR: '⚡ Iron Condor',
}

export async function sendTradeAlert(trade: Trade): Promise<void> {
  const label = STRATEGY_LABELS[trade.strategy] ?? trade.strategy
  const title = `${trade.ticker} — ${label}`
  const signal = trade.signals.map(s => s.detail).join(' · ')
  const expiry = trade.legs[0]?.expiration ?? '?'

  const body = [
    signal,
    `Max Loss: $${trade.maxLoss} | Max Profit: $${trade.maxProfit}`,
    `Stock @ $${trade.price.toFixed(2)} | Exp: ${expiry}`,
    `Tap to approve →`,
  ].join('\n')

  await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
    method: 'POST',
    headers: {
      Title: title,
      Priority: 'high',
      Tags: 'chart_with_upwards_trend',
      Click: `${APP_URL}/trading?id=${trade.id}`,
      'Content-Type': 'text/plain',
    },
    body,
  })
}

export async function sendOrderConfirmation(trade: Trade): Promise<void> {
  await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
    method: 'POST',
    headers: {
      Title: `✅ ${trade.ticker} order placed`,
      Priority: 'default',
      Tags: 'white_check_mark',
      'Content-Type': 'text/plain',
    },
    body: `${trade.strategy} executed. Max loss: $${trade.maxLoss}`,
  })
}

export async function sendErrorAlert(ticker: string, msg: string): Promise<void> {
  await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
    method: 'POST',
    headers: {
      Title: `⚠️ Bot error — ${ticker}`,
      Priority: 'low',
      Tags: 'warning',
      'Content-Type': 'text/plain',
    },
    body: msg.slice(0, 400),
  })
}
