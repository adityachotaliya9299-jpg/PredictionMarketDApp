# PredictX: A Decentralized Prediction Market Protocol

**Version 2.0 | June 2025**
**Author: Aditya Chotaliya**

---

## Abstract

PredictX is a permissionless, trustless prediction market protocol built on Ethereum. It enables anyone to create markets on any topic, trade ETH or USDC on outcomes, and earn PRED token rewards — entirely on-chain with no centralized backend. The protocol uses a parimutuel pooling model, Chainlink oracle integration for automated resolution, The Graph for indexed data access, and a full DeFi incentive layer including staking, governance, and referrals.

---

## 1. Introduction

Prediction markets are one of the most powerful tools for aggregating distributed information. When participants stake real value on outcomes, prices become accurate probability estimates — a phenomenon known as the wisdom of crowds.

Despite this, most prediction market platforms today suffer from three fundamental problems:

**Centralization of resolution.** Traditional platforms like Polymarket rely on human arbiters or centralized oracle committees to resolve markets. This creates manipulation risk, slow resolution times, and a single point of failure that contradicts the promise of DeFi.

**Limited market types.** Most protocols support only binary YES/NO markets. Real-world prediction requires richer outcome spaces — price ranges, multi-candidate elections, sports scores.

**Poor incentive alignment.** Existing platforms provide little reason for creators to build markets or for traders to participate early. Without liquidity mining and referral incentives, markets remain illiquid and die.

PredictX addresses all three problems through a combination of Chainlink oracle integration, multi-outcome market support, and a comprehensive DeFi incentive layer.

---

## 2. Protocol Architecture

### 2.1 Market Types

PredictX supports four distinct market types:

**YES/NO Markets** are binary parimutuel markets denominated in ETH. A market creator poses a question with a binary outcome. Traders buy YES or NO shares. When the market resolves, all ETH in the pool is redistributed to winning side holders proportionally.

**Multi-Outcome Markets** extend the binary model to support 2–10 discrete outcomes. Each outcome has its own pool. The parimutuel model applies per-outcome: winning traders receive a proportional share of the total pool.

**USDC Markets** are structurally identical to YES/NO markets but denominated in USDC stablecoin rather than ETH. This removes price exposure risk for traders who want to speculate on outcomes without holding ETH.

**Scalar Markets** are price-range prediction markets powered by Chainlink price feeds. Outcomes are defined as numeric ranges (e.g., "ETH < $2,000", "$2,000–$3,000", "> $3,000"). Resolution is triggered automatically when the Chainlink feed reports a price at market expiry.

### 2.2 Parimutuel Model

PredictX uses a continuous parimutuel pooling model. All capital from all traders accumulates in a single pool per outcome. The implied probability of each outcome is derived dynamically from capital allocation:

```
P(outcome_i) = pool_i / total_pool
```

On resolution, winners receive a proportional share of the entire pool:

```
payout = (user_shares / winning_pool) × total_pool
```

This model requires no market makers, no order books, and no liquidity providers. The crowd itself sets the price through capital allocation.

A 2% protocol fee is deducted from each trade before shares are allocated. This fee is distributed to PRED stakers.

### 2.3 Oracle Layer

**ChainlinkOracle.sol** integrates Chainlink Price Feeds for live ETH/USD and BTC/USD data on Sepolia testnet. This powers automated resolution for scalar markets and provides on-chain price references for all market types.

**MultiOracle.sol** handles outcome resolution for multi-outcome and scalar markets. It supports authorized resolvers and emits resolution events consumed by market contracts.

Oracle resolution follows the Checks-Effects-Interactions pattern: the outcome is stored before any ETH transfers occur, preventing reentrancy attacks during the resolution process.

### 2.4 Factory Pattern

All market types use a factory pattern for deployment. Factories maintain a registry of deployed markets, enforce parameter validation, wire liquidity mining callbacks, and emit standardized events consumed by The Graph subgraph.

```
MarketFactory      → deploys PredictionMarket instances
MultiMarketFactory → deploys MultiOutcomeMarket instances
USDCMarketFactory  → deploys USDCMarket instances
ScalarMarketFactory → deploys MultiOutcomeMarket with price range labels
```

---

## 3. DeFi Incentive Layer

### 3.1 PRED Token

PRED is an ERC20 reward token with a 100,000,000 maximum supply. 10,000,000 PRED are minted at deployment to the protocol treasury. Additional PRED is minted by LiquidityMining.sol up to the maximum supply.

PRED has four utility functions: liquidity mining rewards, staking collateral, governance voting power, and protocol fee revenue sharing.

### 3.2 Liquidity Mining

LiquidityMining.sol distributes PRED rewards to protocol participants automatically:

| Action | Reward |
|---|---|
| Create any market | 100 PRED |
| Place any trade | 10 PRED |

Rewards accumulate as pending balances and are claimed manually by users via the Portfolio page. This creates a pull-based reward model that avoids gas waste from automatic distribution.

### 3.3 Referral System

ReferralSystem.sol implements on-chain referral tracking. When a user registers a referral link and their referee trades, 0.5% of the trade value is automatically sent to the referrer's claimable balance. This is funded from protocol fees.

Key constraints: self-referral is rejected at the contract level. Each address can have at most one referrer. Referral earnings are stored on-chain and claimed manually.

### 3.4 PRED Staking

PREDStaking.sol allows PRED holders to stake tokens and receive a proportional share of protocol fee revenue in ETH. The reward mechanism uses a reward-per-token-stored model similar to Synthetix staking:

```
reward_per_token += (deposited_eth × PRECISION) / total_staked
earned(user) = staked(user) × (reward_per_token - user_paid_per_token) / PRECISION
```

This model distributes rewards proportionally and handles deposits at different times correctly. There is no lockup period — users can unstake at any time.

### 3.5 Governance

Governance.sol enables on-chain voting using staked PRED as voting power. Key parameters:

- Minimum stake to propose: 100 PRED
- Voting period: 3 days
- Quorum: 1,000 PRED total participation
- Resolution: simple majority of votes cast

Proposals can be cancelled by the proposer or protocol owner. Passed proposals are executed by the protocol owner. This semi-decentralized model is appropriate for the current testnet phase; a fully trustless timelock governor is planned for mainnet.

### 3.6 PRED Faucet

PREDFaucet.sol provides new users with 100 PRED on a one-time basis. This solves the cold-start problem for governance participation: new users need PRED to vote, but must trade to earn PRED through liquidity mining. The faucet bridges this gap. The faucet is pre-loaded with 10,000 PRED (enough for 100 users).

---

## 4. Data Infrastructure

### 4.1 The Graph Subgraph

PredictX maintains a custom subgraph deployed on The Graph Studio at version v0.0.5. The subgraph indexes four entity types:

**Market** — YES/NO market metadata, pool sizes, resolution status, category, and creator.

**Trade** — Individual YES/NO trade records with trader address, side, shares, cost, and timestamp.

**MultiMarket** — Multi-outcome market metadata including all outcome labels, per-outcome pool sizes, and resolution status.

**MultiTrade** — Individual multi-outcome trade records with outcome index and name.

The subgraph uses a template pattern: the MarketFactory and MultiMarketFactory are static data sources, while individual PredictionMarket and MultiOutcomeMarket contracts are created as dynamic templates when markets are deployed.

A key implementation detail: the MarketCreated event does not emit the market category field. Instead, the subgraph mapping calls `factoryContract.try_getMarket()` at index time to read the category from contract state.

### 4.2 Frontend Architecture

The frontend is built with Next.js 14 App Router, wagmi v2, viem, and RainbowKit. Key architectural decisions:

**Inline styles only** — No Tailwind CSS classes are used anywhere in the codebase. This prevents SSR hydration conflicts that caused visual inconsistencies during development.

**SSR disabled** — wagmi is configured with `ssr: false` to prevent server-side rendering of wallet state.

**Stable QueryClient** — The React Query client is initialized with `useState(() => new QueryClient())` to prevent re-initialization on re-renders.

**Gas overrides** — All write transactions include explicit gas limits based on measured actual costs to prevent silent transaction failures on Sepolia.

---

## 5. Security Design

### 5.1 Reentrancy Protection

All functions that transfer ETH use OpenZeppelin's ReentrancyGuard modifier. All ETH transfers follow the Checks-Effects-Interactions pattern strictly: state is updated before any external call.

### 5.2 Access Control

Privileged functions use OpenZeppelin's Ownable pattern. Factory contracts use an `authorizedCallers` mapping for LiquidityMining and ReferralSystem callbacks, allowing multiple authorized callers without full ownership transfer.

### 5.3 Integer Arithmetic

Solidity 0.8.24 provides built-in overflow and underflow protection. All percentage calculations use basis points (BPS) with integer arithmetic. No external math libraries are used.

### 5.4 Oracle Security

Oracle addresses are set at construction time and cannot be changed without owner intervention. The `isResolved` check prevents double-resolution. Oracle resolution is separated from market payout: resolving sets the outcome, claiming reads the outcome — they are separate transactions.

### 5.5 Known Limitations

PredictX has not been audited by a third-party security firm. The admin resolution pattern (single owner resolves outcomes) is centralized and inappropriate for mainnet deployment without a timelock and multisig. These are explicitly acknowledged and planned to be addressed before mainnet.

---

## 6. Testing

PredictX has 300+ passing Foundry tests across 13 test suites:

| Suite | Tests | Coverage |
|---|---|---|
| PredictionMarketTest | 52 | Core trading logic |
| MarketFactoryTest | 38 | Factory deployment and management |
| MultiOutcomeMarketTest | 34 | Multi-outcome trading and resolution |
| GovernanceTest | 26 | Proposal lifecycle and voting |
| PREDStakingTest | 23 | Staking rewards and edge cases |
| PREDTokenTest | 23 | Token minting and transfer |
| EdgeCaseTest | 17 | Boundary conditions |
| ReferralSystemTest | 16 | Referral tracking and earnings |
| Phase3IntegrationTest | 16 | Full user journey integration |
| PREDFaucetTest | 22 | Faucet claims and edge cases |
| MockOracleTest | 10 | Oracle resolution |
| IntegrationTest | 7 | Cross-contract integration |
| InvariantTest | 6 | Fuzz and invariant tests |

All fuzz tests use Foundry's built-in fuzzer with bounded inputs. Invariant tests verify that total shares always equal total pool minus fees.

---

## 7. Deployed Contracts (Sepolia)

| Contract | Address |
|---|---|
| MarketFactory | 0x51430273cA467Fd6a961598B5bcD28d6532A8D33 |
| MultiMarketFactory | 0x30a99B8A1C7b71314160c0396b49eE9db8bbC4Ab |
| USDCMarketFactory | 0xd320273497BE8ef957d9F1fF27A0c99F0C78dB4D |
| ScalarMarketFactory | 0xbb1002BCeca660E9A5fBD88365830AFeAF1760c1 |
| ChainlinkOracle | 0x4cb12c69E85A280C41815805C1446b121E8c5462 |
| MultiOracle | 0x1aB76B758Cb2c45Ca6E876294F7972133Ebd1619 |
| PREDToken | 0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49 |
| LiquidityMining | 0xAC8e774dd8218D716F455AB7872E7c0843985981 |
| ReferralSystem | 0xaBa4F2D457CE0fEf0C06A1e89A3662980C8e1F4A |
| PREDStaking | 0xE4b897f14E3c49137d34440fa2FCb207902a715c |
| Governance | 0xdb4A588aDE922f5E8F332317cd9451001048a378 |
| PREDFaucet | 0x422109b25aA1D4885289a1ED67ad2fCA4Fa157A7 |

---

## 8. Roadmap

**Completed (V2)**
- Four market types: YES/NO, Multi-Outcome, USDC, Scalar
- Full DeFi incentive layer: PRED token, staking, governance, faucet, referrals
- Chainlink price feed integration for scalar market resolution
- The Graph subgraph v0.0.5 with multi-outcome indexing
- 300+ passing Foundry tests
- Analytics dashboard and Dune SQL queries

**Planned (V3 — pending audit funding)**
- Chainlink Automation for gasless market resolution
- Chainlink Functions for off-chain data (sports, elections)
- Base L2 mainnet deployment
- Gnosis Safe multisig admin
- 48-hour timelock on admin functions
- UMA optimistic oracle for dispute-based resolution
- Professional third-party security audit

---

## 9. Conclusion

PredictX demonstrates that a fully-featured prediction market protocol can be built on Ethereum with no centralized components beyond oracle resolution. The parimutuel model eliminates the need for market makers. Chainlink price feeds enable automated scalar market resolution. The Graph provides fast indexed data access. And the PRED token incentive layer drives organic growth through creator rewards, trader rewards, and referral earnings.

The protocol is live on Sepolia testnet at prediction-market-d-app.vercel.app, with all source code published at github.com/adityachotaliya9299-jpg/PredictionMarketDApp.

---

*PredictX — Predict the Future, Earn from Truth*
