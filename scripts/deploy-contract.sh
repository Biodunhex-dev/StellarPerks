#!/usr/bin/env bash
# deploy-contract.sh — Build and deploy the loyalty_program Soroban contract
set -euo pipefail

NETWORK="${NETWORK:-testnet}"
WASM="contracts/wasm/loyalty_program.wasm"
DEPLOYMENTS_FILE="deployments.json"

# Validate required env vars
: "${DEPLOYER_SECRET:?DEPLOYER_SECRET env var required}"

echo "==> Building WASM..."
source ~/.cargo/env 2>/dev/null || true
cargo build -p loyalty-program --target wasm32-unknown-unknown --release
mkdir -p contracts/wasm
cp target/wasm32-unknown-unknown/release/loyalty_program.wasm "$WASM"
echo "    WASM size: $(wc -c < "$WASM") bytes"

# Derive public key from secret
DEPLOYER_PUBLIC=$(stellar keys address "$DEPLOYER_SECRET" 2>/dev/null || \
  node -e "const {Keypair}=require('@stellar/stellar-sdk'); console.log(Keypair.fromSecret('$DEPLOYER_SECRET').publicKey())")

echo "==> Deployer: $DEPLOYER_PUBLIC"
echo "==> Network:  $NETWORK"

# Fund on testnet if needed
if [ "$NETWORK" = "testnet" ]; then
  echo "==> Funding via Friendbot..."
  curl -sf "https://friendbot.stellar.org?addr=$DEPLOYER_PUBLIC" > /dev/null || true
fi

# Deploy using stellar CLI if available, otherwise print instructions
if command -v stellar &>/dev/null; then
  echo "==> Uploading contract..."
  WASM_HASH=$(stellar contract upload \
    --wasm "$WASM" \
    --source "$DEPLOYER_SECRET" \
    --network "$NETWORK")
  echo "    WASM hash: $WASM_HASH"

  echo "==> Deploying contract..."
  CONTRACT_ID=$(stellar contract deploy \
    --wasm-hash "$WASM_HASH" \
    --source "$DEPLOYER_SECRET" \
    --network "$NETWORK")
  echo "    Contract ID: $CONTRACT_ID"

  echo "==> Initializing contract..."
  stellar contract invoke \
    --id "$CONTRACT_ID" \
    --source "$DEPLOYER_SECRET" \
    --network "$NETWORK" \
    -- initialize \
    --admin "$DEPLOYER_PUBLIC"

  # Save deployment info
  node -e "
    const fs = require('fs');
    const existing = fs.existsSync('$DEPLOYMENTS_FILE') ? JSON.parse(fs.readFileSync('$DEPLOYMENTS_FILE')) : {};
    existing['$NETWORK'] = { contractId: '$CONTRACT_ID', wasmHash: '$WASM_HASH', deployedAt: new Date().toISOString() };
    fs.writeFileSync('$DEPLOYMENTS_FILE', JSON.stringify(existing, null, 2));
  "
  echo "==> Saved to $DEPLOYMENTS_FILE"
  echo "==> Done! CONTRACT_ID=$CONTRACT_ID"
else
  echo ""
  echo "stellar CLI not found. Install it from https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli"
  echo "Then run this script again, or manually deploy with:"
  echo "  stellar contract upload --wasm $WASM --source \$DEPLOYER_SECRET --network $NETWORK"
fi
