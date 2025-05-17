'use client'

import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import { AnchorProvider, Program } from '@coral-xyz/anchor'

// Extend Cluster type to include localhost
type ExtendedCluster = Cluster | 'localhost';

// Counter program ID for different networks
const COUNTER_PROGRAM_IDS: Record<ExtendedCluster, string> = {
  'mainnet-beta': '9T5Xv2tJCVM2aZcD6aw8NFnVLYnxmJt9x5Q1SheYYY5Y', // Replace with actual mainnet ID
  testnet: '9T5Xv2tJCVM2aZcD6aw8NFnVLYnxmJt9x5Q1SheYYY5Y',       // Replace with actual testnet ID
  devnet: '9T5Xv2tJCVM2aZcD6aw8NFnVLYnxmJt9x5Q1SheYYY5Y',        // Replace with actual devnet ID
  localhost: '9T5Xv2tJCVM2aZcD6aw8NFnVLYnxmJt9x5Q1SheYYY5Y',     // Local development
}

// Counter program IDL
const counterIdl = {
  "version": "0.1.0",
  "name": "counter",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "counter",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "increment",
      "accounts": [
        {
          "name": "counter",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "decrement",
      "accounts": [
        {
          "name": "counter",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "set",
      "accounts": [
        {
          "name": "counter",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "value",
          "type": "u64"
        }
      ]
    },
    {
      "name": "close",
      "accounts": [
        {
          "name": "counter",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Counter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u64"
          }
        ]
      }
    }
  ],
  // These fields are required by Anchor but not used in this simplified version
  "metadata": {
    "address": "9T5Xv2tJCVM2aZcD6aw8NFnVLYnxmJt9x5Q1SheYYY5Y"
  }
};

// Helper function to get program ID for the current network
function getCounterProgramId(cluster: ExtendedCluster): PublicKey {
  return new PublicKey(COUNTER_PROGRAM_IDS[cluster] || COUNTER_PROGRAM_IDS['devnet']);
}

// Helper function to get counter program with provider and program ID
function getCounterProgram(provider: AnchorProvider, programId: PublicKey): any {
  // Use any type to bypass TypeScript checking completely
  const anyProgram = Program as any;
  return new anyProgram(
    counterIdl,
    programId,
    provider
  );
}

export function useCounterProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getCounterProgramId(cluster.network as ExtendedCluster), [cluster])
  const program = useMemo(() => getCounterProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['counter', 'all', { cluster }],
    queryFn: () => program.account.counter.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['counter', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ counter: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature: any) => {
      transactionToast(String(signature))
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useCounterProgram()

  const accountQuery = useQuery({
    queryKey: ['counter', 'fetch', { cluster, account }],
    queryFn: () => program.account.counter.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['counter', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ counter: account }).rpc(),
    onSuccess: (tx: any) => {
      transactionToast(String(tx))
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['counter', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ counter: account }).rpc(),
    onSuccess: (tx: any) => {
      transactionToast(String(tx))
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['counter', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ counter: account }).rpc(),
    onSuccess: (tx: any) => {
      transactionToast(String(tx))
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['counter', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ counter: account }).rpc(),
    onSuccess: (tx: any) => {
      transactionToast(String(tx))
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
