#!/bin/bash
set -e

echo "Building AutoTP program with compatible settings..."

# Set environment variables
export RUSTFLAGS="--cfg feature=\"no-idl-build\" --cfg feature=\"skip-lint\""
export ANCHOR_SKIP_IDL_BUILD=1 
export ANCHOR_SKIP_LINT=1

# Try to use cargo directly with the next-lockfile-bump flag
echo "Building with nightly toolchain and lockfile version 4 support..."
cd programs/anchor
cargo +nightly -Z next-lockfile-bump build-bpf
cd ../..

echo "Creating deployment files..."
mkdir -p target/deploy/
cp target/sbf-solana-solana/release/autotp.so target/deploy/ 2>/dev/null || \
cp target/deploy/autotp.so target/deploy/ 2>/dev/null || \
find . -name "autotp.so" -exec cp {} target/deploy/ \; || \
echo "Warning: Could not find compiled program binary"

echo "Build complete!" 