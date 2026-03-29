# Security Policy

## Supported Versions

PredictX is currently deployed on **Sepolia Testnet** for portfolio/demonstration purposes only.

| Version | Network | Supported |
|---|---|---|
| v1.0 (current) | Sepolia Testnet | ✅ Active |
| Mainnet | — | ❌ Not deployed |

> ⚠️ **PredictX has NOT been audited by a third-party security firm. Do NOT use with real mainnet funds.**

---

## Reporting a Vulnerability

If you discover a security vulnerability in PredictX, please report it responsibly.

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please:

1. Email a description of the vulnerability
2. Include steps to reproduce
3. Include the affected contract(s) and function(s)
4. Include your suggested fix if you have one

You will receive a response within 48 hours acknowledging the report.

---

## Security Design

### Protections Implemented

| Threat | Mitigation |
|---|---|
| Reentrancy | OpenZeppelin `ReentrancyGuard` on all ETH-transferring functions |
| Integer overflow | Solidity 0.8.24 built-in overflow protection |
| Unauthorized access | `Ownable` + `onlyAuthorized` modifiers on privileged functions |
| Fee manipulation | Fee hard-capped at 5% (500 bps) in contract constructor |
| Self-referral | `CannotReferSelf` check in ReferralSystem |
| Expired market trading | `block.timestamp >= expirationTime` check on every trade |
| Double claiming | `hasClaimed[msg.sender]` flag set before ETH transfer |
| Oracle zero address | `require(_oracle != address(0))` in all constructors |

### Checks-Effects-Interactions Pattern

All ETH transfers follow CEI strictly:

```solidity
// 1. CHECK
if (hasClaimed[msg.sender]) revert AlreadyClaimed();
if (userShares == 0) revert NoSharesToClaim();

// 2. EFFECT
hasClaimed[msg.sender] = true;  // set BEFORE transfer

// 3. INTERACTION
(bool ok,) = msg.sender.call{value: payout}("");
if (!ok) revert TransferFailed();
```

### Known Limitations

- **No formal audit** — Self-conducted security analysis only
- **Centralized admin** — Single-owner pattern (recommend Gnosis Safe for mainnet)
- **Manual oracle resolution** — Most markets require admin to set outcome
- **No timelock** — Admin changes take effect immediately (recommend 48hr timelock for mainnet)

---

## Deployed Contracts (Sepolia)

| Contract | Address |
|---|---|
| MarketFactory | `0x51430273cA467Fd6a961598B5bcD28d6532A8D33` |
| PREDToken | `0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49` |
| LiquidityMining | `0xAC8e774dd8218D716F455AB7872E7c0843985981` |
| ReferralSystem | `0xaBa4F2D457CE0fEf0C06A1e89A3662980C8e1F4A` |
| ChainlinkOracle | `0x4cb12c69E85A280C41815805C1446b121E8c5462` |
| MultiOracle | `0x1aB76B758Cb2c45Ca6E876294F7972133Ebd1619` |
| MultiMarketFactory | `0x30a99B8A1C7b71314160c0396b49eE9db8bbC4Ab` |

All contracts are verified on [Sepolia Etherscan](https://sepolia.etherscan.io).

---

## Full Security Analysis

See [`docs/PredictX_SecurityPaper.docx`](docs/PredictX_SecurityPaper.docx) for the complete threat model, vulnerability register, and pre-mainnet recommendations.
