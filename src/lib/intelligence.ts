import { ProjectSpec, ProjectType } from '@/types'

export interface SecurityFinding {
  severity: 'low' | 'medium' | 'high'
  title: string
  detail: string
}

export interface GasEstimate {
  chain: string
  deployGas: number
  estimatedCostUsd: string
  note: string
}

const CHAIN_GAS: Record<string, { gasPriceGwei: number; nativeUsd: number; label: string; faucet?: string; explorer: string }> = {
  ethereum: { gasPriceGwei: 18, nativeUsd: 3200, label: 'Ethereum mainnet', explorer: 'https://etherscan.io' },
  base: { gasPriceGwei: 0.05, nativeUsd: 3200, label: 'Base', explorer: 'https://basescan.org', faucet: 'https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet' },
  arbitrum: { gasPriceGwei: 0.08, nativeUsd: 3200, label: 'Arbitrum', explorer: 'https://arbiscan.io' },
  polygon: { gasPriceGwei: 35, nativeUsd: 0.7, label: 'Polygon', explorer: 'https://polygonscan.com', faucet: 'https://faucet.polygon.technology/' },
  bsc: { gasPriceGwei: 3, nativeUsd: 600, label: 'BNB Chain', explorer: 'https://bscscan.com' },
  avalanche: { gasPriceGwei: 25, nativeUsd: 35, label: 'Avalanche', explorer: 'https://snowtrace.io' },
  sepolia: { gasPriceGwei: 2, nativeUsd: 3200, label: 'Sepolia', explorer: 'https://sepolia.etherscan.io', faucet: 'https://sepoliafaucet.com/' },
}

const GAS_BY_TYPE: Record<ProjectType, number> = {
  token: 700_000,
  nft: 1_900_000,
  dex: 4_800_000,
  staking: 1_600_000,
  dao: 1_300_000,
}

export function estimateGas(spec: ProjectSpec): GasEstimate {
  const chain = CHAIN_GAS[spec.chain] || CHAIN_GAS.ethereum
  const featurePremium = Math.max(0, (spec.features?.length || 0) - 2) * 65_000
  const deployGas = (GAS_BY_TYPE[spec.type] || 1_000_000) + featurePremium
  const nativeCost = deployGas * chain.gasPriceGwei * 1e-9
  const usd = nativeCost * chain.nativeUsd
  return {
    chain: chain.label,
    deployGas,
    estimatedCostUsd: usd < 0.01 ? '<$0.01' : `$${usd.toFixed(2)}`,
    note: 'Rough estimate only. Wallet will estimate exact gas at deploy time.',
  }
}

export function scanSecurity(spec: ProjectSpec): SecurityFinding[] {
  const features = new Set(spec.features || [])
  const findings: SecurityFinding[] = []

  findings.push({
    severity: 'medium',
    title: 'Generated code requires review',
    detail: 'Treat generated contracts as a starting point. Test and audit before mainnet or user funds.',
  })

  if (features.has('mintable')) {
    findings.push({ severity: 'medium', title: 'Owner mint permission', detail: 'Mintable tokens allow the owner to increase supply unless capped in code.' })
  }
  if (features.has('pausable')) {
    findings.push({ severity: 'low', title: 'Pause control enabled', detail: 'Pause functions are useful for emergencies but introduce admin trust assumptions.' })
  }
  if (features.has('blacklist')) {
    findings.push({ severity: 'high', title: 'Blacklist controls detected', detail: 'Blacklist capability can restrict transfers and may be risky for user trust.' })
  }
  if (spec.type === 'dex') {
    findings.push({ severity: 'high', title: 'DEX templates need deep testing', detail: 'AMMs carry pricing, liquidity, and slippage risks. Do not mainnet deploy without review.' })
  }
  if (spec.type === 'staking') {
    findings.push({ severity: 'medium', title: 'Reward math risk', detail: 'Staking contracts need reward accounting tests to avoid under/overpayment.' })
  }
  if (spec.type === 'nft') {
    findings.push({ severity: 'low', title: 'Metadata dependency', detail: 'NFT projects depend on stable metadata hosting such as IPFS or Arweave.' })
  }

  return findings
}

export function recommendChain(prompt: string, type: ProjectType): { chain: string; reason: string } {
  const p = prompt.toLowerCase()
  if (p.includes('cheap') || p.includes('murah') || p.includes('low gas')) {
    return { chain: 'base', reason: 'Base is EVM-compatible, low-cost, and founder-friendly for MVP launches.' }
  }
  if (p.includes('game') || p.includes('gaming')) {
    return { chain: 'polygon', reason: 'Polygon has strong gaming/NFT tooling and low transaction costs.' }
  }
  if (type === 'dex') return { chain: 'arbitrum', reason: 'Arbitrum is a strong DeFi ecosystem with lower fees than Ethereum mainnet.' }
  if (type === 'nft') return { chain: 'base', reason: 'Base is cost-effective and popular for consumer NFT experiments.' }
  return { chain: 'sepolia', reason: 'Sepolia is safest for first tests before deploying to a mainnet.' }
}

export function getChainLinks(chain: string) {
  return CHAIN_GAS[chain] || CHAIN_GAS.ethereum
}
