'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

interface SettleUpButtonProps {
  groupId: string
  userId: string
  debts: { toUserId: string; toUserName: string; amount: number }[]
}

export default function SettleUpButton({ groupId, userId, debts }: SettleUpButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  if (debts.length === 0) return null

  async function handleSettle(toUserId: string, amount: number) {
    setLoading(true)
    setError(null)

    // Mark relevant splits as settled
    const { data: expenses } = await supabase
      .from('expenses')
      .select('id')
      .eq('group_id', groupId)
      .eq('paid_by', toUserId)

    if (expenses && expenses.length > 0) {
      await supabase
        .from('expense_splits')
        .update({ is_settled: true, settled_at: new Date().toISOString() })
        .in('expense_id', expenses.map((e) => e.id))
        .eq('user_id', userId)
        .eq('is_settled', false)
    }

    // Record settlement
    await supabase.from('settlements').insert({
      group_id: groupId,
      paid_by: userId,
      paid_to: toUserId,
      amount,
    })

    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
      >
        Settle Up
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Settle up</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <p className="text-gray-400 text-sm mb-4">
              Mark the following debts as settled:
            </p>

            <div className="space-y-3">
              {debts.map((debt) => (
                <div
                  key={debt.toUserId}
                  className="flex items-center justify-between bg-gray-800 rounded-lg p-4"
                >
                  <div>
                    <p className="font-medium text-sm">{debt.toUserName}</p>
                    <p className="text-red-400 font-semibold">${debt.amount.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleSettle(debt.toUserId, debt.amount)}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    {loading ? '...' : 'Settle'}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-full mt-4 border border-gray-700 text-gray-300 hover:text-white py-2.5 rounded-lg transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
