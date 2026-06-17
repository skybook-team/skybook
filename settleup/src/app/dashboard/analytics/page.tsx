import { createClient } from '@/lib/supabase-server'
import AnalyticsCharts from '@/components/AnalyticsCharts'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch groups
  const { data: groupMembers } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name)')
    .eq('user_id', user.id)

  const groups = (groupMembers?.map((gm) => gm.groups).filter(Boolean) ?? []) as unknown as {
    id: string
    name: string
  }[]

  const groupIds = groups.map((g) => g.id)

  // Fetch expenses from last 12 months
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  let expenses: { id: string; amount: number; group_id: string; created_at: string }[] = []
  if (groupIds.length > 0) {
    const { data } = await supabase
      .from('expenses')
      .select('id, amount, group_id, created_at')
      .in('group_id', groupIds)
      .gte('created_at', twelveMonthsAgo.toISOString())
      .order('created_at', { ascending: true })
    expenses = data ?? []
  }

  // Monthly spending data
  const monthlyMap: Record<string, number> = {}
  for (const expense of expenses) {
    const date = new Date(expense.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = (monthlyMap[key] ?? 0) + Number(expense.amount)
  }

  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      total: parseFloat(total.toFixed(2)),
    }))

  // Spending by group
  const groupSpendMap: Record<string, { name: string; total: number }> = {}
  for (const group of groups) {
    groupSpendMap[group.id] = { name: group.name, total: 0 }
  }
  for (const expense of expenses) {
    if (groupSpendMap[expense.group_id]) {
      groupSpendMap[expense.group_id].total += Number(expense.amount)
    }
  }

  const groupData = Object.values(groupSpendMap)
    .filter((g) => g.total > 0)
    .map((g) => ({ name: g.name, value: parseFloat(g.total.toFixed(2)) }))

  // Total stats
  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const avgMonthly = monthlyData.length > 0 ? totalSpent / monthlyData.length : 0
  const largestMonth = monthlyData.reduce(
    (max, m) => (m.total > max.total ? m : max),
    { month: 'N/A', total: 0 }
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-gray-400 mt-1">Your spending overview for the last 12 months</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Total spent (12mo)</p>
          <p className="text-2xl font-bold text-white">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Avg per month</p>
          <p className="text-2xl font-bold text-white">${avgMonthly.toFixed(2)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Biggest month</p>
          <p className="text-2xl font-bold text-white">${largestMonth.total.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{largestMonth.month}</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">No expense data yet. Add expenses in your groups to see analytics.</p>
        </div>
      ) : (
        <AnalyticsCharts
          monthlyData={monthlyData}
          groupData={groupData}
          timelineData={monthlyData}
        />
      )}
    </div>
  )
}
