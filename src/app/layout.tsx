import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { AppLayout } from '@/components/app-layout'
import React from 'react'
import { Home, Rocket, User, GitMerge } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AutoTP - Automated Take Profit',
  description: 'Solana program for automated take profit orders',
}

const links: { label: string; path: string; icon?: React.ReactNode }[] = [
  { label: 'Home', path: '/', icon: <Home size={16} /> },
  { label: 'AutoTP', path: '/autotp', icon: <Rocket size={16} /> },
  { label: 'Account', path: '/account', icon: <User size={16} /> },
  { label: 'Counter Demo', path: '/counter', icon: <GitMerge size={16} /> },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <AppProviders>
          <AppLayout links={links}>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  )
}
// Patch BigInt so we can log it using JSON.stringify without any errors
declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
