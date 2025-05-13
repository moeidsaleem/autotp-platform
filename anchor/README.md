# AutoTP Anchor Program

This is a Solana program for automatic take profit orders.

## Build Instructions

The program uses a custom build process due to compatibility issues with Solana tools:

```bash
# Build the program
anchor run build

# Generate the IDL
anchor run idl

# Copy the IDL to your frontend
mkdir -p ../src/idl
cp target/idl/autotp.json ../src/idl/
```

## Version Compatibility

- Anchor: 0.27.0
- Solana Program: 1.14.17

## Notes

If you encounter build issues:

1. Make sure the proc-macro2 patch is correctly set in Cargo.toml
2. Use the custom build and IDL commands in Anchor.toml

## Program Overview

The AutoTP program allows users to:
- Create take profit vaults
- Set target prices for token sales
- Automatically execute sales when price conditions are met
- Distribute fees to protocol and referrers 