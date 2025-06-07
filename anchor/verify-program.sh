#!/bin/bash

set -e

# Set to devnet
echo "Setting Solana config to devnet..."
solana config set --url devnet

# Set the program ID to match the frontend code
PROGRAM_ID="4zNsNcDNWFJUPhpBF2j6ZBA4f6arEHn3hEx1osH6Hvkq"
echo "Using program ID: $PROGRAM_ID"

# Verify program exists
echo "Verifying program exists on devnet..."
solana account $PROGRAM_ID

# Get program details
echo "Getting program details..."
solana program show $PROGRAM_ID

echo "Program verification complete. The program is deployed and executable on devnet."
echo "No need to redeploy - your frontend should be able to interact with it." 