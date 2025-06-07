# AutoTP Deployment Guide

## Current Deployment Status

The Solana program for AutoTP is **already deployed** on devnet at the following address:
```
4zNsNcDNWFJUPhpBF2j6ZBA4f6arEHn3hEx1osH6Hvkq
```

This program is executable and ready for use. The frontend is configured to use this program ID.

## Running the Frontend

To run the frontend application without needing to rebuild or redeploy the Solana program:

1. Make sure you're in the project root directory
2. Run the start script: `./start-app.sh`

This will launch the Next.js development server which connects to the deployed program on devnet.

## Troubleshooting

### "Program not found" Error

If you encounter a "Program not found" error when using the application, it could be due to:

1. You're not connected to devnet (the application should handle this automatically)
2. Your wallet doesn't have enough SOL on devnet (get some from a faucet)
3. Network issues with the Solana RPC endpoint

You can verify the program exists by running:
```bash
cd anchor
./verify-program.sh
```

### Build Issues

If you need to modify the Solana program in the future, you may encounter build issues due to dependency conflicts. The current Cargo.lock file is using version 4, which requires the `-Znext-lockfile-bump` flag when building.

For now, it's recommended to avoid rebuilding the program unless absolutely necessary. If you do need to rebuild:

1. Consider downgrading Rust to a compatible version
2. Or use the nightly toolchain with the appropriate flags
3. Test any changes thoroughly on localnet before deploying

## Deployment Authority

The program's upgrade authority is:
```
9MvXwhCoPFqESxMWUZBJjBQxfmgMThjiEnuR9JrBRrrt
```

Note that you cannot redeploy or upgrade the program unless you have access to this authority's keypair. 