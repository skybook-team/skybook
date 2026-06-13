'use client'

import { useEffect, useRef, useState } from 'react'

interface Props { target: number; label: string; suffix?: string }

export default function BookingCounter({ target, label, suffix = '' }: Props) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const duration = 1800
        const steps = 60
        const inc = target / steps
        let current = 0
        const timer = setInterval(() => {
          current += inc
          if (current >= target) { setCount(target); clearInterval(timer) }
          else setCount(Math.floor(current))
        }, duration / steps)
      }
    }, { threshold: 0.3 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  const formatted = count >= 1000000
    ? (count / 1000000).toFixed(1) + 'M'
    : count >= 1000
    ? (count / 1000).toFixed(0) + 'K'
    : count.toString()

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl font-black text-gray-900 tabular-nums">
        {formatted}{suffix}
      </p>
      <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
    </div>
  )
}
