#!/bin/bash
set -e

echo "Verifying AutoTP program deployment on devnet..."

# Get the program ID from auto-tp-program.ts
PROGRAM_ID=$(grep -o "AUTOTP_PROGRAM_ID = new PublicKey.*" src/lib/auto-tp-program.ts | grep -o "'[^']*'" | tr -d "'" || grep -o "AUTOTP_PROGRAM_ID = new PublicKey.*" src/lib/auto-tp-program.ts | grep -o '"[^"]*"' | tr -d '"')
echo "Program ID from codebase: $PROGRAM_ID"

# Set to devnet
echo "Setting Solana config to devnet..."
solana config set --url devnet

# Check if the program exists on devnet
echo "Checking if program exists on devnet..."
PROGRAM_INFO=$(solana program show $PROGRAM_ID 2>&1)

if [[ $PROGRAM_INFO == *"Error"* ]]; then
    echo "ERROR: Program not found on devnet!"
    echo "$PROGRAM_INFO"
    exit 1
else
    echo "SUCCESS: Program found on devnet!"
    echo "$PROGRAM_INFO"
    
    # Get program data size
    PROGRAM_SIZE=$(echo "$PROGRAM_INFO" | grep "Program data size:" | awk '{print $4}')
    echo "Program size: $PROGRAM_SIZE bytes"
    
    echo "Program is correctly deployed and accessible on devnet."
fi 