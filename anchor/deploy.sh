#!/bin/bash

# Exit on error
set -e

# Make sure required tools are installed
if ! command -v anchor &> /dev/null; then
    echo "Error: Anchor CLI is not installed. Install with 'cargo install --git https://github.com/coral-xyz/anchor anchor-cli'"
    exit 1
fi

# Build the program
echo "Building program..."
anchor build

# Get the program ID
PROGRAM_ID="FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS"
echo "Program ID: $PROGRAM_ID"

# Set to devnet
echo "Setting Solana config to devnet..."
solana config set --url devnet

# Check devnet balance
BALANCE=$(solana balance | awk '{print $1}')
echo "Current SOL balance on devnet: $BALANCE"

# Airdrop more SOL if needed
if (( $(echo "$BALANCE < 1.0" | bc -l) )); then
    echo "Balance low, requesting airdrop..."
    solana airdrop 2
    sleep 2
fi

# Deploy to devnet
echo "Deploying to devnet..."
anchor deploy --provider.cluster devnet --program-name autotp

echo "Deployment complete. Program ID: $PROGRAM_ID"
echo "Now you can use your app with this program on devnet."

# Update the IDL
echo "Updating IDL..."
anchor idl parse -f programs/autotp/src/lib.rs -o target/idl/autotp.json
mkdir -p ../src/idl && cp target/idl/autotp.json ../src/idl/

echo "Setup complete!" 