# Testing and Monitoring the AutoTP Application

This guide will help you properly test and monitor the AutoTP (Auto Take Profit) Solana application to identify and troubleshoot any issues.

## Quick Start

To quickly verify that everything is working properly, run:

```bash
./test-functionality.sh
```

This script will check:
1. Program deployment status
2. Connection to Solana devnet
3. Wallet balance
4. Program data accessibility
5. Frontend application status

## Manual Testing Steps

### 1. Verify Program Deployment

Check if the program is correctly deployed on devnet:

```bash
./verify-program.sh
```

### 2. Start the Frontend

If the frontend isn't already running, start it with:

```bash
./start-app.sh
```

This will start the Next.js application on http://localhost:3001.

### 3. Monitor the Application

Use our monitoring script to help detect issues in real-time:

```bash
./monitor-app.sh
```

Choose from two monitoring options:
- **Option 1**: Monitor program logs - shows transaction details when actions occur
- **Option 2**: Check network status - displays periodic health checks of the system

### 4. Testing Workflow

1. Open the application in your browser at http://localhost:3001
2. Connect your wallet (use a wallet with devnet SOL)
3. Create a take profit order:
   - Select a token
   - Set a target price multiplier
   - Choose a percentage to sell
   - Submit the transaction
4. Monitor the logs to ensure the transaction is processed correctly
5. Test cancelling an order if needed

## Common Issues and Solutions

### Program Not Found on Network

If you encounter the error "Program not found on the network":
1. Verify the program ID using `./verify-program.sh`
2. If needed, deploy the program using `./deploy-prebuilt.sh`
3. Update program IDs using `./update-program-id.sh <NEW_PROGRAM_ID>`

### Low Wallet Balance

If you have insufficient SOL for transactions:
```bash
solana airdrop 2
```

### Cannot Connect to Devnet

If you're having connectivity issues with devnet:
1. Check your internet connection
2. Confirm devnet status: `solana cluster-version`
3. Try switching to a different RPC endpoint:
   ```bash
   solana config set --url https://api.devnet.solana.com
   ```

### Transaction Failures

If your transactions fail:
1. Check program logs: `solana logs <PROGRAM_ID>`
2. Verify wallet has sufficient SOL
3. Ensure you're using the correct program ID
4. Make sure the transaction parameters are valid

## Advanced Testing

For more advanced testing scenarios or troubleshooting, you can:

1. Use the Solana CLI to inspect accounts:
   ```bash
   solana account <ACCOUNT_ADDRESS>
   ```

2. Check program data on devnet:
   ```bash
   solana program show <PROGRAM_ID>
   ```

3. Analyze transaction details:
   ```bash
   solana confirm -v <TRANSACTION_SIGNATURE>
   ```

## Additional Resources

- [Solana CLI Documentation](https://docs.solana.com/cli)
- [Solana Program Deployment](https://docs.solana.com/cli/deploy-a-program)
- [Solana Devnet Guide](https://docs.solana.com/clusters#devnet)

For additional questions or issues, please reach out to the development team. 