// All indicators operate on an array of closing prices, newest-last.

export function rsi(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50
  const changes = closes.slice(1).map((c, i) => c - closes[i])
  const recent = changes.slice(-period)
  const gains = recent.filter(c => c > 0).reduce((s, c) => s + c, 0) / period
  const losses = recent.filter(c => c < 0).reduce((s, c) => s - c, 0) / period
  if (losses === 0) return 100
  const rs = gains / losses
  return 100 - 100 / (1 + rs)
}

export function ema(closes: number[], period: number): number[] {
  if (closes.length < period) return []
  const k = 2 / (period + 1)
  const result: number[] = []
  let val = closes.slice(0, period).reduce((s, c) => s + c, 0) / period
  result.push(val)
  for (let i = period; i < closes.length; i++) {
    val = closes[i] * k + val * (1 - k)
    result.push(val)
  }
  return result
}

export function high20(closes: number[]): number {
  return Math.max(...closes.slice(-20))
}

export function low20(closes: number[]): number {
  return Math.min(...closes.slice(-20))
}

// Returns 0–1: how far current IV is within its 52-week range.
// Approximated from the sample of IVs we collect during option chain scan.
export function ivRank(currentIV: number, historicalIVs: number[]): number {
  if (!historicalIVs.length) return 0.5
  const min = Math.min(...historicalIVs)
  const max = Math.max(...historicalIVs)
  if (max === min) return 0.5
  return (currentIV - min) / (max - min)
}
