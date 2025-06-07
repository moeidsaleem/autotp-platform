#!/bin/bash
set -e

echo "Deploying AutoTP program to devnet..."

# First, build the program using our better build script
echo "Building program..."
cd anchor
./better-build.sh

# Generate a new keypair for the program if it doesn't exist
if [ ! -f program-keypair.json ]; then
    echo "Generating new program keypair..."
    solana-keygen new -o program-keypair.json --no-bip39-passphrase
fi

# Get the program ID from the keypair
PROGRAM_ID=$(solana-keygen pubkey program-keypair.json)
echo "Using program ID: $PROGRAM_ID"

# Set to devnet
echo "Setting Solana config to devnet..."
solana config set --url devnet

# Check devnet balance
BALANCE=$(solana balance | awk '{print $1}')
echo "Current SOL balance on devnet: $BALANCE"

# Airdrop more SOL if needed
if (( $(echo "$BALANCE < 2.0" | bc -l) )); then
    echo "Balance low, requesting airdrop..."
    solana airdrop 2
    sleep 2
fi

# Deploy to devnet
echo "Deploying program to devnet..."
solana program deploy target/deploy/autotp.so \
    --program-id program-keypair.json

# Update the IDL
echo "Updating IDL..."
mkdir -p target/idl
anchor idl parse -f programs/anchor/src/lib.rs -o target/idl/autotp.json
mkdir -p ../src/idl && cp target/idl/autotp.json ../src/idl/

echo "Program deployed to devnet with ID: $PROGRAM_ID"
echo ""
echo "IMPORTANT: To use this newly deployed program, you'll need to update the program ID in:"
echo "1. src/lib/auto-tp-program.ts"
echo "2. src/idl/index.ts"
echo "3. src/lib/referral-service.ts"
echo "4. src/idl/autotp.json (metadata.address field)"
echo ""
echo "Alternatively, if you want to keep using the currently deployed program (4zNsNcDNWFJUPhpBF2j6ZBA4f6arEHn3hEx1osH6Hvkq),"
echo "you can simply run the frontend without changing the program ID." 