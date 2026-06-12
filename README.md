# PredictX - Decentralized Prediction Market Protocol

<div align="center">

![PredictX Banner](https://img.shields.io/badge/PredictX-Decentralized_Prediction_Market-22d3ee?style=for-the-badge&logo=ethereum)

[![Tests](https://img.shields.io/badge/Tests-300%2B_passing-brightgreen?style=flat-square&logo=ethereum)](contracts/test/)
[![Deployed](https://img.shields.io/badge/Deployed-Sepolia-627eea?style=flat-square&logo=ethereum)](https://prediction-market-d-app.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue?style=flat-square)](contracts/src/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)](frontend/)

**Live Demo** → [prediction-market-d-app.vercel.app](https://predictx-protocol.vercel.app/)

</div>

---

## What is PredictX?

PredictX is a permissionless, trustless prediction market protocol on Ethereum. Anyone can create a market on any topic, trade ETH or USDC on outcomes, and earn PRED token rewards — entirely on-chain with no centralized backend.

---

## Features

### Market Types
| Type | Description | Currency |
|---|---|---|
| YES/NO Markets | Binary parimutuel markets | ETH |
| Multi-Outcome Markets | 2-10 outcomes, parimutuel | ETH |
| USDC Markets | Stablecoin binary markets | USDC |
| Scalar Markets | Price-range predictions via Chainlink | ETH |

### DeFi Layer
- **PRED Token** — ERC20 reward token (100M max supply)
- **Liquidity Mining** — 100 PRED per market created, 10 PRED per trade
- **Referral System** — 0.5% ETH per referred trade
- **PRED Staking** — Stake PRED, earn share of protocol fees in ETH
- **Governance** — Vote on proposals using staked PRED
- **PRED Faucet** — 100 PRED one-time claim for new users

### Infrastructure
- **Chainlink Oracles** — Live ETH/USD and BTC/USD price feeds
- **The Graph** — Custom subgraph v0.0.5 for fast indexed queries
- **300+ Tests** — Foundry test suite with fuzz and invariant testing

---

## Architecture

```
PredictX Protocol
├── Core Markets
│   ├── MarketFactory.sol          — Deploys YES/NO markets
│   ├── PredictionMarket.sol       — Parimutuel YES/NO trading
│   ├── MultiMarketFactory.sol     — Deploys multi-outcome markets
│   ├── MultiOutcomeMarket.sol     — 2-10 outcome parimutuel
│   ├── USDCMarketFactory.sol      — Deploys USDC markets
│   ├── USDCMarket.sol             — USDC stablecoin trading
│   └── ScalarMarketFactory.sol    — Price-range markets
│
├── Oracles
│   ├── ChainlinkOracle.sol        — Live price feeds (ETH/BTC)
│   └── MultiOracle.sol            — Multi-outcome resolution
│
├── DeFi Layer
│   ├── PREDToken.sol              — ERC20 reward token
│   ├── LiquidityMining.sol        — PRED distribution
│   ├── ReferralSystem.sol         — On-chain referrals
│   ├── PREDStaking.sol            — Stake PRED, earn ETH
│   ├── Governance.sol             — On-chain voting
│   └── PREDFaucet.sol             — New user onboarding
│
└── Frontend
    ├── /                          — Market listing
    ├── /create                    — 4-step market wizard
    ├── /markets/[address]         — Market detail + trading
    ├── /multi                     — Multi-outcome listing
    ├── /usdc                      — USDC market listing
    ├── /scalar                    — Scalar market listing
    ├── /portfolio                 — Rewards dashboard
    ├── /staking                   — PRED staking UI
    ├── /governance                — Proposals + voting
    ├── /leaderboard               — Top creators
    └── /analytics                 — Protocol statistics
```

---

## Deployed Contracts (Sepolia)

| Contract | Address | Etherscan |
|---|---|---|
| MarketFactory | `0x51430273cA467Fd6a961598B5bcD28d6532A8D33` | [View](https://sepolia.etherscan.io/address/0x51430273cA467Fd6a961598B5bcD28d6532A8D33) |
| MultiMarketFactory | `0x30a99B8A1C7b71314160c0396b49eE9db8bbC4Ab` | [View](https://sepolia.etherscan.io/address/0x30a99B8A1C7b71314160c0396b49eE9db8bbC4Ab) |
| USDCMarketFactory | `0xd320273497BE8ef957d9F1fF27A0c99F0C78dB4D` | [View](https://sepolia.etherscan.io/address/0xd320273497BE8ef957d9F1fF27A0c99F0C78dB4D) |
| ScalarMarketFactory | `0xbb1002BCeca660E9A5fBD88365830AFeAF1760c1` | [View](https://sepolia.etherscan.io/address/0xbb1002BCeca660E9A5fBD88365830AFeAF1760c1) |
| ChainlinkOracle | `0x4cb12c69E85A280C41815805C1446b121E8c5462` | [View](https://sepolia.etherscan.io/address/0x4cb12c69E85A280C41815805C1446b121E8c5462) |
| MultiOracle | `0x1aB76B758Cb2c45Ca6E876294F7972133Ebd1619` | [View](https://sepolia.etherscan.io/address/0x1aB76B758Cb2c45Ca6E876294F7972133Ebd1619) |
| PREDToken | `0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49` | [View](https://sepolia.etherscan.io/address/0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49) |
| LiquidityMining | `0xAC8e774dd8218D716F455AB7872E7c0843985981` | [View](https://sepolia.etherscan.io/address/0xAC8e774dd8218D716F455AB7872E7c0843985981) |
| ReferralSystem | `0xaBa4F2D457CE0fEf0C06A1e89A3662980C8e1F4A` | [View](https://sepolia.etherscan.io/address/0xaBa4F2D457CE0fEf0C06A1e89A3662980C8e1F4A) |
| PREDStaking | `0xE4b897f14E3c49137d34440fa2FCb207902a715c` | [View](https://sepolia.etherscan.io/address/0xE4b897f14E3c49137d34440fa2FCb207902a715c) |
| Governance | `0xdb4A588aDE922f5E8F332317cd9451001048a378` | [View](https://sepolia.etherscan.io/address/0xdb4A588aDE922f5E8F332317cd9451001048a378) |
| PREDFaucet | `0x422109b25aA1D4885289a1ED67ad2fCA4Fa157A7` | [View](https://sepolia.etherscan.io/address/0x422109b25aA1D4885289a1ED67ad2fCA4Fa157A7) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.24, Foundry |
| Frontend | Next.js 14 App Router, TypeScript |
| Web3 | wagmi v2, viem, RainbowKit |
| Indexing | The Graph (custom subgraph v0.0.5) |
| Oracle | Chainlink Price Feeds (Sepolia) |
| Deployment | Vercel |
| Testing | Forge (300+ tests, fuzz + invariant) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Foundry (`curl -L https://foundry.paradigm.xyz | bash`)
- Git

### Installation

```bash
# Clone the repo
git clone https://github.com/adityachotaliya9299-jpg/PredictionMarketDApp.git
cd PredictionMarketDApp

# Install frontend dependencies
cd frontend && npm install

# Install contract dependencies
cd ../contracts && forge install
```

### Environment Setup

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local — fill in WALLETCONNECT_ID and RPC_URL
# All contract addresses are pre-filled for Sepolia
```

### Run Frontend

```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

### Run Tests

```bash
cd contracts
forge test -vv
# Expected: 300+ tests, 0 failures
```

### Run Tests with Coverage

```bash
cd contracts
forge coverage
```

---

## How It Works

### Parimutuel Model

All ETH from all traders accumulates in a single pool. When the market resolves, the entire pool is redistributed to winners proportionally:

```
P(YES) = yesPool / totalPool
P(NO)  = noPool  / totalPool

Payout = (userShares / winningPool) × totalPool
```

No market makers. No order books. The crowd sets the price.

### PRED Token Flow

```
Create Market  → +100 PRED (via LiquidityMining)
Place Trade    → +10  PRED (via LiquidityMining)
Refer Friend   → +0.5% ETH of their trades (via ReferralSystem)
Stake PRED     → +ETH share of protocol fees (via PREDStaking)
```

### Governance

1. Stake 100+ PRED to create proposals
2. Any staker can vote FOR or AGAINST
3. Voting period: 3 days
4. Quorum: 1,000 PRED total votes required
5. Simple majority wins

---

## Subgraph

**Endpoint:** `https://api.studio.thegraph.com/query/1744854/predict-x/v0.0.5`

**Indexes:**
- `Market` — YES/NO market creation and trades
- `Trade` — Individual trade records
- `MultiMarket` — Multi-outcome market creation
- `MultiTrade` — Multi-outcome trade records

---

## Security

See [SECURITY.md](SECURITY.md) for our security policy, threat model, and vulnerability reporting process.

See [docs/PredictX_SecurityPaper.docx](docs/PredictX_SecurityPaper.docx) for the complete security analysis.

> ⚠️ PredictX has not been audited by a third-party security firm. Do NOT use with real mainnet funds.

---

## Documentation

| Document | Description |
|---|---|
| [SECURITY.md](SECURITY.md) | Security policy and vulnerability reporting |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development guidelines and PR process |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [docs/PredictX_Whitepaper.pdf](docs/PredictX_Whitepaper.pdf) | Technical whitepaper |
| [docs/PredictX_SecurityPaper.docx](docs/PredictX_SecurityPaper.docx) | Security analysis |
| [docs/DuneDashboard.md](docs/DuneDashboard.md) | Dune analytics SQL queries |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

## License

MIT — see [LICENSE](LICENSE)

---

<div align="center">
Built by <a href="https://github.com/adityachotaliya9299-jpg">Aditya Chotaliya</a>
<br/>
<a href="https://prediction-market-d-app.vercel.app/">Live Demo</a> · 
<a href="https://github.com/adityachotaliya9299-jpg/PredictionMarketDApp">GitHub</a> · 
<a href="https://api.studio.thegraph.com/query/1744854/predict-x/v0.0.5">Subgraph</a>
</div>
