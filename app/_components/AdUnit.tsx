'use client'
import { useEffect } from 'react'

const PUBLISHER_ID = 'ca-pub-6813946412691851'

export default function AdUnit({ slot, format = 'auto' }: { slot: string; format?: string }) {
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle.push({})
    } catch {}
  }, [])

  if (PUBLISHER_ID === 'ca-pub-XXXXXXXXXXXXXXXXX') return null

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={PUBLISHER_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
