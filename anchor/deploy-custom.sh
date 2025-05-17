#!/bin/bash

# Exit on error
set -e
# Echo commands
set -x

# Make sure required tools are installed
if ! command -v anchor &> /dev/null; then
    echo "Error: Anchor CLI is not installed. Install with 'cargo install --git https://github.com/coral-xyz/anchor anchor-cli'"
    exit 1
fi

# Clean any previous builds
echo "Cleaning previous build artifacts..."
rm -rf target/deploy/
rm -rf target/idl/
rm -rf .anchor/

# Use Anchor build directly with the updated configs in Anchor.toml
echo "Building program using anchor build..."
export ANCHOR_SKIP_IDL_BUILD=1 
export ANCHOR_SKIP_LINT=1
anchor build

# Check if build succeeded by verifying file exists
if [ ! -f "target/deploy/autotp.so" ]; then
    echo "Build failed - target/deploy/autotp.so not found."
    exit 1
else
    echo "Build successful! Binary size: $(ls -lh target/deploy/autotp.so | awk '{print $5}')"
fi

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

# Attempt to deploy
echo "Deploying to devnet..."
solana program deploy target/deploy/autotp.so --program-id $PROGRAM_ID

# Generate the IDL manually
echo "Generating IDL..."
mkdir -p target/idl
anchor idl parse -f programs/autotp/src/lib.rs -o target/idl/autotp.json
mkdir -p ../src/idl && cp target/idl/autotp.json ../src/idl/

echo "Deployment complete. Program ID: $PROGRAM_ID"
echo "Now you can use your app with this program on devnet."
echo "Setup complete!" 