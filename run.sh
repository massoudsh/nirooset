#!/bin/bash
# نیروست Protocol - Run Script

cd "$(dirname "$0")"

echo "🔨 Building نیروست Protocol..."
forge build

echo ""
echo "🧪 Running tests..."
forge test

echo ""
echo "✅ Done! All tests passed."
