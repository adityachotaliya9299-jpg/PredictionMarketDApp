# Verity Protocol — Whitepaper

**Markets in truth.**

*Version 2.0 — July 2026*
*(Supersedes the PredictX whitepaper v1. The protocol described here is the same deployed codebase; Verity is the new brand identity.)*

---

## Abstract

Verity is a decentralized prediction market protocol on Ethereum. It lets anyone create a market on any question with a verifiable answer, lets anyone trade on the outcome, and settles every position with smart contracts rather than intermediaries. Prices are discovered through **parimutuel pooling**: the probability of an outcome is simply the share of capital staked on it, and when the market resolves, the entire pool is redistributed to the winning side pro-rata. The protocol adds a native incentive layer — the **PRED token** — that rewards market creation, trading, referrals, and staking, and hands protocol control to token holders through on-chain governance.

This paper describes the mechanism design, the market types, the token economics, the oracle architecture, and the protocol's revenue model.

---

## 1. Motivation

Prediction markets are the most direct financial instrument for information: they pay people to be right. Decades of research show that market-generated probability estimates routinely outperform polls and expert panels. Yet centralized implementations suffer three structural problems:

1. **Custodial risk** — the operator holds user funds and can freeze, lose, or abscond with them.
2. **Discretionary resolution** — the operator decides outcomes, and disputed resolutions are settled behind closed doors.
3. **Gatekeeping** — the operator decides which questions may be asked at all.

Verity removes all three. Funds live in per-market contracts that no one can drain; outcomes are resolved by oracles whose logic is public; and market creation is permissionless.

---

## 2. Mechanism design

### 2.1 Parimutuel pooling

Each binary market maintains two pools, `yesPool` and `noPool`. A trader who stakes `s` ETH on YES (after the protocol fee) increases `yesPool` by `s` and receives shares proportional to their stake.

The implied probability of YES at any moment is:

```
P(YES) = yesPool / (yesPool + noPool)
```

On resolution to YES, a trader holding `userYes` shares receives:

```
payout = (userYes / yesPool) × totalPool
```

where `totalPool = yesPool + noPool` (net of fees). The same holds symmetrically for NO.

**Properties:**

- **No counterparty risk.** Winners are paid exclusively from the pool; the contract can never owe more than it holds.
- **No liquidity bootstrap problem.** There is no order book to seed and no AMM curve to capitalize; the first trade creates the market's liquidity.
- **Incentive-compatible pricing.** If you believe the true probability differs from the pool ratio, betting toward your belief has positive expected value — so prices converge on the crowd's aggregate estimate.
- **Invalid-market safety.** If a market resolves INVALID, all stakes are refunded pro-rata rather than paid to either side.

### 2.2 Multi-outcome generalization

`MultiOutcomeMarket` extends the mechanism to *n* ∈ [2, 10] outcomes with one pool per outcome. Probability and payout formulas generalize directly:

```
P(i) = pool[i] / Σ pool[j]        payout(i) = (userShares[i] / pool[i]) × totalPool
```

### 2.3 Scalar markets

Scalar markets ask *where a number will land* (e.g. "ETH price on Dec 31") rather than a yes/no question. A range `[floor, cap]` is bucketed and positions settle against the oracle-reported value, allowing traders to express conviction about magnitude, not just direction.

### 2.4 Stablecoin markets

USDC-denominated markets use the identical parimutuel engine with an ERC-20 stake token, removing ETH price exposure from the position itself. `USDCMarketFactory` deploys them; approvals replace `msg.value`.

---

## 3. Oracle architecture

Resolution is the hardest problem in prediction markets. Verity separates *market logic* from *truth reporting* behind minimal oracle interfaces:

- **ChainlinkOracle** — price-based questions resolve automatically against Chainlink ETH/USD and BTC/USD feeds. No human in the loop.
- **MultiOracle** — designated resolution for multi-outcome questions, with an INVALID escape hatch that triggers refunds.
- **Resolution finality** — a market, once resolved, is immutable; `resolve()` is single-shot and guarded.

The roadmap (§8) moves discretionary resolution toward optimistic, dispute-window resolution with staked challengers, and ultimately to governance-elected oracle committees.

---

## 4. PRED token economics

**PREDToken** is an ERC-20 with a hard cap of **100,000,000 PRED**. It is earned, not sold — there was no token sale.

### 4.1 Emission (liquidity mining)

| Action | Reward |
|---|---|
| Create a market | 100 PRED |
| Execute a trade | 10 PRED |

Emissions are minted by the `LiquidityMining` contract, which is the only authorized minter and stops at the cap. Emission rates are governance-adjustable.

### 4.2 Value accrual (staking)

`PREDStaking` lets holders stake PRED to earn a pro-rata share of **protocol fee revenue in ETH**. Fees flow from every market's trade tax to the fee collector; stakers are the residual claimants of protocol activity. Reward accounting uses cumulative reward-per-token with checkpointing on stake/unstake/claim.

### 4.3 Referrals

`ReferralSystem` binds a referee to a referrer once, on-chain, and pays the referrer **0.5% of the referee's trade volume in ETH** at trade time. Self-referral is rejected at the contract level.

### 4.4 Governance

`Governance` gives PRED holders proposal and voting rights over:

- protocol fee levels (within the hard cap),
- emission rates,
- treasury spending,
- oracle configuration and category curation.

Voting weight is 1 PRED = 1 vote, with quorum and timelock parameters set in the contract.

---

## 5. Protocol revenue and pricing model

Verity's business model is deliberately simple: **the protocol taxes trades, not people.**

### 5.1 On-chain fee

Every share purchase pays a protocol fee (deployed at **2%**, `feeBps = 200`), hard-capped at **5%** by `MAX_FEE_BPS = 500` — a constructor-level invariant no owner or vote can exceed. Claims, market creation, and staking cost gas only.

Fee flows:

```
trade (2%) ──► fee collector ──► PRED stakers (revenue share)
                              └─► protocol treasury (governance-controlled)
referral   ──► 0.5% of referee volume ──► referrer (in ETH)
```

### 5.2 Off-chain subscription tiers

The application layer (not the contracts) offers subscriptions for professional tooling:

| Tier | Price | For |
|---|---|---|
| **Trader** | Free | Full trading access. Pays only the on-chain 2% fee + gas. |
| **Pro** | $29/month | Analytics, probability history, API access, PRED fee rebates. |
| **Institutional** | Custom | White-label markets, dedicated oracle configuration, SLA support. |

Access to the market itself is never gated: the contracts are public infrastructure, and any front-end can serve them.

---

## 6. Architecture

```
        ┌───────────────────────────────────────────────┐
        │                Frontend (Next.js)             │
        │  wagmi/viem · RainbowKit · The Graph client   │
        └────────────┬──────────────────┬───────────────┘
                     │ reads            │ writes
        ┌────────────▼─────┐   ┌────────▼───────────────┐
        │  Subgraph        │   │  Contracts (Sepolia)   │
        │  (The Graph)     │   │                        │
        └──────────────────┘   │  MarketFactory         │
                               │   └─ PredictionMarket* │
                               │  MultiMarketFactory    │
                               │   └─ MultiOutcome*     │
                               │  ScalarMarketFactory   │
                               │  USDCMarketFactory     │
                               │  ChainlinkOracle       │
                               │  PREDToken             │
                               │  LiquidityMining       │
                               │  ReferralSystem        │
                               │  PREDStaking           │
                               │  Governance            │
                               │  PREDFaucet (testnet)  │
                               └────────────────────────┘
```

Factories deploy immutable per-market contracts; each market holds only its own pool, bounding blast radius. Indexing is done by a Graph subgraph; the UI degrades gracefully to direct RPC reads if the subgraph lags.

---

## 7. Comparison

| | Verity | Centralized books | Order-book DEX markets |
|---|---|---|---|
| Custody | Non-custodial | Operator custody | Non-custodial |
| Pricing | Parimutuel pool ratio | Operator odds | LOB / AMM |
| Liquidity at launch | Immediate | Operator-seeded | Must be bootstrapped |
| Resolution | Oracle, on-chain | Operator discretion | Varies |
| Counterparty risk | None (pool-bounded) | Operator solvency | Protocol-dependent |
| Market creation | Permissionless | Gated | Usually gated |

The parimutuel trade-off is honest to name: traders lock a pool share rather than a fixed price, so effective odds move until expiry. In exchange, every market has depth from its first wei, and the protocol can never be underwater.

---

## 8. Roadmap

1. **Now — Sepolia testnet.** All contracts live; PRED faucet for onboarding; subgraph indexing.
2. **Security hardening.** Independent audit, fuzzing campaign expansion, bug bounty (see the [Security Paper](./SECURITY_PAPER.md)).
3. **Mainnet launch.** Phased caps on pool sizes; conservative category set.
4. **Optimistic resolution.** Staked proposer/challenger resolution with dispute windows for arbitrary questions.
5. **L2 deployment.** Fee-sensitive parimutuel trading benefits directly from rollup gas costs.
6. **Progressive decentralization.** Fee switch, treasury, and oracle set fully under PRED governance.

---

## 9. Risk disclosure

- **Smart-contract risk.** The contracts are unaudited and deployed on a testnet. Do not use with mainnet funds.
- **Oracle risk.** A wrong or manipulated oracle report mis-settles a market; mitigations in §3 and the Security Paper.
- **Regulatory risk.** Prediction markets are regulated differently across jurisdictions; users are responsible for local compliance.
- **Token risk.** PRED is a utility/governance token earned through use. It confers no claim on any legal entity.

---

## 10. Conclusion

A prediction market is a machine that pays for truth. Verity implements that machine with the fewest moving parts that can work: pools instead of order books, oracles instead of adjudicators, code instead of custody — and a token that routes the value of the truth-finding process back to the people doing the finding.

*Contracts, tests, and this paper live in the open repository. Verify, don't trust.*
