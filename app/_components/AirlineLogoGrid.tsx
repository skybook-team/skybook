'use client'

const G = (code: string) => `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`

const AIRLINES_SHOWN = [
  { name: 'American',  logo: G('AA'), tagline: 'Nationwide coverage'   },
  { name: 'Delta',     logo: G('DL'), tagline: 'Premium experience'    },
  { name: 'United',    logo: G('UA'), tagline: 'Global network'        },
  { name: 'JetBlue',   logo: G('B6'), tagline: 'Free wi-fi & snacks'   },
  { name: 'Alaska',    logo: G('AS'), tagline: 'West coast specialist' },
  { name: 'Southwest', logo: G('WN'), tagline: '2 free checked bags'   },
]

export default function AirlineLogoGrid() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
      {AIRLINES_SHOWN.map(a => (
        <div key={a.name} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden group-hover:border-blue-200 transition-colors">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={a.logo} alt={a.name} className="w-9 h-9 object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          </div>
          <p className="text-xs font-semibold text-gray-600">{a.name}</p>
          <p className="text-xs text-gray-400 text-center leading-tight hidden sm:block">{a.tagline}</p>
        </div>
      ))}
    </div>
  )
}
