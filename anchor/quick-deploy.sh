#!/bin/bash

set -e

# Deploy to devnet
echo "Deploying to devnet..."
solana config set --url devnet

# Set the program ID to match the frontend code
PROGRAM_ID="4zNsNcDNWFJUPhpBF2j6ZBA4f6arEHn3hEx1osH6Hvkq"
echo "Using program ID: $PROGRAM_ID"

# Check balance
BALANCE=$(solana balance | awk '{print $1}')
echo "Current SOL balance on devnet: $BALANCE"

# Airdrop if needed
if (( $(echo "$BALANCE < 1.0" | bc -l) )); then
    echo "Balance low, requesting airdrop..."
    solana airdrop 2
    sleep 2
fi

# Attempt to deploy using either an existing binary or the default location
if [ -f "target/deploy/autotp.so" ]; then
    BINARY="target/deploy/autotp.so"
elif [ -f "target/sbf-solana-solana/release/autotp.so" ]; then
    BINARY="target/sbf-solana-solana/release/autotp.so"
else
    echo "Error: No program binary found. Please build the program first."
    exit 1
fi

echo "Using binary: $BINARY"

# Generate a new keypair for buffer account
solana-keygen new -o buffer-keypair.json --no-bip39-passphrase

# Deploy the program with a new buffer account
echo "Deploying program to devnet..."
solana program deploy "$BINARY" \
    --program-id "$PROGRAM_ID" \
    --buffer buffer-keypair.json \
    --allow-excessive-deploy-account-balance

echo "Deployment complete. Program ID: $PROGRAM_ID" 