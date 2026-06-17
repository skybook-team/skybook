import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SettleUp - Split expenses, not friendships',
  description: 'Track shared expenses with friends and groups',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark h-full">
      <body
        className={`${inter.className} h-full bg-gray-950 text-gray-100 antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
