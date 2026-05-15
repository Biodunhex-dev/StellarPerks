# StellarPerks

A full-stack blockchain loyalty rewards platform built on [Stellar](https://stellar.org) using [Soroban](https://soroban.stellar.org) smart contracts. Businesses create on-chain loyalty programs; users earn and redeem tokenized points with secure wallet integration.

## Architecture

```
stellarperks/
├── contracts/loyalty_program/   # Soroban smart contract (Rust)
├── packages/
│   ├── sdk/                     # TypeScript SDK (@stellarperks/sdk)
│   ├── backend/                 # Express API server
│   └── frontend/                # Next.js web app
└── scripts/                     # Deployment & setup scripts
```

### Smart Contract (Soroban / Rust)

Functions: `initialize`, `create_program`, `issue_points`, `redeem_points`, `get_balance`, `get_program`, `deactivate_program`

### SDK (`@stellarperks/sdk`)

Wraps Soroban RPC calls and wallet utilities. Use it in any Node.js or browser project.

### Backend (Express / TypeScript)

REST API with API-key auth:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/api/businesses` | Register a business |
| GET | `/api/businesses` | List businesses |
| POST | `/api/users` | Register a user |
| GET | `/api/users` | List users |
| POST | `/api/events` | Track issue/redeem event |
| GET | `/api/events` | List events (filter by `?programId=`) |
| GET | `/api/events/analytics` | Aggregated analytics |

### Frontend (Next.js)

Pages: `/` Dashboard · `/earn` Issue Points · `/redeem` Redeem Points · `/analytics` Event Analytics

---

## Prerequisites

- **Node.js** ≥ 18
- **Rust** + `wasm32-unknown-unknown` target (for contract builds)
- **npm** ≥ 9

Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source ~/.cargo/env
rustup target add wasm32-unknown-unknown
```

---

## Quick Start

### 1. Install & Build Everything

```bash
git clone https://github.com/your-username/stellarperks.git
cd stellarperks
./scripts/setup.sh
```

This installs all Node dependencies and builds the SDK, backend, and frontend.

### 2. Configure Environment

```bash
# Backend
cp packages/backend/.env.example packages/backend/.env
# Edit: set API_KEY, CONTRACT_ID (after deploying contract)

# Frontend
cp packages/frontend/.env.example packages/frontend/.env.local
# Edit: set NEXT_PUBLIC_CONTRACT_ID, NEXT_PUBLIC_API_KEY
```

### 3. Start Development Servers

```bash
# Terminal 1 — Backend (port 3001)
npm run dev:backend

# Terminal 2 — Frontend (port 3000)
npm run dev:frontend
```

---

## Smart Contract

### Run Tests

```bash
cargo test -p loyalty-program
```

### Build WASM

```bash
cargo build -p loyalty-program --target wasm32-unknown-unknown --release
# Output: target/wasm32-unknown-unknown/release/loyalty_program.wasm
```

### Deploy to Testnet

Install the [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli), then:

```bash
export DEPLOYER_SECRET=S...   # your Stellar secret key
export NETWORK=testnet
./scripts/deploy-contract.sh
```

The script funds the account via Friendbot, uploads the WASM, deploys the contract, calls `initialize`, and saves the contract ID to `deployments.json`.

---

## SDK Usage

```typescript
import { StellarPerksClient, generateKeypair, TESTNET_CONFIG } from "@stellarperks/sdk";
import { Keypair } from "@stellar/stellar-sdk";

const client = new StellarPerksClient({
  ...TESTNET_CONFIG,
  contractId: "C...",  // from deployments.json
});

// Generate wallets
const owner = generateKeypair();
const user  = generateKeypair();

// Create a loyalty program
await client.createProgram(
  Keypair.fromSecret(owner.secretKey),
  "coffee-rewards",
  "Coffee Rewards",
  10  // points per unit
);

// Issue points
await client.issuePoints(
  Keypair.fromSecret(owner.secretKey),
  "coffee-rewards",
  user.publicKey,
  100
);

// Check balance
const balance = await client.getBalance("coffee-rewards", user.publicKey);
console.log(balance); // 100

// Redeem points
await client.redeemPoints(
  Keypair.fromSecret(user.secretKey),
  "coffee-rewards",
  50
);
```

---

## Running Tests

```bash
# All tests
npm test

# Contract only (Rust)
cargo test -p loyalty-program

# SDK only
npm test -w packages/sdk

# Backend only
npm test -w packages/backend
```

**Test results:** 20 tests total — 3 contract, 5 SDK, 12 backend API — all passing.

---

## Project Structure

```
contracts/
  loyalty_program/
    src/lib.rs          # Soroban contract
    Cargo.toml
  wasm/
    loyalty_program.wasm

packages/
  sdk/
    src/
      client.ts         # StellarPerksClient
      wallet.ts         # generateKeypair, fundTestnetAccount
      types.ts          # Shared types
      index.ts

  backend/
    src/
      index.ts          # Express app entry
      middleware/auth.ts
      routes/
        businesses.ts
        users.ts
        events.ts
      db/store.ts       # In-memory store

  frontend/
    app/
      layout.tsx
      page.tsx          # Dashboard
      earn/page.tsx
      redeem/page.tsx
      analytics/page.tsx
    lib/api.ts          # Backend API client

scripts/
  setup.sh             # Install + build all
  deploy-contract.sh   # Build + deploy Soroban contract
  deploy-backend.sh    # Build backend
```

---

## Environment Variables

### Backend (`packages/backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `API_KEY` | `dev-key` | API authentication key |
| `CONTRACT_ID` | — | Deployed contract ID |
| `NETWORK` | `testnet` | `testnet` or `mainnet` |

### Frontend (`packages/frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL (default: `http://localhost:3001`) |
| `NEXT_PUBLIC_CONTRACT_ID` | Deployed contract ID |
| `NEXT_PUBLIC_NETWORK` | `testnet` or `mainnet` |

---

## License

MIT
