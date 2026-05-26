# Changelog

## [1.0.0] - 2025-03-29

### Smart Contracts
- MarketFactory — deploys and manages YES/NO prediction markets
- PredictionMarket — parimutuel YES/NO trading with oracle resolution
- PREDToken — ERC20 reward token with 100M max supply
- LiquidityMining — 100 PRED per market, 10 PRED per trade
- ReferralSystem — on-chain referral tracking with ETH fee sharing
- ChainlinkOracle — Chainlink price feed integration for ETH/BTC
- MultiOutcomeMarket — parimutuel markets with 2-10 outcomes
- MultiMarketFactory — factory for multi-outcome market deployment
- MultiOracle — outcome resolution for multi-outcome markets

### Frontend
- Homepage with market listing, search, category filter
- Create Market — 4-step wizard with custom duration
- Market Detail — trading panel, probability bars, claim rewards
- Multi-Outcome Markets — listing, create, and detail pages
- Portfolio — rewards dashboard, trade history, referral link
- Leaderboard — top creators podium, tabs, stats
- Admin Panel — market management, oracle resolution

### Infrastructure
- The Graph subgraph v0.0.4 with category fix via contract call
- Vercel deployment at prediction-market-d-app.vercel.app
- 130+ Foundry tests with fuzz and invariant testing

## [Unreleased] — V2 In Progress

### Planned
- PRED token staking and governance
- UMA optimistic oracle for trustless resolution
- Scalar markets (numeric range outcomes)
- USDC market support
- Dune analytics dashboard
- Base L2 mainnet deployment (when funded)
