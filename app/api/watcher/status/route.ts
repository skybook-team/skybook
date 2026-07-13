import { NextResponse } from 'next/server'
import { getAll } from '@/watcher/store'

export async function GET() {
  return NextResponse.json({ entries: getAll() })
}
