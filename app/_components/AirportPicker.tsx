'use client'

import { useState, useRef, useEffect } from 'react'
import { AIRPORTS, type Airport } from '@/lib/data'

interface AirportPickerProps {
  value: string
  onChange: (code: string) => void
  placeholder?: string
  excludeCode?: string
  label: string
  dark?: boolean
}

const POPULAR_CODES = ['ATL','ORD','LAX','DFW','DEN','JFK','SFO','SEA','BNA','MIA','LAS','BOS','PHX','LGA']
const US_AIRPORTS   = AIRPORTS.filter(a => a.country === 'US')
const DEFAULT_US    = US_AIRPORTS.filter(a => POPULAR_CODES.includes(a.code))

export default function AirportPicker({ value, onChange, placeholder = 'City or airport code', excludeCode, label, dark }: AirportPickerProps) {
  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const inputRef            = useRef<HTMLInputElement>(null)
  const containerRef        = useRef<HTMLDivElement>(null)

  const selected = US_AIRPORTS.find(a => a.code === value)

  const filtered = query.length >= 1
    ? US_AIRPORTS
        .filter(a => a.code !== excludeCode)
        .filter(a =>
          a.code.toLowerCase().includes(query.toLowerCase()) ||
          a.city.toLowerCase().includes(query.toLowerCase()) ||
          a.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 9)
    : DEFAULT_US.filter(a => a.code !== excludeCode).slice(0, 8)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleFocus() {
    setOpen(true)
    setQuery('')
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    if (val) onChange('')
  }

  function handleSelect(airport: Airport) {
    onChange(airport.code)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const displayValue = open ? query : (selected ? `${selected.code} – ${selected.city}` : query)
  const labelClass   = dark ? 'block text-xs font-semibold mb-1 text-white/80' : 'block text-xs font-semibold mb-1 text-gray-600'

  return (
    <div ref={containerRef} className="relative">
      <label className={labelClass}>{label}</label>
      <div
        className={`flex items-center border rounded-lg px-3 py-2.5 bg-white cursor-text transition-shadow ${open ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-300 hover:border-gray-400'}`}
        onClick={() => inputRef.current?.focus()}
      >
        <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full text-sm outline-none text-gray-900 placeholder-gray-400 min-w-0 bg-transparent"
        />
        {selected && !open && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-1 shrink-0 w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-500 text-xs font-bold transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-[200] overflow-hidden">
          {!query && (
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-4 pt-3 pb-1.5">
              Popular US Airports
            </p>
          )}
          {filtered.length > 0 ? (
            filtered.map(airport => (
              <button
                key={airport.code}
                type="button"
                onMouseDown={() => handleSelect(airport)}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors flex items-center gap-3"
              >
                <span className="font-black text-blue-700 text-sm w-10 shrink-0 tabular-nums">{airport.code}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{airport.city}</p>
                  <p className="text-xs text-gray-400 truncate">{airport.name}</p>
                </div>
              </button>
            ))
          ) : query.length >= 2 ? (
            <div className="px-4 py-5 text-center text-sm text-gray-400">
              No airports found for &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
