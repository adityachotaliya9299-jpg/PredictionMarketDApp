# PredictX — Decentralized Prediction Market

<div align="center">

![PredictX Banner](https://img.shields.io/badge/PredictX-Decentralized_Prediction_Market-22d3ee?style=for-the-badge&logo=ethereum)

[![Live Demo](https://img.shields.io/badge/Live_Demo-prediction--market--d--app.vercel.app-22d3ee?style=flat-square&logo=vercel)](https://prediction-market-d-app.vercel.app/)
[![Sepolia](https://img.shields.io/badge/Network-Sepolia_Testnet-627eea?style=flat-square&logo=ethereum)](https://sepolia.etherscan.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)

**A full-stack decentralized prediction market dApp on Ethereum Sepolia testnet. Trade on real-world outcomes using parimutuel pooling, earn PRED tokens for participation, and create multi-outcome markets.**

[Live Demo](https://prediction-market-d-app.vercel.app/) · [Contracts on Etherscan](#deployed-contracts) · [Report Bug](https://github.com/adityachotaliya9299-jpg/PredictionMarketDApp/issues)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Deployed Contracts](#deployed-contracts)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Smart Contracts](#smart-contracts)
- [Frontend](#frontend)
- [The Graph Subgraph](#the-graph-subgraph)
- [Phase 3 Features](#phase-3-features)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

PredictX is a decentralized prediction market protocol built on Ethereum. Users can:

- **Create** YES/NO prediction markets or multi-outcome markets on any topic
- **Trade** by buying shares in outcomes using ETH
- **Earn** PRED tokens as rewards for creating markets and trading
- **Refer** other users and earn 0.5% of their trade volume in ETH
- **Monitor** live ETH/BTC prices powered by Chainlink oracles

Markets use a **parimutuel pooling model** — the entire pool is redistributed to winners proportionally based on their share of the winning outcome. Probabilities are derived dynamically from the ratio of ETH in each outcome pool.

---

## Features

### Core Protocol
- ✅ YES/NO parimutuel prediction markets
- ✅ Multi-outcome markets (2–10 outcomes per market)
- ✅ Dynamic probability pricing (share ratio = probability)
- ✅ Protocol fee system (2% per trade, configurable)
- ✅ On-chain oracle-based resolution
- ✅ Claim rewards after market resolves

### Phase 3 — DeFi Layer
- ✅ **PRED Token** — ERC20 governance/reward token (100M max supply)
- ✅ **Liquidity Mining** — 100 PRED per market created, 10 PRED per trade
- ✅ **Referral System** — On-chain referral tracking, earn 0.5% ETH per referred trade
- ✅ **Chainlink Oracle** — Live ETH/USD and BTC/USD price feeds on Sepolia

### Frontend
- ✅ Next.js 14 with wagmi v2 + RainbowKit wallet connection
- ✅ The Graph subgraph for fast indexed queries
- ✅ Real-time market data with probability bars
- ✅ Portfolio dashboard with rewards tracking
- ✅ Leaderboard with top creators
- ✅ Mobile-responsive design
- ✅ Dark mode UI

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 14)                │
│  wagmi v2 · RainbowKit · viem · The Graph · Chainlink       │
└──────────────────────┬──────────────────────────────────────┘
                       │ RPC + GraphQL
       ┌───────────────▼──────────────────┐
       │         Sepolia Testnet          │
       │  ┌─────────────────────────────┐ │
       │  │      MarketFactory          │ │
       │  │  (deploys PredictionMarket  │ │
       │  │   + wires Phase 3 rewards)  │ │
       │  └──────────┬──────────────────┘ │
       │             │ creates            │
       │  ┌──────────▼──────────────────┐ │
       │  │    PredictionMarket         │ │
       │  │  (YES/NO parimutuel pool)   │ │
       │  └─────────────────────────────┘ │
       │  ┌─────────────────────────────┐ │
       │  │   MultiMarketFactory        │ │
       │  │   MultiOutcomeMarket        │ │
       │  │   (2–10 outcome markets)    │ │
       │  └─────────────────────────────┘ │
       │  ┌─────────────────────────────┐ │
       │  │  PREDToken · LiquidityMining│ │
       │  │  ReferralSystem · Chainlink │ │
       │  └─────────────────────────────┘ │
       └──────────────────────────────────┘
                       │
       ┌───────────────▼───────────────────┐
       │   The Graph — predict-x subgraph  │
       │   (indexes events, fast queries)  │
       └───────────────────────────────────┘
```

---

## Deployed Contracts

All contracts deployed on **Sepolia Testnet**.

| Contract | Address | Description |
|---|---|---|
| MarketFactory | [`0x51430273...`](https://sepolia.etherscan.io/address/0x51430273cA467Fd6a961598B5bcD28d6532A8D33) | Deploys YES/NO markets |
| ChainlinkOracle | [`0x4cb12c69...`](https://sepolia.etherscan.io/address/0x4cb12c69E85A280C41815805C1446b121E8c5462) | Price feed oracle |
| PREDToken | [`0x1a5ecdbc...`](https://sepolia.etherscan.io/address/0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49) | ERC20 reward token |
| LiquidityMining | [`0xAC8e774d...`](https://sepolia.etherscan.io/address/0xAC8e774dd8218D716F455AB7872E7c0843985981) | PRED token distributor |
| ReferralSystem | [`0xaBa4F2D4...`](https://sepolia.etherscan.io/address/0xaBa4F2D457CE0fEf0C06A1e89A3662980C8e1F4A) | On-chain referral tracking |
| MultiOracle | [`0x1aB76B75...`](https://sepolia.etherscan.io/address/0x1aB76B758Cb2c45Ca6E876294F7972133Ebd1619) | Multi-outcome resolution |
| MultiMarketFactory | [`0x30a99B8A...`](https://sepolia.etherscan.io/address/0x30a99B8A1C7b71314160c0396b49eE9db8bbC4Ab) | Deploys multi-outcome markets |

**Subgraph:** [predict-x v0.0.4](https://api.studio.thegraph.com/query/1744854/predict-x/v0.0.4)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.24, Foundry |
| Frontend Framework | Next.js 14 (App Router) |
| Wallet / Web3 | wagmi v2, viem, RainbowKit |
| Indexing | The Graph (custom subgraph) |
| Oracle | Chainlink Price Feeds |
| Styling | Inline styles (SSR-safe) |
| Deployment | Vercel |
| Testing | Forge (130+ tests) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Foundry (`curl -L https://foundry.paradigm.xyz | bash`)
- MetaMask with Sepolia ETH ([faucet](https://sepoliafaucet.com))

### Clone & Install

```bash
git clone https://github.com/adityachotaliya9299-jpg/PredictionMarketDApp.git
cd PredictionMarketDApp
```

### Run Frontend

```bash
cd frontend
cp .env.example .env.local
# Fill in your values in .env.local
npm install
npm run build && npm start
```

### Environment Variables

```env
NEXT_PUBLIC_FACTORY_ADDRESS=0x51430273cA467Fd6a961598B5bcD28d6532A8D33
NEXT_PUBLIC_ORACLE_ADDRESS=0x4cb12c69E85A280C41815805C1446b121E8c5462
NEXT_PUBLIC_WALLETCONNECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_RPC_URL=your_alchemy_or_infura_sepolia_rpc_url
NEXT_PUBLIC_PRED_TOKEN=0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49
NEXT_PUBLIC_LIQUIDITY_MINING=0xAC8e774dd8218D716F455AB7872E7c0843985981
NEXT_PUBLIC_REFERRAL_SYSTEM=0xaBa4F2D457CE0fEf0C06A1e89A3662980C8e1F4A
NEXT_PUBLIC_CHAINLINK_ORACLE=0x4cb12c69E85A280C41815805C1446b121E8c5462
NEXT_PUBLIC_MULTI_ORACLE=0x1aB76B758Cb2c45Ca6E876294F7972133Ebd1619
NEXT_PUBLIC_MULTI_FACTORY=0x30a99B8A1C7b71314160c0396b49eE9db8bbC4Ab
```

### Run Smart Contract Tests

```bash
cd contracts
forge test -vv
```

---

## Smart Contracts

### PredictionMarket.sol

Core YES/NO parimutuel market contract.

```
- buyYesShares()  — buy YES shares with ETH
- buyNoShares()   — buy NO shares with ETH
- resolve()       — trigger oracle resolution after expiry
- claimReward()   — claim winning payout
```

**Probability formula:**
```
P(YES) = yesPool / (yesPool + noPool)
P(NO)  = noPool  / (yesPool + noPool)
```

**Payout formula:**
```
payout = (userShares / winningPool) × totalPool
```

### MarketFactory.sol

Deploys `PredictionMarket` instances. Manages global oracle, fees, and Phase 3 integrations.

```
- createMarket(question, category, expirationTime)
- setLiquidityMining(address)
- setReferralSystem(address)
- getMarket(bytes32 marketId)
```

Gas cost per market creation: ~3M gas (deploys child contract).

### MultiOutcomeMarket.sol

Supports 2–10 outcome parimutuel markets.

```
- buyShares(uint8 outcomeIndex) payable
- resolve()
- claimReward()
- getAllOutcomePools() → uint256[]
- getExpectedPayout(address user) → uint256
```

### PREDToken.sol

ERC20 with capped supply and minter role.

```
- Max supply: 100,000,000 PRED
- Initial mint: 10,000,000 PRED to deployer
- Minter role assigned to LiquidityMining contract
```

### LiquidityMining.sol

Tracks and distributes PRED rewards.

```
- recordCreation(address creator)  → +100 PRED pending
- recordTrade(address trader)      → +10 PRED pending
- claimRewards()                   → mint pending PRED to caller
```

### ReferralSystem.sol

On-chain referral tracking with ETH fee sharing.

```
- registerReferral(user, referrer)
- recordTrade(trader, amount) payable
- claimEarnings()
- Referral fee: 0.5% of trade amount
```

---

## Frontend

### Pages

| Route | Description |
|---|---|
| `/` | Market listing with search and category filter |
| `/create` | 4-step wizard to create YES/NO market |
| `/markets/[address]` | Market detail with trading panel |
| `/multi` | Multi-outcome market listing |
| `/multi/create` | Create multi-outcome market with outcome builder |
| `/multi/[address]` | Multi-outcome trading page |
| `/portfolio` | Personal dashboard with rewards and trades |
| `/leaderboard` | Top creators and all markets |
| `/admin` | Admin panel for market management |

### Key Hooks

```typescript
useSubgraphMarkets()       // fetch all markets from The Graph
useMarketDetail(address)   // full market state via RPC
useBuyShares(address)      // buy YES/NO shares
useCreateMarket()          // create new market
useUserRewardStats()       // PRED balance, pending rewards, prices
useMultiMarketDetail()     // multi-outcome market state
```

---

## The Graph Subgraph

Custom subgraph deployed to The Graph Studio indexing:

- `MarketCreated` events — market metadata + category (read via contract call)
- `SharesPurchased` events — trade history
- `MarketResolved` events — resolution outcomes

**Endpoint:** `https://api.studio.thegraph.com/query/1744854/predict-x/v0.0.4`

**Sample query:**
```graphql
query {
  markets(orderBy: createdAt, orderDirection: desc) {
    id
    address
    question
    category
    creator
    yesPool
    noPool
    resolved
    outcome
  }
}
```

---

## Phase 3 Features

### PRED Token Rewards

Every interaction earns PRED tokens automatically:

| Action | PRED Earned |
|---|---|
| Create a market | 100 PRED |
| Place a trade | 10 PRED |

Claim anytime from the Portfolio page.

### Referral Program

Share your referral link from the Portfolio page. When referred users trade, you earn 0.5% of their trade amount in ETH, claimable at any time.

### Chainlink Price Feeds (Sepolia)

| Feed | Address |
|---|---|
| ETH/USD | `0x694AA1769357215DE4FAC081bf1f309aDC325306` |
| BTC/USD | `0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43` |

Live prices displayed on the Portfolio page, refreshed every 30 seconds.

---

## Project Structure

```
PredictionMarketDApp/
├── contracts/
│   ├── src/
│   │   ├── MarketFactory.sol
│   │   ├── PredictionMarket.sol
│   │   ├── PREDToken.sol
│   │   ├── LiquidityMining.sol
│   │   ├── ReferralSystem.sol
│   │   ├── ChainlinkOracle.sol
│   │   ├── MultiOutcomeMarket.sol
│   │   ├── MultiMarketFactory.sol
│   │   ├── MultiOracle.sol
│   │   └── interfaces/
│   ├── test/           (130+ Forge tests)
│   └── script/
├── frontend/
│   └── src/
│       ├── app/        (Next.js pages)
│       ├── components/
│       ├── hooks/      (wagmi hooks)
│       └── lib/        (ABIs, GraphQL)
└── predictx/           (The Graph subgraph)
    ├── subgraph.yaml
    ├── schema.graphql
    └── src/mapping.ts
```

---

## Contributing

Pull requests are welcome. For major changes, open an issue first.

```bash
# Fork the repo
# Create feature branch
git checkout -b feature/my-feature

# Make changes and test
cd contracts && forge test

# Commit and push
git commit -m "feat: add my feature"
git push origin feature/my-feature

# Open a pull request
```

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built by <a href="https://github.com/adityachotaliya9299-jpg">Aditya Chotaliya</a> · Deployed on <a href="https://prediction-market-d-app.vercel.app/">Vercel</a>
</div>
