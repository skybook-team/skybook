import Confirmation from '@/app/_components/Confirmation'

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const { bookingId } = await params
  return <Confirmation bookingId={bookingId} />
}
