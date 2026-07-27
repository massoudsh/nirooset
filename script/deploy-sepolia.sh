#!/usr/bin/env bash
# Deploy GRIDSET contracts to Sepolia. Requires PRIVATE_KEY and ~0.01 Sepolia ETH.
# Get test ETH: https://sepoliafaucet.com/
set -e
cd "$(dirname "$0")/.."
export RPC_URL="${RPC_URL:-https://ethereum-sepolia-rpc.publicnode.com}"
forge script script/Deploy.s.sol --rpc-url "$RPC_URL" --broadcast
echo ""
echo "Copy the logged addresses into ui/.env (see ui/.env.example), then: cd ui && npm run dev"
