'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface Member {
  id: string
  full_name: string | null
  email: string
}

type SplitType = 'equal' | 'percentage' | 'exact'

export default function AddExpensePage() {
  const params = useParams()
  const groupId = params.id as string
  const router = useRouter()
  const supabase = createClient()

  const [members, setMembers] = useState<Member[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [splitType, setSplitType] = useState<SplitType>('equal')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [percentages, setPercentages] = useState<Record<string, string>>({})
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({})
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceInterval, setRecurrenceInterval] = useState<'weekly' | 'monthly'>('monthly')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setCurrentUserId(user.id)
      setPaidBy(user.id)

      const { data: groupMembers } = await supabase
        .from('group_members')
        .select('user_id, profiles(id, full_name, email)')
        .eq('group_id', groupId)

      const profiles = (groupMembers?.map((gm) => gm.profiles).filter(Boolean) ?? []) as unknown as Member[]
      setMembers(profiles)
      setSelectedMembers(profiles?.map((m) => m.id) ?? [])
    }
    loadData()
  }, [groupId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleReceiptUpload = useCallback(async (file: File) => {
    setOcrLoading(true)
    try {
      const Tesseract = (await import('tesseract.js')).default
      const result = await Tesseract.recognize(file, 'eng')
      const text = result.data.text

      // Try to extract a dollar amount from the receipt
      const matches = text.match(/\$?\s*(\d+\.\d{2})/g)
      if (matches && matches.length > 0) {
        // Take the largest amount (likely the total)
        const amounts = matches.map((m) => parseFloat(m.replace(/[$\s]/g, '')))
        const maxAmount = Math.max(...amounts)
        setAmount(maxAmount.toFixed(2))
      }
    } catch (err) {
      console.error('OCR error:', err)
    }
    setOcrLoading(false)
  }, [])

  function toggleMember(memberId: string) {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  function computeSplits(): Record<string, number> | null {
    const total = parseFloat(amount)
    if (isNaN(total) || total <= 0) return null

    if (splitType === 'equal') {
      if (selectedMembers.length === 0) return null
      const each = total / selectedMembers.length
      const result: Record<string, number> = {}
      selectedMembers.forEach((id) => {
        result[id] = parseFloat(each.toFixed(2))
      })
      // Fix rounding
      const splitTotal = Object.values(result).reduce((a, b) => a + b, 0)
      const diff = parseFloat((total - splitTotal).toFixed(2))
      if (diff !== 0 && selectedMembers.length > 0) {
        result[selectedMembers[0]] = parseFloat((result[selectedMembers[0]] + diff).toFixed(2))
      }
      return result
    }

    if (splitType === 'percentage') {
      const result: Record<string, number> = {}
      let totalPct = 0
      for (const id of selectedMembers) {
        const pct = parseFloat(percentages[id] || '0')
        totalPct += pct
        result[id] = parseFloat(((pct / 100) * total).toFixed(2))
      }
      if (Math.abs(totalPct - 100) > 0.01) return null
      return result
    }

    if (splitType === 'exact') {
      const result: Record<string, number> = {}
      let exactTotal = 0
      for (const id of selectedMembers) {
        const amt = parseFloat(exactAmounts[id] || '0')
        exactTotal += amt
        result[id] = amt
      }
      if (Math.abs(exactTotal - total) > 0.01) return null
      return result
    }

    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (selectedMembers.length === 0) {
      setError('Select at least one member to split with')
      return
    }

    const splits = computeSplits()
    if (!splits) {
      setError('Invalid split amounts. Make sure they add up correctly.')
      return
    }

    setLoading(true)

    // Create expense
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        group_id: groupId,
        description,
        amount: parseFloat(amount),
        paid_by: paidBy,
        split_type: splitType,
        is_recurring: isRecurring,
        recurrence_interval: isRecurring ? recurrenceInterval : null,
      })
      .select()
      .single()

    if (expenseError || !expense) {
      setError(expenseError?.message || 'Failed to create expense')
      setLoading(false)
      return
    }

    // Create splits
    const splitInserts = Object.entries(splits).map(([userId, splitAmount]) => ({
      expense_id: expense.id,
      user_id: userId,
      amount: splitAmount,
      is_settled: userId === paidBy,
    }))

    const { error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splitInserts)

    if (splitsError) {
      setError(splitsError.message)
      setLoading(false)
      return
    }

    router.push(`/dashboard/groups/${groupId}`)
    router.refresh()
  }

  const totalAmount = parseFloat(amount) || 0
  const equalShare = selectedMembers.length > 0 ? totalAmount / selectedMembers.length : 0

  const percentageTotal = selectedMembers.reduce(
    (sum, id) => sum + parseFloat(percentages[id] || '0'),
    0
  )

  const exactTotal = selectedMembers.reduce(
    (sum, id) => sum + parseFloat(exactAmounts[id] || '0'),
    0
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <Link href="/dashboard/groups" className="hover:text-white transition-colors">
            Groups
          </Link>
          <span>/</span>
          <Link href={`/dashboard/groups/${groupId}`} className="hover:text-white transition-colors">
            Group
          </Link>
          <span>/</span>
          <span className="text-white">Add Expense</span>
        </div>
        <h1 className="text-3xl font-bold">Add Expense</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Details</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="e.g. Dinner at La Mesa"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Amount *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Paid by *
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-500 transition-colors"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name || m.email}{m.id === currentUserId ? ' (you)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Receipt Upload */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Receipt (optional)</h2>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setReceiptFile(file)
                  handleReceiptUpload(file)
                }
              }}
              className="hidden"
              id="receipt-upload"
            />
            <label htmlFor="receipt-upload" className="cursor-pointer">
              <svg className="w-10 h-10 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {ocrLoading ? (
                <p className="text-gray-400 text-sm">Scanning receipt...</p>
              ) : receiptFile ? (
                <p className="text-green-400 text-sm">
                  {receiptFile.name} — amount extracted!
                </p>
              ) : (
                <>
                  <p className="text-gray-400 text-sm">Upload receipt image</p>
                  <p className="text-gray-600 text-xs mt-1">
                    We will automatically extract the amount
                  </p>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Split Type */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Split</h2>

          {/* Split type selector */}
          <div className="flex rounded-lg bg-gray-800 p-1">
            {(['equal', 'percentage', 'exact'] as SplitType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSplitType(type)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                  splitType === type
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Members */}
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Split between:</p>
            {members.map((member) => {
              const isSelected = selectedMembers.includes(member.id)
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 bg-gray-800 rounded-lg p-3"
                >
                  <button
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.full_name || member.email}
                      {member.id === currentUserId ? ' (you)' : ''}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      {splitType === 'equal' && (
                        <span className="text-sm text-gray-400">
                          ${equalShare.toFixed(2)}
                        </span>
                      )}
                      {splitType === 'percentage' && (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={percentages[member.id] || ''}
                            onChange={(e) =>
                              setPercentages((prev) => ({
                                ...prev,
                                [member.id]: e.target.value,
                              }))
                            }
                            placeholder="0"
                            min="0"
                            max="100"
                            className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-green-500"
                          />
                          <span className="text-gray-400 text-sm">%</span>
                        </div>
                      )}
                      {splitType === 'exact' && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-400 text-sm">$</span>
                          <input
                            type="number"
                            value={exactAmounts[member.id] || ''}
                            onChange={(e) =>
                              setExactAmounts((prev) => ({
                                ...prev,
                                [member.id]: e.target.value,
                              }))
                            }
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-green-500"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {splitType === 'percentage' && (
              <p className={`text-sm ${Math.abs(percentageTotal - 100) < 0.01 ? 'text-green-400' : 'text-red-400'}`}>
                Total: {percentageTotal.toFixed(1)}% {Math.abs(percentageTotal - 100) < 0.01 ? '✓' : '(must equal 100%)'}
              </p>
            )}
            {splitType === 'exact' && totalAmount > 0 && (
              <p className={`text-sm ${Math.abs(exactTotal - totalAmount) < 0.01 ? 'text-green-400' : 'text-red-400'}`}>
                Total: ${exactTotal.toFixed(2)} / ${totalAmount.toFixed(2)}{' '}
                {Math.abs(exactTotal - totalAmount) < 0.01 ? '✓' : '(must match)'}
              </p>
            )}
          </div>
        </div>

        {/* Recurring */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">Recurring</h2>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                isRecurring ? 'bg-green-500' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  isRecurring ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </button>
            <label className="text-sm font-medium">
              This is a recurring expense
            </label>
          </div>

          {isRecurring && (
            <div className="flex gap-3">
              {(['weekly', 'monthly'] as const).map((interval) => (
                <button
                  key={interval}
                  type="button"
                  onClick={() => setRecurrenceInterval(interval)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    recurrenceInterval === interval
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-gray-800 text-gray-400 border border-gray-700 hover:text-white'
                  }`}
                >
                  {interval}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Link
            href={`/dashboard/groups/${groupId}`}
            className="flex-1 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white py-3 rounded-xl transition-colors text-center font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Adding...' : 'Add expense'}
          </button>
        </div>
      </form>
    </div>
  )
}
