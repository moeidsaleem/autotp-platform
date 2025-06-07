#!/bin/bash
set -e

echo "AutoTP Application Monitoring"
echo "============================"
echo "This script helps you monitor the application for errors."
echo "Press Ctrl+C to exit at any time."
echo ""

# Ensure we're connected to devnet
echo "Setting Solana config to devnet..."
solana config set --url devnet > /dev/null

# Function to get program logs
get_program_logs() {
    local program_id=$(grep -o "AUTOTP_PROGRAM_ID = new PublicKey.*" src/lib/auto-tp-program.ts | grep -o "'[^']*'" | tr -d "'" || grep -o "AUTOTP_PROGRAM_ID = new PublicKey.*" src/lib/auto-tp-program.ts | grep -o '"[^"]*"' | tr -d '"')
    echo "Monitoring logs for program: $program_id"
    echo "NOTE: This will show logs for transactions involving your program."
    echo "When you perform actions in the UI, you should see related logs here."
    echo "--------------------------------------------------"
    solana logs $program_id
}

# Function to monitor network status
check_network_status() {
    while true; do
        clear
        echo "AutoTP Network Monitor"
        echo "---------------------"
        echo "Current time: $(date)"
        echo ""
        
        # Check connection status
        DEVNET_STATUS=$(solana cluster-version 2>&1)
        if [[ $DEVNET_STATUS == *"Error"* ]]; then
            echo "⚠️  WARNING: Could not connect to devnet. Network may be congested."
        else
            echo "✅ Devnet connection: ONLINE (version $DEVNET_STATUS)"
        fi
        
        # Check program status
        PROGRAM_ID=$(grep -o "AUTOTP_PROGRAM_ID = new PublicKey.*" src/lib/auto-tp-program.ts | grep -o "'[^']*'" | tr -d "'" || grep -o "AUTOTP_PROGRAM_ID = new PublicKey.*" src/lib/auto-tp-program.ts | grep -o '"[^"]*"' | tr -d '"')
        PROGRAM_INFO=$(solana program show $PROGRAM_ID 2>&1)
        if [[ $PROGRAM_INFO == *"Error"* ]]; then
            echo "⚠️  WARNING: Program check failed. Program may not be accessible."
        else
            echo "✅ Program status: ONLINE ($PROGRAM_ID)"
        fi
        
        # Check wallet balance
        BALANCE_STR=$(solana balance)
        BALANCE=$(echo "$BALANCE_STR" | awk '{print $1}')
        if (( $(echo "$BALANCE < 1.0" | bc -l 2>/dev/null || echo 0) )); then
            echo "⚠️  WARNING: Low wallet balance: $BALANCE SOL"
        else
            echo "✅ Wallet balance: $BALANCE SOL"
        fi
        
        # Check frontend status
        FRONTEND_RUNNING=$(ps aux | grep next | grep -c dev)
        if [ "$FRONTEND_RUNNING" -gt 0 ]; then
            echo "✅ Frontend: RUNNING (http://localhost:3001)"
        else
            echo "⚠️  WARNING: Frontend not running!"
        fi
        
        echo ""
        echo "Press Ctrl+C to exit or wait 10 seconds for refresh..."
        sleep 10
    done
}

# Show options menu
echo "Select an option:"
echo "1) Monitor program logs (shows transaction details)"
echo "2) Check network status (periodic health check)"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        get_program_logs
        ;;
    2)
        check_network_status
        ;;
    *)
        echo "Invalid option. Please run again and select 1 or 2."
        exit 1
        ;;
esac 