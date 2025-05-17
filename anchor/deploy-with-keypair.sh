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

# Get the program ID
PROGRAM_ID="FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS"
KEYPAIR_FILE="target/deploy/autotp-keypair.json"

# Check if the keypair file already exists
if [ ! -f "$KEYPAIR_FILE" ]; then
    echo "Program keypair file doesn't exist, creating a compatible keypair for $PROGRAM_ID..."
    
    # Output path for the keypair file
    mkdir -p "$(dirname "$KEYPAIR_FILE")"
    
    # This command generates a keypair with a specific address if available
    # For a real deployment, you'd need to recover the original keypair
    # For this example, we'll check if we can recover it from the current wallet
    if solana address -k ~/.config/solana/id.json | grep -q "$PROGRAM_ID"; then
        cp ~/.config/solana/id.json "$KEYPAIR_FILE"
        echo "Used existing keypair from Solana wallet"
    else
        # For development purposes only - create a dummy keypair
        # THIS IS JUST FOR DEMONSTRATION - won't work for real deployment
        solana-keygen new --no-passphrase -o "$KEYPAIR_FILE"
        echo "Created new keypair for development purposes"
        echo "WARNING: This is a placeholder and won't match the program ID"
        echo "For real deployment you need the original keypair that generated $PROGRAM_ID"
    fi
fi

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

# For development, we can use the upgrade flag if we don't have the original keypair
echo "Attempting program deployment..."
if [ -f "$KEYPAIR_FILE" ]; then
    # Try normal deployment first with keypair
    solana program deploy target/deploy/autotp.so --program-id "$KEYPAIR_FILE" || {
        echo "Regular deployment failed, trying upgrade approach..."
        # If regular deployment fails, try upgrade approach (requires program to be deployed first)
        solana program deploy target/deploy/autotp.so --upgrade
    }
else
    # Try upgrade approach (requires program to be deployed first)
    solana program deploy target/deploy/autotp.so --upgrade
fi

# Generate the IDL manually
echo "Generating IDL..."
mkdir -p target/idl
anchor idl parse -f programs/autotp/src/lib.rs -o target/idl/autotp.json
mkdir -p ../src/idl && cp target/idl/autotp.json ../src/idl/

echo "Deployment complete. Program ID: $PROGRAM_ID" 