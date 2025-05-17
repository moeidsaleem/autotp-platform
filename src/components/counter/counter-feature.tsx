'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCounterProgram } from './counter-data-access'
import { CounterCreate, CounterList } from './counter-ui'
import { ellipsify } from '@/lib/utils'
import { BackgroundDecoration } from '@/components/BackgroundDecoration'

export default function CounterFeature() {
  const { publicKey } = useWallet()
  const { programId } = useCounterProgram()

  return (
    <div className="container mx-auto px-4">
      <BackgroundDecoration />
      
      {publicKey ? (
        <div className="py-8">
          <div className="relative mb-12 p-[1px] rounded-lg overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x">
            <div className="absolute inset-0 bg-black bg-opacity-90 backdrop-blur-sm rounded-lg"></div>
            <div className="relative rounded-lg p-6 md:p-8 z-10">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent mb-4">
                Counter Program
              </h1>
              <p className="text-lg text-neutral-300 max-w-2xl mb-6">
                Create a new account by clicking the &quot;Create&quot; button. The state of an account is stored on-chain 
                and can be manipulated by calling the program&apos;s methods (increment, decrement, set, and close).
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm text-neutral-400 bg-black/30 px-3 py-2 rounded border border-white/10">
                  Program ID: <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
                </p>
                <div className="mt-2 md:mt-0">
                  <CounterCreate />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 border border-neutral-800 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg">
            <CounterList />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="max-w-md mx-auto p-8 border border-neutral-800 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6">Connect Your Wallet</h2>
            <p className="text-neutral-400 mb-8">
              Please connect your Solana wallet to interact with the Counter program.
            </p>
            <WalletButton />
          </div>
        </div>
      )}
    </div>
  )
}
