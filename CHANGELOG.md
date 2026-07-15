# Changelog

## [2.0.0] - 2026-07-15 — "Verity" rebrand & UI overhaul

### Brand
- Renamed product from **PredictX** to **Verity** ("Markets in truth"); contracts and PRED token identifiers unchanged
- New logo set (`frontend/public/logo.svg`, `logo-mark.svg`, `favicon.svg`) — converging gold V on a truth line
- New design system: Obsidian (dark) + Daybreak Ivory (light) themes, champagne-gold accent, documented in `brand.md`

### Frontend
- Full token-driven theming: every hardcoded color replaced with CSS variables in `globals.css`; light mode now flips via tokens instead of ~150 lines of `!important` overrides (removed)
- New typography via `next/font`: Fraunces (display serif), Inter (body), JetBrains Mono (numbers)
- New landing page: canvas-rendered 3D golden-terrain hero (no dependencies, reduced-motion aware), slow-motion staggered entrances, scroll parallax, how-it-works / features / market-types / pricing sections, preserved live-markets browser
- New `/pricing` page: Trader / Pro / Institutional tiers, on-chain fee table, FAQ
- Redesigned Navbar (new wordmark, keyboard/Escape support, aria attributes) and Footer
- Shared `Reveal` scroll-animation component and `TerrainBackground` 3D canvas component

### Fixes
- Removed stray empty file `frontend/prediction-market-frontend@0.1.0`
- Fixed doubled top spacing (main padding + navbar spacer both applied)
- Corrected marketing copy to match on-chain fee (2%, `feeBps = 200`)
- Added `public/` directory with favicon (site previously had none)

### Documentation
- New `docs/WHITEPAPER.md` (markdown, supersedes PDF) — mechanism design, tokenomics, oracle architecture, revenue model, roadmap
- New `docs/SECURITY_PAPER.md` — threat model, protections, known limitations, audit roadmap
- Rewrote `README.md` under the Verity brand; updated `SECURITY.md`

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
