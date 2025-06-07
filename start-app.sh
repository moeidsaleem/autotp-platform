#!/bin/bash

set -e

echo "Starting AutoTP frontend application..."
echo "This will connect to the already deployed program on devnet."
echo "Program ID: 4zNsNcDNWFJUPhpBF2j6ZBA4f6arEHn3hEx1osH6Hvkq"
echo ""

# Ensure we're in the root directory
cd "$(dirname "$0")"

# Optional: clean previous build artifacts
echo "Cleaning previous build artifacts..."
rm -rf .next

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the app in development mode
echo "Starting application in development mode..."
npm run dev 