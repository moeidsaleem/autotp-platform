#!/bin/bash

set -e
set -x

# Clean any previous builds
echo "Cleaning previous build artifacts..."
rm -rf target/deploy/ target/idl/ .anchor/

# Set environment variables to disable frozen-abi
export ANCHOR_SKIP_IDL_BUILD=1 ANCHOR_SKIP_LINT=1

# Build the program using direct cargo commands
echo "Building program..."
(cd programs/autotp && cargo build-sbf)

# Create deployment directory
mkdir -p target/deploy/

# Copy binary to expected location
echo "Copying binary..."
cp target/sbf-solana-solana/release/autotp.so target/deploy/autotp.so

# Generate a local keypair for testing (this won't match the real program ID)
echo "Generating new keypair for local testing..."
solana-keygen new --no-passphrase -o target/deploy/local-keypair.json

# Set to localnet (localhost) for local testing
echo "Setting Solana config to localhost..."
solana config set --url localhost

# Start local validator if not running
if ! solana gossip | grep -q "127.0.0.1"; then
  echo "Starting local validator..."
  solana-test-validator -r &
  sleep 5
fi

# Try to airdrop funds to the keypair
echo "Airdropping SOL to the local account..."
solana airdrop 2 $(solana-keygen pubkey target/deploy/local-keypair.json)
sleep 2

# Deploy the program locally with the local keypair
echo "Deploying program locally..."
solana program deploy target/deploy/autotp.so --program-id target/deploy/local-keypair.json

# Generate the IDL manually
echo "Generating IDL..."
mkdir -p target/idl
anchor idl parse -f programs/autotp/src/lib.rs -o target/idl/autotp.json
mkdir -p ../src/idl && cp target/idl/autotp.json ../src/idl/

# Print out the program ID for reference
echo "Deployment complete. Local Program ID: $(solana-keygen pubkey target/deploy/local-keypair.json)"
echo "Note: This is different from your actual program ID in production."
echo "For frontend testing against this local deployment, update your frontend to use this local program ID." 