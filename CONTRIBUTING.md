# Contributing to PredictX

## Getting Started

1. Fork the repository
2. Clone your fork
   `git clone [https://github.com/YOUR_USERNAME/PredictionMarketDApp](https://github.com/adityachotaliya9299-jpg/PredictionMarketDApp).git`
3. Install dependencies
   `cd frontend && npm install`
4. Copy environment file
   `cd frontend && cp .env.example .env.local`
5. Run tests
   `cd contracts && forge test -vv`
6. Start frontend
   `cd frontend && npm run dev`

## Development Rules

### Smart Contracts
- All new functions must have NatSpec documentation
- All new contracts must have test coverage
- Follow Checks-Effects-Interactions pattern for ETH transfers
- Use custom errors instead of require strings

### Frontend
- Use inline styles only — no Tailwind classes
- All contract reads must include chainId: 11155111
- Use BigInt() not 0n for zero values
- Always run from ~/prediction-market/frontend not /mnt/e/feat:     new feature
fix:      bug fix
docs:     documentation only
chore:    build/tooling changes
test:     adding or updating tests
refactor: code change without feature or fix## Pull Request Process

1. Create feature branch: `git checkout -b feat/your-feature`
2. Make changes and run `forge test` + `npm run build`
3. Commit with clear message
4. Push and open PR against main

For security vulnerabilities, see SECURITY.md — do NOT open a public issue.
