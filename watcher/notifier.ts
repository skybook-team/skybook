import { NTFY_TOPIC, APP_URL } from '../trading-bot/config'

async function push(title: string, body: string, priority: string, tags: string) {
  await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
    method: 'POST',
    headers: {
      Title: title,
      Priority: priority,
      Tags: tags,
      Click: `${APP_URL}/watcher`,
      'Content-Type': 'text/plain',
    },
    body,
  }).catch(() => {})
}

export function notifyBuy(ticker: string, price: number, reason: string, confidence: string) {
  return push(
    `🟢 BUY ${ticker} @ $${price.toFixed(2)}`,
    `${reason}\nConfidence: ${confidence}\nSell target: $${(price + 10).toFixed(2)}`,
    'high',
    'chart_with_upwards_trend,moneybag',
  )
}

export function notifySell(ticker: string, price: number, buyPrice: number) {
  const profit = (price - buyPrice).toFixed(2)
  return push(
    `🔴 SELL ${ticker} @ $${price.toFixed(2)}`,
    `+$${profit} profit from $${buyPrice.toFixed(2)} buy alert\nTarget reached!`,
    'urgent',
    'rotating_light,money_with_wings',
  )
}
