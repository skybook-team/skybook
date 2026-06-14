'use client'

import { useState, useEffect } from 'react'

const BOOKINGS = [
  { name: 'James R.',  from: 'Chicago',       to: 'Miami',         price: 187, ago: 2  },
  { name: 'Sarah M.',  from: 'New York',       to: 'Los Angeles',   price: 243, ago: 4  },
  { name: 'David K.',  from: 'Atlanta',        to: 'Denver',        price: 119, ago: 1  },
  { name: 'Priya S.',  from: 'San Francisco',  to: 'New York',      price: 268, ago: 6  },
  { name: 'Marcus T.', from: 'Los Angeles',    to: 'Boston',        price: 211, ago: 3  },
  { name: 'Emily W.',  from: 'Dallas',         to: 'Seattle',       price: 139, ago: 5  },
  { name: 'Carlos D.', from: 'Houston',        to: 'Las Vegas',     price: 98,  ago: 2  },
  { name: 'Rachel N.', from: 'Boston',         to: 'Miami',         price: 157, ago: 8  },
  { name: 'Tyler H.',  from: 'Phoenix',        to: 'Chicago',       price: 129, ago: 3  },
  { name: 'Anita P.',  from: 'Seattle',        to: 'San Francisco', price: 89,  ago: 1  },
  { name: 'Brian F.',  from: 'Denver',         to: 'Orlando',       price: 148, ago: 7  },
  { name: 'Mei L.',    from: 'New York',       to: 'Chicago',       price: 103, ago: 4  },
  { name: 'Nathan A.', from: 'Miami',          to: 'New York',      price: 176, ago: 2  },
  { name: 'Jasmine C.',from: 'Los Angeles',    to: 'Las Vegas',     price: 74,  ago: 1  },
  { name: 'Omar S.',   from: 'Dallas',         to: 'Miami',         price: 116, ago: 9  },
]

export default function RecentBookingToast() {
  const [visible, setVisible]   = useState(false)
  const [current, setCurrent]   = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return

    // Show first popup after 6 seconds
    const first = setTimeout(() => {
      setVisible(true)
      // Auto-hide after 5 seconds
      setTimeout(() => setVisible(false), 5000)
    }, 6000)

    return () => clearTimeout(first)
  }, [dismissed])

  useEffect(() => {
    if (dismissed) return
    // Cycle to next booking every 22 seconds after the first show
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % BOOKINGS.length)
      setVisible(true)
      setTimeout(() => setVisible(false), 5000)
    }, 22000)

    return () => clearInterval(interval)
  }, [dismissed])

  const booking = BOOKINGS[current]

  if (dismissed || !visible) return null

  return (
    <div
      className="fixed bottom-6 left-4 z-50 max-w-xs w-full animate-slide-up"
      style={{ animation: 'slideUp 0.3s ease-out' }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
          {booking.name.charAt(0)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-snug">
            {booking.name} from {booking.from}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            just booked a flight to <span className="font-semibold text-gray-700">{booking.to}</span> for{' '}
            <span className="font-black text-blue-600">${booking.price}</span>
          </p>
          <p className="text-[10px] text-gray-400 mt-1">{booking.ago} min ago · via SkyBook Fare</p>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => { setVisible(false); setDismissed(true) }}
          className="text-gray-300 hover:text-gray-500 shrink-0 -mt-0.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
