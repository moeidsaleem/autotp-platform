'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { redirect } from 'next/navigation'
import { BackgroundDecoration } from '@/components/BackgroundDecoration'

export default function AccountListFeature() {
  const { publicKey } = useWallet()

  if (publicKey) {
    return redirect(`/account/${publicKey.toString()}`)
  }

  return (
    <div className="container mx-auto px-4">
      <BackgroundDecoration />
      
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="max-w-md mx-auto p-8 border border-neutral-800 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6">Connect Your Wallet</h2>
          <p className="text-neutral-400 mb-8">
            Connect your Solana wallet to view your account details and transaction history.
          </p>
          <WalletButton />
        </div>
      </div>
    </div>
  )
}
