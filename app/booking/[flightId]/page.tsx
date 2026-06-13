import BookingFlow from '@/app/_components/BookingFlow'

export default async function BookingPage({
  params,
}: {
  params: Promise<{ flightId: string }>
}) {
  const { flightId } = await params
  return <BookingFlow flightId={flightId} />
}
