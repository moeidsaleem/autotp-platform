#!/bin/bash
set -e

echo "Deploying pre-built AutoTP program to devnet without rebuilding..."

# Check if a prebuilt program binary exists
PREBUILT_BINARY=""

# Look for pre-built binaries in common locations
if [ -f "anchor/target/deploy/autotp.so" ]; then
    PREBUILT_BINARY="anchor/target/deploy/autotp.so"
elif [ -f "anchor/target/sbf-solana-solana/release/autotp.so" ]; then
    PREBUILT_BINARY="anchor/target/sbf-solana-solana/release/autotp.so"
else
    # Try to find the binary anywhere in the project
    FOUND_BINARY=$(find . -name "autotp.so" | head -n 1)
    if [ ! -z "$FOUND_BINARY" ]; then
        PREBUILT_BINARY="$FOUND_BINARY"
    fi
fi

if [ -z "$PREBUILT_BINARY" ]; then
    # If no binary exists, let's try to get the binary from the currently deployed program
    echo "No prebuilt binary found. Attempting to fetch the currently deployed program..."
    
    mkdir -p anchor/target/deploy/
    
    # Set to devnet
    echo "Setting Solana config to devnet..."
    solana config set --url devnet
    
    # Fetch the program binary
    echo "Fetching program from devnet..."
    solana program dump 4zNsNcDNWFJUPhpBF2j6ZBA4f6arEHn3hEx1osH6Hvkq anchor/target/deploy/autotp.so
    
    if [ ! -f "anchor/target/deploy/autotp.so" ]; then
        echo "Error: Failed to fetch the program binary from devnet."
        echo "Please build the program first or provide a prebuilt binary."
        exit 1
    fi
    
    PREBUILT_BINARY="anchor/target/deploy/autotp.so"
fi

echo "Using prebuilt binary: $PREBUILT_BINARY"

# Generate a new keypair for the program if it doesn't exist
if [ ! -f "anchor/program-keypair.json" ]; then
    echo "Generating new program keypair..."
    solana-keygen new -o anchor/program-keypair.json --no-bip39-passphrase
fi

# Get the program ID from the keypair
PROGRAM_ID=$(solana-keygen pubkey anchor/program-keypair.json)
echo "Using program ID: $PROGRAM_ID"

# Set to devnet
echo "Setting Solana config to devnet..."
solana config set --url devnet

# Check devnet balance
BALANCE=$(solana balance | awk '{print $1}')
echo "Current SOL balance on devnet: $BALANCE"

# Make sure we have enough SOL
if (( $(echo "$BALANCE < 5.0" | bc -l) )); then
    echo "Need more SOL for deployment, requesting airdrops..."
    
    # Try multiple airdrops to get enough SOL
    for i in {1..3}; do
        echo "Airdrop attempt $i..."
        solana airdrop 2
        sleep 3
    done
    
    # Check balance again
    BALANCE=$(solana balance | awk '{print $1}')
    echo "Updated SOL balance on devnet: $BALANCE"
    
    if (( $(echo "$BALANCE < 5.0" | bc -l) )); then
        echo "Warning: Balance may still be too low for deployment."
        echo "Consider funding this wallet from another source if deployment fails."
    fi
fi

# Deploy to devnet
echo "Deploying program to devnet..."
solana program deploy "$PREBUILT_BINARY" \
    --program-id anchor/program-keypair.json

echo "Program deployed to devnet with ID: $PROGRAM_ID"
echo ""
echo "Would you like to update all program ID references in the codebase to use this new program ID? (y/n)"
read -p "Update program IDs? " choice

if [[ "$choice" == "y" || "$choice" == "Y" ]]; then
    echo "Updating program IDs in all files..."
    ./update-program-id.sh "$PROGRAM_ID"
else
    echo ""
    echo "Program IDs not updated. If you want to use this new program, you will need to update the program ID in:"
    echo "1. src/lib/auto-tp-program.ts"
    echo "2. src/idl/index.ts"
    echo "3. src/lib/referral-service.ts"
    echo "4. src/idl/autotp.json (metadata.address field)"
    echo "5. anchor/Anchor.toml"
    echo ""
    echo "You can run './update-program-id.sh $PROGRAM_ID' to update all files at once."
fi 