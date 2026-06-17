import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch groups user is in
  const { data: groupMembers } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, description)')
    .eq('user_id', user.id)

  const groups = (groupMembers?.map((gm) => gm.groups).filter(Boolean) ?? []) as unknown as {
    id: string
    name: string
    description: string | null
  }[]

  // Fetch all expense splits for the user
  const { data: mySplits } = await supabase
    .from('expense_splits')
    .select('amount, is_settled, expenses(paid_by, group_id)')
    .eq('user_id', user.id)
    .eq('is_settled', false)

  // Fetch expenses paid by user that others owe
  const { data: paidExpenses } = await supabase
    .from('expenses')
    .select('id, amount, group_id')
    .eq('paid_by', user.id)

  // Calculate total owed to user
  let totalOwedToMe = 0
  if (paidExpenses && paidExpenses.length > 0) {
    const expenseIds = paidExpenses.map((e) => e.id)
    const { data: othersOwe } = await supabase
      .from('expense_splits')
      .select('amount, is_settled')
      .in('expense_id', expenseIds)
      .neq('user_id', user.id)
      .eq('is_settled', false)

    totalOwedToMe = othersOwe?.reduce((sum, s) => sum + (s.amount || 0), 0) ?? 0
  }

  // Calculate what I owe
  const totalIOwe = mySplits
    ?.filter((s) => (s.expenses as unknown as { paid_by: string } | null)?.paid_by !== user.id)
    .reduce((sum, s) => sum + (s.amount || 0), 0) ?? 0

  const netBalance = totalOwedToMe - totalIOwe

  // Recent expenses
  const groupIds = groups.map((g) => g.id)
  let recentExpenses: { id: string; description: string; amount: number; created_at: string; groups: { name: string } | null; profiles: { full_name: string | null; email: string } | null }[] = []
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from('expenses')
      .select('id, description, amount, created_at, groups(name), profiles!expenses_paid_by_fkey(full_name, email)')
      .in('group_id', groupIds)
      .order('created_at', { ascending: false })
      .limit(5)
    recentExpenses = (data as unknown as typeof recentExpenses) ?? []
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">Your expense overview</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Net Balance</p>
          <p
            className={`text-2xl font-bold ${
              netBalance >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {netBalance >= 0 ? '+' : ''}${Math.abs(netBalance).toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {netBalance >= 0 ? 'You are owed overall' : 'You owe overall'}
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">You are owed</p>
          <p className="text-2xl font-bold text-green-400">
            ${totalOwedToMe.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">from friends</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">You owe</p>
          <p className="text-2xl font-bold text-red-400">
            ${totalIOwe.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">to friends</p>
        </div>
      </div>

      {/* Groups Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Groups</h2>
          <Link
            href="/dashboard/groups"
            className="text-green-400 hover:text-green-300 text-sm transition-colors"
          >
            View all
          </Link>
        </div>
        {groups.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">No groups yet</p>
            <Link
              href="/dashboard/groups"
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Create your first group
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {groups.slice(0, 4).map((group) => (
              <Link
                key={group.id}
                href={`/dashboard/groups/${group.id}`}
                className="bg-gray-900 border border-gray-800 hover:border-green-500/30 rounded-xl p-5 transition-colors block"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-semibold">
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{group.name}</p>
                    {group.description && (
                      <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {recentExpenses.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center text-gray-400">
            No expenses yet. Add one in a group!
          </div>
        ) : (
          <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{expense.description}</p>
                  <p className="text-sm text-gray-400">
                    {expense.groups?.name} •{' '}
                    {expense.profiles?.full_name || expense.profiles?.email} paid •{' '}
                    {new Date(expense.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-green-400 font-semibold">
                  ${Number(expense.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
