'use client'

import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { AppHeader } from '@/components/app-header'
import React from 'react'
import { AppFooter } from '@/components/app-footer'
import { ClusterChecker } from '@/components/cluster/cluster-ui'
import { AccountChecker } from '@/components/account/account-ui'
import { GridBackground, DotBackground } from './ui/backgrounds'
import { cn } from '@/lib/utils'

export interface AppLayoutProps {
  children: React.ReactNode
  links: { label: string; path: string; icon?: React.ReactNode }[]
  backgroundType?: 'grid' | 'dot' | 'grid-small' | 'none'
  className?: string
}

export function AppLayout({
  children,
  links,
  backgroundType = 'grid',
  className,
}: AppLayoutProps) {
  const renderContent = () => (
    <div className="flex flex-col min-h-screen text-white relative z-10">
      <AppHeader links={links} />
      <main className="flex-grow pt-20">
        <ClusterChecker>
          <AccountChecker />
        </ClusterChecker>
        {children}
      </main>
      {/* <AppFooter /> */}
    </div>
  );

  const renderBackground = () => {
    switch (backgroundType) {
      case 'none':
        return (
          <div className={cn("flex flex-col min-h-screen bg-black text-white", className)}>
            <AppHeader links={links} />
            <main className="flex-grow pt-20">
              <ClusterChecker>
                <AccountChecker />
              </ClusterChecker>
              {children}
            </main>
            {/* <AppFooter /> */}
          </div>
        );
      case 'dot':
        return (
          <DotBackground className={cn("min-h-screen", className)}>
            {renderContent()}
          </DotBackground>
        );
      case 'grid-small':
        return (
          <GridBackground size="small" className={cn("min-h-screen", className)}>
            {renderContent()}
          </GridBackground>
        );
      case 'grid':
      default:
        return (
          <GridBackground className={cn("min-h-screen", className)}>
            {renderContent()}
          </GridBackground>
        );
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {renderBackground()}
      <Toaster position="bottom-right" />
    </ThemeProvider>
  )
}
