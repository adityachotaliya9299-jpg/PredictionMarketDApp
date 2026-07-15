# Verity Protocol — Security Paper

*Version 1.0 — July 2026*

This document describes the security architecture of the Verity Protocol (contracts deployed under the PredictX codebase), the threat model it defends against, the testing that backs it, and the disclosure process. It complements the repository-level [SECURITY.md](../SECURITY.md) policy and the [Whitepaper](./WHITEPAPER.md).

> **Status: testnet, unaudited.** Verity runs on Sepolia. No independent audit has been completed yet. Do not use these contracts with mainnet funds.

---

## 1. Security philosophy

1. **Minimize what can go wrong.** Parimutuel pools cannot be underwater by construction — payouts are always a redistribution of exactly what the contract holds.
2. **Minimize who can do wrong.** Per-market contracts are immutable after deployment; owner powers are narrow, capped, and enumerated below.
3. **Assume the worst about callers.** Every external entry point is treated as adversarial: reentrancy-guarded, checks-effects-interactions ordered, and overflow-safe.

---

## 2. Threat model

### In scope

| Adversary | Capability | Goal |
|---|---|---|
| Malicious trader | Arbitrary calls, contracts as wallets, reentrancy | Drain pools, double-claim, skew payouts |
| Malicious market creator | Deploys markets via factories | Trap user funds, fake resolution |
| Malicious referrer | Controls referee accounts | Farm referral fees |
| Compromised owner key | Owner-only functions | Rug users, raise fees, mis-resolve |
| Oracle manipulation | Stale/wrong feed data | Mis-settle markets |
| MEV searcher | Ordering, sandwiching | Extract value from trades |

### Out of scope (accepted risks, documented)

- Ethereum consensus failures and deep reorgs.
- Compromise of a user's own wallet.
- Front-end/DNS compromise (mitigated operationally, not by contracts).
- Economic attacks on Chainlink itself.

---

## 3. Contract-level protections

### 3.1 Reentrancy

All ETH- and token-transferring functions (`buyShares`, `claimWinnings`, `claimRefund`, staking claim/unstake, referral payouts) are protected by OpenZeppelin `ReentrancyGuard` **and** follow checks-effects-interactions: state flags (`hasClaimed`) are set before any external call.

### 3.2 Arithmetic

Solidity **0.8.24** checked arithmetic throughout; no `unchecked` blocks in value-bearing paths. Pool math uses multiply-before-divide to bound precision loss, and share accounting cannot exceed pool totals.

### 3.3 Access control

| Power | Holder | Bound |
|---|---|---|
| Resolve market | Oracle contract only | Single-shot; INVALID triggers refunds |
| Pause market | Factory owner | Trading only — **claims can never be paused** |
| Set fee | Factory owner / governance | Hard cap `MAX_FEE_BPS = 500` (5%) enforced in constructor and setter |
| Mint PRED | LiquidityMining only | 100M hard cap in token |
| Emergency withdraw | None on live pools | Market funds are never owner-recoverable |

### 3.4 Fee integrity

The fee is immutable per market (set at deployment) and capped at 5% at every layer that can set it. A compromised owner cannot raise an existing market's fee, and cannot deploy a new market above the cap.

### 3.5 Referral integrity

- Self-referral rejected (`CannotReferSelf`).
- Referrer binding is once-only and immutable — no retroactive hijacking of a trader's volume.
- Referral payouts come from the fee flow, never from user pools.

### 3.6 Resolution safety

- `resolve()` is callable only by the designated oracle and only once.
- Post-expiry, pre-resolution markets accept no new trades.
- INVALID resolution refunds all stakes pro-rata — the escape hatch for ambiguous questions.

### 3.7 Oracle data quality

`ChainlinkOracle` reads Chainlink aggregators and checks round completeness and staleness before treating a price as truth. Price-based markets therefore resolve on data that is (a) decentralized at the feed level and (b) rejected when stale.

---

## 4. Known limitations & accepted trade-offs

Stated plainly, because a security paper that lists only strengths is marketing:

1. **Discretionary oracles for non-price markets.** `MultiOracle` resolution for arbitrary questions is currently trusted. Mitigation on roadmap: optimistic resolution with staked disputes.
2. **Owner pause power.** The owner can pause *trading* on a market (never claims). A malicious owner could freeze a market's growth; funds remain withdrawable after resolution.
3. **Parimutuel odds drift.** Traders lock a pool share, not a fixed price; late flows move effective odds. This is a mechanism property, not a bug — documented in the whitepaper.
4. **MEV exposure.** Large trades are sandwich-visible like any public mempool transaction. Pool-ratio pricing bounds the damage relative to AMM slippage, but does not eliminate ordering games.
5. **Testnet faucet.** `PREDFaucet` is rate-limited but intentionally permissive; it does not exist in the mainnet plan.

---

## 5. Testing & verification

The Foundry suite covers the protocol with **unit, integration, invariant, and fuzz tests**:

- 33 tests on `PREDStaking` (including fuzz over stake/claim sequences),
- 26 tests on `Governance`,
- 22 tests on `PREDFaucet` (rate-limit edge cases),
- 16+ Phase-3 integration tests covering the full user journey: create → trade → resolve → claim → stake → vote,
- fork-style oracle tests against feed staleness paths.

Run them:

```bash
cd contracts
forge test -vv
```

CI treats any failing test as a release blocker.

---

## 6. Operational security

- **No admin keys in the repo** — deployments use environment-injected keys; `.env` is git-ignored.
- **Deterministic builds** — `foundry.lock` pins toolchain versions.
- **Subgraph is read-only** — a compromised subgraph can lie to the UI but cannot move funds; the UI cross-checks critical numbers via direct RPC reads.
- **Front-end hardening** — no private keys ever touch the app; wallet interactions go through wagmi/viem with explicit user confirmation.

---

## 7. Audit & disclosure roadmap

| Phase | Milestone |
|---|---|
| 1 | Internal review + this paper (done) |
| 2 | Public testnet soak with expanded fuzz/invariant campaign |
| 3 | Independent audit of core pool + token contracts |
| 4 | Bug bounty program (severity-tiered, PRED + ETH rewards) |
| 5 | Mainnet with phased pool-size caps |

## 8. Reporting a vulnerability

**Do not open a public issue.** Use GitHub's private vulnerability reporting on the repository. Include the affected contract, function, reproduction steps, and impact assessment. Initial response within 48 hours; coordinated disclosure after a fix ships.

Good-faith researchers will never face legal action from this project for research conducted under this policy.

---

*The only security claim that matters is the one an adversary failed to break. Everything above is an invitation to try — on testnet.*
