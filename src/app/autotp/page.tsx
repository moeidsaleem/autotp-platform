'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useAutoTPProgram } from '@/lib/solana'
import { initializeVault, fetchVaultByOwner } from '@/lib/autotp'
import { WalletButton } from '@/components/solana/solana-provider'
import BN from 'bn.js'
import { Vault } from '@/idl'
import { BackgroundDecoration } from '@/components/BackgroundDecoration'
import { ExternalLink, Check, AlertTriangle } from 'lucide-react'

// Define a type for the vault data structure
interface VaultData {
  pubkey: PublicKey;
  account: Vault;
}

export default function AutoTPPage() {
  const wallet = useWallet()
  const program = useAutoTPProgram()
  const [targetPrice, setTargetPrice] = useState<string>('0')
  const [tokenMint, setTokenMint] = useState<string>('')
  const [referrer, setReferrer] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [statusType, setStatusType] = useState<'success' | 'error' | 'info' | ''>('')
  const [vault, setVault] = useState<VaultData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isConnected = !!wallet.publicKey
  
  const handleInitializeVault = async () => {
    if (!program || !wallet.publicKey) return
    
    try {
      setIsLoading(true)
      setStatus('Initializing vault...')
      setStatusType('info')
      
      // Validate and parse inputs
      const targetPriceNumber = parseInt(targetPrice)
      if (isNaN(targetPriceNumber)) {
        setStatus('Error: Invalid target price')
        setStatusType('error')
        setIsLoading(false)
        return
      }
      
      const tokenMintPubkey = new PublicKey(tokenMint)
      const referrerPubkey = referrer ? new PublicKey(referrer) : PublicKey.default
      
      // Initialize the vault
      const result = await initializeVault(
        program,
        wallet.publicKey,
        tokenMintPubkey,
        targetPriceNumber,
        referrerPubkey
      )
      
      setStatus(`Vault initialized! Transaction: ${result.tx.substring(0, 8)}...`)
      setStatusType('success')
      
      // Auto-fetch the new vault
      await fetchVault()
    } catch (error) {
      console.error('Error initializing vault:', error)
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setStatusType('error')
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchVault = async () => {
    if (!program || !wallet.publicKey) return
    
    try {
      setIsLoading(true)
      setStatus('Fetching vault...')
      setStatusType('info')
      
      const vaultData = await fetchVaultByOwner(program, wallet.publicKey)
      
      if (vaultData) {
        setVault(vaultData)
        setStatus('Vault fetched successfully!')
        setStatusType('success')
      } else {
        setStatus('No vault found for this owner')
        setStatusType('info')
      }
    } catch (error) {
      console.error('Error fetching vault:', error)
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
      setStatusType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-transparent text-neutral-50 relative overflow-x-hidden">
      <BackgroundDecoration />
      
      <div className="container mx-auto px-4 py-8">
        <div className="relative mb-8 p-[1px] rounded-lg overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x">
          <div className="absolute inset-0 bg-black bg-opacity-90 backdrop-blur-sm rounded-lg"></div>
          <div className="relative rounded-lg p-6 md:p-8 z-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent mb-4">
              AutoTP Program Interface
            </h1>
            <p className="text-lg text-neutral-300 max-w-2xl mb-4">
              Directly interact with the AutoTP Solana program to create and manage take profit orders.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/YourOrg/autotp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-sm border border-neutral-700 hover:border-neutral-500 text-neutral-200 font-medium rounded-md transition-all duration-300"
              >
                View Source Code <ExternalLink size={14} />
              </a>
              <WalletButton />
            </div>
          </div>
        </div>
        
        {isConnected ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border border-neutral-800 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">Create a New Take Profit Order</h2>
              
              <div className="mb-4">
                <label className="block mb-2 text-neutral-300">Token Mint Address</label>
                <input
                  type="text"
                  value={tokenMint}
                  onChange={(e) => setTokenMint(e.target.value)}
                  className="w-full p-2 border border-neutral-700 bg-black bg-opacity-70 text-white rounded focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Token mint public key"
                />
                <p className="text-xs text-neutral-500 mt-1">e.g. EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v (USDC)</p>
              </div>
              
              <div className="mb-4">
                <label className="block mb-2 text-neutral-300">Target Price (in lamports/tokens)</label>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full p-2 border border-neutral-700 bg-black bg-opacity-70 text-white rounded focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Enter target price"
                  min="0"
                />
              </div>
              
              <div className="mb-6">
                <label className="block mb-2 text-neutral-300">Referrer Address (optional)</label>
                <input
                  type="text"
                  value={referrer}
                  onChange={(e) => setReferrer(e.target.value)}
                  className="w-full p-2 border border-neutral-700 bg-black bg-opacity-70 text-white rounded focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Referrer public key (optional)"
                />
              </div>
              
              <button
                onClick={handleInitializeVault}
                disabled={isLoading}
                className={`px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-md transition-all duration-300 shadow-lg hover:shadow-xl ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Processing...' : 'Initialize Vault'}
              </button>
            </div>
            
            <div className="p-6 border border-neutral-800 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">Your Take Profit Vault</h2>
              
              <button
                onClick={fetchVault}
                disabled={isLoading}
                className={`px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-md transition-all duration-300 shadow-lg hover:shadow-xl mb-6 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Fetching...' : 'Fetch My Vault'}
              </button>
              
              {vault ? (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2 text-white">Vault Details</h3>
                  <div className="overflow-x-auto">
                    <div className="bg-neutral-900 p-4 rounded border border-neutral-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        <div>
                          <span className="text-neutral-500 text-sm">Vault Address:</span>
                          <p className="text-neutral-200 font-mono text-sm truncate">{vault.pubkey.toString()}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 text-sm">Owner:</span>
                          <p className="text-neutral-200 font-mono text-sm truncate">{vault.account.owner.toString()}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        <div>
                          <span className="text-neutral-500 text-sm">Token Mint:</span>
                          <p className="text-neutral-200 font-mono text-sm truncate">{vault.account.tokenMint.toString()}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 text-sm">Referrer:</span>
                          <p className="text-neutral-200 font-mono text-sm truncate">{vault.account.referrer.toString()}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <span className="text-neutral-500 text-sm">Target Price:</span>
                          <p className="text-neutral-200 font-mono text-sm">{new BN(vault.account.targetPrice).toString()}</p>
                        </div>
                        <div>
                          <span className="text-neutral-500 text-sm">Ready For Execution:</span>
                          <p className="text-neutral-200 font-mono text-sm">{vault.account.readyForExecution ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-900 p-4 rounded border border-neutral-800 text-neutral-400">
                  No vault data available. Click &quot;Fetch My Vault&quot; to check if you have a vault, or create a new one.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 border border-neutral-800 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg text-center max-w-md mx-auto">
            <p className="mb-4 text-neutral-300">Connect your wallet to use the AutoTP program</p>
            <WalletButton />
          </div>
        )}
        
        {status && (
          <div className={`mt-6 p-4 border rounded bg-black bg-opacity-60 backdrop-blur-sm shadow-md ${
            statusType === 'success' ? 'border-green-600' : 
            statusType === 'error' ? 'border-red-600' : 
            statusType === 'info' ? 'border-blue-600' : 'border-neutral-700'
          }`}>
            <div className="flex items-start gap-3">
              {statusType === 'success' && <Check className="text-green-500 mt-0.5" size={18} />}
              {statusType === 'error' && <AlertTriangle className="text-red-500 mt-0.5" size={18} />}
              {statusType === 'info' && <div className="w-[18px] h-[18px] rounded-full border-2 border-blue-500 text-blue-500 flex items-center justify-center text-xs font-bold mt-0.5">i</div>}
              <div>
                <h3 className={`font-medium mb-1 ${
                  statusType === 'success' ? 'text-green-400' : 
                  statusType === 'error' ? 'text-red-400' : 
                  statusType === 'info' ? 'text-blue-400' : 'text-white'
                }`}>
                  {statusType === 'success' ? 'Success' : 
                   statusType === 'error' ? 'Error' : 
                   statusType === 'info' ? 'Info' : 'Status'}
                </h3>
                <p className="text-neutral-300">{status}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 