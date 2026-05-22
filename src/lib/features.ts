import { ProjectType } from '@/types'

export interface FeatureOption {
  id: string
  label: string
  description: string
  icon: string
  default: boolean
  gasImpact: 'low' | 'medium' | 'high'
  incompatibleWith?: string[]
}

const TOKEN_FEATURES: FeatureOption[] = [
  { id: 'mintable', label: 'Mintable', description: 'Owner can mint new tokens', icon: '🏭', default: true, gasImpact: 'low' },
  { id: 'burnable', label: 'Burnable', description: 'Holders can burn their tokens', icon: '🔥', default: true, gasImpact: 'low' },
  { id: 'capped', label: 'Capped Supply', description: 'Hard cap on total supply', icon: '🔒', default: false, gasImpact: 'low' },
  { id: 'permit', label: 'Permit (EIP-2612)', description: 'Gasless approvals via signatures', icon: '✍️', default: false, gasImpact: 'medium' },
  { id: 'votes', label: 'Governance Votes', description: 'Token voting with delegation (ERC20Votes)', icon: '🗳️', default: false, gasImpact: 'medium' },
  { id: 'pausable', label: 'Pausable', description: 'Owner can pause all transfers', icon: '⏸️', default: false, gasImpact: 'low' },
  { id: 'snapshot', label: 'Snapshot', description: 'Historical balance lookups', icon: '📸', default: false, gasImpact: 'medium' },
]

const NFT_FEATURES: FeatureOption[] = [
  { id: 'enumerable', label: 'Enumerable', description: 'On-chain enumeration of all tokens', icon: '📋', default: true, gasImpact: 'high' },
  { id: 'royalties', label: 'Royalties (ERC-2981)', description: 'Creator royalties on secondary sales', icon: '💰', default: true, gasImpact: 'low' },
  { id: 'reveal', label: 'Delayed Reveal', description: 'Hidden metadata until owner reveals', icon: '🔮', default: false, gasImpact: 'medium' },
  { id: 'autoincrement', label: 'Auto Increment', description: 'Sequential token IDs', icon: '🔢', default: true, gasImpact: 'low' },
  { id: 'mintprice', label: 'Mint Price', description: 'Public mint with configurable price', icon: '🏷️', default: false, gasImpact: 'low' },
  { id: 'maxsupply', label: 'Max Supply', description: 'Hard cap on total NFTs', icon: '🛑', default: true, gasImpact: 'low' },
  { id: 'whitelist', label: 'Whitelist / Merkle', description: 'Allowlist with Merkle proof', icon: '✅', default: false, gasImpact: 'medium' },
]

const DEX_FEATURES: FeatureOption[] = [
  { id: 'swap', label: 'Token Swap', description: 'AMM swap functionality', icon: '🔄', default: true, gasImpact: 'high' },
  { id: 'liquidity', label: 'Liquidity Pools', description: 'Add/remove liquidity', icon: '🏊', default: true, gasImpact: 'high' },
  { id: 'fees', label: 'Trading Fees', description: '0.3% fee to liquidity providers', icon: '💸', default: true, gasImpact: 'low' },
  { id: 'factory', label: 'Factory Pattern', description: 'Deploy new pair contracts', icon: '🏭', default: true, gasImpact: 'medium' },
  { id: 'flashloan', label: 'Flash Loans', description: 'Uncollateralized flash loans', icon: '⚡', default: false, gasImpact: 'medium' },
]

const STAKING_FEATURES: FeatureOption[] = [
  { id: 'rewards', label: 'Staking Rewards', description: 'Earn rewards for staking', icon: '📈', default: true, gasImpact: 'medium' },
  { id: 'lockperiod', label: 'Lock Period', description: 'Configurable lock duration', icon: '⏳', default: false, gasImpact: 'low' },
  { id: 'emergency', label: 'Emergency Withdraw', description: 'Withdraw anytime with penalty', icon: '🚨', default: false, gasImpact: 'low' },
  { id: 'compound', label: 'Auto Compound', description: 'Auto-restake rewards', icon: '♻️', default: false, gasImpact: 'medium' },
  { id: 'multitier', label: 'Multi-Tier', description: 'Different APY per tier', icon: '🏆', default: false, gasImpact: 'medium' },
]

const DAO_FEATURES: FeatureOption[] = [
  { id: 'governance', label: 'Governor', description: 'On-chain governance proposals', icon: '🏛️', default: true, gasImpact: 'high' },
  { id: 'timelock', label: 'Timelock', description: 'Execution delay for safety', icon: '⏰', default: true, gasImpact: 'medium' },
  { id: 'voting', label: 'Voting Power', description: 'Token-weighted voting', icon: '🗳️', default: true, gasImpact: 'medium' },
  { id: 'quorum', label: 'Quorum', description: 'Minimum votes required', icon: '📊', default: false, gasImpact: 'low' },
  { id: 'delegation', label: 'Delegation', description: 'Delegate voting power', icon: '🤝', default: true, gasImpact: 'low' },
]

const FEATURE_MAP: Record<ProjectType, FeatureOption[]> = {
  token: TOKEN_FEATURES,
  nft: NFT_FEATURES,
  dex: DEX_FEATURES,
  staking: STAKING_FEATURES,
  dao: DAO_FEATURES,
}

export function getFeatures(type: ProjectType): FeatureOption[] {
  return FEATURE_MAP[type] || TOKEN_FEATURES
}

export function getDefaultFeatures(type: ProjectType): string[] {
  return getFeatures(type).filter(f => f.default).map(f => f.id)
}

export function getGasMultiplier(features: FeatureOption[], selectedIds: string[]): string {
  const selected = features.filter(f => selectedIds.includes(f.id))
  const highCount = selected.filter(f => f.gasImpact === 'high').length
  const base = 500000
  const multiplier = 1 + (highCount * 0.5)
  return `~${Math.round(base * multiplier).toLocaleString()} gas`
}
