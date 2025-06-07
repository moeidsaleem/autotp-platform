import { BN } from '@coral-xyz/anchor';
import { PublicKey, Connection, Transaction, VersionedTransaction, SystemProgram } from '@solana/web3.js';
import { Vault } from '../idl';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';

// Define a type for wallet adapter needed by our functions
interface WalletAdapter {
  publicKey: PublicKey;
  signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T>;
  signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]>;
}

// Program constants - using the deployed program ID
const AUTOTP_PROGRAM_ID = new PublicKey('7LodHGzvDyBkGPwLyraaB7vyX7thPLtWbZ3iF7WdtUsQ');

// Hardcoded instruction discriminators for the deployed program
// These are based on the Anchor framework's standard discriminator generation
const INSTRUCTION_DISCRIMINATORS = {
  // Most likely correct discriminator pattern: "namespace:method_name"
  initialize: Array.from(Buffer.from(anchor.utils.sha256.hash("initialize").slice(0, 8))),
  cancelTp: Array.from(Buffer.from(anchor.utils.sha256.hash("cancelTp").slice(0, 8))),
  executeTp: Array.from(Buffer.from(anchor.utils.sha256.hash("executeTp").slice(0, 8)))
};

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
 * Creates a new take profit order for a token
 */
export async function createTakeProfitOrder(
  connection: Connection,
  wallet: WalletAdapter,
  tokenMint: PublicKey,
  targetMultiplier: number,
  currentPrice: number,
  percentToSell: number,
  referrer?: PublicKey
): Promise<string> {
  try {
    console.log('Creating take profit order with parameters:', {
      wallet: wallet.publicKey.toString(),
      tokenMint: tokenMint.toString(),
      targetMultiplier,
      currentPrice,
      percentToSell
    });

    // Check if the program exists before proceeding
    const programExists = await checkProgramExists(connection, AUTOTP_PROGRAM_ID);
    if (!programExists) {
      throw new Error(
        `Program ${AUTOTP_PROGRAM_ID.toString()} not found on the network. ` +
        'Please deploy the program to this network first before trying to create take profit orders.'
      );
    }
    
    // Calculate the target price as a BN (fixed-point arithmetic)
    // Convert to lamports (6 decimal places is standard for most SPL tokens)
    const targetPrice = new BN(Math.floor(currentPrice * targetMultiplier * 1_000_000)); 
    
    // Find the vault PDA using the correct seed derivation from the Rust code
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), wallet.publicKey.toBuffer()],
      AUTOTP_PROGRAM_ID
    );

    console.log('Using vault PDA:', vaultPDA.toString());

    // Default referrer if not provided
    const actualReferrer = referrer || PublicKey.default;

    console.log('Creating transaction with:', {
      targetPrice: targetPrice.toString(),
      referrer: actualReferrer.toString(),
      vault: vaultPDA.toString(),
      owner: wallet.publicKey.toString(),
      tokenMint: tokenMint.toString()
    });

    // Create the instruction data - using anchor's standard discriminator format
    const initData = Buffer.concat([
      Buffer.from(INSTRUCTION_DISCRIMINATORS.initialize),
      Buffer.from(targetPrice.toArray("le", 8)),
      Buffer.from(actualReferrer.toBytes())
    ]);
    
    // Create the transaction instruction
    const ix = new anchor.web3.TransactionInstruction({
      programId: AUTOTP_PROGRAM_ID,
      keys: [
        // Based on Rust code, vault account initialized with init attribute, but not marked as signer
        { pubkey: vaultPDA, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: tokenMint, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      data: initData
    });
    
    // Create and send the transaction
    const tx = new anchor.web3.Transaction().add(ix);
    tx.feePayer = wallet.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    
    const signed = await wallet.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);
    
    return signature;
  } catch (error) {
    console.error('Error creating take profit order:', error);
    
    if (error instanceof Error && 
        (error.message.includes('0x65') || 
         error.message.includes('InstructionFallbackNotFound'))) {
      throw new Error(
        'The take profit program instruction format is not compatible. ' +
        'This could indicate the deployed program has a different implementation than expected.'
      );
    }
    
    throw error;
  }
}

/**
 * Cancels a take profit order
 */
export async function cancelTakeProfitOrder(
  connection: Connection,
  wallet: WalletAdapter,
  vaultAddress: PublicKey,
  vaultTokensAddress: PublicKey
): Promise<string> {
  try {
    console.log('Cancelling take profit order:', {
      wallet: wallet.publicKey.toString(),
      vault: vaultAddress.toString(),
      vaultTokens: vaultTokensAddress.toString()
    });

    // Check if the program exists before proceeding
    const programExists = await checkProgramExists(connection, AUTOTP_PROGRAM_ID);
    if (!programExists) {
      throw new Error(
        `Program ${AUTOTP_PROGRAM_ID.toString()} not found on the network. ` +
        'Please deploy the program to this network first before trying to cancel take profit orders.'
      );
    }

    // Direct approach using the standard Anchor discriminator format
    const cancelData = Buffer.from([
      ...INSTRUCTION_DISCRIMINATORS.cancelTp, // cancelTp discriminator
      // No arguments for cancelTp function
    ]);
    
    // Create the transaction instruction
    const ix = new anchor.web3.TransactionInstruction({
      programId: AUTOTP_PROGRAM_ID,
      keys: [
        { pubkey: vaultAddress, isSigner: false, isWritable: true },
        { pubkey: vaultTokensAddress, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
      ],
      data: cancelData
    });
    
    // Create and send the transaction
    const tx = new anchor.web3.Transaction().add(ix);
    tx.feePayer = wallet.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    
    const signed = await wallet.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);
    
    return signature;
  } catch (error) {
    console.error('Error canceling take profit order:', error);
    
    if (error instanceof Error && 
        (error.message.includes('0x65') || 
         error.message.includes('InstructionFallbackNotFound'))) {
      throw new Error(
        'The take profit program cancel instruction format is not compatible. ' +
        'This could indicate the on-chain program does not match the expected program ID or format.'
      );
    }
    
    throw error;
  }
}

/**
 * Execute a take profit order
 */
export async function executeTakeProfitOrder(
  connection: Connection,
  wallet: WalletAdapter,
  vaultAddress: PublicKey,
  vaultTokensAddress: PublicKey,
  destinationUser: PublicKey,
  destinationProtocol: PublicKey,
  destinationReferrer: PublicKey,
  currentPrice: number
): Promise<string> {
  try {
    console.log('Executing take profit order:', {
      wallet: wallet.publicKey.toString(),
      vault: vaultAddress.toString(),
      currentPrice
    });

    // Check if the program exists before proceeding
    const programExists = await checkProgramExists(connection, AUTOTP_PROGRAM_ID);
    if (!programExists) {
      throw new Error(
        `Program ${AUTOTP_PROGRAM_ID.toString()} not found on the network. ` +
        'Please deploy the program to this network first.'
      );
    }

    // Current price as BN for the argument
    const currentPriceBN = new BN(Math.floor(currentPrice * 1_000_000));

    // Direct approach using the standard Anchor discriminator format
    const executeData = Buffer.from([
      ...INSTRUCTION_DISCRIMINATORS.executeTp, // executeTp discriminator
      ...currentPriceBN.toArray("le", 8)      // currentPrice as u64
    ]);
    
    // Create the transaction instruction
    const ix = new anchor.web3.TransactionInstruction({
      programId: AUTOTP_PROGRAM_ID,
      keys: [
        { pubkey: vaultAddress, isSigner: false, isWritable: true },
        { pubkey: vaultTokensAddress, isSigner: false, isWritable: true },
        { pubkey: destinationUser, isSigner: false, isWritable: true },
        { pubkey: destinationProtocol, isSigner: false, isWritable: true },
        { pubkey: destinationReferrer, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false }
      ],
      data: executeData
    });
    
    // Create and send the transaction
    const tx = new anchor.web3.Transaction().add(ix);
    tx.feePayer = wallet.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    
    const signed = await wallet.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);
    
    return signature;
  } catch (error) {
    console.error('Error executing take profit order:', error);
    
    if (error instanceof Error && 
        (error.message.includes('0x65') || 
         error.message.includes('InstructionFallbackNotFound'))) {
      throw new Error(
        'The take profit program execution instruction format is not compatible. ' +
        'This could indicate the on-chain program does not match the expected program ID or format.'
      );
    }
    
    throw error;
  }
}

/**
 * Gets all active take profit orders for a wallet
 */
export async function getActiveTakeProfitOrders(
  connection: Connection,
  walletAddress: PublicKey,
): Promise<Vault[]> {
  try {
    console.log('Fetching active take profit orders for:', walletAddress.toString());
    
    // Query all accounts owned by the program
    const accounts = await connection.getProgramAccounts(AUTOTP_PROGRAM_ID, {
      filters: [
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: walletAddress.toBase58() // Find accounts where owner matches walletAddress
          }
        }
      ]
    });
    
    console.log(`Found ${accounts.length} program accounts`);
    
    // Parse each account into a Vault structure
    const vaults: Vault[] = [];
    
    for (const account of accounts) {
      try {
        // Match the exact structure from the Rust code: Vault struct with specific fields
        if (account.account.data.length < 8 + 32 + 32 + 8 + 32 + 8 + 1) {
          console.log('Skipping account with insufficient data length');
          continue;
        }
        
        // Skip discriminator (8 bytes)
        let offset = 8;
        
        // Read owner (32 bytes)
        const owner = new PublicKey(account.account.data.slice(offset, offset + 32));
        offset += 32;
        
        // Read token mint (32 bytes)
        const tokenMint = new PublicKey(account.account.data.slice(offset, offset + 32));
        offset += 32;
        
        // Read target price (8 bytes)
        const targetPrice = new BN(account.account.data.slice(offset, offset + 8), 'le');
        offset += 8;
        
        // Read referrer (32 bytes)
        const referrer = new PublicKey(account.account.data.slice(offset, offset + 32));
        offset += 32;
        
        // Read current price (8 bytes)
        const currentPrice = new BN(account.account.data.slice(offset, offset + 8), 'le');
        offset += 8;
        
        // Read ready for execution (1 byte)
        const readyForExecution = account.account.data[offset] === 1;
        
        vaults.push({
          owner,
          tokenMint,
          targetPrice,
          referrer,
          currentPrice,
          readyForExecution
        });
      } catch (err) {
        console.error('Error parsing vault account:', err);
      }
    }
    
    return vaults;
  } catch (error) {
    console.error('Error fetching active take profit orders:', error);
    return [];
  }
}