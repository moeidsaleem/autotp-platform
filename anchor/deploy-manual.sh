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

# Copy binary to deployment directory
echo "Copying binary..."
cp target/sbf-solana-solana/release/autotp.so target/deploy/

# Deploy to devnet
echo "Deploying to devnet..."
solana config set --url devnet
PROGRAM_ID="FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS"

# Deploy the program
solana program deploy target/deploy/autotp.so --program-id $PROGRAM_ID

# Generate the IDL manually
echo "Generating IDL..."
mkdir -p target/idl
anchor idl parse -f programs/autotp/src/lib.rs -o target/idl/autotp.json
mkdir -p ../src/idl && cp target/idl/autotp.json ../src/idl/

echo "Deployment complete. Program ID: $PROGRAM_ID" 