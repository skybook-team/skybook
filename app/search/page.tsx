import SearchResults from '@/app/_components/SearchResults'
import SearchForm from '@/app/_components/SearchForm'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const { from, to, date, returnDate, passengers, cabinClass, tripType } = params

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact search bar */}
      <div className="bg-white border-b border-gray-200 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchForm
            compact
            defaultValues={{ from, to, date, returnDate, passengers: Number(passengers) || 1, cabinClass, tripType }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SearchResults
          from={from || ''}
          to={to || ''}
          date={date || ''}
          returnDate={returnDate}
          passengers={Number(passengers) || 1}
          cabinClass={(cabinClass as 'economy' | 'business' | 'first') || 'economy'}
          tripType={(tripType as 'oneWay' | 'roundTrip') || 'oneWay'}
        />
      </div>
    </div>
  )
}
