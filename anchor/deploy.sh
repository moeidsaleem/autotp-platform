#!/bin/bash

# Exit on error
set -e

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

# Set environment variables to disable frozen-abi
export RUSTFLAGS="--cfg feature=\"no-idl-build\" --cfg feature=\"skip-lint\""

# Build the program first using cargo directly with specific flags
echo "Building program using cargo with disabled frozen-abi..."
cd programs/anchor
cargo +nightly build-sbf --no-default-features -Znext-lockfile-bump
cd ../..

# Copy binary to expected location
echo "Setting up deployment files..."
mkdir -p target/deploy/
cp $(find ./target/deploy -name "*.so" 2>/dev/null || echo "./target/sbf-solana-solana/release/autotp.so") target/deploy/autotp.so

# Get the program ID
PROGRAM_ID="4zNsNcDNWFJUPhpBF2j6ZBA4f6arEHn3hEx1osH6Hvkq"
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

# Deploy to devnet using solana cli directly
echo "Deploying to devnet..."
solana program deploy target/deploy/autotp.so --program-id $PROGRAM_ID

# Generate the IDL manually
echo "Generating IDL..."
mkdir -p target/idl
anchor idl parse -f programs/anchor/src/lib.rs -o target/idl/autotp.json
mkdir -p ../src/idl && cp target/idl/autotp.json ../src/idl/

echo "Deployment complete. Program ID: $PROGRAM_ID"
echo "Now you can use your app with this program on devnet."
echo "Setup complete!" 