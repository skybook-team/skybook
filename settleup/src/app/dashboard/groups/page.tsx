import { createClient } from '@/lib/supabase-server'
import Link from 'next/link'
import CreateGroupModal from '@/components/CreateGroupModal'

export default async function GroupsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: groupMembers } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, description, created_at, created_by)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })

  const groups = (groupMembers?.map((gm) => gm.groups).filter(Boolean) ?? []) as unknown as {
    id: string
    name: string
    description: string | null
    created_at: string
    created_by: string
  }[]

  // Get member counts per group
  const groupIds = groups.map((g) => g.id)
  const memberCountMap: Record<string, number> = {}

  if (groupIds.length > 0) {
    for (const groupId of groupIds) {
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId)
      memberCountMap[groupId] = count ?? 0
    }
  }

  // Get balances per group (simplified: unsettled splits)
  const balanceMap: Record<string, number> = {}
  if (groupIds.length > 0) {
    for (const groupId of groupIds) {
      // What user owes in this group
      const { data: iOwe } = await supabase
        .from('expense_splits')
        .select('amount, expenses!inner(paid_by, group_id)')
        .eq('user_id', user.id)
        .eq('is_settled', false)
        .eq('expenses.group_id', groupId)
        .neq('expenses.paid_by', user.id)

      // What others owe user in this group
      const { data: groupExpenses } = await supabase
        .from('expenses')
        .select('id')
        .eq('group_id', groupId)
        .eq('paid_by', user.id)

      let owedToMe = 0
      if (groupExpenses && groupExpenses.length > 0) {
        const { data: owedSplits } = await supabase
          .from('expense_splits')
          .select('amount')
          .in('expense_id', groupExpenses.map((e) => e.id))
          .neq('user_id', user.id)
          .eq('is_settled', false)
        owedToMe = owedSplits?.reduce((s, x) => s + x.amount, 0) ?? 0
      }

      const iOweTotal = iOwe?.reduce((s, x) => s + x.amount, 0) ?? 0
      balanceMap[groupId] = owedToMe - iOweTotal
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-gray-400 mt-1">Manage your expense groups</p>
        </div>
        <CreateGroupModal userId={user.id} />
      </div>

      {groups.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
          <p className="text-gray-400 mb-6 max-w-sm mx-auto">
            Create a group to start tracking shared expenses with friends, roommates, or travel buddies.
          </p>
          <CreateGroupModal userId={user.id} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {groups.map((group) => {
            const balance = balanceMap[group.id] ?? 0
            const memberCount = memberCountMap[group.id] ?? 0
            return (
              <Link
                key={group.id}
                href={`/dashboard/groups/${group.id}`}
                className="bg-gray-900 border border-gray-800 hover:border-green-500/30 rounded-xl p-5 transition-colors block"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-green-400 font-bold text-lg">
                        {group.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{group.name}</p>
                      {group.description && (
                        <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">
                          {group.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {memberCount} member{memberCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p
                      className={`font-semibold ${
                        balance > 0
                          ? 'text-green-400'
                          : balance < 0
                          ? 'text-red-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {balance > 0
                        ? `+$${balance.toFixed(2)}`
                        : balance < 0
                        ? `-$${Math.abs(balance).toFixed(2)}`
                        : 'Settled'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {balance > 0
                        ? 'owed to you'
                        : balance < 0
                        ? 'you owe'
                        : ''}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
