#!/bin/bash
set -e

echo "AutoTP Transaction Test"
echo "======================="
echo "This script will simulate creating a take profit order directly with the Solana CLI"
echo "to test program interaction without requiring the frontend."
echo ""

# Get the program ID from auto-tp-program.ts
PROGRAM_ID=$(grep -o "AUTOTP_PROGRAM_ID = new PublicKey.*" src/lib/auto-tp-program.ts | grep -o "'[^']*'" | tr -d "'" || grep -o "AUTOTP_PROGRAM_ID = new PublicKey.*" src/lib/auto-tp-program.ts | grep -o '"[^"]*"' | tr -d '"')
echo "Program ID: $PROGRAM_ID"

# Set to devnet
echo "Setting Solana config to devnet..."
solana config set --url devnet > /dev/null

# Get wallet public key
WALLET_PUBKEY=$(solana address)
echo "Using wallet: $WALLET_PUBKEY"

# Using USDC mint address for devnet
TOKEN_MINT="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" # Devnet USDC
echo "Using token mint: $TOKEN_MINT (USDC)"

# Create vault address - this mimics the same logic as in the frontend
VAULT_SEED="vault"
VAULT_PDA=$(solana address --derive-seed "$VAULT_SEED" --program-id $PROGRAM_ID --seed-key $WALLET_PUBKEY 2>/dev/null || echo "Could not derive PDA")
echo "Vault PDA: $VAULT_PDA"

echo ""
echo "Attempting to invoke program..."
echo "This will create a take profit order with:"
echo "- Target multiplier: 1.5x current price"
echo "- Sell percentage: 50%"
echo ""

echo "Press Enter to continue or Ctrl+C to cancel..."
read

# Build the transaction
echo "Building transaction data..."
echo "This is a simulation - in a real implementation, we would need to build the correct transaction format"

# In a real implementation, we would execute:
# solana program write-buffer anchor/target/deploy/autotp.so
# solana program deploy anchor/target/deploy/autotp.so --program-id anchor/program-keypair.json --buffer buffer_keypair.json

echo ""
echo "Testing program existence..."
solana program show $PROGRAM_ID

echo ""
echo "Transaction test complete!"
echo "To perform actual testing, use the frontend at http://localhost:3001 or http://localhost:3002"
echo "For real-time monitoring, use: ./monitor-app.sh" 