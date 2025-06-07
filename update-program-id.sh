#!/bin/bash
set -e

# Check if a program ID is provided
if [ -z "$1" ]; then
    echo "Usage: ./update-program-id.sh <NEW_PROGRAM_ID>"
    echo "Example: ./update-program-id.sh AbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdef"
    exit 1
fi

NEW_PROGRAM_ID=$1
OLD_PROGRAM_ID="4zNsNcDNWFJUPhpBF2j6ZBA4f6arEHn3hEx1osH6Hvkq"

echo "Updating program ID in all files..."
echo "Old Program ID: $OLD_PROGRAM_ID"
echo "New Program ID: $NEW_PROGRAM_ID"

# Update auto-tp-program.ts
echo "Updating src/lib/auto-tp-program.ts..."
sed -i '' "s|$OLD_PROGRAM_ID|$NEW_PROGRAM_ID|g" src/lib/auto-tp-program.ts

# Update idl/index.ts
echo "Updating src/idl/index.ts..."
sed -i '' "s|$OLD_PROGRAM_ID|$NEW_PROGRAM_ID|g" src/idl/index.ts

# Update referral-service.ts
echo "Updating src/lib/referral-service.ts..."
sed -i '' "s|$OLD_PROGRAM_ID|$NEW_PROGRAM_ID|g" src/lib/referral-service.ts

# Update autotp.json
echo "Updating src/idl/autotp.json..."
sed -i '' "s|$OLD_PROGRAM_ID|$NEW_PROGRAM_ID|g" src/idl/autotp.json

# Update Anchor.toml
echo "Updating anchor/Anchor.toml..."
sed -i '' "s|$OLD_PROGRAM_ID|$NEW_PROGRAM_ID|g" anchor/Anchor.toml

echo "Program ID updated in all files!"
echo ""
echo "You can now run the frontend with the updated program ID:"
echo "./start-app.sh" 