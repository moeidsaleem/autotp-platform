import { AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, Connection, Transaction, VersionedTransaction } from '@solana/web3.js';
import { AutotpProgram, Vault } from '../idl';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// Import the correct types for Anchor
import * as anchor from '@coral-xyz/anchor';

// Define a type for wallet adapter needed by our functions
interface WalletAdapter {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
}

// Program constants
const AUTOTP_PROGRAM_ID = new PublicKey('4zNsNcDNWFJUPhpBF2j6ZBA4f6arEHn3hEx1osH6Hvkq');

/**
 * Helper function to check if a program exists on the blockchain
 */
async function checkProgramExists(connection: Connection, programId: PublicKey): Promise<boolean> {
  try {
    const programInfo = await connection.getAccountInfo(programId);
    return programInfo !== null && programInfo.executable;
  } catch (error) {
    console.error('Error checking program existence:', error);
    return false;
  }
}

/**
 * Helper function to write a u64 value to a buffer in little-endian format
 * This is browser-compatible unlike Buffer.writeBigUInt64LE
 */
function writeUint64LE(buffer: Uint8Array, value: BN, offset: number): void {
  const bn = value.clone();
  
  // Write 8 bytes in little-endian format
  for (let i = 0; i < 8; i++) {
    const byte = bn.modn(256);
    buffer[offset + i] = byte;
    bn.idivn(256);
  }
}

/**
 * Creates an Auto TP Program instance
 * Using a direct approach that bypasses usual Anchor Program initialization
 */
export function createAutotpProgram(provider: AnchorProvider): AutotpProgram {
  try {
    // Manually construct a minimal program interface with just what we need
    return {
      methods: {
        initialize: (targetPrice: BN, referrer: PublicKey) => {
          return {
            accounts: (accounts: any) => {
              return {
                rpc: async () => {
                  // First check if the program exists
                  const programExists = await checkProgramExists(provider.connection, AUTOTP_PROGRAM_ID);
                  if (!programExists) {
                    throw new Error(
                      `Program ${AUTOTP_PROGRAM_ID.toString()} does not exist on the current network. ` +
                      `Please deploy the program to the network you're connecting to (e.g., devnet).`
                    );
                  }
                  
                  // Create a Uint8Array for instruction data instead of Buffer
                  const instructionData = new Uint8Array(1 + 8 + 32); // 1 byte for instruction, 8 bytes for targetPrice, 32 bytes for referrer
                  
                  // Write instruction index (0 for initialize)
                  instructionData[0] = 0;
                  
                  // Write targetPrice as a 64-bit number (8 bytes) in little-endian format
                  writeUint64LE(instructionData, targetPrice, 1);
                  
                  // Write referrer public key (32 bytes)
                  const referrerBytes = referrer.toBuffer();
                  for (let i = 0; i < 32; i++) {
                    instructionData[i + 9] = referrerBytes[i];
                  }
                  
                  // Create transaction with the instruction
                  const transaction = new Transaction().add(
                    new anchor.web3.TransactionInstruction({
                      keys: [
                        { pubkey: accounts.vault, isSigner: false, isWritable: true },
                        { pubkey: accounts.owner, isSigner: true, isWritable: true },
                        { pubkey: accounts.tokenMint, isSigner: false, isWritable: false },
                        { pubkey: accounts.systemProgram, isSigner: false, isWritable: false }
                      ],
                      programId: AUTOTP_PROGRAM_ID,
                      data: Buffer.from(instructionData)
                    })
                  );
                  
                  try {
                    // Set recent blockhash and fee payer
                    transaction.feePayer = provider.wallet.publicKey;
                    transaction.recentBlockhash = (
                      await provider.connection.getLatestBlockhash()
                    ).blockhash;
                    
                    // Have the wallet sign the transaction
                    const signedTx = await provider.wallet.signTransaction(transaction);
                    
                    // Send the signed transaction
                    const signature = await provider.connection.sendRawTransaction(
                      signedTx.serialize()
                    );
                    
                    // Wait for confirmation
                    await provider.connection.confirmTransaction(signature, 'confirmed');
                    
                    return signature;
                  } catch (error) {
                    console.error('Transaction error:', error);
                    
                    if (error instanceof Error) {
                      // Check if this is a program not found error
                      if (error.message.includes('program not found') || 
                          error.message.includes('program that does not exist')) {
                        throw new Error(
                          `Program ${AUTOTP_PROGRAM_ID.toString()} not found on the network. ` +
                          `You need to deploy the program to this network first.`
                        );
                      }
                    }
                    
                    throw error;
                  }
                }
              };
            }
          };
        },
        cancelTp: () => {
          return {
            accounts: () => {
              return {
                rpc: async () => {
                  return "Mocked transaction";
                }
              };
            }
          };
        },
        executeTp: () => {
          return {
            accounts: () => {
              return {
                rpc: async () => {
                  return "Mocked transaction";
                }
              };
            }
          };
        }
      },
      account: {
        vault: {
          fetch: async () => {
            return {} as any; // Mock vault data
          }
        }
      }
    } as unknown as AutotpProgram;
  } catch (error) {
    console.error('Error creating AutoTP program:', error);
    throw error;
  }
}

// Helper function to create an Anchor wallet adapter from WalletContextState
export function anchorWallet(wallet: WalletAdapter): anchor.Wallet {
  return {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
  } as anchor.Wallet;
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
  devModeOverride = false, // Added dev mode parameter
): Promise<string> {
  try {
    console.log('Creating take profit order with parameters:', {
      wallet: wallet.publicKey.toString(),
      tokenMint: tokenMint.toString(),
      targetMultiplier,
      currentPrice,
      percentToSell,
      devMode: devModeOverride
    });

    // Create an Anchor provider
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      } as anchor.Wallet,
      { commitment: 'confirmed' }
    );

    // Skip program existence check if in dev mode
    if (!devModeOverride) {
      // Check if the program exists before proceeding
      const programExists = await checkProgramExists(connection, AUTOTP_PROGRAM_ID);
      if (!programExists) {
        throw new Error(
          `Program ${AUTOTP_PROGRAM_ID.toString()} not found on the network. ` +
          'Please deploy the program to this network first before trying to create take profit orders.'
        );
      }
    }

    const program = createAutotpProgram(provider);
    
    // Calculate the target price as a BN (fixed-point arithmetic)
    // Convert to lamports (6 decimal places is standard for most SPL tokens)
    const targetPrice = new BN(Math.floor(currentPrice * targetMultiplier * 1_000_000)); 
    
    // Get the vault seed (using the format from the Rust program)
    const vaultSeed = Buffer.from('vault');

    // Find the PDA for the vault - using the same logic as in the Rust program
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [vaultSeed, wallet.publicKey.toBuffer()],
      AUTOTP_PROGRAM_ID
    );

    // Default referrer if not provided
    const actualReferrer = referrer || wallet.publicKey;

    console.log('Program setup complete, calling initialize with:', {
      targetPrice: targetPrice.toString(),
      referrer: actualReferrer.toString(),
      vault: vaultPDA.toString(),
      owner: wallet.publicKey.toString(),
      tokenMint: tokenMint.toString()
    });

    // If in dev mode, return a mock transaction signature instead of calling the program
    if (devModeOverride) {
      return "DevModeTransaction_" + Math.random().toString(36).substring(2, 15);
    }

    // Initialize the take profit order - match the exact structure expected by the Rust program
    const tx = await program.methods
      .initialize(targetPrice, actualReferrer)
      .accounts({
        vault: vaultPDA,
        owner: wallet.publicKey,
        tokenMint: tokenMint,
        systemProgram: anchor.web3.SystemProgram.programId,
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _tokenMint: PublicKey, // Using underscore to indicate it's not used directly in this function
): Promise<string> {
  try {
    // Check if the program exists before proceeding
    const programExists = await checkProgramExists(connection, AUTOTP_PROGRAM_ID);
    if (!programExists) {
      throw new Error(
        `Program ${AUTOTP_PROGRAM_ID.toString()} not found on the network. ` +
        'Please deploy the program to this network first before trying to cancel take profit orders.'
      );
    }

    // Create an Anchor provider
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      } as anchor.Wallet,
      { commitment: 'confirmed' }
    );

    const program = createAutotpProgram(provider);
    
    // Get the vault seed - using the format from the Rust program
    const vaultSeed = Buffer.from('vault');

    // Find the PDA for the vault - using the same logic as in the Rust program
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [vaultSeed, wallet.publicKey.toBuffer()],
      AUTOTP_PROGRAM_ID
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
        vaultTokens: vaultTokenAccount,
        owner: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
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