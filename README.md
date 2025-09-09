## Wonderland DeFi Frontend

A Next.js app demonstrating wallet connection, network detection, balances, approve/transfer, mint, and live event tables using Wagmi/Viem and Material UI. Includes unit tests (Vitest) and E2E tests (Cypress). State managed with Zustand.

### Setup

1. Install dependencies
```bash
npm install
```

2. Environment
```bash
# required by RainbowKit
set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```
(On non-Windows shells, export the variable or use a .env.local file.)

3. Run dev
```bash
npm run dev
```

### Features

- Wallet connect via RainbowKit
- Network detection for Sepolia with a “Switch to Sepolia” action
- Token balances (DAI 18d, USDC 6d)
- Approve & Transfer with validations and errors
- Mint test tokens
- Live event table (Transfer/Approval)
- Zustand store for mint form state

### Contracts (Sepolia)

- DAI: `0x1D70D57ccD2798323232B2dD027B3aBcA5C00091`
- USDC: `0xC891481A0AaC630F4D89744ccD2C7D2C4215FD47`

### Testing

Unit tests (Vitest):
```bash
npm run test
```

E2E (Cypress):
```bash
# in another terminal
npx cypress run
# or
npx cypress open
```

Notes:
- Tests mock heavy CSS and icons for speed/stability
- Cypress ignores React hydration mismatch errors
