#!/bin/bash
set -e

echo "Building AutoTP program with compatible settings..."

# Set environment variables
export RUSTFLAGS="--cfg feature=\"no-idl-build\" --cfg feature=\"skip-lint\""
export ANCHOR_SKIP_IDL_BUILD=1 
export ANCHOR_SKIP_LINT=1

# Use cargo to build directly
echo "Building with cargo directly..."
(cd programs/anchor && cargo +nightly build-bpf)

echo "Creating deployment files..."
mkdir -p target/deploy/
cp target/sbf-solana-solana/release/autotp.so target/deploy/ 2>/dev/null || cp target/deploy/autotp.so target/deploy/ 2>/dev/null || echo "Warning: Could not find compiled program binary"

echo "Build complete!" 