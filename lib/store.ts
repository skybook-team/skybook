import type { CompletedBooking, PendingBooking } from './data'

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

interface StoredAccount extends User {
  password: string
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem('skybook_user')
  return data ? (JSON.parse(data) as User) : null
}

export function setUser(user: User): void {
  localStorage.setItem('skybook_user', JSON.stringify(user))
}

export function clearUser(): void {
  localStorage.removeItem('skybook_user')
}

export function login(email: string, password: string): User | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(`skybook_account_${email.toLowerCase()}`)
  if (!stored) return null
  const account = JSON.parse(stored) as StoredAccount
  if (account.password !== password) return null
  const user: User = { id: account.id, name: account.name, email: account.email, createdAt: account.createdAt }
  setUser(user)
  return user
}

export function register(name: string, email: string, password: string): User | { error: string } {
  if (typeof window === 'undefined') return { error: 'Not available' }
  const existing = localStorage.getItem(`skybook_account_${email.toLowerCase()}`)
  if (existing) return { error: 'An account with this email already exists.' }
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email,
    createdAt: new Date().toISOString(),
  }
  const account: StoredAccount = { ...user, password }
  localStorage.setItem(`skybook_account_${email.toLowerCase()}`, JSON.stringify(account))
  setUser(user)
  return user
}

export function getPendingBooking(id: string): PendingBooking | null {
  if (typeof window === 'undefined') return null
  const data = localStorage.getItem(`skybook_pending_${id}`)
  return data ? (JSON.parse(data) as PendingBooking) : null
}

export function setPendingBooking(pending: PendingBooking): void {
  localStorage.setItem(`skybook_pending_${pending.id}`, JSON.stringify(pending))
}

export function getBookings(): CompletedBooking[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem('skybook_bookings')
  return data ? (JSON.parse(data) as CompletedBooking[]) : []
}

export function addBooking(booking: CompletedBooking): void {
  const bookings = getBookings()
  bookings.unshift(booking)
  localStorage.setItem('skybook_bookings', JSON.stringify(bookings))
}

export function getBookingById(id: string): CompletedBooking | null {
  return getBookings().find(b => b.id === id) ?? null
}
