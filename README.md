# 🔥 ChainForge

**AI-Powered Blockchain Project Builder — Prompt → Deploy. No code required.**

ChainForge lets you build full blockchain projects by simply describing what you want. From smart contracts to frontend, everything is generated and ready to deploy.

## Features

- 🤖 **AI-Powered** — Describe your project in natural language (English, Indonesian, or any language)
- ⛓️ **Multi-Chain** — Ethereum, Base, Arbitrum, Polygon, BSC, Avalanche
- 📝 **Smart Contracts** — Complete, compilable Solidity contracts (ERC-20, ERC-721, DEX, Staking, DAO)
- 🎨 **Auto Frontend** — Landing pages and dApp interfaces generated per project
- 🚀 **One-Click Deploy** — Foundry deploy scripts with verification (coming soon)

## Project Types

| Type | Contract | Features |
|------|----------|----------|
| Token | ERC-20 | Mint, Burn, Permit, Votes, Capped |
| NFT | ERC-721 | Enumerable, URI Storage, Royalties (ERC-2981), Reveal |
| DEX | Uniswap V2 | Factory + Router + Pair, AMM with x*y=k |
| Staking | StakingRewards | Stake token → earn rewards, lock period, emergency withdraw |
| DAO | Governor | Governance token with votes + permit |

## Quick Start

```bash
git clone https://github.com/rezkyrafael2901/ChainForge.git
cd ChainForge
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, TypeScript
- **AI Engine**: Built-in prompt parser (Claude/GPT optional)
- **Contracts**: Solidity 0.8.20, OpenZeppelin v5
- **Deploy**: Foundry (coming soon)

## How It Works

1. **Describe** — Type what you want to build in plain language
2. **Configure** — Select chain and project type
3. **Generate** — AI generates complete smart contracts + frontend + deploy script
4. **Deploy** — Download code or one-click deploy to testnet/mainnet (coming soon)

## Examples

```
"Bikin token ERC-20 bernama CryptoRupiah simbol CRP supply 1 juta di Ethereum"
"Create an NFT collection called SpaceMonkeys with 10k supply on Base"
"Build a DEX like Uniswap on Arbitrum"
"Make a staking platform for my token with 15% APY"
```

## License

MIT — Built with 🔥 by [ChainForge](https://github.com/rezkyrafael2901/ChainForge)
