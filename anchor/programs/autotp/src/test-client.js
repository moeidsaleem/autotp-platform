/**
 * A simple test client for our counter program
 * 
 * This is designed to work with a local Solana validator
 * without requiring the program to be built - we'll use direct
 * instructions to test functionality.
 */

// Import dependencies - you would need to install these with:
// npm install @solana/web3.js @solana/spl-token @project-serum/anchor

const web3 = require('@solana/web3.js');
const anchor = require('@project-serum/anchor');
const fs = require('fs');

// Connect to local net
const connection = new web3.Connection('http://127.0.0.1:8899', 'confirmed');

// You would load your IDL file here
// const idl = JSON.parse(fs.readFileSync('./target/idl/autotp.json', 'utf8'));

// Using a simple protocol definition for testing
const PROGRAM_ID = 'FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS';

async function main() {
  // Create or load a wallet for testing
  const wallet = web3.Keypair.generate();
  console.log(`Using wallet: ${wallet.publicKey.toString()}`);
  
  // Airdrop some SOL to the wallet
  console.log('Requesting airdrop...');
  const airdropSignature = await connection.requestAirdrop(
    wallet.publicKey,
    web3.LAMPORTS_PER_SOL * 2
  );
  
  // Confirm the airdrop transaction
  await connection.confirmTransaction(airdropSignature);
  
  // Get wallet balance to confirm
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`Wallet balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);

  // Create a counter account
  const counterAccount = web3.Keypair.generate();
  console.log(`Counter account: ${counterAccount.publicKey.toString()}`);
  
  // Define the space for the counter account (8 bytes for discriminator, 8 for count, 32 for pubkey)
  const space = 8 + 8 + 32;
  
  // Create transaction for account initialization
  const lamports = await connection.getMinimumBalanceForRentExemption(space);
  const transaction = new web3.Transaction().add(
    web3.SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: counterAccount.publicKey,
      lamports,
      space,
      programId: new web3.PublicKey(PROGRAM_ID),
    })
  );
  
  console.log('Creating account...');
  try {
    // Send transaction
    const signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet, counterAccount]
    );
    console.log(`Transaction signature: ${signature}`);
    console.log('Account created successfully!');
  } catch (error) {
    console.error('Error creating account:', error);
  }
}

main().catch(console.error); 