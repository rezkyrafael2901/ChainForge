# ⛓️ ChainForge

> **Prompt → Deploy. No code required.**

AI-powered blockchain project builder. Describe what you want in plain English, and ChainForge generates production-ready smart contracts, compiles them, and deploys to your target chain.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636)
![Foundry](https://img.shields.io/badge/Foundry-latest-fff)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 What It Does

```
"Bikin token ERC-20 namanya RezkiCoin, symbol RZK, supply 1 juta di Sepolia"
                            ↓
    ✅ Smart contract generated
    ✅ Foundry deploy script
    ✅ Compiled & verified
    ✅ Deployed to testnet
    ✅ Live frontend
```

## 📦 Project Structure

```
chainforge/
├── packages/
│   ├── engine/          # AI prompt parser + code generator + deployer
│   ├── contracts/       # Foundry project with Solidity templates
│   ├── frontend/        # Next.js 14 web UI (dark theme)
│   └── shared/          # Shared types, chain configs, constants
├── CONCEPT.md           # Full product concept & roadmap
└── package.json         # Monorepo config (npm workspaces)
```

### Packages

| Package | Description |
|---------|-------------|
| `engine` | Core brain — Claude API parses prompts, generates Solidity code, deploys via Foundry |
| `contracts` | Smart contract templates (ERC-20, presale) with tests |
| `frontend` | Beautiful dark-themed web UI with prompt input, chain selector, and build results |
| `shared` | TypeScript types, chain configurations, and constants |

## 🏁 Quick Start

### Prerequisites

- Node.js 20+
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (for smart contracts)
- Anthropic API key (for AI parsing)

### Setup

```bash
# Clone
git clone https://github.com/rezkyrafael2901/chainforge.git
cd chainforge

# Install dependencies
npm install

# Copy env template
cp .env.example .env
# Edit .env with your keys

# Build shared + engine
npm run build

# Run frontend
cd packages/frontend && npm run dev
```

### Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...      # Claude API for prompt parsing
SEPOLIA_RPC_URL=https://...       # Sepolia testnet RPC
PRIVATE_KEY=0x...                 # Deployer wallet private key
ETHERSCAN_API_KEY=...             # For contract verification
```

### CLI Usage

```bash
cd packages/engine
npx tsx src/index.ts "Bikin token ERC-20 namanya MyToken, symbol MTK, supply 1 juta"
```

### Web UI

```bash
cd packages/frontend
npm run dev
# Open http://localhost:3000
```

## 🛠️ Tech Stack

- **AI**: Anthropic Claude (prompt parsing + code generation)
- **Smart Contracts**: Solidity 0.8.24 + OpenZeppelin v5 + Foundry
- **Frontend**: Next.js 14 + Tailwind CSS + RainbowKit + wagmi
- **Monorepo**: npm workspaces

## 📋 Supported Project Types

| Type | Status | Description |
|------|--------|-------------|
| 🪙 Token | ✅ | ERC-20 with mint, burn, pause, cap |
| 🎨 NFT | 🔜 | ERC-721/1155 with minting |
| 🔄 DEX | 🔜 | AMM swap (Uniswap V2 style) |
| 🥩 Staking | 🔜 | Token staking with rewards |
| 🏛️ DAO | 🔜 | Governance & voting |
| 🛒 Marketplace | 🔜 | NFT marketplace |

## 🌐 Supported Chains

Ethereum • Base • Arbitrum • Polygon • BSC • Sepolia (testnet)

## 📄 License

MIT
