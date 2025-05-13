'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useAutoTPProgram } from '@/components/solana/solana-provider'
import { initializeVault, fetchVaultByOwner } from '@/lib/autotp'
import { WalletButton } from '@/components/solana/solana-provider'
import BN from 'bn.js'

export default function AutoTPPage() {
  const wallet = useWallet()
  const program = useAutoTPProgram()
  const [targetPrice, setTargetPrice] = useState<string>('0')
  const [tokenMint, setTokenMint] = useState<string>('')
  const [referrer, setReferrer] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [vault, setVault] = useState<any>(null)

  const isConnected = !!wallet.publicKey
  
  const handleInitializeVault = async () => {
    if (!program || !wallet.publicKey) return
    
    try {
      setStatus('Initializing vault...')
      
      // Validate and parse inputs
      const targetPriceNumber = parseInt(targetPrice)
      if (isNaN(targetPriceNumber)) {
        setStatus('Error: Invalid target price')
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
      
      setStatus(`Vault initialized! Transaction: ${result.tx}`)
    } catch (error) {
      console.error('Error initializing vault:', error)
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
  
  const fetchVault = async () => {
    if (!program || !wallet.publicKey) return
    
    try {
      setStatus('Fetching vault...')
      const vaultData = await fetchVaultByOwner(program, wallet.publicKey)
      
      if (vaultData) {
        setVault(vaultData)
        setStatus('Vault fetched successfully!')
      } else {
        setStatus('No vault found for this owner')
      }
    } catch (error) {
      console.error('Error fetching vault:', error)
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">AutoTP - Take Profit Manager</h1>
      
      <div className="mb-6">
        <p className="mb-4">Connect your wallet to use the AutoTP program</p>
        <WalletButton />
      </div>
      
      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Create a New Take Profit Order</h2>
            
            <div className="mb-4">
              <label className="block mb-2">Token Mint Address</label>
              <input
                type="text"
                value={tokenMint}
                onChange={(e) => setTokenMint(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Token mint public key"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2">Target Price (in lamports/tokens)</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter target price"
              />
            </div>
            
            <div className="mb-4">
              <label className="block mb-2">Referrer Address (optional)</label>
              <input
                type="text"
                value={referrer}
                onChange={(e) => setReferrer(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Referrer public key (optional)"
              />
            </div>
            
            <button
              onClick={handleInitializeVault}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Initialize Vault
            </button>
          </div>
          
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Your Take Profit Vault</h2>
            
            <button
              onClick={fetchVault}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mb-4"
            >
              Fetch My Vault
            </button>
            
            {vault && (
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">Vault Details</h3>
                <div className="overflow-x-auto">
                  <pre className="bg-gray-100 p-4 rounded">
                    {JSON.stringify({
                      pubkey: vault.pubkey.toString(),
                      owner: vault.account.owner.toString(),
                      tokenMint: vault.account.tokenMint.toString(),
                      targetPrice: new BN(vault.account.targetPrice).toString(),
                      currentPrice: new BN(vault.account.currentPrice).toString(),
                      referrer: vault.account.referrer.toString(),
                      readyForExecution: vault.account.readyForExecution,
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {status && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="font-medium mb-2">Status:</h3>
          <p>{status}</p>
        </div>
      )}
    </div>
  )
} 