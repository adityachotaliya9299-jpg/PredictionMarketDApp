<div align="center">

# PredictX

### Decentralized Prediction Market Protocol on Ethereum

[![Tests](https://img.shields.io/badge/Tests-300%2B_passing-brightgreen?style=for-the-badge&logo=ethereum)](contracts/test/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue?style=for-the-badge)](contracts/src/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge)](frontend/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Deployed](https://img.shields.io/badge/Live-Sepolia-627eea?style=for-the-badge&logo=ethereum)](https://prediction-market-d-app.vercel.app/)

**[Live Demo](https://prediction-market-d-app.vercel.app/) · [Subgraph](https://api.studio.thegraph.com/query/1744854/predict-x/v0.0.5) · [Whitepaper](docs/PredictX_Whitepaper_V2.pdf) · [Self-Audit](docs/PredictX_SelfAudit.pdf)**

> ⚠️ Deployed on Ethereum Sepolia testnet only. Not audited. Do not use with real mainnet funds.

</div>

---

## What is PredictX?

PredictX is a **permissionless, trustless prediction market protocol** built on Ethereum. Anyone can:

- 🏪 **Create a market** — Ask any YES/NO or multi-outcome question
- ⚡ **Trade** — Buy shares on outcomes using ETH or USDC
- 🏆 **Earn PRED tokens** — Get rewarded for creating markets and trading
- 🔒 **Stake PRED** — Earn a share of protocol fees in ETH
- 🏛️ **Govern** — Vote on protocol proposals using staked PRED
- 🔗 **Refer** — Earn 0.5% of every ETH trade your referrals make

Everything runs on-chain. No centralized backend. No middlemen. Automated payouts.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [How It Works](#how-it-works)
- [Smart Contracts](#smart-contracts)
- [DeFi Layer](#defi-layer)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Subgraph](#subgraph)
- [Frontend Pages](#frontend-pages)
- [Security](#security)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Features

### Market Types

| Type | Description | Currency | Outcomes |
|---|---|---|---|
| **YES/NO Markets** | Binary parimutuel prediction markets | ETH | 2 (YES or NO) |
| **Multi-Outcome Markets** | Multiple discrete outcome markets | ETH | 2–10 |
| **USDC Markets** | Stablecoin binary markets (no ETH price exposure) | USDC | 2 (YES or NO) |
| **Scalar Markets** | Price-range predictions powered by Chainlink live feeds | ETH | 2–10 ranges |

### DeFi Layer

| Feature | Description |
|---|---|
| **PRED Token** | ERC20 reward token, 100M max supply |
| **Liquidity Mining** | 100 PRED per market created, 10 PRED per trade |
| **Referral System** | Earn 0.5% ETH on every referred trade, tracked on-chain |
| **PRED Staking** | Stake PRED tokens, earn proportional ETH protocol fees |
| **Governance** | Create proposals and vote using staked PRED |
| **PRED Faucet** | 100 FREE PRED one-time claim for new users |

### Infrastructure

| Feature | Description |
|---|---|
| **Chainlink Oracles** | Live ETH/USD and BTC/USD price feeds on Sepolia |
| **The Graph** | Custom subgraph v0.0.5 for fast indexed queries |
| **300+ Tests** | Foundry suite with unit, integration, fuzz, and invariant tests |
| **Vercel Deployment** | Production frontend at prediction-market-d-app.vercel.app |

---

## Architecture

```
PredictX Protocol
│
├── Core Markets
│   ├── MarketFactory.sol           Deploys YES/NO markets
│   ├── PredictionMarket.sol        Parimutuel YES/NO trading pool
│   ├── MultiMarketFactory.sol      Deploys multi-outcome markets
│   ├── MultiOutcomeMarket.sol      2–10 outcome parimutuel pool
│   ├── USDCMarketFactory.sol       Deploys USDC stablecoin markets
│   ├── USDCMarket.sol              USDC parimutuel trading pool
│   └── ScalarMarketFactory.sol     Deploys Chainlink price-range markets
│
├── Oracle Layer
│   ├── ChainlinkOracle.sol         Chainlink ETH/USD + BTC/USD feeds
│   └── MultiOracle.sol             Multi-outcome resolution oracle
│
├── DeFi Layer
│   ├── PREDToken.sol               ERC20 reward token (100M max)
│   ├── LiquidityMining.sol         PRED distribution to creators/traders
│   ├── ReferralSystem.sol          On-chain referral tracking + ETH rewards
│   ├── PREDStaking.sol             Stake PRED, earn ETH fee share
│   ├── Governance.sol              On-chain voting with staked PRED
│   └── PREDFaucet.sol              New user onboarding (100 PRED free)
│
├── Subgraph (The Graph v0.0.5)
│   ├── Market entity               YES/NO market data
│   ├── Trade entity                YES/NO trade records
│   ├── MultiMarket entity          Multi-outcome market data
│   └── MultiTrade entity           Multi-outcome trade records
│
└── Frontend (Next.js 14)
    ├── /                           Market listing + search + filter
    ├── /create                     4-step market creation wizard
    ├── /markets/[address]          Market detail + trading panel
    ├── /multi                      Multi-outcome market listing
    ├── /multi/create               Multi-outcome creation wizard
    ├── /multi/[address]            Multi-outcome detail + trading
    ├── /usdc                       USDC market listing
    ├── /usdc/create                USDC market creation wizard
    ├── /usdc/[address]             USDC market detail + trading
    ├── /scalar                     Scalar market listing
    ├── /scalar/create              Scalar market creation (Chainlink feed selector)
    ├── /portfolio                  Rewards dashboard + trade history
    ├── /staking                    PRED stake/unstake + ETH rewards
    ├── /governance                 Proposals + voting
    ├── /leaderboard                Top market creators
    ├── /analytics                  Protocol statistics
    └── /admin                      Admin panel (owner only)
```

---

## How It Works

### Parimutuel Model

All ETH from all traders accumulates in a single pool. The probability of each outcome updates dynamically based on capital allocation:

```
P(YES) = yesPool / totalPool
P(NO)  = noPool  / totalPool
```

When the market resolves, winners receive a proportional share of the **entire pool**:

```
payout = (yourShares / winningPool) × totalPool
```

**No market makers. No order books. No liquidity providers.** The crowd sets the price.

### Example

| Trader | Side | ETH |
|---|---|---|
| Alice | YES | 1 ETH |
| Bob | NO | 1 ETH |
| Carol | YES | 2 ETH |

Total pool = 4 ETH (minus 2% fee = 3.92 ETH)

If YES wins:
- Alice payout = (1 / 3) × 3.92 = **1.307 ETH**
- Carol payout = (2 / 3) × 3.92 = **2.613 ETH**
- Bob loses his 1 ETH stake

### PRED Token Flow

```
New user arrives
    └── Claim 100 FREE PRED from faucet
            └── Stake PRED in PREDStaking
                    └── Earn ETH from protocol fees
                    └── Create governance proposals
                    └── Vote on protocol changes

Create a market → earn 100 PRED
Place a trade   → earn 10 PRED
Refer a friend  → earn 0.5% ETH on all their trades
```

---

## Smart Contracts

### Deployed on Ethereum Sepolia

| Contract | Address | Etherscan |
|---|---|---|
| **MarketFactory** | `0x51430273cA467Fd6a961598B5bcD28d6532A8D33` | [View ↗](https://sepolia.etherscan.io/address/0x51430273cA467Fd6a961598B5bcD28d6532A8D33) |
| **MultiMarketFactory** | `0x30a99B8A1C7b71314160c0396b49eE9db8bbC4Ab` | [View ↗](https://sepolia.etherscan.io/address/0x30a99B8A1C7b71314160c0396b49eE9db8bbC4Ab) |
| **USDCMarketFactory** | `0xd320273497BE8ef957d9F1fF27A0c99F0C78dB4D` | [View ↗](https://sepolia.etherscan.io/address/0xd320273497BE8ef957d9F1fF27A0c99F0C78dB4D) |
| **ScalarMarketFactory** | `0xbb1002BCeca660E9A5fBD88365830AFeAF1760c1` | [View ↗](https://sepolia.etherscan.io/address/0xbb1002BCeca660E9A5fBD88365830AFeAF1760c1) |
| **ChainlinkOracle** | `0x4cb12c69E85A280C41815805C1446b121E8c5462` | [View ↗](https://sepolia.etherscan.io/address/0x4cb12c69E85A280C41815805C1446b121E8c5462) |
| **MultiOracle** | `0x1aB76B758Cb2c45Ca6E876294F7972133Ebd1619` | [View ↗](https://sepolia.etherscan.io/address/0x1aB76B758Cb2c45Ca6E876294F7972133Ebd1619) |
| **PREDToken** | `0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49` | [View ↗](https://sepolia.etherscan.io/address/0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49) |
| **LiquidityMining** | `0xAC8e774dd8218D716F455AB7872E7c0843985981` | [View ↗](https://sepolia.etherscan.io/address/0xAC8e774dd8218D716F455AB7872E7c0843985981) |
| **ReferralSystem** | `0xaBa4F2D457CE0fEf0C06A1e89A3662980C8e1F4A` | [View ↗](https://sepolia.etherscan.io/address/0xaBa4F2D457CE0fEf0C06A1e89A3662980C8e1F4A) |
| **PREDStaking** | `0xE4b897f14E3c49137d34440fa2FCb207902a715c` | [View ↗](https://sepolia.etherscan.io/address/0xE4b897f14E3c49137d34440fa2FCb207902a715c) |
| **Governance** | `0xdb4A588aDE922f5E8F332317cd9451001048a378` | [View ↗](https://sepolia.etherscan.io/address/0xdb4A588aDE922f5E8F332317cd9451001048a378) |
| **PREDFaucet** | `0x422109b25aA1D4885289a1ED67ad2fCA4Fa157A7` | [View ↗](https://sepolia.etherscan.io/address/0x422109b25aA1D4885289a1ED67ad2fCA4Fa157A7) |

### Contract Relationships

```
MarketFactory
    ├── creates → PredictionMarket (YES/NO)
    ├── calls   → LiquidityMining.recordCreation()
    └── calls   → ReferralSystem.recordTrade()

PredictionMarket
    ├── reads   → ChainlinkOracle.getResolution()
    └── calls   → LiquidityMining.recordTrade()

MultiMarketFactory
    ├── creates → MultiOutcomeMarket
    └── calls   → LiquidityMining.recordCreation()

MultiOutcomeMarket
    └── reads   → MultiOracle.getWinningOutcome()

PREDStaking
    └── reads   → PREDToken.balanceOf()

Governance
    └── reads   → PREDStaking.getStakeInfo()
```

---

## DeFi Layer

### PRED Token Economics

```
Max Supply:     100,000,000 PRED
Initial Mint:    10,000,000 PRED (protocol treasury)
Remaining:       90,000,000 PRED (minted by LiquidityMining)

Distribution:
  Market creators  →  100 PRED per market
  Traders          →   10 PRED per trade
  Faucet users     →  100 PRED one-time claim
```

### Staking Rewards

The staking contract uses a **reward-per-token-stored** model (similar to Synthetix):

```solidity
// When protocol fees arrive:
rewardPerToken += (msg.value × PRECISION) / totalStaked

// User's pending reward:
earned(user) = stakedBalance(user) × (rewardPerToken - userPaidPerToken) / PRECISION
```

This ensures rewards are distributed **proportionally** to stake size regardless of when users join.

### Governance Parameters

| Parameter | Value |
|---|---|
| Min PRED to propose | 100 PRED staked |
| Voting period | 3 days |
| Quorum | 1,000 PRED total participation |
| Resolution | Simple majority (for > against) |
| Cancel | Proposer or owner can cancel |

### Referral System

```
User A shares referral link → User B registers using link
Every trade by User B       → 0.5% of trade value goes to User A
User A claims               → ETH sent directly to User A's wallet
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Smart Contracts | Solidity | 0.8.24 |
| Contract Framework | Foundry (Forge) | Latest |
| Contract Libraries | OpenZeppelin | 5.x |
| Frontend | Next.js App Router | 14.2.5 |
| Language | TypeScript | 5.x |
| Web3 Connection | wagmi | v2 |
| Low-level Ethereum | viem | Latest |
| Wallet UI | RainbowKit | Latest |
| Blockchain Indexing | The Graph | v0.0.5 |
| Price Oracles | Chainlink | Sepolia feeds |
| Deployment | Vercel | Latest |
| Package Manager | npm | Latest |

---

## Getting Started

### Prerequisites

```bash
# Install Node.js 18+
node --version  # should be 18+

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify
forge --version
cast --version
```

### Installation

```bash
# Clone the repository
git clone https://github.com/adityachotaliya9299-jpg/PredictionMarketDApp.git
cd PredictionMarketDApp

# Install frontend dependencies
cd frontend
npm install

# Install contract dependencies
cd ../contracts
forge install
```

### Environment Setup

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local` — only two values need updating:

```env
# Get free at https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_ID=your_project_id_here

# Get free at https://www.alchemy.com
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_api_key_here

# All contract addresses are pre-filled for Sepolia — no changes needed
```

### Run Locally

```bash
# Terminal 1: Start frontend
cd frontend
npm run dev
# Open http://localhost:3000

# Terminal 2: Run contract tests (optional)
cd contracts
forge test -vv
```

### Get Testnet Assets

1. **Sepolia ETH** — Get from [sepoliafaucet.com](https://sepoliafaucet.com) or [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
2. **PRED tokens** — Visit `/staking` page and click "Claim 100 FREE PRED"
3. **Sepolia USDC** — Get from [Circle's USDC faucet](https://faucet.circle.com/) for USDC market trading

---

## Running Tests

```bash
cd contracts

# Run all tests
forge test

# Run with verbose output
forge test -vv

# Run with gas report
forge test --gas-report

# Run specific test file
forge test --match-path test/PREDStaking.t.sol -vv

# Run specific test function
forge test --match-test test_Stake -vv

# Run with coverage
forge coverage

# Run summary
forge test --summary
```

### Test Results

```
╭─────────────────────────────────┬────────┬────────┬─────────╮
│ Test Suite                      │ Passed │ Failed │ Skipped │
╞═════════════════════════════════╪════════╪════════╪═════════╡
│ PredictionMarketTest            │ 52     │ 0      │ 0       │
│ MarketFactoryTest               │ 38     │ 0      │ 0       │
│ MultiOutcomeMarketTest          │ 34     │ 0      │ 0       │
│ GovernanceTest                  │ 26     │ 0      │ 0       │
│ PREDStakingTest + EdgeTest      │ 33     │ 0      │ 0       │
│ PREDTokenTest                   │ 23     │ 0      │ 0       │
│ EdgeCaseTest                    │ 17     │ 0      │ 0       │
│ ReferralSystemTest              │ 16     │ 0      │ 0       │
│ Phase3IntegrationTest           │ 16     │ 0      │ 0       │
│ PREDFaucetTest + EdgeTest       │ 22     │ 0      │ 0       │
│ MockOracleTest                  │ 10     │ 0      │ 0       │
│ IntegrationTest                 │ 7      │ 0      │ 0       │
│ PredictionMarketInvariantTest   │ 6      │ 0      │ 0       │
╞═════════════════════════════════╪════════╪════════╪═════════╡
│ TOTAL                           │ 300    │ 0      │ 0       │
╰─────────────────────────────────┴────────┴────────┴─────────╯
```

### Test Coverage Areas

- ✅ Core trading logic (buy shares, resolve, claim rewards)
- ✅ Reentrancy attack simulation
- ✅ Integer overflow boundary conditions
- ✅ Unauthorized access attempts
- ✅ Fuzz testing on all financial calculations
- ✅ Invariant testing (total shares = total pool - fees, always)
- ✅ Full user journey integration tests
- ✅ Oracle resolution and double-resolution prevention
- ✅ Staking reward proportionality
- ✅ Governance proposal lifecycle

---

## Subgraph

**Endpoint:** `https://api.studio.thegraph.com/query/1744854/predict-x/v0.0.5`

**Version:** v0.0.5

### Entities

```graphql
type Market {
  id: ID!
  address: String!
  creator: String!
  question: String!
  category: String!
  endTime: BigInt!
  resolved: Boolean!
  outcome: Boolean
  yesPool: BigInt!
  noPool: BigInt!
  trades: [Trade!]!
  createdAt: BigInt!
}

type MultiMarket {
  id: ID!
  address: String!
  creator: String!
  question: String!
  outcomes: [String!]!
  endTime: BigInt!
  resolved: Boolean!
  winningOutcome: Int!
  totalPool: BigInt!
  outcomePools: [BigInt!]!
  trades: [MultiTrade!]!
  createdAt: BigInt!
}
```

### Example Query

```graphql
{
  markets(orderBy: createdAt, orderDirection: desc, first: 10) {
    id
    question
    category
    yesPool
    noPool
    resolved
    createdAt
  }
  multiMarkets(first: 5) {
    question
    outcomes
    totalPool
    resolved
    winningOutcome
  }
}
```

### Key Implementation Detail

The `MarketCreated` event does not emit the `category` field. The subgraph reads it by calling `factoryContract.try_getMarket()` at index time:

```typescript
let marketDataResult = factoryContract.try_getMarket(event.params.marketId)
if (!marketDataResult.reverted) {
  market.category = marketDataResult.value.category
}
```

---

## Frontend Pages

| Route | Description | Key Features |
|---|---|---|
| `/` | Homepage | Market listing, search, category filter, skeleton loading |
| `/create` | Create YES/NO Market | 4-step wizard, category, duration |
| `/markets/[address]` | Market Detail | Trading panel, probability bars, claim rewards |
| `/multi` | Multi-Outcome List | Subgraph-powered listing |
| `/multi/create` | Create Multi-Outcome | Up to 10 custom outcomes |
| `/multi/[address]` | Multi-Outcome Detail | Per-outcome trading, resolution |
| `/usdc` | USDC Market List | Stablecoin markets |
| `/usdc/create` | Create USDC Market | 4-step wizard |
| `/usdc/[address]` | USDC Market Detail | USDC trading, approval flow |
| `/scalar` | Scalar Market List | Price-range markets |
| `/scalar/create` | Create Scalar Market | Chainlink feed selector, range builder |
| `/portfolio` | Portfolio Dashboard | PRED rewards, trade history, referral link |
| `/staking` | PRED Staking | Stake/unstake, ETH reward claim, faucet banner |
| `/governance` | Governance | Create proposals, vote FOR/AGAINST |
| `/leaderboard` | Leaderboard | Top market creators, volume stats |
| `/analytics` | Analytics | Protocol statistics, category breakdown |
| `/admin` | Admin Panel | Factory controls, market resolution (owner only) |

### Frontend Architecture Decisions

**Inline styles only** — No Tailwind CSS. This prevents SSR hydration conflicts that caused visual inconsistencies in Next.js 14.

**SSR disabled in wagmi** — `ssr: false` in wagmi config prevents server-side wallet state rendering.

**Explicit gas limits** — All write transactions include measured gas limits to prevent silent failures on Sepolia:

```typescript
// Example from useGovernance.ts
const stake = async (amount: string) => writeContractAsync({
  functionName: "stake",
  args: [parseEther(amount)],
  gas: BigInt(200000),  // Measured actual: ~144,000
});
```

---

## Security

### Protections Implemented

| Threat | Mitigation |
|---|---|
| Reentrancy | OpenZeppelin `ReentrancyGuard` on all ETH transfers |
| Integer overflow | Solidity 0.8.24 built-in protection |
| Unauthorized access | `Ownable` + `authorizedCallers` mapping |
| Fee manipulation | Fee hard-capped at 5% in all constructors |
| Self-referral | `CannotReferSelf` custom error |
| Double claiming | CEI pattern — state updated before ETH transfer |
| Expired market trading | `block.timestamp` check on every trade |
| Oracle manipulation | Oracle addresses immutable post-construction |
| Double resolution | `AlreadyResolved` check in all contracts |

### Known Limitations (Testnet)

| Limitation | Mainnet Plan |
|---|---|
| No third-party audit | Certik/Sherlock before mainnet |
| Single-owner admin | Gnosis Safe 3-of-5 multisig |
| No timelock | 48-hour timelock on admin functions |
| Manual oracle resolution | Chainlink Automation |

See [SECURITY.md](SECURITY.md) for full policy and [docs/PredictX_SelfAudit.pdf](docs/PredictX_SelfAudit.pdf) for the complete self-audit report.

---

## Documentation

| Document | Description |
|---|---|
| [SECURITY.md](SECURITY.md) | Security policy and vulnerability reporting |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development guidelines and PR process |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [docs/PredictX_Whitepaper_V2.pdf](docs/PredictX_Whitepaper_V2.pdf) | Technical whitepaper v2 |
| [docs/PredictX_SelfAudit.pdf](docs/PredictX_SelfAudit.pdf) | Self-conducted security audit |
| [docs/PredictX_SecurityPolicy.pdf](docs/PredictX_SecurityPolicy.pdf) | Security policy PDF |
| [docs/DuneDashboard.md](docs/DuneDashboard.md) | Dune analytics SQL queries |



## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines. Quick reference:

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/PredictionMarketDApp.git

# Install
cd frontend && npm install
cd ../contracts && forge install

# Run tests before any PR
cd contracts && forge test  # must pass 300+ tests

# Frontend build must pass
cd frontend && npm run build

# Commit format
feat: add new feature
fix: bug fix
docs: documentation
test: add/update tests
chore: tooling/build
```

### Development Rules

- **Inline styles only** in frontend — no Tailwind classes
- All contract reads must include `chainId: 11155111`
- Use `BigInt()` not `0n` for zero values
- All new contracts must have test coverage
- Follow Checks-Effects-Interactions pattern for ETH transfers
- Use custom errors instead of `require` strings

---

## License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

**Built by [Aditya Chotaliya](https://github.com/adityachotaliya9299-jpg)**

[Live Demo](https://prediction-market-d-app.vercel.app/) · [GitHub](https://github.com/adityachotaliya9299-jpg/PredictionMarketDApp) · [Subgraph](https://api.studio.thegraph.com/query/1744854/predict-x/v0.0.5)

*Predict the Future, Earn from Truth*

</div>
