'use client'

import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { ExplorerLink } from '../cluster/cluster-ui'
import { AccountBalance, AccountButtons, AccountTokens, AccountTransactions } from './account-ui'
import { ellipsify } from '@/lib/utils'
import { BackgroundDecoration } from '@/components/BackgroundDecoration'

export default function AccountDetailFeature() {
  const params = useParams()
  const address = useMemo(() => {
    if (!params.address) {
      return
    }
    try {
      return new PublicKey(params.address)
    } catch (e) {
      console.log(`Invalid public key`, e)
    }
  }, [params])

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="p-6 border border-red-800 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Account</h2>
          <p className="text-neutral-300">
            The provided address is invalid or could not be loaded. Please check the address and try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      <BackgroundDecoration />
      
      <div className="py-8">
        <div className="relative mb-12 p-[1px] rounded-lg overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x">
          <div className="absolute inset-0 bg-black bg-opacity-90 backdrop-blur-sm rounded-lg"></div>
          <div className="relative rounded-lg p-6 md:p-8 z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent mb-4">
                  <AccountBalance address={address} />
                </h1>
                <div className="text-sm text-neutral-400 bg-black/30 px-3 py-2 rounded border border-white/10 mb-6 md:mb-0">
                  <ExplorerLink path={`account/${address}`} label={ellipsify(address.toString())} />
                </div>
              </div>
              <div>
                <AccountButtons address={address} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-8">
          <div className="p-6 border border-neutral-800 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-white">Token Holdings</h2>
            <AccountTokens address={address} />
          </div>
          
          <div className="p-6 border border-neutral-800 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-white">Transaction History</h2>
            <AccountTransactions address={address} />
          </div>
        </div>
      </div>
    </div>
  )
}
