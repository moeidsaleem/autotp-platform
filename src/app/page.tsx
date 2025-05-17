'use client'

import { BackgroundDecoration } from '@/components/BackgroundDecoration'
// import { ConnectButton } from '@/components/ConnectButton'
import { DevModeProvider } from '@/components/DevModeToggle'
import { FeatureCarousel } from '@/components/FeatureCarousel'
import { OrdersTable } from '@/components/OrdersTable'
import { ReferralLinkCreator } from '@/components/ReferralLinkCreator'
import { Snackbar } from '@/components/Snackbar'
import { StatusLine } from '@/components/StatusLine'
import { TakeProfitCard } from '@/components/TakeProfitCard'
import { useState, useEffect } from 'react'

export default function Home() {
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  // Use this to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOrderArmed = (message: string) => {
    setSnackbarMessage(message);
  };

  if (!mounted) {
    return null; // Prevents hydration mismatch
  }

  return (
    <DevModeProvider>
      <div className="min-h-screen w-full bg-transparent text-neutral-50 relative overflow-x-hidden">
        <BackgroundDecoration />
        
        <main className="container mx-auto px-4 sm:px-6 pb-24 transition-all duration-300">
       
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start pt-4 sm:pt-8" id="create-order">
            {/* Left column - Hero Text and Feature Carousel */}
            <div className="space-y-4 sm:space-y-6 md:col-span-4 md:mt-6 lg:mt-12 transform transition-all duration-500 ease-out">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent mb-2 sm:mb-4">
                Lock In Gains.<br />
                Sleep Easy.
              </h2>
              <p className="text-lg md:text-xl text-neutral-400 max-w-md">
                Automate your exits before it&apos;s too late.
              </p>
              <div className="pt-2">
                <FeatureCarousel />
              </div>
            </div>

            {/* Take Profit Card */}
            <div className="md:col-span-4 transform transition-all duration-500 delay-100 ease-out">
              <TakeProfitCard onOrderArmed={handleOrderArmed} />
            </div>

            {/* History and Referral */}
            <div className="space-y-4 sm:space-y-6 md:col-span-4 transform transition-all duration-500 delay-200 ease-out">
              <OrdersTable />
              <ReferralLinkCreator />
            </div>
          </div>
        </main>

        <div className="fixed bottom-0 left-0 w-full z-20">
          <StatusLine />
        </div>

        <Snackbar message={snackbarMessage} />
      </div>
    </DevModeProvider>
  )
}
