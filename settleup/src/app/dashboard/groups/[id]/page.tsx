import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import SettleUpButton from '@/components/SettleUpButton'

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch group
  const { data: group } = await supabase
    .from('groups')
    .select('id, name, description, created_by')
    .eq('id', id)
    .single()

  if (!group) return notFound()

  // Check membership
  const { data: membership } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) return notFound()

  // Fetch members
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, profiles(id, full_name, email)')
    .eq('group_id', id)

  const memberProfiles = (members?.map((m) => m.profiles).filter(Boolean) ?? []) as unknown as {
    id: string
    full_name: string | null
    email: string
  }[]

  // Fetch expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('id, description, amount, split_type, is_recurring, recurrence_interval, created_at, paid_by, profiles!expenses_paid_by_fkey(full_name, email)')
    .eq('group_id', id)
    .order('created_at', { ascending: false })

  // Calculate balances
  // For each member pair, compute net amount owed
  const balanceMap: Record<string, Record<string, number>> = {}
  // balanceMap[owerId][owedId] = amount

  if (expenses && expenses.length > 0) {
    for (const expense of expenses) {
      const { data: splits } = await supabase
        .from('expense_splits')
        .select('user_id, amount, is_settled')
        .eq('expense_id', expense.id)

      if (!splits) continue

      for (const split of splits) {
        if (split.is_settled) continue
        if (split.user_id === expense.paid_by) continue

        const ower = split.user_id
        const owed = expense.paid_by

        if (!balanceMap[ower]) balanceMap[ower] = {}
        if (!balanceMap[ower][owed]) balanceMap[ower][owed] = 0
        balanceMap[ower][owed] += split.amount
      }
    }
  }

  // Debts the current user owes
  const myDebts: { toUserId: string; toUserName: string; amount: number }[] = []
  if (balanceMap[user.id]) {
    for (const [toId, amount] of Object.entries(balanceMap[user.id])) {
      const profile = memberProfiles.find((m) => m.id === toId)
      if (amount > 0.01) {
        myDebts.push({
          toUserId: toId,
          toUserName: profile?.full_name || profile?.email || toId,
          amount,
        })
      }
    }
  }

  // All balances for display
  const allBalances: { from: string; fromName: string; to: string; toName: string; amount: number }[] = []
  for (const [owerId, owedMap] of Object.entries(balanceMap)) {
    for (const [owedId, amount] of Object.entries(owedMap)) {
      if (amount > 0.01) {
        const from = memberProfiles.find((m) => m.id === owerId)
        const to = memberProfiles.find((m) => m.id === owedId)
        allBalances.push({
          from: owerId,
          fromName: from?.full_name || from?.email || owerId,
          to: owedId,
          toName: to?.full_name || to?.email || owedId,
          amount,
        })
      }
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/dashboard/groups" className="hover:text-white transition-colors">
              Groups
            </Link>
            <span>/</span>
            <span className="text-white">{group.name}</span>
          </div>
          <h1 className="text-3xl font-bold">{group.name}</h1>
          {group.description && (
            <p className="text-gray-400 mt-1">{group.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <SettleUpButton
            groupId={id}
            userId={user.id}
            debts={myDebts}
          />
          <Link
            href={`/dashboard/groups/${id}/add-expense`}
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Expense
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Members */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold mb-4">Members ({memberProfiles.length})</h2>
          <div className="space-y-3">
            {memberProfiles.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium">
                    {(member.full_name || member.email).charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  {member.full_name && (
                    <p className="text-sm font-medium truncate">{member.full_name}</p>
                  )}
                  <p className="text-xs text-gray-400 truncate">{member.email}</p>
                </div>
                {member.id === user.id && (
                  <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5 ml-auto flex-shrink-0">
                    you
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Balances */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-semibold mb-4">Balances</h2>
          {allBalances.length === 0 ? (
            <p className="text-gray-400 text-sm">All settled up!</p>
          ) : (
            <div className="space-y-3">
              {allBalances.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className={b.from === user.id ? 'text-red-400 font-medium' : 'text-gray-300'}>
                      {b.from === user.id ? 'You' : b.fromName}
                    </span>
                    <span className="text-gray-500">owe</span>
                    <span className={b.to === user.id ? 'text-green-400 font-medium' : 'text-gray-300'}>
                      {b.to === user.id ? 'you' : b.toName}
                    </span>
                  </div>
                  <span className="font-semibold text-orange-400">
                    ${b.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expenses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Expenses</h2>
        {!expenses || expenses.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">No expenses yet</p>
            <Link
              href={`/dashboard/groups/${id}/add-expense`}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Add first expense
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
            {expenses.map((expense) => {
              const payer = expense.profiles as unknown as { full_name: string | null; email: string } | null
              return (
                <div key={expense.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{expense.description}</p>
                        {expense.is_recurring && (
                          <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-2 py-0.5">
                            {expense.recurrence_interval}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {expense.paid_by === user.id
                          ? 'You paid'
                          : `${payer?.full_name || payer?.email} paid`}{' '}
                        • {expense.split_type} split •{' '}
                        {new Date(expense.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-white">
                    ${Number(expense.amount).toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
