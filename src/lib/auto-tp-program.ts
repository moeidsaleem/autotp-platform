import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
import { typedAutotpIdl, AutotpProgram, Vault } from '../idl';
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

// Import the correct types for Anchor
import * as anchor from '@coral-xyz/anchor';

// Program constants
const AUTOTP_PROGRAM_ID = new PublicKey('At8PqLYz1LAL7WbcCHMSnxdXHiQhk9ZtYqL6cmk7w1h7'); // Replace with your actual program ID

/**
 * Creates an Auto TP Program instance
 * This uses a workaround to handle type mismatches between our IDL definition and Anchor's expected types
 */
export function createAutotpProgram(provider: AnchorProvider): AutotpProgram {
  // Use forced type casting to bypass the type checking issues
  // This works because the actual runtime behavior is correct,
  // even though TypeScript doesn't recognize the compatibility
  // @ts-expect-error - Type mismatch for Program constructor
  return new Program(typedAutotpIdl, AUTOTP_PROGRAM_ID, provider) as AutotpProgram;
}

// Define a type for wallet interface needed by our functions that's compatible with Anchor
interface WalletAdapter {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
}

/**
 * Creates a new take profit order for a token
 */
export async function createTakeProfitOrder(
  connection: Connection,
  wallet: WalletAdapter,
  tokenMint: PublicKey,
  targetMultiplier: number,
  currentPrice: number,
  percentToSell: number,
  referrer?: PublicKey,
): Promise<string> {
  try {
    // Create an Anchor provider
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      } as unknown as anchor.Wallet,
      { commitment: 'confirmed' }
    );

    const program = createAutotpProgram(provider);
    
    // Calculate the target price as a BN (fixed-point arithmetic)
    const targetPrice = new BN(currentPrice * targetMultiplier * 1_000_000); // 6 decimal places
    
    // Get the vault seed (deterministic)
    const vaultSeed = Buffer.from(`vault-${tokenMint.toString().substring(0, 8)}`);

    // Find the PDA for the vault
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [vaultSeed, wallet.publicKey.toBuffer(), tokenMint.toBuffer()],
      AUTOTP_PROGRAM_ID
    );

    // Get the associated token account for the user's wallet
    const userTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      wallet.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Create the vault token account
    const [vaultTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('token-account'), vaultPDA.toBuffer()],
      AUTOTP_PROGRAM_ID
    );

    // Default referrer if not provided
    const actualReferrer = referrer || wallet.publicKey;

    // Initialize the take profit order
    const tx = await program.methods
      .initialize(targetPrice, actualReferrer)
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount,
        tokenMint,
        owner: wallet.publicKey,
        userTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    return tx;
  } catch (error) {
    console.error('Error creating take profit order:', error);
    throw error;
  }
}

/**
 * Cancels a take profit order
 */
export async function cancelTakeProfitOrder(
  connection: Connection,
  wallet: WalletAdapter,
  tokenMint: PublicKey,
): Promise<string> {
  try {
    // Create an Anchor provider
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      } as unknown as anchor.Wallet,
      { commitment: 'confirmed' }
    );

    const program = createAutotpProgram(provider);
    
    // Get the vault seed
    const vaultSeed = Buffer.from(`vault-${tokenMint.toString().substring(0, 8)}`);

    // Find the PDA for the vault
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [vaultSeed, wallet.publicKey.toBuffer(), tokenMint.toBuffer()],
      AUTOTP_PROGRAM_ID
    );

    // Get the associated token account for the user's wallet
    const userTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      wallet.publicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Create the vault token account
    const [vaultTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('token-account'), vaultPDA.toBuffer()],
      AUTOTP_PROGRAM_ID
    );

    // Cancel the take profit order
    const tx = await program.methods
      .cancelTp()
      .accounts({
        vault: vaultPDA,
        vaultTokenAccount,
        tokenMint,
        owner: wallet.publicKey,
        userTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  } catch (error) {
    console.error('Error canceling take profit order:', error);
    throw error;
  }
}

/**
 * Gets all active take profit orders for a wallet
 * 
 * Note: This is a mock implementation that returns an empty array.
 * In a real application, this function would fetch program accounts
 * filtered by owner from the blockchain.
 */
export async function getActiveTakeProfitOrders(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  connection: Connection,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  walletAddress: PublicKey,
): Promise<Vault[]> {
  // Mock implementation - intentionally not using the parameters
  return [];
}

/**
 * Adapter function to create an Anchor wallet adapter from the Solana wallet adapter
 */
export function anchorWallet(wallet: WalletAdapter): anchor.Wallet {
  if (!wallet.publicKey) {
    throw new Error('Wallet not connected');
  }

  return {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
  } as unknown as anchor.Wallet;
} 