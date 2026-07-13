import type { TickerSnapshot } from './fetcher'

export interface Analysis {
  verdict: 'BUY' | 'HOLD'
  reason: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}

export async function analyze(snap: TickerSnapshot): Promise<Analysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return fallback(snap)

  const newsBlock = snap.news.length
    ? snap.news.map((h, i) => `${i + 1}. ${h}`).join('\n')
    : 'No recent news available.'

  const prompt = `You are a short-term stock trading analyst. Analyze ${snap.ticker} and give a BUY or HOLD verdict.

Data:
- Current price: $${snap.price.toFixed(2)}
- Today's change: ${snap.change1d.toFixed(2)}%
- 5-day change: ${snap.change5d.toFixed(2)}%
- RSI(14): ${snap.rsi14.toFixed(1)}
- Trend: ${snap.trend}

Recent news:
${newsBlock}

Respond in exactly this format:
VERDICT: BUY or HOLD
REASON: one sentence
CONFIDENCE: HIGH or MEDIUM or LOW`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) return fallback(snap)
    const data = await res.json()
    const text: string = data.content?.[0]?.text ?? ''

    const verdict = /VERDICT:\s*BUY/i.test(text) ? 'BUY' : 'HOLD'
    const reasonMatch = text.match(/REASON:\s*(.+)/i)
    const reason = reasonMatch?.[1]?.trim() ?? 'Market analysis'
    const confMatch = text.match(/CONFIDENCE:\s*(HIGH|MEDIUM|LOW)/i)
    const confidence = (confMatch?.[1]?.toUpperCase() ?? 'MEDIUM') as Analysis['confidence']

    return { verdict, reason, confidence }
  } catch {
    return fallback(snap)
  }
}

// Rule-based fallback if no API key
function fallback(snap: TickerSnapshot): Analysis {
  const { rsi14, change1d, trend } = snap
  if (rsi14 < 35 && change1d < -2) {
    return { verdict: 'BUY', reason: 'Oversold on RSI with today\'s dip', confidence: 'MEDIUM' }
  }
  if (rsi14 < 40 && trend === 'down' && change1d < 0) {
    return { verdict: 'BUY', reason: 'RSI near oversold, downtrend may be reversing', confidence: 'LOW' }
  }
  return { verdict: 'HOLD', reason: 'No strong buy signal from technicals', confidence: 'MEDIUM' }
}
