import { AppLayout } from '@/components/app-layout'
import React from 'react'

const links: { label: string; path: string; icon?: React.ReactNode }[] = [
  { label: 'Home', path: '/' },
  { label: 'Backgrounds Demo', path: '/backgrounds' },
]

export default function BackgroundsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout 
      links={links}
      backgroundType="none"
      className="bg-black"
    >
      {children}
    </AppLayout>
  )
} 