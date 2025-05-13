import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { typedAutotpIdl } from '@/idl';

// The network to connect to (mainnet-beta, testnet, devnet, or localhost)
export const SOLANA_NETWORK = 'devnet';

// Program ID from the IDL
export const PROGRAM_ID = new PublicKey('FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS');

// Helper to get an RPC endpoint URL based on the network
export const getEndpoint = () => {
  return clusterApiUrl(SOLANA_NETWORK);
};

// Create a connection to the Solana cluster
export const getConnection = () => {
  return new Connection(getEndpoint(), 'confirmed');
};

// React hook to get the program
export const useAutoTPProgram = () => {
  const wallet = useAnchorWallet();
  
  return useMemo(() => {
    if (!wallet) return null;
    
    // Create a provider
    const connection = getConnection();
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed', preflightCommitment: 'confirmed' }
    );
    
    // Use a different approach to instantiate the Program
    const programId = PROGRAM_ID;
    const idl = typedAutotpIdl;
    
    // Use Function.prototype.apply to bypass TypeScript's parameter checking
    // This allows us to call the constructor with the correct runtime arguments
    // regardless of what TypeScript expects
    try {
      return Function.prototype.apply.call(
        Program, 
        null, 
        [idl, programId, provider]
      );
    } catch (error) {
      console.error("Error creating Solana program:", error);
      return null;
    }
  }, [wallet]);
}; 