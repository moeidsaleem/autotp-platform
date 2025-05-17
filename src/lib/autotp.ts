import { 
  PublicKey, 
  SystemProgram
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PROGRAM_ID } from './solana';
import BN from 'bn.js';
import type { AutotpProgram, Vault } from '@/idl';

/**
 * Initialize a new AutoTP vault
 */
export const initializeVault = async (
  program: AutotpProgram,
  owner: PublicKey,
  tokenMint: PublicKey,
  targetPrice: number,
  referrer: PublicKey = PublicKey.default
) => {
  try {
    // Generate a new keypair for the vault
    const vault = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), owner.toBuffer()],
      PROGRAM_ID
    )[0];
    
    // Convert target price to BN (program expects u64)
    const targetPriceBN = new BN(targetPrice);
    
    const tx = await program.methods
      .initialize(targetPriceBN, referrer)
      .accounts({
        vault,
        owner,
        tokenMint,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
      
    return { tx, vault };
  } catch (error) {
    console.error('Error initializing vault:', error);
    throw error;
  }
};

/**
 * Cancel a take profit order and reclaim funds
 */
export const cancelTP = async (
  program: AutotpProgram,
  owner: PublicKey,
  vault: PublicKey,
  vaultTokens: PublicKey
) => {
  try {
    const tx = await program.methods
      .cancelTp()
      .accounts({
        vault,
        vaultTokens,
        owner,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
      
    return { tx };
  } catch (error) {
    console.error('Error canceling TP:', error);
    throw error;
  }
};

/**
 * Execute a take profit order when price conditions are met
 */
export const executeTP = async (
  program: AutotpProgram,
  vault: PublicKey,
  vaultTokens: PublicKey,
  destinationUser: PublicKey,
  destinationProtocol: PublicKey,
  destinationReferrer: PublicKey,
  currentPrice: number
) => {
  try {
    const currentPriceBN = new BN(currentPrice);
    
    const tx = await program.methods
      .executeTp(currentPriceBN)
      .accounts({
        vault,
        vaultTokens,
        destinationUser,
        destinationProtocol,
        destinationReferrer,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
      
    return { tx };
  } catch (error) {
    console.error('Error executing TP:', error);
    throw error;
  }
};

/**
 * Fetch a vault by owner
 */
export const fetchVaultByOwner = async (
  program: AutotpProgram,
  owner: PublicKey
) => {
  const vault = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), owner.toBuffer()],
    PROGRAM_ID
  )[0];
  
  try {
    const vaultAccount = await program.account.vault.fetch(vault);
    return { 
      pubkey: vault,
      account: vaultAccount as Vault
    };
  } catch (error) {
    console.error('Error fetching vault:', error);
    return null;
  }
}; 