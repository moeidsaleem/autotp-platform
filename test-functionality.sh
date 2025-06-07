#!/bin/bash
set -e

echo "AutoTP Functionality Test Suite"
echo "==============================="

# Verify the program is deployed correctly
echo "1. Verifying program deployment..."
./verify-program.sh

# Check the connection status
echo "2. Checking connection to Solana devnet..."
DEVNET_STATUS=$(solana cluster-version 2>&1)
if [[ $DEVNET_STATUS == *"Error"* ]]; then
  echo "WARNING: Could not connect to devnet. Network may be congested."
else
  echo "SUCCESS: Connected to devnet. Cluster version: $DEVNET_STATUS"
fi

# Check wallet balance
echo "3. Checking wallet balance..."
BALANCE_STR=$(solana balance)
BALANCE=$(echo "$BALANCE_STR" | awk '{print $1}')
echo "Current wallet balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 1.0" | bc -l 2>/dev/null || echo 0) )); then
  echo "WARNING: Low balance. Consider requesting an airdrop with: solana airdrop 2"
else
  echo "SUCCESS: Wallet has sufficient balance for testing."
fi

# Get program ID
PROGRAM_ID=$(grep -o "AUTOTP_PROGRAM_ID = new PublicKey.*" src/lib/auto-tp-program.ts | grep -o "'[^']*'" | tr -d "'" || grep -o "AUTOTP_PROGRAM_ID = new PublicKey.*" src/lib/auto-tp-program.ts | grep -o '"[^"]*"' | tr -d '"')

# Check program data
echo "4. Checking program data..."
echo "Program ID: $PROGRAM_ID"
PROGRAM_DATA=$(solana account $PROGRAM_ID 2>&1)
if [[ $PROGRAM_DATA == *"Error"* ]]; then
  echo "ERROR: Could not fetch program data."
else
  echo "SUCCESS: Program data retrieved successfully."
fi

# Check frontend is running
echo "5. Checking if frontend is running..."
FRONTEND_RUNNING=$(ps aux | grep next | grep -c dev)
if [ "$FRONTEND_RUNNING" -gt 0 ]; then
  echo "SUCCESS: Frontend is running."
  echo "You can access it at: http://localhost:3001"
else
  echo "WARNING: Frontend does not appear to be running."
  echo "Start it with: ./start-app.sh"
fi

echo ""
echo "Testing complete! If all checks passed, your AutoTP application should be working correctly."
echo "Manual testing steps:"
echo "1. Open http://localhost:3001 in your browser"
echo "2. Connect your wallet"
echo "3. Try creating a take profit order"
echo "4. Monitor console for any errors" 