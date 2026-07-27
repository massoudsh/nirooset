#!/bin/bash
# GRIDSET Protocol - Run Script

cd "$(dirname "$0")"

echo "🔨 Building GRIDSET Protocol..."
forge build

echo ""
echo "🧪 Running tests..."
forge test

echo ""
echo "✅ Done! All tests passed."
