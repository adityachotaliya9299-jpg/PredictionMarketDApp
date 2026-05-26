# Security Policy

## Supported Versions

| Version | Network | Supported |
|---|---|---|
| v1.0 (current) | Sepolia Testnet | ✅ Active |
| Mainnet | — | ❌ Not deployed |

> ⚠️ PredictX has NOT been audited. Do NOT use with real mainnet funds.

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Describe the vulnerability via GitHub private advisory or email.
Include: affected contract, function name, steps to reproduce, and suggested fix.
You will receive a response within 48 hours.

## Security Design

| Threat | Mitigation |
|---|---|
| Reentrancy | OpenZeppelin ReentrancyGuard on all ETH-transferring functions |
| Integer overflow | Solidity 0.8.24 built-in overflow protection |
| Unauthorized access | Ownable + onlyAuthorized modifiers |
| Fee manipulation | Fee hard-capped at 5% in constructor |
| Self-referral | CannotReferSelf check in ReferralSystem |
| Double claiming | hasClaimed flag set before ETH transfer (CEI pattern) |

## Known Limitations

- No formal audit — self-conducted security analysis only
- Centralized admin — single-owner pattern
- Manual oracle resolution for most markets
- No timelock on admin changes

## Deployed Contracts (Sepolia)

| Contract | Address |
|---|---|
| MarketFactory | 0x51430273cA467Fd6a961598B5bcD28d6532A8D33 |
| PREDToken | 0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49 |
| LiquidityMining | 0xAC8e774dd8218D716F455AB7872E7c0843985981 |
| ReferralSystem | 0xaBa4F2D457CE0fEf0C06A1e89A3662980C8e1F4A |
| ChainlinkOracle | 0x4cb12c69E85A280C41815805C1446b121E8c5462 |
| MultiOracle | 0x1aB76B758Cb2c45Ca6E876294F7972133Ebd1619 |
| MultiMarketFactory | 0x30a99B8A1C7b71314160c0396b49eE9db8bbC4Ab |

## Full Security Analysis

See [docs/PredictX_SecurityPaper.docx](docs/PredictX_SecurityPaper.docx) for the complete threat model.
