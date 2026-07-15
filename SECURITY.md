# Security Policy

*Applies to the Verity Protocol (formerly PredictX) — contracts, subgraph, and frontend in this repository.*

## Supported Versions

| Version | Network | Supported |
|---|---|---|
| v2.0 (current) | Sepolia Testnet | ✅ Active |
| Mainnet | — | ❌ Not deployed |


> ⚠️ **PredictX has NOT been audited by a third-party security firm. Do NOT use with real mainnet funds.**


> ⚠️ Verity has NOT been audited. Do NOT use with real mainnet funds.
 (docs: update security policy for Verity v2, point to markdown security paper)

## Reporting a Vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Please report vulnerabilities via GitHub's private security advisory feature or by email. Include:

- Affected contract name and function
- Steps to reproduce
- Proof of concept (if possible)
- Suggested fix (if you have one)

You will receive a response within 48 hours.

---

## Security Design

### Protections Implemented

| Threat | Mitigation |
|---|---|
| Reentrancy | OpenZeppelin `ReentrancyGuard` on all ETH-transferring functions |
| Integer overflow | Solidity 0.8.24 built-in overflow protection |
| Unauthorized access | `Ownable` + `authorizedCallers` mapping on privileged functions |
| Fee manipulation | Fee hard-capped at 5% (500 bps) in all factory constructors |
| Self-referral | `CannotReferSelf` custom error in ReferralSystem |
| Double claiming | `hasClaimed[msg.sender]` flag set before ETH transfer |
| Expired market trading | `block.timestamp >= expirationTime` check on all trades |
| Oracle manipulation | Oracle address immutable after construction |
| Double resolution | `AlreadyResolved` check in all market and oracle contracts |
| Zero address oracle | `require(_oracle != address(0))` in all constructors |
| USDC approval exploit | Max uint256 approval pattern with explicit transferFrom |
| Faucet drain | `hasClaimed` mapping prevents repeated claims |
| Governance spam | Minimum 100 PRED staked required to create proposals |
| Vote manipulation | Voting power = staked balance at vote time, not transferable |

### Checks-Effects-Interactions Pattern

All ETH and token transfers strictly follow CEI:

```solidity
// 1. CHECK
if (hasClaimed[msg.sender]) revert AlreadyClaimed();
if (userShares == 0) revert NoSharesToClaim();

// 2. EFFECT — state updated BEFORE transfer
hasClaimed[msg.sender] = true;
rewards[msg.sender] = 0;

// 3. INTERACTION — external call last
(bool ok,) = msg.sender.call{value: payout}("");
if (!ok) revert TransferFailed();
```

---

## Deployed Contracts (Sepolia)

| Contract | Address | Role |
|---|---|---|
| MarketFactory | 0x51430273cA467Fd6a961598B5bcD28d6532A8D33 | Deploys YES/NO markets |
| MultiMarketFactory | 0x30a99B8A1C7b71314160c0396b49eE9db8bbC4Ab | Deploys multi-outcome markets |
| USDCMarketFactory | 0xd320273497BE8ef957d9F1fF27A0c99F0C78dB4D | Deploys USDC markets |
| ScalarMarketFactory | 0xbb1002BCeca660E9A5fBD88365830AFeAF1760c1 | Deploys scalar markets |
| ChainlinkOracle | 0x4cb12c69E85A280C41815805C1446b121E8c5462 | Price feed oracle |
| MultiOracle | 0x1aB76B758Cb2c45Ca6E876294F7972133Ebd1619 | Multi-outcome oracle |
| PREDToken | 0x1a5ecdbCbe1931C4e745B82B3C8E09CBc4015C49 | ERC20 reward token |
| LiquidityMining | 0xAC8e774dd8218D716F455AB7872E7c0843985981 | PRED reward distribution |
| ReferralSystem | 0xaBa4F2D457CE0fEf0C06A1e89A3662980C8e1F4A | On-chain referrals |
| PREDStaking | 0xE4b897f14E3c49137d34440fa2FCb207902a715c | Stake PRED, earn ETH |
| Governance | 0xdb4A588aDE922f5E8F332317cd9451001048a378 | On-chain voting |
| PREDFaucet | 0x422109b25aA1D4885289a1ED67ad2fCA4Fa157A7 | New user PRED distribution |

---

## Known Limitations

| Limitation | Risk | Mainnet Mitigation Plan |
|---|---|---|
| No third-party audit | High — undiscovered vulnerabilities | Certik or Sherlock audit before mainnet |
| Single-owner admin | Medium — compromised key resolves markets incorrectly | Gnosis Safe 3-of-5 multisig |
| No timelock | Medium — admin changes take effect immediately | 48-hour timelock on all admin functions |
| Manual oracle resolution | Medium — admin must trigger resolution | Chainlink Automation for automated resolution |
| No formal verification | Low — logic errors possible | TLA+ specification for core trading logic |
| Centralized fee collector | Low — owner controls fee destination | DAO-controlled treasury |

---

## Self-Audit Results

A self-conducted security review was completed in June 2025. All identified issues are documented in [docs/PredictX_SelfAudit.pdf](docs/PredictX_SelfAudit.pdf).

**Summary:** No critical or high severity issues found. Two medium severity issues identified (centralized admin, no timelock) and documented with mainnet mitigation plans. Three low severity informational findings noted.

---

## Test Coverage

300+ Foundry tests cover:
- Core trading logic (buy, resolve, claim)
- Reentrancy attack simulation
- Integer boundary conditions
- Unauthorized access attempts
- Fuzz testing on all financial calculations
- Invariant testing (total shares = total pool - fees)

---

## Pre-Mainnet Security Checklist

Before any mainnet deployment, the following must be completed:

- [ ] Third-party audit by Certik, Sherlock, or equivalent
- [ ] Gnosis Safe multisig for admin functions
- [ ] 48-hour timelock on parameter changes
- [ ] Chainlink Automation for market resolution
- [ ] Bug bounty program launched
- [ ] Legal review of token and market structure

---

## Full Security Analysis


See [docs/PredictX_SelfAudit.pdf](docs/PredictX_SelfAudit.pdf) for the complete threat model, vulnerability register, and remediation recommendations.

See the [Security Paper](docs/SECURITY_PAPER.md) for the complete threat model, contract-level protections, known limitations, and the audit roadmap.
(docs: update security policy for Verity v2, point to markdown security paper)
