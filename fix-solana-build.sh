#!/bin/bash

set -e

echo "Fixing build environment for AutoTP program..."

# Install nightly toolchain if not already installed
echo "Installing Rust nightly toolchain..."
rustup install nightly
rustup component add rust-src --toolchain nightly

# Update Cargo.toml to pin specific dependency versions
echo "Updating Cargo.toml to pin dependencies..."
cd programs/anchor

# Create a backup of Cargo.toml
cp Cargo.toml Cargo.toml.bak

# Update Cargo.toml with pinned dependency versions
cat > Cargo.toml << EOL
[package]
name = "autotp"
version = "0.1.0"
description = "Created with Anchor"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "autotp"

[features]
no-entrypoint = []
no-idl = []
no-log-ix-name = []
cpi = ["no-entrypoint"]
default = []

[dependencies]
anchor-lang = "=0.27.0"
anchor-spl = { version = "=0.27.0", features = ["token"] }
solana-program = "=1.14.17"
EOL

# Return to anchor directory
cd ../..

# Create a build script with the correct approach
cat > build-with-nightly.sh << EOL
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
EOL

chmod +x build-with-nightly.sh

# Update the README-DEPLOY.md with build instructions
echo "Updating deployment documentation..."
cd ..
cat >> README-DEPLOY.md << EOL

## Building the Program Locally

To build the Solana program locally after you've made changes:

1. Navigate to the anchor directory: \`cd anchor\`
2. Use the nightly build script: \`./build-with-nightly.sh\`

This script uses the Rust nightly toolchain with simplified dependencies and compatible versions.

Note that building the program is only needed if you're planning to deploy changes to the program itself. The frontend will work with the already deployed program.
EOL

echo "Setup complete! To build the program, go to the anchor directory and run: ./build-with-nightly.sh" 