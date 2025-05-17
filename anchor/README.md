# AutoTP Anchor Program

This is a Solana program for automatic take profit orders.

## Current Status

The frontend is currently using a placeholder program ID for development:
- The UI is configured to use a known program ID on devnet (Serum DEX) for testing the flow
- Transactions will be created correctly but will fail on-chain since our real program isn't deployed yet
- This allows UI testing without requiring a deployed program

## Running the Frontend

```bash
# Navigate to the frontend directory
cd ..

# Install dependencies
yarn install

# Start the development server
yarn dev
```

## Deployment Steps

When you're ready to deploy the actual program to devnet:

1. **Set up the Solana build environment**:
   ```bash
   # Install Solana version specified in Anchor.toml
   sh -c "$(curl -sSfL https://release.solana.com/v1.14.17/install)"
   
   # Install required Rust components
   rustup component add rust-src
   rustup target add bpf
   ```

2. **Build and deploy**:
   ```bash
   # Make sure deploy.sh is executable
   chmod +x deploy.sh
   
   # Deploy to devnet
   ./deploy.sh
   ```

3. **Update program IDs**:
   - After deployment, update the program ID in `src/lib/solana.ts` and `src/lib/auto-tp-program.ts` to your actual deployed program ID

## Troubleshooting Deployment

If you encounter build issues:

1. Make sure you're using the correct version of Solana CLI (1.14.17)
2. Check that the program ID in Anchor.toml matches the one in your Rust program
3. Ensure you have sufficient SOL in your devnet wallet for deployment

## Version Compatibility

- Anchor: 0.27.0
- Solana Program: 1.14.17

## Program Overview

The AutoTP program allows users to:
- Create take profit vaults
- Set target prices for token sales
- Automatically execute sales when price conditions are met
- Distribute fees to protocol and referrers

## Next Steps

1. **Deploy program**: Follow the deployment steps to get the program on devnet
2. **Update program IDs**: Replace placeholder IDs with your actual deployed program ID
3. **Testing**: Test the full flow with a real deployed program
4. **Onchain price oracle**: Implement price feed integration for automated execution
5. **UI refinements**: Improve the user interface for better UX 